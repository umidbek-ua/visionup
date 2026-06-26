use tauri::State;

use crate::db::DbPool;
use crate::models::profile::Profile;
use crate::models::settings::SaveProfileSettingsPayload;

#[tauri::command]
pub async fn get_profiles(pool: State<'_, DbPool>) -> Result<Vec<Profile>, String> {
    sqlx::query_as::<_, Profile>(
        r#"
        SELECT id, name, is_active, created_at, updated_at, deleted_at
        FROM profiles
        WHERE deleted_at IS NULL
        ORDER BY created_at ASC
        "#,
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_profile(
    pool: State<'_, DbPool>,
    name: String,
) -> Result<Profile, String> {
    let trimmed_name = name.trim();

    if trimmed_name.is_empty() {
        return Err("Profile name cannot be empty".to_string());
    }

    sqlx::query_as::<_, Profile>(
        r#"
        INSERT INTO profiles (name)
        VALUES ($1)
        RETURNING id, name, is_active, created_at, updated_at, deleted_at
        "#,
    )
    .bind(trimmed_name)
    .fetch_one(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_profile_settings(
    pool: State<'_, DbPool>,
    payload: SaveProfileSettingsPayload,
) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let profile_update = sqlx::query(
        r#"
        UPDATE profiles
        SET updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        "#,
    )
    .bind(payload.profile_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    if profile_update.rows_affected() == 0 {
        return Err("Profile not found".to_string());
    }

    let zoom_type = map_zoom_type(&payload.zoom_settings.zoom_type)?;

    sqlx::query("DELETE FROM zoom_settings WHERE profile_id = $1")
        .bind(payload.profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query(
        r#"
        INSERT INTO zoom_settings (
            profile_id,
            zoom_type,
            max_zoom_percent,
            smooth_zoom_enabled,
            fast_zoom_enabled
        )
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(payload.profile_id)
    .bind(zoom_type)
    .bind(payload.zoom_settings.max_zoom_percent)
    .bind(payload.zoom_settings.smooth_zoom_enabled)
    .bind(payload.zoom_settings.fast_zoom_enabled)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    let background_mode = map_background_mode(&payload.reading_settings.background_mode)?;

    sqlx::query("DELETE FROM reading_settings WHERE profile_id = $1")
        .bind(payload.profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query(
        r#"
        INSERT INTO reading_settings (
            profile_id,
            is_enabled,
            text_size,
            line_height,
            letter_spacing,
            reading_width,
            background_mode
        )
        VALUES ($1, $2, $3, $4::numeric, $5::numeric, $6, $7)
        "#,
    )
    .bind(payload.profile_id)
    .bind(payload.reading_settings.is_enabled)
    .bind(payload.reading_settings.text_size)
    .bind(payload.reading_settings.line_height)
    .bind(payload.reading_settings.letter_spacing)
    .bind(payload.reading_settings.reading_width)
    .bind(background_mode)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM shortcut_settings WHERE profile_id = $1")
        .bind(payload.profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    for shortcut in payload.shortcut_settings {
        let shortcut_scope = map_shortcut_scope(&shortcut.shortcut_scope)?;

        sqlx::query(
            r#"
            INSERT INTO shortcut_settings (
                profile_id,
                shortcut_scope,
                action_key,
                default_shortcut,
                custom_shortcut,
                is_customizable
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(payload.profile_id)
        .bind(shortcut_scope)
        .bind(shortcut.action_key)
        .bind(shortcut.default_shortcut)
        .bind(shortcut.custom_shortcut)
        .bind(shortcut.is_customizable)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    sqlx::query("DELETE FROM app_settings")
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query(
        r#"
        INSERT INTO app_settings (
            accessibility_integration_enabled,
            start_on_login,
            default_ui_scale,
            high_contrast_ui,
            reduce_motion
        )
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(payload.app_settings.accessibility_integration_enabled)
    .bind(payload.app_settings.start_on_login)
    .bind(payload.app_settings.default_ui_scale)
    .bind(payload.app_settings.high_contrast_ui)
    .bind(payload.app_settings.reduce_motion)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_profile(
    pool: State<'_, DbPool>,
    profile_id: String,
) -> Result<(), String> {
    let trimmed_profile_id = profile_id.trim();

    if trimmed_profile_id.is_empty() {
        return Err("Profile id cannot be empty".to_string());
    }

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let profile_check = sqlx::query(
        r#"
        SELECT id
        FROM profiles
        WHERE id = $1::uuid
        "#,
    )
    .bind(trimmed_profile_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    if profile_check.is_none() {
        return Err("Profile not found".to_string());
    }

    sqlx::query("DELETE FROM zoom_settings WHERE profile_id = $1::uuid")
        .bind(trimmed_profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM reading_settings WHERE profile_id = $1::uuid")
        .bind(trimmed_profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM shortcut_settings WHERE profile_id = $1::uuid")
        .bind(trimmed_profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    let delete_result = sqlx::query(
        r#"
        DELETE FROM profiles
        WHERE id = $1::uuid
        "#,
    )
    .bind(trimmed_profile_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    if delete_result.rows_affected() == 0 {
        return Err("Profile was not deleted".to_string());
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

fn map_zoom_type(value: &str) -> Result<&'static str, String> {
    match value {
        "Full Screen" | "FULL_SCREEN" => Ok("FULL_SCREEN"),
        "Picture-in-Picture" | "PICTURE_IN_PICTURE" => Ok("PICTURE_IN_PICTURE"),
        "Zoom Window" | "ZOOM_WINDOW" => Ok("ZOOM_WINDOW"),
        _ => Err(format!("Invalid zoom type: {value}")),
    }
}

fn map_background_mode(value: &str) -> Result<&'static str, String> {
    match value {
        "dark" | "DARK" => Ok("DARK"),
        "sepia" | "SEPIA" => Ok("SEPIA"),
        "contrast" | "HIGH_CONTRAST" => Ok("HIGH_CONTRAST"),
        _ => Err(format!("Invalid background mode: {value}")),
    }
}

fn map_shortcut_scope(value: &str) -> Result<&'static str, String> {
    match value {
        "Zoom" | "ZOOM" => Ok("ZOOM"),
        "Profiles" | "PROFILE" | "PROFILES" => Ok("PROFILE"),
        "Reading" | "READING" => Ok("READING"),
        "Settings" | "SETTINGS" => Ok("SETTINGS"),
        "App" | "APP" => Ok("APP"),
        _ => Err(format!("Invalid shortcut scope: {value}")),
    }
}

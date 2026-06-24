use tauri::State;

use crate::db::DbPool;
use crate::models::profile::Profile;

#[tauri::command]
pub async fn get_profiles(pool: State<'_, DbPool>) -> Result<Vec<Profile>, String> {
    sqlx::query_as::<_, Profile>(
        r#"
        SELECT id, name, is_active, created_at, updated_at, deleted_at
        FROM profiles
        WHERE deleted_at IS NULL
        ORDER BY created_at ASC
        "#
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
        "#
    )
    .bind(trimmed_name)
    .fetch_one(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

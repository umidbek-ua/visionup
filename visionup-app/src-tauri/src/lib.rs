mod commands;
mod db;
mod models;

use commands::profile_commands::{
    create_profile, delete_profile, get_profiles, save_profile_settings,
};
use db::DbPool;
use tauri::State;

#[tauri::command]
async fn test_db_connection(pool: State<'_, DbPool>) -> Result<String, String> {
    let row: (i32,) = sqlx::query_as("SELECT 1")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(format!("Database connected. SELECT result: {}", row.0))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::async_runtime::block_on(async {
        let pool = db::connect_db()
            .await
            .expect("Failed to connect to database");

        tauri::Builder::default()
            .plugin(tauri_plugin_opener::init())
            .manage(pool)
            .invoke_handler(tauri::generate_handler![
                test_db_connection,
                get_profiles,
                create_profile,
                save_profile_settings,
                delete_profile
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}

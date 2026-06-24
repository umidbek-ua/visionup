use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

pub type DbPool = Pool<Postgres>;

pub async fn connect_db() -> Result<DbPool, sqlx::Error> {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in src-tauri/.env");

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
}

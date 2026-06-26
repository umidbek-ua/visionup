use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct SaveProfileSettingsPayload {
    pub profile_id: Uuid,
    pub zoom_settings: SaveZoomSettingsPayload,
    pub reading_settings: SaveReadingSettingsPayload,
    pub shortcut_settings: Vec<SaveShortcutSettingsPayload>,
    pub app_settings: SaveAppSettingsPayload,
}

#[derive(Debug, Deserialize)]
pub struct SaveZoomSettingsPayload {
    pub zoom_type: String,
    pub max_zoom_percent: i32,
    pub smooth_zoom_enabled: bool,
    pub fast_zoom_enabled: bool,
}

#[derive(Debug, Deserialize)]
pub struct SaveReadingSettingsPayload {
    pub is_enabled: bool,
    pub text_size: i32,
    pub line_height: f64,
    pub letter_spacing: f64,
    pub reading_width: i32,
    pub background_mode: String,
}

#[derive(Debug, Deserialize)]
pub struct SaveShortcutSettingsPayload {
    pub shortcut_scope: String,
    pub action_key: String,
    pub default_shortcut: String,
    pub custom_shortcut: Option<String>,
    pub is_customizable: bool,
}

#[derive(Debug, Deserialize)]
pub struct SaveAppSettingsPayload {
    pub accessibility_integration_enabled: bool,
    pub start_on_login: bool,
    pub default_ui_scale: i32,
    pub high_contrast_ui: bool,
    pub reduce_motion: bool,
}

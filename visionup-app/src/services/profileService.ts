import { invoke } from "@tauri-apps/api/core";
import { ProfileSettingsState } from "../types/app";

export type DbProfile = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function getProfiles(): Promise<DbProfile[]> {
  return await invoke<DbProfile[]>("get_profiles");
}

export async function createProfile(name: string): Promise<DbProfile> {
  return await invoke<DbProfile>("create_profile", { name });
}

export async function saveProfileSettings(
  profileId: string,
  settings: ProfileSettingsState
): Promise<void> {
  await invoke("save_profile_settings", {
    payload: {
      profile_id: profileId,
      zoom_settings: {
        zoom_type: settings.zoomSettings.zoomType,
        max_zoom_percent: settings.zoomSettings.maxZoom,
        smooth_zoom_enabled: settings.zoomSettings.smoothZoomEnabled,
        fast_zoom_enabled: settings.zoomSettings.fastZoomEnabled,
      },
      reading_settings: {
        is_enabled: settings.readingSettings.isEnabled,
        text_size: settings.readingSettings.textSize,
        line_height: settings.readingSettings.lineHeight,
        letter_spacing: settings.readingSettings.letterSpacing,
        reading_width: settings.readingSettings.readingWidth,
        background_mode: settings.readingSettings.backgroundMode,
      },
      shortcut_settings: settings.shortcutSettings.map((shortcut) => ({
        shortcut_scope: shortcut.group,
        action_key: shortcut.id,
        default_shortcut: shortcut.defaultShortcut,
        custom_shortcut: shortcut.customKey || null,
        is_customizable:
          shortcut.id !== "fast-zoom-levels" && shortcut.id !== "smooth-zoom",
      })),
      app_settings: {
        accessibility_integration_enabled:
          settings.appSettings.accessibilityIntegration,
        start_on_login: settings.appSettings.startOnLogin,
        default_ui_scale: settings.appSettings.defaultUiScale,
        high_contrast_ui: settings.appSettings.highContrastUi,
        reduce_motion: settings.appSettings.reduceMotion,
      },
    },
  });
}

export async function deleteProfile(profileId: string): Promise<void> {
  await invoke("delete_profile", { profileId });
}

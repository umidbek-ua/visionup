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


type DbProfileSettingsPayload = {
  profile_id: string;
  zoom_settings: {
    zoom_type: string;
    max_zoom_percent: number;
    smooth_zoom_enabled: boolean;
    fast_zoom_enabled: boolean;
  };
  reading_settings: {
    is_enabled: boolean;
    text_size: number;
    line_height: number;
    letter_spacing: number;
    reading_width: number;
    background_mode: string;
  };
  shortcut_settings: Array<{
    shortcut_scope: string;
    action_key: string;
    default_shortcut: string;
    custom_shortcut: string | null;
    is_customizable: boolean;
  }>;
  app_settings: {
    accessibility_integration_enabled: boolean;
    start_on_login: boolean;
    default_ui_scale: number;
    high_contrast_ui: boolean;
    reduce_motion: boolean;
  };
};

function mapDbProfileSettingsToState(
  payload: DbProfileSettingsPayload
): ProfileSettingsState {
  return {
    zoomSettings: {
      zoomType: payload.zoom_settings.zoom_type as ProfileSettingsState["zoomSettings"]["zoomType"],
      maxZoom: payload.zoom_settings.max_zoom_percent,
      smoothZoomEnabled: payload.zoom_settings.smooth_zoom_enabled,
      fastZoomEnabled: payload.zoom_settings.fast_zoom_enabled,
    },
    readingSettings: {
      isEnabled: payload.reading_settings.is_enabled,
      textSize: payload.reading_settings.text_size,
      lineHeight: payload.reading_settings.line_height,
      letterSpacing: payload.reading_settings.letter_spacing,
      readingWidth: payload.reading_settings.reading_width,
      backgroundMode: payload.reading_settings.background_mode as ProfileSettingsState["readingSettings"]["backgroundMode"],
    },
    shortcutSettings: payload.shortcut_settings.map((shortcut) => ({
      id: shortcut.action_key,
      group: shortcut.shortcut_scope as ProfileSettingsState["shortcutSettings"][number]["group"],
      action: shortcut.action_key,
      defaultShortcut: shortcut.default_shortcut,
      fixedKeys: shortcut.default_shortcut,
      customKey: shortcut.custom_shortcut ?? "",
    })),
    appSettings: {
      accessibilityIntegration:
        payload.app_settings.accessibility_integration_enabled,
      startOnLogin: payload.app_settings.start_on_login,
      defaultUiScale: payload.app_settings.default_ui_scale,
      highContrastUi: payload.app_settings.high_contrast_ui,
      reduceMotion: payload.app_settings.reduce_motion,
    },
  };
}

export async function getProfiles(): Promise<DbProfile[]> {
  return await invoke<DbProfile[]>("get_profiles");
}

export async function createProfile(name: string): Promise<DbProfile> {
  return await invoke<DbProfile>("create_profile", { name });
}

export async function getProfileSettings(
  profileId: string
): Promise<ProfileSettingsState> {
  const payload = await invoke<DbProfileSettingsPayload>("get_profile_settings", {
    profileId,
  });

  return mapDbProfileSettingsToState(payload);
}

export async function createProfileWithSettings(
  name: string,
  settings: ProfileSettingsState
): Promise<DbProfile> {
  const profile = await createProfile(name);
  await saveProfileSettings(profile.id, settings);

  return profile;
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

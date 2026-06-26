export type Section =
  | "profiles"
  | "zoom"
  | "shortcuts"
  | "reading"
  | "settings";

export type ZoomMode = "fast" | "smooth";

export interface MenuItem {
  id: Section;
  label: string;
  description: string;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  shortcutKey: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string;
}

export type ZoomType = "Full Screen" | "Picture-in-Picture" | "Zoom Window";

export interface ZoomSettingsState {
  zoomType: ZoomType;
  maxZoom: number;
  smoothZoomEnabled: boolean;
  fastZoomEnabled: boolean;
}

export type BackgroundMode = "dark" | "sepia" | "contrast";

export interface ReadingSettingsState {
  isEnabled: boolean;
  textSize: number;
  lineHeight: number;
  letterSpacing: number;
  readingWidth: number;
  backgroundMode: BackgroundMode;
}

export type ShortcutGroup = "Zoom" | "Profiles" | "Settings";

export interface ShortcutItem {
  id: string;
  group: ShortcutGroup;
  action: string;
  defaultShortcut: string;
  fixedKeys: string;
  customKey: string;
}

export interface AppSettingsState {
  accessibilityIntegration: boolean;
  startOnLogin: boolean;
  defaultUiScale: number;
  highContrastUi: boolean;
  reduceMotion: boolean;
}

export interface ProfileSettingsState {
  zoomSettings: ZoomSettingsState;
  readingSettings: ReadingSettingsState;
  shortcutSettings: ShortcutItem[];
  appSettings: AppSettingsState;
}

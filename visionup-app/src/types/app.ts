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
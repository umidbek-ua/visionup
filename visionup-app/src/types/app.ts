export type Section =
  | "zoom"
  | "profiles"
  | "shortcuts"
  | "reading"
  | "settings";

export type ZoomMode = "fast" | "smooth";

export interface MenuItem {
  id: Section;
  label: string;
  description: string;
}
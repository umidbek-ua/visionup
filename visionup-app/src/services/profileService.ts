import { invoke } from "@tauri-apps/api/core";

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
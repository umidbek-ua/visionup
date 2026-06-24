import { useEffect, useMemo, useRef, useState } from "react";
import {
  createProfile as createDbProfile,
  getProfiles,
  type DbProfile,
} from "../services/profileService";
import { Profile, Section } from "../types/app";

import ZoomPage from "./ZoomPage";
import ShortcutsPage from "./ShortcutsPage";
import ReadingPage from "./ReadingPage";
import SettingsPage from "./SettingsPage";

interface ProfilesPageProps {
  activeSection: Section;
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  selectedProfileId: string;
  setSelectedProfileId: React.Dispatch<React.SetStateAction<string>>;
  activeProfileId: string;
  setActiveProfileId: React.Dispatch<React.SetStateAction<string>>;
}

const MAX_PROFILE_COUNT = 9;
const MAX_PROFILE_NAME_LENGTH = 15;

function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function sanitizeProfileName(value: string) {
  return value.replace(/[^\p{L}\p{N}]/gu, "").slice(0, MAX_PROFILE_NAME_LENGTH);
}

function getProfileOrder(profile: Profile) {
  const order = Number(profile.shortcutKey);
  return Number.isFinite(order) && order > 0 ? order : 999;
}

function normalizeProfileOrder(profiles: Profile[]) {
  return [...profiles]
    .slice(0, MAX_PROFILE_COUNT)
    .sort((a, b) => getProfileOrder(a) - getProfileOrder(b))
    .map((profile, index) => ({
      ...profile,
      name: sanitizeProfileName(profile.name) || `Profile${index + 1}`,
      shortcutKey: String(index + 1),
    }));
}

function getProfileShortcut(profile: Profile) {
  const order = getProfileOrder(profile);

  if (order >= 1 && order <= MAX_PROFILE_COUNT) {
    return `Ctrl + Cmd + ${order}`;
  }

  return "No shortcut";
}

function mapDbProfile(profile: DbProfile, index: number): Profile {
  return {
    id: profile.id,
    name: sanitizeProfileName(profile.name) || `Profile${index + 1}`,
    description: "",
    shortcutKey: String(index + 1),
    createdAt: profile.created_at,
    modifiedAt: profile.updated_at,
    deletedAt: profile.deleted_at ?? "",
  };
}

function ProfilesPage({
  activeSection,
  profiles,
  setProfiles,
  selectedProfileId,
  setSelectedProfileId,
  activeProfileId: _activeProfileId,
  setActiveProfileId,
}: ProfilesPageProps) {
  const [newProfileName, setNewProfileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggingProfileId, setDraggingProfileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const orderedProfiles = useMemo(() => normalizeProfileOrder(profiles), [profiles]);
  const selectedProfile = orderedProfiles.find(
    (profile) => profile.id === selectedProfileId
  );
  const canCreateProfile = orderedProfiles.length < MAX_PROFILE_COUNT;

  useEffect(() => {
    async function loadProfilesFromDb() {
      try {
        const dbProfiles = await getProfiles();
        const mappedProfiles = normalizeProfileOrder(dbProfiles.map(mapDbProfile));
        const activeProfile = dbProfiles.find((profile) => profile.is_active);
        const firstProfile = mappedProfiles[0];
        const nextSelectedProfileId = activeProfile?.id ?? firstProfile?.id ?? "";

        setProfiles(mappedProfiles);
        setSelectedProfileId(nextSelectedProfileId);
        setActiveProfileId(nextSelectedProfileId);
      } catch (error) {
        console.error("Failed to load profiles from DB:", error);
      }
    }

    loadProfilesFromDb();
  }, [setProfiles, setSelectedProfileId, setActiveProfileId]);

  const selectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    setActiveProfileId(profileId);
  };

  const createProfile = async () => {
    const name = sanitizeProfileName(newProfileName);

    if (!name || !canCreateProfile) return;

    try {
      const dbProfile = await createDbProfile(name);
      const profile = mapDbProfile(dbProfile, profiles.length);

      setProfiles((current) =>
        normalizeProfileOrder([
          ...current,
          {
            ...profile,
            name,
            shortcutKey: String(current.length + 1),
          },
        ])
      );
      selectProfile(profile.id);
      setNewProfileName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  const saveProfile = () => {
    if (!selectedProfile) return;

    setProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedProfile.id
          ? { ...profile, modifiedAt: getNow() }
          : profile
      )
    );
  };

  const deleteProfile = () => {
    if (!selectedProfile) return;

    const rest = normalizeProfileOrder(
      profiles.filter((profile) => profile.id !== selectedProfile.id)
    );
    const next = rest[0];

    setProfiles(rest);
    selectProfile(next?.id ?? "");
  };

  const startEditProfileName = (profile: Profile) => {
    setEditingProfileId(profile.id);
    setEditingName(profile.name);
  };

  const finishEditProfileName = () => {
    const name = sanitizeProfileName(editingName);

    if (!editingProfileId || !name) {
      setEditingProfileId(null);
      setEditingName("");
      return;
    }

    setProfiles((current) =>
      current.map((profile) =>
        profile.id === editingProfileId
          ? { ...profile, name, modifiedAt: getNow() }
          : profile
      )
    );

    setEditingProfileId(null);
    setEditingName("");
  };

  const reorderProfilesByDrag = (sourceProfileId: string, targetProfileId: string) => {
    if (sourceProfileId === targetProfileId) return;

    setProfiles((current) => {
      const ordered = normalizeProfileOrder(current);
      const sourceIndex = ordered.findIndex((profile) => profile.id === sourceProfileId);
      const targetIndex = ordered.findIndex((profile) => profile.id === targetProfileId);

      if (sourceIndex === -1 || targetIndex === -1) return current;

      const nextOrdered = [...ordered];
      const [movingProfile] = nextOrdered.splice(sourceIndex, 1);
      nextOrdered.splice(targetIndex, 0, movingProfile);

      return nextOrdered.map((profile, index) => ({
        ...profile,
        shortcutKey: String(index + 1),
        modifiedAt: getNow(),
      }));
    });
  };

  const exportProfiles = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            selectedProfileId,
            profiles: orderedProfiles,
          },
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "visionup-profiles.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const importProfiles = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        const importedProfiles = Array.isArray(imported)
          ? imported
          : imported?.profiles;

        if (!Array.isArray(importedProfiles)) return;

        const normalizedProfiles = normalizeProfileOrder(importedProfiles as Profile[]);
        const importedSelectedProfileId =
          typeof imported?.selectedProfileId === "string"
            ? imported.selectedProfileId
            : normalizedProfiles[0]?.id ?? "";
        const nextSelectedProfileId =
          normalizedProfiles.find((profile) => profile.id === importedSelectedProfileId)
            ?.id ??
          normalizedProfiles[0]?.id ??
          "";

        setProfiles(normalizedProfiles);
        selectProfile(nextSelectedProfileId);
      } catch {
        console.error("Invalid profiles JSON");
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className="profile-tabs">
        <button
          className="profile-add-tab"
          disabled={!canCreateProfile}
          title={
            canCreateProfile
              ? "Create profile"
              : `Maximum ${MAX_PROFILE_COUNT} profiles allowed`
          }
          onClick={() => canCreateProfile && setIsCreating(true)}
        >
          +
        </button>

        {isCreating && canCreateProfile && (
          <input
            className="profile-tab-input"
            autoFocus
            maxLength={MAX_PROFILE_NAME_LENGTH}
            value={newProfileName}
            onChange={(event) =>
              setNewProfileName(sanitizeProfileName(event.target.value))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") createProfile();
              if (event.key === "Escape") {
                setIsCreating(false);
                setNewProfileName("");
              }
            }}
            placeholder="ProfileName"
          />
        )}

        {orderedProfiles.map((profile) => {
          const isSelected = selectedProfileId === profile.id;
          const isEditing = editingProfileId === profile.id;
          const isDragging = draggingProfileId === profile.id;

          return isEditing ? (
            <input
              key={profile.id}
              className="profile-tab-input"
              autoFocus
              maxLength={MAX_PROFILE_NAME_LENGTH}
              value={editingName}
              onChange={(event) =>
                setEditingName(sanitizeProfileName(event.target.value))
              }
              onBlur={finishEditProfileName}
              onKeyDown={(event) => {
                if (event.key === "Enter") finishEditProfileName();
                if (event.key === "Escape") {
                  setEditingProfileId(null);
                  setEditingName("");
                }
              }}
            />
          ) : (
            <button
              key={profile.id}
              className={`profile-tab ${isSelected ? "selected" : ""} ${
                isDragging ? "dragging" : ""
              }`}
              draggable
              onClick={() => selectProfile(profile.id)}
              onDoubleClick={() => startEditProfileName(profile)}
              onDragStart={(event) => {
                setDraggingProfileId(profile.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", profile.id);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const sourceProfileId = event.dataTransfer.getData("text/plain");
                reorderProfilesByDrag(sourceProfileId, profile.id);
                setDraggingProfileId(null);
              }}
              onDragEnd={() => setDraggingProfileId(null)}
            >
              <span className="profile-order-badge">{profile.shortcutKey}</span>
              <strong>{profile.name}</strong>
            </button>
          );
        })}
      </div>

      {profiles.length === 0 ? (
        <div className="empty-profiles">
          <h3>No profiles yet</h3>
          <p>
            Press + and type a profile name to create your first VisionUp profile.
            Profile names can contain only letters and numbers, up to {MAX_PROFILE_NAME_LENGTH} characters.
          </p>
        </div>
      ) : (
        <>
          <div className="profile-action-bar">
            <div className="profile-context-row">
              <h3>Shortcut:</h3>
              <div className="selected-profile-bookmark">
                <h3>⌘ + Ctrl + (1-9)</h3>
              </div>
              <h3>- switch to profile. Max profiles count = 9</h3>
            </div>

            <div className="profiles-header-actions">
              <button className="secondary-button" onClick={saveProfile}>
                Save
              </button>

              <button className="danger-button" onClick={deleteProfile}>
                Delete
              </button>

              <button
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Import
              </button>

              <button className="secondary-button" onClick={exportProfiles}>
                Export
              </button>

              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) importProfiles(file);
                }}
              />
            </div>
          </div>

          <div className="profile-model-content">
            {activeSection === "zoom" && <ZoomPage />}
            {activeSection === "shortcuts" && <ShortcutsPage />}
            {activeSection === "reading" && <ReadingPage />}
            {activeSection === "settings" && <SettingsPage />}
          </div>
        </>
      )}
    </>
  );
}

export default ProfilesPage;

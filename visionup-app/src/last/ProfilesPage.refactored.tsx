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

function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function getProfileOrder(profile: Profile) {
  const order = Number(profile.shortcutKey);
  return Number.isFinite(order) && order > 0 ? order : 999;
}

function normalizeProfileOrder(profiles: Profile[]) {
  return [...profiles]
    .sort((a, b) => getProfileOrder(a) - getProfileOrder(b))
    .map((profile, index) => ({
      ...profile,
      shortcutKey: String(index + 1),
    }));
}

function getProfileShortcut(profile: Profile) {
  const order = getProfileOrder(profile);

  if (order >= 1 && order <= 9) {
    return `Ctrl + Cmd + ${order}`;
  }

  return "No shortcut";
}

function mapDbProfile(profile: DbProfile, index: number): Profile {
  return {
    id: profile.id,
    name: profile.name,
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
  activeProfileId,
  setActiveProfileId,
}: ProfilesPageProps) {
  const [newProfileName, setNewProfileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const orderedProfiles = useMemo(() => normalizeProfileOrder(profiles), [profiles]);
  const selectedProfileIndex = orderedProfiles.findIndex(
    (profile) => profile.id === selectedProfileId
  );
  
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);
  const isSelectedProfileCurrent = selectedProfileId === activeProfileId;

  useEffect(() => {
    async function loadProfilesFromDb() {
      try {
        const dbProfiles = await getProfiles();
        const mappedProfiles = normalizeProfileOrder(dbProfiles.map(mapDbProfile));

        setProfiles(mappedProfiles);

        const activeProfile = dbProfiles.find((profile) => profile.is_active);
        const firstProfile = mappedProfiles[0];

        if (activeProfile) {
          setSelectedProfileId(activeProfile.id);
          setActiveProfileId(activeProfile.id);
        } else if (firstProfile) {
          setSelectedProfileId(firstProfile.id);
          setActiveProfileId(firstProfile.id);
        } else {
          setSelectedProfileId("");
          setActiveProfileId("");
        }
      } catch (error) {
        console.error("Failed to load profiles from DB:", error);
      }
    }

    loadProfilesFromDb();
  }, [setProfiles, setSelectedProfileId, setActiveProfileId]);

  const createProfile = async () => {
    const name = newProfileName.trim();
    if (!name) return;

    try {
      const dbProfile = await createDbProfile(name);
      const profile = mapDbProfile(dbProfile, profiles.length);

      setProfiles((current) =>
        normalizeProfileOrder([
          ...current,
          {
            ...profile,
            shortcutKey: String(current.length + 1),
          },
        ])
      );
      setSelectedProfileId(profile.id);
      setActiveProfileId(profile.id);
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
    setSelectedProfileId(next?.id ?? "");
    setActiveProfileId((current) =>
      current === selectedProfile.id ? next?.id ?? "" : current
    );
  };

  const setCurrentProfile = () => {
    if (!selectedProfile) return;
    setActiveProfileId(selectedProfile.id);
  };

  const moveSelectedProfile = (direction: "up" | "down") => {
    if (!selectedProfile) return;

    setProfiles((current) => {
      const ordered = normalizeProfileOrder(current);
      const currentIndex = ordered.findIndex(
        (profile) => profile.id === selectedProfile.id
      );

      if (currentIndex === -1) return current;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= ordered.length) {
        return current;
      }

      const nextOrdered = [...ordered];
      const movingProfile = nextOrdered[currentIndex];

      nextOrdered[currentIndex] = nextOrdered[targetIndex];
      nextOrdered[targetIndex] = movingProfile;

      return nextOrdered.map((profile, index) => ({
        ...profile,
        shortcutKey: String(index + 1),
        modifiedAt: getNow(),
      }));
    });
  };

  const startEditProfileName = (profile: Profile) => {
    setEditingProfileId(profile.id);
    setEditingName(profile.name);
  };

  const finishEditProfileName = () => {
    const name = editingName.trim();

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

  const exportProfiles = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            currentProfileId: activeProfileId,
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
        const importedCurrentProfileId =
          typeof imported?.currentProfileId === "string"
            ? imported.currentProfileId
            : normalizedProfiles[0]?.id ?? "";

        setProfiles(normalizedProfiles);
        setSelectedProfileId(importedCurrentProfileId || normalizedProfiles[0]?.id || "");
        setActiveProfileId(importedCurrentProfileId || normalizedProfiles[0]?.id || "");
      } catch {
        console.error("Invalid profiles JSON");
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className="profile-tabs">
        <button className="profile-add-tab" onClick={() => setIsCreating(true)}>
          +
        </button>

        {isCreating && (
          <input
            className="profile-tab-input"
            autoFocus
            value={newProfileName}
            onChange={(event) => setNewProfileName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") createProfile();
              if (event.key === "Escape") setIsCreating(false);
            }}
            placeholder="Profile name"
          />
        )}

        {orderedProfiles.map((profile) => {
          const isSelected = selectedProfileId === profile.id;
          const isCurrent = activeProfileId === profile.id;
          const isEditing = editingProfileId === profile.id;

          return isEditing ? (
            <input
              key={profile.id}
              className="profile-tab-input"
              autoFocus
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
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
              className={`profile-tab ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedProfileId(profile.id)}
              onDoubleClick={() => startEditProfileName(profile)}
            >
              <span className="profile-order-badge">{profile.shortcutKey}</span>
              <strong>{profile.name}</strong>
              <span className="profile-shortcut-badge">
                {getProfileShortcut(profile)}
              </span>
              {isCurrent && <span className="profile-current-badge">Current</span>}
            </button>
          );
        })}
      </div>

      {profiles.length === 0 ? (
        <div className="empty-profiles">
          <h3>No profiles yet</h3>
          <p>Press + and type a profile name to create your first VisionUp profile.</p>
        </div>
      ) : (
        <>
          <div className="profile-action-bar">
            <div className="active-section-chip">{activeSection}</div>

            <div className="selected-profile-info">
              <span>Selected profile</span>
              <strong>{selectedProfile?.name ?? "No profile selected"}</strong>
              {selectedProfile && (
                <em>{getProfileShortcut(selectedProfile)}</em>
              )}
            </div>

            <div className="profiles-header-actions">
              <button
                className={`secondary-button ${
                  isSelectedProfileCurrent ? "active-action" : ""
                }`}
                onClick={setCurrentProfile}
                disabled={!selectedProfile || isSelectedProfileCurrent}
              >
                {isSelectedProfileCurrent ? "Current" : "Set Current"}
              </button>

              <button
                className="secondary-button"
                onClick={() => moveSelectedProfile("up")}
                disabled={selectedProfileIndex <= 0}
              >
                Move Up
              </button>

              <button
                className="secondary-button"
                onClick={() => moveSelectedProfile("down")}
                disabled={
                  selectedProfileIndex === -1 ||
                  selectedProfileIndex >= orderedProfiles.length - 1
                }
              >
                Move Down
              </button>

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

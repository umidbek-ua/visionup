import { useEffect, useRef, useState } from "react";
import { getProfiles, type DbProfile } from "../services/profileService";
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

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);
  const isSelectedProfileActive = selectedProfileId === activeProfileId;

  useEffect(() => {
    async function loadProfilesFromDb() {
      try {
        const dbProfiles = await getProfiles();
        const mappedProfiles = dbProfiles.map(mapDbProfile);

        setProfiles(mappedProfiles);

        const activeProfile = dbProfiles.find((profile) => profile.is_active);
        const firstProfile = dbProfiles[0];

        if (activeProfile) {
          setSelectedProfileId(activeProfile.id);
          setActiveProfileId(activeProfile.id);
        } else if (firstProfile) {
          setSelectedProfileId(firstProfile.id);
        }
      } catch (error) {
        console.error("Failed to load profiles from DB:", error);
      }
    }

    loadProfilesFromDb();
  }, []);

  const createProfile = () => {
    const name = newProfileName.trim();
    if (!name) return;

    const now = getNow();
    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const profile: Profile = {
      id,
      name,
      description: "",
      shortcutKey: String(profiles.length + 1),
      createdAt: now,
      modifiedAt: now,
      deletedAt: "-",
    };

    setProfiles((current) => [...current, profile]);
    setSelectedProfileId(id);
    setActiveProfileId(id);
    setNewProfileName("");
    setIsCreating(false);
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

    const rest = profiles.filter((profile) => profile.id !== selectedProfile.id);
    const next = rest[0];

    setProfiles(rest);
    setSelectedProfileId(next?.id ?? "");
    setActiveProfileId((current) =>
      current === selectedProfile.id ? next?.id ?? "" : current
    );
  };

  const toggleActiveProfile = () => {
    if (!selectedProfile) return;

    if (activeProfileId === selectedProfile.id) {
      setActiveProfileId("");
      return;
    }

    setActiveProfileId(selectedProfile.id);
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
    const blob = new Blob([JSON.stringify(profiles, null, 2)], {
      type: "application/json",
    });

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
        const imported = JSON.parse(String(reader.result)) as Profile[];
        if (!Array.isArray(imported)) return;

        setProfiles(imported);
        setSelectedProfileId(imported[0]?.id ?? "");
        setActiveProfileId(imported[0]?.id ?? "");
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

        {profiles.map((profile) => {
          const isSelected = selectedProfileId === profile.id;
          const isActive = activeProfileId === profile.id;
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
              {profile.name}
              {isActive && <span>Active</span>}
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
            <div className="active-section-chip">
              {activeSection}
            </div>

            <div className="profiles-header-actions">
              <button
                className={`secondary-button ${isSelectedProfileActive ? "active-action" : ""}`}
                onClick={toggleActiveProfile}
              >
                {isSelectedProfileActive ? "Active" : "Inactive"}
              </button>

              <button className="secondary-button" onClick={saveProfile}>
                Save
              </button>

              <button className="danger-button" onClick={deleteProfile}>
                Delete
              </button>

              <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>
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
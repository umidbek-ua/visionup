import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createProfile as createDbProfile,
  createProfileWithSettings,
  deleteProfile as deleteDbProfile,
  getProfileSettings,
  getProfiles,
  saveProfileSettings,
  saveZoomSettings,
  type DbProfile,
} from "../services/profileService";
import { Profile, ProfileSettingsState, Section, ZoomSettingsState } from "../types/app";
import {
  createProfileExportJson,
  downloadTextFile,
  parseImportedProfileJson,
  readFileAsText,
  toProfileExportFileName,
} from "../utils/profileJson";

import ZoomPage from "./ZoomPage";
import ShortcutsPage from "./ShortcutsPage";
import ReadingPage from "./ReadingPage";
import SettingsPage from "./SettingsPage";

interface ProfilesPageProps {
  activeSection: Section;
  profiles: Profile[];
  setProfiles: Dispatch<SetStateAction<Profile[]>>;
  selectedProfileId: string;
  setSelectedProfileId: Dispatch<SetStateAction<string>>;
  activeProfileId: string;
  setActiveProfileId: Dispatch<SetStateAction<string>>;
  profileSettings: ProfileSettingsState;
  setProfileSettings: Dispatch<SetStateAction<ProfileSettingsState>>;
}

const MAX_PROFILE_COUNT = 9;
const MAX_PROFILE_NAME_LENGTH = 15;
const ZOOM_SETTINGS_SAVE_DEBOUNCE_MS = 7000;

type ToastType = "success" | "error" | "warning" | "info";

type ToastState = {
  type: ToastType;
  title: string;
  message?: string;
} | null;

type ActionFeedbackState = {
  type: ToastType;
  title: string;
  message?: string;
  isBusy?: boolean;
} | null;

type PendingZoomSettingsSave = {
  profileId: string;
  settings: ZoomSettingsState;
  serializedSettings: string;
};

function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function sanitizeProfileName(value: string) {
  return value.replace(/[^\p{L}\p{N}]/gu, "").slice(0, MAX_PROFILE_NAME_LENGTH);
}


function buildImportedProfileName(baseName: string, existingProfiles: Profile[]) {
  const fallbackName = "Imported";
  const sanitizedBaseName = sanitizeProfileName(baseName) || fallbackName;
  const existingNames = new Set(
    existingProfiles.map((profile) => profile.name.toLowerCase())
  );

  if (!existingNames.has(sanitizedBaseName.toLowerCase())) {
    return sanitizedBaseName;
  }

  for (let index = 2; index <= MAX_PROFILE_COUNT; index += 1) {
    const suffix = String(index);
    const maxBaseLength = MAX_PROFILE_NAME_LENGTH - suffix.length;
    const candidate = `${sanitizedBaseName.slice(0, maxBaseLength)}${suffix}`;

    if (!existingNames.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `${fallbackName}${Date.now().toString().slice(-4)}`.slice(
    0,
    MAX_PROFILE_NAME_LENGTH
  );
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
  profileSettings,
  setProfileSettings,
}: ProfilesPageProps) {
  const [newProfileName, setNewProfileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggingProfileId, setDraggingProfileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isZoomAutosaveReady, setIsZoomAutosaveReady] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedbackState>(null);
  const [pendingDeleteProfile, setPendingDeleteProfile] = useState<Profile | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const actionFeedbackTimerRef = useRef<number | null>(null);
  const settingsRequestIdRef = useRef(0);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const zoomSettingsSaveTimerRef = useRef<number | null>(null);
  const selectedProfileIdRef = useRef(selectedProfileId);
  const lastPersistedZoomSettingsRef = useRef("");
  const zoomSettingsSaveInFlightRef = useRef(false);
  const queuedZoomSettingsSaveRef = useRef<PendingZoomSettingsSave | null>(null);

  const orderedProfiles = useMemo(() => normalizeProfileOrder(profiles), [profiles]);
  const selectedProfile = orderedProfiles.find(
    (profile) => profile.id === selectedProfileId
  );
  const canCreateProfile = orderedProfiles.length < MAX_PROFILE_COUNT;

  useEffect(() => {
    selectedProfileIdRef.current = selectedProfileId;
  }, [selectedProfileId]);

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration = 3600
  ) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ type, title, message });

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, duration);
  };

  const showActionFeedback = (
    type: ToastType,
    title: string,
    message?: string,
    options?: { isBusy?: boolean; duration?: number }
  ) => {
    if (actionFeedbackTimerRef.current) {
      window.clearTimeout(actionFeedbackTimerRef.current);
      actionFeedbackTimerRef.current = null;
    }

    setActionFeedback({
      type,
      title,
      message,
      isBusy: options?.isBusy ?? false,
    });

    const duration = options?.duration ?? (options?.isBusy ? 0 : 4200);

    if (duration > 0) {
      actionFeedbackTimerRef.current = window.setTimeout(() => {
        setActionFeedback(null);
        actionFeedbackTimerRef.current = null;
      }, duration);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      if (actionFeedbackTimerRef.current) {
        window.clearTimeout(actionFeedbackTimerRef.current);
      }

      if (zoomSettingsSaveTimerRef.current) {
        window.clearTimeout(zoomSettingsSaveTimerRef.current);
      }
    };
  }, []);

  const runZoomSettingsSave = useCallback(
    async (saveRequest: PendingZoomSettingsSave) => {
      if (zoomSettingsSaveInFlightRef.current) {
        queuedZoomSettingsSaveRef.current = saveRequest;
        return;
      }

      zoomSettingsSaveInFlightRef.current = true;

      try {
        await saveZoomSettings(saveRequest.profileId, saveRequest.settings);

        if (selectedProfileIdRef.current === saveRequest.profileId) {
          lastPersistedZoomSettingsRef.current = saveRequest.serializedSettings;
          setProfiles((current) =>
            current.map((profile) =>
              profile.id === saveRequest.profileId
                ? { ...profile, modifiedAt: getNow() }
                : profile
            )
          );
        }
      } catch (error) {
        console.error("Failed to autosave zoom settings:", error);
        const message = error instanceof Error ? error.message : String(error);
        showToast("error", "Zoom autosave failed", message || "Failed to save zoom settings.");
      } finally {
        zoomSettingsSaveInFlightRef.current = false;

        const queuedSaveRequest = queuedZoomSettingsSaveRef.current;
        queuedZoomSettingsSaveRef.current = null;

        if (
          queuedSaveRequest &&
          queuedSaveRequest.serializedSettings !== lastPersistedZoomSettingsRef.current
        ) {
          void runZoomSettingsSave(queuedSaveRequest);
        }
      }
    },
    [setProfiles]
  );

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
        showToast("error", "Failed to load profiles", "Please restart VisionUp or check the database connection.");
      }
    }

    loadProfilesFromDb();
  }, [setProfiles, setSelectedProfileId, setActiveProfileId]);

  useEffect(() => {
    if (!selectedProfileId) return;

    const requestId = settingsRequestIdRef.current + 1;
    settingsRequestIdRef.current = requestId;
    setIsZoomAutosaveReady(false);

    async function loadSelectedProfileSettings() {
      setIsLoadingSettings(true);

      try {
        const settings = await getProfileSettings(selectedProfileId);

        if (settingsRequestIdRef.current === requestId) {
          lastPersistedZoomSettingsRef.current = JSON.stringify(settings.zoomSettings);
          setProfileSettings(settings);
          setIsZoomAutosaveReady(true);
        }
      } catch (error) {
        console.error("Failed to load selected profile settings:", error);

        if (settingsRequestIdRef.current === requestId) {
          showToast(
            "error",
            "Failed to load profile settings",
            "Current settings are kept."
          );
        }
      } finally {
        if (settingsRequestIdRef.current === requestId) {
          setIsLoadingSettings(false);
        }
      }
    }

    void loadSelectedProfileSettings();
  }, [selectedProfileId, setProfileSettings]);

  useEffect(() => {
    if (!selectedProfileId || isLoadingSettings || !isZoomAutosaveReady) return;

    const serializedSettings = JSON.stringify(profileSettings.zoomSettings);

    if (serializedSettings === lastPersistedZoomSettingsRef.current) return;

    if (zoomSettingsSaveTimerRef.current) {
      window.clearTimeout(zoomSettingsSaveTimerRef.current);
    }

    zoomSettingsSaveTimerRef.current = window.setTimeout(() => {
      zoomSettingsSaveTimerRef.current = null;
      void runZoomSettingsSave({
        profileId: selectedProfileId,
        settings: profileSettings.zoomSettings,
        serializedSettings,
      });
    }, ZOOM_SETTINGS_SAVE_DEBOUNCE_MS);

    return () => {
      if (zoomSettingsSaveTimerRef.current) {
        window.clearTimeout(zoomSettingsSaveTimerRef.current);
        zoomSettingsSaveTimerRef.current = null;
      }
    };
  }, [
    isLoadingSettings,
    isZoomAutosaveReady,
    profileSettings.zoomSettings,
    runZoomSettingsSave,
    selectedProfileId,
  ]);

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
      showToast("success", "Profile created", `${name} is ready to use.`);
    } catch (error) {
      console.error("Failed to create profile:", error);
      showToast("error", "Failed to create profile", "Please try again.");
    }
  };

  const saveProfile = async () => {
    if (!selectedProfile || isSaving) return;

    if (zoomSettingsSaveTimerRef.current) {
      window.clearTimeout(zoomSettingsSaveTimerRef.current);
      zoomSettingsSaveTimerRef.current = null;
    }

    setIsSaving(true);
    showActionFeedback(
      "info",
      "Saving profile...",
      `${selectedProfile.name} settings are being saved.`,
      { isBusy: true }
    );

    try {
      await saveProfileSettings(selectedProfile.id, profileSettings);
      lastPersistedZoomSettingsRef.current = JSON.stringify(profileSettings.zoomSettings);

      setProfiles((current) =>
        current.map((profile) =>
          profile.id === selectedProfile.id
            ? { ...profile, modifiedAt: getNow() }
            : profile
        )
      );

      showActionFeedback(
        "success",
        "Profile saved!",
        `${selectedProfile.name} settings were saved successfully.`
      );
    } catch (error) {
      console.error("Failed to save profile settings:", error);
      const message = error instanceof Error ? error.message : String(error);
      showActionFeedback("error", "Saving failed!", message || "Failed to save profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteProfile = () => {
    if (!selectedProfile) {
      showActionFeedback("warning", "No profile selected", "Select a profile before deleting.");
      return;
    }

    setPendingDeleteProfile(selectedProfile);
  };

  const deleteProfile = async () => {
    if (isDeleting || !pendingDeleteProfile) return;

    const profileToDelete = pendingDeleteProfile;

    setIsDeleting(true);

    try {
      await deleteDbProfile(profileToDelete.id);

      const dbProfiles = await getProfiles();
      const mappedProfiles = normalizeProfileOrder(dbProfiles.map(mapDbProfile));
      const nextSelectedProfileId = mappedProfiles[0]?.id ?? "";

      setProfiles(mappedProfiles);
      selectProfile(nextSelectedProfileId);
      setPendingDeleteProfile(null);
      showActionFeedback(
        "success",
        "Profile deleted!",
        `${profileToDelete.name} and its settings were deleted successfully.`
      );
    } catch (error) {
      console.error("Failed to delete profile:", error);
      const message = error instanceof Error ? error.message : String(error);
      showActionFeedback("error", "Delete failed!", message || "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
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

  const exportProfiles = async () => {
    if (!selectedProfile) {
      showActionFeedback("warning", "No profile selected", "Select a profile before exporting.");
      return;
    }

    showActionFeedback(
      "info",
      "Preparing export...",
      `${selectedProfile.name} profile is being converted to JSON.`,
      { isBusy: true }
    );

    try {
      const settings = await getProfileSettings(selectedProfile.id);
      const json = createProfileExportJson(selectedProfile.name, settings);
      const fileName = toProfileExportFileName(selectedProfile.name);

      downloadTextFile(fileName, json);
      showActionFeedback(
        "success",
        "Profile exported!",
        `${fileName} was created successfully.`
      );
    } catch (error) {
      console.error("Failed to export profile:", error);
      const message = error instanceof Error ? error.message : String(error);
      showActionFeedback("error", "Export failed!", message || "Failed to export profile.");
    }
  };

  const importProfiles = () => {
    if (!canCreateProfile) {
      showActionFeedback("warning", "Profile limit reached", `Maximum ${MAX_PROFILE_COUNT} profiles allowed.`);
      return;
    }

    importFileInputRef.current?.click();
  };

  const handleImportProfileFile = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!canCreateProfile) {
      showActionFeedback("warning", "Profile limit reached", `Maximum ${MAX_PROFILE_COUNT} profiles allowed.`);
      return;
    }

    showActionFeedback(
      "info",
      "Importing profile...",
      "Reading JSON file and creating a new profile.",
      { isBusy: true }
    );

    try {
      const jsonText = await readFileAsText(file);
      const importedProfile = parseImportedProfileJson(jsonText);
      const profileName = buildImportedProfileName(
        importedProfile.profileName,
        orderedProfiles
      );

      const dbProfile = await createProfileWithSettings(
        profileName,
        importedProfile.settings
      );

      const dbProfiles = await getProfiles();
      const mappedProfiles = normalizeProfileOrder(dbProfiles.map(mapDbProfile));

      setProfiles(mappedProfiles);
      selectProfile(dbProfile.id);
      setProfileSettings(importedProfile.settings);
      showActionFeedback(
        "success",
        "Profile imported!",
        `${profileName} and its settings were imported successfully.`
      );
    } catch (error) {
      console.error("Failed to import profile:", error);
      const message = error instanceof Error ? error.message : String(error);
      showActionFeedback("error", "Import failed!", message || "Failed to import profile.");
    }
  };

  return (
    <>
      <input
        ref={importFileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImportProfileFile}
      />

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
          const shortcut = getProfileShortcut(profile);

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
              title={shortcut}
              aria-label={`${profile.name}, ${shortcut}`}
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

            <div
              className={`profile-action-feedback ${
                actionFeedback ? `profile-action-feedback-${actionFeedback.type}` : ""
              }`}
              role="status"
              aria-live="polite"
            >
              {actionFeedback ? (
                <>
                  <div className="profile-action-feedback-icon">
                    {actionFeedback.isBusy ? (
                      <span className="profile-action-spinner" />
                    ) : (
                      <>
                        {actionFeedback.type === "success" && "✓"}
                        {actionFeedback.type === "error" && "!"}
                        {actionFeedback.type === "warning" && "!"}
                        {actionFeedback.type === "info" && "i"}
                      </>
                    )}
                  </div>
                  <div>
                    <h2>{actionFeedback.title}</h2>
                    {actionFeedback.message && <p>{actionFeedback.message}</p>}
                  </div>
                </>
              ) : (
                <span className="profile-action-feedback-placeholder">
                  Ready for profile actions
                </span>
              )}
            </div>

            <div className="profiles-header-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={saveProfile}
                disabled={isSaving || isLoadingSettings}
              >
                {isSaving ? "Saving..." : isLoadingSettings ? "Loading..." : "Save"}
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  requestDeleteProfile();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={importProfiles}
                disabled={!canCreateProfile}
              >
                Import
              </button>

              <button type="button" className="secondary-button" onClick={exportProfiles}>
                Export
              </button>
            </div>
          </div>

          <div className="profile-model-content">
            {activeSection === "zoom" && (
              <ZoomPage
                settings={profileSettings.zoomSettings}
                onChange={(zoomSettings) =>
                  setProfileSettings((current) => ({ ...current, zoomSettings }))
                }
              />
            )}
            {activeSection === "shortcuts" && (
              <ShortcutsPage
                shortcuts={profileSettings.shortcutSettings}
                onChange={(shortcutSettings) =>
                  setProfileSettings((current) => ({ ...current, shortcutSettings }))
                }
              />
            )}
            {activeSection === "reading" && (
              <ReadingPage
                settings={profileSettings.readingSettings}
                onChange={(readingSettings) =>
                  setProfileSettings((current) => ({ ...current, readingSettings }))
                }
              />
            )}
            {activeSection === "settings" && (
              <SettingsPage
                settings={profileSettings.appSettings}
                onChange={(appSettings) =>
                  setProfileSettings((current) => ({ ...current, appSettings }))
                }
              />
            )}
          </div>
        </>
      )}


      {toast && (
        <div className={`visionup-toast visionup-toast-${toast.type}`} role="status" aria-live="polite">
          <div className="visionup-toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "!"}
            {toast.type === "warning" && "!"}
            {toast.type === "info" && "i"}
          </div>
          <div className="visionup-toast-content">
            <strong>{toast.title}</strong>
            {toast.message && <span>{toast.message}</span>}
          </div>
          <button
            type="button"
            className="visionup-toast-close"
            aria-label="Close notification"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}

      {pendingDeleteProfile && (
        <div className="delete-confirm-overlay" role="presentation">
          <section className="delete-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-profile-title">
            <div className="delete-confirm-icon">!</div>
            <div className="delete-confirm-content">
              <h2 id="delete-profile-title">Delete this profile?</h2>
              <p>
                {pendingDeleteProfile.name} profile and all related settings will be deleted.
              </p>
              <p>This action cannot be undone.</p>

              <div className="delete-confirm-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setPendingDeleteProfile(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => void deleteProfile()}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default ProfilesPage;

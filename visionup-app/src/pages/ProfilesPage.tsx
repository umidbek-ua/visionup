import { useMemo, useState } from "react";
import { Profile } from "../types/app";

type SortField = "createdAt" | "modifiedAt" | "deletedAt";
type SortDirection = "asc" | "desc";

interface ProfilesPageProps {
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

function ProfilesPage({
  profiles,
  setProfiles,
  selectedProfileId,
  setSelectedProfileId,
  activeProfileId,
  setActiveProfileId,
}: ProfilesPageProps) {
  const [filterProfile, setFilterProfile] = useState<"all" | string>("all");
  const [sortField, setSortField] = useState<SortField>("modifiedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDescription, setNewProfileDescription] = useState("");
  const [message, setMessage] = useState("");

  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId
  );

  const historyRows = useMemo(() => {
    const rows =
      filterProfile === "all"
        ? profiles
        : profiles.filter((profile) => profile.id === filterProfile);

    return [...rows].sort((a, b) => {
      const left = a[sortField] === "-" ? "" : a[sortField];
      const right = b[sortField] === "-" ? "" : b[sortField];

      return sortDirection === "asc"
        ? left.localeCompare(right)
        : right.localeCompare(left);
    });
  }, [profiles, filterProfile, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) {
      return;
    }

    const now = getNow();
    const id = `${newProfileName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const profile: Profile = {
      id,
      name: newProfileName.trim(),
      description: newProfileDescription.trim() || "Custom low vision profile.",
      shortcutKey: String(profiles.length + 1),
      createdAt: now,
      modifiedAt: now,
      deletedAt: "-",
    };

    setProfiles((current) => [...current, profile]);
    setSelectedProfileId(id);
    setActiveProfileId(id);
    setNewProfileName("");
    setNewProfileDescription("");
    setIsCreateOpen(false);
  };

  const handleSaveProfile = () => {
    if (!selectedProfile) {
      return;
    }

    setProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedProfile.id
          ? { ...profile, modifiedAt: getNow() }
          : profile
      )
    );
  };

  const handleDeleteProfile = () => {
    if (!selectedProfile) {
      return;
    }

    const remainingProfiles = profiles.filter(
      (profile) => profile.id !== selectedProfile.id
    );

    setProfiles(remainingProfiles);

    const nextProfile = remainingProfiles[0];

    setSelectedProfileId(nextProfile?.id ?? "");
    setActiveProfileId((current) =>
      current === selectedProfile.id ? nextProfile?.id ?? "" : current
    );

    setFilterProfile("all");
    setMessage("");
  };

  const handleShortcutChange = (profileId: string, value: string) => {
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === profileId
          ? { ...profile, shortcutKey: value.slice(-3) }
          : profile
      )
    );
  };

  return (
    <>
      <div className="profiles-header">
        <div>
          <h3>Profiles</h3>
          <p>
            First create or select a profile, customize settings, then save it.
          </p>
        </div>

        <div className="profiles-header-actions">
          <button className="secondary-button" onClick={() => setIsCreateOpen(true)}>
            Create New Profile
          </button>

          <button className="secondary-button" onClick={handleSaveProfile}>
            Save Profile
          </button>

          <button className="danger-button" onClick={handleDeleteProfile}>
            Delete Profile
          </button>
        </div>
      </div>

      {message && <div className="profile-message">{message}</div>}

      {profiles.length === 0 ? (
        <div className="empty-profiles">
          <h3>No profiles yet</h3>
          <p>Create your first profile to unlock VisionUp settings.</p>
          <button className="secondary-button" onClick={() => setIsCreateOpen(true)}>
            Create First Profile
          </button>
        </div>
      ) : (
        <div className="profiles-grid">
          {profiles.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            const isActive = activeProfileId === profile.id;

            return (
              <article
                key={profile.id}
                className={`profile-card-large ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedProfileId(profile.id)}
              >
                <div className="profile-card-header">
                  <div>
                    <button
                      className="profile-name-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedProfileId(profile.id);
                      }}
                    >
                      {profile.name}
                    </button>

                    <p>{profile.description}</p>
                  </div>

                  <button
                    className={`profile-status-button ${isActive ? "active" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveProfileId(profile.id);
                    }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div
                  className="profile-shortcut-row"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span>Profile Shortcut</span>

                  <div className="shortcut-edit">
                    <strong>⌘ +</strong>
                    <input
                      className="shortcut-input"
                      value={profile.shortcutKey}
                      onChange={(event) =>
                        handleShortcutChange(profile.id, event.target.value)
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="profile-history-section">
        <div className="history-title-row">
          <h3>History</h3>

          <select
            className="profile-filter-select"
            value={filterProfile}
            onChange={(event) => setFilterProfile(event.target.value)}
          >
            <option value="all">All Profiles</option>

            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        <div className="history-table">
          <div className="history-table-header">
            <span>Profile</span>
            <button onClick={() => handleSort("createdAt")}>Created At</button>
            <button onClick={() => handleSort("modifiedAt")}>Modified At</button>
            <button onClick={() => handleSort("deletedAt")}>Deleted At</button>
          </div>

          {historyRows.map((profile) => (
            <div className="history-table-row" key={profile.id}>
              <span>{profile.name}</span>
              <span>{profile.createdAt}</span>
              <span>{profile.modifiedAt}</span>
              <span>{profile.deletedAt}</span>
            </div>
          ))}
        </div>
      </div>

      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="profile-modal">
            <h3>Create New Profile</h3>

            <label>
              Profile Name
              <input
                value={newProfileName}
                onChange={(event) => setNewProfileName(event.target.value)}
                placeholder="Example: Coding Profile"
              />
            </label>

            <label>
              Description
              <textarea
                value={newProfileDescription}
                onChange={(event) => setNewProfileDescription(event.target.value)}
                placeholder="Describe what this profile is for"
              />
            </label>

            <div className="profile-actions">
              <button className="secondary-button" onClick={handleCreateProfile}>
                Create
              </button>

              <button className="mini-button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilesPage;
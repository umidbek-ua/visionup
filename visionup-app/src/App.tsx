import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import QuickTools from "./components/QuickTools";
import ProfilesPage from "./pages/ProfilesPage";

import { MenuItem, Profile, Section } from "./types/app";

const menuItems: MenuItem[] = [
  { id: "zoom", label: "Zoom", description: "Fast and smooth magnification" },
  { id: "shortcuts", label: "Shortcuts", description: "Fast keyboard actions" },
  { id: "reading", label: "Reading", description: "Comfortable text reading" },
  { id: "settings", label: "Settings", description: "App preferences" },
];

const initialProfiles: Profile[] = [
  {
    id: "reading",
    name: "Reading Profile",
    description: "",
    shortcutKey: "1",
    createdAt: "2026-06-09 09:00",
    modifiedAt: "2026-06-09 09:20",
    deletedAt: "-",
  },
  {
    id: "coding",
    name: "Coding Profile",
    description: "",
    shortcutKey: "2",
    createdAt: "2026-06-09 09:10",
    modifiedAt: "2026-06-09 10:05",
    deletedAt: "-",
  },
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>("zoom");
  const [uiScale, setUiScale] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("coding");
  const [activeProfileId, setActiveProfileId] = useState<string>("coding");

  const increaseUiScale = () => {
    setUiScale((scale) => Math.min(1.6, Number((scale + 0.1).toFixed(1))));
  };

  const decreaseUiScale = () => {
    setUiScale((scale) => Math.max(0.9, Number((scale - 0.1).toFixed(1))));
  };

  const resetUiScale = () => {
    setUiScale(1);
  };

  const handleSectionChange = (section: Section) => {
    if (profiles.length === 0) return;
    setActiveSection(section);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isUiScaleShortcut = event.metaKey && !event.ctrlKey;
      const isProfileSwitchShortcut = event.metaKey && event.ctrlKey;

      if (isUiScaleShortcut) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          increaseUiScale();
        }

        if (event.key === "-") {
          event.preventDefault();
          decreaseUiScale();
        }

        if (event.key === "0") {
          event.preventDefault();
          resetUiScale();
        }
      }

      if (isProfileSwitchShortcut && /^[1-9]$/.test(event.key)) {
        const targetProfile = profiles.find(
          (profile) => profile.shortcutKey === event.key
        );

        if (!targetProfile) return;

        event.preventDefault();
        setSelectedProfileId(targetProfile.id);
        setActiveProfileId(targetProfile.id);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [profiles]);

  return (
    <main className="app-shell" style={{ fontSize: `${uiScale * 1.08}rem` }}>
      <Sidebar
        uiScale={uiScale}
        activeSection={activeSection}
        menuItems={menuItems}
        hasProfiles={profiles.length > 0}
        onSectionChange={handleSectionChange}
      />

      <section className="content">
        <section className="dashboard-grid">
          <div className="main-panel">
            <ProfilesPage
              activeSection={activeSection}
              profiles={profiles}
              setProfiles={setProfiles}
              selectedProfileId={selectedProfileId}
              setSelectedProfileId={setSelectedProfileId}
              activeProfileId={activeProfileId}
              setActiveProfileId={setActiveProfileId}
            />
          </div>

          <QuickTools
            increaseUiScale={increaseUiScale}
            decreaseUiScale={decreaseUiScale}
            resetUiScale={resetUiScale}
          />
        </section>
      </section>
    </main>
  );
}

export default App;

import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import QuickTools from "./components/QuickTools";

import ZoomPage from "./pages/ZoomPage";
import ProfilesPage from "./pages/ProfilesPage";
import ShortcutsPage from "./pages/ShortcutsPage";
import ReadingPage from "./pages/ReadingPage";
import SettingsPage from "./pages/SettingsPage";

import { MenuItem, Profile, Section } from "./types/app";

const menuItems: MenuItem[] = [
  { id: "profiles", label: "Profiles", description: "Low vision work modes" },
  { id: "zoom", label: "Zoom", description: "Fast and smooth magnification" },
  { id: "shortcuts", label: "Shortcuts", description: "Fast keyboard actions" },
  { id: "reading", label: "Reading", description: "Comfortable text reading" },
  { id: "settings", label: "Settings", description: "App preferences" },
];

const initialProfiles: Profile[] = [
  {
    id: "reading",
    name: "Reading Profile",
    description: "Large text, comfortable reading mode, reduced eye strain.",
    shortcutKey: "1",
    createdAt: "2026-06-09 09:00",
    modifiedAt: "2026-06-09 09:20",
    deletedAt: "-",
  },
  {
    id: "coding",
    name: "Coding Profile",
    description: "Balanced zoom, high contrast, focused workspace.",
    shortcutKey: "2",
    createdAt: "2026-06-09 09:10",
    modifiedAt: "2026-06-09 10:05",
    deletedAt: "-",
  },
  {
    id: "browsing",
    name: "Browsing Profile",
    description: "Smooth zoom and comfortable web browsing settings.",
    shortcutKey: "3",
    createdAt: "2026-06-09 09:30",
    modifiedAt: "2026-06-09 09:45",
    deletedAt: "-",
  },
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>("profiles");
  const [uiScale, setUiScale] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("coding");
  const [activeProfileId, setActiveProfileId] = useState<string>("coding");

  const hasProfiles = profiles.length > 0;

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
    if (!hasProfiles && section !== "profiles") {
      setActiveSection("profiles");
      return;
    }

    setActiveSection(section);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isMacShortcut = event.metaKey && !event.ctrlKey;

      if (!isMacShortcut) return;

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
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <main className="app-shell" style={{ fontSize: `${uiScale * 1.08}rem` }}>
      <Sidebar
        uiScale={uiScale}
        activeSection={activeSection}
        menuItems={menuItems}
        hasProfiles={hasProfiles}
        onSectionChange={handleSectionChange}
      />

      <section className="content">
        <Topbar title={activeItem?.label ?? "VisionUp"} />

        <section className="dashboard-grid">
          <div className="main-panel">
            {activeSection === "profiles" && (
              <ProfilesPage
                profiles={profiles}
                setProfiles={setProfiles}
                selectedProfileId={selectedProfileId}
                setSelectedProfileId={setSelectedProfileId}
                activeProfileId={activeProfileId}
                setActiveProfileId={setActiveProfileId}
              />
            )}

            {activeSection === "zoom" && <ZoomPage />}
            {activeSection === "shortcuts" && <ShortcutsPage />}
            {activeSection === "reading" && <ReadingPage />}
            {activeSection === "settings" && <SettingsPage />}
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
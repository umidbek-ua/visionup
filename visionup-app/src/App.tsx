import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import QuickTools from "./components/QuickTools";
import ProfilesPage from "./pages/ProfilesPage";
import { ToastProvider } from "./hooks/useToast";

import {
  AppSettingsState,
  MenuItem,
  Profile,
  ProfileSettingsState,
  ReadingSettingsState,
  Section,
  ShortcutItem,
  ZoomSettingsState,
} from "./types/app";

const menuItems: MenuItem[] = [
  { id: "zoom", label: "Zoom", description: "Fast and smooth magnification" },
  { id: "shortcuts", label: "Shortcuts", description: "Fast keyboard actions" },
  { id: "reading", label: "Reading", description: "Comfortable text reading" },
  { id: "settings", label: "Settings", description: "App preferences" },
];

const initialProfiles: Profile[] = [
  {
    id: "reading",
    name: "Reading",
    description: "",
    shortcutKey: "1",
    createdAt: "2026-06-09 09:00",
    modifiedAt: "2026-06-09 09:20",
    deletedAt: "-",
  },
  {
    id: "coding",
    name: "Coding",
    description: "",
    shortcutKey: "2",
    createdAt: "2026-06-09 09:10",
    modifiedAt: "2026-06-09 10:05",
    deletedAt: "-",
  },
];

const initialZoomSettings: ZoomSettingsState = {
  zoomType: "Full Screen",
  maxZoom: 300,
  smoothZoomEnabled: true,
  fastZoomEnabled: true,
};

const initialReadingSettings: ReadingSettingsState = {
  isEnabled: true,
  textSize: 24,
  lineHeight: 1.7,
  letterSpacing: 0.04,
  readingWidth: 720,
  backgroundMode: "dark",
};

const initialShortcutSettings: ShortcutItem[] = [
  {
    id: "fast-zoom-levels",
    group: "Zoom",
    action: "Fast Zoom Levels",
    defaultShortcut: "⌥ + Shift + 0-9",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "smooth-zoom",
    group: "Zoom",
    action: "Smooth Zoom",
    defaultShortcut: "⌘ + Mouse Scroll",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "zoom-type",
    group: "Zoom",
    action: "Change Zoom Type",
    defaultShortcut: "⌘ + Option + Z",
    fixedKeys: "⌘ + Option +",
    customKey: "Z",
  },
  {
    id: "reading-profile",
    group: "Profiles",
    action: "Open Reading Profile",
    defaultShortcut: "Ctrl + Cmd + 1",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "coding-profile",
    group: "Profiles",
    action: "Open Coding Profile",
    defaultShortcut: "Ctrl + Cmd + 2",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "browsing-profile",
    group: "Profiles",
    action: "Open Browsing Profile",
    defaultShortcut: "Ctrl + Cmd + 3",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "increase-ui",
    group: "Settings",
    action: "Increase UI Scale",
    defaultShortcut: "⌘ + +",
    fixedKeys: "⌘ +",
    customKey: "+",
  },
  {
    id: "decrease-ui",
    group: "Settings",
    action: "Decrease UI Scale",
    defaultShortcut: "⌘ + -",
    fixedKeys: "⌘ +",
    customKey: "-",
  },
  {
    id: "reset-ui",
    group: "Settings",
    action: "Reset UI Scale",
    defaultShortcut: "⌘ + 0",
    fixedKeys: "⌘ +",
    customKey: "0",
  },
];

const initialAppSettings: AppSettingsState = {
  accessibilityIntegration: true,
  startOnLogin: false,
  defaultUiScale: 100,
  highContrastUi: true,
  reduceMotion: false,
};

function App() {
  const [activeSection, setActiveSection] = useState<Section>("zoom");
  const [uiScale, setUiScale] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("coding");
  const [activeProfileId, setActiveProfileId] = useState<string>("coding");
  const [profileSettings, setProfileSettings] = useState<ProfileSettingsState>({
    zoomSettings: initialZoomSettings,
    readingSettings: initialReadingSettings,
    shortcutSettings: initialShortcutSettings,
    appSettings: initialAppSettings,
  });

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
    <ToastProvider>
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
              profileSettings={profileSettings}
              setProfileSettings={setProfileSettings}
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
    </ToastProvider>
  );
}

export default App;

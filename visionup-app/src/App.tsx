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

import { MenuItem, Section } from "./types/app";

const menuItems: MenuItem[] = [
  { id: "zoom", label: "Zoom", description: "Fast and smooth magnification" },
  { id: "profiles", label: "Profiles", description: "Low vision work modes" },
  { id: "shortcuts", label: "Shortcuts", description: "Fast keyboard actions" },
  { id: "reading", label: "Reading", description: "Comfortable text reading" },
  { id: "settings", label: "Settings", description: "App preferences" },
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>("zoom");
  const [uiScale, setUiScale] = useState(1);

  const increaseUiScale = () => {
    setUiScale((scale) => Math.min(1.6, Number((scale + 0.1).toFixed(1))));
  };

  const decreaseUiScale = () => {
    setUiScale((scale) => Math.max(0.9, Number((scale - 0.1).toFixed(1))));
  };

  const resetUiScale = () => {
    setUiScale(1);
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
        onSectionChange={setActiveSection}
      />

      <section className="content">
        <Topbar title={activeItem?.label ?? "VisionUp"} />

        <section className="dashboard-grid">
          <div className="main-panel">
            {activeSection === "zoom" && <ZoomPage />}
            {activeSection === "profiles" && <ProfilesPage />}
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
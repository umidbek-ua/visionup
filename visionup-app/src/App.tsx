import { useState } from "react";
import "./App.css";

type Section = "zoom" | "profiles" | "shortcuts" | "reading" | "settings";

function App() {
  const [activeSection, setActiveSection] = useState<Section>("zoom");

  const menuItems: { id: Section; label: string; description: string }[] = [
    { id: "zoom", label: "Zoom", description: "Fast and smooth screen magnification" },
    { id: "profiles", label: "Profiles", description: "Low vision profiles for different workflows" },
    { id: "shortcuts", label: "Shortcuts", description: "Custom keyboard shortcuts" },
    { id: "reading", label: "Reading", description: "Reading mode and text visibility" },
    { id: "settings", label: "Settings", description: "VisionUp preferences" },
  ];

  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">VU</div>
          <div>
            <h1>VisionUp</h1>
            <p>Low Vision Platform</p>
          </div>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Accessibility Dashboard</p>
            <h2>{activeItem?.label}</h2>
          </div>

          <button className="primary-button">Enable VisionUp</button>
        </header>

        <div className="panel">
          <h3>{activeItem?.label} Control</h3>
          <p>{activeItem?.description}</p>

          {activeSection === "zoom" && (
            <div className="control-card">
              <label>Zoom Level</label>
              <div className="range-row">
                <input type="range" min="100" max="400" defaultValue="150" />
                <span>150%</span>
              </div>
              <button className="secondary-button">Apply Zoom</button>
            </div>
          )}

          {activeSection === "profiles" && (
            <div className="grid">
              <div className="profile-card">Reading Profile</div>
              <div className="profile-card">Coding Profile</div>
              <div className="profile-card">Browsing Profile</div>
            </div>
          )}

          {activeSection === "shortcuts" && (
            <div className="control-card">
              <p>Default Shortcut: Control + Option + Z</p>
              <button className="secondary-button">Customize Shortcut</button>
            </div>
          )}

          {activeSection === "reading" && (
            <div className="control-card">
              <p>Reading Mode improves text visibility and reduces eye strain.</p>
              <button className="secondary-button">Enable Reading Mode</button>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="control-card">
              <p>Manage VisionUp preferences and accessibility behavior.</p>
              <button className="secondary-button">Open Settings</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
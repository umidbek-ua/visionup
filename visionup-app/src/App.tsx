import { useEffect, useState } from "react";
import "./App.css";

type Section = "zoom" | "profiles" | "shortcuts" | "reading" | "settings";
type ZoomMode = "fast" | "smooth";

const menuItems: { id: Section; label: string; description: string }[] = [
  { id: "zoom", label: "Zoom", description: "Fast and smooth magnification" },
  { id: "profiles", label: "Profiles", description: "Low vision work modes" },
  { id: "shortcuts", label: "Shortcuts", description: "Fast keyboard actions" },
  { id: "reading", label: "Reading", description: "Comfortable text reading" },
  { id: "settings", label: "Settings", description: "App preferences" },
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>("zoom");
  const [uiScale, setUiScale] = useState(1);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fast");
  const [maxZoom, setMaxZoom] = useState(300);
  const [smoothInterval, setSmoothInterval] = useState(3);

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
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">VU</div>

          <div>
            <h1>VisionUp</h1>
            <p>Low Vision Platform</p>
          </div>
        </div>

        <div className="scale-box">
          <strong>UI Scale</strong>
          <span>{Math.round(uiScale * 100)}%</span>
          <small>⌘ + + / ⌘ + - / ⌘ + 0</small>
        </div>

        <nav className="menu" aria-label="VisionUp sections">
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
        </header>

        <section className="dashboard-grid">
          <div className="main-panel">
            {activeSection === "zoom" && (
              <>
                <div className="zoom-mode-switch">
                  <button
                    className={`mode-card ${zoomMode === "fast" ? "active" : ""}`}
                    onClick={() => setZoomMode("fast")}
                  >
                    <span>Fast Zoom</span>
                    <small>Jump quickly to a predefined zoom level.</small>
                  </button>

                  <button
                    className={`mode-card ${zoomMode === "smooth" ? "active" : ""}`}
                    onClick={() => setZoomMode("smooth")}
                  >
                    <span>Smooth Zoom</span>
                    <small>Zoom step by step with comfortable intervals.</small>
                  </button>
                </div>

                <div className="control-card">
                  {zoomMode === "fast" && (
                    <>
                      <div className="setting-title-row">
                        <h3>Fast Zoom Settings</h3>
                        <span className="value-pill">{maxZoom}%</span>
                      </div>

                      <p>
                        Fast Zoom jumps to the selected maximum zoom level and
                        never goes above this value.
                      </p>

                      <label>Max Zoom Level</label>

                      <div className="range-row">
                        <input
                          type="range"
                          min="150"
                          max="500"
                          step="25"
                          value={maxZoom}
                          onChange={(event) => setMaxZoom(Number(event.target.value))}
                        />
                      </div>

                      <div className="shortcut-list">
                        <div className="shortcut-row">
                          <span>Fast Zoom In</span>
                          <strong>⌘ + Shift + +</strong>
                          <button className="mini-button">Customize</button>
                        </div>

                        <div className="shortcut-row">
                          <span>Fast Zoom Out</span>
                          <strong>⌘ + Shift + -</strong>
                          <button className="mini-button">Customize</button>
                        </div>
                      </div>
                    </>
                  )}

                  {zoomMode === "smooth" && (
                    <>
                      <div className="setting-title-row">
                        <h3>Smooth Zoom Settings</h3>
                        <span className="value-pill">Interval {smoothInterval}</span>
                      </div>

                      <p>
                        Smooth Zoom changes magnification gradually using the
                        selected zoom interval.
                      </p>

                      <label>Zoom Interval</label>

                      <div className="interval-grid">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            className={`interval-button ${
                              smoothInterval === value ? "active" : ""
                            }`}
                            onClick={() => setSmoothInterval(value)}
                          >
                            {value}
                          </button>
                        ))}
                      </div>

                      <div className="shortcut-list">
                        <div className="shortcut-row">
                          <span>Smooth Zoom In</span>
                          <strong>⌘ + +</strong>
                          <button className="mini-button">Customize</button>
                        </div>

                        <div className="shortcut-row">
                          <span>Smooth Zoom Out</span>
                          <strong>⌘ + -</strong>
                          <button className="mini-button">Customize</button>
                        </div>

                        <div className="shortcut-row">
                          <span>Change Zoom Interval</span>
                          <strong>⌘ + Option + I</strong>
                          <button className="mini-button">Customize</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="settings-section">
                  <h3>General Zoom Settings</h3>

                  <div className="settings-grid">
                    <div className="setting-card">
                      <span>Custom Zoom Levels</span>
                      <p>Save preferred zoom levels for daily use.</p>
                    </div>

                    <div className="setting-card">
                      <span>Zoom Profiles</span>
                      <p>Use different zoom behavior for reading, coding, and browsing.</p>
                    </div>

                    <div className="setting-card">
                      <span>Zoom Follow Cursor</span>
                      <p>Cursor-based zoom movement.</p>
                      <em>Research</em>
                    </div>

                    <div className="setting-card">
                      <span>Secondary Zoom Display</span>
                      <p>Show zoomed view on another display.</p>
                      <em>Research</em>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "profiles" && (
              <>
                <h3>Profiles</h3>
                <p>Switch between low vision profiles for different workflows.</p>

                <div className="card-grid">
                  <div className="feature-card">Reading Profile</div>
                  <div className="feature-card">Coding Profile</div>
                  <div className="feature-card">Browsing Profile</div>
                </div>
              </>
            )}

            {activeSection === "shortcuts" && (
              <div className="control-card">
                <h3>Shortcuts</h3>
                <p>Manage default and custom keyboard shortcuts.</p>
                <button className="secondary-button">Customize Shortcuts</button>
              </div>
            )}

            {activeSection === "reading" && (
              <div className="control-card">
                <h3>Reading Mode</h3>
                <p>Improve text visibility and reduce eye strain.</p>
                <button className="secondary-button">Enable Reading Mode</button>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="control-card">
                <h3>Settings</h3>
                <p>Manage VisionUp behavior, theme, shortcuts, and profiles.</p>
                <button className="secondary-button">Open Settings</button>
              </div>
            )}
          </div>

          <aside className="status-panel">
            <h3>Quick Tools</h3>

            <div className="scale-actions">
              <button className="tool-button" onClick={increaseUiScale}>A+ Increase UI</button>
              <button className="tool-button" onClick={decreaseUiScale}>A- Decrease UI</button>
              <button className="tool-button" onClick={resetUiScale}>Reset UI</button>
            </div>

            <button className="tool-button">High Contrast</button>
            <button className="tool-button">Large Cursor</button>
            <button className="tool-button">Reading Mode</button>

            <div className="hint-box">
              <strong>Low Vision First</strong>
              <p>Large text, strong contrast, big buttons, and visible focus states.</p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default App;
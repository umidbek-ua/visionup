import { useState } from "react";

type ZoomType = "Full Screen" | "Picture-in-Picture" | "Zoom Window";
type DefaultZoomMode = "Fast" | "Smooth";

function SettingsPage() {
  const [accessibilityIntegration, setAccessibilityIntegration] = useState(true);
  const [startOnLogin, setStartOnLogin] = useState(false);
  const [zoomType, setZoomType] = useState<ZoomType>("Full Screen");
  const [defaultZoomMode, setDefaultZoomMode] = useState<DefaultZoomMode>("Fast");
  const [defaultUiScale, setDefaultUiScale] = useState(100);
  const [highContrastUi, setHighContrastUi] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <>
      <div className="settings-header">
        <div>
          <h3>Settings</h3>
          <p>
            Manage VisionUp system integration, zoom behavior, profile backup,
            and app preferences.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <section className="settings-panel">
          <h3>System Integration</h3>

          <div className="settings-row">
            <div>
              <strong>macOS Accessibility Integration</strong>
              <p>Allow VisionUp to control system accessibility features.</p>
            </div>

            <button
              className={`toggle-button ${accessibilityIntegration ? "active" : ""}`}
              onClick={() => setAccessibilityIntegration((value) => !value)}
            >
              {accessibilityIntegration ? "On" : "Off"}
            </button>
          </div>

          <div className="settings-row">
            <div>
              <strong>Start VisionUp on Login</strong>
              <p>Automatically open VisionUp when the computer starts.</p>
            </div>

            <button
              className={`toggle-button ${startOnLogin ? "active" : ""}`}
              onClick={() => setStartOnLogin((value) => !value)}
            >
              {startOnLogin ? "On" : "Off"}
            </button>
          </div>
        </section>

        <section className="settings-panel">
          <h3>Zoom Behavior</h3>

          <div className="settings-row vertical">
            <strong>Zoom Type</strong>

            <div className="option-grid">
              {(["Full Screen", "Picture-in-Picture", "Zoom Window"] as ZoomType[]).map(
                (item) => (
                  <button
                    key={item}
                    className={`option-button ${zoomType === item ? "active" : ""}`}
                    onClick={() => setZoomType(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="settings-row vertical">
            <strong>Default Zoom Mode</strong>

            <div className="option-grid two">
              {(["Fast", "Smooth"] as DefaultZoomMode[]).map((item) => (
                <button
                  key={item}
                  className={`option-button ${defaultZoomMode === item ? "active" : ""}`}
                  onClick={() => setDefaultZoomMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-panel">
          <h3>Profiles Backup</h3>

          <div className="backup-actions">
            <button className="secondary-button">Export Profiles JSON</button>
            <button className="secondary-button">Import Profiles JSON</button>
          </div>

          <p className="settings-note">
            MVP note: export/import will be connected to local storage later.
          </p>
        </section>

        <section className="settings-panel">
          <h3>App Preferences</h3>

          <div className="settings-row vertical">
            <div className="setting-title-row">
              <strong>Default UI Scale</strong>
              <span className="value-pill">{defaultUiScale}%</span>
            </div>

            <input
              type="range"
              min="90"
              max="160"
              step="10"
              value={defaultUiScale}
              onChange={(event) => setDefaultUiScale(Number(event.target.value))}
            />
          </div>

          <div className="settings-row">
            <div>
              <strong>High Contrast UI</strong>
              <p>Keep VisionUp interface clear and readable.</p>
            </div>

            <button
              className={`toggle-button ${highContrastUi ? "active" : ""}`}
              onClick={() => setHighContrastUi((value) => !value)}
            >
              {highContrastUi ? "On" : "Off"}
            </button>
          </div>

          <div className="settings-row">
            <div>
              <strong>Reduce Motion</strong>
              <p>Reduce animations and visual movement.</p>
            </div>

            <button
              className={`toggle-button ${reduceMotion ? "active" : ""}`}
              onClick={() => setReduceMotion((value) => !value)}
            >
              {reduceMotion ? "On" : "Off"}
            </button>
          </div>
        </section>

        <section className="settings-panel">
          <h3>Experimental Features</h3>

          <div className="experimental-grid">
            <div className="experimental-card">
              <span>Secondary Zoom Display</span>
              <p>Show magnified content on another monitor.</p>
              <em>Research</em>
            </div>

            <div className="experimental-card">
              <span>Smart Dark Background</span>
              <p>Darken backgrounds without damaging images or text colors.</p>
              <em>Research</em>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default SettingsPage;
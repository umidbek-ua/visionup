import { AppSettingsState } from "../types/app";

interface SettingsPageProps {
  settings: AppSettingsState;
  onChange: (settings: AppSettingsState) => void;
}

function SettingsPage({ settings, onChange }: SettingsPageProps) {
  const updateSettings = (changes: Partial<AppSettingsState>) => {
    onChange({ ...settings, ...changes });
  };

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
              className={`toggle-button ${settings.accessibilityIntegration ? "active" : ""}`}
              onClick={() =>
                updateSettings({
                  accessibilityIntegration: !settings.accessibilityIntegration,
                })
              }
            >
              {settings.accessibilityIntegration ? "On" : "Off"}
            </button>
          </div>

          <div className="settings-row">
            <div>
              <strong>Start VisionUp on Login</strong>
              <p>Automatically open VisionUp when the computer starts.</p>
            </div>

            <button
              className={`toggle-button ${settings.startOnLogin ? "active" : ""}`}
              onClick={() => updateSettings({ startOnLogin: !settings.startOnLogin })}
            >
              {settings.startOnLogin ? "On" : "Off"}
            </button>
          </div>
        </section>

        <section className="settings-panel">
          <h3>App Preferences</h3>

          <div className="settings-row vertical">
            <div className="setting-title-row">
              <strong>Default UI Scale</strong>
              <span className="value-pill">{settings.defaultUiScale}%</span>
            </div>

            <input
              type="range"
              min="90"
              max="160"
              step="10"
              value={settings.defaultUiScale}
              onChange={(event) =>
                updateSettings({ defaultUiScale: Number(event.target.value) })
              }
            />
          </div>

          <div className="settings-row">
            <div>
              <strong>High Contrast UI</strong>
              <p>Keep VisionUp interface clear and readable.</p>
            </div>

            <button
              className={`toggle-button ${settings.highContrastUi ? "active" : ""}`}
              onClick={() => updateSettings({ highContrastUi: !settings.highContrastUi })}
            >
              {settings.highContrastUi ? "On" : "Off"}
            </button>
          </div>

          <div className="settings-row">
            <div>
              <strong>Reduce Motion</strong>
              <p>Reduce animations and visual movement.</p>
            </div>

            <button
              className={`toggle-button ${settings.reduceMotion ? "active" : ""}`}
              onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
            >
              {settings.reduceMotion ? "On" : "Off"}
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

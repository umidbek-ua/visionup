import { ZoomSettingsState } from "../types/app";

interface ZoomPageProps {
  settings: ZoomSettingsState;
  onChange: (settings: ZoomSettingsState) => void;
}

function ZoomPage({ settings, onChange }: ZoomPageProps) {
  const updateSettings = (changes: Partial<ZoomSettingsState>) => {
    onChange({ ...settings, ...changes });
  };

  return (
    <>
      <section className="zoom-type-section">
        <h3>Zoom Type</h3>

        <div className="zoom-type-options">
          {(["Full Screen", "Picture-in-Picture", "Zoom Window"] as const).map(
            (type) => (
              <button
                key={type}
                className={`option-button ${settings.zoomType === type ? "active" : ""}`}
                onClick={() => updateSettings({ zoomType: type })}
              >
                {type}
              </button>
            )
          )}
        </div>

        <p className="zoom-shortcut-text">
          Shortcut: <strong>⌘ + Option + Z</strong>
        </p>
      </section>

      <section className="zoom-mode-panel">
        <div className="zoom-section-title-row">
          <div>
            <h3>Fast Zoom</h3>
            <p>
              Set one maximum zoom value. VisionUp splits it into 10 fast
              shortcut levels.
            </p>
          </div>

          <span className="value-pill">{settings.maxZoom}%</span>
        </div>

        <div className="zoom-max-control">
          <label>Max Zoom</label>

          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={settings.maxZoom}
            onChange={(event) => updateSettings({ maxZoom: Number(event.target.value) })}
          />
        </div>

        <div className="zoom-shortcut-note">
          <span>Fast Zoom Shortcut</span>
          <strong>⌥ + Shift + 0-9</strong>
        </div>

        <div className="fast-zoom-grid">
          {Array.from({ length: 10 }).map((_, index) => {
            const key = index === 9 ? "0" : String(index + 1);
            const step = index === 9 ? 10 : index + 1;
            const value = Math.round((settings.maxZoom / 10) * step);

            return (
              <div className="fast-zoom-card" key={key}>
                <span>{value}%</span>
                <strong>⌥ + Shift + {key}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="zoom-mode-panel">
        <h3>Smooth Zoom</h3>
        <p>Use mouse scroll for gradual zoom control.</p>

        <div className="zoom-shortcut-note">
          <span>Shortcut</span>
          <strong>⌘ + Mouse Scroll</strong>
        </div>
      </section>

      <div className="settings-section">
        <h3>General Zoom Settings</h3>

        <div className="settings-grid">
          <div className="setting-card">
            <span>Zoom Profiles</span>
            <p>Zoom behavior is saved into the active profile.</p>
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
  );
}

export default ZoomPage;

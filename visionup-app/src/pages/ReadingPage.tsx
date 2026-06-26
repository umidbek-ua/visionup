import { ReadingSettingsState } from "../types/app";

interface ReadingPageProps {
  settings: ReadingSettingsState;
  onChange: (settings: ReadingSettingsState) => void;
}

function ReadingPage({ settings, onChange }: ReadingPageProps) {
  const updateSettings = (changes: Partial<ReadingSettingsState>) => {
    onChange({ ...settings, ...changes });
  };

  return (
    <>
      <div className="reading-header">
        <div>
          <h3>Reading Mode</h3>
          <p>
            Adjust text visibility, spacing, and reading comfort for low vision
            workflows.
          </p>
        </div>

        <button
          className={`reading-toggle ${settings.isEnabled ? "active" : ""}`}
          onClick={() => updateSettings({ isEnabled: !settings.isEnabled })}
        >
          {settings.isEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="reading-layout">
        <section className="reading-controls">
          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Text Size</h3>
              <span className="value-pill">{settings.textSize}px</span>
            </div>

            <input
              type="range"
              min="18"
              max="42"
              value={settings.textSize}
              onChange={(event) => updateSettings({ textSize: Number(event.target.value) })}
            />
          </div>

          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Line Height</h3>
              <span className="value-pill">{settings.lineHeight.toFixed(1)}</span>
            </div>

            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              value={settings.lineHeight}
              onChange={(event) => updateSettings({ lineHeight: Number(event.target.value) })}
            />
          </div>

          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Letter Spacing</h3>
              <span className="value-pill">{settings.letterSpacing.toFixed(2)}em</span>
            </div>

            <input
              type="range"
              min="0"
              max="0.12"
              step="0.01"
              value={settings.letterSpacing}
              onChange={(event) => updateSettings({ letterSpacing: Number(event.target.value) })}
            />
          </div>

          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Reading Width</h3>
              <span className="value-pill">{settings.readingWidth}px</span>
            </div>

            <input
              type="range"
              min="480"
              max="980"
              step="20"
              value={settings.readingWidth}
              onChange={(event) => updateSettings({ readingWidth: Number(event.target.value) })}
            />
          </div>

          <div className="reading-control-card">
            <h3>Background Mode</h3>

            <div className="reading-mode-buttons">
              <button
                className={settings.backgroundMode === "dark" ? "active" : ""}
                onClick={() => updateSettings({ backgroundMode: "dark" })}
              >
                Dark
              </button>

              <button
                className={settings.backgroundMode === "sepia" ? "active" : ""}
                onClick={() => updateSettings({ backgroundMode: "sepia" })}
              >
                Sepia
              </button>

              <button
                className={settings.backgroundMode === "contrast" ? "active" : ""}
                onClick={() => updateSettings({ backgroundMode: "contrast" })}
              >
                High Contrast
              </button>
            </div>
          </div>
        </section>

        <section className={`reading-preview ${settings.backgroundMode}`}>
          <div
            className="reading-preview-content"
            style={{
              maxWidth: `${settings.readingWidth}px`,
              fontSize: `${settings.textSize}px`,
              lineHeight: settings.lineHeight,
              letterSpacing: `${settings.letterSpacing}em`,
              opacity: settings.isEnabled ? 1 : 0.45,
            }}
          >
            <h3>Preview Text</h3>

            <p>
              VisionUp Reading Mode helps low vision users read text more
              comfortably by adjusting size, spacing, contrast, and reading
              width.
            </p>

            <p>
              The goal is to reduce eye strain and make long reading sessions
              easier without changing the whole operating system.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default ReadingPage;

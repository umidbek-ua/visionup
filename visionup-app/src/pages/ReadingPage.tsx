import { useState } from "react";

type BackgroundMode = "dark" | "sepia" | "contrast";

function ReadingPage() {
  const [isReadingModeEnabled, setIsReadingModeEnabled] = useState(true);
  const [textSize, setTextSize] = useState(24);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [letterSpacing, setLetterSpacing] = useState(0.04);
  const [readingWidth, setReadingWidth] = useState(720);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("dark");

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
          className={`reading-toggle ${isReadingModeEnabled ? "active" : ""}`}
          onClick={() => setIsReadingModeEnabled((value) => !value)}
        >
          {isReadingModeEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="reading-layout">
        <section className="reading-controls">
          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Text Size</h3>
              <span className="value-pill">{textSize}px</span>
            </div>

            <input
              type="range"
              min="18"
              max="42"
              value={textSize}
              onChange={(event) => setTextSize(Number(event.target.value))}
            />
          </div>

          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Line Height</h3>
              <span className="value-pill">{lineHeight.toFixed(1)}</span>
            </div>

            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              value={lineHeight}
              onChange={(event) => setLineHeight(Number(event.target.value))}
            />
          </div>

          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Letter Spacing</h3>
              <span className="value-pill">{letterSpacing.toFixed(2)}em</span>
            </div>

            <input
              type="range"
              min="0"
              max="0.12"
              step="0.01"
              value={letterSpacing}
              onChange={(event) => setLetterSpacing(Number(event.target.value))}
            />
          </div>

          <div className="reading-control-card">
            <div className="setting-title-row">
              <h3>Reading Width</h3>
              <span className="value-pill">{readingWidth}px</span>
            </div>

            <input
              type="range"
              min="480"
              max="980"
              step="20"
              value={readingWidth}
              onChange={(event) => setReadingWidth(Number(event.target.value))}
            />
          </div>

          <div className="reading-control-card">
            <h3>Background Mode</h3>

            <div className="reading-mode-buttons">
              <button
                className={backgroundMode === "dark" ? "active" : ""}
                onClick={() => setBackgroundMode("dark")}
              >
                Dark
              </button>

              <button
                className={backgroundMode === "sepia" ? "active" : ""}
                onClick={() => setBackgroundMode("sepia")}
              >
                Sepia
              </button>

              <button
                className={backgroundMode === "contrast" ? "active" : ""}
                onClick={() => setBackgroundMode("contrast")}
              >
                High Contrast
              </button>
            </div>
          </div>
        </section>

        <section className={`reading-preview ${backgroundMode}`}>
          <div
            className="reading-preview-content"
            style={{
              maxWidth: `${readingWidth}px`,
              fontSize: `${textSize}px`,
              lineHeight,
              letterSpacing: `${letterSpacing}em`,
              opacity: isReadingModeEnabled ? 1 : 0.45,
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
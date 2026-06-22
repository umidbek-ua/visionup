import { useState } from "react";

type ZoomType = "Full Screen" | "Picture-in-Picture" | "Zoom Window";

function ZoomPage() {
  const [zoomType, setZoomType] = useState<ZoomType>("Full Screen");

  return (
    <>
      <section className="zoom-type-section">
        <h3>Zoom Type</h3>

        <div className="zoom-type-options">
          {(["Full Screen", "Picture-in-Picture", "Zoom Window"] as ZoomType[]).map(
            (type) => (
              <button
                key={type}
                className={`option-button ${zoomType === type ? "active" : ""}`}
                onClick={() => setZoomType(type)}
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
        <h3>Fast Zoom</h3>
        <p>Use fixed shortcut levels for fast and predictable zoom control.</p>

        <div className="zoom-shortcut-note">
          <span>Shortcut</span>
          <strong>⌘ + Shift + 0-9</strong>
        </div>

        <div className="fast-zoom-grid">
          {Array.from({ length: 10 }).map((_, index) => {
            const key = index === 9 ? "0" : String(index + 1);
            const value = index === 9 ? "100%" : `${(index + 1) * 10}%`;

            return (
              <div className="fast-zoom-card" key={key}>
                <span>{value}</span>
                <strong>⌘ + Shift + {key}</strong>
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
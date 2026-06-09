import { useState } from "react";
import { ZoomMode } from "../types/app";

function ZoomPage() {
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fast");
  const [maxZoom, setMaxZoom] = useState(300);
  const [smoothInterval, setSmoothInterval] = useState(3);

  return (
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
              Fast Zoom jumps to the selected maximum zoom level and never goes
              above this value.
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
              Smooth Zoom changes magnification gradually using the selected
              zoom interval.
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
  );
}

export default ZoomPage;
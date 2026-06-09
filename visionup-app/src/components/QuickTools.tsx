interface QuickToolsProps {
  increaseUiScale: () => void;
  decreaseUiScale: () => void;
  resetUiScale: () => void;
}

function QuickTools({
  increaseUiScale,
  decreaseUiScale,
  resetUiScale,
}: QuickToolsProps) {
  return (
    <aside className="status-panel">
      <h3>Quick Tools</h3>

      <div className="scale-actions">
        <button className="tool-button" onClick={increaseUiScale}>
          A+ Increase UI
        </button>

        <button className="tool-button" onClick={decreaseUiScale}>
          A- Decrease UI
        </button>

        <button className="tool-button" onClick={resetUiScale}>
          Reset UI
        </button>
      </div>

      <button className="tool-button">High Contrast</button>
      <button className="tool-button">Large Cursor</button>
      <button className="tool-button">Reading Mode</button>

      <div className="hint-box">
        <strong>Low Vision First</strong>

        <p>
          Large text, strong contrast, big buttons,
          and visible focus states.
        </p>
      </div>
    </aside>
  );
}

export default QuickTools;
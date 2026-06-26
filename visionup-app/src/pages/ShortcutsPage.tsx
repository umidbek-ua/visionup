import { ShortcutItem } from "../types/app";

interface ShortcutsPageProps {
  shortcuts: ShortcutItem[];
  onChange: (shortcuts: ShortcutItem[]) => void;
}

const groups: ShortcutItem["group"][] = ["Zoom", "Profiles", "Settings"];

function ShortcutsPage({ shortcuts, onChange }: ShortcutsPageProps) {
  const updateShortcut = (id: string, value: string) => {
    onChange(
      shortcuts.map((shortcut) =>
        shortcut.id === id
          ? { ...shortcut, customKey: value.slice(-3).toUpperCase() }
          : shortcut
      )
    );
  };

  const isFixedShortcut = (shortcut: ShortcutItem) =>
    shortcut.id === "fast-zoom-levels" ||
    shortcut.id === "smooth-zoom" ||
    shortcut.group === "Profiles";

  return (
    <>
      <div className="shortcuts-header">
        <div>
          <h3>Shortcuts</h3>
          <p>
            Manage VisionUp keyboard shortcuts for zoom, profiles, and settings.
          </p>
        </div>
      </div>

      <div className="shortcuts-groups">
        {groups.map((group) => (
          <section className="shortcut-group" key={group}>
            <h3>{group}</h3>

            <div className="shortcut-table">
              <div className="shortcut-table-header">
                <span>Action</span>
                <span>Default</span>
                <span>Customize</span>
              </div>

              {shortcuts
                .filter((shortcut) => shortcut.group === group)
                .map((shortcut) => (
                  <div className="shortcut-table-row" key={shortcut.id}>
                    <span>{shortcut.action}</span>

                    <div className="readonly-shortcut">
                      {shortcut.defaultShortcut}
                    </div>

                    {isFixedShortcut(shortcut) ? (
                      <div className="readonly-shortcut">Fixed</div>
                    ) : (
                      <div className="custom-shortcut">
                        <span>{shortcut.fixedKeys}</span>
                        <input
                          value={shortcut.customKey}
                          onChange={(event) =>
                            updateShortcut(shortcut.id, event.target.value)
                          }
                          aria-label={`${shortcut.action} custom key`}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default ShortcutsPage;

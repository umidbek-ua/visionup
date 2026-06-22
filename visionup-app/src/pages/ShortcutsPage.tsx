import { useState } from "react";

interface ShortcutItem {
  id: string;
  group: "Zoom" | "Profiles" | "Settings";
  action: string;
  defaultShortcut: string;
  fixedKeys: string;
  customKey: string;
}

const initialShortcuts: ShortcutItem[] = [
  {
    id: "fast-zoom-levels",
    group: "Zoom",
    action: "Fast Zoom Levels",
    defaultShortcut: "⌥ + Shift + 0-9",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "smooth-zoom",
    group: "Zoom",
    action: "Smooth Zoom",
    defaultShortcut: "⌘ + Mouse Scroll",
    fixedKeys: "Fixed",
    customKey: "",
  },
  {
    id: "zoom-type",
    group: "Zoom",
    action: "Change Zoom Type",
    defaultShortcut: "⌘ + Option + Z",
    fixedKeys: "⌘ + Option +",
    customKey: "Z",
  },
  {
    id: "reading-profile",
    group: "Profiles",
    action: "Open Reading Profile",
    defaultShortcut: "⌘ + 1",
    fixedKeys: "⌘ +",
    customKey: "1",
  },
  {
    id: "coding-profile",
    group: "Profiles",
    action: "Open Coding Profile",
    defaultShortcut: "⌘ + 2",
    fixedKeys: "⌘ +",
    customKey: "2",
  },
  {
    id: "browsing-profile",
    group: "Profiles",
    action: "Open Browsing Profile",
    defaultShortcut: "⌘ + 3",
    fixedKeys: "⌘ +",
    customKey: "3",
  },
  {
    id: "increase-ui",
    group: "Settings",
    action: "Increase UI Scale",
    defaultShortcut: "⌘ + +",
    fixedKeys: "⌘ +",
    customKey: "+",
  },
  {
    id: "decrease-ui",
    group: "Settings",
    action: "Decrease UI Scale",
    defaultShortcut: "⌘ + -",
    fixedKeys: "⌘ +",
    customKey: "-",
  },
  {
    id: "reset-ui",
    group: "Settings",
    action: "Reset UI Scale",
    defaultShortcut: "⌘ + 0",
    fixedKeys: "⌘ +",
    customKey: "0",
  },
];

const groups: ShortcutItem["group"][] = ["Zoom", "Profiles", "Settings"];

function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState(initialShortcuts);

  const updateShortcut = (id: string, value: string) => {
    setShortcuts((current) =>
      current.map((shortcut) =>
        shortcut.id === id
          ? { ...shortcut, customKey: value.slice(-3).toUpperCase() }
          : shortcut
      )
    );
  };

  const isFixedShortcut = (shortcut: ShortcutItem) =>
    shortcut.id === "fast-zoom-levels" || shortcut.id === "smooth-zoom";

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
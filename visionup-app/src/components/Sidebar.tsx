import { MenuItem, Section } from "../types/app";

interface SidebarProps {
  uiScale: number;
  activeSection: Section;
  menuItems: MenuItem[];
  onSectionChange: (section: Section) => void;
}

function Sidebar({
  uiScale,
  activeSection,
  menuItems,
  onSectionChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">VU</div>

        <div>
          <h1>VisionUp</h1>
          <p>Low Vision Platform</p>
        </div>
      </div>

      <div className="scale-box">
        <strong>UI Scale</strong>
        <span>{Math.round(uiScale * 100)}%</span>
        <small>⌘ + + / ⌘ + - / ⌘ + 0</small>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
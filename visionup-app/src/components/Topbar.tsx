interface TopbarProps {
  title: string;
}

function Topbar({ title }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Accessibility Dashboard</p>
        <h2>{title}</h2>
      </div>
    </header>
  );
}

export default Topbar;
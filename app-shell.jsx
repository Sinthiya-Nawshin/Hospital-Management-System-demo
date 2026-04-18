// app-shell.jsx — App, TopBar, Sidebar, Role switcher, page routing

const ROLES = {
  receptionist: {
    id: "receptionist",
    label: "Reception",
    name: "Maya Arslan",
    email: "m.arslan@hospital.org",
    hue: 210,
    nav: ["dashboard", "patients", "appointments", "admissions", "ambulance"],
  },
  doctor: {
    id: "doctor",
    label: "Doctor",
    name: "Dr. Amelia Okafor",
    email: "a.okafor@hospital.org",
    hue: 245,
    nav: ["dashboard", "patients", "appointments", "prescriptions", "admissions"],
  },
  billing: {
    id: "billing",
    label: "Billing",
    name: "Nikolai Baranov",
    email: "n.baranov@hospital.org",
    hue: 25,
    nav: ["dashboard", "patients", "billing", "pharmacy"],
  },
  admin: {
    id: "admin",
    label: "Admin",
    name: "Jordan Castellanos",
    email: "j.castellanos@hospital.org",
    hue: 295,
    nav: ["dashboard", "patients", "appointments", "admissions", "prescriptions", "billing", "pharmacy", "ambulance", "staff"],
  },
};

const NAV = [
  { id: "dashboard",     label: "Dashboard",     icon: "dashboard" },
  { id: "patients",      label: "Patients",      icon: "patients", badgeFn: () => PATIENTS.length },
  { id: "appointments",  label: "Appointments",  icon: "calendar", badgeFn: () => APPOINTMENTS.filter(a => a.day === 2).length },
  { id: "admissions",    label: "Admissions",    icon: "bed", badgeFn: () => ROOMS.filter(r => r.patientId).length },
  { id: "prescriptions", label: "Prescriptions", icon: "pill" },
  { id: "billing",       label: "Billing",       icon: "billing", badgeFn: () => BILLS.filter(b => b.status !== "paid").length },
  { id: "pharmacy",      label: "Pharmacy",      icon: "vial" },
  { id: "ambulance",     label: "Ambulance",     icon: "ambulance" },
  { id: "staff",         label: "Staff",         icon: "staff" },
];

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">{/* medical cross drawn via ::before/::after */}</div>
      <div>
        <div className="brand-name">Meridian HMS</div>
        <div className="brand-sub">Hospital Management</div>
      </div>
    </div>
  );
}

function TopBar({ role, setRole, onOpenSearch, page, setPage, onOpenScenarios }) {
  const pageLabel = NAV.find(n => n.id === page)?.label || "";
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb">
          <span>Meridian General</span>
          <Icon name="chevRight" size={14} style={{ color: "var(--muted-2)" }}/>
          <span className="crumb-active">{pageLabel}</span>
        </div>
      </div>
      <div className="topbar-search">
        <Icon name="search" size={14} className="search-icon"/>
        <input placeholder="Search patients, doctors, MRN, bills…" onFocus={onOpenSearch} readOnly />
        <span className="kbd">⌘K</span>
      </div>
      <div className="topbar-right">
        <button
          className="btn sm"
          data-tour="scenarios"
          onClick={onOpenScenarios}
          title="Run a scripted demo scenario"
          style={{ gap: 6 }}
        >
          <Icon name="sparkle" size={13} style={{ color: "var(--accent)" }}/>
          Scenarios
        </button>
        <button className="icon-btn" title="Notifications">
          <Icon name="bell" size={16}/>
          <span className="dot"/>
        </button>
        <button className="icon-btn" title="Settings"><Icon name="settings" size={16}/></button>
        <RoleSwitcher role={role} setRole={setRole}/>
      </div>
    </div>
  );
}

function RoleSwitcher({ role, setRole }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const r = ROLES[role];
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="user-chip" onClick={() => setOpen(o => !o)}>
        <Avatar name={r.name} hue={r.hue} size={24}/>
        <span className="role-label">{r.label}</span>
        <Icon name="chevDown" size={14} style={{ color: "var(--muted-2)", marginRight: 2 }}/>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          width: 260, background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 10, boxShadow: "var(--shadow-lg)", padding: 6, zIndex: 200,
        }}>
          <div style={{ padding: "8px 10px 6px", fontSize: 10.5, fontWeight: 600, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Switch role</div>
          {Object.values(ROLES).map(opt => (
            <button key={opt.id} onClick={() => { setRole(opt.id); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", background: opt.id === role ? "var(--accent-soft)" : "transparent",
                border: "none", borderRadius: 6, textAlign: "left", cursor: "pointer",
                color: "var(--ink)",
              }}>
              <Avatar name={opt.name} hue={opt.hue} size={26}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{opt.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{opt.label} · {opt.nav.length} modules</div>
              </div>
              {opt.id === role && <Icon name="check" size={14} style={{ color: "var(--accent-soft-ink)" }}/>}
            </button>
          ))}
          <div style={{ borderTop: "1px solid var(--hairline)", margin: "6px 0" }}/>
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "transparent", border: "none", borderRadius: 6, textAlign: "left", color: "var(--ink-2)", fontSize: 13 }}>
            <Icon name="logout" size={14}/> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ page, setPage, role }) {
  const r = ROLES[role];
  const allowedIds = new Set(r.nav);
  const primary = NAV.filter(n => allowedIds.has(n.id));
  const disabled = NAV.filter(n => !allowedIds.has(n.id));
  return (
    <nav className="sidebar">
      <div className="nav-group">
        <div className="nav-group-label">Workspace</div>
        {primary.map(n => (
          <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={16} className="nav-ico"/>
            <span>{n.label}</span>
            {n.badgeFn && <span className="badge">{n.badgeFn()}</span>}
          </button>
        ))}
      </div>
      {disabled.length > 0 && (
        <div className="nav-group">
          <div className="nav-group-label">Other modules</div>
          {disabled.map(n => (
            <button key={n.id} className="nav-item" style={{ opacity: 0.55 }} onClick={() => setPage(n.id)}>
              <Icon name={n.icon} size={16} className="nav-ico"/>
              <span>{n.label}</span>
              <Icon name="lock" size={12} style={{ marginLeft: "auto", color: "var(--muted-2)" }}/>
            </button>
          ))}
        </div>
      )}
      <div className="sidebar-footer">
        <div className="uptime">
          <span className="pulse"/>
          <span>All systems operational</span>
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { ROLES, NAV, Brand, TopBar, Sidebar });

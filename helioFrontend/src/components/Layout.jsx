export default function Layout({
  page,
  setPage,
  identity,
  setIdentity,
  children,
  logout,
}) {
  const links =
    identity === "clinic"
      ? [
          ["clinic-admin", "Dashboard"],
          ["clinic-admin/doctors", "Doctors"],
          ["appointments", "Appointments"],
          ["queue", "Queue"],
          ["prescriptions", "Prescriptions"],
          ["profile", "Clinic profile"],
        ]
      : identity === "doctor" ? [
          ["doctor-dashboard", "Dashboard"],
          ["queue", "My clinics & queue"],
          ["prescriptions", "Prescriptions"],
          ["profile", "Profile"],
        ] : [
          ["discover", "Home"],
          ["clinics", "Doctors"],
          ["appointments", "Appointments"],
          ["queue", "My queue"],
          ["my-prescriptions", "Prescriptions"],
          ["profile", "Profile"],
        ];

  return (
    <main
      className={
        page === "dashboard" ? "app-shell dashboard-shell" : "app-shell"
      }
    >
      <header className="topbar">
        <button
          type="button"
          className="brand brand-button"
          onClick={() => setPage("clinics")}
        >
          <span className="brand-mark">H</span>
          <span>
            <strong>healio</strong>
            <small>care, made clearer</small>
          </span>
        </button>
        <nav className="dashboard-top-nav">
          {links.slice(0, 5).map(([id, label]) => (
            <button
              type="button"
              className={page === id ? "active" : ""}
              key={`${id}-${label}`}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="identity-switch">
          <span>Viewing as</span>
          <button
            type="button"
            className={identity === "patient" ? "active" : ""}
            onClick={() => setIdentity("patient")}
          >
            Patient
          </button>
          <button
            type="button"
            className={identity === "clinic" ? "active" : ""}
            onClick={() => setIdentity("clinic")}
          >
            Clinic admin
          </button>
        </div>
        <button type="button" className="logout-button" onClick={logout}>
          Sign out
        </button>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <p className="eyebrow">
            {identity === "clinic" ? "Clinic workspace" : identity === "doctor" ? "Doctor workspace" : "Patient space"}
          </p>
          {links.map(([id, label], index) => (
            <button
              type="button"
              key={`${id}-${label}`}
              className={
                page === id && (label !== "Doctors" || page === "clinic-admin")
                  ? "nav-item selected"
                  : "nav-item"
              }
              onClick={() => setPage(id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </button>
          ))}
          <div className="sidebar-note">
            <span className="dot live" /> Live queue updates
          </div>
          {identity === "patient" && (
            <button
              type="button"
              className="admin-link"
              onClick={() => setIdentity("clinic")}
            >
              Clinic admin login <span>↗</span>
            </button>
          )}
        </aside>
        <section className="content">{children}</section>
      </div>
    </main>
  );
}

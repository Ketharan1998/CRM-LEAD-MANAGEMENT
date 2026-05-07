import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("crm_current_user")) || {
    name: "Admin User",
    email: "admin@example.com",
    role: "Sales Manager",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("crm_current_user");
    navigate("/login");
  };

  const getNavClass = ({ isActive }) =>
    `crm-sidebar-link d-flex align-items-center text-decoration-none ${
      isActive ? "active" : ""
    }`;

  return (
    <>
      <aside className="crm-sidebar bg-white border-end d-flex flex-column">
        <div className="crm-sidebar-top p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="crm-logo-icon">⚡</div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#4f46e5", fontSize: "0.98rem" }}>
                LeadFlow
              </h5>
              <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                CRM Lead Management
              </small>
            </div>
          </div>
        </div>

        <div className="p-3">
          <NavLink to="/dashboard" className={getNavClass}>
            <i className="bi bi-grid me-3"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/leads" className={getNavClass}>
            <i className="bi bi-people me-3"></i>
            <span>Leads</span>
          </NavLink>

          <NavLink to="/pipeline" className={getNavClass}>
            <i className="bi bi-diagram-3 me-3"></i>
            <span>Pipeline</span>
          </NavLink>

          <NavLink to="/lead-notes" className={getNavClass}>
            <i className="bi bi-journal-text me-3"></i>
            <span>Lead Notes</span>
          </NavLink>
        </div>

        <div className="px-3 pb-2">
          <button
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>

        <div className="mt-auto p-3 border-top">
          <div className="crm-user-card mb-2">
            <div className="d-flex align-items-center gap-2">
              <div className="crm-user-avatar">
                {(currentUser.name || "A").slice(0, 1).toUpperCase()}
              </div>

              <div className="flex-grow-1">
                <div className="fw-semibold text-truncate" style={{ fontSize: "0.88rem" }}>
                  {currentUser.name}
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: "0.74rem" }}>
                  {currentUser.email}
                </div>
                <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 991.98px) {
          .crm-sidebar {
            width: 100%;
            min-height: auto;
            position: relative;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;
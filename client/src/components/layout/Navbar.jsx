import { useNavigate } from "react-router-dom";

function Navbar() {
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

  return (
    <nav className="crm-navbar navbar navbar-expand-lg navbar-light bg-white">
      <div className="container-fluid px-3">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            <h5 className="mb-0" style={{ color: "#1f2937", fontWeight: "600" }}>
              Welcome, {currentUser.name}
            </h5>
            <small className="text-muted ms-2">({currentUser.role})</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted">{currentUser.email}</small>
            </div>

            <div className="dropdown">
              <button
                className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: "30px", height: "30px" }}
              >
                <i className="bi bi-person-fill"></i>
              </button>

              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <a className="dropdown-item" href="#profile">
                    <i className="bi bi-person me-2"></i>
                    My Profile
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#settings">
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                    style={{ border: "none", background: "none", cursor: "pointer" }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

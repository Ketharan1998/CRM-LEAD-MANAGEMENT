import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="d-flex bg-light min-vh-100" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-grow-1 d-flex flex-column crm-main-area">
        <Navbar />

        <main className="crm-content flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
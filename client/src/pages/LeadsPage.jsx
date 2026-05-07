import { useEffect, useMemo, useRef, useState } from "react";
import { createLead, deleteLead, fetchLeads, updateLead } from "../api/leadApi";

const defaultLead = {
  leadName: "",
  companyName: "",
  email: "",
  phone: "",
  leadSource: "Website",
  assignedSalesperson: "Admin User",
  status: "New",
  estimatedDealValue: "",
};

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [salesFilter, setSalesFilter] = useState("");
  const [formData, setFormData] = useState(defaultLead);
  const [editingId, setEditingId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const popupTimerRef = useRef(null);
  const pendingActionRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    const loadLeads = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchLeads();

        if (isActive) {
          setLeads(data);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Server error while fetching leads");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadLeads();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        window.clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        (lead.leadName || "").toLowerCase().includes(search.toLowerCase()) ||
        (lead.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
        (lead.email || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter ? lead.status === statusFilter : true;
      const matchesSource = sourceFilter ? lead.leadSource === sourceFilter : true;
      const matchesSales = salesFilter
        ? lead.assignedSalesperson === salesFilter
        : true;

      return matchesSearch && matchesStatus && matchesSource && matchesSales;
    });
  }, [leads, search, statusFilter, sourceFilter, salesFilter]);

  const uniqueSources = [...new Set(leads.map((lead) => lead.leadSource).filter(Boolean))];
  const uniqueSalespersons = [
    ...new Set(leads.map((lead) => lead.assignedSalesperson).filter(Boolean)),
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return "bg-primary-subtle text-primary";
      case "Contacted":
        return "bg-warning-subtle text-warning-emphasis";
      case "Qualified":
        return "bg-success-subtle text-success";
      case "Proposal Sent":
        return "bg-info-subtle text-info-emphasis";
      case "Won":
        return "bg-success-subtle text-success-emphasis";
      case "Lost":
        return "bg-danger-subtle text-danger";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const resetForm = () => {
    setFormData(defaultLead);
    setEditingId(null);
  };

  const showSuccessFeedback = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);

    if (popupTimerRef.current) {
      window.clearTimeout(popupTimerRef.current);
    }

    popupTimerRef.current = window.setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2200);
  };

  const closeConfirmPopup = () => {
    setShowConfirmPopup(false);
    setConfirmAction(null);
    pendingActionRef.current = null;
  };

  const openConfirmPopup = (action) => {
    setConfirmAction(action);
    pendingActionRef.current = action;
    setShowConfirmPopup(true);
  };

  const closeLeadModal = () => {
    setShowModal(false);
  };

  const commitAction = async () => {
    const action = pendingActionRef.current;
    if (!action) return;

    setError("");

    try {
      if (action.type === "update") {
        const updatedLead = await updateLead(action.id, action.payload);

        setLeads((currentLeads) =>
          currentLeads.map((lead) => (lead.id === action.id ? updatedLead : lead))
        );
        closeConfirmPopup();
        closeLeadModal();
        resetForm();
        showSuccessFeedback("Lead updated successfully!");
        return;
      }

      if (action.type === "delete") {
        await deleteLead(action.id);
        setLeads((currentLeads) => currentLeads.filter((lead) => lead.id !== action.id));
        closeConfirmPopup();
        showSuccessFeedback("Lead deleted successfully!");
      }
    } catch (actionError) {
      setError(actionError.message || "Failed to update lead data");
      closeConfirmPopup();
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (editingId) {
      openConfirmPopup({
        type: "update",
        id: editingId,
        payload: { ...formData },
      });
      return;
    }

    try {
      const newLead = await createLead(formData);
      setLeads((currentLeads) => [newLead, ...currentLeads]);
      showSuccessFeedback("Lead added successfully!");
      resetForm();
      closeLeadModal();
    } catch (submitError) {
      setError(submitError.message || "Failed to add lead");
    }
  };

  const handleEdit = (lead) => {
    setFormData({
      leadName: lead.leadName || "",
      companyName: lead.companyName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      leadSource: lead.leadSource || "Website",
      assignedSalesperson: lead.assignedSalesperson || "Admin User",
      status: lead.status || "New",
      estimatedDealValue: lead.estimatedDealValue || "",
    });
    setEditingId(lead.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    openConfirmPopup({ type: "delete", id });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div
      className="bg-light min-vh-100"
      style={{ fontFamily: '"Segoe UI", system-ui, sans-serif', minHeight: "100vh" }}
    >
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
              All Leads ({filteredLeads.length})
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.84rem" }}>
              Manage, track, and update your sales leads
            </p>
          </div>

          {error && <div className="alert alert-danger py-2 mb-0 w-100">{error}</div>}

          <button
            className="btn text-white d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "#4f46e5" }}
            onClick={openAddModal}
          >
            <i className="bi bi-plus-lg"></i>
            Add Lead
          </button>
        </div>

        <div
          className="card border-0 mb-4"
          style={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
        >
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small text-muted">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name, company, email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small text-muted">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small text-muted">Lead Source</label>
                <select
                  className="form-select"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="">All Sources</option>
                  {uniqueSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small text-muted">Salesperson</label>
                <select
                  className="form-select"
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                >
                  <option value="">All Salespersons</option>
                  {uniqueSalespersons.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div
          className="card border-0"
          style={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
        >
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Lead</th>
                    <th>Contact</th>
                    <th>Source</th>
                    <th>Salesperson</th>
                    <th>Status</th>
                    <th>Deal Value</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        Loading leads from the database...
                      </td>
                    </tr>
                  ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="fw-semibold">{lead.leadName}</div>
                          <div className="text-muted small">{lead.companyName}</div>
                        </td>
                        <td>
                          <div>{lead.email}</div>
                          <div className="text-muted small">{lead.phone}</div>
                        </td>
                        <td>{lead.leadSource}</td>
                        <td>{lead.assignedSalesperson}</td>
                        <td>
                          <span className={`badge rounded-pill ${getStatusBadge(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td>
                          ${Number(lead.estimatedDealValue || 0).toLocaleString()}
                        </td>
                        <td>
                          {lead.createdDate
                            ? new Date(lead.createdDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-light border me-2"
                            onClick={() => handleEdit(lead)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light border text-danger"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No leads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showConfirmPopup && (
        <div className="lead-confirm-overlay" role="dialog" aria-modal="true">
          <div className="lead-confirm-popup">
            <div className="lead-confirm-popup__icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h5 className="lead-confirm-popup__title">Are you sure?</h5>
            <p className="lead-confirm-popup__message">
              {confirmAction?.type === "delete"
                ? "Do you want to delete this lead?"
                : "Do you want to update this lead?"}
            </p>
            <div className="lead-confirm-popup__actions">
              <button type="button" className="btn btn-light border" onClick={closeConfirmPopup}>
                No
              </button>
              <button
                type="button"
                className="btn text-white"
                style={{ backgroundColor: "#4f46e5" }}
                onClick={commitAction}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="lead-success-popup-wrap" aria-live="polite" aria-atomic="true">
          <div className="lead-success-popup">
            <div className="lead-success-popup__icon">
              <i className="bi bi-check-lg"></i>
            </div>
            <div>
              <div className="lead-success-popup__title">Success</div>
              <div className="lead-success-popup__message">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lead-success-popup-wrap {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1060;
          pointer-events: none;
        }

        .lead-success-popup {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 280px;
          padding: 14px 18px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
          border: 1px solid rgba(16, 185, 129, 0.18);
          animation: leadSuccessPopupIn 280ms ease-out, leadSuccessPopupOut 220ms ease-in 2s forwards;
          backdrop-filter: blur(10px);
        }

        .lead-success-popup__icon {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: #fff;
          font-size: 1.15rem;
          flex-shrink: 0;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.28);
          animation: leadSuccessTick 420ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
        }

        .lead-success-popup__title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #059669;
          margin-bottom: 2px;
        }

        .lead-success-popup__message {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
        }

        @keyframes leadSuccessPopupIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes leadSuccessPopupOut {
          to {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
        }

        @keyframes leadSuccessTick {
          0% {
            transform: scale(0.5) rotate(-12deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.08) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @media (max-width: 575.98px) {
          .lead-success-popup-wrap {
            width: calc(100vw - 24px);
            left: 12px;
            transform: translateY(-50%);
          }

          .lead-success-popup {
            min-width: unset;
            width: 100%;
          }
        }

        .lead-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.52);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1070;
          padding: 16px;
        }

        .lead-confirm-popup {
          width: min(92vw, 380px);
          background: rgba(255, 255, 255, 0.98);
          border-radius: 18px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
          border: 1px solid rgba(148, 163, 184, 0.2);
          animation: leadConfirmIn 180ms ease-out;
        }

        .lead-confirm-popup__icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 14px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          font-size: 1.2rem;
        }

        .lead-confirm-popup__title {
          margin: 0 0 8px;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .lead-confirm-popup__message {
          margin: 0 0 18px;
          color: #475569;
          font-size: 0.95rem;
        }

        .lead-confirm-popup__actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        @keyframes leadConfirmIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {showModal && <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1040 }}></div>}
      <div 
        className={`modal fade ${showModal ? 'show d-block' : ''}`} 
        id="leadModal" 
        tabIndex="-1" 
        aria-hidden={!showModal}
        style={{ display: showModal ? 'block' : 'none', position: 'fixed', top: 0, left: 0, zIndex: 1050, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" style={{ pointerEvents: 'auto' }}>
          <div
            className="modal-content border-0"
            style={{ borderRadius: "14px" }}
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {editingId ? "Edit Lead" : "Add New Lead"}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => {
                  closeLeadModal();
                  resetForm();
                }}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Lead Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="leadName"
                      value={formData.leadName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Lead Source</label>
                    <select
                      className="form-select"
                      name="leadSource"
                      value={formData.leadSource}
                      onChange={handleChange}
                    >
                      <option value="Website">Website</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Email">Cold Email</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Assigned Salesperson</label>
                    <input
                      type="text"
                      className="form-control"
                      name="assignedSalesperson"
                      value={formData.assignedSalesperson}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Estimated Deal Value</label>
                    <input
                      type="number"
                      className="form-control"
                      name="estimatedDealValue"
                      value={formData.estimatedDealValue}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => {
                    closeLeadModal();
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ backgroundColor: "#4f46e5" }}
                >
                  {editingId ? "Update Lead" : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadsPage;
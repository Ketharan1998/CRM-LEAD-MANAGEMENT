import { useEffect, useMemo, useState } from "react";
import { fetchLeads, updateLead } from "../api/leadApi";

const pipelineStages = [
  { key: "New", color: "#2563eb", light: "#dbeafe", icon: "bi-stars" },
  { key: "Contacted", color: "#d97706", light: "#fef3c7", icon: "bi-telephone" },
  { key: "Qualified", color: "#16a34a", light: "#dcfce7", icon: "bi-check2-circle" },
  { key: "Proposal Sent", color: "#0891b2", light: "#cffafe", icon: "bi-send-check" },
  { key: "Won", color: "#059669", light: "#d1fae5", icon: "bi-trophy" },
  { key: "Lost", color: "#dc2626", light: "#fee2e2", icon: "bi-x-circle" },
];

function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const updateLeadStatus = async (leadId, newStatus) => {
    const leadToUpdate = leads.find((lead) => lead.id === leadId);

    if (!leadToUpdate) {
      return;
    }

    setError("");

    try {
      const updatedLead = await updateLead(leadId, {
        ...leadToUpdate,
        status: newStatus,
      });

      setLeads((currentLeads) =>
        currentLeads.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update lead stage");
    }
  };

  const groupedLeads = useMemo(() => {
    return pipelineStages.reduce((acc, stage) => {
      acc[stage.key] = leads.filter((lead) => lead.status === stage.key);
      return acc;
    }, {});
  }, [leads]);

  const totalPipelineValue = useMemo(() => {
    return leads
      .filter((lead) => lead.status !== "Lost")
      .reduce((sum, lead) => sum + Number(lead.estimatedDealValue || 0), 0);
  }, [leads]);

  const totalWonValue = useMemo(() => {
    return leads
      .filter((lead) => lead.status === "Won")
      .reduce((sum, lead) => sum + Number(lead.estimatedDealValue || 0), 0);
  }, [leads]);

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

  return (
    <div>
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      {isLoading && <div className="alert alert-info py-2 mb-3">Loading pipeline from the database...</div>}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
            Sales Pipeline
          </h1>
          <p className="text-muted mb-0">
            Track leads visually by stage and update progress across your CRM pipeline.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <div className="card-body py-2 px-3">
              <div className="small text-muted">Pipeline Value</div>
              <div className="fw-bold">{formatCurrency(totalPipelineValue)}</div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <div className="card-body py-2 px-3">
              <div className="small text-muted">Won Revenue</div>
              <div className="fw-bold text-success">{formatCurrency(totalWonValue)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {pipelineStages.map((stage) => (
          <div className="col-6 col-md-4 col-xl-2" key={stage.key}>
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "14px" }}
            >
              <div className="card-body">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: stage.light,
                    color: stage.color,
                  }}
                >
                  <i className={`bi ${stage.icon}`}></i>
                </div>

                <div className="fw-semibold">{stage.key}</div>
                <div className="text-muted small">
                  {groupedLeads[stage.key]?.length || 0} lead(s)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="d-flex gap-3 overflow-auto pb-2"
        style={{ alignItems: "flex-start" }}
      >
        {pipelineStages.map((stage) => {
          const stageLeads = groupedLeads[stage.key] || [];

          return (
            <div
              key={stage.key}
              className="flex-shrink-0"
              style={{ width: "320px" }}
            >
              <div
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: "16px",
                  backgroundColor: "#f8fafc",
                  minHeight: "580px",
                }}
              >
                <div
                  className="card-header border-0 d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: stage.light,
                    color: stage.color,
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 fw-semibold">
                    <i className={`bi ${stage.icon}`}></i>
                    <span>{stage.key}</span>
                  </div>
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: stage.color, color: "#fff" }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                <div className="card-body">
                  {stageLeads.length > 0 ? (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="card border-0 shadow-sm mb-3"
                        style={{ borderRadius: "14px" }}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="fw-semibold">{lead.leadName}</div>
                              <div className="text-muted small">{lead.companyName}</div>
                            </div>

                            <span
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: stage.light,
                                color: stage.color,
                              }}
                            >
                              {lead.status}
                            </span>
                          </div>

                          <div className="small text-muted mb-2">
                            <i className="bi bi-envelope me-2"></i>
                            {lead.email}
                          </div>

                          <div className="small text-muted mb-2">
                            <i className="bi bi-telephone me-2"></i>
                            {lead.phone}
                          </div>

                          <div className="small text-muted mb-2">
                            <i className="bi bi-megaphone me-2"></i>
                            {lead.leadSource}
                          </div>

                          <div className="small text-muted mb-3">
                            <i className="bi bi-person-badge me-2"></i>
                            {lead.assignedSalesperson}
                          </div>

                          <div
                            className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3"
                            style={{ backgroundColor: "#f8fafc" }}
                          >
                            <span className="small text-muted">Deal Value</span>
                            <span className="fw-bold">
                              {formatCurrency(lead.estimatedDealValue)}
                            </span>
                          </div>

                          <div className="mb-2">
                            <label className="form-label small fw-semibold mb-1">
                              Update Stage
                            </label>
                            <select
                              className="form-select form-select-sm"
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            >
                              {pipelineStages.map((item) => (
                                <option key={item.key} value={item.key}>
                                  {item.key}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="small text-muted mt-3">
                            Created: {new Date(lead.createdDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "56px",
                          height: "56px",
                          backgroundColor: stage.light,
                          color: stage.color,
                        }}
                      >
                        <i className={`bi ${stage.icon}`}></i>
                      </div>
                      <h6 className="fw-semibold mb-1">No leads in {stage.key}</h6>
                      <p className="text-muted small mb-0">
                        Leads moved to this stage will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelinePage;
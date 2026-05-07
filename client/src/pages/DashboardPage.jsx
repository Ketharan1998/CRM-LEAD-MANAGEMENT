import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLeads } from "../api/leadApi";

function DashboardPage() {
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

  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "New").length;
    const qualifiedLeads = leads.filter((lead) => lead.status === "Qualified").length;
    const wonLeads = leads.filter((lead) => lead.status === "Won").length;
    const lostLeads = leads.filter((lead) => lead.status === "Lost").length;

    const totalEstimatedDealValue = leads.reduce(
      (sum, lead) => sum + Number(lead.estimatedDealValue || 0),
      0
    );

    const totalWonDealValue = leads
      .filter((lead) => lead.status === "Won")
      .reduce((sum, lead) => sum + Number(lead.estimatedDealValue || 0), 0);

    const statusCounts = {
      New: leads.filter((lead) => lead.status === "New").length,
      Contacted: leads.filter((lead) => lead.status === "Contacted").length,
      Qualified: leads.filter((lead) => lead.status === "Qualified").length,
      "Proposal Sent": leads.filter((lead) => lead.status === "Proposal Sent").length,
      Won: leads.filter((lead) => lead.status === "Won").length,
      Lost: leads.filter((lead) => lead.status === "Lost").length,
    };

    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 5);

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      totalEstimatedDealValue,
      totalWonDealValue,
      statusCounts,
      recentLeads,
    };
  }, [leads]);

  const maxStatusCount = Math.max(...Object.values(metrics.statusCounts), 1);

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

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

  const statCards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads,
      icon: "bi-people",
      bg: "#e0e7ff",
      color: "#4338ca",
      subtitle: "All lead records",
    },
    {
      title: "New Leads",
      value: metrics.newLeads,
      icon: "bi-person-plus",
      bg: "#dbeafe",
      color: "#1d4ed8",
      subtitle: "Fresh opportunities",
    },
    {
      title: "Qualified Leads",
      value: metrics.qualifiedLeads,
      icon: "bi-check2-circle",
      bg: "#dcfce7",
      color: "#15803d",
      subtitle: "High-potential leads",
    },
    {
      title: "Won Leads",
      value: metrics.wonLeads,
      icon: "bi-trophy",
      bg: "#d1fae5",
      color: "#047857",
      subtitle: "Closed successfully",
    },
    {
      title: "Lost Leads",
      value: metrics.lostLeads,
      icon: "bi-x-circle",
      bg: "#fee2e2",
      color: "#b91c1c",
      subtitle: "Not converted",
    },
    {
      title: "Total Deal Value",
      value: formatCurrency(metrics.totalEstimatedDealValue),
      icon: "bi-cash-stack",
      bg: "#ede9fe",
      color: "#6d28d9",
      subtitle: "Estimated pipeline",
    },
    {
      title: "Won Deal Value",
      value: formatCurrency(metrics.totalWonDealValue),
      icon: "bi-graph-up-arrow",
      bg: "#dcfce7",
      color: "#166534",
      subtitle: "Closed revenue",
    },
  ];

  return (
    <div>
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      {isLoading && <div className="alert alert-info py-2 mb-3">Loading leads from the database...</div>}

      <div className="row g-3 mb-3">
        {statCards.map((card) => (
          <div className="col-12 col-sm-6 col-xl" key={card.title}>
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "14px" }}>
              <div className="card-body">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: card.bg,
                    color: card.color,
                  }}
                >
                  <i className={`bi ${card.icon}`}></i>
                </div>

                <div className="text-muted text-uppercase fw-semibold small mb-1">
                  {card.title}
                </div>
                <div className="fw-bold" style={{ fontSize: "1.2rem" }}>
                  {card.value}
                </div>
                <div className="text-muted small mt-1">{card.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "14px" }}>
            <div className="card-body">
              <h5 className="fw-bold mb-3" style={{ fontSize: "1rem" }}>
                Lead Status Breakdown
              </h5>

              {Object.entries(metrics.statusCounts).map(([status, count]) => (
                <div className="mb-3" key={status}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small fw-medium">{status}</span>
                    <span className="small text-muted">{count}</span>
                  </div>

                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(count / maxStatusCount) * 100}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background:
                          status === "New"
                            ? "#2563eb"
                            : status === "Contacted"
                            ? "#d97706"
                            : status === "Qualified"
                            ? "#16a34a"
                            : status === "Proposal Sent"
                            ? "#0891b2"
                            : status === "Won"
                            ? "#059669"
                            : "#dc2626",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "14px" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>
                  Recent Leads
                </h5>
                <Link to="/leads" className="text-decoration-none small fw-semibold">
                  View all
                </Link>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Lead</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Value</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentLeads.length > 0 ? (
                      metrics.recentLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <div className="fw-semibold">{lead.leadName}</div>
                            <div className="text-muted small">{lead.companyName}</div>
                          </td>
                          <td>{lead.leadSource}</td>
                          <td>
                            <span className={`badge rounded-pill ${getStatusBadge(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td>{formatCurrency(lead.estimatedDealValue)}</td>
                          <td>
                            {lead.createdDate ? new Date(lead.createdDate).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No leads found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
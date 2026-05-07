import { useEffect, useMemo, useState } from "react";
import { fetchLeads, fetchLeadNotes, createLeadNote } from "../api/leadApi";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusClass(status) {
  switch (status) {
    case "New":
      return "bg-info-subtle text-info";
    case "Contacted":
      return "bg-warning-subtle text-warning";
    case "Qualified":
      return "bg-primary-subtle text-primary";
    case "Won":
      return "bg-success-subtle text-success";
    default:
      return "bg-secondary-subtle text-secondary";
  }
}

function LeadNotesPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadLeads = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchLeads();

        if (isActive) {
          setLeads(data);
          if (data.length > 0) {
            setSelectedLeadId(data[0].id);
          }
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
    let isActive = true;

    const loadNotes = async () => {
      if (!selectedLeadId) {
        setNotes([]);
        return;
      }

      setError("");

      try {
        const data = await fetchLeadNotes(selectedLeadId);

        if (isActive) {
          setNotes(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Server error while fetching notes");
        }
      }
    };

    loadNotes();

    return () => {
      isActive = false;
    };
  }, [selectedLeadId]);

  const filteredLeads = useMemo(() => {
    return leads.filter(
      (lead) =>
        (lead.leadName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.status || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || null;

  const handleSelectLead = (leadId) => {
    setSelectedLeadId(leadId);
    setNewNote("");
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return;

    setIsAddingNote(true);
    setError("");

    try {
      await createLeadNote(selectedLead.id, newNote.trim());
      setNewNote("");

      const updatedNotes = await fetchLeadNotes(selectedLead.id);
      setNotes(Array.isArray(updatedNotes) ? updatedNotes : []);
    } catch (addError) {
      setError(addError.message || "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4 bg-body text-body min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-body-secondary">Loading leads from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-body text-body min-vh-100">
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-body border-bottom rounded-top-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-1 fw-bold">Lead Notes</h5>
                  <small className="text-body-secondary">Manage notes lead by lead</small>
                </div>
                <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                  {filteredLeads.length}
                </span>
              </div>

              <div className="input-group">
                <span className="input-group-text bg-body border-end-0 rounded-start-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 rounded-end-3 bg-body"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="card-body p-3" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {leads.length === 0 ? (
                <div className="text-center text-body-secondary py-5">
                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                  No leads found
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center text-body-secondary py-5">
                  <i className="bi bi-search fs-3 d-block mb-2"></i>
                  No leads matching search
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => handleSelectLead(lead.id)}
                    className={`w-100 text-start border-0 rounded-4 p-3 mb-3 ${
                      selectedLeadId === lead.id
                        ? "bg-primary-subtle shadow-sm"
                        : "bg-body-tertiary"
                    }`}
                    style={{ cursor: "pointer", transition: "0.2s ease" }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "#0d6efd",
                          fontSize: "15px",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(lead.leadName || "")}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1 fw-semibold">{lead.leadName}</h6>
                            <div className="small text-body-secondary">{lead.companyName}</div>
                          </div>
                          <span className="badge rounded-pill bg-secondary-subtle text-secondary">
                            {notes.length > 0 && selectedLeadId === lead.id ? notes.length : 0}
                          </span>
                        </div>

                        <div className="mt-2">
                          <span
                            className={`badge rounded-pill px-3 py-2 ${getStatusClass(lead.status)}`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            {selectedLead ? (
              <>
                <div className="card-header bg-body border-bottom rounded-top-4 p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                        style={{
                          width: "64px",
                          height: "64px",
                          background: "linear-gradient(135deg, #0d6efd, #3d8bfd)",
                          fontSize: "20px",
                        }}
                      >
                        {getInitials(selectedLead.leadName || "")}
                      </div>

                      <div>
                        <h4 className="mb-1 fw-bold">{selectedLead.leadName}</h4>
                        <div className="text-body-secondary mb-1">{selectedLead.companyName}</div>
                        <div className="small text-body-secondary d-flex flex-wrap gap-3">
                          <span>
                            <i className="bi bi-envelope me-2"></i>
                            {selectedLead.email}
                          </span>
                          <span>
                            <i className="bi bi-telephone me-2"></i>
                            {selectedLead.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span
                        className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                          selectedLead.status
                        )}`}
                      >
                        {selectedLead.status}
                      </span>

                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="btn btn-outline-primary rounded-pill px-3"
                      >
                        <i className="bi bi-telephone-fill me-2"></i>
                        Call
                      </a>

                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="btn btn-outline-primary rounded-pill px-3"
                      >
                        <i className="bi bi-envelope-fill me-2"></i>
                        Email
                      </a>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="card border-0 bg-body-tertiary rounded-4 mb-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-semibold">Add New Note</h5>
                        <span className="text-body-secondary small">Select a lead to manage notes</span>
                      </div>

                      <textarea
                        className="form-control mb-3 bg-body"
                        rows="4"
                        placeholder="Write your note here..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />

                      <button
                        type="button"
                        className="btn btn-primary px-4 rounded-pill"
                        onClick={handleAddNote}
                        disabled={isAddingNote || !newNote.trim()}
                      >
                        {isAddingNote ? "Saving..." : "Add Note"}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold">Note History</h5>
                    <span className="badge rounded-pill bg-secondary-subtle text-secondary">
                      {notes.length}
                    </span>
                  </div>

                  <div className="d-grid gap-3">
                    {notes.length === 0 ? (
                      <div className="text-center text-body-secondary py-5 border rounded-4 bg-body-tertiary">
                        <i className="bi bi-journal-text fs-3 d-block mb-2"></i>
                        No notes yet for this lead.
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="card border-0 shadow-sm rounded-4">
                          <div className="card-body p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div className="d-flex gap-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                                    flexShrink: 0,
                                  }}
                                >
                                  N
                                </div>
                                <div>
                                  <div className="fw-semibold mb-1">Note</div>
                                  <p className="mb-2 text-body-secondary">{note.note_content}</p>
                                </div>
                              </div>
                              <span className="text-body-secondary small text-nowrap">
                                {formatDate(note.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="card-body d-flex align-items-center justify-content-center min-vh-50">
                <div className="text-center text-body-secondary py-5">
                  <i className="bi bi-person-lines-fill fs-1 d-block mb-3"></i>
                  <h5 className="fw-semibold mb-2">No lead selected</h5>
                  <p className="mb-0">Choose a lead from the left panel to view and add notes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadNotesPage;
const API_BASE_URL = "http://localhost:5000/api/leads";
const LEAD_NOTES_API_BASE_URL = "http://localhost:5000/api/lead-notes";

const getAuthToken = () => localStorage.getItem("token");

const buildHeaders = (includeJson = false) => {
	const headers = {};

	if (includeJson) {
		headers["Content-Type"] = "application/json";
	}

	const token = getAuthToken();

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	return headers;
};

const normalizeLead = (lead = {}) => ({
	id: lead.id,
	leadName: lead.leadName ?? lead.lead_name ?? "",
	companyName: lead.companyName ?? lead.company_name ?? "",
	email: lead.email ?? "",
	phone: lead.phone ?? "",
	leadSource: lead.leadSource ?? lead.lead_source ?? "Website",
	assignedSalesperson:
		lead.assignedSalesperson ?? lead.assigned_salesperson ?? "Admin User",
	status: lead.status ?? "New",
	estimatedDealValue:
		lead.estimatedDealValue ?? lead.estimated_deal_value ?? "",
	createdDate: lead.createdDate ?? lead.created_at ?? null,
	lastUpdatedDate: lead.lastUpdatedDate ?? lead.updated_at ?? lead.created_at ?? null,
	notes: Array.isArray(lead.notes) ? lead.notes : [],
});

const normalizeLeadList = (leads = []) => leads.map(normalizeLead);

const toApiPayload = (lead) => ({
	lead_name: lead.leadName ?? lead.lead_name ?? "",
	company_name: lead.companyName ?? lead.company_name ?? "",
	email: lead.email ?? "",
	phone: lead.phone ?? "",
	lead_source: lead.leadSource ?? lead.lead_source ?? "Website",
	assigned_salesperson:
		lead.assignedSalesperson ?? lead.assigned_salesperson ?? "Admin User",
	status: lead.status ?? "New",
	estimated_deal_value:
		lead.estimatedDealValue ?? lead.estimated_deal_value ?? "",
});

const requestJson = async (url, options = {}) => {
	const response = await fetch(url, options);
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}

	return data;
};

export const fetchLeads = async () => {
	const data = await requestJson(API_BASE_URL, {
		headers: buildHeaders(),
	});

	return normalizeLeadList(Array.isArray(data) ? data : []);
};

export const fetchLeadById = async (id) => {
	const data = await requestJson(`${API_BASE_URL}/${id}`, {
		headers: buildHeaders(),
	});

	return normalizeLead(data);
};

export const createLead = async (lead) => {
	const data = await requestJson(API_BASE_URL, {
		method: "POST",
		headers: buildHeaders(true),
		body: JSON.stringify(toApiPayload(lead)),
	});

	if (data?.id) {
		return fetchLeadById(data.id);
	}

	return normalizeLead(lead);
};

export const updateLead = async (id, lead) => {
	const data = await requestJson(`${API_BASE_URL}/${id}`, {
		method: "PUT",
		headers: buildHeaders(true),
		body: JSON.stringify(toApiPayload(lead)),
	});

	return normalizeLead(data);
};

export const deleteLead = async (id) => {
	await requestJson(`${API_BASE_URL}/${id}`, {
		method: "DELETE",
		headers: buildHeaders(),
	});
};

export const fetchLeadNotes = async (leadId) => {
	const data = await requestJson(`${LEAD_NOTES_API_BASE_URL}/${leadId}`, {
		headers: buildHeaders(),
	});

	return Array.isArray(data) ? data : [];
};

export const createLeadNote = async (leadId, noteContent) => {
	return requestJson(LEAD_NOTES_API_BASE_URL, {
		method: "POST",
		headers: buildHeaders(true),
		body: JSON.stringify({
			lead_id: leadId,
			user_id: null,
			note_content: noteContent,
		}),
	});
};


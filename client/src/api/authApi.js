const API_BASE_URL = "http://localhost:5000/api/auth";

const requestJson = async (url, options = {}) => {
	const response = await fetch(url, options);
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}

	return data;
};

export const login = async ({ email, password }) => {
	return requestJson(`${API_BASE_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});
};
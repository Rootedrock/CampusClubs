/*
 * CampusClubs API connector
 *
 * LOCAL:
 *   http://localhost:4000
 *
 * AFTER DEPLOYING THE BACKEND TO RENDER:
 *   Replace API_BASE_URL with your Render URL, for example:
 *   https://campusclubs-backend.onrender.com
 */
const API_BASE_URL = "http://localhost:4000";

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    let data = {};
    try {
        data = await response.json();
    } catch {
        // Some responses, such as HTTP 204, have no JSON body.
    }

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}

async function getClubs({ search = "", category = "" } = {}) {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (category && category !== "all") params.set("category", category);

    const query = params.toString();
    return apiRequest(`/api/clubs${query ? `?${query}` : ""}`);
}

async function getClubOfTheMonth() {
    return apiRequest("/api/clubs/club-of-the-month");
}

async function getStats() {
    return apiRequest("/api/clubs/stats");
}

async function submitSuggestion(payload) {
    return apiRequest("/api/suggestions", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

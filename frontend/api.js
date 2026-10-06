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
const API_BASE_URL = "https://campusclubs-w3gp.onrender.com";

async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let response;
    try {
    response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options,
        signal: controller.signal
    });
    } finally {
        window.clearTimeout(timeout);
    }

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
    const data = await apiRequest(`/api/clubs${query ? `?${query}` : ""}`);
    if (!query) {
        try { localStorage.setItem("campusclubs.clubs", JSON.stringify(data.clubs || [])); } catch { /* storage may be unavailable */ }
    }
    return data;
}

function getCachedClubs() {
    try { return JSON.parse(localStorage.getItem("campusclubs.clubs") || "null"); }
    catch { return null; }
}

async function getClub(id) {
    return apiRequest(`/api/clubs/${encodeURIComponent(id)}`);
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

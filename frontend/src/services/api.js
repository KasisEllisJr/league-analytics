const API_BASE_URL = "/api";

async function fetchData(endpoint) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error(
      "Unable to reach the API server. Check that the backend is running."
    );
  }

  if (!response.ok) {
    const messages = {
      400: "Invalid request parameters.",
      404: "The requested resource was not found.",
      500: "The server encountered an error.",
      502: "The API service is temporarily unavailable.",
      503: "The API service is temporarily unavailable.",
      504: "The API service is temporarily unavailable.",
    };

    const error = new Error(
      messages[response.status] ??
        `Request failed with HTTP status ${response.status}.`
    );

    error.status = response.status;

    throw error;
  }

  return response.json();
}

// Champion API
export const championApi = {
  getCount: () => fetchData("/champions/count"),

  getAll: () => fetchData("/champions"),

  getById: (id) =>
    fetchData(`/champions/${id}`),

  search: (name) =>
    fetchData(
      `/champions/search?name=${encodeURIComponent(name)}`
    ),
};

// Item API
export const itemApi = {
  getCount: () => fetchData("/items/count"),

  getAll: () => fetchData("/items"),

  getById: (id) =>
    fetchData(`/items/${id}`),

  search: (name) =>
    fetchData(
      `/items/search?name=${encodeURIComponent(name)}`
    ),

  getRecipes: (id) =>
    fetchData(`/items/${id}/recipes`),

  getEffects: (id) =>
    fetchData(`/items/${id}/effects`),
};

// Analytics API
export const analyticsApi = {
  getTopHealth: (limit = 10) =>
    fetchData(
      `/analytics/champions/top-health?limit=${limit}`
    ),

  getTopArmor: (limit = 10) =>
    fetchData(
      `/analytics/champions/top-armor?limit=${limit}`
    ),

  getChampionAtLevel: (id, level) =>
    fetchData(
      `/analytics/champions/${id}/level/${level}`
    ),

  compareItems: (firstId, secondId) =>
    fetchData(
      `/analytics/items/compare?ids=${firstId},${secondId}`
    ),
};
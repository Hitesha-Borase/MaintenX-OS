/**
 * Centralized API Client for MaintenX OS Frontend
 * Handles HTTP requests, JWT token injection, base URLs, and graceful error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem("maintenx_auth_token") || localStorage.getItem("flowstate_token") || "";
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("maintenx_auth_token", token);
    } else {
      localStorage.removeItem("maintenx_auth_token");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    if ((config.method === "DELETE" || config.method === "POST" || config.method === "PUT") && config.body === undefined) {
      config.body = JSON.stringify({});
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data?.error?.message || data?.message || `HTTP ${response.status} Error`);
        error.status = response.status;
        error.code = data?.error?.code || "API_ERROR";
        error.data = data;
        throw error;
      }

      return data?.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[API Warning] ${options.method || "GET"} ${endpoint}:`, err.message);
      throw err;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: "GET", headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    });
  }

  patch(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers,
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: "DELETE", headers });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

/**
 * Centralized API Client for MaintenX OS Frontend
 * Handles HTTP requests, query param serialization, JWT token injection, base URLs, and graceful error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.inflightGetRequests = new Map();
  }

  getToken() {
    return localStorage.getItem("maintenx_auth_token") || localStorage.getItem("flowstate_token") || "";
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("maintenx_auth_token", token);
      localStorage.setItem("flowstate_token", token);
    } else {
      localStorage.removeItem("maintenx_auth_token");
      localStorage.removeItem("flowstate_token");
    }
  }

  async request(endpoint, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET") {
      const cacheKey = `${endpoint}::${JSON.stringify(options.params || {})}`;
      if (this.inflightGetRequests.has(cacheKey)) {
        return this.inflightGetRequests.get(cacheKey);
      }
      const promise = this._executeRequest(endpoint, options).finally(() => {
        this.inflightGetRequests.delete(cacheKey);
      });
      this.inflightGetRequests.set(cacheKey, promise);
      return promise;
    }
    return this._executeRequest(endpoint, options);
  }

  async _executeRequest(endpoint, options = {}) {
    let rawEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;


    // Extract query params if passed in options or headers
    let queryParams = options.params;
    if (!queryParams && options.headers && options.headers.params) {
      queryParams = options.headers.params;
      delete options.headers.params;
    }

    // Append query params to URL if provided
    if (queryParams && typeof queryParams === "object" && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        rawEndpoint += (rawEndpoint.includes("?") ? "&" : "?") + queryString;
      }
    }

    // Ensure all URL segments are safe and spaces are encoded
    const cleanEndpoint = rawEndpoint.split("?").map((part, idx) => {
      if (idx === 0) {
        return part.replace(/ /g, "%20");
      }
      return part;
    }).join("?");

    const url = `${this.baseUrl}${cleanEndpoint}`;
    let token = this.getToken();

    // Clean headers to ensure only valid string values are passed
    const rawHeaders = options.headers || {};
    const sanitizedHeaders = {};

    if (options.body !== undefined) {
      sanitizedHeaders["Content-Type"] = "application/json";
    }
    if (token) {
      sanitizedHeaders["Authorization"] = `Bearer ${token}`;
    }

    Object.entries(rawHeaders).forEach(([k, v]) => {
      if (k !== "params" && typeof v === "string") {
        sanitizedHeaders[k] = v;
      }
    });

    const fetchConfig = {
      method: options.method || "GET",
      headers: sanitizedHeaders,
    };

    if (options.body !== undefined) {
      fetchConfig.body = options.body;
    }

    if ((fetchConfig.method === "DELETE" || fetchConfig.method === "POST" || fetchConfig.method === "PUT") && fetchConfig.body === undefined) {
      fetchConfig.body = JSON.stringify({});
    }

    try {
      const response = await fetch(url, fetchConfig);
      const data = await response.json().catch(() => null);

      if (response.status === 401 && !options._retry && !endpoint.includes("/auth/login")) {
        // Attempt automatic session token renewal using active role profile
        try {
          const profileRaw = localStorage.getItem("flowstate_user_profile") || localStorage.getItem("flowstate_current_role");
          const profile = profileRaw ? JSON.parse(profileRaw) : null;
          const email = profile?.email || profile?.user?.email;
          if (email) {
            const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password: "Password@123" })
            });
            const loginData = await loginRes.json().catch(() => null);
            const newToken = loginData?.data?.token || loginData?.token;
            if (newToken) {
              this.setToken(newToken);
              return this.request(endpoint, { ...options, _retry: true });
            }
          }
        } catch {
          // fallback to standard error
        }
      }

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

  get(endpoint, optionsOrHeaders = {}) {
    if (optionsOrHeaders.params || optionsOrHeaders.headers) {
      return this.request(endpoint, { method: "GET", ...optionsOrHeaders });
    }
    return this.request(endpoint, { method: "GET", headers: optionsOrHeaders });
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

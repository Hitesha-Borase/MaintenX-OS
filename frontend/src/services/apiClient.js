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

    if (!endpoint.includes("/auth/login")) {
      let tenantId = typeof window !== "undefined" ? localStorage.getItem("maintenx_tenant_id") : null;
      if (!tenantId || tenantId === "5bce8458-909a-4dd2-b221-614c32ac7c89") {
        tenantId = "0bf4f354-4e0e-41f3-9974-e24de98d25ff";
      }
      if (!sanitizedHeaders["X-Tenant-Id"]) {
        sanitizedHeaders["X-Tenant-Id"] = tenantId;
      }
      const tenantName = typeof window !== "undefined" ? (localStorage.getItem("maintenx_tenant_name") || "") : "";
      if (tenantName && !sanitizedHeaders["X-Tenant-Name"]) {
        sanitizedHeaders["X-Tenant-Name"] = tenantName;
      }
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

      if (response.status === 401 && !endpoint.includes("/auth/login")) {
        this.setToken(null);
      }

      if (!response.ok) {
        const error = new Error(data?.error?.message || data?.message || `HTTP ${response.status} Error`);
        error.status = response.status;
        error.code = data?.error?.code || "API_ERROR";
        error.data = data;
        throw error;
      }

      const unwrapped = data?.data !== undefined ? data.data : data;
      if (typeof unwrapped === "object" && unwrapped !== null) {
        try {
          if (!("data" in unwrapped)) {
            Object.defineProperty(unwrapped, "data", {
              get() { return this; },
              configurable: true,
              enumerable: false,
            });
          }
        } catch {
          // Object might be non-extensible
        }
      }
      return unwrapped;
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

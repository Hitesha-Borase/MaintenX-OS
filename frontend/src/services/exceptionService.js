import apiClient from "./apiClient";

export const exceptionService = {
  async getExceptions(params = {}) {
    const query = new URLSearchParams();
    if (params.plantId) query.append("plantId", params.plantId);
    if (params.severity && params.severity !== "ALL") query.append("severity", params.severity);
    if (params.category && params.category !== "ALL") query.append("category", params.category);
    const qs = query.toString();
    return apiClient.get(`/exceptions${qs ? `?${qs}` : ""}`);
  },

  async getException(id) {
    return apiClient.get(`/exceptions/${id}`);
  },

  async createException(data) {
    return apiClient.post("/exceptions", data);
  },

  async assignException(id, data) {
    return apiClient.patch(`/exceptions/${id}/assign`, data);
  },

  async resolveException(id, data) {
    return apiClient.patch(`/exceptions/${id}/resolve`, data);
  },
};

export default exceptionService;

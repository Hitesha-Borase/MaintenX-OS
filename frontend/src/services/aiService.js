import apiClient from "./apiClient";

export const aiService = {
  async getInsights() {
    return apiClient.get("/ai/insights");
  },

  async approveInsight(id) {
    return apiClient.post(`/ai/insights/${id}/approve`);
  },

  async rejectInsight(id) {
    return apiClient.post(`/ai/insights/${id}/reject`);
  },

  async chat(query) {
    return apiClient.post("/ai/chat", { query });
  },
};

export default aiService;

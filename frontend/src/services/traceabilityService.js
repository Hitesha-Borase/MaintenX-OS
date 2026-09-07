import apiClient from "./apiClient";

export const traceabilityService = {
  async getGenealogy(lotNumber) {
    return apiClient.get(`/traceability/genealogy/${encodeURIComponent(lotNumber)}`);
  },

  async simulateRecall(lotNumber) {
    return apiClient.post("/traceability/recall/simulate", { lotNumber });
  },
};

export default traceabilityService;

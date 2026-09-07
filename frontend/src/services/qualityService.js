import apiClient from "./apiClient";

export const qualityService = {
  async getCCPChecks(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/quality/ccp${query}`);
  },

  async submitCCPCheck(checkData) {
    return apiClient.post("/quality/ccp", checkData);
  },

  async getReleaseQueue() {
    return apiClient.get("/quality/release/queue");
  },

  async authorizeRelease(releaseData) {
    return apiClient.post("/quality/release/authorize", releaseData);
  },

  async getHolds() {
    return apiClient.get("/quality/holds");
  },

  async placeHold(holdData) {
    return apiClient.post("/quality/holds", holdData);
  },
};

export default qualityService;

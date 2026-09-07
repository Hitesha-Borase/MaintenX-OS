import apiClient from "./apiClient";

export const masterDataService = {
  async getSkus() {
    return apiClient.get("/master-data/skus");
  },

  async createSku(skuData) {
    return apiClient.post("/master-data/skus", skuData);
  },

  async getBoms() {
    return apiClient.get("/master-data/boms");
  },

  async getLines(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/lines${query}`);
  },

  async getWorkCenters(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/work-centers${query}`);
  },

  async getAssets(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/assets${query}`);
  },

  async getStaff(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/staff${query}`);
  },

  async getQualitySpecs() {
    return apiClient.get("/master-data/quality-specs");
  },
};

export default masterDataService;

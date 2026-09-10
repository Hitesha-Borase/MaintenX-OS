import apiClient from "./apiClient";

export const dashboardService = {
  async getCommandCenterOverview(plantId) {
    return apiClient.get(`/dashboards/command-center${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async getKPIs(plantId) {
    return apiClient.get(`/dashboards/kpis${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async getPlantManagerKPIs(plantId) {
    return apiClient.get(`/plant-manager/command-center/kpis${plantId ? `?plantId=${plantId}` : ""}`);
  },
};

export default dashboardService;

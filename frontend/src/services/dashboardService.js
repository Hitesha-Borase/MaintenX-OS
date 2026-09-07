import apiClient from "./apiClient";

export const dashboardService = {
  async getCommandCenterOverview() {
    return apiClient.get("/dashboards/command-center");
  },
};

export default dashboardService;

import apiClient from "./apiClient";

export const planningService = {
  async getDemandOrders() {
    return apiClient.get("/planning/demand/orders");
  },

  async runForecast(forecastParams) {
    return apiClient.post("/planning/forecast/run", forecastParams);
  },

  async getAPSSchedules() {
    return apiClient.get("/planning/aps/schedules");
  },

  async calculateMRP(mrpParams) {
    return apiClient.post("/planning/mrp/net-requirements", mrpParams);
  },
};

export default planningService;

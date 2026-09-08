import apiClient from "./apiClient";

export const planningService = {
  async getDemandOrders() {
    return apiClient.get("/planning/demand/orders");
  },

  async createDemandOrder(orderData) {
    return apiClient.post("/planning/demand/orders", orderData);
  },

  async runForecast(forecastParams) {
    return apiClient.post("/planning/forecast/run", forecastParams);
  },

  async getAPSSchedules() {
    return apiClient.get("/planning/aps/schedules");
  },

  async createApsSchedule(scheduleData) {
    return apiClient.post("/planning/aps/schedules", scheduleData);
  },

  async calculateMRP(mrpParams) {
    return apiClient.post("/planning/mrp/net-requirements", mrpParams);
  },
};

export default planningService;

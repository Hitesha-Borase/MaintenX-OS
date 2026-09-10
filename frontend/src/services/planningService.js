import apiClient from "./apiClient";

export const planningService = {
  async getDemandOrders() {
    return apiClient.get("/planning/demand/orders");
  },

  async createDemandOrder(orderData) {
    return apiClient.post("/planning/demand/orders", orderData);
  },

  async updateDemandOrder(id, orderData) {
    return apiClient.put(`/planning/demand/orders/${id}`, orderData);
  },

  async deleteDemandOrder(id) {
    return apiClient.delete(`/planning/demand/orders/${id}`);
  },

  async runForecast(forecastParams) {
    return apiClient.post("/planning/forecast/run", forecastParams);
  },

  async getForecasts() {
    return apiClient.get("/planning/forecasts");
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

  async getPromotions() {
    return apiClient.get("/planning/promotions");
  },

  async createPromotion(promoData) {
    return apiClient.post("/planning/promotions", promoData);
  },

  async updatePromotion(id, promoData) {
    return apiClient.put(`/planning/promotions/${id}`, promoData);
  },

  async deletePromotion(id) {
    return apiClient.delete(`/planning/promotions/${id}`);
  },
};

export default planningService;

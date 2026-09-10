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

  // --- Plant Manager Master Production Schedule (MPS) ---
  async getSchedules(plantId) {
    return apiClient.get(`/planning/schedule${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async createSchedule(scheduleData) {
    return apiClient.post("/planning/schedule", scheduleData);
  },

  async toggleScheduleLock(id, locked) {
    return apiClient.patch(`/planning/schedule/${id}/lock`, { locked });
  },

  async deleteSchedule(id) {
    return apiClient.delete(`/planning/schedule/${id}`);
  },

  // --- Capacity & Constraints ---
  async getCapacity(plantId) {
    return apiClient.get(`/planning/capacity${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async getConstraints(plantId) {
    return apiClient.get(`/planning/constraints${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async createConstraint(constraintData) {
    return apiClient.post("/planning/constraints", constraintData);
  },

  async resolveConstraint(id) {
    return apiClient.patch(`/planning/constraints/${id}/resolve`);
  },

  async deleteConstraint(id) {
    return apiClient.delete(`/planning/constraints/${id}`);
  },

  // --- Recovery Simulator ---
  async applyRecovery(params) {
    return apiClient.post("/planning/recovery/apply", params);
  },
};

export default planningService;

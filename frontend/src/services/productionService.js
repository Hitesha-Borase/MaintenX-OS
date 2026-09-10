import apiClient from "./apiClient";

export const productionService = {
  async getOrders(plantId) {
    return apiClient.get(`/production/orders${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async createOrder(orderData) {
    return apiClient.post("/production/orders", orderData);
  },

  async updateOrderStatus(orderId, status) {
    return apiClient.patch(`/production/orders/${orderId}/status`, { status });
  },

  async getBatches() {
    return apiClient.get("/production/batches");
  },

  async advanceBatchStep(batchId, stepData) {
    return apiClient.post(`/production/batches/${batchId}/steps`, stepData);
  },

  async verifyLot(batchId, lotNo) {
    return apiClient.post(`/production/batches/${batchId}/verify-lot`, { lotNo });
  },

  async completeBatch(batchId) {
    return apiClient.patch(`/production/batches/${batchId}/complete`);
  },

  async qaRelease(batchId) {
    return apiClient.post(`/production/batches/${batchId}/qa-release`);
  },

  async recordOperatorEntry(entryData) {
    return apiClient.post("/production/hmi/entry", entryData);
  },

  async getDowntime(plantId) {
    return apiClient.get(`/production/downtime${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async logDowntime(downtimeData) {
    return apiClient.post("/production/downtime", downtimeData);
  },

  // --- Plant Manager H/B, OEE, Machines & Shift Handover ---
  async getHbLogs(plantId) {
    return apiClient.get(`/production/hb-logs${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async createHbLog(logData) {
    return apiClient.post("/production/hb-logs", logData);
  },

  async getOEE(plantId, period = "daily") {
    return apiClient.get(`/production/oee?plantId=${plantId || "PLT-01"}&period=${period}`);
  },

  async getPerformance(plantId) {
    return apiClient.get(`/production/performance${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async getMachines(plantId) {
    return apiClient.get(`/production/machines${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async updateMachineStatus(id, status) {
    return apiClient.patch(`/production/machines/${id}/status`, { status });
  },

  async getShiftHandoffs(plantId) {
    return apiClient.get(`/production/shift-handoffs${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async createShiftHandoff(handoffData) {
    return apiClient.post("/production/shift-handoffs", handoffData);
  },

  async getShiftPerformance(plantId) {
    return apiClient.get(`/production/shift-performance${plantId ? `?plantId=${plantId}` : ""}`);
  },
};

export default productionService;

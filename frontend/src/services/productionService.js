import apiClient from "./apiClient";

export const productionService = {
  async getOrders() {
    return apiClient.get("/production/orders");
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
    return apiClient.patch(`/production/batches/${batchId}/steps`, stepData);
  },

  async recordOperatorEntry(entryData) {
    return apiClient.post("/production/hmi/entry", entryData);
  },

  async logDowntime(downtimeData) {
    return apiClient.post("/production/downtime", downtimeData);
  },
};

export default productionService;

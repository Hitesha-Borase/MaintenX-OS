import apiClient from "./apiClient";

export const maintenanceService = {
  async getWorkOrders() {
    return apiClient.get("/maintenance/work-orders");
  },

  async createWorkOrder(workOrderData) {
    return apiClient.post("/maintenance/work-orders", workOrderData);
  },

  async updateWorkOrderStatus(workOrderId, status) {
    return apiClient.patch(`/maintenance/work-orders/${workOrderId}/status`, { status });
  },

  async getPMSchedules() {
    return apiClient.get("/maintenance/pm-schedules");
  },

  async getSpareParts() {
    return apiClient.get("/maintenance/spare-parts");
  },

  async getReliabilityMetrics() {
    return apiClient.get("/maintenance/reliability");
  },
};

export default maintenanceService;

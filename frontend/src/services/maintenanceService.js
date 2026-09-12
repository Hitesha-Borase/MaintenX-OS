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

  async updateWorkOrder(workOrderId, workOrderData) {
    return apiClient.put(`/maintenance/work-orders/${workOrderId}`, workOrderData);
  },

  async deleteWorkOrder(workOrderId) {
    return apiClient.delete(`/maintenance/work-orders/${workOrderId}`);
  },

  async getBreakdowns() {
    return apiClient.get("/maintenance/breakdowns");
  },

  async reportBreakdown(breakdownData) {
    return apiClient.post("/maintenance/breakdowns", breakdownData);
  },

  async updateBreakdown(breakdownId, breakdownData) {
    return apiClient.put(`/maintenance/breakdowns/${breakdownId}`, breakdownData);
  },

  async resolveBreakdown(breakdownId, resolveData) {
    return apiClient.post(`/maintenance/breakdowns/${breakdownId}/resolve`, resolveData);
  },

  async deleteBreakdown(breakdownId) {
    return apiClient.delete(`/maintenance/breakdowns/${breakdownId}`);
  },

  async updateAsset(assetId, assetData) {
    return apiClient.patch(`/maintenance/assets/${assetId}`, assetData);
  },

  async getHistory() {
    return apiClient.get("/maintenance/history");
  },

  async exportHistory(id) {
    return apiClient.post(`/maintenance/history/${id}/export`);
  },

  async getTroubleshooting() {
    return apiClient.get("/maintenance/troubleshooting");
  },

  async saveTroubleshootingStep(stepData) {
    return apiClient.post("/maintenance/troubleshooting/step", stepData);
  },

  async saveTroubleshootingDraft(draftData) {
    return apiClient.post("/maintenance/troubleshooting/draft", draftData);
  },

  async createTroubleshootingSolution(solutionData) {
    return apiClient.post("/maintenance/troubleshooting", solutionData);
  },

  async getPMSchedules() {
    return apiClient.get("/maintenance/pm-schedules");
  },

  async createPMSchedule(scheduleData) {
    return apiClient.post("/maintenance/pm-schedules", scheduleData);
  },

  async updatePMSchedule(scheduleId, scheduleData) {
    return apiClient.put(`/maintenance/pm-schedules/${scheduleId}`, scheduleData);
  },

  async deletePMSchedule(scheduleId) {
    return apiClient.delete(`/maintenance/pm-schedules/${scheduleId}`);
  },

  async getPM() {
    return apiClient.get("/maintenance/pm");
  },

  async getCalendar() {
    return apiClient.get("/maintenance/calendar");
  },

  async getNotifications() {
    return apiClient.get("/maintenance/notifications");
  },

  async getProfile() {
    return apiClient.get("/maintenance/profile");
  },

  async updateProfile(profileData) {
    return apiClient.patch("/maintenance/profile", profileData);
  },

  async getSpareParts() {
    return apiClient.get("/maintenance/spare-parts");
  },

  async getReliabilityMetrics() {
    return apiClient.get("/maintenance/reliability");
  },

  async executePMChecklist(data) {
    return apiClient.post("/maintenance/pm-checklists/execute", data);
  },

  async savePMChecklistDraft(data) {
    return apiClient.post("/maintenance/pm-checklists/draft", data);
  },

  async getRCAInvestigations() {
    return apiClient.get("/maintenance/rca/investigations");
  },

  async createRCAInvestigation(data) {
    return apiClient.post("/maintenance/rca/investigations", data);
  },

  async exportReliabilityReport() {
    return apiClient.post("/maintenance/reliability/export");
  },

  async saveExecutionRecord(woId, data) {
    return apiClient.post(`/maintenance/work-orders/${woId}/execution`, data);
  },

  async issueSparePart(woId, data) {
    return apiClient.post(`/maintenance/work-orders/${woId}/parts`, data);
  },

  async signOffWorkOrder(woId, data) {
    return apiClient.post(`/maintenance/work-orders/${woId}/sign-off`, data);
  },

  async addWorkOrderComment(woId, data) {
    return apiClient.post(`/maintenance/work-orders/${woId}/comments`, data);
  },
};

export default maintenanceService;

import apiClient from "./apiClient";

export const executiveService = {
  async getDashboardSummary(params = {}) {
    const query = params.plantId ? `?plantId=${params.plantId}` : "";
    return apiClient.get(`/executive/dashboard${query}`);
  },

  async syncDashboardData(data = {}) {
    return apiClient.post("/executive/dashboard/sync", data);
  },

  async exportBoardReport(data = {}) {
    return apiClient.post("/executive/dashboard/export", data);
  },

  async approveAiRecommendation(data = {}) {
    return apiClient.post("/executive/dashboard/approve-ai", data);
  },

  async getMultiPlantKpis() {
    return apiClient.get("/executive/enterprise/kpis");
  },

  async initiatePlantAudit(auditData) {
    return apiClient.post("/executive/enterprise/kpis/audit", auditData);
  },

  async getManufacturingCosts(batchId) {
    const query = batchId ? `?batchId=${batchId}` : "";
    return apiClient.get(`/executive/finance/manufacturing${query}`);
  },

  async getCostVariance() {
    return apiClient.get("/executive/finance/variance");
  },

  async validateVarianceTargets(data = {}) {
    return apiClient.post("/executive/finance/variance/validate", data);
  },

  async getMaterialCosts() {
    return apiClient.get("/executive/finance/material");
  },

  async updateContractRates(data = {}) {
    return apiClient.post("/executive/finance/material/update-rates", data);
  },

  async getLabourCosts() {
    return apiClient.get("/executive/finance/labour");
  },

  async auditLabourAllocation(data = {}) {
    return apiClient.post("/executive/finance/labour/audit", data);
  },

  async getMachineCosts() {
    return apiClient.get("/executive/finance/machine");
  },

  async auditMachineEfficiency(data = {}) {
    return apiClient.post("/executive/finance/machine/audit", data);
  },

  async getScrapReworkCosts() {
    return apiClient.get("/executive/finance/scrap");
  },

  async auditScrapEvent(data = {}) {
    return apiClient.post("/executive/finance/scrap/audit", data);
  },

  async getCiSavings() {
    return apiClient.get("/executive/finance/ci-savings");
  },

  async verifyCiProjectSavings(data = {}) {
    return apiClient.post("/executive/finance/ci-savings/verify", data);
  },

  async getBusinessTrends() {
    return apiClient.get("/executive/business/trends");
  },

  async simulateBusinessTrends(data = {}) {
    return apiClient.post("/executive/business/trends/simulate", data);
  },

  async getCustomerDemand() {
    return apiClient.get("/executive/business/demand");
  },

  async syncCustomerDemand(data = {}) {
    return apiClient.post("/executive/business/demand/sync", data);
  },

  async getServiceLevel() {
    return apiClient.get("/executive/business/service-level");
  },

  async getShipmentPerformance() {
    return apiClient.get("/executive/business/shipments");
  },

  async getRisks() {
    return apiClient.get("/executive/risk/risks");
  },

  async addRisk(data = {}) {
    return apiClient.post("/executive/risk/risks", data);
  },

  async mitigateRisk(data = {}) {
    return apiClient.post("/executive/risk/mitigate", data);
  },

  async getOpportunities() {
    return apiClient.get("/executive/risk/opportunities");
  },

  async approveOpportunity(data = {}) {
    return apiClient.post("/executive/risk/opportunities/approve", data);
  },

  async getAiBriefing() {
    return apiClient.get("/executive/ai/briefing");
  },

  async generateAiBriefing(data = {}) {
    return apiClient.post("/executive/ai/generate-briefing", data);
  },

  async getReports() {
    return apiClient.get("/executive/reports");
  },

  async exportReport(data = {}) {
    return apiClient.post("/executive/reports/export", data);
  },

  async getNotifications() {
    return apiClient.get("/executive/notifications");
  },

  async markNotificationRead(data = {}) {
    return apiClient.post("/executive/notifications/read", data);
  },

  async markAllNotificationsRead(data = {}) {
    return apiClient.post("/executive/notifications/read-all", data);
  },

  async deleteNotification(data = {}) {
    return apiClient.post("/executive/notifications/delete", data);
  },

  async clearAllNotifications(data = {}) {
    return apiClient.post("/executive/notifications/clear-all", data);
  },

  async getProfile() {
    return apiClient.get("/executive/profile");
  },

  async updateProfile(data = {}) {
    return apiClient.put("/executive/profile", data);
  }
};

export default executiveService;

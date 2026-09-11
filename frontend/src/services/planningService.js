import apiClient from './apiClient';

export const planningService = {
  // Command Center Dashboard Summary
  async getDashboardSummary(params = {}) {
    const response = await apiClient.get('/planning/dashboard', { params });
    return response.data?.data || response.data || {};
  },

  // Demand Orders
  async getCustomerOrders(filters = {}) {
    const response = await apiClient.get('/demand/orders', { params: filters });
    return response.data?.data || response.data || [];
  },

  async getDemandOrders(filters = {}) {
    const response = await apiClient.get('/demand/orders', { params: filters });
    return response.data?.data || response.data || [];
  },

  async createDemandOrder(orderData) {
    const response = await apiClient.post('/demand/orders', orderData);
    return response.data?.data || response.data;
  },

  async createCustomerOrder(data) {
    const response = await apiClient.post('/demand/orders', data);
    return response.data?.data || response.data;
  },

  async updateCustomerOrder(id, data) {
    const response = await apiClient.patch(`/demand/orders/${id}`, data);
    return response.data?.data || response.data;
  },

  async updateDemandOrder(id, data) {
    const response = await apiClient.patch(`/demand/orders/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteCustomerOrder(id) {
    const response = await apiClient.delete(`/demand/orders/${id}`);
    return response.data?.data || response.data;
  },

  async deleteDemandOrder(id) {
    const response = await apiClient.delete(`/demand/orders/${id}`);
    return response.data?.data || response.data;
  },

  async createApsSchedule(scheduleData) {
    const response = await apiClient.post('/aps/schedules', scheduleData);
    return response.data?.data || response.data;
  },

  async calculateMRP(mrpParams) {
    const response = await apiClient.post('/mrp/net-requirements', mrpParams);
    return response.data?.data || response.data;
  },

  // Forecasts
  async getForecasts(filters = {}) {
    const response = await apiClient.get('/forecasts', { params: filters });
    return response.data?.data || response.data || [];
  },

  async createForecast(data) {
    const response = await apiClient.post('/forecasts', data);
    return response.data?.data || response.data;
  },

  async updateForecast(id, data) {
    const response = await apiClient.patch(`/forecasts/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteForecast(id) {
    const response = await apiClient.delete(`/forecasts/${id}`);
    return response.data?.data || response.data;
  },

  // Demand History
  async getDemandHistory() {
    const response = await apiClient.get('/forecast/history');
    return response.data?.data || response.data || [];
  },

  // Promotions & Uplift Events
  async getPromotions() {
    const response = await apiClient.get('/forecast/promotions');
    return response.data?.data || response.data || [];
  },

  async createPromotion(data) {
    const response = await apiClient.post('/forecast/promotions', data);
    return response.data?.data || response.data;
  },

  async updatePromotion(id, data) {
    const response = await apiClient.patch(`/forecast/promotions/${id}`, data);
    return response.data?.data || response.data;
  },

  async deletePromotion(id) {
    const response = await apiClient.delete(`/promotions/${id}`);
    return response.data?.data || response.data;
  },

  // Statistical Forecast Engine Run
  async runForecast(data) {
    const response = await apiClient.post('/forecast/run', data);
    return response.data?.data || response.data;
  },

  // Shipments
  async getShipments(filters = {}) {
    const response = await apiClient.get('/shipments', { params: filters });
    return response.data?.data || response.data || [];
  },

  async createShipment(data) {
    const response = await apiClient.post('/shipments', data);
    return response.data?.data || response.data;
  },

  async updateShipmentStatus(id, status) {
    const response = await apiClient.patch(`/shipments/${id}`, { status });
    return response.data?.data || response.data;
  },

  // MRP Operations
  async getMrpNetRequirements() {
    const response = await apiClient.get('/mrp/net-requirements');
    return response.data?.data || response.data || [];
  },

  async runMrpEngine(data = {}) {
    const response = await apiClient.post('/mrp/run', data);
    return response.data?.data || response.data;
  },

  async createPurchaseRequisition(data) {
    const response = await apiClient.post('/mrp/requisitions', data);
    return response.data?.data || response.data;
  },

  async getPurchaseRequisitions() {
    const response = await apiClient.get('/mrp/requisitions');
    return response.data?.data || response.data || [];
  },

  async expediteShortage(data) {
    const response = await apiClient.post('/mrp/expedite', data);
    return response.data?.data || response.data;
  },

  async getExpeditedShortages() {
    const response = await apiClient.get('/mrp/expedited');
    return response.data?.data || response.data || {};
  },

  async updateSafetyStockPolicy(data) {
    const response = await apiClient.post('/mrp/safety-stock', data);
    return response.data?.data || response.data;
  },

  async getSafetyStockPolicies() {
    const response = await apiClient.get('/mrp/safety-stock');
    return response.data?.data || response.data || {};
  },

  async getServiceRisks() {
    const response = await apiClient.get('/mrp/service-risks');
    return response.data?.data || response.data || [];
  },

  async mitigateServiceRisk(riskId, data = {}) {
    const response = await apiClient.post(`/mrp/service-risks/${riskId}/mitigate`, data);
    return response.data?.data || response.data;
  },

  // APS & Scheduling
  async getAPSSchedules(filters = {}) {
    const response = await apiClient.get('/aps/schedules', { params: filters });
    return response.data?.data || response.data || [];
  },

  async createAPSSchedule(data) {
    const response = await apiClient.post('/aps/schedules', data);
    return response.data?.data || response.data;
  },

  async rescheduleAPSSchedule(id, data) {
    const response = await apiClient.patch(`/aps/schedules/${id}/reschedule`, data);
    return response.data?.data || response.data;
  },

  async splitAPSSchedule(id, data) {
    const response = await apiClient.post(`/aps/schedules/${id}/split`, data);
    return response.data?.data || response.data;
  },

  async optimizeAPSSchedule(data = {}) {
    const response = await apiClient.post('/aps/optimize', data);
    return response.data?.data || response.data;
  },

  async getCapacityCalculations() {
    const response = await apiClient.get('/aps/capacity');
    return response.data?.data || response.data || {};
  },

  async getWorkCenters() {
    const response = await apiClient.get('/aps/work-centers');
    return response.data?.data || response.data || [];
  },

  async getChangeovers() {
    const response = await apiClient.get('/aps/changeovers');
    return response.data?.data || response.data || [];
  },

  async createChangeover(data) {
    const response = await apiClient.post('/aps/changeovers', data);
    return response.data?.data || response.data;
  },

  // Supply & Demand Balance
  async getSupplyDemandBalance() {
    const response = await apiClient.get('/mrp/supply-demand');
    return response.data?.data || response.data || {};
  },

  // Schedule Versions & Revision Baselines
  async getScheduleVersions() {
    const response = await apiClient.get('/planner/aps/versions');
    return response?.data !== undefined ? response.data : response;
  },

  async createScheduleVersion(data) {
    const response = await apiClient.post('/planner/aps/versions', data);
    return response?.data !== undefined ? response.data : response;
  },

  // Schedule Feasibility & Gate Validation
  async validateSchedule(data = {}) {
    const response = await apiClient.post('/planner/aps/validate', data);
    return response?.data !== undefined ? response.data : response;
  },

  // Shop-Floor Publication & HMI Dispatch
  async getPublishSchedule() {
    const response = await apiClient.get('/planner/aps/publish');
    return response?.data !== undefined ? response.data : response;
  },

  async publishSchedule(data) {
    const response = await apiClient.post('/planner/aps/publish', data);
    return response?.data !== undefined ? response.data : response;
  },

  // Material Reservations & Staging
  async getMaterialReservations() {
    const response = await apiClient.get('/planner/material-reservation');
    return response?.data !== undefined ? response.data : response;
  },

  async createMaterialReservation(data) {
    const response = await apiClient.post('/planner/material-reservation', data);
    return response?.data !== undefined ? response.data : response;
  },

  async stageMaterialReservation(id) {
    const response = await apiClient.post('/planner/material-reservation/stage', { reservationId: id });
    return response?.data !== undefined ? response.data : response;
  },

  async releaseMaterialReservation(id) {
    const response = await apiClient.post('/planner/material-reservation/release', { reservationId: id });
    return response?.data !== undefined ? response.data : response;
  },

  async recalculateMaterialReservations() {
    const response = await apiClient.post('/planner/material-reservation/recalculate');
    return response?.data !== undefined ? response.data : response;
  },

  // AI Copilot & Planning Assistant
  async getAiAssistantOverview() {
    const response = await apiClient.get('/planner/ai-assistant');
    return response?.data !== undefined ? response.data : response;
  },

  async chatAi(prompt) {
    const response = await apiClient.post('/planner/ai-assistant/chat', { prompt });
    return response?.data !== undefined ? response.data : response;
  },

  async applyAiRecommendation(data = {}) {
    const response = await apiClient.post('/planner/ai-assistant/apply', data);
    return response?.data !== undefined ? response.data : response;
  },

  async simulateAiImpact(data = {}) {
    const response = await apiClient.post('/planner/ai-assistant/simulate', data);
    return response?.data !== undefined ? response.data : response;
  },

  // Planning Reports
  async getPlanningReports() {
    const response = await apiClient.get('/planner/planning-reports');
    return response?.data !== undefined ? response.data : response;
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
  }
};

export default planningService;



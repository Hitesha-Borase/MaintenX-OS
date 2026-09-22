import apiClient from "./apiClient";

export const dashboardService = {
  // ─── Plant Manager ──────────────────────────────────────────────────────────
  async getCommandCenterOverview(plantId, stage) {
    const params = new URLSearchParams();
    if (plantId && plantId !== "ALL") params.append("plantId", plantId);
    if (stage && stage !== "ALL") params.append("stage", stage);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/dashboards/command-center${qs}`);
  },

  async getKPIs(plantId) {
    return apiClient.get(`/dashboards/kpis${plantId ? `?plantId=${plantId}` : ""}`);
  },

  async getPlantManagerKPIs(plantId) {
    return apiClient.get(`/dashboards/kpis${plantId ? `?plantId=${plantId}` : ""}`);
  },

  // ─── Line Lead Dashboard ────────────────────────────────────────────────────
  async getLineLeadDashboard() {
    return apiClient.get("/dashboards/linelead");
  },

  async getMaterialLog() {
    return apiClient.get("/dashboards/linelead/material-log");
  },

  async getQualityLog() {
    return apiClient.get("/dashboards/linelead/quality-log");
  },

  async logQaSampleCheck(payload = {}) {
    return apiClient.post("/dashboards/linelead/quality-log/check", payload);
  },

  async acknowledgeMicroStop(payload = {}) {
    return apiClient.post("/dashboards/linelead/acknowledge-microstop", payload);
  },

  async requestStockReplenishment(payload) {
    return apiClient.post("/dashboards/linelead/request-stock", payload);
  },

  async proposeLineSpeedUp(payload) {
    return apiClient.post("/dashboards/linelead/propose-speedup", payload);
  },

  async logBatchWeighing(payload) {
    return apiClient.post("/dashboards/linelead/batch-weighing", payload);
  },

  async advanceRecipeStep(payload) {
    return apiClient.post("/dashboards/linelead/recipe-step", payload);
  },

  async logCcpCheck(payload) {
    return apiClient.post("/dashboards/linelead/ccp-check", payload);
  },

  async saveLineClearance(payload) {
    return apiClient.post("/dashboards/linelead/line-clearance", payload);
  },

  async saveSealVerification(payload) {
    return apiClient.post("/dashboards/linelead/seal-verification", payload);
  },

  async logWipConsumption(payload) {
    return apiClient.post("/dashboards/linelead/wip-consumption", payload);
  },

  // ─── Processing Operator Methods ──────────────────────────────────────────
  async advanceProcessingRecipeStep(payload) {
    return apiClient.post("/dashboards/operator/processing/recipe-step", payload);
  },

  async weighProcessingIngredient(payload) {
    return apiClient.post("/dashboards/operator/processing/weigh-ingredient", payload);
  },

  async logProcessingParameters(payload) {
    return apiClient.post("/dashboards/operator/processing/log-parameters", payload);
  },

  async signoffCcp(payload) {
    return apiClient.post("/dashboards/operator/processing/ccp-signoff", payload);
  },

  async completeBatchAndCreateWip(payload) {
    return apiClient.post("/dashboards/operator/processing/complete-batch-wip", payload);
  },

  // ─── Packaging Operator Methods ───────────────────────────────────────────
  async selectWipLotForPackaging(payload) {
    return apiClient.post("/dashboards/operator/packaging/select-wip-lot", payload);
  },

  async consumePackagingMaterials(payload) {
    return apiClient.post("/dashboards/operator/packaging/consume-materials", payload);
  },

  async logPackagingOutputCases(payload) {
    return apiClient.post("/dashboards/operator/packaging/log-output-cases", payload);
  },

  async verifySealAndLabel(payload) {
    return apiClient.post("/dashboards/operator/packaging/verify-seal-label", payload);
  },

  async finishRunAndCreateFgPallet(payload) {
    return apiClient.post("/dashboards/operator/packaging/create-fg-pallet", payload);
  },

  // ─── H/B (Hour-by-Hour) Management ─────────────────────────────────────────
  async getHbLogs() {
    return apiClient.get("/dashboards/linelead/hb-logs");
  },

  async saveHbRecord(payload) {
    return apiClient.post("/dashboards/linelead/hb-logs", payload);
  },

  async updateHbRecord(id, payload) {
    return apiClient.patch(`/dashboards/linelead/hb-logs/${id}`, payload);
  },

  async deleteHbRecord(id) {
    return apiClient.delete(`/dashboards/linelead/hb-logs/${id}`);
  },

  async recalculateCatchUp(payload = {}) {
    return apiClient.post("/dashboards/linelead/hb-catchup", payload);
  },

  async bulkReconcileShift(payload = {}) {
    return apiClient.post("/dashboards/linelead/hb-reconcile", payload);
  },

  // ─── Downtime & Loss (RCA 2.0) ─────────────────────────────────────────────
  async getDowntimeLogs() {
    return apiClient.get("/dashboards/linelead/downtime-logs");
  },

  async logBreakdown(payload) {
    return apiClient.post("/dashboards/linelead/downtime-logs", payload);
  },

  async acknowledgeDowntime(id) {
    return apiClient.patch(`/dashboards/linelead/downtime-logs/${id}/acknowledge`, {});
  },

  async resolveDowntime(id) {
    return apiClient.patch(`/dashboards/linelead/downtime-logs/${id}/resolve`, {});
  },

  async deleteDowntimeLog(id) {
    return apiClient.delete(`/dashboards/linelead/downtime-logs/${id}`);
  },

  async dispatchTech(id, payload) {
    return apiClient.post(`/dashboards/linelead/downtime-logs/${id}/dispatch`, payload);
  },

  // ─── Changeover Control ─────────────────────────────────────────────────────
  async getChangeoverStatus() {
    return apiClient.get("/dashboards/linelead/changeover");
  },

  async startChangeover(payload = {}) {
    return apiClient.post("/dashboards/linelead/changeover/start", payload);
  },

  async completeChangeoverStep(stepId) {
    return apiClient.patch(`/dashboards/linelead/changeover/steps/${stepId}/complete`, {});
  },

  async finishChangeover(payload = {}) {
    return apiClient.post("/dashboards/linelead/changeover/finish", payload);
  },

  async logChangeoverDelay(payload) {
    return apiClient.post("/dashboards/linelead/changeover/log-delay", payload);
  },

  // ─── Staffing ───────────────────────────────────────────────────────────────
  async getStaffingRoster() {
    return apiClient.get("/dashboards/linelead/staffing");
  },

  async addStaffOperator(payload) {
    return apiClient.post("/dashboards/linelead/staffing", payload);
  },

  async deleteStaffOperator(id) {
    return apiClient.delete(`/dashboards/linelead/staffing/${id}`);
  },

  async swapStaffingStations(payload) {
    return apiClient.post("/dashboards/linelead/staffing/swap", payload);
  },

  async requestReliefOperator(payload = {}) {
    return apiClient.post("/dashboards/linelead/staffing/request-relief", payload);
  },

  async reassignOperatorStation(id, payload) {
    return apiClient.patch(`/dashboards/linelead/staffing/${id}/reassign`, payload);
  },

  async requestOperatorReplacement(id, payload = {}) {
    return apiClient.post(`/dashboards/linelead/staffing/${id}/request-replacement`, payload);
  },

  // ─── Production Performance & Pace ──────────────────────────────────────────
  async getProductionPerformance() {
    return apiClient.get("/dashboards/linelead/performance");
  },

  async simulateRecoverySpeed(payload) {
    return apiClient.post("/dashboards/linelead/performance/simulate", payload);
  },

  async applyTargetOverride(payload) {
    return apiClient.post("/dashboards/linelead/performance/target-override", payload);
  },

  async resetTargetOverride(payload = {}) {
    return apiClient.post("/dashboards/linelead/performance/reset-target-override", payload);
  },

  // ─── Schedule Recovery Management ──────────────────────────────────────────
  async getRecoveryStatus() {
    return apiClient.get("/dashboards/linelead/recovery");
  },

  async activateCountermeasure(id, payload = {}) {
    return apiClient.post(`/dashboards/linelead/recovery/countermeasures/${id}/activate`, payload);
  },

  async submitRecoveryProposal(payload = {}) {
    return apiClient.post("/dashboards/linelead/recovery/submit-proposal", payload);
  },

  // ─── Escalations Console (P1 Control Tower) ─────────────────────────────────
  async getEscalations() {
    return apiClient.get("/dashboards/linelead/escalations");
  },

  async dispatchEscalation(payload) {
    return apiClient.post("/dashboards/linelead/escalations", payload);
  },

  async attachEscalationEvidence(id, payload) {
    return apiClient.post(`/dashboards/linelead/escalations/${id}/evidence`, payload);
  },

  // ─── Notifications ──────────────────────────────────────────────────────────
  async getNotifications() {
    return apiClient.get("/dashboards/linelead/notifications");
  },

  async markNotificationRead(id) {
    return apiClient.patch(`/dashboards/linelead/notifications/${id}/read`, {});
  },

  async deleteNotification(id) {
    return apiClient.delete(`/dashboards/linelead/notifications/${id}`);
  },

  async markAllNotificationsRead() {
    return apiClient.patch("/dashboards/linelead/notifications/mark-all-read", {});
  },

  async clearAllNotifications() {
    return apiClient.delete("/dashboards/linelead/notifications/clear-all");
  },

  // ─── Profile ────────────────────────────────────────────────────────────────
  async getUserProfile() {
    return apiClient.get("/dashboards/linelead/profile");
  },

  async updateUserProfile(payload) {
    return apiClient.put("/dashboards/linelead/profile", payload);
  },

  // ─── Operator Dashboard & HMI Console ──────────────────────────────────────
  async getOperatorDashboard() {
    return apiClient.get("/dashboards/operator/dashboard");
  },

  async logOperatorMicroStop(payload) {
    return apiClient.post("/dashboards/operator/microstop", payload);
  },

  async updateJobStatus(jobId, payload) {
    return apiClient.patch(`/dashboards/operator/jobs/${jobId}/status`, payload);
  },

  // ─── Operator My Jobs ──────────────────────────────────────────────────────
  async getOperatorJobs() {
    return apiClient.get("/dashboards/operator/jobs");
  },

  async startOperatorJob(jobId, payload = {}) {
    return apiClient.post(`/dashboards/operator/jobs/${jobId}/start`, payload);
  },

  async completeOperatorJob(jobId) {
    return apiClient.post(`/dashboards/operator/jobs/${jobId}/complete`, {});
  },

  // ─── Operator Work Instructions & SOPs ─────────────────────────────────────
  async getWorkInstructions(orderNumber) {
    return apiClient.get(`/dashboards/operator/work-instructions${orderNumber ? `?orderNumber=${encodeURIComponent(orderNumber)}` : ""}`);
  },

  async acknowledgeWorkInstructions(payload = {}) {
    return apiClient.post("/dashboards/operator/work-instructions/acknowledge", payload);
  },

  // ─── Operator Production Entry ─────────────────────────────────────────────
  async getProductionEntryStatus(orderNumber) {
    return apiClient.get(`/dashboards/operator/production-entry${orderNumber ? `?orderNumber=${encodeURIComponent(orderNumber)}` : ""}`);
  },

  async submitProductionLog(payload) {
    return apiClient.post("/dashboards/operator/production-entry/submit-log", payload);
  },

  async logScrapDefect(payload) {
    return apiClient.post("/dashboards/operator/production-entry/log-scrap", payload);
  },

  // ─── Processing Operator Specific ──────────────────────────────────────────
  async advanceProcessingRecipeStep(payload) {
    return apiClient.post("/dashboards/operator/processing/recipe-step", payload);
  },

  async weighProcessingIngredient(payload) {
    return apiClient.post("/dashboards/operator/processing/weigh-ingredient", payload);
  },

  async logProcessingParameters(payload) {
    return apiClient.post("/dashboards/operator/processing/log-parameters", payload);
  },

  async signoffCcp(payload) {
    return apiClient.post("/dashboards/operator/processing/ccp-signoff", payload);
  },

  async completeBatchAndCreateWip(payload) {
    return apiClient.post("/dashboards/operator/processing/complete-batch-wip", payload);
  },

  // ─── Packaging Operator Specific ───────────────────────────────────────────
  async selectWipLotForPackaging(payload) {
    return apiClient.post("/dashboards/operator/packaging/select-wip-lot", payload);
  },

  async consumePackagingMaterials(payload) {
    return apiClient.post("/dashboards/operator/packaging/consume-materials", payload);
  },

  async logPackagingOutputCases(payload) {
    return apiClient.post("/dashboards/operator/packaging/log-output-cases", payload);
  },

  async verifySealAndLabel(payload) {
    return apiClient.post("/dashboards/operator/packaging/verify-seal-label", payload);
  },

  async finishRunAndCreateFgPallet(payload) {
    return apiClient.post("/dashboards/operator/packaging/create-fg-pallet", payload);
  },

  // ─── Operator Downtime & Loss ───────────────────────────────────────────────
  async getOperatorDowntime() {
    return apiClient.get("/dashboards/operator/downtime");
  },

  async logOperatorDowntimeEvent(payload) {
    return apiClient.post("/dashboards/operator/downtime/log-event", payload);
  },

  async logOperatorDowntimeMicroStop(payload) {
    return apiClient.post("/dashboards/operator/downtime/microstop", payload);
  },

  // ─── Operator Quality & CCP Checks ──────────────────────────────────────────
  async getOperatorQualityChecks() {
    return apiClient.get("/dashboards/operator/quality-checks");
  },

  async submitQualityChecklist(payload) {
    return apiClient.post("/dashboards/operator/quality-checks/submit", payload);
  },

  async triggerQualityHold(payload) {
    return apiClient.post("/dashboards/operator/quality-checks/trigger-hold", payload);
  },

  // ─── Operator Material Requisition ─────────────────────────────────────────
  async getOperatorMaterialRequests() {
    return apiClient.get("/dashboards/operator/material-request");
  },

  async callWarehouseRunner(payload = {}) {
    return apiClient.post("/dashboards/operator/material-request/call-runner", payload);
  },

  async submitMaterialRequisition(payload) {
    return apiClient.post("/dashboards/operator/material-request/submit-requisition", payload);
  },

  async confirmMaterialReceipt(id) {
    return apiClient.post(`/dashboards/operator/material-request/${id}/confirm-receipt`, {});
  },

  async deleteMaterialRequisition(id) {
    return apiClient.delete(`/dashboards/operator/material-request/${id}`);
  },

  // ─── Operator Barcode & QR Scan ─────────────────────────────────────────────
  async getBarcodeScanStatus() {
    return apiClient.get("/dashboards/operator/barcode-scan");
  },

  async parseBarcode(payload) {
    return apiClient.post("/dashboards/operator/barcode-scan/parse", payload);
  },

  async attachLotToBatch(payload) {
    return apiClient.post("/dashboards/operator/barcode-scan/attach-lot", payload);
  },

  // ─── Operator Report Issue & Safety Exception ──────────────────────────────
  async getReportIssueStatus() {
    return apiClient.get("/dashboards/operator/report-issue");
  },

  async submitReportIssue(payload) {
    return apiClient.post("/dashboards/operator/report-issue/submit", payload);
  },

  async triggerEmergencyCall(payload) {
    return apiClient.post("/dashboards/operator/report-issue/emergency-call", payload);
  },

  // ─── Operator Shift Handoff ─────────────────────────────────────────────────
  async getShiftHandoffs() {
    return apiClient.get("/dashboards/operator/shift-handoff");
  },

  async submitShiftHandoff(payload) {
    return apiClient.post("/dashboards/operator/shift-handoff/submit", payload);
  },

  // ─── Operator Notifications ─────────────────────────────────────────────────
  async getOperatorNotifications() {
    return apiClient.get("/dashboards/operator/notifications");
  },

  async markOperatorNotificationRead(id) {
    return apiClient.post(`/dashboards/operator/notifications/${id}/read`, {});
  },

  async markAllOperatorNotificationsRead() {
    return apiClient.post("/dashboards/operator/notifications/read-all", {});
  },

  async deleteOperatorNotification(id) {
    return apiClient.delete(`/dashboards/operator/notifications/${id}`);
  },

  async clearAllOperatorNotifications() {
    return apiClient.delete("/dashboards/operator/notifications/clear-all");
  },

  // ─── Operator Profile ────────────────────────────────────────────────────────
  async getOperatorProfile() {
    return apiClient.get("/dashboards/operator/profile");
  },

  async updateOperatorProfile(payload) {
    return apiClient.put("/dashboards/operator/profile", payload);
  },

  // ─── Operations Supervisor ─────────────────────────────────────────────────
  async getSupervisorDashboard() {
    return apiClient.get("/dashboards/supervisor/dashboard");
  },

  async authorizeSupervisorShift(payload) {
    return apiClient.post("/dashboards/supervisor/authorize-shift", payload);
  },

  async getSupervisorDeptSchedule() {
    return apiClient.get("/dashboards/supervisor/dept-schedule");
  },

  async createSupervisorDeptSchedule(payload) {
    return apiClient.post("/dashboards/supervisor/dept-schedule", payload);
  },

  async resequenceSupervisorDeptSchedule() {
    return apiClient.post("/dashboards/supervisor/dept-schedule/resequence", {});
  },

  async authorizeSupervisorDeptSchedule(id) {
    return apiClient.post(`/dashboards/supervisor/dept-schedule/${id}/authorize`, {});
  },

  async pauseSupervisorDeptSchedule(id) {
    return apiClient.post(`/dashboards/supervisor/dept-schedule/${id}/pause`, {});
  },

  async resumeSupervisorDeptSchedule(id) {
    return apiClient.post(`/dashboards/supervisor/dept-schedule/${id}/resume`, {});
  },

  async getSupervisorWorkforce() {
    return apiClient.get("/dashboards/supervisor/workforce");
  },

  async addSupervisorWorkforceEmployee(payload) {
    return apiClient.post("/dashboards/supervisor/workforce", payload);
  },

  async updateSupervisorWorkforceEmployee(id, payload) {
    return apiClient.put(`/dashboards/supervisor/workforce/${id}`, payload);
  },

  async assignSupervisorWorkforceSkill(id, payload) {
    return apiClient.post(`/dashboards/supervisor/workforce/${id}/assign-skill`, payload);
  },

  async assignSupervisorWorkforceTraining(id, payload) {
    return apiClient.post(`/dashboards/supervisor/workforce/${id}/assign-training`, payload);
  },

  async deleteSupervisorWorkforceEmployee(id) {
    return apiClient.delete(`/dashboards/supervisor/workforce/${id}`);
  },

  async getSupervisorLabourTime() {
    return apiClient.get("/dashboards/supervisor/labour/time");
  },

  async authorizeSupervisorOvertime(payload = {}) {
    return apiClient.post("/dashboards/supervisor/labour/authorize-overtime", payload);
  },

  async rebalanceSupervisorCrew(payload) {
    return apiClient.post("/dashboards/supervisor/labour/rebalance-crew", payload);
  },

  async getSupervisorLiveHB() {
    return apiClient.get("/dashboards/supervisor/hb-management");
  },

  async logSupervisorHB(payload) {
    return apiClient.post("/dashboards/supervisor/hb-management", payload);
  },

  async dispatchSupervisorHBBackup(payload) {
    return apiClient.post("/dashboards/supervisor/hb-management/dispatch-backup", payload);
  },

  async getSupervisorSkills() {
    return apiClient.get("/dashboards/supervisor/labour/skills");
  },

  async addSupervisorSkill(payload) {
    return apiClient.post("/dashboards/supervisor/labour/skills", payload);
  },

  async updateSupervisorSkillLevel(id, payload) {
    return apiClient.put(`/dashboards/supervisor/labour/skills/${id}`, payload);
  },

  async getSupervisorTraining() {
    return apiClient.get("/dashboards/supervisor/labour/training");
  },

  async addSupervisorTraining(payload) {
    return apiClient.post("/dashboards/supervisor/labour/training", payload);
  },

  async completeSupervisorTraining(id, payload) {
    return apiClient.post(`/dashboards/supervisor/labour/training/${id}/complete`, payload);
  },

  async getSupervisorProductivity() {
    return apiClient.get("/dashboards/supervisor/labour/productivity");
  },

  async getLabourAllocations(shift = "Shift A") {
    const query = shift ? `?shift=${encodeURIComponent(shift)}` : "";
    return apiClient.get(`/dashboards/labour/allocations${query}`);
  },

  async createLabourAllocation(payload) {
    return apiClient.post("/dashboards/labour/allocations", payload);
  },

  async updateLabourAllocation(id, payload) {
    return apiClient.put(`/dashboards/labour/allocations/${encodeURIComponent(id)}`, payload);
  },

  async deleteLabourAllocation(id) {
    return apiClient.delete(`/dashboards/labour/allocations/${encodeURIComponent(id)}`);
  },

  async getSupervisorStaffing() {
    return apiClient.get("/dashboards/supervisor/labour/staffing");
  },


  async addSupervisorStaffing(payload) {
    return apiClient.post("/dashboards/supervisor/labour/staffing", payload);
  },

  async updateSupervisorStaffing(id, payload) {
    return apiClient.put(`/dashboards/supervisor/labour/staffing/${id}`, payload);
  },

  async assignSupervisorStaffingPersonnel(id, payload) {
    return apiClient.post(`/dashboards/supervisor/labour/staffing/${id}/assign-personnel`, payload);
  },

  async assignSupervisorStaffingStation(id, payload) {
    return apiClient.post(`/dashboards/supervisor/labour/staffing/${id}/assign-station`, payload);
  },

  async closeSupervisorStaffingShift(id, payload) {
    return apiClient.post(`/dashboards/supervisor/labour/staffing/${id}/close-shift`, payload);
  },

  async deleteSupervisorStaffing(id) {
    return apiClient.delete(`/dashboards/supervisor/labour/staffing/${id}`);
  },

  async setSupervisorProductionSpeedLimit(payload) {
    return apiClient.post("/dashboards/supervisor/production/performance/speed-limit", payload);
  },

  async getSupervisorDowntimePareto() {
    return apiClient.get("/dashboards/supervisor/production/performance/downtime-pareto");
  },

  async updateSupervisorProductionRun(payload) {
    return apiClient.post("/dashboards/supervisor/production/performance/update-run", payload);
  },

  async getSupervisorHolds() {
    return apiClient.get("/dashboards/supervisor/quality/holds");
  },

  async createSupervisorHold(payload) {
    return apiClient.post("/dashboards/supervisor/quality/holds", payload);
  },

  async addSupervisorHoldNote(id, payload) {
    return apiClient.post(`/dashboards/supervisor/quality/holds/${id}/note`, payload);
  },

  async requestSupervisorHoldRework(id, payload) {
    return apiClient.post(`/dashboards/supervisor/quality/holds/${id}/request-rework`, payload);
  },

  async authorizeSupervisorHoldRelease(id, payload) {
    return apiClient.post(`/dashboards/supervisor/quality/holds/${id}/authorize-release`, payload);
  },

  async scrapSupervisorHoldBatch(id) {
    return apiClient.delete(`/dashboards/supervisor/quality/holds/${id}/scrap`);
  },

  async getSupervisorRecovery() {
    return apiClient.get("/dashboards/supervisor/recovery");
  },

  async getSupervisorRecoveryCountermeasures() {
    return apiClient.get("/dashboards/supervisor/recovery/countermeasures");
  },

  async createSupervisorRecoveryCountermeasure(data) {
    return apiClient.post("/dashboards/supervisor/recovery/countermeasures", data);
  },

  async authorizeSupervisorRecoveryCountermeasure(id) {
    return apiClient.post(`/dashboards/supervisor/recovery/countermeasures/${id}/authorize`, {});
  },

  async deleteSupervisorRecoveryCountermeasure(id) {
    return apiClient.delete(`/dashboards/supervisor/recovery/countermeasures/${id}`);
  },

  async authorizeAllSupervisorRecoveryCountermeasures() {
    return apiClient.post("/dashboards/supervisor/recovery/countermeasures/authorize-all", {});
  },

  async getSupervisorApprovals() {
    return apiClient.get("/dashboards/supervisor/approvals");
  },

  async createSupervisorApproval(data) {
    return apiClient.post("/dashboards/supervisor/approvals", data);
  },

  async deleteSupervisorApproval(id) {
    return apiClient.delete(`/dashboards/supervisor/approvals/${id}`);
  },

  async approveSupervisorApproval(id, payload = {}) {
    return apiClient.post(`/dashboards/supervisor/approvals/${id}/approve`, payload);
  },

  async rejectSupervisorApproval(id) {
    return apiClient.post(`/dashboards/supervisor/approvals/${id}/reject`, {});
  },

  async clarifySupervisorApproval(id) {
    return apiClient.post(`/dashboards/supervisor/approvals/${id}/clarify`, {});
  },

  async bulkApproveSupervisorApprovals() {
    return apiClient.post("/dashboards/supervisor/approvals/bulk-approve", {});
  },

  async getSupervisorReports() {
    return apiClient.get("/dashboards/supervisor/reports");
  },

  async getSupervisorReportsList() {
    return apiClient.get("/dashboards/supervisor/reports/list");
  },

  async printSupervisorReport(id) {
    return apiClient.post(`/dashboards/supervisor/reports/${id}/print`, {});
  },

  async createSupervisorReport(data) {
    return apiClient.post("/dashboards/supervisor/reports", data);
  },

  async getSupervisorNotifications() {
    return apiClient.get("/dashboards/supervisor/notifications");
  },

  async getSupervisorNotificationsList() {
    return apiClient.get("/dashboards/supervisor/notifications/list");
  },

  async createSupervisorNotification(payload) {
    return apiClient.post("/dashboards/supervisor/notifications", payload);
  },

  async markSupervisorNotificationRead(id) {
    return apiClient.put(`/dashboards/supervisor/notifications/${id}/read`, {});
  },

  async deleteSupervisorNotification(id) {
    return apiClient.delete(`/dashboards/supervisor/notifications/${id}`);
  },

  async markAllSupervisorNotificationsRead() {
    return apiClient.put("/dashboards/supervisor/notifications/mark-all-read", {});
  },

  async clearAllSupervisorNotifications() {
    return apiClient.delete("/dashboards/supervisor/notifications/clear-all-list");
  },

  async getSupervisorProfile() {
    return apiClient.get("/dashboards/supervisor/profile");
  },

  async updateSupervisorProfile(payload) {
    return apiClient.put("/dashboards/supervisor/profile", payload);
  },
};

export default dashboardService;





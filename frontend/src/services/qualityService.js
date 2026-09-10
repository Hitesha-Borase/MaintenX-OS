import apiClient from "./apiClient";

export const qualityService = {
  async getQualitySummary() {
    return apiClient.get("/quality/summary");
  },

  async getQualityDashboard() {
    return apiClient.get("/quality/dashboard");
  },

  async getPreOpChecklist() {
    return apiClient.get("/quality/sanitation/preop");
  },

  async submitPreOp(preOpData) {
    return apiClient.post("/quality/sanitation/preop", preOpData);
  },

  async savePreOpProgress(preOpData) {
    return apiClient.post("/quality/sanitation/preop/save", preOpData);
  },

  async getSanitationChecklist() {
    return apiClient.get("/quality/sanitation/checklist");
  },

  async submitSanitation(sanitationData) {
    return apiClient.post("/quality/sanitation/checklist", sanitationData);
  },

  async saveSanitationProgress(sanitationData) {
    return apiClient.post("/quality/sanitation/checklist/save", sanitationData);
  },

  async getCCPChecks(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/quality/ccp${query}`);
  },

  async submitCCPCheck(checkData) {
    return apiClient.post("/quality/ccp", checkData);
  },

  async exportCcpChecks(exportData = {}) {
    return apiClient.post("/quality/ccp/export", exportData);
  },

  async getReleaseQueue() {
    return apiClient.get("/quality/release/queue");
  },

  async authorizeRelease(releaseData) {
    return apiClient.post("/quality/release/authorize", releaseData);
  },

  async exportReleaseQueue(exportData = {}) {
    return apiClient.post("/quality/release/export", exportData);
  },

  async getHolds() {
    return apiClient.get("/quality/holds");
  },

  async placeHold(holdData) {
    return apiClient.post("/quality/holds", holdData);
  },

  async exportHolds(exportData = {}) {
    return apiClient.post("/quality/holds/export", exportData);
  },

  async getDeviations() {
    return apiClient.get("/quality/deviations");
  },

  async reportDeviation(deviationData) {
    return apiClient.post("/quality/deviations", deviationData);
  },

  async exportDeviations(exportData = {}) {
    return apiClient.post("/quality/deviations/export", exportData);
  },

  async getAllergenAudits() {
    return apiClient.get("/quality/sanitation/allergen");
  },

  async clearAllergenAudit(auditData) {
    return apiClient.post("/quality/sanitation/allergen/audit", auditData);
  },

  async clearAllAllergenAudits(auditData = {}) {
    return apiClient.post("/quality/sanitation/allergen/clear-all", auditData);
  },

  async exportAllergenAudits(exportData = {}) {
    return apiClient.post("/quality/sanitation/allergen/export", exportData);
  },

  async getLineReadiness() {
    return apiClient.get("/quality/sanitation/readiness");
  },

  async toggleLineReadiness(readinessData) {
    return apiClient.post("/quality/sanitation/readiness/toggle", readinessData);
  },

  async authorizeAllLines(data = {}) {
    return apiClient.post("/quality/sanitation/readiness/authorize-all", data);
  },

  async exportLineReadiness(data = {}) {
    return apiClient.post("/quality/sanitation/readiness/export", data);
  },

  async getCleaningVerification() {
    return apiClient.get("/quality/sanitation/verification");
  },

  async verifyCleaning(data = {}) {
    return apiClient.post("/quality/sanitation/verification", data);
  },

  async resetCleaningVerification(data = {}) {
    return apiClient.post("/quality/sanitation/verification/reset", data);
  },

  async getProcessChecks() {
    return apiClient.get("/quality/checks/process");
  },

  async recordProcessCheck(checkData) {
    return apiClient.post("/quality/checks/process", checkData);
  },

  async toggleProcessCheck(checkData) {
    return apiClient.post("/quality/checks/process/toggle", checkData);
  },

  async calibrateAllProcessChecks(data = {}) {
    return apiClient.post("/quality/checks/process/calibrate-all", data);
  },

  async exportProcessChecks(exportData = {}) {
    return apiClient.post("/quality/checks/process/export", exportData);
  },

  async getProductChecks() {
    return apiClient.get("/quality/checks/product");
  },

  async recordProductCheck(checkData) {
    return apiClient.post("/quality/checks/product", checkData);
  },

  async exportProductChecks(exportData = {}) {
    return apiClient.post("/quality/checks/product/export", exportData);
  },

  async startInvestigation(investigationData) {
    return apiClient.post("/quality/deviations/investigate", investigationData);
  },

  async getInvestigations() {
    return apiClient.get("/quality/investigations");
  },

  async addInvestigationFinding(findingData) {
    return apiClient.post("/quality/investigations/finding", findingData);
  },

  async completeInvestigation(completionData) {
    return apiClient.post("/quality/investigations/complete", completionData);
  },

  async exportInvestigations(exportData = {}) {
    return apiClient.post("/quality/investigations/export", exportData);
  },

  async getNcrs() {
    return apiClient.get("/quality/ncr");
  },

  async createNcr(ncrData) {
    return apiClient.post("/quality/ncr", ncrData);
  },

  async reviewNcr(reviewData) {
    return apiClient.post("/quality/ncr/review", reviewData);
  },

  async exportNcrs(exportData = {}) {
    return apiClient.post("/quality/ncr/export", exportData);
  },

  async reviewHold(holdData) {
    return apiClient.post("/quality/holds/review", holdData);
  },

  async releaseHold(holdData) {
    return apiClient.post("/quality/holds/release", holdData);
  },

  async getBatchReviews() {
    return apiClient.get("/quality/batch/review");
  },

  async reviewBatch(batchData) {
    return apiClient.post("/quality/batch/review", batchData);
  },

  async exportBatchReviews(exportData = {}) {
    return apiClient.post("/quality/batch/export", exportData);
  },

  async getBatchHistory() {
    return apiClient.get("/quality/batch/history");
  },

  async toggleBatchHistory(batchData) {
    return apiClient.post("/quality/batch/history/toggle", batchData);
  },

  async exportBatchHistory(exportData = {}) {
    return apiClient.post("/quality/batch/history/export", exportData);
  },

  async getQualityRecords() {
    return apiClient.get("/quality/batch/records");
  },

  async exportQualityRecords(exportData = {}) {
    return apiClient.post("/quality/batch/records/export", exportData);
  },

  async getApprovedReleases() {
    return apiClient.get("/quality/release/approved");
  },

  async toggleApprovedRelease(releaseData) {
    return apiClient.post("/quality/release/approved/toggle", releaseData);
  },

  async exportApprovedReleases(exportData = {}) {
    return apiClient.post("/quality/release/approved/export", exportData);
  },

  async getBlockedBatches() {
    return apiClient.get("/quality/release/blocked");
  },

  async toggleBlockedBatch(blockedData) {
    return apiClient.post("/quality/release/blocked/toggle", blockedData);
  },

  async exportBlockedBatches(exportData = {}) {
    return apiClient.post("/quality/release/blocked/export", exportData);
  },

  async getDispositionRelease() {
    return apiClient.get("/quality/disposition/release");
  },

  async getDispositionRework() {
    return apiClient.get("/quality/disposition/rework");
  },

  async getDispositionReject() {
    return apiClient.get("/quality/disposition/reject");
  },

  async getDispositionDowngrade() {
    return apiClient.get("/quality/disposition/downgrade");
  },

  async authorizeDisposition(dispositionData) {
    return apiClient.post("/quality/disposition/release", dispositionData);
  },

  async submitRework(reworkData) {
    return apiClient.post("/quality/disposition/rework", reworkData);
  },

  async submitReject(rejectData) {
    return apiClient.post("/quality/disposition/reject", rejectData);
  },

  async submitDowngrade(downgradeData) {
    return apiClient.post("/quality/disposition/downgrade", downgradeData);
  },

  async getQualitySpecs() {
    return apiClient.get("/quality/specs");
  },

  async createQualitySpec(specData) {
    return apiClient.post("/quality/specs", specData);
  },

  async toggleQualitySpecCcp(specData) {
    return apiClient.post("/quality/specs/toggle-ccp", specData);
  },

  async exportQualitySpecs(exportData = {}) {
    return apiClient.post("/quality/specs/export", exportData);
  },

  async getCapaRecords() {
    return apiClient.get("/quality/capa");
  },

  async saveCapaRecord(capaData) {
    return apiClient.post("/quality/capa", capaData);
  },

  async getAuditTrail() {
    return apiClient.get("/quality/audit-trail");
  },

  async getReports() {
    return apiClient.get("/quality/reports");
  },

  async generateReport(reportData) {
    return apiClient.post("/quality/reports/generate", reportData);
  },

  async getNotifications() {
    return apiClient.get("/quality/notifications");
  },

  async markNotificationRead(notifData) {
    return apiClient.post("/quality/notifications/read", notifData);
  },

  async clearNotifications(notifData) {
    return apiClient.post("/quality/notifications/clear", notifData);
  },

  async getProfile() {
    return apiClient.get("/quality/profile");
  },

  async updateProfile(profileData) {
    return apiClient.post("/quality/profile/update", profileData);
  },

  async verifyCert(certData) {
    return apiClient.post("/quality/profile/verify-cert", certData);
  },
};

export default qualityService;





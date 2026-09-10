import apiClient from "./apiClient";

const enc = encodeURIComponent;

export const ciService = {
  // 1. CI Executive Dashboard
  async getDashboardSummary(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/dashboard/summary${query}`);
  },

  // 2. CI Projects & Benefits Verification (21 CFR Part 11)
  async getProjects(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/projects${query}`);
  },

  async getProject(id) {
    return apiClient.get(`/ci/projects/${enc(id)}`);
  },

  async createProject(projectData) {
    return apiClient.post("/ci/projects", projectData);
  },

  async updateProject(id, projectData) {
    return apiClient.put(`/ci/projects/${enc(id)}`, projectData);
  },

  async deleteProject(id) {
    return apiClient.delete(`/ci/projects/${enc(id)}`);
  },

  async verifyAndLockBenefit(id) {
    return apiClient.post(`/ci/projects/${enc(id)}/verify-lock`);
  },

  async unlockBenefit(id, justification) {
    return apiClient.post(`/ci/projects/${enc(id)}/unlock`, { justification });
  },

  async getBenefitsSummary(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/benefits/summary${query}`);
  },

  // 3. RCA 2.0 Investigations Hub
  async getInvestigations(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/rca/investigations${query}`);
  },

  async getInvestigation(id) {
    return apiClient.get(`/ci/rca/investigations/${enc(id)}`);
  },

  async createInvestigation(data) {
    return apiClient.post("/ci/rca/investigations", data);
  },

  async updateInvestigation(id, data) {
    return apiClient.put(`/ci/rca/investigations/${enc(id)}`, data);
  },

  async advanceInvestigationPhase(id, phase) {
    return apiClient.post(`/ci/rca/investigations/${enc(id)}/phase`, { phase });
  },

  async deleteInvestigation(id) {
    return apiClient.delete(`/ci/rca/investigations/${enc(id)}`);
  },

  async getRCASummary(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/rca/summary${query}`);
  },

  // 4. Evidence Locker
  async getEvidence(rcaId) {
    const query = rcaId && rcaId !== "ALL" ? `?rcaId=${enc(rcaId)}` : "";
    return apiClient.get(`/ci/rca/evidence${query}`);
  },

  async createEvidence(data) {
    return apiClient.post("/ci/rca/evidence", data);
  },

  async deleteEvidence(id) {
    return apiClient.delete(`/ci/rca/evidence/${enc(id)}`);
  },

  // 5. Hypotheses & Tests
  async getHypotheses(rcaId) {
    const query = rcaId && rcaId !== "ALL" ? `?rcaId=${enc(rcaId)}` : "";
    return apiClient.get(`/ci/rca/hypotheses${query}`);
  },

  async createHypothesis(data) {
    return apiClient.post("/ci/rca/hypotheses", data);
  },

  async validateHypothesis(id, validationStatus, evidenceResult) {
    return apiClient.post(`/ci/rca/hypotheses/${enc(id)}/validate`, { validationStatus, evidenceResult });
  },

  async deleteHypothesis(id) {
    return apiClient.delete(`/ci/rca/hypotheses/${enc(id)}`);
  },

  // 6. CAPA Actions
  async getCapaActions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.rcaId && filters.rcaId !== "ALL") params.append("rcaId", filters.rcaId);
    if (filters.projectId && filters.projectId !== "ALL") params.append("projectId", filters.projectId);
    if (filters.actionType && filters.actionType !== "ALL") params.append("actionType", filters.actionType);
    if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/ci/capa/actions${qs}`);
  },

  async createCapaAction(data) {
    return apiClient.post("/ci/capa/actions", data);
  },

  async updateCapaStatus(id, status, completionDate, evidenceNotes) {
    return apiClient.patch(`/ci/capa/actions/${enc(id)}/status`, { status, completionDate, evidenceNotes });
  },

  async verifyCapaEffectiveness(id, effectivenessResult) {
    return apiClient.post(`/ci/capa/actions/${enc(id)}/verify`, { effectivenessResult });
  },

  async deleteCapaAction(id) {
    return apiClient.delete(`/ci/capa/actions/${enc(id)}`);
  },

  // 7. Loss Analysis
  async getLosses(plantId, category) {
    const params = new URLSearchParams();
    if (plantId && plantId !== "ALL") params.append("plantId", plantId);
    if (category && category !== "ALL") params.append("category", category);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/ci/losses${qs}`);
  },

  async createLoss(data) {
    return apiClient.post("/ci/losses", data);
  },

  async deleteLoss(id) {
    return apiClient.delete(`/ci/losses/${enc(id)}`);
  },

  async getLossSummary(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/losses/summary${query}`);
  },

  // 8. Standards Library
  async getStandards(plantId, type) {
    const params = new URLSearchParams();
    if (plantId && plantId !== "ALL") params.append("plantId", plantId);
    if (type && type !== "ALL") params.append("type", type);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/ci/standards${qs}`);
  },

  async createStandard(data) {
    return apiClient.post("/ci/standards", data);
  },

  async updateStandard(id, data) {
    return apiClient.put(`/ci/standards/${enc(id)}`, data);
  },

  async deleteStandard(id) {
    return apiClient.delete(`/ci/standards/${enc(id)}`);
  },

  // 9. Verified Solutions Knowledge Base
  async getSolutions(assetId, search) {
    const params = new URLSearchParams();
    if (assetId && assetId !== "ALL") params.append("assetId", assetId);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/ci/solutions${qs}`);
  },

  async createSolution(data) {
    return apiClient.post("/ci/solutions", data);
  },

  async deleteSolution(id) {
    return apiClient.delete(`/ci/solutions/${enc(id)}`);
  },

  // 10. Engineering Capex
  async getCapex(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${enc(plantId)}` : "";
    return apiClient.get(`/ci/capex${query}`);
  },

  async createCapex(data) {
    return apiClient.post("/ci/capex", data);
  },

  async deleteCapex(id) {
    return apiClient.delete(`/ci/capex/${enc(id)}`);
  },

  // 11. Reliability & Bad Actors
  async getReliabilityRecords(plantId, onlyBadActors = false) {
    const params = new URLSearchParams();
    if (plantId && plantId !== "ALL") params.append("plantId", plantId);
    if (onlyBadActors) params.append("onlyBadActors", "true");
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/ci/reliability${qs}`);
  },

  async launchRcaFromBadActor(assetId) {
    return apiClient.post(`/ci/reliability/${enc(assetId)}/launch-rca`);
  },
};

export default ciService;

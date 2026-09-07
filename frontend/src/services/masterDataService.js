import apiClient from "./apiClient";

export const masterDataService = {
  // 1. Companies & Legal Entities
  async getCompanies() {
    return apiClient.get("/master-data/companies");
  },

  async createCompany(companyData) {
    return apiClient.post("/master-data/companies", companyData);
  },

  async updateCompany(id, companyData) {
    return apiClient.put(`/master-data/companies/${id}`, companyData);
  },

  async deleteCompany(id) {
    return apiClient.delete(`/master-data/companies/${id}`);
  },

  // 2. Plants & Sites
  async getPlants() {
    return apiClient.get("/master-data/plants");
  },

  async createPlant(plantData) {
    return apiClient.post("/master-data/plants", plantData);
  },

  async updatePlant(id, plantData) {
    return apiClient.put(`/master-data/plants/${id}`, plantData);
  },

  async deletePlant(id) {
    return apiClient.delete(`/master-data/plants/${id}`);
  },

  // 3. Departments
  async getDepartments(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/departments${query}`);
  },

  async createDepartment(deptData) {
    return apiClient.post("/master-data/departments", deptData);
  },

  async updateDepartment(id, deptData) {
    return apiClient.put(`/master-data/departments/${id}`, deptData);
  },

  async deleteDepartment(id) {
    return apiClient.delete(`/master-data/departments/${id}`);
  },

  // 4. Production Lines
  async getLines(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/lines${query}`);
  },

  async createLine(lineData) {
    return apiClient.post("/master-data/lines", lineData);
  },

  async updateLine(id, lineData) {
    return apiClient.put(`/master-data/lines/${id}`, lineData);
  },

  async deleteLine(id) {
    return apiClient.delete(`/master-data/lines/${id}`);
  },

  // 5. Work Centers & Machine Cells
  async getWorkCenters(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/work-centers${query}`);
  },

  async createWorkCenter(wcData) {
    return apiClient.post("/master-data/work-centers", wcData);
  },

  async updateWorkCenter(id, wcData) {
    return apiClient.put(`/master-data/work-centers/${id}`, wcData);
  },

  async deleteWorkCenter(id) {
    return apiClient.delete(`/master-data/work-centers/${id}`);
  },

  // 6. SKUs, BOMs, Assets, Staff, Specs
  async getSkus() {
    return apiClient.get("/master-data/skus");
  },

  async createSku(skuData) {
    return apiClient.post("/master-data/skus", skuData);
  },

  async getBoms() {
    return apiClient.get("/master-data/boms");
  },

  async getAssets(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/assets${query}`);
  },

  async getStaff(plantId) {
    const query = plantId && plantId !== "ALL" ? `?plantId=${plantId}` : "";
    return apiClient.get(`/master-data/staff${query}`);
  },

  async getQualitySpecs() {
    return apiClient.get("/master-data/quality-specs");
  },
};

export default masterDataService;


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

  // 6. Standard Operations
  async getOperations(department) {
    const query = department && department !== "ALL" ? `?department=${department}` : "";
    return apiClient.get(`/master-data/operations${query}`);
  },

  async createOperation(opData) {
    return apiClient.post("/master-data/operations", opData);
  },

  async updateOperation(id, opData) {
    return apiClient.put(`/master-data/operations/${id}`, opData);
  },

  async deleteOperation(id) {
    return apiClient.delete(`/master-data/operations/${id}`);
  },

  // 7. Routings Master
  async getRoutings() {
    return apiClient.get("/master-data/routings");
  },

  async createRouting(rtgData) {
    return apiClient.post("/master-data/routings", rtgData);
  },

  async updateRouting(id, rtgData) {
    return apiClient.put(`/master-data/routings/${id}`, rtgData);
  },

  async deleteRouting(id) {
    return apiClient.delete(`/master-data/routings/${id}`);
  },

  // 8. Product Families
  async getProductFamilies() {
    return apiClient.get("/master-data/product-families");
  },

  async createProductFamily(familyData) {
    return apiClient.post("/master-data/product-families", familyData);
  },

  async updateProductFamily(id, familyData) {
    return apiClient.put(`/master-data/product-families/${id}`, familyData);
  },

  async deleteProductFamily(id) {
    return apiClient.delete(`/master-data/product-families/${id}`);
  },

  // 9. Units of Measure (UOM)
  async getUoms() {
    return apiClient.get("/master-data/uoms");
  },

  async createUom(uomData) {
    return apiClient.post("/master-data/uoms", uomData);
  },

  async updateUom(id, uomData) {
    return apiClient.put(`/master-data/uoms/${id}`, uomData);
  },

  async deleteUom(id) {
    return apiClient.delete(`/master-data/uoms/${id}`);
  },

  // 10. Packaging & Pack Configurations
  async getPackConfigs() {
    return apiClient.get("/master-data/pack-configs");
  },

  async createPackConfig(packData) {
    return apiClient.post("/master-data/pack-configs", packData);
  },

  async updatePackConfig(id, packData) {
    return apiClient.put(`/master-data/pack-configs/${id}`, packData);
  },

  async deletePackConfig(id) {
    return apiClient.delete(`/master-data/pack-configs/${id}`);
  },

  // 11. Line Targets
  async getLineTargets() {
    return apiClient.get("/master-data/line-targets");
  },

  async createLineTarget(targetData) {
    return apiClient.post("/master-data/line-targets", targetData);
  },

  async updateLineTarget(id, targetData) {
    return apiClient.put(`/master-data/line-targets/${id}`, targetData);
  },

  async deleteLineTarget(id) {
    return apiClient.delete(`/master-data/line-targets/${id}`);
  },

  // 12. Changeover Matrix
  async getChangeoverRules() {
    return apiClient.get("/master-data/changeover-matrix");
  },

  async createChangeoverRule(ruleData) {
    return apiClient.post("/master-data/changeover-matrix", ruleData);
  },

  async updateChangeoverRule(id, ruleData) {
    return apiClient.put(`/master-data/changeover-matrix/${id}`, ruleData);
  },

  async deleteChangeoverRule(id) {
    return apiClient.delete(`/master-data/changeover-matrix/${id}`);
  },

  // 13. Sanitation & Allergens
  async getSanitationClasses() {
    return apiClient.get("/master-data/sanitation-classes");
  },

  async createSanitationClass(sanData) {
    return apiClient.post("/master-data/sanitation-classes", sanData);
  },

  async getAllergenRules() {
    return apiClient.get("/master-data/allergen-rules");
  },

  async createAllergenRule(allergenData) {
    return apiClient.post("/master-data/allergen-rules", allergenData);
  },

  // 14. SKUs, BOMs, Assets, Staff, Specs
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


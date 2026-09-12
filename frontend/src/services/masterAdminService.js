import { apiClient } from "./apiClient";

const extractData = (res) => {
  if (!res) return res;
  if (Array.isArray(res)) return res;
  if (res.data !== undefined && res.success !== undefined) {
    return res.data;
  }
  return res;
};

class MasterAdminService {
  // 1. Dashboard
  async getDashboard() {
    const res = await apiClient.get("/master/dashboard");
    return extractData(res);
  }

  // 2. Companies
  async getCompanies(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/companies${qs}`);
    return extractData(res);
  }

  async getCompanyById(id) {
    const res = await apiClient.get(`/master/companies/${id}`);
    return extractData(res);
  }

  async createCompany(companyData) {
    const res = await apiClient.post("/master/companies", companyData);
    return extractData(res);
  }

  async updateCompany(id, updates) {
    const res = await apiClient.patch(`/master/companies/${id}`, updates);
    return extractData(res);
  }

  async updateCompanyStatus(id, status) {
    const res = await apiClient.patch(`/master/companies/${id}/status`, { status });
    return extractData(res);
  }

  async deleteCompany(id) {
    const res = await apiClient.delete(`/master/companies/${id}`);
    return extractData(res);
  }

  // 3. Company Admins
  async getCompanyAdmins(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/company-admins${qs}`);
    return extractData(res);
  }

  async createCompanyAdmin(adminData) {
    const res = await apiClient.post("/master/company-admins", adminData);
    return extractData(res);
  }

  async updateCompanyAdmin(id, updates) {
    const res = await apiClient.patch(`/master/company-admins/${id}`, updates);
    return extractData(res);
  }

  async updateAdminStatus(id, status) {
    const res = await apiClient.patch(`/master/company-admins/${id}/status`, { status });
    return extractData(res);
  }

  async resetAdminPassword(id) {
    const res = await apiClient.post(`/master/company-admins/${id}/password-reset`, {});
    return extractData(res);
  }

  // 4. Plans & Pricing
  async getPlans() {
    const res = await apiClient.get("/master/plans");
    return extractData(res);
  }

  async createPlan(planData) {
    const res = await apiClient.post("/master/plans", planData);
    return extractData(res);
  }

  async updatePlan(id, updates) {
    const res = await apiClient.patch(`/master/plans/${id}`, updates);
    return extractData(res);
  }

  async updatePlanStatus(id, status) {
    const res = await apiClient.patch(`/master/plans/${id}/status`, { status });
    return extractData(res);
  }

  async deletePlan(id) {
    const res = await apiClient.delete(`/master/plans/${id}`);
    return extractData(res);
  }

  // 5. Subscriptions
  async getSubscriptions(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.plan && params.plan !== "All") query.append("plan", params.plan);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/subscriptions${qs}`);
    return extractData(res);
  }

  async extendSubscription(id) {
    const res = await apiClient.post(`/master/subscriptions/${id}/extend`, {});
    return extractData(res);
  }

  async cancelSubscription(id) {
    const res = await apiClient.post(`/master/subscriptions/${id}/cancel`, {});
    return extractData(res);
  }

  // 6. Payments & Invoicing
  async getPayments(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/payments${qs}`);
    return extractData(res);
  }

  async markPaymentPaid(id) {
    const res = await apiClient.patch(`/master/payments/${id}/paid`, {});
    return extractData(res);
  }

  async getInvoiceData(id) {
    const res = await apiClient.get(`/master/payments/${id}/invoice`);
    return extractData(res);
  }

  // 7. Modules & Features
  async getCompanyModules(companyId) {
    const res = await apiClient.get(`/master/companies/${companyId}/modules`);
    return extractData(res);
  }

  async toggleCompanyModule(companyId, moduleKey, isEnabled) {
    const res = await apiClient.patch(`/master/companies/${companyId}/modules/${moduleKey}`, { isEnabled });
    return extractData(res);
  }

  // 8. Global Platform Users
  async getPlatformUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/platform-users${qs}`);
    return extractData(res);
  }

  async updateUserStatus(id, status) {
    const res = await apiClient.patch(`/master/platform-users/${id}/status`, { status });
    return extractData(res);
  }

  async deleteUser(id) {
    const res = await apiClient.delete(`/master/platform-users/${id}`);
    return extractData(res);
  }

  // 9. Platform Analytics
  async getAnalytics() {
    const res = await apiClient.get("/master/analytics");
    return extractData(res);
  }

  // 10. Activity & Audit Logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.event && params.event !== "All") query.append("event", params.event);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/audit-logs${qs}`);
    return extractData(res);
  }

  // 11. Support Tickets
  async getSupportTickets(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "All") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get(`/master/support-tickets${qs}`);
    return extractData(res);
  }

  async createSupportTicket(ticketData) {
    const res = await apiClient.post("/master/support-tickets", ticketData);
    return extractData(res);
  }

  async updateTicketStatus(id, status, resolution) {
    const res = await apiClient.patch(`/master/support-tickets/${id}/status`, { status, resolution });
    return extractData(res);
  }

  async deleteSupportTicket(id) {
    const res = await apiClient.delete(`/master/support-tickets/${id}`);
    return extractData(res);
  }

  // 12. Platform Settings
  async getSettings() {
    const res = await apiClient.get("/master/settings");
    return extractData(res);
  }

  async updateSettings(settingsData) {
    const res = await apiClient.put("/master/settings", settingsData);
    return extractData(res);
  }
}

export const masterAdminService = new MasterAdminService();

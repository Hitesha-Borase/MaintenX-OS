import apiClient from "./apiClient";

export const notificationsService = {
  async list() {
    const response = await apiClient.get("/notifications");
    return response.data?.data || response.data || [];
  },

  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`, {});
    return response.data?.data || response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch("/notifications/read-all", {});
    return response.data?.data || response.data;
  },

  async deleteNotification(id) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data?.data || response.data;
  },

  async clearAll() {
    const response = await apiClient.delete("/notifications/all");
    return response.data?.data || response.data;
  }
};

export default notificationsService;

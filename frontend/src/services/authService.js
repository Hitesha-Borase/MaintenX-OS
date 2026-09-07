import apiClient from "./apiClient";

export const authService = {
  async login(email, password) {
    const data = await apiClient.post("/auth/login", { email, password });
    if (data?.token) {
      apiClient.setToken(data.token);
    }
    return data;
  },

  async getMe() {
    return apiClient.get("/auth/me");
  },

  async digitalSignOff(pin, meaning, comments = "") {
    return apiClient.post("/auth/sign-off", { pin, meaning, comments });
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // ignore
    } finally {
      apiClient.setToken(null);
    }
  },
};

export default authService;

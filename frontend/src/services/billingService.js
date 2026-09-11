import apiClient from "./apiClient";

export const billingService = {
  async getPlans() {
    return apiClient.get("/billing/plans");
  },

  async createOrder(planId, currency = "INR") {
    return apiClient.post("/billing/create-order", { planId, currency });
  },

  async verifyPayment({ orderId, paymentId, signature, planId }) {
    return apiClient.post("/billing/verify", {
      orderId,
      paymentId,
      signature,
      planId,
    });
  },

  async getSubscription() {
    return apiClient.get("/billing/subscription");
  },
};

export default billingService;

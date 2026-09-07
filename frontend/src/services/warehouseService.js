import apiClient from "./apiClient";

export const warehouseService = {
  async getLots() {
    return apiClient.get("/warehouse/lots");
  },

  async getTransactions() {
    return apiClient.get("/warehouse/transactions");
  },

  async getWarehouses(plantId) {
    const query = plantId ? `?plantId=${plantId}` : "";
    return apiClient.get(`/warehouse/warehouses${query}`);
  },

  async getBins(warehouseId) {
    const query = warehouseId ? `?warehouseId=${warehouseId}` : "";
    return apiClient.get(`/warehouse/bins${query}`);
  },

  async recordStockMovement(movementData) {
    return apiClient.post("/warehouse/transactions", movementData);
  },
};

export default warehouseService;

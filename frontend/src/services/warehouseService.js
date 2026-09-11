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

  // Inventory Operations (Movements, Transfers, Cycle Counts, Adjustments)
  async getOpsMovements(params = {}) {
    return apiClient.get("/warehouse/ops/movements", { params });
  },

  async getOpsTransfers(params = {}) {
    return apiClient.get("/warehouse/ops/transfers", { params });
  },

  async toggleOpsTransferStatus(id, status) {
    return apiClient.post("/warehouse/ops/transfers/toggle", { id, status });
  },

  async getOpsCycleCounts() {
    return apiClient.get("/warehouse/ops/cycle-counts");
  },

  async recordOpsCycleCount(data) {
    return apiClient.post("/warehouse/ops/cycle-counts", data);
  },

  async getOpsAdjustments() {
    return apiClient.get("/warehouse/ops/adjustments");
  },

  async recordOpsAdjustment(data) {
    return apiClient.post("/warehouse/ops/adjustments", data);
  },

  async getDashboardStats() {
    return apiClient.get("/warehouse/dashboard");
  },

  // Inbound Receiving Endpoints
  async getIncomingDeliveries() {
    return apiClient.get("/warehouse/receiving/incoming");
  },

  async toggleDeliveryStatus(id) {
    return apiClient.post(`/warehouse/receiving/incoming/${id}/toggle`, {});
  },

  async getReceivingDetails() {
    return apiClient.get("/warehouse/receiving/receive");
  },

  async receiveMaterial(materialData = {}) {
    return apiClient.post("/warehouse/receiving/receive", materialData);
  },

  async quickReceive(stageData = {}) {
    return apiClient.post("/warehouse/receiving/receive", stageData);
  },

  async getScannerStats() {
    return apiClient.get("/warehouse/receiving/scan");
  },

  async scanBarcode(barcode = "LOT-RM-ORG-4402") {
    return apiClient.post("/warehouse/receiving/scan", { barcode });
  },

  async getInventoryStatus() {
    return apiClient.get("/warehouse/inventory/status");
  },

  async toggleInventoryStatus(id, currentStatus) {
    return apiClient.post("/warehouse/inventory/status/toggle", { id, status: currentStatus });
  },

  async replenishInventoryBuffer(id) {
    return apiClient.post("/warehouse/inventory/status/replenish", { id });
  },

  async getDispatchSummary() {
    return apiClient.get("/warehouse/shipping/dispatch");
  },

  // Purchase Orders & Procurement
  async getPurchaseOrders() {
    return apiClient.get("/warehouse/purchase-orders");
  },

  async createPurchaseOrder(poData) {
    return apiClient.post("/warehouse/purchase-orders", poData);
  },

  async updatePurchaseOrder(poNumber, poData) {
    return apiClient.put(`/warehouse/purchase-orders/${poNumber}`, poData);
  },

  async approvePurchaseOrder(poNumber) {
    return apiClient.post(`/warehouse/purchase-orders/${poNumber}/approve`, {});
  },

  async receivePurchaseOrder(poNumber) {
    return apiClient.post(`/warehouse/purchase-orders/${poNumber}/receive`, {});
  },

  async cancelPurchaseOrder(poNumber) {
    return apiClient.post(`/warehouse/purchase-orders/${poNumber}/cancel`, {});
  },

  async printPurchaseOrder(poNumber) {
    return apiClient.get(`/warehouse/purchase-orders/${poNumber}/print`);
  },

  // Approved Suppliers & Vendor SLA Scorecards
  async getSuppliers() {
    return apiClient.get("/warehouse/suppliers");
  },

  async createSupplier(supplierData) {
    return apiClient.post("/warehouse/suppliers", supplierData);
  },

  async updateSupplier(id, supplierData) {
    return apiClient.put(`/warehouse/suppliers/${id}`, supplierData);
  },

  async createLot(lotData) {
    return apiClient.post("/warehouse/lots", lotData);
  },

  async toggleSupplierStatus(id) {
    return apiClient.post(`/warehouse/suppliers/${id}/toggle-status`, {});
  },

  async getSupplierScorecard(id) {
    return apiClient.get(`/warehouse/suppliers/${id}/scorecard`);
  },

  // WMS Operations
  async getWmsOperations() {
    return apiClient.get("/warehouse/wms/operations");
  },

  async dockCheckIn(checkInData) {
    return apiClient.post("/warehouse/wms/dock-checkin", checkInData);
  },

  async inspectAndAccept(taskData) {
    return apiClient.post("/warehouse/wms/inspect-accept", taskData);
  },

  async completePutAway(putAwayData) {
    return apiClient.post("/warehouse/wms/putaway/complete", putAwayData);
  },

  async recordWmsMovement(movementData) {
    return apiClient.post("/warehouse/wms/movement", movementData);
  },

  async createTransfer(transferData) {
    return apiClient.post("/warehouse/wms/transfers", transferData);
  },

  async confirmPick(pickData) {
    return apiClient.post("/warehouse/wms/pick/confirm", pickData);
  },

  async releaseStaging(stagingData) {
    return apiClient.post("/warehouse/wms/staging/release", stagingData);
  },

  async dispatchShipment(dispatchData) {
    return apiClient.post("/warehouse/wms/dispatch", dispatchData);
  },

  // Physical Location Hierarchy & Transfers
  async getLocationHierarchy() {
    return apiClient.get("/warehouse/locations/hierarchy");
  },

  async getLocationsList(params = {}) {
    return apiClient.get("/warehouse/locations/list", { params });
  },

  async getBinsLocations(params = {}) {
    return apiClient.get("/warehouse/locations/bins", { params });
  },

  async getPutAwayLogs() {
    return apiClient.get("/warehouse/locations/bins/logs");
  },

  async completeBinPutAway(putAwayData) {
    return apiClient.post("/warehouse/locations/bins/putaway", putAwayData);
  },

  async getStagingLocations(params = {}) {
    return apiClient.get("/warehouse/locations/staging", { params });
  },

  async releaseStagingPallets(stagingData) {
    return apiClient.post("/warehouse/locations/staging/release", stagingData);
  },

  async getLocationTransfers(params = {}) {
    return apiClient.get("/warehouse/locations/transfers", { params });
  },

  async createLocationTransfer(transferData) {
    return apiClient.post("/warehouse/locations/transfers", transferData);
  },

  async relocateStock(relocateData) {
    return apiClient.post("/warehouse/locations/relocate", relocateData);
  },

  // 360° Lot Traceability & FDA 21 CFR
  async getTraceability(lotNumber) {
    const query = lotNumber ? `?lot=${encodeURIComponent(lotNumber)}` : "";
    return apiClient.get(`/warehouse/traceability${query}`);
  },

  async simulateRecall(recallData) {
    return apiClient.post("/warehouse/traceability/recall", recallData);
  },

  // Raw Materials Inventory
  async getRawMaterials(params = {}) {
    return apiClient.get("/warehouse/inventory/raw", { params });
  },

  async toggleRawMaterialStatus(id, status) {
    return apiClient.post("/warehouse/inventory/raw/toggle", { id, status });
  },

  // Packaging Materials Inventory
  async getPackagingMaterials(params = {}) {
    return apiClient.get("/warehouse/inventory/packaging", { params });
  },

  async togglePackagingStatus(id, status) {
    return apiClient.post("/warehouse/inventory/packaging/toggle", { id, status });
  },

  // Finished Goods Inventory
  async getFinishedGoods(params = {}) {
    return apiClient.get("/warehouse/inventory/finished-goods", { params });
  },

  // Outbound Shipping Orders & Manifest
  async getShipmentOrders() {
    return apiClient.get("/warehouse/shipping/orders");
  },

  async createShipmentOrder(shipmentData) {
    return apiClient.post("/warehouse/shipping/orders", shipmentData);
  },

  async updateShipmentOrder(id, shipmentData) {
    return apiClient.put(`/warehouse/shipping/orders/${id}`, shipmentData);
  },

  async dispatchShipmentOrder(id) {
    return apiClient.post(`/warehouse/shipping/orders/${id}/dispatch`, {});
  },

  // Picking & Cargo Handling
  async getPickingLists() {
    return apiClient.get("/warehouse/picking/lists");
  },

  async startPickingList(id) {
    return apiClient.post(`/warehouse/picking/lists/${id}/start`, { id });
  },

  async getPickingExecution() {
    return apiClient.get("/warehouse/picking/execution");
  },

  async confirmPickingExecution(payload = {}) {
    return apiClient.post("/warehouse/picking/execution/confirm", payload);
  },

  async getPalletsContainers() {
    return apiClient.get("/warehouse/pallets-containers");
  },

  async loadPalletContainer(id, payload = {}) {
    return apiClient.post(`/warehouse/pallets-containers/${id}/load`, { id, ...payload });
  },

  // Shipment Tracking & ETA
  async getShipmentTracking() {
    return apiClient.get("/warehouse/shipping/tracking");
  },

  async toggleShipmentTracking(id, status) {
    return apiClient.post(`/warehouse/shipping/tracking/${id}/toggle`, { status });
  },

  // Warehouse Inventory Reports
  async getWarehouseReports() {
    return apiClient.get("/warehouse/reports");
  },

  async generateWarehouseReport(reportData = {}) {
    return apiClient.post("/warehouse/reports/generate", reportData);
  },

  async printWarehouseReport(reportData = {}) {
    return apiClient.post("/warehouse/reports/print", reportData);
  },

  // Warehouse Operations Alerts & Notifications
  async getWarehouseNotifications() {
    return apiClient.get("/warehouse/notifications");
  },

  async markNotificationRead(id) {
    return apiClient.post(`/warehouse/notifications/${id}/read`, {});
  },

  async markAllNotificationsRead() {
    return apiClient.post("/warehouse/notifications/mark-all-read", {});
  },

  async deleteNotification(id) {
    return apiClient.delete(`/warehouse/notifications/${id}`);
  },

  async clearAllNotifications() {
    return apiClient.delete("/warehouse/notifications");
  },

  // Warehouse Operator Profile
  async getWarehouseProfile() {
    return apiClient.get("/warehouse/profile");
  },

  async toggleWarehouseCertification(id, status) {
    return apiClient.post(`/warehouse/profile/certifications/${id}/toggle`, { status });
  }
};

export default warehouseService;


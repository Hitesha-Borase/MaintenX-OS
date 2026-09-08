# MaintenX OS — Comprehensive API Matrix & Verification Map

This document catalogs every API in the MaintenX OS Fastify backend with its exact signature, database tables touched, controllers, permissions, auditing, and live verification status.

---

## Global Backend Architecture
- **Protocol & Framework:** Fastify 5 + TypeScript
- **Base URL Prefix:** `http://localhost:4000/api/v1`
- **Data Persistence:** PostgreSQL 16 via Drizzle ORM
- **Authentication:** JWT Bearer Token (`@fastify/jwt`) with dynamic active tenant resolution fallback
- **Regulatory Standard:** 21 CFR Part 11 Digital Signatures + Immutable Audit Log

---

## Complete API Matrix

### 1. Authentication & Session Module (`/api/v1/auth`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | POST | `authRoutes.post("/login")` | `AuthController.login` ➔ `authService.validateUserCredentials` | `users` | `tenants`, `plants`, `roles`, `user_roles` | **VERIFIED (200)** |
| `/auth/me` | GET | `authRoutes.get("/me")` | `AuthController.me` | `users` | `roles` | **VERIFIED (200)** |
| `/auth/sign-off` | POST | `authRoutes.post("/sign-off")` | `AuthController.digitalSignOff` ➔ `authService.verifyDigitalSignaturePin` | `users` | `audit_logs` | **VERIFIED (200)** |

---

### 2. Master Data & Topology Module (`/api/v1/master-data`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/master-data/routings` | GET | `masterDataRoutes.get("/routings")` | `MasterDataController.getRoutings` ➔ `masterDataService.listRoutings` | `routings` | `routing_steps`, `skus`, `production_lines` | **VERIFIED (200)** |
| `/master-data/routings` | POST | `masterDataRoutes.post("/routings")` | `MasterDataController.createRouting` ➔ `masterDataService.createRouting` | `routings` | `routing_steps` | **VERIFIED (201)** |
| `/master-data/routings/:id` | PUT | `masterDataRoutes.put("/routings/:id")` | `MasterDataController.updateRouting` ➔ `masterDataService.updateRouting` | `routings` | `routing_steps` | **VERIFIED (200)** |
| `/master-data/routings/:id` | DELETE | `masterDataRoutes.delete("/routings/:id")` | `MasterDataController.deleteRouting` ➔ `masterDataService.deleteRouting` | `routings` | `routing_steps` | **VERIFIED (200)** |
| `/master-data/skus` | GET | `masterDataRoutes.get("/skus")` | `MasterDataController.getSkus` ➔ `masterDataService.listSkus` | `skus` | `product_families` | **VERIFIED (200)** |
| `/master-data/plants` | GET | `masterDataRoutes.get("/plants")` | `MasterDataController.getPlants` ➔ `masterDataService.listPlants` | `plants` | `tenants` | **VERIFIED (200)** |
| `/master-data/lines` | GET | `masterDataRoutes.get("/lines")` | `MasterDataController.getLines` ➔ `masterDataService.listLines` | `production_lines` | `work_centers`, `plants` | **VERIFIED (200)** |
| `/master-data/work-centers` | GET | `masterDataRoutes.get("/work-centers")` | `MasterDataController.getWorkCenters` ➔ `masterDataService.listWorkCenters` | `work_centers` | `plants` | **VERIFIED (200)** |
| `/master-data/boms` | GET | `masterDataRoutes.get("/boms")` | `MasterDataController.getBoms` ➔ `masterDataService.listBoms` | `boms` | `bom_items`, `skus` | **VERIFIED (200)** |
| `/master-data/operations` | GET | `masterDataRoutes.get("/operations")` | `MasterDataController.getOperations` ➔ `masterDataService.listOperations` | `operations` | `departments` | **VERIFIED (200)** |
| `/master-data/assets` | GET | `masterDataRoutes.get("/assets")` | `MasterDataController.getAssets` ➔ `masterDataService.listAssets` | `assets` | `production_lines` | **VERIFIED (200)** |

---

### 3. Planning & Demand Module (`/api/v1/planning`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/planning/demand/orders` | GET | `planningRoutes.get("/demand/orders")` | `PlanningController.getCustomerOrders` ➔ `planningService.listCustomerOrders` | `customer_orders` | `skus`, `plants` | **VERIFIED (200)** |
| `/planning/demand/orders` | POST | `planningRoutes.post("/demand/orders")` | `PlanningController.createCustomerOrder` ➔ `planningService.createCustomerOrder` | `customer_orders` | `skus` | **VERIFIED (201)** |
| `/planning/forecast/run` | POST | `planningRoutes.post("/forecast/run")` | `PlanningController.runForecast` ➔ `planningService.runStatisticalForecast` | `customer_orders` | `skus` | **VERIFIED (200)** |
| `/planning/aps/schedules` | GET | `planningRoutes.get("/aps/schedules")` | `PlanningController.getApsSchedules` ➔ `planningService.listApsSchedules` | `aps_schedules` | `production_lines`, `skus` | **VERIFIED (200)** |
| `/planning/aps/schedules` | POST | `planningRoutes.post("/aps/schedules")` | `PlanningController.createApsSchedule` ➔ `planningService.createApsSchedule` | `aps_schedules` | `production_lines`, `skus` | **VERIFIED (201)** |
| `/planning/mrp/net-requirements` | GET/POST | `planningRoutes.get/post("/mrp/net-requirements")` | `PlanningController.getMrpExplosion` ➔ `planningService.runMrpExplosion` | `mrp_requirements` | `skus`, `boms`, `inventory_lots` | **VERIFIED (200)** |

---

### 4. Production & MES Execution Module (`/api/v1/production`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/production/orders` | GET | `productionRoutes.get("/orders")` | `ProductionController.getOrders` ➔ `productionService.listOrders` | `production_orders` | `skus`, `production_lines`, `batches` | **VERIFIED (200)** |
| `/production/orders` | POST | `productionRoutes.post("/orders")` | `ProductionController.createOrder` ➔ `productionService.createOrder` | `production_orders` | `batches`, `batch_steps` | **VERIFIED (201)** |
| `/production/orders/:id/status` | PATCH | `productionRoutes.patch("/orders/:id/status")` | `ProductionController.updateOrderStatus` ➔ `productionService.updateOrderStatus` | `production_orders` | None | **VERIFIED (200)** |
| `/production/batches` | GET | `productionRoutes.get("/batches")` | `ProductionController.getBatches` ➔ `productionService.listBatches` | `batches` | `sku`, `steps`, `ccp_checks`, `qa_releases` | **VERIFIED (200)** |
| `/production/batches/:id/advance-step` | PATCH | `productionRoutes.patch("/batches/:id/advance-step")` | `ProductionController.advanceBatchStep` ➔ `productionService.advanceBatchStep` | `batch_steps` | `batches`, `users` | **VERIFIED (200)** |
| `/production/operator/entry` | POST | `productionRoutes.post("/operator/entry")` | `ProductionController.recordOperatorEntry` ➔ `productionService.recordOperatorEntry` | `production_orders` | `users` | **VERIFIED (200)** |
| `/production/downtime/log` | POST | `productionRoutes.post("/downtime/log")` | `ProductionController.logDowntime` ➔ `productionService.logDowntime` | `downtime_logs` | `production_lines`, `assets` | **VERIFIED (200)** |

---

### 5. Quality Assurance & Regulatory Module (`/api/v1/quality`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/quality/ccp` | GET | `qualityRoutes.get("/ccp")` | `QualityController.getCcpChecks` ➔ `qualityService.listCcpChecks` | `ccp_checks` | `batches`, `lines`, `users` | **VERIFIED (200)** |
| `/quality/ccp` | POST | `qualityRoutes.post("/ccp")` | `QualityController.recordCcpCheck` ➔ `qualityService.recordCcpCheck` | `ccp_checks` | `batches`, `users` | **VERIFIED (201)** |
| `/quality/release/queue` | GET | `qualityRoutes.get("/release/queue")` | `QualityController.getQaReleaseQueue` ➔ `qualityService.listQaReleaseQueue` | `batches` | `sku`, `steps`, `ccp_checks` | **VERIFIED (200)** |
| `/quality/release/authorize` | POST | `qualityRoutes.post("/release/authorize")` | `QualityController.authorizeBatchRelease` ➔ `qualityService.authorizeBatchRelease` | `qa_releases` | `batches`, `users`, `audit_logs` | **VERIFIED (200)** |
| `/quality/holds` | GET | `qualityRoutes.get("/holds")` | `QualityController.getQualityHolds` ➔ `qualityService.listQualityHolds` | `quality_holds` | `batches`, `users` | **VERIFIED (200)** |
| `/quality/holds` | POST | `qualityRoutes.post("/holds")` | `QualityController.createQualityHold` ➔ `qualityService.createQualityHold` | `quality_holds` | `users` | **VERIFIED (201)** |

---

### 6. Warehouse & Inventory Module (`/api/v1/warehouse`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/warehouse/lots` | GET | `warehouseRoutes.get("/lots")` | `WarehouseController.getLots` ➔ `warehouseService.listLots` | `inventory_lots` | `skus` | **VERIFIED (200)** |
| `/warehouse/lots` | POST | `warehouseRoutes.post("/lots")` | `WarehouseController.createLot` ➔ `warehouseService.createLot` | `inventory_lots` | `inventory_transactions` | **VERIFIED (201)** |
| `/warehouse/transactions` | GET | `warehouseRoutes.get("/transactions")` | `WarehouseController.getTransactions` ➔ `warehouseService.listTransactions` | `inventory_transactions` | `inventory_lots` | **VERIFIED (200)** |
| `/warehouse/transactions` | POST | `warehouseRoutes.post("/transactions")` | `WarehouseController.recordTransaction` ➔ `warehouseService.recordTransaction` | `inventory_transactions` | `inventory_lots` | **VERIFIED (201)** |
| `/warehouse/warehouses` | GET | `warehouseRoutes.get("/warehouses")` | `WarehouseController.getWarehouses` ➔ `warehouseService.listWarehouses` | `warehouses` | `plants` | **VERIFIED (200)** |
| `/warehouse/bins` | GET | `warehouseRoutes.get("/bins")` | `WarehouseController.getBins` ➔ `warehouseService.listBins` | `location_bins` | `warehouses` | **VERIFIED (200)** |

---

### 7. Maintenance & Asset Management Module (`/api/v1/maintenance`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/maintenance/work-orders` | GET | `maintenanceRoutes.get("/work-orders")` | `MaintenanceController.getWorkOrders` ➔ `maintenanceService.listWorkOrders` | `work_orders` | `assets`, `users` | **VERIFIED (200)** |
| `/maintenance/work-orders` | POST | `maintenanceRoutes.post("/work-orders")` | `MaintenanceController.createWorkOrder` ➔ `maintenanceService.createWorkOrder` | `work_orders` | `assets` | **VERIFIED (201)** |
| `/maintenance/work-orders/:id/status` | PATCH | `maintenanceRoutes.patch("/work-orders/:id/status")` | `MaintenanceController.updateWorkOrderStatus` ➔ `maintenanceService.updateWorkOrderStatus` | `work_orders` | `audit_logs` | **VERIFIED (200)** |
| `/maintenance/pm-schedules` | GET | `maintenanceRoutes.get("/pm-schedules")` | `MaintenanceController.getPMSchedules` ➔ `maintenanceService.listPMSchedules` | `pm_schedules` | `assets` | **VERIFIED (200)** |
| `/maintenance/spare-parts` | GET | `maintenanceRoutes.get("/spare-parts")` | `MaintenanceController.getSpareParts` ➔ `maintenanceService.listSpareParts` | `spare_parts` | None | **VERIFIED (200)** |
| `/maintenance/reliability` | GET | `maintenanceRoutes.get("/reliability")` | `MaintenanceController.getReliabilityMetrics` ➔ `maintenanceService.getReliabilityMetrics` | `assets` | `work_orders`, `downtime_logs` | **VERIFIED (200)** |

---

### 8. Traceability & Product Recall Module (`/api/v1/traceability`)

| Endpoint | Method | Fastify Route | Controller / Service | Primary Table | Related Tables | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/traceability/genealogy/:lotNumber` | GET | `traceabilityRoutes.get("/genealogy/:lotNumber")` | `TraceabilityController.getGenealogy` ➔ `traceabilityService.getGenealogyTree` | `inventory_lots` | `batches`, `inventory_transactions` | **VERIFIED (200)** |
| `/traceability/recall/simulate` | POST | `traceabilityRoutes.post("/recall/simulate")` | `TraceabilityController.runRecallSimulation` ➔ `traceabilityService.simulateRecall` | `recall_events` | `inventory_lots`, `skus`, `batches` | **VERIFIED (200)** |

---

## Automated Verification Summary

All 40+ endpoints listed above have been systematically verified against:
1. **Schema Integrity:** Every query adheres strictly to Drizzle ORM schemas.
2. **PostgreSQL Execution:** Executed live on database `maintenxos` at `localhost:5432`.
3. **Response Protocol:** All endpoints return `{ success: true, data: ..., message: ... }` conforming to the unified response formatter.
4. **Security & Context:** Authenticated with dynamic active tenant resolution, completely eliminating historical 500/404 errors.

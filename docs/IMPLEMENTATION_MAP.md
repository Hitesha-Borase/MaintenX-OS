# MaintenX OS — Autonomous Full-Stack Workflow Implementation Map

This document establishes the end-to-end traceability mapping connecting every Frontend Page to its Business Purpose, Displayed UI Elements, Fastify API Endpoint, Controller, Backend Service, Drizzle ORM Queries, Physical PostgreSQL Tables, Foreign Key Relations, Authorization Permissions, and Auditing Requirements.

---

## Master Workflow Dependency Topology

```
Master Data (Plant, Lines, Work Centers, SKUs, BOMs, Routings)
     │
     ▼
Planning & Demand (Customer Orders, APS Gantt, MRP Explosion)
     │
     ▼
Warehouse Inbound (PO Receipts, Lots, Bins, Put-Away)
     │
     ▼
Production Execution (MES Production Orders, 6-Step eBR Batches, Operator HMI, Downtime Logs)
     │
     ▼
Quality & Compliance (In-Process CCP Checks, Out-of-Spec Holds, 21 CFR Part 11 Digital Release)
     │
     ▼
Maintenance & Reliability (Work Orders, Asset Health, PM Routines, Spare Parts)
     │
     ▼
Traceability & Governance (Lot Genealogy Trees, Recall Simulation, Immutable Audit Trail)
```

---

## Complete Page-to-Database Traceability Matrix

### 1. Master Data & Facility Configuration

#### Page: Standard Routings (`/admin/masterdata/routings`)
- **Business Purpose:** Engineer and manage multi-step manufacturing routings linking SKUs to specific production lines, expected yields, and nominal speeds.
- **Displayed Data:** Routing code, SKU code/name, line code/name, run rate (BPH), setup minutes, expected yield %, approval status, sequential operations list.
- **User Actions:** Create routing, view routing details, edit parameters, toggle status, delete routing.
- **Required Data:** Active SKUs, Production Lines, Work Centers, Operations catalog.
- **API Endpoint:** `GET /api/v1/master-data/routings`, `POST /api/v1/master-data/routings`, `PUT /api/v1/master-data/routings/:id`, `DELETE /api/v1/master-data/routings/:id`.
- **Backend Controller:** `MasterDataController.getRoutings`, `createRouting`, `updateRouting`, `deleteRouting`.
- **Backend Service:** `masterDataService.listRoutings`, `createRouting`, `updateRouting`, `deleteRouting`.
- **Database Tables:** `routings` (Primary), `routing_steps` (Child).
- **Related Tables:** `skus`, `production_lines`, `work_centers`, `plants`, `tenants`.
- **Permissions:** `master_data:read`, `master_data:create`, `master_data:update`, `master_data:delete`.
- **Audit Requirement:** Log routing revisions and status changes in `audit_logs`.
- **Workflow Dependency:** Required before Production Orders and Batches can calculate nominal run durations.

#### Page: SKUs & Product Families (`/admin/masterdata/skus`)
- **Business Purpose:** Central repository for all Raw Materials, Packaging, Intermediate Blends, and Finished Goods.
- **Displayed Data:** SKU code, product description, category, family name, standard cost, UOM, shelf life, min/max thresholds.
- **User Actions:** Register SKU, edit specs, deactivate SKU.
- **API Endpoint:** `GET /api/v1/master-data/skus`, `POST /api/v1/master-data/skus`.
- **Backend Controller:** `MasterDataController.getSkus`, `createSku`.
- **Backend Service:** `masterDataService.listSkus`, `createSku`.
- **Database Tables:** `skus` (Primary), `product_families`.
- **Permissions:** `master_data:read`, `master_data:write`.

---

### 2. Planning & Demand Management

#### Page: Demand & Customer Orders (`/planner/demand/orders`)
- **Business Purpose:** Track incoming customer orders, due dates, shipment status, and target quantities.
- **Displayed Data:** Order number, customer name, SKU code, ordered quantity, fulfilled quantity, priority, required date, status.
- **User Actions:** Create demand order, prioritize orders, release to APS schedule.
- **API Endpoint:** `GET /api/v1/planning/demand/orders`, `POST /api/v1/planning/demand/orders`.
- **Backend Controller:** `PlanningController.getCustomerOrders`, `createCustomerOrder`.
- **Backend Service:** `planningService.listCustomerOrders`, `createCustomerOrder`.
- **Database Tables:** `customer_orders`.
- **Related Tables:** `skus`, `plants`, `tenants`.
- **Permissions:** `planning:read`, `planning:write`.

#### Page: Multi-Line APS Gantt (`/planner/aps/gantt`)
- **Business Purpose:** Finite-capacity sequence optimization across packaging and bottling lines with automated changeover matrix.
- **Displayed Data:** Interactive Gantt blocks, line capacity utilization, changeover cleaning blocks, scheduled start/end.
- **User Actions:** Schedule production block, resequence jobs, publish schedule.
- **API Endpoint:** `GET /api/v1/planning/aps/schedules`, `POST /api/v1/planning/aps/schedules`.
- **Backend Controller:** `PlanningController.getApsSchedules`, `createApsSchedule`.
- **Backend Service:** `planningService.listApsSchedules`, `createApsSchedule`.
- **Database Tables:** `aps_schedules`.
- **Related Tables:** `production_lines`, `skus`, `customer_orders`.

#### Page: MRP Net Requirements (`/planner/mrp/net-requirements`)
- **Business Purpose:** Material Requirements Planning exploding BOMs against on-hand inventory to highlight component shortages.
- **Displayed Data:** Component SKU, Gross Requirement, Current On-Hand, Net Shortage, Suggested Inbound Purchase Date.
- **User Actions:** Run MRP calculation, export shortage requisition.
- **API Endpoint:** `GET /api/v1/planning/mrp/net-requirements`, `POST /api/v1/planning/mrp/net-requirements`.
- **Backend Controller:** `PlanningController.getMrpExplosion`.
- **Backend Service:** `planningService.runMrpExplosion`.
- **Database Tables:** `mrp_requirements`.
- **Related Tables:** `skus`, `boms`, `bom_items`, `inventory_lots`.

---

### 3. Production Execution & MES

#### Page: Production Orders (`/production/orders` & `/planner/orders`)
- **Business Purpose:** Dispatch and monitor execution of released shop-floor manufacturing orders.
- **Displayed Data:** Order #, SKU, target quantity, produced quantity, scrap quantity, status (PLANNED, RUNNING, COMPLETED), line.
- **User Actions:** Dispatch order, start line run, complete order, record scrap.
- **API Endpoint:** `GET /api/v1/production/orders`, `POST /api/v1/production/orders`, `PATCH /api/v1/production/orders/:id/status`.
- **Backend Controller:** `ProductionController.getOrders`, `createOrder`, `updateOrderStatus`.
- **Backend Service:** `productionService.listOrders`, `createOrder`, `updateOrderStatus`.
- **Database Tables:** `production_orders`.
- **Related Tables:** `skus`, `production_lines`, `batches`.
- **Permissions:** `production:read`, `production:execute`.

#### Page: Electronic Batch Records (eBR) (`/production/batches`)
- **Business Purpose:** Complete 6-step paperless batch tracking adhering to GMP/HACCP standards.
- **Displayed Data:** Batch #, linked Order #, SKU, tank allocation, volume, progress %, current step (1 to 6).
- **User Actions:** Advance batch step, scan ingredient barcodes, record verification PIN, submit to QA release queue.
- **API Endpoint:** `GET /api/v1/production/batches`, `PATCH /api/v1/production/batches/:id/advance-step`.
- **Backend Controller:** `ProductionController.getBatches`, `advanceBatchStep`.
- **Backend Service:** `productionService.listBatches`, `advanceBatchStep`.
- **Database Tables:** `batches` (Primary), `batch_steps` (Child).
- **Related Tables:** `production_orders`, `skus`, `users`, `ccp_checks`.
- **Permissions:** `production:execute`.

#### Page: Operator HMI & Downtime (`/operator/hmi`)
- **Business Purpose:** Touchscreen line control interface for machine operators to record scrap, output, and micro-stoppages.
- **Displayed Data:** Current speed (BPM), good count, reject count, active batch info, quick stoppage reason buttons.
- **User Actions:** Increment produced counter, log downtime stoppage, request raw materials.
- **API Endpoint:** `POST /api/v1/production/operator/entry`, `POST /api/v1/production/downtime/log`.
- **Backend Controller:** `ProductionController.recordOperatorEntry`, `logDowntime`.
- **Backend Service:** `productionService.recordOperatorEntry`, `logDowntime`.
- **Database Tables:** `downtime_logs`, `production_orders`.
- **Related Tables:** `assets`, `production_lines`, `users`.

---

### 4. Quality Assurance & Regulatory Compliance (QMS)

#### Page: CCP Checks & In-Process Quality (`/quality/ccp`)
- **Business Purpose:** Real-time logging of critical food safety control parameters with automated PASS/FAIL validation.
- **Displayed Data:** CCP Code, parameter name, target value, actual value, limits, UOM, status (PASS/FAIL), operator, timestamp.
- **User Actions:** Record CCP reading, enter corrective action on fail.
- **API Endpoint:** `GET /api/v1/quality/ccp`, `POST /api/v1/quality/ccp`.
- **Backend Controller:** `QualityController.getCcpChecks`, `recordCcpCheck`.
- **Backend Service:** `qualityService.listCcpChecks`, `recordCcpCheck`.
- **Database Tables:** `ccp_checks`.
- **Related Tables:** `batches`, `production_lines`, `users`.

#### Page: 21 CFR Part 11 QA Release Queue (`/quality/release/queue`)
- **Business Purpose:** Multi-signature batch disposition authorization with cryptographic PIN authentication.
- **Displayed Data:** Finished goods batches awaiting release, test summary, CoA link, disposition status.
- **User Actions:** Authorize release (RELEASED, REJECTED, QUARANTINED), enter digital signature PIN.
- **API Endpoint:** `GET /api/v1/quality/release/queue`, `POST /api/v1/quality/release/authorize`.
- **Backend Controller:** `QualityController.getQaReleaseQueue`, `authorizeBatchRelease`.
- **Backend Service:** `qualityService.listQaReleaseQueue`, `authorizeBatchRelease`.
- **Database Tables:** `qa_releases`, `batches`.
- **Related Tables:** `users`, `audit_logs`.

#### Page: Quarantine & Quality Holds (`/quality/holds`)
- **Business Purpose:** Place defective or suspect lots under quarantine to prevent warehouse movement or dispatch.
- **Displayed Data:** Lot #, Batch #, reason, severity, hold date, QA officer, status (ACTIVE_HOLD, RELEASED).
- **User Actions:** Place hold, lift hold with justification.
- **API Endpoint:** `GET /api/v1/quality/holds`, `POST /api/v1/quality/holds`.
- **Backend Controller:** `QualityController.getQualityHolds`, `createQualityHold`.
- **Backend Service:** `qualityService.listQualityHolds`, `createQualityHold`.
- **Database Tables:** `quality_holds`.

---

### 5. Warehouse Management & Logistics (WMS)

#### Page: Inventory Lots & Bins (`/warehouse/locations/bins-racks` & `/warehouse/dashboard`)
- **Business Purpose:** Real-time visibility into warehouse zones, aisle/rack bins, and inventory lots.
- **Displayed Data:** Lot #, SKU name, quantity on hand, location bin, QA status, expiry date.
- **User Actions:** Ingest new lot, transfer stock between bins, record put-away.
- **API Endpoint:** `GET /api/v1/warehouse/lots`, `POST /api/v1/warehouse/lots`, `GET /api/v1/warehouse/transactions`, `POST /api/v1/warehouse/transactions`.
- **Backend Controller:** `WarehouseController.getLots`, `createLot`, `getTransactions`, `recordTransaction`.
- **Backend Service:** `warehouseService.listLots`, `createLot`, `listTransactions`, `recordTransaction`.
- **Database Tables:** `inventory_lots`, `inventory_transactions`, `location_bins`, `warehouses`.
- **Related Tables:** `skus`, `plants`, `users`.

---

### 6. Maintenance & Reliability (CMMS)

#### Page: Work Orders & Asset Reliability (`/maintenance/work-orders` & `/maintenance`)
- **Business Purpose:** Preventative and corrective work order management to maximize MTBF and minimize MTTR.
- **Displayed Data:** WO #, Asset code/name, title, priority, status (OPEN, IN_PROGRESS, COMPLETED), assigned technician, hours.
- **User Actions:** Create work order, change status, assign technician, log completion.
- **API Endpoint:** `GET /api/v1/maintenance/work-orders`, `POST /api/v1/maintenance/work-orders`, `PATCH /api/v1/maintenance/work-orders/:id/status`.
- **Backend Controller:** `MaintenanceController.getWorkOrders`, `createWorkOrder`, `updateWorkOrderStatus`.
- **Backend Service:** `maintenanceService.listWorkOrders`, `createWorkOrder`, `updateWorkOrderStatus`.
- **Database Tables:** `work_orders`, `assets`, `pm_schedules`, `spare_parts`.
- **Related Tables:** `users`, `production_lines`.

---

### 7. Traceability & Product Recall

#### Page: Lot Genealogy & Recall Simulation (`/traceability/genealogy`)
- **Business Purpose:** 360-degree bidirectional lot genealogy tracking from farm supplier ingredients to distributed retail batches.
- **Displayed Data:** Interactive DAG visual tree showing parent raw lots, consumption transactions, child finished batches.
- **User Actions:** Search lot number, run mock recall simulation, export regulatory audit package.
- **API Endpoint:** `GET /api/v1/traceability/genealogy/:lotNumber`, `POST /api/v1/traceability/recall/simulate`.
- **Backend Controller:** `TraceabilityController.getGenealogy`, `runRecallSimulation`.
- **Backend Service:** `traceabilityService.getGenealogyTree`, `simulateRecall`.
- **Database Tables:** `recall_events`, `inventory_lots`, `inventory_transactions`.
- **Related Tables:** `batches`, `skus`, `users`.

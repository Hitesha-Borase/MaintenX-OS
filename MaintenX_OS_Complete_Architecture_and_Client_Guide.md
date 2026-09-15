# MaintenX-OS: Enterprise Smart Manufacturing & Maintenance Execution System
## Complete A-to-Z Architecture, Data Flow & Client Operational Guide

---

## 1. Executive System Overview

**MaintenX-OS** is an end-to-end, multi-tenant Smart Manufacturing Execution System (MES), Warehouse Management System (WMS), and Enterprise Asset & Maintenance Management System (CMMS). It is engineered for industrial manufacturing plants, food & beverage processing facilities, packaging units, and discrete manufacturing operations.

### Key Pillars:
1. **Multi-Tenant & Multi-Plant Architecture:** One instance supports multiple enterprises (Tenants) and multiple manufacturing units (Plants) with strict data isolation.
2. **Real-time Shop Floor & CCP Monitoring:** Tracks Critical Control Points (CCP), quality tolerances, and line downtime live.
3. **End-to-End Traceability:** Complete genealogy from raw material receipt (GRN/Lot) through production work order batching to finished goods dispatch.
4. **Predictive & Preventive Maintenance:** CMMS for plant equipment, work orders, MTBF/MTTR tracking, spare parts inventory, and breakdown analytics.
5. **Real-time Executive Intelligence:** Real-time OEE (Availability × Performance × Quality), yield loss analysis, and labour standard costing.

---

## 2. Complete Folder Structure Breakdown

```
MaintenX-OS/
├── backend/                         # Core Backend API Server (Node.js + Fastify + TypeScript)
│   ├── .env                         # Backend Environment Config (DB URL, JWT Secret, Port)
│   ├── package.json                 # Backend dependencies & build scripts
│   ├── tsconfig.json                # TypeScript compiler configuration
│   ├── src/
│   │   ├── app.ts                   # Fastify application bootstrap & plugin registration
│   │   ├── server.ts                # HTTP Server entry point (starts server on port 5001)
│   │   ├── db/
│   │   │   ├── index.ts             # Drizzle ORM client instance connected to PostgreSQL
│   │   │   └── schema/              # Database Schema Definitions (19 domain files, 120+ tables)
│   │   │       ├── tenants.ts       # Multi-tenant companies, plants & subscriptions
│   │   │       ├── users.ts         # User auth, roles (Admin, Operator, Planner, Tech)
│   │   │       ├── masterData.ts    # Lines, Work Centers, SKUs, BOMs, Routings, UOMs
│   │   │       ├── masterAdmin.ts   # System-wide administrative settings & global lookups
│   │   │       ├── production.ts    # Work orders, production runs, batches & shifts
│   │   │       ├── quality.ts       # Quality inspections, CCP checks, QA releases & holds
│   │   │       ├── warehouse.ts     # Receiving, GRN, inventory lots, bins & shipping dispatches
│   │   │       ├── maintenance.ts   # Assets, PM schedules, work orders, meter readings
│   │   │       ├── traceability.ts  # Material genealogy, backward/forward lot tracking
│   │   │       ├── iot.ts           # Machine sensors, telemetry & real-time line alarms
│   │   │       ├── ci.ts            # Continuous improvement, Kaizen projects & RCA
│   │   │       ├── billing.ts       # Tenant subscription plans & invoicing
│   │   │       └── audit.ts         # Audit logs, compliance & security event tracking
│   │   ├── middleware/
│   │   │   └── authenticate.ts      # JWT Token verification, RBAC & Tenant/Plant context injector
│   │   └── modules/                 # Modular Domain Business Logic (Routes + Controllers + Services)
│   │       ├── auth/                # Login, Registration, Password Reset & Session tokens
│   │       ├── admin/               # Tenant onboarding, user provisioning & role assignments
│   │       ├── master-data/         # CRUD for SKUs, BOMs, Routings, Lines, Staff & Standards
│   │       ├── planning/            # MRP, schedule gantt charts & work order generation
│   │       ├── production/          # Work order dispatch, batch execution & downtime recording
│   │       ├── quality/             # QA test plans, CCP limit monitoring & release approvals
│   │       ├── warehouse/           # Inward receiving, inventory transfers, pick-pack & shipping
│   │       ├── maintenance/         # Asset hierarchy, work order dispatch, preventive maintenance
│   │       ├── traceability/        # Forward and reverse lot genealogy queries
│   │       ├── dashboards/          # Aggregated metrics for Plant Managers, Lines, and Execs
│   │       ├── iot/                 # Telemetry ingestion, line speed & temperature sensors
│   │       └── ci/                  # Kaizen, 5S audits, Root Cause Analysis (RCA)
│   └── dist/                        # Compiled JavaScript production build
│
├── frontend/                        # Frontend Web Application (React + Vite + Tailwind CSS)
│   ├── .env                         # Frontend API endpoint config (VITE_API_URL=http://localhost:5001/api/v1)
│   ├── index.html                   # HTML5 document root
│   ├── vite.config.js               # Vite build and proxy configuration
│   ├── package.json                 # Frontend dependencies (React Router, Lucide icons, etc.)
│   └── src/
│       ├── main.jsx                 # React root DOM rendering
│       ├── App.jsx                  # Main application router and theme provider
│       ├── api/
│       │   └── client.js            # Axios HTTP client with JWT interceptor & base URL
│       ├── components/              # Reusable UI Component Library
│       │   ├── layout/              # Sidebar navigation, Top Header, Tenant/Plant selector
│       │   ├── common/              # Buttons, Modals, Badges, Data Tables, Stat Cards
│       │   └── charts/              # Recharts / SVG visualizers for OEE and downtime
│       └── pages/                   # Business Dashboard Views (Categorized by Department)
│           ├── auth/                # LoginPage, RegisterPage, ForgotPassword
│           ├── admin/               # CompanySettings, UserManagement, RoleManagement
│           ├── master/              # SKUList, BOMEditor, LineSetup, AssetCatalog, StaffDirectory
│           ├── planning/            # ProductionScheduler, CapacityPlanning, MRPOverview
│           ├── production/          # ActiveRunMonitor, ShiftLog, DowntimeLogger, WorkOrderList
│           ├── quality/             # InspectionLog, CCPLimitsPage, QuarantineList, CoAReports
│           ├── warehouse/           # InwardReceiving, InventoryStock, ShippingDispatch, BinTransfer
│           ├── maintenance/         # AssetTree, WorkOrderBoard, PreventativeMaintenance, SpareParts
│           ├── traceability/        # LotGenealogyExplorer, RecallSimulator, AuditTrail
│           ├── dashboards/          # PlantManagerDashboard, ExecutiveOEE, LineLeadView
│           └── ci/                  # KaizenTracker, RCABoard, FiveSAudits
│
└── database/                        # PostgreSQL Database DDL, Migrations & Dumps
    ├── schema.sql                   # Baseline database tables definition
    └── maintenxos 15-09-2026.sql    # Complete PostgreSQL Production database snapshot (121 Tables)
```

---

## 3. Technology Stack & Architectural Patterns

| Layer | Technology | Purpose & Responsibility |
|---|---|---|
| **Frontend UI** | **React.js 18 + Vite** | High-performance SPA with instant HMR and dynamic client-side routing. |
| **Styling** | **Tailwind CSS + CSS Modules** | Modern, responsive enterprise interface with dark/light themes. |
| **Icons & Visuals**| **Lucide React + Recharts** | Crisp vector iconography and real-time SVG charting for KPIs. |
| **API Client** | **Axios with Interceptors** | Auto-attaches JWT bearer token and injects `X-Tenant-Id` and `X-Plant-Id` headers. |
| **Backend Runtime**| **Node.js (v18+) + TypeScript** | Strongly-typed, highly reliable asynchronous micro-monolith engine. |
| **Web Framework** | **Fastify** | Low-overhead, ultra-fast web framework with JSON schema validation. |
| **Database ORM** | **Drizzle ORM & Postgres.js**| Type-safe SQL queries with zero overhead and full migration control. |
| **Database Engine**| **PostgreSQL 18** | Relational enterprise database with ACID guarantees, foreign keys, and indexes. |
| **Security & Auth**| **JWT (jsonwebtoken) + bcrypt**| Stateless authentication with salted password hashing and role-based permissions. |

---

## 4. Step-by-Step User Journey ("Pehle Kahan Jana Hai Aur Kaise Karna Hai")

When a client or factory staff logs in for the first time, here is the exact operational sequence to follow:

```
[Step 1: Admin & Onboarding] ──► [Step 2: Master Data Setup] ──► [Step 3: Inward Warehouse (GRN)]
                                                                               │
[Step 6: Outward Shipping] ◄─── [Step 5: Shop Floor Execution] ◄─── [Step 4: Planning & Work Orders]
           │                                      ▲
           ▼                                      │
[Step 7: Maintenance (CMMS)] ──► [Step 8: Executive OEE & CI Dashboards]
```

### Step 1: User & Plant Administration
* **Where to go:** `/admin/plants` & `/admin/users`
* **What to do:**
  1. Define your **Company** name and legal registration.
  2. Create manufacturing **Plants** (e.g., *Plant 1 - North Facility*, *Plant 2 - South Packaging*).
  3. Invite and provision **Users** with distinct roles:
     * **System Admin:** Full configuration access.
     * **Plant Manager:** Global plant oversight, OEE analytics, approvals.
     * **Planner:** MRP, scheduling, and work order creation.
     * **Line Operator:** Production batch entry, CCP checklist logging, downtime logging.
     * **Quality Specialist:** Quality inspection, CCP tolerance checks, quarantine/release.
     * **Maintenance Technician:** Machine repair, spare parts consumption, PM checklist completion.
     * **Warehouse Executive:** Inward goods receipt, inventory transfers, dispatch orders.

---

### Step 2: Master Data Configuration (The Foundation)
* **Where to go:** `/master-data/*`
* **Why it matters:** Production cannot run without master records. Set these up once:
  1. **Departments & Production Lines (`/master/lines`):** Create lines (e.g., *Bottling Line 01*, *Packaging Line 02*).
  2. **Work Centers & Operations (`/master/operations`):** Map processing stations (Mixing, Baking, Filling, Labeling).
  3. **Product Families & SKUs (`/master/skus`):** Register finished goods and raw materials with barcodes and UOMs (Kg, Litres, Boxes).
  4. **Bill of Materials - BOM (`/master/boms`):** Define recipes (e.g., 100 units of SKU-A requires 50kg Flour, 10kg Sugar, 5kg Oil).
  5. **Quality Specifications & CCP Limits (`/master/quality-specs`):** Define tolerances (e.g., Seal Temperature: 180°C ± 5°C, pH level: 4.5 to 5.2).
  6. **Labour Standards (`/master/labour-standards`):** Set crew size and standard hours required per 1,000 units.
  7. **Assets & Machines (`/master/assets`):** Register equipment (Mixer 101, Oven 202, Conveyor 303) with serial numbers.

---

### Step 3: Inward Warehouse Receiving & Raw Materials
* **Where to go:** `/warehouse/receiving`
* **What to do:**
  1. Raw material trucks arrive at the factory dock.
  2. The warehouse executive logs a **Goods Receipt Note (GRN)**.
  3. The system generates a **Batch/Lot ID** with supplier details, expiry dates, and PO numbers.
  4. Assign material to a specific **Warehouse Bin/Rack location**.
  5. Raw material inventory is immediately updated in the PostgreSQL database.

---

### Step 4: Production Planning & Scheduling
* **Where to go:** `/planning/scheduler`
* **What to do:**
  1. The production planner reviews incoming customer demand.
  2. Generates a **Work Order** targeting a specific SKU, planned quantity, and target date.
  3. The system checks BOM inventory availability:
     * If materials are available: Status moves to **Approved / Ready for Dispatch**.
     * If materials are missing: Alerts warehouse to restock.
  4. Dispatches Work Order to the scheduled Production Line and Shift.

---

### Step 5: Shop Floor Execution, CCP Quality & Downtime
* **Where to go:** `/production/active-run` & `/quality/ccp-checks`
* **What to do:**
  1. **Operator Starts Run:** Line lead selects the dispatched Work Order and clicks **Start Run**.
  2. **Live Production Logging:** Operator logs good units produced vs scrap units.
  3. **CCP Checkpoints:** During the run, operators or QA specialists record critical measurements (temperature, metal detection, pressure).
     * If values are within limits: System marks **Passed**.
     * If values breach limits: Instant alert triggers, and the batch is automatically flagged for quarantine.
  4. **Downtime Logging:** If a machine stops, operator records downtime cause (e.g., Jam, Motor Failure, Power Trip).

---

### Step 6: Finished Goods & Outward Shipping
* **Where to go:** `/warehouse/shipping` & `/quality/releases`
* **What to do:**
  1. Once production finishes, the finished batch moves to the QA holding area.
  2. Quality Manager reviews inspection data and signs off on a **QA Certificate of Analysis (CoA) & Release**.
  3. Approved stock moves to Finished Goods Warehouse.
  4. Shipping executive creates a **Dispatch Note / Bill of Lading (BOL)**:
     * Selects customer order.
     * Scans finished goods pallets/lots.
     * System marks lots as **Dispatched / Shipped**.

---

### Step 7: Asset Maintenance, PM & Breakdowns (CMMS)
* **Where to go:** `/maintenance/workorders` & `/maintenance/pm`
* **What to do:**
  1. **Corrective Maintenance:** If an operator logs a breakdown, an urgent Maintenance Work Order is generated automatically.
  2. **Preventive Maintenance (PM):** Regular inspection calendars (daily, weekly, monthly lubrication and sensor checks) notify technicians.
  3. **Spare Parts Consumption:** Technicians record spare parts used (bearings, belts, filters), updating spare parts inventory.
  4. System computes live **MTBF (Mean Time Between Failures)** and **MTTR (Mean Time To Repair)**.

---

### Step 8: Executive Dashboards & Continuous Improvement (CI)
* **Where to go:** `/dashboards/executive` & `/ci/kaizen`
* **What to do:**
  1. Executives and Plant Managers view live OEE, line speeds, and cost per unit.
  2. Engineering teams review Pareto charts of top failure modes.
  3. Launch **Kaizen projects** and **5S Audits** linked to specific lines to systematically eliminate recurring losses.

---

## 5. Complete Data Flow (Frontend to Database)

Every single button click in MaintenX-OS follows this strict, reliable path:

```
[1. User Action in React UI]
           │
           ▼
[2. API Client (src/api/client.js)]
    - Adds JWT Bearer token in Authorization header
    - Adds X-Tenant-Id & X-Plant-Id headers
           │
           ▼
[3. Fastify Route Handler (backend/src/modules/*/*.routes.ts)]
    - Verifies HTTP Method & URL path (e.g., POST /api/v1/master-data/skus)
           │
           ▼
[4. Authentication & RBAC Middleware (backend/src/middleware/authenticate.ts)]
    - Validates JWT token signature
    - Confirms user has permission for this action
           │
           ▼
[5. Module Controller (backend/src/modules/*/*.controller.ts)]
    - Parses HTTP Request Body, Query params, and Route params
    - Validates input schemas
           │
           ▼
[6. Module Business Service (backend/src/modules/*/*.service.ts)]
    - Executes enterprise business logic
    - Performs calculations, validations, and state checks
           │
           ▼
[7. Drizzle ORM & SQL Execution (backend/src/db/)]
    - Executes type-safe parameterized SQL query against PostgreSQL 18
           │
           ▼
[8. PostgreSQL 18 Database Engine]
    - Commits transaction, applies triggers, updates indexes
           │
           ▼
[9. JSON Response Serialization]
    - Returns standard HTTP 200/201 JSON payload back to React
           │
           ▼
[10. React UI State Update]
    - React updates modal, displays success toast, and refreshes data table
```

---

## 6. Comprehensive Module & Dashboard Catalog

| Department | UI Route & Screen | Source Component | Backend API Endpoint | Database Tables | Business Purpose |
|---|---|---|---|---|---|
| **Auth** | `/login` | `pages/auth/LoginPage.jsx` | `POST /api/v1/auth/login` | `users`, `tenants` | Secure user authentication, JWT generation, and tenant selection. |
| **Admin** | `/admin/companies` | `pages/admin/Companies.jsx` | `GET/POST /api/v1/admin/companies` | `companies`, `tenants` | Manage legal enterprise entities and multi-tenant subscriptions. |
| **Admin** | `/admin/plants` | `pages/admin/Plants.jsx` | `GET/POST /api/v1/admin/plants` | `plants` | Manage physical manufacturing plants and factory sites. |
| **Admin** | `/admin/users` | `pages/admin/Users.jsx` | `GET/POST /api/v1/admin/users` | `users`, `user_roles` | Create factory users, assign passwords, roles, and plant permissions. |
| **Master Data** | `/master/skus` | `pages/master/Skus.jsx` | `GET/POST/PUT /api/v1/master-data/skus` | `skus`, `product_families` | Finished goods and raw materials catalog with barcode and shelf-life. |
| **Master Data** | `/master/boms` | `pages/master/Boms.jsx` | `GET/POST /api/v1/master-data/boms` | `boms`, `bom_items` | Recipe formulas defining ingredients/components needed per unit. |
| **Master Data** | `/master/lines` | `pages/master/Lines.jsx` | `GET/POST /api/v1/master-data/lines` | `lines`, `departments` | Production lines, rated capacity, and department mapping. |
| **Master Data** | `/master/assets` | `pages/master/Assets.jsx` | `GET/POST /api/v1/master-data/assets` | `assets`, `asset_types` | Machine hierarchy, technical specifications, and criticality levels. |
| **Master Data** | `/master/quality-specs` | `pages/master/QualitySpecs.jsx`| `GET/POST /api/v1/master-data/quality-specs`| `quality_specs` | Product parameter specifications, tolerances, and CCP flags. |
| **Master Data** | `/master/labour-standards`| `pages/master/LabourStandards.jsx`| `GET/POST /api/v1/master-data/labour-standards`| `labour_standards` | Crew sizing standards, target labor hours, and hourly labor rates. |
| **Warehouse** | `/warehouse/receiving` | `pages/warehouse/Receiving.jsx`| `GET/POST /api/v1/warehouse/receiving` | `wms_receiving`, `batches` | Log truck delivery, generate GRN, print lot labels, assign to bin. |
| **Warehouse** | `/warehouse/inventory` | `pages/warehouse/Inventory.jsx`| `GET /api/v1/warehouse/inventory` | `inventory_lots`, `bins` | Real-time stock levels across all raw materials, WIP, and FG. |
| **Warehouse** | `/warehouse/shipping` | `pages/warehouse/Shipping.jsx` | `GET/POST /api/v1/warehouse/shipping` | `shipping_orders`, `batches`| Pick, pack, and dispatch finished product lots to customer destinations. |
| **Planning** | `/planning/scheduler` | `pages/planning/Scheduler.jsx` | `GET/POST /api/v1/planning/schedules` | `schedules`, `work_orders` | Drag-and-drop production gantt chart, line allocations, and shifts. |
| **Production**| `/production/work-orders`| `pages/production/WorkOrders.jsx`| `GET/POST /api/v1/production/work-orders` | `work_orders`, `boms` | Issue production orders, allocate batches, and release to shopfloor. |
| **Production**| `/production/active-run` | `pages/production/ActiveRun.jsx`| `GET/POST /api/v1/production/runs` | `production_runs`, `shifts`| Shop floor console showing live counters, run speed, and scrap tally. |
| **Production**| `/production/downtime` | `pages/production/Downtime.jsx`| `GET/POST /api/v1/production/downtime` | `downtime_events` | Record line stoppages, micro-stops, mechanical jams, and reasons. |
| **Quality** | `/quality/inspections` | `pages/quality/Inspections.jsx`| `GET/POST /api/v1/quality/inspections` | `quality_inspections` | Log hourly QA checks against quality specs (weight, moisture, etc.).|
| **Quality** | `/quality/ccp-checks` | `pages/quality/CCPChecks.jsx` | `GET/POST /api/v1/quality/ccp-checks` | `ccp_checks`, `ccp_limits` | Log Hazard/CCP compliance (metal detector, pasteurizer temp). |
| **Quality** | `/quality/quarantine` | `pages/quality/Quarantine.jsx` | `GET/POST /api/v1/quality/holds` | `quality_holds`, `batches` | Place defective lots on hold; release once re-inspected. |
| **Maintenance**| `/maintenance/orders` | `pages/maintenance/Orders.jsx` | `GET/POST /api/v1/maintenance/work-orders` | `maintenance_work_orders` | Breakdown and preventive maintenance tickets with technician assignment.|
| **Maintenance**| `/maintenance/pm` | `pages/maintenance/PM.jsx` | `GET/POST /api/v1/maintenance/pm-plans` | `pm_schedules` | Calendar-based and meter-based preventive maintenance routines. |
| **Maintenance**| `/maintenance/spares` | `pages/maintenance/Spares.jsx` | `GET/POST /api/v1/maintenance/spare-parts` | `spare_parts`, `inventory` | Stock management of critical machine replacement parts and reorder alerts.|
| **Traceability**| `/traceability/genealogy`| `pages/traceability/Genealogy.jsx`| `GET /api/v1/traceability/tree` | `batches`, `wms_receiving` | Bi-directional tree: trace FG box back to raw material supplier lot. |
| **Dashboards**| `/dashboards/oee` | `pages/dashboards/OEE.jsx` | `GET /api/v1/dashboards/oee` | `production_runs`, `downtime`| Live OEE calculation: Availability % × Performance % × Quality %. |
| **CI** | `/ci/kaizen` | `pages/ci/Kaizen.jsx` | `GET/POST /api/v1/ci/projects` | `ci_projects`, `rca_actions` | Continuous improvement ideas, 5S audit logs, and RCA 5-Why boards. |

---

## 7. Database Architecture Overview (121 Tables)

The PostgreSQL 18 database is organized into modular relational schemas:

1. **Multi-Tenancy & Security (`tenants.ts`, `users.ts`):**
   * `tenants`, `companies`, `plants`, `users`, `roles`, `permissions`, `audit_logs`.
2. **Master Manufacturing Specifications (`masterData.ts`, `masterAdmin.ts`):**
   * `lines`, `departments`, `work_centers`, `operations`, `routings`, `skus`, `product_families`, `boms`, `bom_items`, `uoms`, `pack_configs`, `line_targets`, `changeover_rules`, `sanitation_classes`, `allergen_rules`, `labour_standards`, `employee_skills`, `storage_resources`.
3. **Production Execution & Scheduling (`production.ts`, `planning.ts`):**
   * `work_orders`, `production_runs`, `shifts`, `batches`, `downtime_events`, `schedules`, `changeovers`, `scrap_logs`, `yield_calculations`.
4. **Quality & Food Safety (`quality.ts`):**
   * `quality_specs`, `quality_inspections`, `ccp_limits`, `ccp_checks`, `quality_holds`, `qa_releases`, `certificates_of_analysis`.
5. **Warehouse & Logistics (`warehouse.ts`):**
   * `wms_receiving`, `warehouses`, `locations`, `bins`, `inventory_lots`, `shipping_orders`, `dispatch_items`, `pallet_transfers`.
6. **Maintenance & Asset Reliability (`maintenance.ts`):**
   * `assets`, `asset_types`, `criticality_levels`, `maintenance_work_orders`, `pm_schedules`, `spare_parts`, `meter_readings`, `breakdown_logs`.
7. **Traceability, IoT & Analytics (`traceability.ts`, `iot.ts`, `ci.ts`):**
   * `lot_genealogy`, `iot_telemetry`, `machine_sensors`, `alarms`, `ci_projects`, `rca_reports`, `five_s_audits`.

---

## 8. Client Deployment & Quick Start Guide

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **PostgreSQL:** v15 or higher (v18 recommended)
* **Web Browser:** Google Chrome, Microsoft Edge, or Firefox

### Backend Setup
1. Open terminal in `backend/`
2. Configure `.env` file:
   ```env
   PORT=5001
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:root@localhost:5432/maintenxos
   JWT_SECRET=your-super-secret-jwt-token-key
   FRONTEND_URL=http://localhost:5173
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Backend Server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5001
   ```

### Frontend Setup
1. Open terminal in `frontend/`
2. Configure `.env` file:
   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Frontend Web Client:
   ```bash
   npm run dev
   # App runs at http://localhost:5173
   ```

### Default Login Credentials
* **URL:** `http://localhost:5173`
* **Email:** `admin@maintenx.com` (or your configured tenant admin)
* **Password:** `Admin@123`

---

## 9. Summary for Client Presentation
MaintenX-OS gives manufacturing companies complete real-time control over their operations:
* **Zero Paperwork:** From Goods Receipt to Final Dispatch, all records are digitized.
* **Audit-Proof Quality:** CCP checks and CoA generation guarantee food safety and ISO compliance.
* **Maximized Machine Uptime:** Integrated PM and work order tracking reduce unplanned breakdowns.
* **Accurate Costing:** Precise tracking of raw material scrap, machine downtime, and labor hours per 1,000 units.

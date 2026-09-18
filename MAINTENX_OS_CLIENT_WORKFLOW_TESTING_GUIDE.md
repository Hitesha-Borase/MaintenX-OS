# MaintenX OS: End-to-End Operational Workflow & Client Manual Testing Guide
## Complete Step-by-Step User Acceptance Testing (UAT) & Data Flow Manual

---

### 📌 Document Purpose
This manual provides a comprehensive, **step-by-step walkthrough** for testing the complete manufacturing operations lifecycle in **MaintenX OS**. It details which dashboard to open first, the exact menu options to click, what data to enter, and where that data automatically flows across departments (MES, CMMS, WMS, QMS, APS, and Executive Analytics).

---

## 🧭 Fast Role Switching (How to Test Different Roles)
MaintenX OS includes a 1-click role switcher so you can easily simulate different factory departments without having to log out:
1. Look at the **Top-Right Corner** of the header bar.
2. Click your **User Avatar (Circle with Initials)**.
3. In the dropdown, scroll to **"Switch Role Perspective"**.
4. Click on any role to immediately switch views with pre-loaded credentials and dedicated menus!
*(Alternatively, you can log out and log in via `/login`)*.

### 👥 Pre-Configured Test Personas & Credentials

| Step # | Role Name | Persona Name | Default Email | Starting Route | Key Responsibility |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **0** | **Master Admin** | Elena Vance | `master@maintenx.com` | `/master/dashboard` | Multi-Tenant Platform & Billing |
| **1** | **System Admin** | Alexander Vance | `admin@maintenx.com` | `/admin/console` | System Configuration & Users |
| **2** | **Warehouse / Stores** | Carlos Mendez | `warehouse@maintenx.com` | `/warehouse/dashboard` | Raw Materials, GRN, WMS & Shipping |
| **3** | **Planner / Scheduler** | Elena Rostova | `planner@maintenx.com` | `/planner/dashboard` | Demand, MRP, APS & Work Orders |
| **4** | **Operations Supervisor**| Sarah Jenkins | `supervisor@maintenx.com`| `/supervisor/dashboard` | Shift Schedules, Staffing & Approvals |
| **5** | **Line Lead** | Devang Patel | `linelead@maintenx.com` | `/linelead/dashboard` | Hour-by-Hour (H/B) Tracking & Recovery |
| **6** | **Quality / QA** | Dr. Rachel Thorne | `qa@maintenx.com` | `/quality/dashboard` | Pre-Op, CCP Checks, Holds & Release |
| **7** | **Line Operator** | Marcus Chen | `operator@maintenx.com` | `/operator/dashboard` | Touchscreen HMI, Hourly Output & Issues |
| **8** | **Maintenance** | Dave Miller | `maintenance@maintenx.com`| `/maintenance` | CMMS, Breakdowns & Work Orders |
| **9** | **CI / Kaizen Engineer**| Viktor Hayes | `ci@maintenx.com` | `/ci/dashboard` | Loss Analysis, RCA 2.0 & CAPA |
| **10**| **Plant Manager** | Arthur Sterling | `plant.manager@maintenx.com`| `/command-center` | Factory OEE, Control Tower & Bottlenecks|
| **11**| **Executive (COO)** | Victoria Sterling | `executive@maintenx.com`| `/executive/dashboard`| Multi-Plant KPIs & Financial Variance |

---

## 🔄 End-to-End Operational Lifecycle Map

```
[STEP 1: Admin / Plant Manager]  ──► Master Data Setup (Plants, Lines, SKUs, BOMs, QA Specs)
            │
            ▼
[STEP 2: Warehouse Receiver]     ──► Inbound Delivery ➔ Goods Receipt (GRN) ➔ Raw Material Stock Added
            │
            ▼
[STEP 3: Production Planner]     ──► Customer Order ➔ MRP BOM Explosion ➔ APS Gantt Schedule ➔ Publish
            │
            ▼
[STEP 4: Operations Supervisor]  ──► Department Schedule ➔ Operator Staffing & Skill Allocation
            │
            ▼
[STEP 5: Quality Assurance]      ──► Pre-Op Sanitation Inspection ➔ Line Clearance Approved
            │
            ▼
[STEP 6: Line Operator]          ──► Run Production ➔ Hourly Counts ➔ Defect Entry ➔ Report Breakdown
            │                                                                         │
            ▼                                                                         ▼
[STEP 8: In-Process QA Checks]                                          [STEP 7: Maintenance CMMS]
  CCP Temperature & Hold Quarantine                                       Accept WO ➔ Replace Spare ➔ Close
            │                                                                         │
            └───────────────────────────────┬─────────────────────────────────────────┘
                                            ▼
[STEP 9: Line Lead & Supervisor] ──► Hour-by-Hour (H/B) Review ➔ Shift Sign-Off & Approvals
                                            │
                                            ▼
[STEP 10: Quality Assurance]     ──► Batch Quality Testing ➔ Disposition "Release to Finished Goods"
                                            │
                                            ▼
[STEP 11: Warehouse & Logistics] ──► Finished Goods Stock ➔ Pick List ➔ Outbound Truck Dispatch
                                            │
                                            ▼
[STEP 12: CI / Kaizen Engineer]  ──► Downtime Loss Analysis ➔ 5-Why RCA Investigation ➔ CAPA Action
                                            │
                                            ▼
[STEP 13: Plant Manager & Exec]  ──► Real-Time Factory OEE ➔ Multi-Plant Financial Cost Variance
```

---

## 📋 Detailed Step-by-Step Manual Testing Walkthrough

---

### 🟢 STEP 1: Foundation Master Data Setup (Factory Configuration)
* **Goal**: Establish the structural foundation (Lines, Machines, Products, Recipes, and Quality Standards).
* **Role to Select**: `Plant Manager` or `System Administrator`
* **Starting URL**: `http://localhost:5173/command-center`

#### 1.1 Verify or Create Production Line
* **Sidebar Menu**: `Master Data` ➔ `Lines Master` (`/master-data/work-centers`)
* **Action**:
  1. Click **"+ Add Line / Work Center"**.
  2. Enter Line Code: `LINE-01`, Name: `High-Speed Bottling Line 1`, Department: `Packaging`.
  3. Set Design Speed / Rated Capacity (e.g., `500 units/hour`).
  4. Click **Save Line**.

#### 1.2 Verify or Create Assets / Machines
* **Sidebar Menu**: `Master Data` ➔ `Assets Master` (`/master-data/machine-capability`)
* **Action**:
  1. Click **"+ Add Machine Asset"**.
  2. Name: `Rotary Bottle Filler & Capper RF-01`, Asset Tag: `AST-FILL-01`.
  3. Assign to: `LINE-01`.
  4. Criticality: `High / Tier 1`. Click **Save Asset**.

#### 1.3 Verify or Create SKUs (Finished Goods & Raw Materials)
* **Sidebar Menu**: `Master Data` ➔ `SKUs Master` (`/master-data/items`)
* **Action**:
  1. Create Finished Good: Code `SKU-JUC-500`, Name: `Fresh Orange Juice 500ml`, Category: `Finished Goods`, UOM: `Bottles`.
  2. Create Raw Material 1: Code `RM-BOT-500`, Name: `PET Bottle 500ml Clear`, Category: `Packaging Raw Material`, UOM: `Units`.
  3. Create Raw Material 2: Code `RM-CAP-38`, Name: `Tamper-Proof Cap 38mm`, Category: `Packaging Raw Material`, UOM: `Units`.
  4. Create Raw Material 3: Code `RM-CONC-OR`, Name: `Orange Concentrate Liquid`, Category: `Ingredients`, UOM: `Liters`.

#### 1.4 Link Bill of Materials (Recipe BOM)
* **Sidebar Menu**: `Master Data` ➔ `BOMs & Recipes` (`/master-data/bom`)
* **Action**:
  1. Select Parent Finished Good: `SKU-JUC-500`.
  2. Add Ingredients:
     * `RM-BOT-500` (1 unit per bottle)
     * `RM-CAP-38` (1 unit per bottle)
     * `RM-CONC-OR` (0.15 Liters per bottle)
  3. Click **"Save & Approve BOM"**.

#### 1.5 Quality Specifications
* **Sidebar Menu**: `Master Data` ➔ `QA Specs` (`/master-data/quality-specs`)
* **Action**:
  1. Set Critical Parameters: `Pasteurization Temperature: 82.0°C - 85.0°C`, `Net Fill Volume: 500ml ± 5ml`.
* **Data Flow Destination**: This master data forms the master catalog and will now automatically populate all dropdowns in Warehouse, MRP Planning, and Operator touchscreens.

---

### 🟢 STEP 2: Warehouse Inbound & Raw Material Receiving (GRN)
* **Goal**: Receive raw materials from suppliers so the plant has stock to manufacture.
* **Role to Select**: `Warehouse / Receiver` (`Carlos Mendez`)
* **Starting URL**: `http://localhost:5173/warehouse/dashboard`

#### 2.1 Check Inward Purchase Orders
* **Sidebar Menu**: `Purchasing` ➔ `Purchasing & POs` (`/warehouse/purchasing`)
* **Action**: Review incoming vendor orders from approved suppliers.

#### 2.2 Receive Material & Generate GRN
* **Sidebar Menu**: `Receiving` ➔ `Receive Material` (`/warehouse/receiving/receive`)
* **Action**:
  1. Select PO or Supplier Delivery Challan.
  2. Material: `RM-BOT-500` (PET Bottles).
  3. Enter Received Quantity: `5,000 Units`.
  4. Enter Supplier Lot: `VEND-LOT-2026-99`.
  5. Assign Storage Location: Warehouse A, Rack `A-02-B` (`/warehouse/locations/bins`).
  6. Click **"Generate Goods Receipt Note (GRN)"**.
* **Repeat for Ingredients**: Receive `1,000 Liters` of `RM-CONC-OR` into Tank Bin `TNK-01`.

#### 2.3 Verify Stock Increase
* **Sidebar Menu**: `Inventory` ➔ `Raw Materials` (`/warehouse/inventory/raw`)
* **Data Flow Destination**: Instant stock increase. The **Planner's MRP Engine** now detects that raw materials are available on-hand.

---

### 🟢 STEP 3: Production Planning, MRP & Scheduling
* **Goal**: Convert customer demand into optimized production orders and line schedules.
* **Role to Select**: `Planner / Scheduler` (`Elena Rostova`)
* **Starting URL**: `http://localhost:5173/planner/dashboard`

#### 3.1 Review Demand & Customer Orders
* **Sidebar Menu**: `Demand` ➔ `Customer Orders` (`/planner/demand/customer-orders`)
* **Action**: Review customer order: `ORD-9021` for `2,000 Bottles` of `Fresh Orange Juice 500ml`.

#### 3.2 Run MRP (Material Requirements Planning)
* **Sidebar Menu**: `MRP` ➔ `Net Requirements` (`/planner/mrp/net-requirements`)
* **Action**:
  1. Click **"Run MRP Engine"**.
  2. Observe how the system automatically explodes the BOM:
     * Calculates 2,000 bottles + 2,000 caps + 300 Liters concentrate needed.
     * Compares required quantity against Warehouse Stock received in Step 2.
  3. Check `MRP ➔ Material Shortages` (`/planner/mrp/shortages`): Status shows **"Stock Sufficient / No Shortage"** (Green).

#### 3.3 APS Visual Scheduler & Publishing
* **Sidebar Menu**: `APS / Scheduling` ➔ `APS Scheduler` (`/planner/aps/scheduler`)
* **Action**:
  1. Locate the unscheduled production batch for `ORD-9021`.
  2. Schedule it on **Line 1 (LINE-01)** for Today's Shift 1 (08:00 - 16:00).
  3. Go to `APS / Scheduling` ➔ `Publish Schedule` (`/planner/aps/publish`).
  4. Click **"Publish Official Schedule"**.
  5. Go to `Production Orders` (`/planner/production-orders`) and click **"Release Production Order"** (Generates Order `PRD-2026-001`).
* **Data Flow Destination**: Work Order is dispatched to the **Operations Supervisor** and directly to the **Line Operator's HMI terminal**.

---

### 🟢 STEP 4: Operations Supervisor Shift & Staff Allocation
* **Goal**: Review published schedule and assign certified operators to the line.
* **Role to Select**: `Operations Supervisor` (`Sarah Jenkins`)
* **Starting URL**: `http://localhost:5173/supervisor/dashboard`

#### 4.1 Review Shift Department Schedule
* **Sidebar Menu**: `Department Schedule` (`/supervisor/dept-schedule`)
* **Action**: Verify that `PRD-2026-001` is scheduled on Line 1 for Shift 1.

#### 4.2 Assign Operator by Skill Competency
* **Sidebar Menu**: `Manage People` ➔ `Shift Management` (`/supervisor/labour/staffing`)
* **Action**:
  1. Select Line 1.
  2. Select Primary Operator: `Marcus Chen` (Verified Skill Level: Tier 3 Machine Operator in `/supervisor/labour/skills`).
  3. Click **"Confirm & Lock Shift Roster"**.
* **Data Flow Destination**: Marcus Chen's personal profile now has the authorized job card for the shift.

---

### 🟢 STEP 5: Quality Assurance Pre-Op Sanitation Clearance
* **Goal**: Ensure the line is sanitarily cleared before production is allowed to start.
* **Role to Select**: `Quality / QA` (`Dr. Rachel Thorne`)
* **Starting URL**: `http://localhost:5173/quality/dashboard`

#### 5.1 Execute Pre-Operational Checklist
* **Sidebar Menu**: `Pre-Op & Sanitation` ➔ `Pre-Op Checklist` (`/quality/sanitation/preop`)
* **Action**:
  1. Select Line: `LINE-01`.
  2. Complete checklist items:
     * CIP Cleaning cycle verified? ➔ **Yes (Pass)**
     * Allergen ATP swab negative? ➔ **Yes (Pass)**
     * Emergency stops & safety interlocks operational? ➔ **Yes (Pass)**
     * Foreign material / loose tools inspection? ➔ **Clear (Pass)**
  3. Enter Inspector Notes: *"Line sanitization approved for juice run"*.
  4. Click **"Submit Pre-Op Clearance"**.

#### 5.2 Line Readiness Verification
* **Sidebar Menu**: `Pre-Op & Sanitation` ➔ `Line Readiness` (`/quality/sanitation/readiness`)
* **Data Flow Destination**: Line status updates to **"Green / Ready for Production"**. Operator can now safely start running.

---

### 🟢 STEP 6: Line Operator Shop Floor Execution & Issue Reporting
* **Goal**: Run the job on the line HMI, log hourly output, scrap, and simulate a breakdown.
* **Role to Select**: `Line Operator` (`Marcus Chen`)
* **Starting URL**: `http://localhost:5173/operator/dashboard`

#### 6.1 Open Job & Work Instructions
* **Sidebar Menu**: `My Jobs` (`/operator/my-jobs`)
* **Action**:
  1. Click on assigned Work Order `PRD-2026-001`.
  2. Click **"Start Job / Clock In"**.
  3. Review `Work Instructions` (`/operator/work-instructions`) for standard operating parameters.

#### 6.2 Log Hourly Production Output
* **Sidebar Menu**: `Production Entry` (`/operator/production-entry`)
* **Action**:
  1. Select Hour 1 (08:00 - 09:00).
  2. Good Produced Units: `480 Bottles`.
  3. Defect / Scrap Units: `12 Bottles`.
  4. Scrap Reason: `Defective Cap Seal`.
  5. Click **"Submit Hourly Counts"**.

#### 6.3 Material Request (Warehouse Call)
* **Sidebar Menu**: `Material Request` (`/operator/material-request`)
* **Action**: Request additional caps from warehouse: `500 caps to Line 1 Staging`.

#### 6.4 Simulate Machine Breakdown (Critical Test Step)
* **Sidebar Menu**: `Downtime & Loss` ➔ `Report Issue` (`/operator/report-issue`)
* **Action**:
  1. Select Asset: `Rotary Bottle Filler & Capper RF-01`.
  2. Category: `Mechanical Breakdown`.
  3. Symptom: `Infeed Starwheel Motor Jammed & Overheated`.
  4. Severity: `High / Line Stoppage`.
  5. Click **"Submit Breakdown Alert"**.
* **Data Flow Destination**:
  * Production counts update **Line Lead Hour-by-Hour (H/B)** and **Plant OEE**.
  * The breakdown notification **instantly triggers a high-priority work order in Maintenance CMMS!**

---

### 🟢 STEP 7: Maintenance CMMS Breakdown Resolution
* **Goal**: Respond to the emergency stoppage, replace worn parts, and restore the line.
* **Role to Select**: `Maintenance` (`Dave Miller`)
* **Starting URL**: `http://localhost:5173/maintenance`

#### 7.1 Inspect Live Breakdown Alert
* **Sidebar Menu**: `MAINTAIN` ➔ `Breakdowns` (`/maintenance/breakdowns`)
* **Action**:
  1. Notice the active RED breakdown alert for `Rotary Bottle Filler RF-01`.
  2. Click **"Accept & Create Work Order"**.

#### 7.2 Execute Work Order & Consume Spare Parts
* **Sidebar Menu**: `MAINTAIN` ➔ `Work Orders` (`/maintenance/work-orders`)
* **Action**:
  1. Open Work Order `WO-MAINT-2026-041`.
  2. View `Asset 360°` (`/maintenance/asset-360`) and `Troubleshooting` (`/maintenance/troubleshooting`).
  3. Action taken: Cleared bottle jam and replaced worn drive bearing.
  4. Spare Part Consumed: `Bearing 6204-2RS` (Qty: 1).
  5. Time Spent: `25 minutes`.
  6. Failure Cause: `Fatigue Wear / Infeed Misalignment`.
  7. Click **"Mark Work Order Completed & Close"**.
* **Data Flow Destination**:
  * Line status automatically switches from **Breakdown (Red)** back to **Running (Green)**.
  * Asset MTTR (Mean Time to Repair) and MTBF dynamically recalculate.

---

### 🟢 STEP 8: Quality In-Process Testing & Quarantine Hold
* **Goal**: Verify quality parameters during production and quarantine defective units.
* **Role to Select**: `Quality / QA` (`Dr. Rachel Thorne`)
* **Starting URL**: `http://localhost:5173/quality/dashboard`

#### 8.1 In-Process CCP Check
* **Sidebar Menu**: `Quality Checks` ➔ `CCP Checks` (`/quality/checks/ccp`)
* **Action**:
  1. Enter Pasteurizer CCP temperature reading: `83.4°C` (Allowed: 82-85°C) ➔ **Status: Compliant (Pass)**.

#### 8.2 Log Quality Hold / Quarantine (Testing Hold Logic)
* **Sidebar Menu**: `Quality Events` ➔ `Quality Holds` (`/quality/events/holds`)
* **Action**:
  1. Select Batch `BAT-2026-PRD01-01`.
  2. Hold Reason: `Cap Torque check marginal during breakdown restart`.
  3. Quantity Placed on Hold: `200 Bottles`.
  4. Status: **Quarantined**.
* **Data Flow Destination**: In the Warehouse system, these 200 bottles are locked — warehouse staff are blocked from loading them onto trucks until released by QA.

---

### 🟢 STEP 9: Hour-by-Hour (H/B) Review & Shift Approval
* **Goal**: Review production targets vs actuals, document recovery, and sign off the shift.
* **Roles to Select**: `Line Lead` (`Devang Patel`), then `Operations Supervisor` (`Sarah Jenkins`)

#### 9.1 Line Lead Hour-by-Hour (H/B) Analysis
* **Role**: `Line Lead`
* **Sidebar Menu**: `H/B Management` (`/linelead/hb-management`)
* **Action**:
  1. Notice Hour 1 Target: 500 units, Actual: 480 units (Variance: -20 units).
  2. Stoppage Reason: 25 mins breakdown.
  3. Go to `Recovery Management` (`/linelead/recovery-management`) and input recovery plan: *"Speed increased to 520 u/hr for remaining shift"*.

#### 9.2 Supervisor Shift Sign-Off
* **Role**: Switch to `Operations Supervisor`
* **Sidebar Menu**: `Approvals` (`/supervisor/approvals`)
* **Action**:
  1. Review operator shift handoff summary (`/operator/shift-handoff`).
  2. Approve recorded hours, scrap count, and downtime logs.
  3. Click **"Authorize Shift Sign-Off"**.
* **Data Flow Destination**: Shift production is locked in history; the completed batch moves to the **QA Release Queue**.

---

### 🟢 STEP 10: Batch Quality Review & Final Release Disposition
* **Goal**: Complete final compliance review and release the finished product to inventory.
* **Role to Select**: `Quality / QA` (`Dr. Rachel Thorne`)
* **Starting URL**: `http://localhost:5173/quality/dashboard`

#### 10.1 Review Batch Records
* **Sidebar Menu**: `Batch Quality` ➔ `Batch Review` (`/quality/batch/review`)
* **Action**: Review all eBR (electronic batch record) data — Pre-Op, CCP temperatures, downtime, and lab assay.

#### 10.2 Execute Release Disposition
* **Sidebar Menu**: `QA Release` ➔ `Release Queue` (`/quality/release/queue`)
* **Action**:
  1. Open Batch `BAT-2026-PRD01-01`.
  2. Clear the 200 bottle hold after re-torque verification passes.
  3. Select Disposition: **"Release to Finished Goods"** (`/quality/disposition/release`).
  4. Apply QA digital approval.
* **Data Flow Destination**: Batch status changes to **Approved for Sale**. Stock is automatically credited to **Warehouse Finished Goods**.

---

### 🟢 STEP 11: Warehouse Finished Goods & Customer Dispatch
* **Goal**: Pick, pack, and dispatch the finished product to the customer.
* **Role to Select**: `Warehouse / Receiver` (`Carlos Mendez`)
* **Starting URL**: `http://localhost:5173/warehouse/dashboard`

#### 11.1 Check Finished Goods Inventory
* **Sidebar Menu**: `Inventory` ➔ `Finished Goods` (`/warehouse/inventory/finished-goods`)
* **Action**: Verify that `Fresh Orange Juice 500ml` shows approved stock available.

#### 11.2 Generate Pick List & Palletize
* **Sidebar Menu**: `Picking` ➔ `Pick Lists` (`/warehouse/picking/lists`)
* **Action**:
  1. Select Customer Order `ORD-9021`.
  2. Click **"Generate Pick List"**.
  3. Assign Pallet ID: `PLT-2026-088` (`/warehouse/pallets-containers`).

#### 11.3 Dispatch Outbound Shipment
* **Sidebar Menu**: `Shipping` ➔ `Shipment Orders` (`/warehouse/shipping/orders`)
* **Action**:
  1. Select Order `ORD-9021`.
  2. Assign Carrier: `BlueDart Logistics`, Vehicle: `MP-09-AB-1234`, Dock: `Bay 3`.
  3. Click **"Dispatch Shipment"** (`/warehouse/shipping/dispatch`).
* **Data Flow Destination**: Order status updates to **"Dispatched / Complete"**; customer tracking number is generated; warehouse inventory decrements.

---

### 🟢 STEP 12: Continuous Improvement (CI), Root Cause Analysis & CAPA
* **Goal**: Analyze the breakdown from Step 6, perform 5-Why RCA, and prevent future recurrence.
* **Role to Select**: `CI / Engineering` (`Viktor Hayes`)
* **Starting URL**: `http://localhost:5173/ci/dashboard`

#### 12.1 Analyze Downtime Loss
* **Sidebar Menu**: `Loss Analysis` ➔ `Downtime Loss` (`/ci/loss/downtime`)
* **Action**: Locate the 25-minute breakdown on Line 1. Calculate production cost loss.

#### 12.2 Initiate RCA 2.0 Investigation
* **Sidebar Menu**: `RCA 2.0` ➔ `Investigations` (`/ci/rca/investigations`)
* **Action**:
  1. Create new RCA: `Infeed Starwheel Jam Analysis`.
  2. Input **5-Why Root Cause**:
     * Why 1: Motor jammed? ➔ Bearing seized.
     * Why 2: Bearing seized? ➔ Inadequate lubrication.
     * Why 3: Inadequate lubrication? ➔ Auto-greaser nozzle clogged.
     * Why 4: Nozzle clogged? ➔ Greaser purge schedule missed.
     * Why 5: Schedule missed? ➔ No PM task trigger existed.

#### 12.3 Issue CAPA & Track Kaizen Savings
* **Sidebar Menu**: `CAPA` ➔ `Corrective Actions` (`/ci/capa/corrective`)
* **Action**:
  1. Add Preventive Action: *"Add bi-weekly ultrasonic grease inspection to Line 1 PM schedule"*.
  2. Assign Owner: `Dave Miller (Maintenance Lead)`.
  3. Go to `CI Projects` ➔ `Savings` (`/ci/projects/savings`): Log projected annual downtime savings: `₹1,80,000 / $2,200`.
* **Data Flow Destination**: Automatically updates Executive Financial reports and plant reliability scores.

---

### 🟢 STEP 13: Plant Command Center & Executive Intelligence
* **Goal**: Review the high-level operational and financial rollup across the entire plant.
* **Roles to Select**: `Plant Manager` (`Arthur Sterling`) & `Executive (COO)` (`Victoria Sterling`)

#### 13.1 Plant Manager Command Center
* **Role**: `Plant Manager`
* **Sidebar Menu**: `Dashboards` ➔ `Command Center` (`/command-center`)
* **What to Observe (No entry needed)**:
  * **Overall Plant OEE Gauge**: Live composite score calculated from:
    * **Availability**: Impacted by the 25-min breakdown from Step 6.
    * **Performance**: Calculated from target vs actual speed.
    * **Quality**: Impacted by the 12 scrap units recorded by the operator.
  * **Exception Control Tower** (`/exception-control-tower`): Real-time bird's-eye view of all factory line statuses, active work orders, and resolution times.

#### 13.2 Executive Financial Intelligence
* **Role**: `Executive`
* **Sidebar Menu**: `Executive Dashboard` (`/executive/dashboard`)
* **What to Observe**:
  * `Multi-Plant KPIs` (`/executive/enterprise/kpis`): Benchmark Indore Plant vs global sites.
  * `Financial Intelligence` ➔ `Manufacturing Cost` (`/executive/finance/manufacturing`): Cost per unit, breakdown labor cost, and material scrap cost variance.
  * `AI Briefing` (`/executive/ai/briefing`): Real-time AI generated summary of today's production attainment and equipment reliability.

---

## ✅ Client Manual Testing Verification Checklist

Use this checklist during your client demonstration or testing session:

| # | Feature / Test Scenario | Department / Role | Expected Result | Pass / Fail |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Create Production Line & BOM** | Admin / Plant Manager | Data saves and appears in all planning dropdowns | [ ] |
| 2 | **Receive Raw Material (GRN)** | Warehouse | Stock increases in raw material inventory | [ ] |
| 3 | **Run MRP & BOM Explosion** | Planner | Net requirements calculated; shortage checks pass | [ ] |
| 4 | **Publish APS Schedule** | Planner | Work Order created and dispatched to Line 1 | [ ] |
| 5 | **Assign Shift Operator** | Operations Supervisor | Operator receives job card on their shift roster | [ ] |
| 6 | **Pre-Op Sanitation Clearance** | Quality / QA | Line status changes to "Ready for Production" | [ ] |
| 7 | **Operator Hourly Entry** | Line Operator | Good and scrap counts update Line Lead H/B chart | [ ] |
| 8 | **Report Breakdown** | Line Operator | CMMS instantly alerts maintenance team | [ ] |
| 9 | **Resolve Maintenance WO** | Maintenance | WO completed, parts deducted, line restored | [ ] |
| 10| **In-Process CCP Check** | Quality / QA | Compliant temperature logged; hold test passes | [ ] |
| 11| **Hour-by-Hour (H/B) Review** | Line Lead & Supervisor | Variance tracked; supervisor approves shift sign-off | [ ] |
| 12| **Batch Release Disposition** | Quality / QA | Batch approved and transferred to Finished Goods | [ ] |
| 13| **Customer Shipment Dispatch** | Warehouse | Pick list created; truck dispatched with tracking | [ ] |
| 14| **RCA 2.0 & CAPA Action** | CI Engineer | 5-Why analysis saved and preventive action assigned | [ ] |
| 15| **Real-Time OEE & Financials**| Plant Manager & Executive | Dynamic OEE, scrap variance, and AI briefing active | [ ] |

---

### 🏁 Summary
By following these 13 steps in exact numerical order, you and your client can verify **100% of MaintenX OS's data continuity** — from the moment raw ingredients arrive at the dock to the moment finished goods are shipped, maintained, audited, and analyzed on executive dashboards.

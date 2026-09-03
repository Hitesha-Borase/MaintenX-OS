# MAINTENX OS
## Complete Client Live Demo & End-to-End Workflow Guide

---

## 1. Executive Overview

**MaintenX OS** is an enterprise-grade Manufacturing Operations & Maintenance Operating System (MOM/CMMS/MES). It connects plant master data, advanced production planning (APS), warehouse inventory, shop-floor execution, automated quality assurance, equipment maintenance (CMMS), continuous improvement (RCA/CAPA/Kaizen), and executive financial intelligence into a unified single-pane-of-glass architecture.

The platform eliminates the operational silos between Production, Maintenance, Quality, and Planning by sharing a synchronized state layer. When a machine breaks down, the CMMS immediately changes the asset's state to `DOWN`, halts the associated production line in the Production module, notifies the Shift Supervisor, generates an Emergency Work Order with linked root-cause failure codes, tracks live downtime against overall equipment effectiveness (OEE), and logs a 21 CFR Part 11 compliant audit record.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  MAINTENX OS                                     │
├──────────────────┬───────────────────┬───────────────────┬───────────────────────┤
│   Master Data    │   Planning & APS  │    Warehouse      │  Shop Floor Execution │
│ Hierarchy, SKUs, │ Orders, Forecast, │ Inbound, Raw, FG, │  Operator Stations,   │
│ BOMs, Workcenter │ MRP, APS Capacity │ Lots, Dispatches  │ Line Leads, Handoffs  │
├──────────────────┼───────────────────┼───────────────────┼───────────────────────┤
│  Quality & QA    │ Maintenance CMMS  │  CI / Engineering │  Executive & Finance  │
│ Checks, CCP, QA  │ Assets, WOs, PMs, │  RCA 2.0, CAPA,   │ Financial Costing,    │
│ Release, Holds   │ Spares, Calibrate │ Kaizen, Savings   │ OEE, Multi-Plant KPIs │
└──────────────────┴───────────────────┴───────────────────┴───────────────────────┘
```

---

## 2. How MaintenX OS Works

MaintenX OS operates on a **Closed-Loop Manufacturing Life-Cycle**:

```
[1. Enterprise Master Setup]
        │ (Plants, Lines, Assets, SKUs, BOMs, QA Limits)
        ▼
[2. Demand & APS Scheduling]
        │ (Customer Orders, Capacity Scheduling, Published Runs)
        ▼
[3. Warehouse Staging & Lot Allocation]
        │ (Raw Materials Picked & Verified to Line)
        ▼
[4. Shop-Floor Production Execution]
        │ (Operator Run, Step Tracking, Speed, Output Counter)
        ▼
[5. Quality Inspections & Batch Release]
        │ (In-line CCP Checks, Pre-Op Sanitation, QA Disposition)
        ▼
[6. CMMS Maintenance & Reliability Engine]
        │ (Asset 360, PM Execution, Breakdown Interventions, Spares)
        ▼
[7. Root Cause Analysis (RCA) & CAPA]
        │ (5-Why, Fishbone, Corrective/Preventive Actions)
        ▼
[8. Continuous Improvement & Financial Costing]
        │ (Verified Solutions, 21 CFR Part 11 Savings, Executive OEE)
        ▼
[Back to Step 1 - Master Optimization]
```

1. **Master Setup**: System Administrators define the physical hierarchy (Enterprise → Plant → Department → Line → Work Center → Machine) and engineering master records (SKUs, Bill of Materials Recipes, Routings, and CCP limits).
2. **Scheduling**: Planners transform sales orders and forecasts into finite capacity production schedules using the APS Scheduler.
3. **Materials**: Warehouse personnel receive, scan, lot-track, and stage raw materials at the packaging cell.
4. **Execution**: Line Operators and Leads record runtime, hourly bottle/pack output, and shift handoffs.
5. **Quality Control**: QA Technicians perform pre-operational sanitation checks, monitor Critical Control Points (CCPs), and release finished goods or place non-conforming batches on Quality Hold.
6. **Maintenance & Asset Reliability**: The CMMS engine executes calendar/runtime Preventive Maintenance (PM) checklists, manages breakdown stoppages, issues spare parts, tracks instrumentation calibration, and calculates real-time MTTR/MTBF.
7. **Problem Solving**: Repeat machine failures trigger automated Bad Actor alerts, feeding directly into the CI Engineer's RCA 2.0 Investigation and CAPA workflows.
8. **Financial Intelligence**: Executive dashboards synthesize direct labor, machine downtime cost, scrap losses, and Kaizen cost-savings into multi-plant profitability metrics.

---

## 3. Complete System Architecture

MaintenX OS is engineered as a responsive Single Page Application (SPA) built with React 18, Vite, Lucide Icons, and Vanilla CSS custom property design tokens.

### State & Persistence Architecture
The frontend utilizes decoupled React Context providers with real-time browser storage (`localStorage`) synchronization. Data persistence is organized under strict namespaced keys:

| Context Provider | Primary Responsibilities | LocalStorage Key |
| :--- | :--- | :--- |
| `MasterDataContext` | Plants, Lines, Work Centers, Items, BOMs, Routings, Skills, Specs, Permissions, Centralized Audit | `mx_master_audit_logs`, `mx_master_boms`, `mx_master_items` |
| `CMMSContext` | Asset Registry, Work Orders, PM Plans, Breakdowns, Spare Parts BOM, Calibration, Solutions | `flowstate_assets`, `flowstate_work_orders`, `flowstate_pm_schedules`, `flowstate_breakdowns`, `flowstate_spare_parts` |
| `ProductionContext` | Production Orders, Batch Run Steps, Shift Handoff Sign-offs | `flowstate_production_orders`, `flowstate_batches` |
| `PlanningContext` | Customer Demand, MRP Net Requirements, APS Schedule Versions | In-memory with Context seed sync |
| `QualityContext` | CCP Checks, Pre-Op Inspections, Deviations, Holds, Batch Releases | In-memory with Context seed sync |
| `CIContext` | RCA Investigations (5-Why, Fishbone), CAPA Actions, CI Projects, Savings | In-memory with Context seed sync |
| `RoleContext` | Active User Profile, Role Clearance, Navigation Config, RBAC Guard | `flowstate_current_role`, `flowstate_auth` |
| `AppContext` | Global Search Drawer, Asset QR Modal, Quick Action WO Drawer, Toast Stack | UI State |

### Cross-Module Event Bus
Cross-module synchronization occurs through DOM `CustomEvent` dispatchers. When an asset status changes in `CMMSContext`, an `AssetStatusChanged` event is dispatched globally:
```javascript
window.dispatchEvent(
  new CustomEvent("AssetStatusChanged", {
    detail: { assetId, status: newStatus, lineId: asset.lineId }
  })
);
```
Master Data, Production, and Command Center dashboards listen to this event to update line stoppage visualizers in real time.

---

## 4. Role & Permission Overview

MaintenX OS provides 11 distinct operational role perspectives. Users can instantly switch role personas using the global **Role Persona Switcher** in the top navigation header.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ROLE PERSPECTIVES                                │
├────┬───────────────────────┬────────────────────────────┬───────────────────┤
│ #  │ Role Name             │ Default Landing Route      │ Operational Scope │
├────┼───────────────────────┼────────────────────────────┼───────────────────┤
│ 1  │ System Administrator  │ /admin/console             │ Full System Setup │
│ 2  │ Planner / Scheduler   │ /planner/dashboard         │ Demand, MRP, APS  │
│ 3  │ Warehouse / Receiver  │ /warehouse/dashboard       │ Inbound, Lots, FG │
│ 4  │ Maintenance           │ /maintenance               │ CMMS, Assets, WOs │
│ 5  │ Operations Supervisor │ /supervisor/dashboard      │ Shift Labor, Dept │
│ 6  │ Line Lead             │ /linelead/dashboard        │ Line OEE, Stoppage│
│ 7  │ Line Operator         │ /operator/dashboard        │ Jobs, Execution   │
│ 8  │ Quality / QA          │ /quality/dashboard         │ CCP, Release, Hold│
│ 9  │ CI / Engineering      │ /ci/dashboard              │ RCA, CAPA, Kaizen │
│ 10 │ Plant Manager         │ /command-center            │ Site Operations   │
│ 11 │ Executive             │ /executive/dashboard       │ Multi-Plant, P&L  │
└────┴───────────────────────┴────────────────────────────┴───────────────────┘
```

### Role-Based Access Control (RBAC) Guard
Every route in `src/App.jsx` is protected by `<RoleProtectedRoute>`. If an active persona attempts to navigate to a route outside its authorized `NAVIGATION_CONFIG`, the UI renders a branded security barrier:
- Displays **Access Restricted** message.
- Identifies current persona.
- Prompts user to switch to an authorized role (e.g. Plant Manager or System Administrator) via the top header.

---

## 5. Dashboard Map

MaintenX OS features 12 dedicated dashboards tailored to specific operational functions.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              DASHBOARD MAP                                 │
├───────────────────────┬──────────────────────┬─────────────────────────────┤
│ Dashboard Name        │ Primary Route        │ Core Target Audience        │
├───────────────────────┼──────────────────────┼─────────────────────────────┤
│ Command Center        │ /command-center      │ Plant Managers & Directors  │
│ Maintenance Dashboard │ /maintenance         │ Maintenance Leads & Techs   │
│ Production Dashboard  │ /production          │ Production Managers         │
│ Operator Dashboard    │ /operator/dashboard  │ Machine Line Operators      │
│ Line Lead Dashboard   │ /linelead/dashboard  │ Production Line Leads       │
│ Supervisor Dashboard  │ /supervisor/dashboard│ Shift Supervisors           │
│ Planner Dashboard     │ /planner/dashboard   │ S&OP & APS Schedulers       │
│ Warehouse Dashboard   │ /warehouse/dashboard │ Inventory & Material Leads  │
│ Quality Dashboard     │ /quality/dashboard   │ QA Managers & Food Safety   │
│ CI Dashboard          │ /ci/dashboard        │ Continuous Improvement Engs │
│ Executive Dashboard   │ /executive/dashboard │ VP Manufacturing, C-Suite   │
│ Admin Dashboard       │ /dashboard           │ IT & System Administrators  │
└───────────────────────┴──────────────────────┴─────────────────────────────┘
```

### Detailed Dashboard KPI Breakdown

#### 1. Command Center (`/command-center`)
- **Purpose**: Real-time high-level plant performance, downtime alerts, and line OEE.
- **KPI 1 — Plant OEE**: Dynamic OEE % aggregate across active packaging lines. Clicking drills down to `/performance/oee`.
- **KPI 2 — Active Stoppages**: Count of open machine breakdowns. Clicking navigates to `/maintenance/breakdowns`.
- **KPI 3 — Output vs Target**: Completed units vs shift scheduled quantity. Clicking navigates to `/production/orders`.
- **KPI 4 — QA Holds Active**: Number of quarantined lots. Clicking navigates to `/quality/holds`.

#### 2. Maintenance Dashboard (`/maintenance`)
- **Purpose**: Operational CMMS hub for work orders, active breakdowns, PM compliance, and equipment reliability.
- **KPI 1 — Machine Health Index**: Weighted average health score of all registered equipment (0–100%). Clicking drills down to `/maintenance/assets`.
- **KPI 2 — Open Work Orders**: Total count of active, uncompleted corrective and PM work orders. Clicking navigates to `/maintenance/work-orders`.
- **KPI 3 — Active Breakdowns**: Count of assets currently marked `Breakdown` or `DOWN`. Clicking navigates to `/maintenance/breakdowns`.
- **KPI 4 — PM Compliance %**: Percentage of preventive maintenance checklists completed on time. Clicking navigates to `/maintenance/pm-schedules`.
- **KPI 5 — Mean Time to Repair (MTTR)**: Average duration (in hours) to resolve breakdowns. Clicking drills down to `/maintenance/reliability`.
- **KPI 6 — Mean Time Between Failures (MTBF)**: Average operating runtime between stoppage events. Clicking drills down to `/maintenance/reliability`.

#### 3. Executive Dashboard (`/executive/dashboard`)
- **Purpose**: Enterprise financial variance, manufacturing costs, and continuous improvement ROI.
- **KPI 1 — Total Manufacturing Cost**: Aggregate labor, material, and machine downtime costs. Drills down to `/executive/finance/manufacturing`.
- **KPI 2 — Realized CI Savings**: Certified cost reduction from closed Kaizen/CAPA projects. Drills down to `/executive/finance/ci-savings`.
- **KPI 3 — Multi-Plant Service Level**: OTIF (On-Time In-Full) fulfillment score. Drills down to `/executive/business/service-level`.

---

## 6. Sidebar Map

The global sidebar dynamically morphs based on the active role selected in the top bar.

### 1. Maintenance Persona Sidebar
```
CMMS & RELIABILITY
 ├── Dashboard (/maintenance)
 ├── Asset 360° (/maintenance/assets)
 │    └── Asset Detail 360 (/maintenance/assets/:id)
 ├── Work Orders (/maintenance/work-orders)
 │    └── Work Order Detail (/maintenance/work-orders/:id)
 ├── PM Scheduling (/maintenance/pm-schedules)
 ├── PM Checklists (/maintenance/pm-checklists)
 │    └── Execute Checklist (/maintenance/pm-checklists/execute/:id)
 ├── Breakdowns (/maintenance/breakdowns)
 │    └── Breakdown Detail (/maintenance/breakdowns/:id)
 ├── Troubleshooting (/maintenance/troubleshooting)
 ├── Spare Parts (/maintenance/spare-parts)
 ├── Calibration (/maintenance/calibration)
 ├── Failure Codes (/maintenance/failure-codes)
 ├── Maintenance KPIs (/maintenance/reliability)
 ├── Repeat Failures (/maintenance/repeat-failures)
 └── Verified Solutions (/maintenance/verified-solutions)
```

### 2. Plant Manager Persona Sidebar
```
PLANT COMMAND
 ├── Command Center (/command-center)
 ├── Master Data
 │    ├── SKUs Master (/master-data/items)
 │    ├── BOMs & Recipes (/master-data/bom)
 │    ├── Lines Master (/master-data/work-centers)
 │    ├── Assets Master (/master-data/machine-capability)
 │    ├── Staff & Skills (/master-data/skills)
 │    └── QA Specs (/master-data/quality-specs)
 ├── Production Hub (/production)
 ├── Quality Hub (/quality)
 ├── Inventory Hub (/inventory)
 ├── Labour Hub (/labour)
 ├── CMMS Dashboard (/maintenance)
 └── Reports Center (/reports)
```

### 3. CI / Engineering Persona Sidebar
```
CONTINUOUS IMPROVEMENT
 ├── Dashboard (/ci/dashboard)
 ├── RCA 2.0
 │    ├── Investigations (/ci/rca/investigations)
 │    ├── Evidence (/ci/rca/evidence)
 │    ├── Hypothesis & Tests (/ci/rca/hypothesis)
 │    ├── Occurrence Cause (/ci/rca/occurrence)
 │    └── Escape Cause (/ci/rca/escape)
 ├── CAPA
 │    ├── Corrective Actions (/ci/capa/corrective)
 │    ├── Preventive Actions (/ci/capa/preventive)
 │    ├── Owners & Due Dates (/ci/capa/owners)
 │    └── Effectiveness Verification (/ci/capa/verification)
 ├── Loss Analysis
 │    ├── Production Loss (/ci/loss/production)
 │    └── Downtime Loss (/ci/loss/downtime)
 ├── CI Projects & Savings (/ci/projects/list)
 ├── Verified Solutions (/ci/verified-solutions)
 └── Reliability Insights (/ci/reliability)
```

---

## 7. Master Data Flow

Master Data provides the foundational structural hierarchy for all downstream modules.

```
[Enterprise]
     ↓
  [Plant] (e.g. Plant 1 - North Facility)
     ↓
[Department] (e.g. Packaging, Processing, Utilities)
     ↓
[Production Line] (e.g. Line 1 - Aseptic Bottling)
     ↓
[Work Center] (e.g. WC-PKG-01)
     ↓
[Machine / Asset] (e.g. FM-001 Rotary Filler)
```

### Master Data Entities & Dependencies

```
┌────────────────────┬─────────────────────────────┬────────────────────────────────────┐
│ Master Entity      │ Route                       │ Dependent Downstream Modules       │
├────────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ Items / SKUs       │ /master-data/items          │ BOMs, Warehouse Lots, Demand, APS  │
│ BOMs & Recipes     │ /master-data/bom            │ Production Batches, Material Pick  │
│ Production Lines   │ /master-data/work-centers   │ APS Capacity, Line Lead OEE, Assets│
│ Machine Assets     │ /maintenance/assets         │ CMMS Work Orders, PM, Downtime     │
│ Failure Codes      │ /maintenance/failure-codes  │ Breakdowns, Troubleshooting, RCA   │
│ Spare Parts        │ /maintenance/spare-parts    │ Work Orders, Machine BOMs, Costing │
│ Quality Specs      │ /master-data/quality-specs  │ In-line QA Checks, QARelease       │
│ Skills Master      │ /master-data/skills         │ Staffing Allocation, Labor Tracking│
└────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

---

## 8. Asset Management Flow (Asset 360)

The Asset Management module enables comprehensive equipment life-cycle tracking.

### 1. Asset Registration Flow
1. Navigate to **Asset 360°** (`/maintenance/assets`).
2. Click **+ Register New Machine**.
3. Modal opens with required quick-registration fields:
   - **Asset Tag ID** (e.g. `AST-TEST-001`) *[Required, unique validation]*
   - **Machine Name** (e.g. `Test Pasteurizer`) *[Required]*
   - **Asset Classification** (e.g. `Packaging & Bottling`)
   - **Production Line** (e.g. `Line 1 (Aseptic Bottling)`)
   - **Physical Location / Bay** (e.g. `Bay 4B - Cleanroom Zone B`)
   - **Criticality Rating** (e.g. `Critical`, `High`, `Medium`, `Low`)
4. Click **Save & Register Asset**.
5. System checks for duplicate IDs, adds record to `assets` state in `CMMSContext`, generates an `Asset Created` audit log in `MasterDataContext`, and immediately navigates to `/maintenance/assets/AST-TEST-001`.

### 2. Asset 360 Five-Tab Architecture (`/maintenance/assets/:id`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ASSET 360 (5 EXACT TABS)                          │
├────────────┬────────────────────────────────────────────────────────────────┤
│ Tab Name   │ Content & Capabilities                                         │
├────────────┼────────────────────────────────────────────────────────────────┤
│ 1. INFO    │ Asset ID, Machine Name, Classification, Criticality, Status.   │
│            │ Hierarchy: Enterprise → Plant → Area → Line → Bay.             │
│            │ Technical: Manufacturer, Model, Serial, Commission Date,       │
│            │ Nameplate Power (kW), Rated Speed (RPM).                       │
│            │ Actions: "Edit Information" form with audit change tracking.   │
├────────────┼────────────────────────────────────────────────────────────────┤
│ 2. PROD    │ Plant assignment, Machine Capability, Eligible Lines, Standard │
│            │ Run Rate (BPM). Current active Production Order, Batch Number, │
│            │ Shift assignment, Live speed, Output counter, Runtime hours.   │
│            │ Actions: "Edit Assignment" modal, "View Production Line".      │
├────────────┼────────────────────────────────────────────────────────────────┤
│ 3. MAINT   │ Health Index %, PM Compliance %, Open WOs, Active Breakdowns.  │
│            │ Preventive Maintenance schedules (with "Execute Checklist").   │
│            │ Work Orders list (with "Create WO" & "Open WO").               │
│            │ Spare Parts BOM (with "Issue Part to Machine" stock deduction).│
│            │ Calibration records (with "+ Log Calibration" NIST modal).     │
│            │ Maintenance Labour Hours & Cost calculation.                   │
│            │ Chronological Machine Life-Cycle History Timeline.             │
├────────────┼────────────────────────────────────────────────────────────────┤
│ 4. DOWNTIME│ Total Downtime hours, Downtime this month/year, MTTR, MTBF.    │
│            │ Bad Actor Flag (triggers when recentFailuresCount >= 3).       │
│            │ Stoppage History Table with root causes & linked Work Orders.  │
│            │ Production Line impact summary & estimated units lost.         │
│            │ Reliability Trend AreaChart (Hours vs Week).                   │
├────────────┼────────────────────────────────────────────────────────────────┤
│ 5. AUDIT   │ 21 CFR Part 11 Audit Trail filtered strictly for this asset.   │
│            │ Displays Timestamp, User, Action, Target Field, Old Value,     │
│            │ New Value, and Reason/Notes.                                   │
│            │ Actions: "Export CSV", "View Change Details" Modal.            │
└────────────┴────────────────────────────────────────────────────────────────┘
```

---

## 9. Production Flow

The Production Execution workflow bridges the gap between schedule planning and shop-floor manufacturing.

```
[Customer Order / Demand]
           │
           ▼
 [APS Finite Capacity Run] ──► [Published Schedule Version]
                                          │
                                          ▼
                             [Production Order Created]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         [Raw Material Pick Lists]                       [Line Setup & Pre-Op QA]
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                             [Batch Execution Initiated]
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
             [Hourly Production Output]             [In-line CCP Checks]
                        │                                   │
                        └─────────────────┬─────────────────┘
                                          ▼
                             [Shift Handoff Sign-off]
                                          │
                                          ▼
                             [QA Batch Release to Warehouse]
```

### Core Production Screens
- **Production Dashboard** (`/production`): Live line output, active orders, and shift performance.
- **Production Orders** (`/production/orders`): Status tracking (`Planned`, `In Progress`, `Completed`, `On Hold`).
- **Batches Page** (`/production/batches`): Batch genealogy, ingredient lot verification, and step advancement.
- **Operator Production Entry** (`/operator/production-entry`): Touchscreen-optimized interface for machine operators to record unit counters, reject scrap, and log micro-stoppages.

---

## 10. Maintenance / CMMS Flow

The CMMS module manages asset health, planned servicing, emergency repairs, and technical solutions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CMMS WORKFLOW ENGINE                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Planned / Preventive Maintenance     │ Unplanned / Breakdown Maintenance    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 1. PM Schedule triggers due date.    │ 1. Machine breakdown occurs.         │
│ 2. Work Order automatically created. │ 2. Technician reports Breakdown.     │
│ 3. Technician opens PM Checklist.    │ 3. Asset status shifts to DOWN.      │
│ 4. Executes numerical & pass/fail.   │ 4. Emergency P1 WO auto-generated.   │
│ 5. IF PASS: WO completes, PM resets. │ 5. Diagnostic Troubleshooting wizard.│
│ 6. IF FAIL: Corrective WO generated, │ 6. Spare parts issued from stock.    │
│    Asset set to Degraded/OOS.        │ 7. Machine repaired & tested.        │
│                                      │ 8. Supervisor verifies labor hours.  │
│                                      │ 9. Asset restored to Operational.    │
│                                      │ 10. Downtime, MTTR & MTBF updated.   │
│                                      │ 11. If >= 3 failures: Bad Actor flag │
│                                      │     triggers RCA 2.0 Investigation.  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 11. Preventive Maintenance Flow

### Step-by-Step PM Execution Workflow
1. **Schedule Trigger**: PM Schedules (`/maintenance/pm-schedules`) define recurring maintenance rules (e.g. `Weekly 50-Point Inspection`, `Monthly Lubrication`).
2. **Work Order Linkage**: When a PM becomes due, a linked Work Order is initialized.
3. **Execution**: Technician clicks **Execute Checklist** on the PM Schedule or Asset 360 Maintenance tab.
4. **Interactive Checklist Interface** (`/maintenance/pm-checklists/execute/:id?woId=WO-xxx&asset=AST-xxx`):
   - Technician inspects each check point (Visual, Lubrication, Limit Switches, Temperature, Pressure).
   - Enters numeric sensor values (e.g. `62.4 °C`, `2.1 mm/s`).
   - Toggles **PASS** or **FAIL** buttons.
5. **Pass Scenario**:
   - Technician clicks **Submit Checklist Execution**.
   - Linked Work Order is automatically transitioned to `Completed`.
   - Next PM Due Date is recalculated based on recurrence frequency (e.g. +30 days).
   - PM status resets to `On Schedule`.
6. **Failure Automation Scenario**:
   - Technician marks an item as **FAIL** (e.g. `Limit Switch Damaged`).
   - Enters Failure Severity (`Minor`, `Major`, `Critical`).
   - System invokes `handleFailedPMCheck()` in `CMMSContext`:
     - If `Critical`: Asset status is immediately downgraded to `Out of Service` (-20 Health).
     - Automatically generates an Emergency Corrective Work Order (`WO-2026-xxxx`) explicitly referencing the **Originating PM WO ID** in its description.
     - Adds corrective action item to the maintenance backlog.

---

## 12. Breakdown & Emergency Maintenance Flow

```
[Machine Stoppage on Factory Floor]
                │
                ▼
  [Technician Reports Breakdown] (/maintenance/breakdowns)
                │
                ├──► [Asset Status shifts to "DOWN" / "Breakdown"]
                ├──► [Custom DOM Event "AssetStatusChanged" Emitted]
                ├──► [Line Stoppage displayed on Command Center]
                └──► [Emergency P1 Corrective Work Order Generated]
                                │
                                ▼
               [Diagnostic Troubleshooting Wizard]
                                │
                                ▼
            [Spare Parts Issued & Stock Deducted]
                                │
                                ▼
               [Mechanical / Electrical Repair]
                                │
                                ▼
           [Supervisor Sign-Off & Labour Hours Logged]
                                │
                                ▼
       [Breakdown Resolved & Status returns to "Operational"]
                                │
                                ├──► [Downtime Duration Calculated]
                                ├──► [MTTR and MTBF Dynamically Recalculated]
                                ├──► [Machine History Timeline Appended]
                                └──► [21 CFR Part 11 Audit Log Recorded]
```

---

## 13. Troubleshooting Flow

MaintenX OS provides an interactive **Diagnostic Decision Tree** (`/maintenance/troubleshooting`) to guide technicians through complex fault isolation.

```
[Select Asset & Machine Type] (e.g. High-Speed Rotary Filler)
               │
               ▼
[Select Failure Code / Symptom] (e.g. MEC-004 Spindle Vibration)
               │
               ▼
[Step 1: Visual Inspection & Physical Verification]
               │
               ▼
[Step 2: Electrical & Sensor Telemetry Validation]
               │
               ▼
[Step 3: Mechanical Alignment & Torque Calibration]
               │
               ▼
[Root Cause Identified & Corrective Resolution Action]
               │
               ▼
[Optionally Publish to "Verified Solutions Library"] (/maintenance/verified-solutions)
```

---

## 14. Spare Parts Flow

The Spare Parts & Bill of Materials module (`/maintenance/spare-parts`) prevents inventory stockouts and accurately calculates maintenance costs.

```
[Spare Part Master] (Part No, Name, Category, Unit Cost, Location Bin)
          │
          ├──► [Linked to Machine BOM] (e.g. Filler Valve Seal -> FM-001)
          │
          ▼
[Work Order Execution / Asset 360]
          │
          ▼
[Click "Issue Part to Machine"]
          │
          ▼
[Select Part No, Enter Quantity (e.g. 2), Select Target WO]
          │
          ▼
[Confirm & Deduct Stock]
          │
          ├──► [Inventory Stock count decreases in real time]
          ├──► [Total Maintenance Cost recalculated on Asset 360]
          ├──► [Spare Part event logged in Machine History Timeline]
          └──► [Audit Trail entry created: "Spare Part Issued"]
```

---

## 15. Calibration Flow

The Calibration Center (`/maintenance/calibration`) ensures compliance with ISO 17025 and FDA 21 CFR Part 11 metrology standards.

```
[Instrumentation Registry] (Flow meters, Pressure transducers, Thermocouples)
             │
             ▼
[Calibration Schedule & Due Date Alerts]
             │
             ▼
[Click "+ Log Calibration" Modal]
             │
             ├── Enter Asset / Instrument ID (e.g. FM-001)
             ├── Enter NIST Calibration Standard Used
             ├── Select Verification Result: [PASS | ADJUSTED | FAIL]
             ├── Enter Next Due Date (e.g. +90 Days)
             └── Enter Certified Metrology Technician Name
             │
             ▼
[Save Calibration Record]
             │
             ├──► [Instrument record updated in CMMSContext]
             ├──► [NIST Traceable PDF Certificate generation ready]
             ├──► [Appended to Asset 360 Machine Life-Cycle Timeline]
             └──► [Centralized Audit Log recorded]
```

---

## 16. Downtime & Reliability Flow

The platform features an automated **Reliability Analytics Engine** (`/maintenance/reliability` & Asset 360 Tab 4):

### 1. Downtime Metric Calculations
- **Total Downtime Duration**: Calculated dynamically as `Breakdown End Time - Breakdown Start Time` across all stoppage records.
- **Production Loss Estimation**: `(Total Downtime Hours) * (Nominal Machine Speed BPM) * 60 = Estimated Units Lost`.

### 2. Reliability KPIs
- **Mean Time to Repair (MTTR)**:
  $$\text{MTTR} = \frac{\sum (\text{Breakdown Duration in Hours})}{\text{Total Number of Breakdowns}}$$
- **Mean Time Between Failures (MTBF)**:
  $$\text{MTBF} = \frac{\text{Total Asset Operating Hours} - \text{Total Downtime Hours}}{\text{Total Number of Breakdowns}}$$

### 3. Bad Actor Engine
- Evaluates `recentFailuresCount` in real time based on recurring breakdown occurrences for each asset ID.
- **Threshold**: When an asset accumulates $\ge 3$ breakdown events in a rolling 30-day window, the system automatically:
  1. Flags the asset as a **BAD ACTOR (CRITICAL ALERT)**.
  2. Displays high-priority warning cards on the Maintenance Dashboard and Asset 360.
  3. Prompts the engineering team to trigger an **RCA 2.0 Investigation**.

---

## 17. RCA / CAPA Flow

The Continuous Improvement module (`/ci/rca/*` and `/ci/capa/*`) provides structured root-cause analysis.

```
[Bad Actor Stoppage / Quality Non-Conformance]
                     │
                     ▼
       [Initiate RCA 2.0 Investigation]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  [5-Why Tree Analysis]   [Ishikawa (Fishbone) Diagram]
  (Why 1 -> Why 5)        (Man, Machine, Material, Method)
         │                       │
         └───────────┬───────────┘
                     ▼
   [Validate Occurrence & Escape Root Causes]
                     │
                     ▼
      [Generate CAPA Action Items]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[Corrective Actions]    [Preventive Actions]
(Immediate containment) (Long-term engineering fix)
         │                       │
         └───────────┬───────────┘
                     ▼
  [Assign Owner, Priority & Due Date]
                     │
                     ▼
[Effectiveness Verification & 21 CFR Sign-Off]
```

---

## 18. CI / Continuous Improvement Flow

The CI Project Suite (`/ci/projects/*`) tracks Kaizen initiatives, financial savings, and standardized best practices.

```
[Launch CI Project] (Define Objective, Target Line, Budget, Lead Engineer)
           │
           ▼
[Execute Project Action Items & Engineering Modifications]
           │
           ▼
[Calculate Financial Benefits] (Downtime reduction $, Scrap reduction $)
           │
           ▼
[21 CFR Part 11 Benefits Verification & Lock]
           │
           ├── Requires Authorized Quality / Plant Manager Sign-off
           ├── Cryptographic Audit Timestamp logged
           └── Locked Savings push to Executive P&L Dashboard
           │
           ▼
[Publish Standardized Operating Procedure (SOP) & Verified Solution]
```

---

## 19. Audit Trail Flow

MaintenX OS enforces a centralized, immutable audit log (`/audit-logs` and `/governance/audit`) meeting **FDA 21 CFR Part 11** and **GxP Annex 11** compliance requirements.

### Audit Entry Data Structure
Every state mutation across Master Data, CMMS, Quality, and Production generates a standardized audit object:
```json
{
  "auditId": "AUD-4821",
  "timestamp": "02 Sep 2026, 16:45:10",
  "user": "Alexander Vance",
  "userRole": "System Administrator",
  "entityId": "FM-001",
  "entityType": "Asset Master",
  "action": "Status Changed",
  "field": "status",
  "oldValue": "Operational",
  "newValue": "Breakdown",
  "notes": "Operational state updated to Breakdown"
}
```

### Audited Actions Catalog
- Asset Registered / Updated / Status Changed
- Production Line Reallocated
- Criticality Rating Modified
- Work Order Created / Started / Completed / Verified
- PM Schedule Created / Checklist Executed / Limit Failed
- Breakdown Reported / Stoppage Resolved
- Spare Part Issued / Inventory Adjusted
- Calibration Recorded / Certificate Downloaded
- BOM Recipe Submitted / Approved / Rejected
- Quality Hold Quarantined / QA Disposition Released
- CI Project Benefits Verified & Locked

---

## 20. Role-Based User Journeys

### Journey 1: Maintenance Technician
```
[1. Login as Maintenance]
       ↓
[2. View Maintenance Dashboard (/maintenance)] -> Check Open WOs & Active Stoppages
       ↓
[3. Open Work Orders (/maintenance/work-orders)] -> Select assigned Corrective WO
       ↓
[4. Click "Start Work Order"] -> Real-time repair timer begins ticking
       ↓
[5. Open Spare Parts BOM Tab] -> Click "Issue Part" to deduct replacement seal from inventory
       ↓
[6. Complete Repair & Stop Timer] -> Enter resolution summary
       ↓
[7. Navigate to PM Checklists (/maintenance/pm-checklists)] -> Execute scheduled PM
       ↓
[8. Submit Passing Checklist] -> PM resets to On Schedule, WO automatically completes
```

### Journey 2: Plant Manager
```
[1. Login as Plant Manager]
       ↓
[2. Open Command Center (/command-center)] -> Review site OEE, active line stoppages, QA holds
       ↓
[3. Drill Down to Line 1 Bottling] -> Inspect hourly output vs nominal design rate
       ↓
[4. Check Exception Control Tower (/exception-control-tower)] -> Acknowledge machine alerts
       ↓
[5. Review Executive Reports (/reports)] -> Export consolidated daily operational summary
```

### Journey 3: Quality / QA Manager
```
[1. Login as Quality / QA]
       ↓
[2. View Quality Dashboard (/quality/dashboard)] -> Monitor open deviations & CCP compliance
       ↓
[3. Open Pre-Op Sanitation Checklists (/quality/sanitation/preop)] -> Verify Clean-In-Place (CIP)
       ↓
[4. Open QA Release Queue (/quality/release/queue)] -> Review completed production batch
       ↓
[5. Perform Batch Disposition (/quality/disposition/release)] -> Electronically sign off release
```

---

## 21. Page-by-Page Guide

| Page Name | Route | Module | Clearance | Key Actions | Connected Modules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Center** | `/command-center` | Plant Mgmt | All Roles | View plant OEE, drill down to lines | Production, CMMS, Quality |
| **Asset Directory** | `/maintenance/assets` | CMMS | Maintenance, Lead, PM | Search machines, register new asset | Master Data, Production |
| **Asset 360°** | `/maintenance/assets/:id`| CMMS | All Roles | 5 Tabs: Info, Prod, Maint, Downtime, Audit | Production, CMMS, Audit |
| **Work Orders List** | `/maintenance/work-orders`| CMMS | Maintenance, Lead, PM | Filter WOs, create new work order | Assets, Spare Parts |
| **Work Order Detail**| `/maintenance/work-orders/:id`| CMMS| Maintenance, Lead, PM | Start timer, issue parts, complete WO | Assets, Labour, Inventory |
| **PM Schedules** | `/maintenance/pm-schedules`| CMMS | Maintenance, Lead, PM | View schedules, launch checklists | Work Orders, Checklists |
| **Execute PM Check** | `/maintenance/pm-checklists/execute/:id`| CMMS | Maintenance, Lead | Pass/fail checks, fail escalations | Work Orders, Assets |
| **Breakdown Hub** | `/maintenance/breakdowns`| CMMS | All Roles | Report breakdown, resolve stoppages | Downtime, WOs, Reliability |
| **Breakdown Detail** | `/maintenance/breakdowns/:id`| CMMS | Maintenance, Lead, PM | Diagnose root cause, close stoppage | Troubleshooting, RCA |
| **Spare Parts BOM** | `/maintenance/spare-parts`| CMMS | Maintenance, Warehouse| Check stock, restock, issue parts | Work Orders, Assets |
| **Calibration** | `/maintenance/calibration`| CMMS | Maintenance, Quality | View compliance, log calibration | Quality, Assets, Audit |
| **Troubleshooting** | `/maintenance/troubleshooting`| CMMS| Maintenance, Tech | Interactive diagnostic decision tree | Failure Codes, Solutions |
| **RCA Investigations**| `/ci/rca/investigations` | CI | CI Eng, Quality, PM | 5-Why analysis, fishbone diagram | Breakdowns, CAPA |
| **CAPA Actions** | `/ci/capa/corrective` | CI | CI Eng, Quality, PM | Create corrective/preventive actions| RCA, CI Projects |
| **Item Master** | `/master-data/items` | Master Data | Admin, Plant Manager | Register SKUs, configure packaging | BOMs, Warehouse |
| **BOM Recipes** | `/master-data/bom` | Master Data | Admin, Plant Manager | Define recipe ingredients, submit BOM| Production, Planning |
| **Audit Logs** | `/audit-logs` | Governance | Admin, Quality, PM | Filter, inspect, and export audit | All Modules |

---

## 22. Button-by-Button Action Map

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 KEY BUTTONS & TRANSACTION ACTIONS                                  │
├──────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────────┤
│ Button Label     │ Page Location        │ Pre-Condition        │ State Change & Result             │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Register Machine │ /maintenance/assets  │ Unique Tag ID        │ Adds asset to CMMS state, logs    │
│                  │                      │                      │ audit, opens Asset 360.           │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Edit Information │ Asset 360 (Tab 1)    │ Asset loaded         │ Opens inline edit form; saving    │
│                  │                      │                      │ persists fields & logs audit.     │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Issue Part       │ Asset 360 / WO Detail│ Spare in stock (>0)  │ Deducts stock quantity, links part│
│                  │                      │                      │ to WO, updates maintenance cost.  │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Log Calibration  │ /maintenance/calib   │ Instrument selected  │ Logs NIST calibration record,     │
│                  │                      │                      │ resets next due date (+90 days).  │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Start Work Order │ WO Detail (/work-orders/:id) | WO is Open   │ Shifts status to "In Progress",   │
│                  │                      │                      │ activates live repair stopwatch.  │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Complete WO      │ WO Detail (/work-orders/:id) | In Progress  │ Prompts supervisor verification & │
│                  │                      │                      │ actual labor hours, closes WO.    │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Report Breakdown │ /maintenance/breakdowns | Machine running   │ Sets Asset to "DOWN", halts line, │
│                  │                      │                      │ generates Emergency P1 WO.        │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Resolve Breakdown│ Breakdown Detail     │ Stoppage active      │ Sets Asset to "Operational",      │
│                  │                      │                      │ calculates downtime, updates MTTR.│
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Submit Checklist │ PM Checklist Execute │ Checks reviewed      │ If Pass: Completes WO & resets PM.│
│                  │                      │                      │ If Fail: Generates Corrective WO. │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Verify & Lock    │ CI Project Savings   │ Project completed    │ Applies 21 CFR Part 11 signature, │
│                  │                      │                      │ locks savings to Executive P&L.   │
├──────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ Export CSV       │ Asset 360 Audit / Logs| Logs exist          │ Generates and downloads CSV audit │
│                  │                      │                      │ spreadsheet file.                 │
└──────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────────┘
```

---

## 23. Data Flow Map

```
[MASTER DATA]
  │ (itemMaster, bomRecipes, lineHierarchy, assetRegistry)
  ▼
[PLANNING & APS] ────────► [PRODUCTION ORDERS] ────────► [WAREHOUSE STAGING]
                                  │                              │
                                  ▼                              ▼
                       [SHOP FLOOR EXECUTION] ◄─────── [LOT VERIFICATION]
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [QUALITY INSPECTIONS]            [CMMS ASSET TELEMETRY]
        (CCP Checks, QA Release)         (Vibration, Temp, Status)
                                                  │
                                  ┌───────────────┴───────────────┐
                                  ▼                               ▼
                        [PM CHECKLIST ENGINE]           [BREAKDOWN ENGINE]
                        (Scheduled Servicing)           (Emergency Stoppages)
                                  │                               │
                                  └───────────────┬───────────────┘
                                                  ▼
                                      [WORK ORDER RESOLUTION]
                                                  │
                                                  ▼
                                      [RELIABILITY ANALYTICS]
                                      (MTTR, MTBF, Bad Actors)
                                                  │
                                                  ▼
                                      [RCA 2.0 & CAPA ACTIONS]
                                                  │
                                                  ▼
                                      [CONTINUOUS IMPROVEMENT]
                                      (Savings $, Verified Solutions)
                                                  │
                                                  ▼
                                      [EXECUTIVE FINANCIAL P&L]
```

---

## 24. Status Transition Map

```
ASSET STATUS LIFECYCLE:
  Operational (RUNNING) ──[Breakdown Occurs]──► DOWN (Breakdown)
           ▲                                          │
           │                                          ▼
  [Repair Completed] ◄─── Maintenance Mode ◄─── Degraded Speed
           │
           └──[Critical PM Failure]──► Out of Service

WORK ORDER STATUS LIFECYCLE:
  Open / Pending ──► In Progress ──► Paused ──► In Progress ──► Completed ──► Verified / Closed

PREVENTIVE MAINTENANCE LIFECYCLE:
  On Schedule ──► Due Today ──► Overdue ──► Executing Checklist ──► Completed / Reset

BREAKDOWN STAGES:
  Reported / Open ──► Investigating ──► Repair In Progress ──► Resolved ──► Closed
```

---

## 25. Exception / Failure Flows

```
┌──────────────────────────────────────┬──────────────────────────────────┬─────────────────────────────────┐
│ Exception Scenario                   │ System Response                  │ Resolution Action               │
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 1. Duplicate Asset Tag ID entered    │ Form blocks save; displays error │ Enter a unique identifier       │
│    during machine registration       │ toast: "Asset ID already exists" │ (e.g. AST-TEST-002).            │
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 2. PM Checklist item marked FAIL     │ System prompts severity level;   │ Emergency Corrective WO is      │
│    (e.g. worn packaging seal)        │ auto-generates Corrective WO     │ dispatched to maintenance queue.│
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 3. Critical PM item failure          │ Asset status auto-downgraded to  │ Line halted until replacement   │
│                                      │ "Out of Service" (-20 Health)    │ component is installed.         │
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 4. Spare part inventory at 0         │ "Issue Part" dropdown disables   │ Warehouse issues restock PO     │
│    when technician attempts issue    │ out-of-stock item                │ or uses general emergency bin.  │
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 5. Machine accumulates >= 3 repeat   │ Reliability engine triggers      │ CI Engineer launches formal     │
│    breakdowns in 30 days             │ "BAD ACTOR" high-priority alert  │ RCA 2.0 investigation.          │
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 6. In-line CCP check exceeds limit   │ Quality module triggers Critical │ Non-conforming batch placed     │
│    (e.g. Pasteurizer temp < 72°C)    │ Deviation alert                  │ on immediate QA HOLD.           │
├──────────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 7. Unauthorized user attempts        │ <RoleProtectedRoute> displays    │ Switch to authorized role via   │
│    restricted screen navigation      │ branded "Access Restricted" screen| global header switcher.        │
└──────────────────────────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

---

## 26. Complete Client Demo Sequence

Follow this recommended **27-Step Live Client Demonstration Storyline** to showcase the full power of MaintenX OS in under 15 minutes:

```
Step  1: Open Application -> Land on Command Center (/command-center) as Plant Manager.
Step  2: Point out live Plant OEE, Active Stoppages, and Line Status cards.
Step  3: Switch Role to "System Administrator" via the top header switcher.
Step  4: Navigate to Master Data -> Items (/master-data/items) and show SKU Catalog.
Step  5: Navigate to Master Data -> BOMs (/master-data/bom) and show Recipe approval workflow.
Step  6: Switch Role to "Maintenance".
Step  7: Open Equipment Registry (/maintenance/assets) and click "+ Register New Machine".
Step  8: Register machine "AST-TEST-001" (Test Pasteurizer, Line 1, Bay 4B, Critical).
Step  9: Show that Asset 360 immediately opens to Tab 1 (INFO).
Step 10: Click "Edit Information" -> Change Criticality from Medium to Critical -> Click Save.
Step 11: Switch to Tab 2 (PRODUCTION) -> Show active Line 1 Production Order & live speed.
Step 12: Switch to Tab 3 (MAINTENANCE) -> Review Health Index and PM schedules.
Step 13: Click "Issue Part to Machine" -> Select Valve Seal (Qty: 2) -> Click Confirm & Deduct.
Step 14: Show that Spare Parts BOM updates and maintenance cost reflects consumption.
Step 15: Click "Log Calibration" -> Enter NIST Standard -> Select "PASS" -> Click Log.
Step 16: Scroll down to show unified Machine Life-Cycle History Timeline with new events.
Step 17: Switch to Tab 5 (AUDIT) -> Show 21 CFR Part 11 audit records capturing all edits.
Step 18: Navigate to Breakdowns (/maintenance/breakdowns) -> Click "+ Report Breakdown".
Step 19: Select "AST-TEST-001", Code "MEC-004 Spindle Vibration", Priority P1 Emergency.
Step 20: Return to Asset 360 -> Show Asset status changed to "DOWN (Breakdown)".
Step 21: Switch to Tab 4 (DOWNTIME) -> Show stoppage record and estimated production units lost.
Step 22: Open Work Orders (/maintenance/work-orders) -> Open the auto-generated Emergency WO.
Step 23: Click "Start Work Order" -> Wait 5s -> Click "Complete Work Order" (Enter 1.5h labor).
Step 24: Resolve Breakdown -> Show Asset returns to "Operational" and MTTR recalculates.
Step 25: Switch Role to "CI / Engineering" -> Navigate to RCA Investigations (/ci/rca/investigations).
Step 26: Show 5-Why analysis linked to the breakdown and open CAPA Corrective Actions.
Step 27: Return to Command Center (/command-center) -> Show all KPIs updated across the plant!
```

---

## 27. Client Training Steps

### Training Module 1: How to Register an Equipment Asset
1. Log in with `Maintenance`, `Plant Manager`, or `System Administrator` role.
2. Click **Asset 360°** (`/maintenance/assets`) in the left sidebar.
3. Click the blue **+ Register New Machine** button in the top right.
4. Fill in:
   - **Asset Tag ID**: Enter unique identifier (e.g. `FM-005`).
   - **Machine Name**: Enter full equipment title (e.g. `Krones Rotary Capper`).
   - **Classification**: Select primary category (e.g. `Packaging & Bottling`).
   - **Production Line**: Select destination line (e.g. `Line 1 (Aseptic Bottling)`).
   - **Location / Bay**: Enter physical cell (e.g. `Bay 4C`).
   - **Criticality**: Select risk tier (`Critical`, `High`, `Medium`, `Low`).
5. Click **Save & Register Asset**. The complete Asset 360 profile will open automatically.

### Training Module 2: How to Execute a Preventive Maintenance Checklist
1. Click **PM Scheduling** (`/maintenance/pm-schedules`) in the sidebar.
2. Locate a schedule displaying **Due Today** or **Overdue**.
3. Click the blue **Execute Checklist** button.
4. Review each inspection point on the form:
   - Enter measured values for numeric telemetry fields.
   - Click the green **PASS** or red **FAIL** buttons for each item.
5. If all items pass, click **Submit Checklist Execution**.
6. The work order will close, and the next due date will automatically advance.

---

## 28. Demo/Test Data Catalog

The following verified records are pre-seeded in MaintenX OS for live client demonstrations:

### Key Machine Assets
- **`FM-001`**: High-Speed Rotary Filler 12-Head (Plant 1, Line 1, Bay 4A, Critical, 94% Health)
- **`CP-102`**: Arol Capper Rotary Capping Machine (Plant 1, Line 1, Bay 4B, High, 88% Health)
- **`LB-204`**: Krones Autocol Rotary Labeler (Plant 1, Line 1, Bay 4C, Medium, 68% Health, Degraded)
- **`MX-003`**: Industrial Double-Cone Blender 5000L (Plant 1, Line 2, Processing Hall, High, 96% Health)

### Pre-Seeded Spare Parts
- **`PRT-SEAL-01`**: EPDM Rotary Shaft Seal 45mm (Stock: 14 units, Bin A-14, $45.00)
- **`PRT-VALV-02`**: Aseptic Volumetric Filling Valve Assembly (Stock: 4 units, Bin B-02, $380.00)
- **`PRT-BRG-03`**: SKF High-Temp Ceramic Bearing 6204 (Stock: 8 units, Bin C-09, $120.00)

### Pre-Seeded Failure Codes
- **`MEC-004`**: Rotary Spindle Bearing Wear & Vibration
- **`ELEC-002`**: Photoelectric Bottle Jam Sensor Fault
- **`PNEU-001`**: Low Pressure Header Drop (< 5.5 bar)

---

## 29. Feature Completion Matrix

```
┌──────────────────────────────────┬─────────────────┬──────────────┬──────────────────┬─────────────────┐
│ Module / Feature                 │ UI Completeness │ Data Flowing │ Persistent State │ Verified Status │
├──────────────────────────────────┼─────────────────┼──────────────┼──────────────────┼─────────────────┤
│ Master Data Hierarchy            │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ SKU / BOM Recipe Management      │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Asset Quick Registration         │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Asset 360 (5 Exact Tabs)         │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Work Orders (Timers & Labour)    │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ PM Schedules & Checklist Engine  │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ PM Failure -> Corrective WO      │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Breakdown Reporting & Down Logic │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Spare Parts BOM & Stock Issue    │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Calibration Center & NIST Modal  │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Troubleshooting Decision Wizard  │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Reliability Analytics (MTTR/MTBF)│ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Bad Actor Alert Engine (>=3 Fail)│ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ 21 CFR Part 11 Audit Trail Logs  │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Production Order Execution       │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Quality CCP Checks & QA Release  │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ CI RCA 2.0 & CAPA Engine         │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ CI Project Savings Lock          │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ RBAC Role Persona Switching      │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
│ Executive Financial Costing Hub  │ COMPLETE        │ COMPLETE     │ COMPLETE (Local) │ COMPLETE        │
└──────────────────────────────────┴─────────────────┴──────────────┴──────────────────┴─────────────────┘
```

---

## 30. Remaining Gaps & Limitations

1. **Physical Binary File Uploads**: Manuals, electrical schematics, and certificates currently trigger client-side mock PDF downloads; direct multi-part binary file uploads to object storage are **BACKEND PENDING**.
2. **Barcode Scanner Hardware Integration**: Barcode/QR scan interfaces use camera simulation/mock payload decoders; native Zebra/Honeywell ruggedized mobile SDK hooks are **INTEGRATION PENDING**.

---

## 31. Backend / Integration Dependencies

The following enterprise connectors are architected in the frontend and ready for backend API endpoint wiring:

```
┌─────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Integration Surface     │ Supported Standard / Protocol │ Target Enterprise System      │
├─────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ ERP Connector           │ REST API / OData / RFC        │ SAP S/4HANA, NetSuite, Oracle │
│ Shop Floor IoT Gateway  │ MQTT / OPC-UA / Sparkplug B   │ Kepware, Ignition SCADA, AWS  │
│ Barcode & RFID Scanners │ HID Keyboard Wedge / WebRTC   │ Zebra DataWedge, Cognex       │
│ Document Storage        │ AWS S3 / Azure Blob API       │ Secure GxP Document Vault     │
└─────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 32. Final System Flow Diagram

```
                                    ┌───────────────────────┐
                                    │    SYSTEM LOGIN       │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ ROLE CLEARANCE (RBAC) │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │    COMMAND CENTER     │
                                    └───────────┬───────────┘
                                                │
            ┌───────────────────────────────────┼───────────────────────────────────┐
            │                                   │                                   │
┌───────────▼───────────┐           ┌───────────▼───────────┐           ┌───────────▼───────────┐
│   MASTER DATA SUITE   │           │    PLANNING & APS     │           │  WAREHOUSE & STAGING  │
│ Plants, Lines, SKUs,  │           │ Orders, Forecast Run, │           │ Inbound, Lots, Bins,  │
│ BOM Recipes, Assets   │           │ MRP Net Requirements  │           │ Staged Raw Materials  │
└───────────┬───────────┘           └───────────┬───────────┘           └───────────┬───────────┘
            │                                   │                                   │
            └───────────────────────────────────┼───────────────────────────────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ PRODUCTION EXECUTION  │
                                    │ Shift Runs, Line OEE, │
                                    │ Operator Batch Steps  │
                                    └───────────┬───────────┘
                                                │
            ┌───────────────────────────────────┴───────────────────────────────────┐
            │                                                                       │
┌───────────▼───────────┐                                               ┌───────────▼───────────┐
│   QUALITY ASSURANCE   │                                               │   CMMS MAINTENANCE    │
│ Sanitation, In-Line   │                                               │ Asset 360 (5 Tabs),   │
│ CCP Checks, QA Release│                                               │ PM Checklists, Spares │
└───────────┬───────────┘                                               └───────────┬───────────┘
            │                                                                       │
            │           ┌───────────────────────────────────────────────────────────┤
            │           │                                                           │
            │ ┌─────────▼─────────┐                                       ┌─────────▼─────────┐
            │ │   PM EXECUTION    │                                       │ BREAKDOWN / DOWN  │
            │ │ Scheduled Checks, │                                       │ Emergency P1 WOs, │
            │ │ Pass/Fail Actions │                                       │ Stoppage Duration │
            │ └─────────┬─────────┘                                       └─────────┬─────────┘
            │           │                                                           │
            │           └─────────────────────────────┬─────────────────────────────┘
            │                                         │
            │                             ┌───────────▼───────────┐
            │                             │ RELIABILITY ANALYTICS │
            │                             │ MTTR, MTBF, Bad Actors│
            │                             └───────────┬───────────┘
            │                                         │
            └─────────────────────────────────────────┼─────────────────────────────────────┐
                                                      │                                     │
                                          ┌───────────▼───────────┐             ┌───────────▼───────────┐
                                          │   RCA 2.0 & CAPA      │             │  CENTRAL AUDIT TRAIL  │
                                          │ 5-Why, Fishbone,      │             │ 21 CFR Part 11 Log    │
                                          │ Corrective Actions    │             │ Immutable Change Track│
                                          └───────────┬───────────┘             └───────────────────────┘
                                                      │
                                          ┌───────────▼───────────┐
                                          │ CONTINUOUS IMPROVE    │
                                          │ Projects, Kaizen,     │
                                          │ Verified Cost Savings │
                                          └───────────┬───────────┘
                                                      │
                                          ┌───────────▼───────────┐
                                          │  EXECUTIVE FINANCIAL  │
                                          │ Manufacturing P&L,    │
                                          │ Enterprise Multi-Plant│
                                          └───────────────────────┘
```

---
*End of MaintenX OS Client Live Demo & End-to-End Workflow Guide.*

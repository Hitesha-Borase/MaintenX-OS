# MaintenX-OS — Complete A-to-Z Client Operational Manual & Step-by-Step Data Flow Guide

> **Document Classification:** Master Production User Guide & System Manual  
> **Platform Version:** MaintenX-OS Enterprise v2.5 (Production Ready)  
> **Target Audience:** Factory Clients, Operations Directors, System Admins, Production Planners, Warehouse Supervisors, Quality Managers, Reliability Engineers, and UAT Testers.  
> **Purpose:** This document is the **single source of truth** for operating MaintenX-OS. It explains **where to go**, **which dashboard to select**, **which menu to open first**, **what data to enter**, **exact form fields**, and **how data flows end-to-end** across the entire factory operating chain.

---

## Table of Contents
1. [Enterprise Architecture & The Canonical Operating Chain](#1-enterprise-architecture--the-canonical-operating-chain)
2. [Fast Role Switcher & Pre-Configured Test Personas](#2-fast-role-switcher--pre-configured-test-personas)
3. [End-to-End Operational Lifecycle Map](#3-end-to-end-operational-lifecycle-map)
4. [Phase 1: Foundation Setup — Master Data & Factory Hierarchy](#phase-1-foundation-setup--master-data--factory-hierarchy)
   - [Step 1.1: Setup Plants & Facilities](#step-11-setup-plants--facilities)
   - [Step 1.2: Setup Production Lines & Work Centers](#step-12-setup-production-lines--work-centers)
   - [Step 1.3: Register Items & SKUs (Raw, Packaging, FG)](#step-13-register-items--skus-raw-packaging-fg)
   - [Step 1.4: Define Bills of Materials (BOM) & Recipes](#step-14-define-bills-of-materials-bom--recipes)
   - [Step 1.5: Configure Production Routings & Operations](#step-15-configure-production-routings--operations)
   - [Step 1.6: Establish Quality Specifications & CCP Limits](#step-16-establish-quality-specifications--ccp-limits)
   - [Step 1.7: Configure Skills & Labour Standards](#step-17-configure-skills--labour-standards)
5. [Phase 2: Inbound Supply Chain — Purchasing & Raw Material Receiving](#phase-2-inbound-supply-chain--purchasing--raw-material-receiving)
   - [Step 2.1: Raise Inbound Purchase Order (PO)](#step-21-raise-inbound-purchase-order-po)
   - [Step 2.2: Physical Material Receiving & Lot Code Generation](#step-22-physical-material-receiving--lot-code-generation)
   - [Step 2.3: Put-Away into Warehouse Bins & Racks](#step-23-put-away-into-warehouse-bins--racks)
6. [Phase 3: Production Planning, MRP & Finite APS Scheduling](#phase-3-production-planning-mrp--finite-aps-scheduling)
   - [Step 3.1: Log Customer Sales Demand / Orders](#step-31-log-customer-sales-demand--orders)
   - [Step 3.2: Run Material Requirements Planning (MRP)](#step-32-run-material-requirements-planning-mrp)
   - [Step 3.3: Finite Capacity Scheduling (APS Scheduler)](#step-33-finite-capacity-scheduling-aps-scheduler)
   - [Step 3.4: Create & Release Production Orders (PO/WO)](#step-34-create--release-production-orders-powo)
   - [Step 3.5: Hard-Reserve Inventory Materials](#step-35-hard-reserve-inventory-materials)
7. [Phase 4: Warehouse Kitting, Picking & Line Staging](#phase-4-warehouse-kitting-picking--line-staging)
   - [Step 4.1: Generate & Review Pick Lists](#step-41-generate--review-pick-lists)
   - [Step 4.2: Execute Barcode Scan Picking & Stage to Line Feed](#step-42-execute-barcode-scan-picking--stage-to-line-feed)
8. [Phase 5: Pre-Op Sanitation & Line Readiness Clearance](#phase-5-pre-op-sanitation--line-readiness-clearance)
   - [Step 5.1: Execute Pre-Op Sanitation Checklist & ATP Swabs](#step-51-execute-pre-op-sanitation-checklist--atp-swabs)
   - [Step 5.2: Grant Digital Line Clearance to Run](#step-52-grant-digital-line-clearance-to-run)
9. [Phase 6: Shop Floor Live Execution & Electronic Batch Records (eBR)](#phase-6-shop-floor-live-execution--electronic-batch-records-ebr)
   - [Step 6.1: Operator Shift Login & Claim Work Order](#step-61-operator-shift-login--claim-work-order)
   - [Step 6.2: Complete 6-Step Electronic Batch Record (eBR)](#step-62-complete-6-step-electronic-batch-record-ebr)
   - [Step 6.3: Log Downtime, Micro-Stops & Breakdown Escalation](#step-63-log-downtime-micro-stops--breakdown-escalation)
   - [Step 6.4: Line Lead Hour-by-Hour (H/B) Pitch Tracking](#step-64-line-lead-hour-by-hour-hb-pitch-tracking)
10. [Phase 7: Maintenance CMMS & Breakdown Intervention](#phase-7-maintenance-cmms--breakdown-intervention)
    - [Step 7.1: Triage Auto-Triggered Breakdown Tickets](#step-71-triage-auto-triggered-breakdown-tickets)
    - [Step 7.2: Dispatch Technician, Consume Spares & Clear Return-to-Service](#step-72-dispatch-technician-consume-spares--clear-return-to-service)
    - [Step 7.3: Preventive Maintenance (PM) Execution](#step-73-preventive-maintenance-pm-execution)
11. [Phase 8: Quality Lab Verification, Disposition & Batch Release](#phase-8-quality-lab-verification-disposition--batch-release)
    - [Step 8.1: In-line Quality & Critical Control Point (CCP) Inspection](#step-81-in-line-quality--critical-control-point-ccp-inspection)
    - [Step 8.2: Handle Non-Conformance & Quarantine Holds](#step-82-handle-non-conformance--quarantine-holds)
    - [Step 8.3: Review Full Batch History & Certificate of Analysis (CoA)](#step-83-review-full-batch-history--certificate-of-analysis-coa)
    - [Step 8.4: 21 CFR Part 11 Electronic Signature Batch Release](#step-84-21-cfr-part-11-electronic-signature-batch-release)
12. [Phase 9: Finished Goods Warehousing, Shipping & Batch 360 Traceability](#phase-9-finished-goods-warehousing-shipping--batch-360-traceability)
    - [Step 9.1: Receive Released Batch into Finished Goods Bay](#step-91-receive-released-batch-into-finished-goods-bay)
    - [Step 9.2: Create Dispatch Order & Generate Bill of Lading (BOL)](#step-92-create-dispatch-order--generate-bill-of-lading-bol)
    - [Step 9.3: Bi-Directional Batch 360 Traceability Audit](#step-93-bi-directional-batch-360-traceability-audit)
13. [Phase 10: Continuous Improvement (CI), RCA 2.0 & Executive Financials](#phase-10-continuous-improvement-ci-rca-20--executive-financials)
    - [Step 10.1: Conduct 5-Why Root Cause Analysis (RCA 2.0)](#step-101-conduct-5-why-root-cause-analysis-rca-20)
    - [Step 10.2: Implement & Track CAPA Corrective Actions](#step-102-implement--track-capa-corrective-actions)
    - [Step 10.3: Monitor Real-Time Plant Command Center & OEE](#step-103-monitor-real-time-plant-command-center--oee)
    - [Step 10.4: Executive Financial Cost Variance & Manufacturing Margins](#step-104-executive-financial-cost-variance--manufacturing-margins)
14. [Master Troubleshooting & Quick Sanity Checklist](#14-master-troubleshooting--quick-sanity-checklist)

---

## 1. Enterprise Architecture & The Canonical Operating Chain

MaintenX-OS operates on a closed-loop, data-driven manufacturing flow. No action on the shop floor can occur without preceding master data, planned material availability, and validated sanitation.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MAINTENX-OS CANONICAL DATA CHAIN                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
             [PHASE 1: MASTER DATA & FACTORY FOUNDATION]
     Plants ➔ Lines ➔ Work Centers ➔ SKUs ➔ BOM Recipes ➔ Routings ➔ QA Specs
                                      │
                                      ▼
             [PHASE 2: INBOUND PURCHASING & RECEIVING]
         Supplier PO ➔ Gate Dock ➔ Inspection ➔ Lot Registration ➔ Bin Put-away
                                      │
                                      ▼
             [PHASE 3: DEMAND, MRP & FINITE SCHEDULING]
   Customer Orders ➔ Net MRP Explode ➔ APS Capacity Sequencing ➔ Release WO ➔ Hard Reserve
                                      │
                                      ▼
             [PHASE 4: WAREHOUSE PICKING & LINE FEED]
       Pick Tickets ➔ Lot Verification ➔ Line Feed Staging Buffer
                                      │
                                      ▼
             [PHASE 5: PRE-OP SANITATION CLEARANCE]
        ATP Swab Test ➔ Allergen Wash ➔ Digital Line Clear to Run
                                      │
                                      ▼
             [PHASE 6: SHOP FLOOR EXECUTION & 6-STEP eBR]
  Tare Weigh ➔ Mixing Telemetry ➔ CCP Kill ➔ Fill & Torque ➔ Count Output ➔ H/B Pitch
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
                 ▼                                         ▼
   [PHASE 7: CMMS BREAKDOWN INTERVENTION]       [PHASE 8: QUALITY LAB & 21 CFR PART 11]
Breakdown Auto-Ticket ➔ Tech Dispatch ➔ Spares   CCP Review ➔ Deviations ➔ Electronic Sign-off
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
             [PHASE 9: FINISHED GOODS WMS & DISPATCH]
      FG Palletization ➔ Sales Shipment ➔ Bill of Lading ➔ Batch 360 Traceability
                                      │
                                      ▼
             [PHASE 10: CONTINUOUS IMPROVEMENT & EXECUTIVE]
     5-Why RCA 2.0 ➔ CAPA Actions ➔ Live Plant OEE ➔ Unit Cost Variance Analysis
```

---

## 2. Fast Role Switcher & Pre-Configured Test Personas

MaintenX-OS features a built-in **Fast Role Switcher** in the top navigation bar and user profile dropdown. You can switch between all 12 manufacturing personas with a single click without logging out:

| # | Role / Persona | Default Dashboard Route | Test User & Email | Primary Responsibility |
|---|---|---|---|---|
| **0** | **Master Admin** | `/master/dashboard` | Elena Vance (`master@maintenx.com`) | Multi-tenant billing, plans, company admins |
| **1** | **System Administrator** | `/admin/console` | Alexander Vance (`admin@maintenx.com`) | Factory Master Data, users, plant setup |
| **2** | **Planner / Scheduler** | `/planner/dashboard` | Elena Rostova (`planner@maintenx.com`) | Demand, MRP, APS scheduling, order release |
| **3** | **Warehouse / Logistics** | `/warehouse/dashboard` | Carlos Mendez (`warehouse@maintenx.com`) | POs, raw receiving, lots, picking, dispatch |
| **4** | **Maintenance Technician** | `/maintenance` | Dave Miller (`maintenance@maintenx.com`) | Asset 360, breakdown triage, PM work orders |
| **5** | **Operations Supervisor** | `/supervisor/dashboard` | Sarah Jenkins (`supervisor@maintenx.com`) | Labour, shift staffing, schedule adherence |
| **6** | **Line Lead** | `/linelead/dashboard` | Devang Patel (`linelead@maintenx.com`) | H/B pitch tracking, changeover, line speed |
| **7** | **Line Operator** | `/operator/dashboard` | Marcus Chen (`operator@maintenx.com`) | Live production entry, 6-step eBR, downtime |
| **8** | **Quality / QA Lead** | `/quality/dashboard` | Dr. Rachel Thorne (`qa@maintenx.com`) | Pre-op swab, CCP checks, batch disposition |
| **9** | **CI Engineer** | `/ci/dashboard` | Viktor Hayes (`ci@maintenx.com`) | 5-Why RCA, CAPA actions, loss analysis |
| **10** | **Plant Manager** | `/command-center` | Arthur Sterling (`plant.manager@maintenx.com`) | Plant OEE, plant-wide control tower |
| **11** | **Executive / COO** | `/executive/dashboard` | Victoria Sterling (`executive@maintenx.com`) | Financial variance, gross margins, EBITDA |

> **How to Switch Persona in UI:**  
> Click your Avatar icon in the top right corner ➔ Click **"Switch Role"** ➔ Select any of the 12 roles. The sidebar navigation, permissions, and dashboards immediately adapt.

---

## 3. End-to-End Operational Lifecycle Map

To make this manual practical, we follow a concrete real-world production example:  
**Order Goal:** Produce and ship **10,000 Cans of "Sparkling Hibiscus Tonic 330ml" (SKU-5001)** for customer **"Whole Foods Global"**.

Here is the exact step-by-step path you must take.

---

## Phase 1: Foundation Setup — Master Data & Factory Hierarchy

> **Active Role:** `System Administrator` (`admin@maintenx.com`) or `Plant Manager`  
> **Prerequisite:** Fresh system deployment or onboarding a new production line/SKU.

### Step 1.1: Setup Plants & Facilities
* **Where to go:** In the left sidebar, expand **Master Data** (or Organization) ➔ Click **"Plants & Facilities"**  
* **URL:** `/organization/plants`  
* **Action:** Click the top-right button: **`+ Add New Plant`**
* **Data Fields to Fill:**

| Field Label | Input Type | Example Value | Description |
|---|---|---|---|
| **Plant Code \*** | Text | `PLANT-INDORE-01` | Unique facility identifier |
| **Plant Name \*** | Text | `Indore Mega Manufacturing Facility` | Formal name of the factory |
| **Location / City** | Text | `Indore, Madhya Pradesh` | Physical address |
| **Timezone** | Dropdown | `Asia/Kolkata (IST +5:30)` | Factory operating timezone |
| **Operating Currency** | Dropdown | `INR (₹)` or `USD ($)` | Costing base currency |
| **Total Facility Area** | Number | `85000` | Square feet / meters |

* **Click:** **`Save Plant`**  
* **System Result:** The plant is registered into `plants` table with UUID.

---

### Step 1.2: Setup Production Lines & Work Centers
* **Where to go:** In sidebar, click **"Lines Master"** or **"Work Centers"**  
* **URL:** `/organization/lines` and `/master-data/work-centers`  
* **Action:** Click **`+ Add Production Line`**
* **Data Fields to Fill:**

| Field Label | Input Type | Example Value | Description |
|---|---|---|---|
| **Line Code \*** | Text | `LINE-01` | Unique production line ID |
| **Line Name \*** | Text | `High-Speed Bottling & Canning Line 1` | Descriptive operational name |
| **Assigned Plant \*** | Dropdown | `Indore Mega Manufacturing Facility` | Linked plant facility |
| **Design Speed (BPH/CPH)**| Number | `3600` | Units per hour nominal capacity |
| **Standard Crew Size** | Number | `4` | Required operators for running |
| **OEE Target (%)** | Number | `85.0` | Target Overall Equipment Effectiveness |

* **Add Work Centers (Machines) inside Line 1:**
  1. `WC-MIX-01` — High Shear Batch Blender (Capacity: 2,500 L)
  2. `WC-FILL-01` — Rotary Isobaric Canning Filler (Speed: 60 CPM)
  3. `WC-SEAM-01` — Can Double-Seamer & Capper (Torque: 3.5 - 4.2 Nm)
  4. `WC-PACK-01` — Wrap-Around Case Packer & Palletizer

* **Click:** **`Save Line & Work Centers`**

---

### Step 1.3: Register Items & SKUs (Raw, Packaging, FG)
* **Where to go:** In sidebar, click **"SKUs Master"** (or **Item Master**)  
* **URL:** `/master-data/items`  
* **Action:** Click button: **`+ Register New SKU`**

We must create 4 items for our production recipe:

#### Item A: Finished Good (The Product We Sell)
| Field Label | Input Type | Example Value |
|---|---|---|
| **SKU Code \*** | Text | `SKU-5001` |
| **Item Name \*** | Text | `Sparkling Hibiscus Tonic 330ml Can` |
| **Category \*** | Dropdown | `Finished Goods` |
| **Unit of Measure (UOM) \*** | Dropdown | `Can` (or `Units`) |
| **Standard Cost** | Currency | `$0.65` |
| **Shelf Life (Days)** | Number | `365` |
| **Storage Requirement** | Dropdown | `Ambient Dry (15-25°C)` |

#### Item B: Raw Material 1 (Ingredient)
| Field Label | Input Type | Example Value |
|---|---|---|
| **SKU Code \*** | Text | `RM-HIB-101` |
| **Item Name \*** | Text | `Organic Dried Hibiscus Extract Liquid` |
| **Category \*** | Dropdown | `Raw Material` |
| **UOM \*** | Dropdown | `Kilogram (KG)` |
| **Standard Cost** | Currency | `$12.50` |
| **Allergen Flag** | Toggle | `No Allergens` |

#### Item C: Raw Material 2 (Sweetener)
| Field Label | Input Type | Example Value |
|---|---|---|
| **SKU Code \*** | Text | `RM-AGV-102` |
| **Item Name \*** | Text | `Organic Blue Agave Nectar Syrup` |
| **Category \*** | Dropdown | `Raw Material` |
| **UOM \*** | Dropdown | `Kilogram (KG)` |
| **Standard Cost** | Currency | `$4.20` |

#### Item D: Packaging Material (Cans)
| Field Label | Input Type | Example Value |
|---|---|---|
| **SKU Code \*** | Text | `PK-CAN-201` |
| **Item Name \*** | Text | `330ml Sleek Matte Aluminium Can` |
| **Category \*** | Dropdown | `Packaging Material` |
| **UOM \*** | Dropdown | `Piece (PCS)` |
| **Standard Cost** | Currency | `$0.12` |

* **Click:** **`Save SKU`** for each item.

---

### Step 1.4: Define Bills of Materials (BOM) & Recipes
* **Where to go:** In sidebar, click **"BOMs & Recipes"**  
* **URL:** `/master-data/bom`  
* **Action:** Click button: **`+ Create BOM Recipe`**
* **Form Header Fields:**

| Field Label | Input Type | Example Value |
|---|---|---|
| **BOM Number \*** | Text | `BOM-5001-V1` |
| **Finished Target SKU \*** | Dropdown | `SKU-5001 - Sparkling Hibiscus Tonic 330ml` |
| **Standard Batch Volume** | Number | `1000` (Litres or Units) |
| **Target Yield %** | Number | `98.5` |
| **Revision / Status** | Dropdown | `Active / Approved` |

* **Ingredient Components Table (Click "+ Add Ingredient"):**
  1. `RM-HIB-101` (Hibiscus Extract) ➔ Quantity: `25.0` ➔ UOM: `KG` ➔ Scrap: `1.0%`
  2. `RM-AGV-102` (Agave Nectar) ➔ Quantity: `40.0` ➔ UOM: `KG` ➔ Scrap: `0.5%`
  3. `PK-CAN-201` (330ml Sleek Can) ➔ Quantity: `1000` ➔ UOM: `PCS` ➔ Scrap: `1.5%`

* **Click:** **`Save & Approve BOM Recipe`**

---

### Step 1.5: Configure Production Routings & Operations
* **Where to go:** In sidebar, click **"Routings"**  
* **URL:** `/master-data/routings`  
* **Action:** Click **`+ Add Routing`**
* **Routing Setup:**
  * **Routing Code:** `RTG-5001`
  * **Target SKU:** `SKU-5001`
  * **Sequential Steps Table:**
    * **Step 10:** `Ingredient Dispense & Tare Weighing` (Work Center: `WC-MIX-01`, Standard Time: `30 mins`)
    * **Step 20:** `High-Shear Mixing & Agitation` (Work Center: `WC-MIX-01`, Temp: `68°C`, Speed: `450 RPM`)
    * **Step 30:** `In-Line Thermal Pasteurization` (Work Center: `WC-FILL-01`, Kill Temp: `74.5°C`)
    * **Step 40:** `Isobaric Can Filling & Seaming` (Work Center: `WC-FILL-01`, Speed: `60 cans/min`)
    * **Step 50:** `Finished Pack & Case Palletizing` (Work Center: `WC-PACK-01`, Pack Size: `24 cans/case`)

* **Click:** **`Save Routing`**

---

### Step 1.6: Establish Quality Specifications & CCP Limits
* **Where to go:** In sidebar, click **"QA Specs"** and **"CCP Limits"**  
* **URL:** `/master-data/quality-specs` and `/master-data/ccp-limits`  
* **Action:** Click **`+ Add QA Spec Parameter`**

| Parameter Name | Test Type | Lower Limit | Target Value | Upper Limit | Mandatory For Release? |
|---|---|---|---|---|---|
| **Pasteurization Temperature (CCP-1)** | Critical Thermal | `72.0 °C` | `74.5 °C` | `78.0 °C` | **YES (Critical)** |
| **Brix Concentration (Sugar)** | Refractometer | `8.2 °Bx` | `8.5 °Bx` | `8.8 °Bx` | **YES** |
| **Product pH Level** | Digital Probe | `3.20` | `3.45` | `3.65` | **YES** |
| **Can Seam Torque** | Manual Gauge | `3.2 Nm` | `3.8 Nm` | `4.2 Nm` | **YES** |
| **Fill Volume** | Gravimetric | `328.0 ml` | `330.5 ml` | `334.0 ml` | **YES** |

* **Click:** **`Save Quality Specifications`**

---

### Step 1.7: Configure Skills & Labour Standards
* **Where to go:** In sidebar, click **"Staff & Skills"**  
* **URL:** `/master-data/skills`  
* **Define Skills:**
  * `SKILL-CAN-OP`: Automated Rotary Filler Operator (Certified)
  * `SKILL-CCP-VERIFY`: HACCP Level 2 Critical Control Point Auditor
  * `SKILL-QC-LAB`: Wet Chemistry pH/Brix Lab Technician

---

## Phase 2: Inbound Supply Chain — Purchasing & Raw Material Receiving

> **Active Role:** Switch to **`Warehouse / Receiver`** (`Carlos Mendez` / `warehouse@maintenx.com`)  
> **Objective:** Buy and receive raw ingredients so the plant has stock to execute production.

### Step 2.1: Raise Inbound Purchase Order (PO)
* **Where to go:** Sidebar ➔ Expand **Move** ➔ Click **"Purchasing & POs"**  
* **URL:** `/warehouse/purchasing`  
* **Action:** Click button: **`+ Create Purchase Order`**
* **Form Fields to Fill:**

| Field Label | Input Type | Example Value |
|---|---|---|
| **Vendor / Supplier \*** | Dropdown | `Organic Botanicals UK Ltd.` |
| **Destination Facility \*** | Dropdown | `Indore Mega Manufacturing Facility` |
| **Expected Delivery Date \*** | Date Picker | `Tomorrow's Date` |
| **Payment Terms** | Dropdown | `Net 30 Days` |

* **Order Lines Table (Click "+ Add Material"):**
  1. `RM-HIB-101` (Hibiscus Extract) ➔ Quantity: `500 KG` ➔ Unit Price: `$12.50` ➔ Total: `$6,250.00`
  2. `RM-AGV-102` (Agave Syrup) ➔ Quantity: `1000 KG` ➔ Unit Price: `$4.20` ➔ Total: `$4,200.00`
  3. `PK-CAN-201` (330ml Sleek Cans) ➔ Quantity: `20,000 PCS` ➔ Unit Price: `$0.12` ➔ Total: `$2,400.00`

* **Click:** **`Submit & Issue Purchase Order`**  
* **System Result:** PO is generated as **`PO-2026-8801`** with status `ISSUED / AWAITING DOCK`.

---

### Step 2.2: Physical Material Receiving & Lot Code Generation
* **Where to go:** Sidebar ➔ Expand **Receiving** ➔ Click **"Receive Material"**  
* **URL:** `/warehouse/receiving/receive`  
* **Action:** In the search bar, select or type `PO-2026-8801`.
* **Receiving Modal Form:**

| Field Label | Input Type | Example Value | Purpose |
|---|---|---|---|
| **Carrier / Transport \*** | Text | `DHL Freight Logistics` | Trucking company name |
| **Bill of Lading / Challan \***| Text | `BOL-99210-UK` | Physical delivery document # |
| **Material Item \*** | Dropdown | `RM-HIB-101 (Hibiscus Extract)` | Selected PO line |
| **Inbound Quantity Received \***| Number | `500.0` (KG) | Actual physical weight |
| **Supplier Lot #** | Text | `SUP-HIB-883A` | Supplier's batch label |
| **Internal Lot Code \*** | Auto/Text | `LOT-HIB-20260901` | **MaintenX Internal Traceability Code** |
| **Storage Temperature Check** | Number | `18.5 °C` | Ambient container temp verification |
| **CoA Attached?** | Toggle | `YES (Verified)` | Certificate of Analysis verification |

* **Click:** **`Confirm Inward Receipt`**  
* **System Result:**
  * System registers `500 KG` into inventory.
  * System generates printable QR/Barcode label: `LOT-HIB-20260901`.
  * Status: `RECEIVED - PENDING PUT-AWAY`.

---

### Step 2.3: Put-Away into Warehouse Bins & Racks
* **Where to go:** Sidebar ➔ Expand **Locations** ➔ Click **"Bins / Racks"**  
* **URL:** `/warehouse/locations/bins`  
* **Action:** Locate lot `LOT-HIB-20260901` and assign destination rack:
  * **Warehouse:** `Raw Materials Warehouse A`
  * **Bin ID:** `RACK-A1-BIN-04`
* **Click:** **`Confirm Put-Away`**  
* **System Result:** Material is now available for production reservation!

---

## Phase 3: Production Planning, MRP & Finite APS Scheduling

> **Active Role:** Switch to **`Planner / Scheduler`** (`Elena Rostova` / `planner@maintenx.com`)  
> **Objective:** Receive customer sales demand, calculate raw material feasibility, and release scheduled orders to the shop floor.

### Step 3.1: Log Customer Sales Demand / Orders
* **Where to go:** Sidebar ➔ Expand **Demand** ➔ Click **"Customer Orders"**  
* **URL:** `/planner/demand/customer-orders`  
* **Action:** Click top-right button: **`+ Create Customer Order`**
* **Form Fields to Fill:**

| Field Label | Input Type | Example Value | Description |
|---|---|---|---|
| **Customer PO # \*** | Text | `CUST-WF-9941` | Customer's commercial order reference |
| **Customer / Account Name \***| Text | `Whole Foods EMEA Distribution` | Client company name |
| **Master SKU Selection \*** | Dropdown | `SKU-5001 - Sparkling Hibiscus Tonic 330ml` | Target finished good |
| **Ordered Quantity \*** | Number | `10000` | 10,000 Cans |
| **Requested Delivery Date \***| Date Picker | `Current Date + 7 Days` | Customer commitment date |
| **Priority Tier** | Dropdown | `Tier 1 - High Priority` | Scheduling priority |
| **Fulfillment Plant** | Dropdown | `Indore Mega Manufacturing Facility` | Executing plant |

* **Click:** **`Register Customer Order`**  
* **System Result:** Order `CO-9021` created with status `CONFIRMED / UNSCHEDULED`.

---

### Step 3.2: Run Material Requirements Planning (MRP)
* **Where to go:** Sidebar ➔ Expand **MRP** ➔ Click **"Net Requirements"**  
* **URL:** `/planner/mrp/net-requirements`  
* **Action:** Select `SKU-5001` and click **`Run MRP Explosion`**
* **System Output Matrix:**
  * Finished Goods Required: `10,000 Cans`
  * Exploded Component Demand:
    * `RM-HIB-101`: Required = `250 KG` | In Stock = `500 KG` | **Shortage = 0 (Sufficient)**
    * `RM-AGV-102`: Required = `400 KG` | In Stock = `1,000 KG` | **Shortage = 0 (Sufficient)**
    * `PK-CAN-201`: Required = `10,000 PCS` | In Stock = `20,000 PCS` | **Shortage = 0 (Sufficient)**
* **Verdict Banner:** `ALL MATERIALS AVAILABLE FOR PRODUCTION (FEASIBILITY 100%)`.

---

### Step 3.3: Finite Capacity Scheduling (APS Scheduler)
* **Where to go:** Sidebar ➔ Expand **APS / Scheduling** ➔ Click **"APS Scheduler"**  
* **URL:** `/planner/aps/scheduler`  
* **Action:** On the interactive Gantt chart:
  1. Select Demand Order `CO-9021`.
  2. Drag and drop onto **Line 1 (`LINE-01`)**.
  3. Start Time: `Tomorrow 08:00 AM`.
  4. Calculated Run Duration: `2.78 Hours` (based on 3,600 cans/hr line target).
  5. Setup / Changeover Allowance: `30 Minutes`.
* **Click:** **`Validate & Publish Schedule`**

---

### Step 3.4: Create & Release Production Orders (PO/WO)
* **Where to go:** Sidebar ➔ Click **"Production Orders"**  
* **URL:** `/planner/production-orders`  
* **Action:** Click **`+ Generate Production Order`**
* **Modal Fields:**
  * **Order Number:** Auto-generated `PRD-2026-104`
  * **Linked Customer Order:** `CO-9021`
  * **Target SKU:** `SKU-5001 (Sparkling Hibiscus Tonic 330ml)`
  * **Batch Target Quantity:** `10,000 Units`
  * **Assigned Production Line:** `LINE-01`
  * **Planned Shift:** `Shift A (Morning)`
* **Click:** **`Release Order to Shop Floor`**  
* **System Result:** Order status changes from `DRAFT` ➔ **`RELEASED`**. Shop floor terminals and warehouse pick lists are now unlocked!

---

### Step 3.5: Hard-Reserve Inventory Materials
* **Where to go:** Sidebar ➔ Click **"Material Reservation"**  
* **URL:** `/planner/material-reservation`  
* **Action:** Select order `PRD-2026-104` ➔ Click **`Auto-Allocate Available Lots (FIFO)`**
  * Allocated: `250 KG` from `LOT-HIB-20260901` (Location: `RACK-A1-BIN-04`)
  * Allocated: `400 KG` from `LOT-AGV-20260901`
  * Allocated: `10,000 PCS` from `LOT-CAN-20260901`
* **Click:** **`Confirm Reservation`**  
* **System Result:** These specific physical quantities cannot be consumed by any other job.

---

## Phase 4: Warehouse Kitting, Picking & Line Staging

> **Active Role:** Switch to **`Warehouse / Receiver`** (`Carlos Mendez` / `warehouse@maintenx.com`)  
> **Objective:** Pick reserved ingredients from warehouse storage bins and stage them at Line 1 feed.

### Step 4.1: Generate & Review Pick Lists
* **Where to go:** Sidebar ➔ Expand **Picking** ➔ Click **"Pick Lists"**  
* **URL:** `/warehouse/picking/lists`  
* **Action:** Click on the active pick ticket for `PRD-2026-104`:
  * Shows Pick List ID: `PICK-104-A`
  * Source Bins: `RACK-A1-BIN-04` (Hibiscus) & `RACK-B2-BIN-01` (Agave)
  * Target Destination: `STAGING-LINE-01`

---

### Step 4.2: Execute Barcode Scan Picking & Stage to Line Feed
* **Where to go:** Sidebar ➔ Expand **Picking** ➔ Click **"Picking Execution"**  
* **URL:** `/warehouse/picking/execution`  
* **Action Steps on Mobile/Tablet Screen:**
  1. Scan Location Barcode `RACK-A1-BIN-04`.
  2. Scan Material Lot Barcode `LOT-HIB-20260901`.
  3. Enter Picked Quantity: `250.0 KG`.
  4. Scan Line Staging Bin: `STAGING-LINE-01`.
* **Click:** **`Confirm Pick & Stage`**  
* **System Result:** Materials state moves to `LINE STAGED (READY FOR OPERATOR)`.

---

## Phase 5: Pre-Op Sanitation & Line Readiness Clearance

> **Active Role:** Switch to **`Quality / QA`** (`Dr. Rachel Thorne` / `qa@maintenx.com`)  
> **Objective:** Verify equipment hygiene, allergen washout, and grant physical authorization to begin running.

### Step 5.1: Execute Pre-Op Sanitation Checklist & ATP Swabs
* **Where to go:** Sidebar ➔ Expand **Pre-Op & Sanitation** ➔ Click **"Pre-Op Checklist"**  
* **URL:** `/quality/sanitation/preop`  
* **Action:** Select Line: `LINE-01` ➔ Order: `PRD-2026-104` ➔ Click **`Start Pre-Op Inspection`**
* **Checklist Table to Execute:**

| Verification Item | Requirement | Measured Result | Pass / Fail |
|---|---|---|---|
| **Mixing Vessel Cleanliness**| Visual Inspection (Zero residue) | Clean & Dry | **PASS** |
| **Rotary Filler Nozzles** | ATP Bioluminescence Swab | `6 RLU` (Limit < 15 RLU) | **PASS** |
| **Allergen Washout Verification**| ELISA Rapid Test | Negative (No trace) | **PASS** |
| **Can Seamer Guarding** | Physical Lockout/Interlock Check | Operational & Safe | **PASS** |
| **Product Strainers/Filters** | 50 Mesh Stainless Steel Filter | Inspected Clean & Intact | **PASS** |

---

### Step 5.2: Grant Digital Line Clearance to Run
* **Action:** Scroll to bottom of checklist.
* **Inspector Electronic PIN / Password:** Enter `QA-SECURE-2026`
* **Sign-off Remark:** *"Line 1 sanitized, ATP swabs compliant (< 10 RLU), ready for Hibiscus Tonic batch."*
* **Click:** **`Approve & Grant Line Clearance`**  
* **System Result:** Line 1 status switches from `IDLE / DIRTY` ➔ **`CLEARED TO RUN`**. Operator console unlocks the start button!

---

## Phase 6: Shop Floor Live Execution & Electronic Batch Records (eBR)

> **Active Role:** Switch to **`Line Operator`** (`Marcus Chen` / `operator@maintenx.com`) & **`Line Lead`** (`Devang Patel` / `linelead@maintenx.com`)  
> **Objective:** Run the batch on the line, execute tare weighing, log machine telemetry, monitor CCPs, and complete eBR.

### Step 6.1: Operator Shift Login & Claim Work Order
* **Where to go:** Sidebar ➔ Click **"My Jobs"** or **"Dashboard"**  
* **URL:** `/operator/my-jobs` and `/operator/dashboard`  
* **Action:**
  1. Operator claims job `PRD-2026-104` on `LINE-01`.
  2. Click button: **`Start Job & Launch eBR`**  
* **System Result:** System assigns batch identifier: **`BAT-2026-992`**. Timestamps start running.

---

### Step 6.2: Complete 6-Step Electronic Batch Record (eBR)
* **Where to go:** Sidebar ➔ Click **"Production Entry"**  
* **URL:** `/operator/production-entry`  
* **Execute the 6 Steps sequentially:**

#### Step 1: Raw Lot Barcode Verification & Scale Tare Weighing
* **Scan Lot Barcode:** Operator scans staged tote `LOT-HIB-20260901`.
  * System validates barcode matches BOM recipe component `RM-HIB-101`. (Green Checkmark).
* **Weighed Scale Input:** Enter or read digital scale: `250.0 KG` (Tolerance: ±0.2 KG).
* **Click:** `Confirm Ingredient Addition`.

#### Step 2: High-Shear Mixing Telemetry
* **Agitator Speed:** `450 RPM`
* **Batch Temperature:** `68.2 °C`
* **Vessel Pressure:** `1.8 Bar`
* **Mixing Duration Timer:** `25 Minutes` elapsed.
* **Click:** `Confirm Mixing Complete`.

#### Step 3: In-Line CCP Thermal Kill Step
* **Calibrated Temperature Sensor Reading:** `74.8 °C` (Target: 74.5 °C, Critical Min: 72.0 °C).
* **Status:** `CCP-1 CRITICAL THERMAL KILL PASSED`.
* **Click:** `Log CCP Reading`.

#### Step 4: Isobaric Canning & Seam Integrity
* **Filling Speed:** `60 cans/minute`.
* **Seam Thickness / Torque Reading:** `3.8 Nm` (Spec: 3.2 - 4.2 Nm).
* **Fill Net Weight Check:** `331.2 g` (Target: 330.5 g).
* **Click:** `Verify Packaging In-Spec`.

#### Step 5: Finished Good Barcode & Date Coding
* **Can Base Inkjet Code:** `EXP 19/09/2027 LOT BAT-2026-992 14:35 L1`.
* **Visual Inspection:** Legible, no smear.
* **Click:** `Confirm Lot Print`.

#### Step 6: Batch Output Counter & Yield Reconciliation
* **Total Good Units Produced:** `9,920 Cans`
* **Scrap / Rejects (Dented/Underfilled):** `80 Cans`
* **Calculated Yield:** `99.2%` (Target: 98.5% — **EXCEEDED TARGET!**)
* **Click:** **`Submit Completed Batch for QA Release`**

---

### Step 6.3: Log Downtime, Micro-Stops & Breakdown Escalation
*(Simulating a live production incident during run)*
* **Event:** Rotary filler nozzle #4 jammed on can lid. Line stops for 15 minutes.
* **Where to go:** Sidebar ➔ Click **"Downtime & Loss"**  
* **URL:** `/operator/downtime-loss`  
* **Action:** Click **`+ Log Downtime Event`**
* **Form Fields to Fill:**

| Field Label | Input Type | Value |
|---|---|---|
| **Affected Work Center \*** | Dropdown | `WC-FILL-01 (Rotary Canning Filler)` |
| **Downtime Category \*** | Dropdown | `Unplanned Mechanical Breakdown` |
| **Root Cause / Reason Code \***| Dropdown | `MC-JAM-04 - Rotary Filler Can Jam / Sealing Failure` |
| **Duration (Minutes) \*** | Number | `15` |
| **Impact Severity** | Dropdown | `P2 - Line Stoppage` |
| **Trigger Maintenance Dispatch?**| Toggle | **`YES (Auto-Create CMMS Work Order)`** |

* **Click:** **`Submit Downtime & Dispatch Tech`**  
* **System Result:** Line status turns **RED (STOPPED)** on plant dashboards. System automatically creates maintenance work order **`WO-CMMS-4091`** and alerts Dave Miller!

---

### Step 6.4: Line Lead Hour-by-Hour (H/B) Pitch Tracking
* **Where to go:** Switch to `Line Lead` ➔ Sidebar ➔ Click **"H/B Management"**  
* **URL:** `/linelead/hb-management`  
* **Hour-by-Hour Board Inspection:**
  * **Hour 1 (08:00 - 09:00):** Target: `3,600` | Actual: `3,550` | Variance: `-50` (Green)
  * **Hour 2 (09:00 - 10:00):** Target: `3,600` | Actual: `2,770` | Variance: `-830` (**Red due to 15m jam**)
  * **Hour 3 (10:00 - 11:00):** Target: `3,600` | Actual: `3,600` | Variance: `0` (Recovered)
* **Lead Shift Recovery Note:** *"Nozzle #4 cleared by Maintenance. Line speed boosted to 62 CPM to recover pitch."*
* **Click:** **`Sign Shift H/B Log`**

---

## Phase 7: Maintenance CMMS & Breakdown Intervention

> **Active Role:** Switch to **`Maintenance Technician`** (`Dave Miller` / `maintenance@maintenx.com`)  
> **Objective:** Triage auto-triggered breakdown ticket, log spare parts, return machine to service, and perform PM.

### Step 7.1: Triage Auto-Triggered Breakdown Tickets
* **Where to go:** Sidebar ➔ Expand **MAINTAIN** ➔ Click **"Work Orders"** or **"Breakdowns"**  
* **URL:** `/maintenance/work-orders` and `/maintenance/breakdowns`  
* **Action:** Open ticket `WO-CMMS-4091`:
  * Asset: `WC-FILL-01 (Rotary Canning Filler)`
  * Problem: `MC-JAM-04 - Can Jam on Nozzle #4`
  * Reported by: `Marcus Chen (Operator)`
* **Click:** **`Acknowledge & Start Repair`**  
* **Status:** Switches to `IN PROGRESS`.

---

### Step 7.2: Dispatch Technician, Consume Spares & Clear Return-to-Service
* **Corrective Action Taken:** Cleared crushed can, replaced worn rubber nozzle suction cup gasket.
* **Spare Parts Consumption Table (Click "+ Add Spare Part"):**
  * Part: `PART-GASK-44 - Silicone Nozzle Gasket 25mm` ➔ Qty: `1 EA` ➔ Cost: `$8.50`
* **Labor Hours:** `0.25 Hours` (15 minutes).
* **Safety & Guarding Check:** Interlocks tested and functioning.
* **Click:** **`Complete Work Order & Return to Service`**  
* **System Result:** Asset status changes from `DOWN` ➔ **`RUNNING`**. Downtime counter stops. Work order moves to `CLOSED`.

---

### Step 7.3: Preventive Maintenance (PM) Execution
* **Where to go:** Sidebar ➔ Click **"Preventive Maintenance"**  
* **URL:** `/maintenance/pm`  
* **Action:** Review scheduled weekly PM task `PM-FILL-WEEKLY`:
  * Clean drive chains, grease main bearing, check pneumatic pressures.
  * Check off all checklist items ➔ Click **`Complete PM Task`**.

---

## Phase 8: Quality Lab Verification, Disposition & Batch Release

> **Active Role:** Switch to **`Quality / QA Lead`** (`Dr. Rachel Thorne` / `qa@maintenx.com`)  
> **Objective:** Review production data, verify lab tests, execute 21 CFR Part 11 electronic sign-off, and release the batch for sale.

### Step 8.1: In-line Quality & Critical Control Point (CCP) Inspection
* **Where to go:** Sidebar ➔ Expand **Quality Checks** ➔ Click **"CCP Checks"** & **"Product Checks"**  
* **URL:** `/quality/checks/ccp` and `/quality/checks/product`  
* **Select Batch:** `BAT-2026-992`
* **Lab Testing Data Entry:**

| Parameter | Tool / Method | Lab Reading | Target Spec | Status |
|---|---|---|---|---|
| **Brix (Sugar Content)** | Digital Refractometer | `8.48 °Bx` | `8.20 - 8.80 °Bx` | **CONFORMING** |
| **Acidity / pH** | Calibrated pH Probe | `3.42` | `3.20 - 3.65` | **CONFORMING** |
| **Dissolved CO2** | Zahm & Nagel Piercing Tester| `3.8 Vol` | `3.6 - 4.1 Vol` | **CONFORMING** |
| **Microbiological Plate Count**| Rapid Bioluminescence | `0 CFU/ml` | `< 10 CFU/ml` | **PASS** |
| **Metal Detector Check** | Ferrous/Non-Ferrous Test Wands| Detects 1.5mm Fe| Audible Reject | **PASS** |

* **Click:** **`Save Lab Test Records`**

---

### Step 8.2: Handle Non-Conformance & Quarantine Holds (If Any)
* **Where to go:** Sidebar ➔ Expand **Quality Events** ➔ Click **"Quality Holds"**  
* **URL:** `/quality/events/holds`  
* *Note:* If any reading fails, clicking **`Place on Quarantine HOLD`** automatically locks inventory lots across the entire ERP/WMS, preventing any truck from loading them.  
* *In our flow:* All tests passed, so hold is NOT required.

---

### Step 8.3: Review Full Batch History & Certificate of Analysis (CoA)
* **Where to go:** Sidebar ➔ Expand **Batch Quality** ➔ Click **"Batch Review"**  
* **URL:** `/quality/batch/review`  
* **Select Batch:** `BAT-2026-992`
* **Audit Checks Visible on Screen:**
  * Raw Materials Lot Traceability (Hibiscus & Agave lots verified): **VALIDATED**
  * In-Line Process Steps & Telemetry: **COMPLETE (100%)**
  * Sanitation Pre-Op Swabs: **CLEARED**
  * CCP Critical Thermal Kill: **COMPLIANT**
  * Total Good Cans: `9,920 Units`

---

### Step 8.4: 21 CFR Part 11 Electronic Signature Batch Release
* **Where to go:** Sidebar ➔ Expand **QA Release** ➔ Click **"Release Queue"** ➔ Click **"Release Review"**  
* **URL:** `/quality/release/queue` and `/quality/release/review`  
* **Action:** Click button: **`Sign & Release Batch for Commercial Distribution`**
* **Electronic Signature Modal Form (Compliant with 21 CFR Part 11):**

| Field Label | Input Value |
|---|---|
| **Full Legal Name** | `Dr. Rachel Thorne` |
| **User Role** | `Quality Assurance Lead & Responsible Officer` |
| **User Email / ID** | `qa@maintenx.com` |
| **Electronic Password / Security Token \***| `QA-SECURE-2026` |
| **Disposition Decision \*** | Dropdown: `RELEASED FOR COMMERCIAL DISTRIBUTION` |
| **Formal Legal Meaning / Reason \*** | Dropdown: `I confirm that I have reviewed the electronic batch record, CCP records, and laboratory Certificate of Analysis, and this lot conforms in all respects to the product specification.` |

* **Click:** **`Execute Digital Signature`**  
* **System Result:**
  * An immutable SHA-256 digital cryptographic hash is generated.
  * Audit trail entry recorded.
  * Batch status turns **`RELEASED`** (Green Shield).
  * The 9,920 cans are immediately unlocked in the warehouse finished goods bay for customer dispatch!

---

## Phase 9: Finished Goods Warehousing, Shipping & Batch 360 Traceability

> **Active Role:** Switch to **`Warehouse / Logistics`** (`Carlos Mendez` / `warehouse@maintenx.com`)  
> **Objective:** Store finished pallets, dispatch order to Whole Foods, and audit end-to-end traceability.

### Step 9.1: Receive Released Batch into Finished Goods Bay
* **Where to go:** Sidebar ➔ Expand **Inventory** ➔ Click **"Finished Goods"**  
* **URL:** `/warehouse/inventory/finished-goods`  
* **Action:**
  * Locate newly released batch `BAT-2026-992` (`9,920 Cans` = `413 Cases of 24`).
  * Assign Warehouse Storage: `FG-WH-BAY-03`.
* **Click:** **`Confirm Pallet Put-Away`**

---

### Step 9.2: Create Dispatch Order & Generate Bill of Lading (BOL)
* **Where to go:** Sidebar ➔ Expand **Shipping** ➔ Click **"Shipment Orders"** & **"Dispatch"**  
* **URL:** `/warehouse/shipping/orders` and `/warehouse/shipping/dispatch`  
* **Action:** Click **`+ Create Shipment Dispatch`**
* **Form Fields to Fill:**

| Field Label | Input Value |
|---|---|
| **Linked Customer Order \*** | `CO-9021 (Whole Foods EMEA)` |
| **Carrier Fleet / Truck \*** | `DHL ColdChain Express - Truck Reg: DL-01-AB-4491` |
| **Driver Name & License** | `Rajesh Sharma / LIC-994812` |
| **Allocated Finished Goods Lot \***| `BAT-2026-992` |
| **Quantity to Load \*** | `9,920 Cans` |
| **Trailer Temperature Verified**| `4.0 °C` (Chilled dry transit) |

* **Click:** **`Generate Bill of Lading & Dispatch Truck`**  
* **System Result:**
  * System outputs printable **Bill of Lading (`BOL-7712`)**.
  * Order `CO-9021` status updates to **`FULFILLED & DISPATCHED`**.
  * Warehouse finished inventory automatically decrements.

---

### Step 9.3: Bi-Directional Batch 360 Traceability Audit
* **Where to go:** Sidebar ➔ Click **"Traceability"** (or Batch/Lot Traceability)  
* **URL:** `/warehouse/traceability`  
* **Action:** Type `BAT-2026-992` in search bar ➔ Click **`Generate Batch 360 Tree`**
* **Instant Bi-Directional Forensic Tree Rendered:**
  * **Backward Trace (Genealogy):**
    * Finished Batch `BAT-2026-992`
      * ➔ Raw Lot `LOT-HIB-20260901` (Supplier: Organic Botanicals UK, Inward PO `PO-2026-8801`)
      * ➔ Raw Lot `LOT-AGV-20260901` (Supplier: Agave Nectar Co.)
      * ➔ Packaging Lot `LOT-CAN-20260901` (Supplier: Sleek Cans Global)
      * ➔ Machine Used: `LINE-01` (`WC-MIX-01`, `WC-FILL-01`)
      * ➔ Operator: `Marcus Chen`, Line Lead: `Devang Patel`
      * ➔ Pre-Op Sanitation: `Dr. Rachel Thorne` (ATP: 6 RLU)
      * ➔ Breakdown Incident: 15 mins on Nozzle #4 (Repaired by `Dave Miller`)
  * **Forward Trace (Distribution):**
    * Finished Batch `BAT-2026-992`
      * ➔ Dispatched on Truck `DL-01-AB-4491` (Bill of Lading `BOL-7712`)
      * ➔ Customer: `Whole Foods EMEA Distribution`
* **Regulatory Compliance:** Audit-ready for FDA, GFSI, BRC, and ISO 22000 in under **3 seconds**!

---

## Phase 10: Continuous Improvement (CI), RCA 2.0 & Executive Financials

> **Active Roles:**  
> 1. `CI / Engineering` (`Viktor Hayes` / `ci@maintenx.com`)  
> 2. `Plant Manager` (`Arthur Sterling` / `plant.manager@maintenx.com`)  
> 3. `Executive` (`Victoria Sterling` / `executive@maintenx.com`)

### Step 10.1: Conduct 5-Why Root Cause Analysis (RCA 2.0)
* **Where to go:** Switch to `CI / Engineering` ➔ Sidebar ➔ Expand **RCA 2.0** ➔ Click **"Investigations"**  
* **URL:** `/ci/rca/investigations`  
* **Action:** Click **`+ New RCA Investigation`**
* **Link to Incident:** Select Downtime Event `MC-JAM-04` (15m filler nozzle jam during Batch `BAT-2026-992`).
* **Execute 5-Why Investigation Form:**
  * **Why 1:** *Why did the rotary filler stop?* ➔ Nozzle #4 failed to release can lid properly.
  * **Why 2:** *Why did it fail to release?* ➔ Silicone suction cup gasket had lost elasticity.
  * **Why 3:** *Why did the gasket lose elasticity?* ➔ It exceeded its 100-hour operating lifespan by 32 hours.
  * **Why 4:** *Why was it not replaced on time?* ➔ The PM schedule was set to 150 hours instead of 100 hours.
  * **Why 5 (Root Cause):** ➔ Maintenance PM task frequency calibration had not been updated after the line speed upgrade.
* **Click:** **`Submit Root Cause Investigation`**

---

### Step 10.2: Implement & Track CAPA Corrective Actions
* **Where to go:** Sidebar ➔ Expand **CAPA** ➔ Click **"Corrective Actions"**  
* **URL:** `/ci/capa/corrective`  
* **Action:** Click **`+ Create CAPA`**
  * **CAPA Title:** `CAPA-2026-302: Recalibrate Nozzle Gasket PM Frequency to 80 Hours`
  * **Action Owner:** `Dave Miller (Maintenance Lead)`
  * **Preventive Action:** Add automatic runtime counter trigger in CMMS to generate replacement ticket every 80 hours.
  * **Due Date:** `Next Monday`
* **Click:** **`Approve & Assign CAPA`**

---

### Step 10.3: Monitor Real-Time Plant Command Center & OEE
* **Where to go:** Switch to `Plant Manager` ➔ Sidebar ➔ Click **"Command Center"**  
* **URL:** `/command-center` and `/performance/oee`  
* **Key Executive Widgets Live Status:**
  * **Plant OEE:** `86.4%` (Availability: 92%, Performance: 95%, Quality: 99.2%)
  * **Target OEE:** `85.0%` ➔ **TARGET MET (GREEN)**
  * **Active Lines:** `Line 1: RUNNING`, `Line 2: CHANGEOVER`, `Line 3: RUNNING`
  * **Shift Output:** `28,450 Units` across plant.

---

### Step 10.4: Executive Financial Cost Variance & Manufacturing Margins
* **Where to go:** Switch to `Executive` ➔ Sidebar ➔ Expand **Financial Intelligence** ➔ Click **"Manufacturing Cost"** & **"Cost Variance"**  
* **URL:** `/executive/finance/manufacturing` and `/executive/finance/variance`  
* **Financial Variance Analysis for Batch `BAT-2026-992`:**

| Cost Component | Standard Expected Cost | Actual Batch Cost | Variance | Favorable / Unfavorable |
|---|---|---|---|---|
| **Raw Material (Hibiscus/Agave)**| $3,125.00 | $3,100.00 | -$25.00 | **Favorable (Yield 99.2%)** |
| **Packaging (Cans/Lids)** | $1,200.00 | $1,209.60 | +$9.60 | Slight scrap variance (80 cans) |
| **Direct Labour** | $450.00 | $472.50 | +$22.50 | 15m overtime delay |
| **Machine Overhead & Spares**| $220.00 | $228.50 | +$8.50 | Gasket part consumed |
| **TOTAL UNIT BATCH COST** | **$0.500 / can** | **$0.505 / can** | **+$0.005** | **99.0% Margin Integrity** |

* **Client Commercial Margin:** Whole Foods Selling Price: `$1.85 / can` ➔ Gross Profit: **`$1.345 per can (72.7% Margin)`**.

---

## 14. Master Troubleshooting & Quick Sanity Checklist

| Issue / Symptom in UI | Root Cause in Data Flow | Where to Go to Fix It |
|---|---|---|
| **1. Cannot find SKU in BOM dropdown** | SKU not registered or marked as `Inactive` | Go to `/master-data/items` ➔ Register SKU or set status to `Active`. |
| **2. MRP shows "100% Material Shortage"** | No raw material received or lots expired | Go to `/warehouse/receiving/receive` ➔ Inward the PO and register lots. |
| **3. Cannot release Production Order** | Schedule not published in APS | Go to `/planner/aps/scheduler` ➔ Drag job onto Gantt chart and click `Publish Schedule`. |
| **4. Operator screen shows "Line Locked"** | Pre-Op Sanitation checklist not signed off | Switch to `Quality` ➔ Go to `/quality/sanitation/preop` ➔ Execute ATP swab and click `Approve Line Clearance`. |
| **5. Cannot Release Batch in QA Queue** | Missing mandatory CCP test or open hold | Go to `/quality/checks/ccp` ➔ Enter mandatory temperature reading. If in hold, resolve investigation at `/quality/events/holds`. |
| **6. Shipping says "0 Units Available to Pick"**| Batch produced but not digitally released by QA | Switch to `Quality` ➔ Go to `/quality/release/queue` ➔ Execute 21 CFR Part 11 signature. |

---

### Summary of Golden Rule
> **"Data Flow Never Breaks if Followed in Sequence:"**  
> **Master Data ➔ Purchasing ➔ Inward Receiving ➔ Demand Order ➔ MRP/APS ➔ Warehouse Pick ➔ Sanitation Pre-Op ➔ Production eBR ➔ QA Disposition ➔ Warehouse Dispatch ➔ CI Kaizen.**

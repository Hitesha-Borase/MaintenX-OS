# ==============================================================================
# FLOWSTATE OPS (MAINTENX OS) - CLIENT TECHNICAL SPECIFICATION & BRIEF
# Prepared by: Stefan Crawford / FlowState Ops for Kiaan Tech
# Purpose: Master Technical Documentation for Architecture, Backend & Integration
# ==============================================================================

---

# PROMPT TEMPLATE TO COPY-PASTE INTO CHATGPT:
```text
You are an expert Enterprise Solutions Architect, Manufacturing Systems Engineer, and Full-Stack Principal Engineer.

Below is the complete official technical specification and hardware discovery brief provided by the client (Stefan Crawford / FlowState Ops) to Kiaan Tech for building the FlowState Ops / MaintenX OS platform.

Please review all the requirements, canonical data structures, core operating chains (DEMAND → PLAN → MATERIALS → PRODUCE → VERIFY → RELEASE → STORE → SHIP → TRACE → IMPROVE), compliance rules (21 CFR Part 11 / Food Safety / Human Release Approvals), module boundaries (ERP, APS, MES, QMS, WMS, CMMS, Traceability), API endpoints, and Machine IoT connection protocols (Omron CP2E, Variovac, MQTT/Edge gateway).

Use this document as the single source of truth for answering architecture, database design, API design, frontend state management, and edge IoT integration questions.

[INSERT SPECIFICATION BELOW]
```

---

# PART 1: FLOWSTATE OPS TECHNICAL BRIEF

## 1. Document Overview
* **Prepared For:** Kiaan Tech / Development Partner
* **Prepared By:** Stefan Crawford / FlowState Ops
* **Version:** 1.0 - Developer Discovery Brief
* **Date:** September 7, 2026
* **Status:** Requirements baseline; hardware discovery still required
* **Target:** Independent, multi-company, multi-plant manufacturing SaaS

### Primary Objective
Rebuild FlowState Ops as one connected manufacturing operating system. It must execute real transactions across planning, production, quality, inventory, maintenance and traceability - not operate as a collection of disconnected dashboards.

### Core Operating Chain
```
DEMAND ➔ PLAN ➔ MATERIALS ➔ PRODUCE ➔ VERIFY ➔ RELEASE ➔ STORE ➔ SHIP ➔ TRACE ➔ IMPROVE
```

---

## 2. Required Outcome and Boundaries
FlowState Ops is a food-manufacturing-first operating platform combining ERP, APS, MRP, MES, QMS, WMS, CMMS, traceability, labour, costing, continuous improvement and governed AI. Each module must use a shared relational data model and shared transaction history.

### 2.1 Non-Negotiable Principles
1. **One Canonical Source of Truth:** Every major business object and KPI originates from a single validated record.
2. **API-First Backend:** Critical business logic and validations must execute server-side.
3. **Strict Multi-Tenant Isolation:** Multi-company and multi-plant data segregation with authorized master-owner visibility.
4. **Comprehensive Transaction Auditing:** Every critical transaction must record company, plant, department, line, order, batch/lot, equipment, user, and timestamp.
5. **Quality Release Gate:** Finished goods must **NOT** become available or shippable until the required QA release check succeeds.
6. **Zero Mocked Metrics:** No hardcoded KPIs, mock metrics, or UI-only workflows in production.
7. **Human-Governed Quality/Safety:** Food-safety decisions, root-cause approval, and release authorizations remain strictly human-controlled.
8. **Ownership Deliverables:** Source code, database schema, API specification, deployment configuration, and technical documentation must be fully deliverable.

### 2.2 Delivery Strategy
Architecture defined upfront with milestone-based execution. Complete discovery, gap assessment, and hardware survey must precede live machine integrations.

---

## 3. Users and Access Model

| Role | Primary System Responsibility |
| :--- | :--- |
| **Operator** | Start/pause/complete jobs; record production, downtime, checks and evidence. |
| **Lead / Supervisor** | Control schedule execution, labour, pace, H/B, holds, recovery and approvals. |
| **Planner** | Forecast, net requirements, finite-capacity APS, materials and schedule publication. |
| **QA** | Specifications, CCP checks, holds, deviations, verification, disposition and release. |
| **Warehouse** | Inbound receipt, Putaway, LP tracking, picking, staging, loading and shipping. |
| **Maintenance** | PM schedules, work orders, breakdown response, spares consumption and asset health. |
| **CI / Operations Manager**| Root cause, CAPA, bottleneck identification, standard work and performance analysis. |
| **Executive / Owner** | Multi-plant performance, margin, yield, labour variance and executive control. |
| **Integration / Admin** | Edge gateway health, machine telemetry, master data, RBAC and system audit logs. |

---

## 4. Canonical System Model & Module Mapping

```
[Sales / Demand] ➔ [Forecast & Demand Management]
       │
       ▼
[Finite Capacity APS] ➔ [MRP & Material Allocation]
       │
       ▼
[Shop Floor MES] ◄──► [Edge Telemetry & Machine IoT]
       │
       ▼
[In-Process Quality & CCPs] ➔ [Holds & Deviations]
       │
       ▼
[QA Release Approval] ➔ [WMS Inventory & License Plates]
       │
       ▼
[Dispatch & Shipping] ➔ [End-to-End Lot Traceability]
       │
       ▼
[OEE, Downtime, CMMS Maintenance & Continuous Improvement]
```

### Module Responsibilities:
1. **Demand & Forecasting:** Sales orders, customer forecasts, safety stock thresholds, seasonal smoothing.
2. **Advanced Planning & Scheduling (APS):** Finite capacity routing, line calendars, shift constraints, changeover matrices.
3. **Materials & MRP:** Multi-level BOM explosion, lot-level reservation, supplier PO generation, material staging.
4. **Manufacturing Execution (MES):** Real-time work order dispatch, run rates, piece counts, scrap logging, labour allocation.
5. **Quality Management (QMS):** Critical Control Point (CCP) logging, tolerance validation, non-conformance quarantine, electronic sign-off.
6. **Warehouse Management (WMS):** License Plate Numbers (LPN), bin locations, FIFO/FEFO picking rules, staging, cross-docking.
7. **Maintenance (CMMS):** Equipment meter tracking, PM triggers, reactive breakdown work orders, parts inventory deduct.
8. **Traceability Engine:** Instant backward & forward genealogical tracing: Supplier Lot ➔ Raw Material ➔ Batch ➔ Finished Good ➔ Customer Shipment.
9. **CI & Operational Analytics:** OEE calculation (Availability × Performance × Quality), Pareto downtime analysis, Six Sigma variance tracking.

---

## 5. Compliance & 21 CFR Part 11 Audit Integrity
* **Immutable Audit Trail:** Append-only logging for all record changes, status transitions, overrides, and approvals.
* **Dual-Authentication E-Signatures:** Electronic signatures must require re-authentication with reason for change.
* **Tamper Evident:** SHA-256 hash chaining or cryptographic verification on quality verification and release events.
* **System Clock Sync:** Network Time Protocol (NTP) synchronized UTC timestamps across cloud APIs and edge gateways.

---

## 6. API Family Specifications

### 6.1 Planning & Production APIs
* `POST /api/v1/production-orders` - Create work order from demand/forecast.
* `GET /api/v1/production-orders/schedule` - Retrieve finite-capacity schedule.
* `PATCH /api/v1/production-orders/:id/status` - Transition status (`PLANNED`, `STAGED`, `RUNNING`, `PAUSED`, `COMPLETED`).
* `POST /api/v1/production-orders/:id/output` - Record output units, scrap, rework.

### 6.2 Quality & Compliance APIs
* `POST /api/v1/qa/checks` - Submit CCP inspection readings with operator signature.
* `POST /api/v1/qa/holds` - Place lot, batch, or production line on immediate quarantine.
* `POST /api/v1/qa/release` - Authorize QA release with dual electronic signature.

### 6.3 Warehouse & Inventory APIs
* `POST /api/v1/inventory/receipt` - Inbound receipt and LPN generation.
* `POST /api/v1/inventory/transfer` - Relocate stock between bin locations.
* `POST /api/v1/inventory/consume` - Deduct materials used in work orders.

### 6.4 Telemetry & Edge IoT Ingestion APIs
* `POST /api/v1/telemetry/ingest` - Ingest timestamped high-frequency machine metrics (buffered).
* `POST /api/v1/telemetry/heartbeat` - Gateway connectivity and health pulse.
* `POST /api/v1/telemetry/events` - Machine state changes (Run, Idle, Alarm, Fault).

---

# PART 2: MACHINE CONNECTION & DISCOVERY PACK

## 1. Hardware Integration Standard
* **Phase 1 Read-Only Policy:** Only passive monitoring and real-time metric ingestion.
* **Safety Isolation:** No remote start/stop, recipe download, setpoint writes, or safety circuit interaction.
* **Data Flow Architecture:**
  `Machine PLC ➔ Approved Read Interface ➔ Industrial Edge Gateway ➔ Encrypted Outbound MQTTS/HTTPS ➔ FlowState Cloud Ingestion ➔ OEE & Downtime Engine`

---

## 2. Target Machine Hardware Profiles

### Machine A: Plan It Neptune RotoBagger
* **Controller:** Omron CP2E PLC with Ethernet Ports 1A/1B and serial terminals.
* **Network Switch:** Omron W4S1-05B 5-port Industrial Ethernet Switching Hub.
* **Edge Gateway:** TN-630-W4 / TQN6-211EW4-00 (WAN/LAN, Wi-Fi, RS-232/485).
* **Drive:** Danfoss VLT Micro Drive (P/N 132F0010, 0.75 kW / 1 HP).
* **Safety Relay:** Omron G9SX-NSA222-T03 (Strictly isolated from cloud write operations).
* **Target Telemetry Data:**
  * Bagging cycle count & rate (bags/min).
  * Seal temperature, dwell time, and air pressure readings.
  * Running / Idle / Stoppage state alarms.

### Machine B: Variovac VAC Machine
* **Controller:** Omron PLC & Omron NB-Series HMI.
* **Vacuum Pump:** Busch R5 Series Rotary Vane Vacuum Pump.
* **Target Telemetry Data:**
  * Vacuum chamber pressure curve (mbar) & cycle time.
  * Sealing temperature & gas flush levels (MAP).
  * Machine state & emergency stop triggers.

---

## 3. Data Ingestion & Normalization Architecture
1. **Edge Gateway Software:** Runs lightweight telemetry agent (Node.js/Python or industrial runtime like Node-RED/Ignition Edge).
2. **Communication Protocols:**
   * Omron FINS (over Ethernet TCP/UDP) / Host Link (over RS-232/485).
   * Modbus TCP / RTU.
   * EtherNet/IP CIP read tags.
3. **Local Store-and-Forward:** Edge gateway buffers up to 72 hours of metrics during internet outages and safely flushes with original timestamps upon reconnection.
4. **Cloud Processing:** Fastify ingestion worker processes telemetry, validates schemas using Zod, and writes directly into PostgreSQL time-series/relational tables.

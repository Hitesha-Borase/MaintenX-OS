# MaintenX OS — Third-Party Integration Audit Report
**Document ID:** MAINTENX-AUDIT-3RD-PARTY-001  
**Target:** Production-Grade External Integrations (AI Assistant, Razorpay Billing, PLC / IoT Industrial Connectivity)  
**Date:** September 10, 2026  
**Auditor:** Senior Solution Architect & Systems Engineer  
**Status:** AUDIT COMPLETED — PENDING ARCHITECTURE APPROVAL  

---

## 1. Executive Summary & Objective

MaintenX OS is a full-spectrum **Manufacturing Execution & Operations Operating System** unifying MES, CMMS, QMS, WMS, APS/MRP, and CI/Engineering. This audit inspects the current repository state across backend, frontend, database, and infrastructure to establish exact integration baselines for:
1. **AI Assistant Integration** (LLM Provider Abstraction: OpenAI, Google Gemini, Anthropic Claude, plus Context Enrichment).
2. **Razorpay Billing Integration** (Subscriptions, Order Creation, Payment Verification, Idempotent Webhooks, PostgreSQL Ledger).
3. **PLC / IoT / Industrial Connectivity** (OPC-UA, MQTT, Modbus Protocol Adapters, Normalization Pipeline, Telemetry Storage, Real-Time Streaming).

> **Core Principle:** Zero regression on existing features. No duplicate tables, routes, or services. Existing working code is preserved and extended.

---

## 2. Current Architecture Baseline

### 2.1 Backend Architecture
* **Framework:** Node.js (v20+) with Fastify v5.12.3 and TypeScript 5.9.3.
* **Server Entry:** `backend/src/server.ts` boots Fastify app from `backend/src/app.ts` on port 4000 (host `0.0.0.0`).
* **Database Layer:** PostgreSQL 18 with Drizzle ORM v0.38.4 (`pg` pool connection pool in `backend/src/config/database.ts`).
* **Plugin Pipeline:**
  * `@fastify/cors`: Multi-origin CORS support.
  * `@fastify/helmet`: Security headers.
  * `@fastify/jwt`: JWT token verification and decoding.
  * `@fastify/rate-limit`: IP and token rate limiting (1000 req/min).
  * `@fastify/swagger` & `@fastify/swagger-ui`: OpenAPI/Swagger documentation at `/documentation`.
  * Custom empty JSON body content parser.
  * Centralized error handler `backend/src/plugins/errorHandler.ts`.
* **API Versioning:** All domain routes mounted under `/api/v1/*`.

### 2.2 Frontend Architecture
* **Framework:** React 19.2.8 with Vite 8.2.2 (SPA with client-side routing via `react-router-dom` v7.18.3).
* **State Management:** Context API:
  * `AppContext.jsx`: Global theme, alerts, modals, quick actions, toasts.
  * `RoleContext.jsx`: Active role, user session, permissions, login/logout.
  * `CMMSContext.jsx`: Assets, work orders, PM schedules, calibrations, downtime, spare parts.
  * `MasterDataContext.jsx`: Central master data (SKUs, lines, recipes, CCP limits, suppliers).
  * `MasterAdminContext.jsx`: Tenant companies, modules, subscriptions, payments (currently in-memory).
  * `AdminContext.jsx`: Admin activity logs, user management.
* **API Client:** `frontend/src/services/apiClient.js` with bearer token injection, automated error transformation, and standard HTTP verb wrappers (`get`, `post`, `put`, `patch`, `delete`).

---

## 3. Detailed Audit of Integration Areas

### 3.1 AI Functionality Audit
* **Existing Backend Routes:**
  * Route file: `backend/src/modules/ai/ai.routes.ts` (mounted at `/api/v1/ai`).
  * Endpoints:
    * `GET /api/v1/ai/insights` — lists operational insights.
    * `POST /api/v1/ai/insights/:id/approve` — approves recommendation.
    * `POST /api/v1/ai/insights/:id/reject` — rejects recommendation.
    * `POST /api/v1/ai/chat` — AI query endpoint.
* **Existing Backend Service:**
  * Service file: `backend/src/modules/ai/ai.service.ts`.
  * Current status: Hardcoded in-memory array (`insights`) and dummy substring-matching `chatQuery(query)`.
* **Existing Frontend AI:**
  * Service: `frontend/src/services/aiService.js` (has methods `getInsights`, `approveInsight`, `rejectInsight`, `chat`).
  * UI Page: `frontend/src/pages/dashboards/AIAnalytics.jsx` (`/ai-analytics`).
  * Current status: Disconnected from `aiService.chat`. Uses local `AI_QA_EXAMPLES` mock and `setTimeout` simulation.
* **Audit Verdict:**
  * Route and endpoint paths already match specifications!
  * Missing: LLM Provider Abstraction layer (`backend/src/modules/ai/providers/`), real API call capability (OpenAI, Gemini, Claude), contextual data enrichment (pulling active OEE, downtime, work orders into prompt system prompt), and wiring `AIAnalytics.jsx` to `aiService.chat`.

---

### 3.2 Billing, Subscription & Payment Audit
* **Existing Database Schema:**
  * `tenants.ts` contains `tenants` table with columns: `id`, `name`, `slug`, `plan`, `status`, `settings`, `createdAt`, `updatedAt`.
  * **Missing in PostgreSQL:**
    * `subscriptions` table (for tracking active plans, renewal dates, and payment processor IDs).
    * `payments` table (for tracking order IDs, payment IDs, amounts, currencies, statuses).
    * `payment_webhooks` table (for webhook payload audit and idempotency tracking).
* **Existing Backend Routes:**
  * No billing module or routes exist in `backend/src/modules/`.
* **Existing Frontend UI:**
  * `LandingPage.jsx`: Pricing section with plans ("Plant Pilot", "Individual Modules", "Bundles", "MaintenX OS Complete") and modal triggering dummy toast.
  * `ManageSubscriptions.jsx` (`/master/subscriptions`): Master admin subscription list using `MasterAdminContext`.
  * `PaymentsPage.jsx` (`/master/payments`): Payments and invoicing ledger using `MasterAdminContext`.
  * `InvoiceModal.jsx`: Modal displaying invoice details.
* **Audit Verdict:**
  * Need to create `backend/src/modules/billing/` with:
    * `billing.routes.ts`: `POST /api/v1/billing/create-order`, `POST /api/v1/billing/verify`, `POST /api/v1/billing/webhook`, `GET /api/v1/billing/subscription`, `GET /api/v1/billing/plans`.
    * `billing.controller.ts` & `billing.service.ts`.
    * `razorpay.adapter.ts`: Order creation via Razorpay API, signature verification via HMAC SHA-256, webhook signature verification.
  * Database migration required to create `subscriptions`, `payments`, and `payment_webhooks`.
  * Wire frontend `LandingPage.jsx` and `PaymentsPage.jsx` to the new billing service.

---

### 3.3 PLC / IoT & Machine Telemetry Audit
* **Existing Database Schema:**
  * `masterData.ts` has `assets` (machines) and `productionLines`.
  * `maintenance.ts` has `workOrders` and `downtimeLogs`.
  * **Missing in PostgreSQL:**
    * `machine_telemetry` table (for storing normalized events: timestamp, status, count, speed, temperature, pressure, vibration, fault codes).
    * `iot_gateways` table (for storing configured edge brokers/gateways).
* **Existing Backend Service & Routes:**
  * In `backend/src/modules/admin/admin.service.ts`:
    * Has `inMemoryGateways` array (OPC-UA, MQTT, Modbus-TCP).
    * Methods: `getIoTGateways()` and `createIoTGateway()`.
    * Route: `backend/src/modules/admin/admin.routes.ts` (`GET /api/v1/admin/integrations/iot`, `POST /api/v1/admin/integrations/iot`).
  * There is NO machine telemetry ingestion service or protocol adapter framework.
* **Existing Frontend UI:**
  * `frontend/src/pages/iot/MachineIoTPage.jsx` (`/iot/machines`): Real-time telemetry dashboard. Uses `useCMMS().iotTelemetry` which is static in `CMMSContext.jsx`.
  * `frontend/src/pages/admin/integrations/IoTIntegrationPage.jsx` (`/integrations/iot`): Gateway configuration page wired to `adminService.getIoTGateways()`.
* **Audit Verdict:**
  * Need to create industrial protocol adapter architecture in `backend/src/modules/iot/`:
    * Adapters: `opcua.adapter.ts`, `mqtt.adapter.ts`, `modbus.adapter.ts`, `simulator.adapter.ts`.
    * Normalizer: `telemetryNormalizer.ts` producing `NormalizedMachineEvent`.
    * Service: `machineData.service.ts` (ingestion, threshold evaluation, auto work order generation, DB storage, SSE / live streaming).
    * Routes: `POST /api/v1/iot/telemetry/ingest`, `GET /api/v1/iot/telemetry/latest`, `GET /api/v1/iot/telemetry/stream` (SSE live feed), `POST /api/v1/iot/simulator/start`, `POST /api/v1/iot/simulator/stop`.
  * Connect `CMMSContext.jsx` and `MachineIoTPage.jsx` to live telemetry feed.

---

## 4. Reusable Infrastructure & Services
1. **Database Client:** `db` and `pool` in `backend/src/config/database.ts`.
2. **Response Formatter:** `formatSuccess`, `formatError` in `backend/src/shared/utils/responseFormatter.ts`.
3. **Error System:** `AppError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError` in `backend/src/shared/errors/AppError.ts`.
4. **Auth Middleware:** `authenticate` (JWT verify) in `backend/src/middleware/authenticate.ts`.
5. **Role Middleware:** `authorize` / `authorizeRoles` in `backend/src/middleware/authorize.ts`.
6. **Frontend API Client:** `apiClient` in `frontend/src/services/apiClient.js`.

---

## 5. Potential Conflicts & Duplicate Prevention
| Item | Existing State | Action to Prevent Conflict |
| :--- | :--- | :--- |
| **AI Routes** | `backend/src/modules/ai/` already registered at `/api/v1/ai` | REUSE existing route file and controller; replace mock service logic with provider abstraction. Do NOT create a duplicate `/api/ai`. |
| **IoT Gateways** | `admin.routes.ts` has `/api/v1/admin/integrations/iot` | Keep admin routes intact for backwards compatibility; add dedicated `/api/v1/iot` module for high-frequency telemetry ingestion & streaming. |
| **Billing** | No billing tables in DB; mock in `MasterAdminContext` | Create unified `billing` module under `/api/v1/billing` and sync with DB tables; update `MasterAdminContext` to consume backend APIs. |
| **Stripe** | Stray mock references in docs/comments | EXCLUDE Stripe completely. Strictly implement Razorpay. |
| **SAP S/4HANA** | Mock connector in `admin.service.ts` | Retain as optional/standalone mock. Do not touch or require SAP credentials. |

---

## 6. Inventory of Files to Create & Modify

### 6.1 Files to Modify
* `backend/src/app.ts`: Mount new `billingRoutes` (`/api/v1/billing`) and `iotRoutes` (`/api/v1/iot`).
* `backend/src/modules/ai/ai.service.ts`: Replace static substring logic with Provider Adapter + Context Enrichment.
* `backend/src/modules/ai/ai.controller.ts`: Add proper validation, user role passing, and structured error responses.
* `backend/src/db/schema/index.ts`: Export new billing and IoT schema definitions.
* `backend/.env.example`: Add placeholder entries for `AI_PROVIDER`, `AI_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
* `frontend/src/pages/dashboards/AIAnalytics.jsx`: Wire chat interface and insight approval to `aiService`.
* `frontend/src/pages/landing/LandingPage.jsx`: Connect plan selection and payment checkout to `billingService.createOrder` and Razorpay modal.
* `frontend/src/context/CMMSContext.jsx`: Connect `iotTelemetry` to backend live telemetry stream.

### 6.2 Files to Create
* **Database & Migrations:**
  * `backend/src/db/schema/billing.ts`: `subscriptions`, `payments`, `paymentWebhooks`.
  * `backend/src/db/schema/iot.ts`: `machineTelemetry`, `iotGateways`.
  * `backend/src/migrate-integrations.ts`: Safe, idempotent PostgreSQL migration script.
* **AI Provider Abstraction:**
  * `backend/src/modules/ai/providers/aiProvider.interface.ts`: Interface for LLM adapters.
  * `backend/src/modules/ai/providers/openAi.provider.ts`: OpenAI / generic LLM adapter.
  * `backend/src/modules/ai/providers/gemini.provider.ts`: Google Gemini adapter.
  * `backend/src/modules/ai/providers/claude.provider.ts`: Anthropic Claude adapter.
  * `backend/src/modules/ai/providers/mock.provider.ts`: Contextually intelligent fallback simulator.
  * `backend/src/modules/ai/providers/providerFactory.ts`: Config-driven provider instantiation.
  * `backend/src/modules/ai/context/operationalContext.ts`: Gathers live plant KPIs, OEE, active work orders for prompt injection.
* **Razorpay Billing Module:**
  * `backend/src/modules/billing/billing.routes.ts`
  * `backend/src/modules/billing/billing.controller.ts`
  * `backend/src/modules/billing/billing.service.ts`
  * `backend/src/modules/billing/razorpay.adapter.ts`
  * `frontend/src/services/billingService.js`
* **PLC / IoT Telemetry Module:**
  * `backend/src/modules/iot/iot.routes.ts`
  * `backend/src/modules/iot/iot.controller.ts`
  * `backend/src/modules/iot/services/machineData.service.ts`
  * `backend/src/modules/iot/normalizers/telemetryNormalizer.ts`
  * `backend/src/modules/iot/adapters/protocolAdapter.interface.ts`
  * `backend/src/modules/iot/adapters/opcua.adapter.ts`
  * `backend/src/modules/iot/adapters/mqtt.adapter.ts`
  * `backend/src/modules/iot/adapters/modbus.adapter.ts`
  * `backend/src/modules/iot/adapters/simulator.adapter.ts`
  * `frontend/src/services/iotService.js`

# MaintenX OS — Master Admin Production Backend & Database Implementation

## Executive Summary
This document provides the complete architectural, database, security, and API implementation record for the **Master Admin (`master_admin`) SaaS Super Admin Portal** within MaintenX OS.

Prior to this implementation, aspects of the Master Admin frontend relied on React local state, mock company arrays, static KPI constants, and client-side persistence. With this delivery, all 12 modules of the Master Admin portal have been transitioned to an enterprise-grade multi-tenant architecture with real PostgreSQL persistence, Fastify controller-service endpoints, cryptographic JWT role authorization, audit trail immutability, server-side module entitlement gates, and zero fake state.

---

## 1. Architecture Overview

The Master Admin architecture strictly decouples single-tenant operations (`admin` / Company Admin) from cross-tenant global SaaS platform governance (`master_admin` / SaaS Super Admin).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Master Admin Frontend (Vite + React)                  │
│   MasterDashboard | CompaniesList | CompanyDetails | CompanyAdmins          │
│   PlansPricing | ManageSubscriptions | PaymentsPage | ManageModules         │
│   MasterUsers | PlatformAnalytics | MasterAuditLogs | SupportTickets        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST (JSON / Bearer JWT)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Fastify Enterprise Engine                           │
│  - JWT Verification Hook (`authenticate.ts`)                                │
│  - Super Admin Role Guard (`authorizeRoles(["master_admin"])`)              │
│  - Input Validation & Schema Serialization (Zod & Drizzle-Zod)              │
│  - Dynamic Route Controller (`master.controller.ts`)                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Typed Service Invocations
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Master Admin Service Layer                         │
│                    (`backend/src/modules/master/master.service.ts`)         │
│  - Dynamic SQL Aggregations & Query Builders                                │
│  - ACID Multi-Entity Provisioning Transactions (`pool.connect()`)           │
│  - Append-Only Audit Logging (`writeAudit()`)                               │
│  - Safe Soft-Deactivation Strategy (No FK Violations)                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Drizzle ORM + pg Client (Port 5432)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Relational Storage                       │
│  Existing: tenants, plants, users, subscriptions, payments, audit_logs      │
│  Created:  plans, tenant_modules, support_tickets, platform_settings        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema & Tables

### Reused Existing PostgreSQL Tables
1. **`tenants`**: SaaS company records with `id`, `name`, `slug`, `plan`, `status` (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`), `settings` JSONB, and timestamps.
2. **`plants`**: Manufacturing sites associated with tenants (`tenant_id`, `name`, `code`, `city`, `state`, `country`, `is_active`).
3. **`users`**: Platform users across all tenants with `tenant_id`, `email`, `password_hash`, `first_name`, `last_name`, `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`), and `last_login_at`.
4. **`user_roles` & `roles`**: RBAC role bindings connecting users to `master_admin`, `admin`, `plant_manager`, `operator`, etc.
5. **`subscriptions`**: Active and historical billing subscriptions with `tenant_id`, `plan_name`, `status`, `current_period_start`, `current_period_end`, `razorpay_subscription_id`.
6. **`payments`**: Transaction records with `tenant_id`, `amount`, `currency`, `status` (`PAID`, `PENDING`, `OVERDUE`, `FAILED`), `method`, `razorpay_payment_id`, `razorpay_order_id`.
7. **`audit_logs`**: System audit trail capturing `user_id`, `tenant_id` (made nullable for platform-wide actions), `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, and `user_agent`.

### Newly Created PostgreSQL Tables
Defined in [masterAdmin.ts](file:///d:/kiaan/MaintenX-OS/backend/src/db/schema/masterAdmin.ts) and executed via idempotent migration:

#### 1. `plans`
Dynamic pricing and licensing tiers:
- `id` (VARCHAR 64, PK): Canonical plan slug (e.g. `pilot`, `bundle`, `complete`, `enterprise`).
- `name` (VARCHAR 128): Display name.
- `subtitle` (VARCHAR 255): Plan positioning subtitle.
- `description` (TEXT): Plan capabilities overview.
- `price_monthly` (INT): Price per month in standard currency units.
- `price_annual` (INT): Price per year with billing discount.
- `currency` (VARCHAR 8): Default currency (`CAD`, `USD`, `INR`).
- `duration` (VARCHAR 64): Duration string (`7 Days`, `Unlimited`).
- `is_popular` (BOOLEAN): Badge highlight flag.
- `cta_text` (VARCHAR 64): Call-to-action button text.
- `user_limit` (INT): License capacity for tenant users.
- `plant_limit` (INT): Permitted factory sites.
- `line_limit` (INT): Permitted production lines.
- `features` (JSONB): Feature checklist array.
- `modules` (JSONB): Pre-packaged module keys.
- `status` (VARCHAR 32): `Active` or `Inactive`.
- `created_at`, `updated_at`: Timestamps.

#### 2. `tenant_modules`
Per-tenant module entitlement matrix:
- `id` (UUID, PK): Record ID.
- `tenant_id` (UUID, FK -> `tenants.id` ON DELETE CASCADE): Tenant association.
- `module_key` (VARCHAR 64): Module identifier (`plan`, `produce`, `verify`, `maintain`, `move`, `people`, `improve`, `intelligence`).
- `is_enabled` (BOOLEAN): Real-time entitlement switch.
- `created_at`, `updated_at`: Timestamps.
- Unique constraint on `(tenant_id, module_key)`.

#### 3. `support_tickets`
Customer issue escalation and SLA tracking:
- `id` (VARCHAR 64, PK): Ticket code (e.g. `TKT-1001`).
- `tenant_id` (UUID, Nullable FK -> `tenants.id`): Tenant association.
- `company_name` (VARCHAR 255): Reporting company name.
- `subject` (VARCHAR 255): Ticket subject line.
- `description` (TEXT): Detailed issue report.
- `priority` (VARCHAR 32): `Low`, `Medium`, `High`, `Critical`.
- `status` (VARCHAR 32): `Open`, `In Progress`, `Resolved`, `Closed`.
- `assigned_to` (VARCHAR 255): Assigned super admin.
- `resolution` (TEXT): Official resolution note or response text.
- `created_at`, `updated_at`: Timestamps.

#### 4. `platform_settings`
Global SaaS configuration:
- `id` (VARCHAR 64, PK): Singleton key (`global`).
- `platform_name` (VARCHAR 128): SaaS brand name (`MaintenX-OS`).
- `support_email` (VARCHAR 255): Platform escalation email.
- `default_currency` (VARCHAR 8): Default currency (`CAD`).
- `require_2fa` (BOOLEAN): Platform-wide two-factor enforcement.
- `maintenance_mode` (BOOLEAN): Master maintenance switch.
- `maintenance_message` (TEXT): User notification banner.
- `smtp_host`, `smtp_port`, `smtp_user`, `smtp_secure`: Outbound email config.
- `session_timeout_minutes` (INT): Inactivity lock limit.
- `branding` (JSONB): Logo, colors, copyright declarations.
- `updated_at`: Timestamp.

---

## 3. Backend Services & Controllers

Mounted in `backend/src/modules/master/` with Fastify prefix `/api/v1/master`:

1. **Dashboard Aggregations (`GET /dashboard`)**:
   - Executes multi-table SQL queries over `tenants`, `users`, `subscriptions`, `payments`, `support_tickets`, and `audit_logs`.
   - Derives real KPIs: `totalCompanies`, `activeCompanies`, `suspendedCompanies`, `globalUsers`, `activeSubscriptions`, `expiringSubscriptions` (where `current_period_end < NOW() + 30 days`), `pendingTickets`, `systemAlerts`.
   - Extracts plan distribution and recent 10 audit log entries.
2. **Companies Management (`/companies`, `/companies/:id`)**:
   - Comprehensive CRUD with search and status filtering.
   - Transactional `createCompany`: atomically provisions a `tenant`, primary `plant`, initial company `admin` user, password hash, role binding, active trial `subscription`, and 8 default `tenant_modules`.
   - Safe soft-deactivation (`DELETE /companies/:id`): marks tenant `DEACTIVATED`, locks tenant users (`SUSPENDED`), preserving data integrity and foreign keys.
3. **Company Administrators (`/company-admins`)**:
   - Queries users possessing the single-tenant `admin` role across all tenants.
   - Status toggling (`Active` / `Inactive`).
   - Cryptographic password reset generating secure temporary credentials with bcrypt hashing and immutable audit logging.
4. **Plans & Pricing (`/plans`)**:
   - Full CRUD over SaaS pricing tiers.
   - Compatible with existing Razorpay billing plans (`pilot`, `starter`, `standard`, `enterprise`).
5. **Subscriptions (`/subscriptions`)**:
   - Lists live platform subscriptions with expiry tracking.
   - Post endpoints to extend validity (`/extend`) and cancel subscription (`/cancel`, which safely suspends tenant access).
6. **Payments & Invoicing (`/payments`)**:
   - Real payment records aggregating revenue collected and overdue invoices.
   - Mark as paid endpoint (`PATCH /payments/:id/paid`).
   - Formatted invoice generator (`GET /payments/:id/invoice`) producing official tax receipts with verifiable references.
7. **Modules & Entitlements (`/companies/:companyId/modules`)**:
   - Matrix of 8 core manufacturing modules.
   - Master Admin toggle directly updates `tenant_modules` in PostgreSQL.
8. **Global Users (`/platform-users`)**:
   - Platform-wide cross-tenant user management with status updates.
9. **Platform Analytics (`/analytics`)**:
   - PostgreSQL aggregations for companies, active users, subscription breakdown, module adoption counts, and machine telemetry ingest counts.
   - Zero fabricated strings: metrics requiring hardware session telemetry explicitly disclose data source status.
10. **Activity & Audit Logs (`/audit-logs`)**:
    - Queries append-only `audit_logs` table.
    - No edit or delete endpoints exposed.
11. **Support Tickets (`/support-tickets`)**:
    - Ticket lifecycle: Create, List, Reply (updates status to `In Progress` with resolution notes), and Resolve.
12. **Platform Settings (`/settings`)**:
    - Reads and updates singleton `platform_settings` table.

---

## 4. Multi-Tenant Security & Role Isolation

1. **Super Admin Role Enforcement**:
   - Every route under `/api/v1/master/*` executes the `authorizeRoles(["master_admin"])` hook.
   - If a Company Admin (`admin`), Plant Manager (`plant_manager`), or unauthenticated visitor calls `/api/v1/master/*`, Fastify rejects with `403 Forbidden`.
2. **IDOR Prevention**:
   - Single-tenant endpoints `/api/v1/admin/*` strictly enforce `req.user.tenantId` in every query filter.
   - Tenant A cannot access Tenant B resources via URL parameter manipulation.
3. **Module Entitlement Gates**:
   - Server-side authorization queries `tenant_modules` before serving tenant APIs. Hiding UI elements is supplemented with real database permission enforcement.

---

## 5. Frontend Integration Architecture

The frontend communicates with the backend via `frontend/src/services/masterAdminService.js` through the unified `apiClient`:

```
User Action in UI
       │
       ▼
MasterAdminContext.jsx ──▶ masterAdminService.js ──▶ Fastify REST API (/api/v1/master/*)
       │                                                              │
       │                                                              ▼
       ▼                                                   PostgreSQL DB (Commit)
Re-fetch & Sync Local Context                                         │
       │                                                              ▼
       ▼                                                   JSON Success Response
Re-render UI (Cards, Badges, Tables, Modals) ◀────────────────────────┘
```

- **MasterDashboard**: Connected to `dashboardData` from `/api/v1/master/dashboard`. Hardcoded fallback values eliminated.
- **CompaniesList & CompanyDetails**: All 9 detail tabs load live company data, plants, admins, platform users, and audit logs.
- **ManageModules**: Toggles dispatch `PATCH /api/v1/master/companies/:id/modules/:key` and update PostgreSQL in real time.
- **CompanyAdmins**: Real emails and timestamps displayed; Password Reset button triggers backend credential generation.
- **PlansPricing & PlanModal**: Asynchronous plan creation and edits synced directly to PostgreSQL `plans`.
- **ManageSubscriptions**: Direct navigation to company details; one-click Renew/Extend and Cancel buttons calling backend endpoints.
- **PaymentsPage & InvoiceModal**: Real financial figures; "Download PDF" generates verified official receipts.
- **SupportTickets & TicketModal**: Real support ticket creation, tenant replies (`In Progress`), and ticket resolution persisted with audit logs.
- **PlatformSettings**: Controlled React state initialized from and persisting to PostgreSQL `platform_settings`.

---

## 6. Verification & Test Results

### 1. Master Admin Integration Suite (`backend/src/scripts/test-master-admin.ts`)
- **Total Tests**: 53
- **Passed**: 53
- **Failed**: 0
- **Coverage**:
  - JWT Authentication & Super Admin Token Validation
  - 403 Forbidden Role Guard against Company Admin & Unauthenticated access
  - Dashboard KPI aggregations from PostgreSQL
  - Company Creation with atomic multi-table provisioning
  - Company Search, Status Updates (Suspend/Activate), and Safe Soft-Deactivation
  - Company Admin retrieval, Status Updates, and Password Reset trigger
  - Plans & Pricing listing, dynamic plan creation, and status updates
  - Subscriptions retrieval and validity extension
  - Payments ledger aggregation and dynamic revenue calculation
  - Tenant Module entitlement toggle and server-side persistence
  - Cross-tenant Platform Users listing and status updates
  - Platform Analytics metrics derivation
  - Real-time Audit Logs creation and retrieval
  - Support Tickets creation, tenant reply, and resolution
  - Platform Settings read and write persistence

### 2. Regression Test Suite (`backend/src/scripts/test-integrations.ts`)
- **Total Tests**: 22
- **Passed**: 22
- **Failed**: 0
- **Integrations Verified**:
  - **AI Assistant**: Grounded responses, provider abstractions, vibration analysis queries.
  - **Razorpay Billing**: HMAC SHA-256 signature verification, order generation, subscription activation, webhook idempotency.
  - **PLC / Industrial IoT**: Modbus-TCP, OPC-UA, MQTT Sparkplug B normalization, threshold alarms, edge gateway listings.

### 3. Build & Type Checking
- **Backend TypeScript Compilation (`npx tsc --noEmit`)**: 0 Errors.
- **Vitest Backend Suite (`npm test`)**: 6/6 Passed.
- **Frontend Production Build (`npm run build`)**: Vite built in 8.68s, 0 Errors.

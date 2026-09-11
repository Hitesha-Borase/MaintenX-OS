# MaintenX OS — Master Admin Production Backend & Database Audit

**Document Version:** 1.0.0  
**Audit Date:** September 10, 2026  
**Auditor:** DeepMind Antigravity System Architect  
**Scope:** Complete 12-Module Master Admin Area (`master_admin` SaaS Super Admin Portal)

---

## Executive Summary

MaintenX OS contains a complete multi-role frontend application and a production Fastify + Drizzle ORM + PostgreSQL backend. The tenant-level and plant-level operations (`admin`, `plant_manager`, `planner`, `operator`, `maintenance`, `quality`, etc.) interface with extensive REST APIs, WebSockets/SSE, and relational database tables.

However, the **Master Admin portal** (`/master/*`), which allows the platform owner to supervise and govern all tenant companies, global users, licensing plans, subscriptions, payments, support tickets, and system settings, was largely running on **client-side mock data and `localStorage` persistence** via `MasterAdminContext.jsx`. 

While certain core tables (`tenants`, `users`, `plants`, `subscriptions`, `payments`, `payment_webhooks`, `audit_logs`) already exist in PostgreSQL, the dedicated multi-tenant Master Admin management endpoints (`/api/v1/master/*`) were not yet exposed, leaving frontend CRUD operations detached from PostgreSQL.

This document details the exact state of all 12 Master Admin modules across all 15 audit criteria prior to backend integration.

---

## Module-by-Module Technical Audit (12 Modules)

```
Criteria Legend:
1. Current Data Source
2. Current API Used
3. Current PostgreSQL Table Used
4. Current Backend Service
5. Current Frontend Service
6. Whether CRUD is Real or Local-Only
7. Whether Data Survives Page Refresh
8. Whether Data Survives Logout/Login
9. Whether Data is Tenant-Aware
10. Whether Master Admin Authorization is Enforced
11. Whether Audit Logging Exists
12. Whether Error/Loading/Empty States Exist
13. Whether KPI Values are Real or Hardcoded
14. Whether Buttons Actually Call Backend APIs
15. Whether Delete/Suspend/Update Persists to PostgreSQL
```

---

### Module 1: Control Center (`/master/dashboard` — `MasterDashboard.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `MasterAdminContext.jsx` state + hardcoded constants | Companies and users are read from `localStorage` (`master_companies`, `master_users`, `master_activity`). |
| 2 | API Used | **None** | No network call is dispatched when visiting `/master/dashboard`. |
| 3 | PostgreSQL Table | `tenants`, `users`, `subscriptions`, `payments`, `audit_logs` (Available in DB, but not queried for this page) | Aggregate statistics are not currently fetched via SQL. |
| 4 | Backend Service | **None** | No master dashboard aggregation service exists. |
| 5 | Frontend Service | **None** | Uses React Context (`useMasterAdmin()`). |
| 6 | CRUD Status | Read-only aggregation (Local-only) | Computes lengths of local state arrays. |
| 7 | Survives Refresh | Partially (`localStorage` only) | Survives as long as browser cache is intact; lost on cache clear. |
| 8 | Survives Logout/Login | Yes (tied to browser localStorage) | Unsafe: multiple users on same machine share the same cached array. |
| 9 | Tenant-Aware | Multi-tenant overview (intended) | Needs to cross all tenants safely under super-admin privileges. |
| 10 | Master Admin Auth Enforced | Frontend route only | No server-side role check currently triggered. |
| 11 | Audit Logging | Local-only | Activity list displays fake array from `localStorage`. |
| 12 | Error/Loading/Empty States | No loading spinner or error boundary | Renders synchronously from memory. |
| 13 | KPI Values | **HARDCODED & HYBRID** | `expiringSubscriptions = 2`, `pendingTickets = 14`, `systemAlerts = 3` are hardcoded in `MasterDashboard.jsx:L22-L24`. Plan bar charts hardcoded to `value={1}`. |
| 14 | Buttons Call Backend APIs | **No** | Quick action modals update context only. |
| 15 | Persistence to PostgreSQL | **No** | No database writes happen. |

---

### Module 2: Companies Management (`/master/companies` — `CompaniesList.jsx`, `CompanyDetails.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `localStorage.getItem("master_companies")` | Hardcoded initial array of 3 mock companies (`C-1001`, `C-1002`, `C-1003`). |
| 2 | API Used | **None** | No HTTP request made on list load or company detail view. |
| 3 | PostgreSQL Table | `tenants`, `plants` exist | The existing `tenants` table has `id`, `name`, `slug`, `plan`, `status`, `settings`. Not currently queried by `/master/companies`. |
| 4 | Backend Service | Reusable: `admin.service.ts` / `tenants` queries exist | Dedicated Master Admin tenant CRUD service missing. |
| 5 | Frontend Service | **None** (`MasterAdminContext.jsx` functions) | `addCompany`, `updateCompanyStatus`, `removeCompany` mutate local state. |
| 6 | CRUD Status | Local-only | Context array splice/filter. |
| 7 | Survives Refresh | Yes (via `localStorage`) | Not persisted on the database server. |
| 8 | Survives Logout/Login | Yes (in browser `localStorage`) | Not synchronized with PostgreSQL `tenants`. |
| 9 | Tenant-Aware | Global Super-Admin scope | Correct scope for Master Admin, but must fetch real records from PostgreSQL. |
| 10 | Master Admin Auth Enforced | Frontend route only | Any user manually hitting `/master/companies` in DOM can view local array. |
| 11 | Audit Logging | Local-only | Calls `addAuditLog()` pushing to `master_audit` in `localStorage`. |
| 12 | Error/Loading/Empty States | Empty state exists ("No companies found"), no loading/error states | Instant render with no network error handling. |
| 13 | KPI Values | Calculated from local array length | Real tenant counts must be computed from `tenants` table. |
| 14 | Buttons Call Backend APIs | **No** | Activate, Suspend, Remove, Add Company only modify `localStorage`. |
| 15 | Persistence to PostgreSQL | **No** | Deleting a company removes it from local state; PostgreSQL `tenants` is untouched. |

---

### Module 3: Company Administrators (`/master/company-admins` — `CompanyAdmins.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `MasterAdminContext.jsx` (`users` array filtered by `role === 'Company Admin'`) | Sourced from `localStorage.getItem("master_users")`. |
| 2 | API Used | **None** | No API call to `/api/v1/master/company-admins`. |
| 3 | PostgreSQL Table | `users`, `tenants`, `user_roles`, `roles` exist | Existing tables hold user credentials and tenant associations. |
| 4 | Backend Service | Reusable: `admin.service.ts` (has single-tenant user management) | Missing cross-tenant admin aggregation and password reset triggers. |
| 5 | Frontend Service | **None** | `useMasterAdmin()` local state mutations. |
| 6 | CRUD Status | Local-only | `updateUserStatus`, `removeUser`, `addUser` affect local array only. |
| 7 | Survives Refresh | Yes (`localStorage` only) | Database accounts are unaffected. |
| 8 | Survives Logout/Login | Yes (`localStorage` only) | Inconsistent with active authentication sessions. |
| 9 | Tenant-Aware | Displays `company` string on user object | Not linked to real `tenantId` foreign key. |
| 10 | Master Admin Auth Enforced | Frontend route only | Needs server-side `authorizeRoles(["master_admin"])`. |
| 11 | Audit Logging | Local-only | Calls local `addAuditLog()` with fake IP addresses. |
| 12 | Error/Loading/Empty States | Empty state exists, loading/error states missing | Does not handle network latency or HTTP 500/403. |
| 13 | KPI Values | Local filter count | Computed from local array. |
| 14 | Buttons Call Backend APIs | **No** | Status toggle and remove buttons do not send requests. |
| 15 | Persistence to PostgreSQL | **No** | Admin activation/deactivation does not update PostgreSQL `users.status`. |

---

### Module 4: Plans & Pricing (`/master/plans-pricing` — `PlansPricing.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `DEFAULT_PLANS` constant in `MasterAdminContext.jsx` | 4 plans: Plant Pilot, Individual Modules, Bundles, MaintenX OS Complete. Cached in `master_plans` `localStorage`. |
| 2 | API Used | **None** | No API call to `/api/v1/master/plans`. |
| 3 | PostgreSQL Table | **Missing in PostgreSQL** | `subscriptions` exists with `planId` and `planName`, but a dynamic catalog table `plans` is not yet created in PostgreSQL. |
| 4 | Backend Service | Partially in `billing.service.ts` | `billing.service.ts` has hardcoded plan rates for Razorpay order generation. Needs a database-backed plans service. |
| 5 | Frontend Service | **None** | Uses context `plans` state. |
| 6 | CRUD Status | Local-only | Create, Edit, Toggle, and Delete plan update `localStorage`. |
| 7 | Survives Refresh | Yes (via `localStorage`) | Not persisted in DB. |
| 8 | Survives Logout/Login | Yes (via `localStorage`) | Unsynchronized across devices. |
| 9 | Tenant-Aware | Global SaaS pricing catalog | Correct scope for platform-level plans. |
| 10 | Master Admin Auth Enforced | Frontend route only | Needs server-side Master Admin authorization. |
| 11 | Audit Logging | Local-only | Appends to local audit log array. |
| 12 | Error/Loading/Empty States | No loading spinner or network error handling | Pure local render. |
| 13 | KPI Values | Display values from plan object | Hardcoded monthly/annual prices and user limits in object. |
| 14 | Buttons Call Backend APIs | **No** | Create, Edit, Toggle, and Remove buttons do not call backend. |
| 15 | Persistence to PostgreSQL | **No** | Plans created in UI do not exist in PostgreSQL. |

---

### Module 5: Subscriptions (`/master/subscriptions` — `ManageSubscriptions.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `companies` array in `MasterAdminContext.jsx` | Subscriptions are inferred from `company.subscription` string. |
| 2 | API Used | **None** | No API call to `/api/v1/master/subscriptions`. |
| 3 | PostgreSQL Table | `subscriptions` exists in Drizzle schema & PostgreSQL | Fields: `tenantId`, `planId`, `planName`, `status`, `billingCycle`, `amount`, `currentPeriodEnd`, `razorpaySubscriptionId`. |
| 4 | Backend Service | `billing.service.ts` exists | Handles Razorpay checkout & webhooks; does not currently expose Master Admin cross-tenant listing/extension endpoint. |
| 5 | Frontend Service | **None** | Local context helpers `extendCompanySubscription`, `cancelCompanySubscription`. |
| 6 | CRUD Status | Local-only | Extends `expiryDate` string by 1 year in local state. |
| 7 | Survives Refresh | Yes (via `localStorage`) | Desynchronized from PostgreSQL `subscriptions`. |
| 8 | Survives Logout/Login | Yes (via `localStorage`) | Not persisted in database. |
| 9 | Tenant-Aware | Master Admin aggregate view | Must join with `tenants` table to display tenant name, slug, and status. |
| 10 | Master Admin Auth Enforced | Frontend route only | Server-side role guard required. |
| 11 | Audit Logging | Local-only | Logs to local `master_audit`. |
| 12 | Error/Loading/Empty States | Empty filter message exists; network loading/error missing | Instant local render. |
| 13 | KPI Values | Computed from local array filter | Should count active/expiring records in `subscriptions` table. |
| 14 | Buttons Call Backend APIs | **No** | "Extend Subscription" and "Cancel" buttons do not invoke backend. |
| 15 | Persistence to PostgreSQL | **No** | Subscription extensions do not write to PostgreSQL `subscriptions`. |

---

### Module 6: Payments & Invoicing (`/master/payments` — `PaymentsPage.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `localStorage.getItem("master_payments")` | Hardcoded mock array of 4 invoices (`INV-2024-001` to `INV-2024-004`). |
| 2 | API Used | **None** | No API call to `/api/v1/master/payments`. |
| 3 | PostgreSQL Table | `payments`, `payment_webhooks` exist | Table has: `id`, `tenantId`, `subscriptionId`, `orderId`, `paymentId`, `amount`, `currency`, `status`, `method`, `receiptNumber`. |
| 4 | Backend Service | `billing.service.ts` exists | Handles payments ingestion via Razorpay webhook; lacks Master Admin query/update endpoint. |
| 5 | Frontend Service | **None** | Context methods `markPaymentPaid`, `logInvoiceDownload`. |
| 6 | CRUD Status | Local-only | "Mark as Paid" changes status string in `localStorage`. |
| 7 | Survives Refresh | Yes (`localStorage` only) | Independent of PostgreSQL transactions. |
| 8 | Survives Logout/Login | Yes (`localStorage` only) | Not stored in database. |
| 9 | Tenant-Aware | Cross-tenant invoice view | Must fetch tenant information from `tenants` relation. |
| 10 | Master Admin Auth Enforced | Frontend route only | Needs server-side Master Admin validation. |
| 11 | Audit Logging | Local-only | Appends to local audit log. |
| 12 | Error/Loading/Empty States | Filter empty state present; loading/network error missing | Instant render from local state. |
| 13 | KPI Values | Computed from local array (`totalRevenue`, `overdueAmount`) | Needs SQL `SUM(amount)` aggregation over `payments`. |
| 14 | Buttons Call Backend APIs | **No** | "Mark Paid" and "Download PDF" are client-side simulated toasts. |
| 15 | Persistence to PostgreSQL | **No** | Invoices marked paid never update `payments.status` in PostgreSQL. |

---

### Module 7: Modules & Features (`/master/modules` — `ManageModules.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `company.modules` object in `MasterAdminContext.jsx` | In-memory boolean map for 8 modules: `plan`, `produce`, `verify`, `maintain`, `move`, `people`, `improve`, `intelligence`. |
| 2 | API Used | **None** | No API call to `/api/v1/master/modules`. |
| 3 | PostgreSQL Table | **Missing in PostgreSQL** | `tenants.settings` JSON exists, but no explicit `tenant_modules` table exists to record per-tenant module enablement. |
| 4 | Backend Service | **None** | No module entitlement verification service. |
| 5 | Frontend Service | **None** | Calls `toggleCompanyModule` in local context. |
| 6 | CRUD Status | Local-only | Toggles boolean in `localStorage`. |
| 7 | Survives Refresh | Yes (via `localStorage`) | Not persisted in DB. |
| 8 | Survives Logout/Login | Yes (via `localStorage`) | Bypasses all server security. |
| 9 | Tenant-Aware | Maps modules to local `company.id` | Missing real database foreign key linkage to `tenants.id`. |
| 10 | Master Admin Auth Enforced | Frontend route only | **CRITICAL SECURITY RISK:** Disabled modules are only hidden in frontend UI; backend routes do not verify if tenant has module enabled! |
| 11 | Audit Logging | Local-only | Logs to local `master_audit`. |
| 12 | Error/Loading/Empty States | Empty filter state present; no async loading/error states | Instant render. |
| 13 | KPI Values | N/A | Displays boolean toggles per company. |
| 14 | Buttons Call Backend APIs | **No** | Toggle switches do not dispatch HTTP requests. |
| 15 | Persistence to PostgreSQL | **No** | Module entitlements do not write to PostgreSQL. |

---

### Module 8: Global Platform Users (`/master/platform-users` — `MasterUsers.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `MasterAdminContext.jsx` (`users` state) | Loaded from `localStorage.getItem("master_users")`. |
| 2 | API Used | **None** | No API call to `/api/v1/master/platform-users`. |
| 3 | PostgreSQL Table | `users`, `tenants`, `plants` exist | The `users` table contains all platform users across all tenants. |
| 4 | Backend Service | Reusable: `admin.service.ts` has `getUsers()`, but scoped to single tenant | Missing cross-tenant Master Admin user listing and status toggle service. |
| 5 | Frontend Service | **None** | Local state updates. |
| 6 | CRUD Status | Local-only | `updateUserStatus` mutates local array. |
| 7 | Survives Refresh | Yes (`localStorage` only) | Database accounts untouched. |
| 8 | Survives Logout/Login | Yes (`localStorage` only) | Not aligned with database state. |
| 9 | Tenant-Aware | Displays company name string | Not joined with PostgreSQL `tenants` table. |
| 10 | Master Admin Auth Enforced | Frontend route only | Server-side role guard required. |
| 11 | Audit Logging | Local-only | Appends to local audit log. |
| 12 | Error/Loading/Empty States | Empty state present; network loading/error missing | Instant render. |
| 13 | KPI Values | Computed from local array length | Real user counts must be fetched from PostgreSQL. |
| 14 | Buttons Call Backend APIs | **No** | Suspend / Activate buttons do not call backend. |
| 15 | Persistence to PostgreSQL | **No** | Suspending a user in this UI does not block their actual login in `auth.service.ts`. |

---

### Module 9: Platform Analytics (`/master/analytics` — `PlatformAnalytics.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | Local context `companies` and `users` + **Hardcoded strings** | Sourced from `MasterAdminContext.jsx`. |
| 2 | API Used | **None** | No API call to `/api/v1/master/analytics`. |
| 3 | PostgreSQL Table | `tenants`, `users`, `subscriptions`, `audit_logs` exist | Real metrics can be queried directly from these tables. |
| 4 | Backend Service | **None** | No Master Admin analytics aggregation service exists. |
| 5 | Frontend Service | **None** | Synchronous JSX render from context. |
| 6 | CRUD Status | Read-only analytics (Local-only) | Computes percentage distributions locally. |
| 7 | Survives Refresh | Yes (reads local context) | Not connected to backend. |
| 8 | Survives Logout/Login | Yes (reads local context) | Static presentation. |
| 9 | Tenant-Aware | Platform-wide aggregation | Super-admin analytics across all tenants. |
| 10 | Master Admin Auth Enforced | Frontend route only | Server-side authorization missing. |
| 11 | Audit Logging | None | Read-only view. |
| 12 | Error/Loading/Empty States | No loading or error states | Instant render. |
| 13 | KPI Values | **HARDCODED FAKE VALUES DETECTED** | Lines 31-41 contain `AVG SESSION: "24m"` and `API REQUESTS: "1.2M"`. Module adoption has hardcoded baseline `{ production: 0, quality: 0, maintenance: 0, warehouse: 0, ci: 0 }`. |
| 14 | Buttons Call Backend APIs | N/A | Informational cards only. |
| 15 | Persistence to PostgreSQL | N/A | Read-only page. |

---

### Module 10: Activity & Audit Logs (`/master/audit-logs` — `MasterAuditLogs.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `localStorage.getItem("master_audit")` | 3 mock records (`AL-901`, `AL-902`, `AL-903`). |
| 2 | API Used | **None** | No API call to `/api/v1/master/audit-logs`. |
| 3 | PostgreSQL Table | `audit_logs` exists | Production table with: `id`, `tenantId`, `userId`, `action`, `entityType`, `entityId`, `oldValues`, `newValues`, `ipAddress`, `userAgent`, `createdAt`. |
| 4 | Backend Service | Reusable: `auditContext.ts` has `logAuditTrail()`; `admin.service.ts` queries single-tenant logs | Lacks cross-tenant Master Admin query endpoint. |
| 5 | Frontend Service | **None** | Local state filtering & CSV blob download. |
| 6 | CRUD Status | Append-only in `localStorage` | Purely in-memory. Generates fake IP `10.0.0.X` with `Math.random()`. |
| 7 | Survives Refresh | Yes (`localStorage` only) | Database audit trail is not queried. |
| 8 | Survives Logout/Login | Yes (`localStorage` only) | Out of sync with database. |
| 9 | Tenant-Aware | Global audit log | Must resolve `tenant_id` to company name and `user_id` to user name. |
| 10 | Master Admin Auth Enforced | Frontend route only | Needs server-side Master Admin authorization. |
| 11 | Audit Logging | Self-logging to `localStorage` | Does not query real PostgreSQL `audit_logs`. |
| 12 | Error/Loading/Empty States | Empty filter message exists; async loading/error states missing | Instant render. |
| 13 | KPI Values | N/A | Log table view. |
| 14 | Buttons Call Backend APIs | **No** | "Export Logs" generates CSV purely in the browser from client state. |
| 15 | Persistence to PostgreSQL | **No** | Master Admin actions do not persist to PostgreSQL `audit_logs`. |

---

### Module 11: Support Tickets (`/master/support-tickets` — `SupportTickets.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | `localStorage.getItem("master_tickets")` | 4 mock tickets (`TKT-1042` to `TKT-1045`). |
| 2 | API Used | **None** | No API call to `/api/v1/master/support-tickets`. |
| 3 | PostgreSQL Table | **Missing in PostgreSQL** | No `support_tickets` table exists in PostgreSQL schema. |
| 4 | Backend Service | **None** | No backend ticket service exists. |
| 5 | Frontend Service | **None** | Local context method `updateTicketStatus`. |
| 6 | CRUD Status | Local-only | Status updates mutate `localStorage`. |
| 7 | Survives Refresh | Yes (`localStorage` only) | Not stored in DB. |
| 8 | Survives Logout/Login | Yes (`localStorage` only) | Not shared across administrators. |
| 9 | Tenant-Aware | Stores `company` string | Needs relational `tenantId` linking to `tenants.id`. |
| 10 | Master Admin Auth Enforced | Frontend route only | Server-side protection missing. |
| 11 | Audit Logging | Local-only | Calls local `addAuditLog()` on ticket resolve. |
| 12 | Error/Loading/Empty States | Empty filter message exists; loading/error missing | Instant render. |
| 13 | KPI Values | Computed from local array filter | Should count from PostgreSQL table. |
| 14 | Buttons Call Backend APIs | **No** | Resolve and Reply modals mutate local state only. |
| 15 | Persistence to PostgreSQL | **No** | No ticket data is saved in PostgreSQL. |

---

### Module 12: Platform Settings (`/master/settings` — `PlatformSettings.jsx`)

| # | Audit Criterion | Current State | Technical Analysis & Gaps |
|---|---|---|---|
| 1 | Data Source | HTML `defaultValue` and `defaultChecked` props | Static inputs in JSX; no state backing. |
| 2 | API Used | **None** | No API call to `/api/v1/master/settings`. |
| 3 | PostgreSQL Table | **Missing in PostgreSQL** | No `platform_settings` table exists in PostgreSQL schema. |
| 4 | Backend Service | **None** | No platform configuration service exists. |
| 5 | Frontend Service | **None** | `handleSave()` triggers a fake success toast `addToast("Platform settings saved successfully", "success")`. |
| 6 | CRUD Status | **Completely disconnected** | Inputs are uncontrolled; values are discarded on page navigation. |
| 7 | Survives Refresh | **NO** | Resets to hardcoded HTML default values. |
| 8 | Survives Logout/Login | **NO** | Resets to defaults. |
| 9 | Tenant-Aware | Global SaaS platform scope | Intended for SaaS-wide settings (Maintenance mode, SMTP, Security). |
| 10 | Master Admin Auth Enforced | Frontend route only | Server-side protection missing. |
| 11 | Audit Logging | None | No audit event generated when saving settings. |
| 12 | Error/Loading/Empty States | None | Fake toast only. |
| 13 | KPI Values | N/A | Form inputs. |
| 14 | Buttons Call Backend APIs | **No** | "Save Settings" button only triggers toast. |
| 15 | Persistence to PostgreSQL | **No** | Settings are never written to any database. |

---

## Architecture & Integration Gap Analysis

### 1. Existing Reusable Database Tables & Services

| Existing PostgreSQL Table | Current Schema Location | Reusable Master Admin Operations |
|---|---|---|
| `tenants` | `backend/src/db/schema/tenants.ts` | Company listing, company creation, company suspension (`status`), company deletion (soft-delete / deactivation). |
| `plants` | `backend/src/db/schema/tenants.ts` | Plant sites listing per company, plant counts per tenant. |
| `users` | `backend/src/db/schema/users.ts` | Global platform user directory, company admin management, status toggling (`status = ACTIVE / SUSPENDED`). |
| `roles` & `user_roles` | `backend/src/db/schema/users.ts` | System role assignment (`master_admin`, `admin`, etc.). |
| `subscriptions` | `backend/src/db/schema/billing.ts` | Active subscriptions, billing cycles, period dates, cancellation, extension. Compatible with Razorpay. |
| `payments` | `backend/src/db/schema/billing.ts` | Payment transactions, invoices, status (`PAID`, `FAILED`, etc.), receipt numbers. Compatible with Razorpay. |
| `payment_webhooks` | `backend/src/db/schema/billing.ts` | Razorpay webhook audit records. |
| `audit_logs` | `backend/src/db/schema/audit.ts` | Platform audit trail, action recording, IP address, user agent. |

### 2. Missing Database Tables to Create via Migration

To achieve 100% production persistence without fake data, the following 4 entities must be added to PostgreSQL:

1. **`plans`**:
   - `id`: varchar(100) PRIMARY KEY (e.g. `plant-pilot`, `individual-modules`, `bundles`, `maintenx-complete`)
   - `name`: varchar(255) NOT NULL
   - `subtitle`: text
   - `price_monthly`: numeric(12, 2) NOT NULL DEFAULT 0
   - `price_annual`: numeric(12, 2) NOT NULL DEFAULT 0
   - `currency`: varchar(10) NOT NULL DEFAULT 'CAD'
   - `duration`: varchar(50) DEFAULT 'Unlimited'
   - `user_limit`: integer DEFAULT 10
   - `access_level`: varchar(50) DEFAULT 'Standard'
   - `status`: varchar(50) NOT NULL DEFAULT 'Active'
   - `is_popular`: boolean DEFAULT false
   - `cta_text`: varchar(100) DEFAULT 'Choose Plan'
   - `modules`: jsonb NOT NULL DEFAULT '[]'::jsonb
   - `features`: jsonb NOT NULL DEFAULT '[]'::jsonb
   - `created_at`, `updated_at`: timestamp NOT NULL DEFAULT NOW()

2. **`support_tickets`**:
   - `id`: varchar(100) PRIMARY KEY (e.g. `TKT-1042`)
   - `tenant_id`: uuid REFERENCES tenants(id) ON DELETE SET NULL
   - `company_name`: varchar(255) NOT NULL
   - `subject`: varchar(255) NOT NULL
   - `description`: text
   - `status`: varchar(50) NOT NULL DEFAULT 'Open' (`Open`, `In Progress`, `Resolved`)
   - `priority`: varchar(50) NOT NULL DEFAULT 'Medium' (`Low`, `Medium`, `High`)
   - `assigned_to`: varchar(255)
   - `resolution`: text
   - `created_at`, `updated_at`: timestamp NOT NULL DEFAULT NOW()

3. **`platform_settings`**:
   - `id`: varchar(100) PRIMARY KEY DEFAULT 'global'
   - `platform_name`: varchar(255) NOT NULL DEFAULT 'MaintenX-OS'
   - `support_email`: varchar(255) NOT NULL DEFAULT 'support@maintenx.com'
   - `require_2fa`: boolean NOT NULL DEFAULT true
   - `enforce_strong_passwords`: boolean NOT NULL DEFAULT true
   - `log_all_ips`: boolean NOT NULL DEFAULT true
   - `maintenance_mode`: boolean NOT NULL DEFAULT false
   - `maintenance_message`: text
   - `default_currency`: varchar(10) NOT NULL DEFAULT 'CAD'
   - `smtp_config`: jsonb DEFAULT '{}'::jsonb
   - `branding`: jsonb DEFAULT '{}'::jsonb
   - `updated_at`: timestamp NOT NULL DEFAULT NOW()

4. **`tenant_modules`**:
   - `id`: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - `tenant_id`: uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL
   - `module_key`: varchar(100) NOT NULL (`plan`, `produce`, `verify`, `maintain`, `move`, `people`, `improve`, `intelligence`)
   - `is_enabled`: boolean NOT NULL DEFAULT true
   - `created_at`, `updated_at`: timestamp NOT NULL DEFAULT NOW()
   - *Constraint*: UNIQUE(`tenant_id`, `module_key`)

Additionally, for global Master Admin audit logging, `audit_logs.tenant_id` must be altered to allow `NULL` (for platform-wide actions like changing platform settings or modifying global pricing plans) using safe:
`ALTER TABLE audit_logs ALTER COLUMN tenant_id DROP NOT NULL;`

### 3. Missing Master Admin API Endpoints (`/api/v1/master/*`)

A dedicated Fastify route module must be created and registered in `backend/src/app.ts`:

- **Dashboard:**
  - `GET /api/v1/master/dashboard` — Returns real aggregated counts, tenant growth, plan breakdown, and recent audit logs.
- **Companies:**
  - `GET /api/v1/master/companies` — Lists companies with plant counts, user counts, active subscription, and expiry date.
  - `POST /api/v1/master/companies` — Creates tenant, default plant, initial admin user, and default module entitlements in a transaction.
  - `GET /api/v1/master/companies/:id` — Retrieves comprehensive details for all 9 tabs.
  - `PATCH /api/v1/master/companies/:id/status` — Toggles `status` (`Active` / `Suspended`).
  - `PATCH /api/v1/master/companies/:id` — Updates company name, slug, or contact details.
  - `DELETE /api/v1/master/companies/:id` — Performs safe soft-delete/deactivation strategy.
- **Company Admins:**
  - `GET /api/v1/master/company-admins` — Lists all users with company admin role across all tenants.
  - `PATCH /api/v1/master/company-admins/:id/status` — Activates or deactivates admin account.
  - `POST /api/v1/master/company-admins/:id/password-reset` — Resets password hash securely.
- **Plans & Pricing:**
  - `GET /api/v1/master/plans` — Lists all SaaS pricing plans.
  - `POST /api/v1/master/plans` — Creates a new plan.
  - `PATCH /api/v1/master/plans/:id` — Edits plan details, limits, and pricing.
  - `PATCH /api/v1/master/plans/:id/status` — Activates/deactivates a plan.
  - `DELETE /api/v1/master/plans/:id` — Deactivates or removes an unused plan.
- **Subscriptions:**
  - `GET /api/v1/master/subscriptions` — Lists all company subscriptions with renewal dates.
  - `POST /api/v1/master/subscriptions/:id/extend` — Extends subscription period in PostgreSQL.
  - `POST /api/v1/master/subscriptions/:id/cancel` — Cancels subscription and suspends company.
- **Payments & Invoicing:**
  - `GET /api/v1/master/payments` — Retrieves real payment and invoice records.
  - `PATCH /api/v1/master/payments/:id/paid` — Marks payment/invoice as paid.
  - `GET /api/v1/master/payments/:id/invoice` — Generates structured invoice data.
- **Modules & Features:**
  - `GET /api/v1/master/modules` — Returns all companies with their module toggle states.
  - `PATCH /api/v1/master/companies/:companyId/modules/:moduleKey` — Persists module enablement in `tenant_modules`.
- **Global Platform Users:**
  - `GET /api/v1/master/platform-users` — Lists all platform users across all companies.
  - `PATCH /api/v1/master/platform-users/:id/status` — Updates user status in PostgreSQL.
- **Platform Analytics:**
  - `GET /api/v1/master/analytics` — Computes real metrics from PostgreSQL without fake 1.2M strings.
- **Audit Logs:**
  - `GET /api/v1/master/audit-logs` — Retrieves append-only PostgreSQL `audit_logs`.
- **Support Tickets:**
  - `GET /api/v1/master/support-tickets` — Lists support tickets.
  - `POST /api/v1/master/support-tickets` — Creates a support ticket.
  - `PATCH /api/v1/master/support-tickets/:id/status` — Updates ticket status and records audit event.
- **Platform Settings:**
  - `GET /api/v1/master/settings` — Retrieves persisted platform settings.
  - `PUT /api/v1/master/settings` — Updates platform settings in PostgreSQL.

---

## Action Plan For Implementation

1. **Safe Database Migration:** Create schema `backend/src/db/schema/masterAdmin.ts` and execution script `backend/src/migrate-master-admin.ts` using `CREATE TABLE IF NOT EXISTS` for `plans`, `support_tickets`, `platform_settings`, and `tenant_modules`, plus `ALTER TABLE audit_logs ALTER COLUMN tenant_id DROP NOT NULL`. Seed canonical plans and initial settings.
2. **Backend Master Admin Module:** Implement:
   - `backend/src/modules/master/master.service.ts`
   - `backend/src/modules/master/master.controller.ts`
   - `backend/src/modules/master/master.routes.ts`
   - Mount in `backend/src/app.ts` under `/api/v1/master` guarded by `authorizeRoles(["master_admin"])`.
3. **Frontend Master Admin Service:** Create `frontend/src/services/masterAdminService.js` handling all API calls with standard `apiClient`.
4. **Master Admin Context & UI Integration:** Update `MasterAdminContext.jsx` to fetch all data from backend on mount and sync all actions to the API, replacing `localStorage` and eliminating all hardcoded numbers.
5. **Automated & Regression Testing:** Verify with dedicated test script `backend/src/scripts/test-master-admin.ts`, existing `test-integrations.ts` (AI, Razorpay, PLC/IoT), and full build validation.

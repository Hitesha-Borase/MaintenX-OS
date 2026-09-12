# MaintenX OS — Master Admin API Reference

All endpoints documented below are mounted under the base path `/api/v1/master`.

---

## Authentication & Headers
All requests must include a valid JSON Web Token (JWT) belonging to a user with the `master_admin` role.

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

If the token is missing, expired, or belongs to a non-master role (e.g. `admin`, `operator`), the server returns `401 Unauthorized` or `403 Forbidden`.

---

## 1. Control Center / Dashboard

### `GET /api/v1/master/dashboard`
Returns live platform KPIs, aggregated subscription counts, and recent audit activity.

- **Role**: `master_admin`
- **Request**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalCompanies": 6,
      "activeCompanies": 5,
      "suspendedCompanies": 1,
      "globalUsers": 18,
      "activeSubscriptions": 5,
      "expiringSubscriptions": 1,
      "companyGrowth": "+12%",
      "userGrowth": "+18%",
      "pendingTickets": 3,
      "systemAlerts": 1
    },
    "plans": [
      { "name": "MaintenX OS Complete", "count": 3, "color": "#2563EB" },
      { "name": "Bundles", "count": 2, "color": "#10B981" }
    ],
    "recentActivity": [
      {
        "id": "c8f9...-uuid",
        "action": "COMPANY_CREATED",
        "user": "Master Administrator",
        "time": "2026-09-10 16:30",
        "details": "Apex Manufacturing Ltd. onboarded with 1 plant."
      }
    ]
  }
}
```

---

## 2. Companies Management

### `GET /api/v1/master/companies`
Lists all tenant companies with subscription status, plant count, and primary administrator details.

- **Role**: `master_admin`
- **Query Parameters**:
  - `search` (optional): Filter by company name, slug, or administrator email.
  - `status` (optional): `All`, `Active`, `Suspended`, `Deactivated`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ade93aa0-841b-4779-a3c2-6799f987190a",
      "name": "Apex Manufacturing Ltd.",
      "slug": "apex-mfg",
      "status": "Active",
      "subscription": "MaintenX OS Complete",
      "admin": "John Doe",
      "adminEmail": "john@apex.com",
      "usersCount": 8,
      "plants": 2,
      "createdAt": "2026-09-08",
      "expiryDate": "2027-09-08",
      "currency": "CAD",
      "modules": {
        "plan": true,
        "produce": true,
        "verify": true,
        "maintain": true,
        "move": true,
        "people": true,
        "improve": true,
        "intelligence": true
      }
    }
  ]
}
```

### `GET /api/v1/master/companies/:id`
Retrieves detailed overview for a specific tenant company across 9 operational tabs.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "ade93aa0-841b-4779-a3c2-6799f987190a",
    "name": "Apex Manufacturing Ltd.",
    "slug": "apex-mfg",
    "status": "Active",
    "subscription": "MaintenX OS Complete",
    "admin": "John Doe",
    "adminEmail": "john@apex.com",
    "usersCount": 8,
    "plants": 2,
    "createdAt": "2026-09-08",
    "expiryDate": "2027-09-08",
    "currency": "CAD",
    "modules": { "plan": true, "produce": true, "verify": true, "maintain": true, "move": true, "people": true, "improve": true, "intelligence": true },
    "plantsList": [
      { "id": "p-1", "name": "Main Plant 01", "code": "MP-01", "location": "Toronto, ON, Canada", "lines": 3, "capacity": "250,000 Units/Day", "status": "Operational" }
    ],
    "usersList": [
      { "id": "u-1", "name": "John Doe", "email": "john@apex.com", "status": "Active", "lastLogin": "2026-09-10 11:20" }
    ],
    "subscriptionsList": [
      { "id": "sub-1", "planName": "MaintenX OS Complete", "status": "ACTIVE", "currentPeriodEnd": "2027-09-08T00:00:00.000Z" }
    ],
    "activityList": [
      { "id": "act-1", "action": "COMPANY_CREATED", "date": "2026-09-08 10:00:00", "details": "COMPANY_CREATED on Tenant" }
    ],
    "settings": { "currency": "CAD", "timezone": "America/Toronto" }
  }
}
```

### `POST /api/v1/master/companies`
Atomically provisions a new tenant company, primary manufacturing site, initial administrator user account, password hash, role assignment, active evaluation subscription, and core module entitlements within a single database transaction.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "name": "Nexus Precision Aerospace",
  "admin": "David Vance",
  "adminEmail": "david@nexus-aero.com",
  "subscription": "MaintenX OS Complete",
  "plantsCount": 1,
  "currency": "CAD"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Company and initial plant successfully provisioned",
  "data": {
    "id": "new-tenant-uuid",
    "name": "Nexus Precision Aerospace",
    "slug": "nexus-precision-aerospace-1a2b",
    "status": "Active",
    "subscription": "MaintenX OS Complete",
    "admin": "David Vance",
    "adminEmail": "david@nexus-aero.com",
    "usersCount": 1,
    "plants": 1,
    "createdAt": "2026-09-10",
    "expiryDate": "2027-09-10",
    "currency": "CAD"
  }
}
```

### `PATCH /api/v1/master/companies/:id/status`
Updates company operational status (`Active` / `Suspended`).

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "status": "Suspended"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Company status updated",
  "data": {
    "id": "ade93aa0-841b-4779-a3c2-6799f987190a",
    "status": "Suspended"
  }
}
```

### `DELETE /api/v1/master/companies/:id`
Executes safe soft-deactivation strategy: marks tenant status `DEACTIVATED` and associated user accounts `SUSPENDED`. Preserves data integrity, foreign key references, and audit logs.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Company 'Apex Manufacturing Ltd.' successfully deactivated."
}
```

---

## 3. Company Administrators

### `GET /api/v1/master/company-admins`
Lists all tenant administrators across the platform.

- **Role**: `master_admin`
- **Query Parameters**:
  - `search` (optional): Filter by name, email, or company.
  - `status` (optional): `All`, `Active`, `Inactive`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "6eb6cb7a-6595-405a-a2a1-586fa29e9d7c",
      "name": "System Administrator",
      "email": "admin@maintenx.com",
      "company": "Apex Manufacturing Ltd.",
      "tenantId": "ade93aa0-841b-4779-a3c2-6799f987190a",
      "role": "Company Admin",
      "status": "Active",
      "lastLogin": "2026-09-10 15:40",
      "createdAt": "2026-09-08"
    }
  ]
}
```

### `PATCH /api/v1/master/company-admins/:id/status`
Toggles an administrator's account status.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "status": "Inactive"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Admin status updated",
  "data": {
    "id": "6eb6cb7a-6595-405a-a2a1-586fa29e9d7c",
    "status": "Inactive"
  }
}
```

### `POST /api/v1/master/company-admins/:id/password-reset`
Triggers an immediate cryptographic password reset for the specified tenant administrator. Generates a temporary credential, updates bcrypt hash in PostgreSQL, and creates an audit record.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Temporary credentials issued and recorded in audit trail.",
  "data": {
    "id": "6eb6cb7a-6595-405a-a2a1-586fa29e9d7c",
    "email": "admin@maintenx.com"
  }
}
```

---

## 4. Plans & Pricing

### `GET /api/v1/master/plans`
Retrieves all configured SaaS pricing tiers from PostgreSQL.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pilot",
      "name": "Plant Pilot",
      "subtitle": "Free 7-Day Evaluation",
      "priceMonthly": 0,
      "priceAnnual": 0,
      "currency": "CAD",
      "duration": "7 Days",
      "isPopular": false,
      "ctaText": "Start Free Pilot",
      "features": ["1 Dedicated Production Line", "Operator Console Access"],
      "status": "Active"
    }
  ]
}
```

### `POST /api/v1/master/plans`
Creates a new pricing plan in PostgreSQL. Compatible with Razorpay plan configurations.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "name": "Aerospace Enterprise Tier",
  "subtitle": "High-Reliability MES",
  "priceMonthly": 12000,
  "priceAnnual": 120000,
  "currency": "CAD",
  "userLimit": 150,
  "plantLimit": 5,
  "isPopular": true,
  "features": ["Full Module Suite", "SCADA Historian Integration", "24/7 Dedicated Support"]
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "id": "aerospace-enterprise-tier-1789",
    "name": "Aerospace Enterprise Tier",
    "priceMonthly": 12000,
    "status": "Active"
  }
}
```

### `PATCH /api/v1/master/plans/:id/status`
Toggles plan availability status (`Active` / `Inactive`).

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "status": "Inactive"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Plan status updated",
  "data": {
    "id": "aerospace-enterprise-tier-1789",
    "status": "Inactive"
  }
}
```

---

## 5. Subscriptions

### `GET /api/v1/master/subscriptions`
Lists all active, expiring, and cancelled tenant subscriptions.

- **Role**: `master_admin`
- **Query Parameters**:
  - `search` (optional): Filter by company or plan name.
  - `plan` (optional): Filter by specific plan.
  - `status` (optional): `All`, `Active`, `Expiring`, `Cancelled`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-uuid-1",
      "company": "Apex Manufacturing Ltd.",
      "tenantId": "ade93aa0-841b-4779-a3c2-6799f987190a",
      "plan": "MaintenX OS Complete",
      "startDate": "2026-09-08",
      "endDate": "2027-09-08",
      "status": "Active",
      "amount": 290000,
      "currency": "INR",
      "paymentReference": "pay_test_1789"
    }
  ]
}
```

### `POST /api/v1/master/subscriptions/:id/extend`
Extends subscription validity period by 30 days in PostgreSQL and creates an audit record.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Subscription extended by 30 days",
  "data": {
    "id": "sub-uuid-1",
    "extendedUntil": "2027-10-08T00:00:00.000Z"
  }
}
```

### `POST /api/v1/master/subscriptions/:id/cancel`
Cancels subscription and suspends company access in PostgreSQL.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Subscription cancelled and company suspended",
  "data": {
    "id": "sub-uuid-1"
  }
}
```

---

## 6. Payments & Invoicing

### `GET /api/v1/master/payments`
Returns payments ledger, dynamic total collected revenue, and overdue balance.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "INV-78401",
        "company": "Apex Manufacturing Ltd.",
        "tenantId": "ade93aa0-841b-4779-a3c2-6799f987190a",
        "plan": "MaintenX OS Complete",
        "amount": 290000,
        "currency": "INR",
        "date": "2026-09-08",
        "status": "Paid",
        "method": "Razorpay Online",
        "orderId": "order_test_123",
        "paymentId": "pay_test_456"
      }
    ],
    "totalRevenue": 290000,
    "overdueAmount": 0
  }
}
```

### `PATCH /api/v1/master/payments/:id/paid`
Manually marks an overdue or pending invoice as paid in PostgreSQL with audit confirmation.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Payment marked as paid",
  "data": {
    "id": "INV-78401",
    "status": "Paid"
  }
}
```

### `GET /api/v1/master/payments/:id/invoice`
Retrieves verified invoice receipt details with cryptographic and transaction references for PDF download.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "INV-78401",
    "company": "Apex Manufacturing Ltd.",
    "tenantId": "ade93aa0-841b-4779-a3c2-6799f987190a",
    "plan": "MaintenX OS Complete",
    "amount": 290000,
    "currency": "INR",
    "date": "2026-09-08",
    "status": "Paid",
    "paymentMethod": "Razorpay Online",
    "razorpayPaymentId": "pay_test_456",
    "razorpayOrderId": "order_test_123"
  }
}
```

---

## 7. Modules & Features Entitlement

### `GET /api/v1/master/companies/:companyId/modules`
Returns the 8-module entitlement matrix for a specific tenant company.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "plan": true,
    "produce": true,
    "verify": true,
    "maintain": true,
    "move": true,
    "people": true,
    "improve": true,
    "intelligence": false
  }
}
```

### `PATCH /api/v1/master/companies/:companyId/modules/:moduleKey`
Toggles an entitlement switch (`isEnabled: true/false`) in PostgreSQL `tenant_modules`.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "isEnabled": true
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Module entitlement updated",
  "data": {
    "companyId": "ade93aa0-841b-4779-a3c2-6799f987190a",
    "moduleKey": "intelligence",
    "isEnabled": true
  }
}
```

---

## 8. Global Platform Users

### `GET /api/v1/master/platform-users`
Retrieves all users across all tenants.

- **Role**: `master_admin`
- **Query Parameters**:
  - `search` (optional): Filter by name, email, or company.
  - `status` (optional): `All`, `Active`, `Suspended`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "u-uuid-1",
      "name": "Jane Operator",
      "email": "jane@apex.com",
      "company": "Apex Manufacturing Ltd.",
      "tenantId": "ade93aa0-841b-4779-a3c2-6799f987190a",
      "role": "Operator",
      "status": "Active",
      "lastLogin": "2026-09-10 14:15",
      "createdAt": "2026-09-08"
    }
  ]
}
```

### `PATCH /api/v1/master/platform-users/:id/status`
Suspends or activates a global user account in PostgreSQL.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "status": "Suspended"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "User status updated",
  "data": {
    "id": "u-uuid-1",
    "status": "Suspended"
  }
}
```

---

## 9. Platform Analytics

### `GET /api/v1/master/analytics`
Calculates platform telemetry and system distributions from PostgreSQL.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalCompanies": 6,
    "totalUsers": 18,
    "activeUsers": 17,
    "avgSession": "N/A (Requires Active Session Telemetry Ingest)",
    "apiRequests": "418 Telemetry Ingests",
    "subscriptionDistribution": {
      "MaintenX OS Complete": 3,
      "Bundles": 2,
      "Plant Pilot": 1
    },
    "moduleAdoption": {
      "plan": 6,
      "produce": 6,
      "verify": 6,
      "maintain": 6,
      "move": 6,
      "people": 6,
      "improve": 6,
      "intelligence": 5
    }
  }
}
```

---

## 10. Activity & Audit Logs

### `GET /api/v1/master/audit-logs`
Retrieves immutable audit records from the append-only `audit_logs` table.

- **Role**: `master_admin`
- **Query Parameters**:
  - `search` (optional): Filter by actor user or target entity.
  - `event` (optional): Filter by event name (`COMPANY_CREATED`, `MODULE_ENTITLEMENT_TOGGLED`, etc.).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-uuid-1",
      "user": "Master Administrator",
      "event": "COMPANY_CREATED",
      "target": "Tenant (ade93aa0-841b-4779-a3c2-6799f987190a)",
      "date": "2026-09-10 16:30:15",
      "ip": "127.0.0.1"
    }
  ]
}
```

---

## 11. Support Tickets

### `GET /api/v1/master/support-tickets`
Lists all support tickets across tenants.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "TKT-1001",
      "company": "Apex Manufacturing Ltd.",
      "tenantId": "ade93aa0-841b-4779-a3c2-6799f987190a",
      "subject": "OPC-UA Tag Polling Delay on Line 2",
      "description": "Polling frequency intermittently degrades beyond 500ms threshold.",
      "status": "In Progress",
      "priority": "High",
      "assignedTo": "Platform Engineering",
      "date": "2026-09-10 12:45",
      "resolution": "Updated industrial edge gateway buffer timeout."
    }
  ]
}
```

### `POST /api/v1/master/support-tickets`
Creates a new support ticket in PostgreSQL.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "companyName": "Apex Manufacturing Ltd.",
  "subject": "Invoicing Currency Query",
  "priority": "Low",
  "description": "Request to align invoice generation with CAD taxation."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Support ticket created",
  "data": {
    "id": "TKT-8291",
    "status": "Open"
  }
}
```

### `PATCH /api/v1/master/support-tickets/:id/status`
Updates ticket status (`In Progress`, `Resolved`, `Closed`) and appends resolution or tenant reply text.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "status": "Resolved",
  "resolution": "Configuration successfully verified on tenant line."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Ticket status updated",
  "data": {
    "id": "TKT-1001",
    "status": "Resolved",
    "resolution": "Configuration successfully verified on tenant line."
  }
}
```

---

## 12. Platform Settings

### `GET /api/v1/master/settings`
Retrieves global platform configuration from PostgreSQL.

- **Role**: `master_admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "global",
    "platformName": "MaintenX-OS",
    "supportEmail": "support@maintenx.com",
    "defaultCurrency": "CAD",
    "require2fa": false,
    "maintenanceMode": false,
    "maintenanceMessage": "System maintenance in progress. Services will resume shortly.",
    "smtpHost": "smtp.maintenx.com",
    "smtpPort": 587,
    "smtpUser": "no-reply@maintenx.com",
    "smtpSecure": true,
    "sessionTimeoutMinutes": 60,
    "branding": {
      "logoUrl": "/assets/maintenx-logo.svg",
      "copyright": "© 2026 MaintenX OS Inc. All rights reserved."
    }
  }
}
```

### `PUT /api/v1/master/settings`
Updates global platform settings in PostgreSQL and writes an audit event.

- **Role**: `master_admin`
- **Request Body**:
```json
{
  "platformName": "MaintenX Manufacturing OS Enterprise",
  "supportEmail": "support-desk@maintenx.com",
  "defaultCurrency": "CAD",
  "require2fa": true,
  "maintenanceMode": false
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Platform settings saved",
  "data": {
    "id": "global",
    "platformName": "MaintenX Manufacturing OS Enterprise",
    "supportEmail": "support-desk@maintenx.com",
    "require2fa": true,
    "maintenanceMode": false
  }
}
```

---

## Error Handling Standards

All Master Admin endpoints return structured JSON errors with standard HTTP status codes:

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Access denied for role [admin]. Required: [master_admin]"
}
```

| HTTP Code | Condition |
|:---|:---|
| `400 Bad Request` | Missing required fields, invalid UUID, malformed JSON |
| `401 Unauthorized` | Missing or invalid Bearer JWT |
| `403 Forbidden` | Authenticated user lacks `master_admin` role |
| `404 Not Found` | Specified company, user, plan, or ticket does not exist |
| `409 Conflict` | Unique constraint violation (e.g. duplicate slug or email) |
| `500 Internal Server Error` | Database connection or unhandled runtime failure |

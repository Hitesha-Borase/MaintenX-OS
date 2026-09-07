# MaintenX OS — Manufacturing Operations Platform

Welcome to **MaintenX OS**, a complete enterprise Manufacturing Execution System (MES), Advanced Planning & Scheduling (APS), Quality Management (QMS / 21 CFR Part 11), Warehouse & 360° Traceability (WMS), and Maintenance (CMMS) SaaS platform.

---

## 📂 Project Structure

```text
d:\kiaan\MaintenX-OS\
│
├── frontend/                            # React 18 + Vite Frontend Application (70+ Screens)
│   ├── src/
│   │   ├── context/                     # Global State Providers (Planning, Production, Quality, CMMS, etc.)
│   │   ├── components/                  # Common UI, Layout, Charts, Tables
│   │   ├── pages/                       # MES, APS, QMS, WMS, CMMS, Dashboards, Operator HMI
│   │   └── data/                        # Manufacturing datasets
│   ├── package.json
│   └── vite.config.js
│
└── backend/                             # Fastify + TypeScript + Drizzle ORM + PostgreSQL REST API
    ├── src/
    │   ├── modules/                     # Domain modules (auth, planning, production, quality, warehouse, etc.)
    │   ├── db/schema/                   # 53 Normalized Drizzle ORM Relational Schemas
    │   ├── shared/engines/              # MRP, OEE, MTBF, Forecasting, 360° Traceability Engines
    │   ├── plugins/                     # Swagger docs, JWT, Helmet, CORS, Rate Limiter
    │   └── server.ts
    ├── drizzle/migrations/              # SQL Database Migration Files
    ├── package.json
    ├── tsconfig.json
    └── drizzle.config.ts
```

---

## 🚀 Quick Start Guide

### 1. Run the Frontend:
```bash
cd frontend
npm install
npm run dev
```
Accessible at: **`http://localhost:5173`**

### 2. Run the Backend:
```bash
cd backend
npm install
npm run dev
```
Accessible at: **`http://localhost:4000`**  
Interactive Swagger API Docs: **`http://localhost:4000/docs`**  
Health Check: **`http://localhost:4000/health`**

import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Database,
  Cpu,
  HeartPulse,
  Lock,
  FileText,
  UploadCloud,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  ArrowUpRight,
  Server,
  Zap
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { useAdmin } from "../../context/AdminContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const { users, roles, items, dataHealthStats } = useAdmin();
  const { addToast } = useApp();
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              System Administrator Command Dashboard
            </h1>
            <Badge variant="emerald" dot>
              SYSTEM HEALTH 99.98%
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Global enterprise governance cockpit: User provisioning, role RBAC permissions, plant master data, ERP/IoT integrations, data health remediation, and immutable security audit trails.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("System health checks and integration heartbeats verified.", "info")}
          >
            Run Health Audit
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => navigate("/users")}>
            + Provision User
          </Button>
        </div>
      </div>

      {/* 8 GOVERNANCE STAT CARDS (Users, Roles, Plants, Master Data, Integrations, Data Health, Security, Audit) */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {/* 1. Users */}
        <StatCard
          title="1. Active Users"
          value={users.length.toString()}
          unit="Accounts"
          trend={{ value: "5 Active • 0 Locked", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="blue"
          onClick={() => navigate("/users")}
        />

        {/* 2. Roles */}
        <StatCard
          title="2. RBAC Roles"
          value={roles.length.toString()}
          unit="Profiles"
          trend={{ value: "100% Principle of Least Privilege", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
          onClick={() => navigate("/roles")}
        />

        {/* 3. Plants */}
        <StatCard
          title="3. Org Plants"
          value="2 Sites"
          unit="6 Lines"
          trend={{ value: "Austin & Dallas Multi-Tenant", isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="cyan"
          onClick={() => navigate("/organization/plants")}
        />

        {/* 4. Master Data */}
        <StatCard
          title="4. Master SKU Items"
          value={items.length.toString()}
          unit="SKUs & BOMs"
          trend={{ value: "17 Master Tables Synced", isPositive: true, text: "" }}
          icon={Database}
          colorVariant="purple"
          onClick={() => navigate("/master-data/items")}
        />

        {/* 5. Integrations */}
        <StatCard
          title="5. Integrations Status"
          value="4 / 4 Live"
          unit="ERP/IoT/QR/API"
          trend={{ value: "SAP S/4HANA connected", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="emerald"
          onClick={() => navigate("/integrations/erp")}
        />

        {/* 6. Data Health */}
        <StatCard
          title="6. Data Health Score"
          value={`${dataHealthStats.healthScore}%`}
          unit="Quality Index"
          trend={{ value: `${dataHealthStats.missingDataCount} missing attributes`, isPositive: true, text: "" }}
          icon={HeartPulse}
          colorVariant="pink"
          onClick={() => navigate("/data-health/missing-data")}
        />

        {/* 7. Security */}
        <StatCard
          title="7. Security Posture"
          value="Hardened"
          unit="MFA Active"
          trend={{ value: "Zero rogue login attempts", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="emerald"
          onClick={() => navigate("/security")}
        />

        {/* 8. Audit */}
        <StatCard
          title="8. Immutable Audit Trail"
          value="1,420"
          unit="Events (MTD)"
          trend={{ value: "21 CFR Part 11 Logged", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="cyan"
          onClick={() => navigate("/audit-logs")}
        />
      </div>

      {/* Main Grid: System Latency & Governance Tiles */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        {/* System Latency Trend */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                API Gateway & Database Query Response Time (ms)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Real-time sub-millisecond edge gateway and transactional database latency
              </p>
            </div>
            <Badge variant="emerald">Avg: 22ms</Badge>
          </div>

          <AreaChart
            data={[
              { label: "00:00", value: 18 },
              { label: "04:00", value: 19 },
              { label: "08:00", value: 26 },
              { label: "12:00", value: 24 },
              { label: "16:00", value: 28 },
              { label: "20:00", value: 21 },
              { label: "Now", value: 22 }
            ]}
            height={210}
            color="#38BDF8"
            unit="ms"
          />
        </Card>

        {/* Quick Admin Navigation Tiles */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
            System Governance Direct Actions
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
              onClick={() => navigate("/users/invitations")}
            >
              <Users size={18} color="#60A5FA" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px" }}>User Invites</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Manage onboarding</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
              onClick={() => navigate("/roles/permissions")}
            >
              <ShieldCheck size={18} color="#34D399" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px" }}>Permission Matrix</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Granular RBAC</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
              onClick={() => navigate("/data-health/remediation")}
            >
              <HeartPulse size={18} color="#EC4899" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px" }}>Data Remediation</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Fix broken references</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
              onClick={() => navigate("/migration")}
            >
              <UploadCloud size={18} color="#10B981" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px" }}>Data Migration</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>CSV bulk upload</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
              onClick={() => navigate("/security")}
            >
              <Lock size={18} color="#EF4444" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px" }}>Security & 2FA</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>SAML SSO policies</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
              onClick={() => navigate("/audit-logs")}
            >
              <FileText size={18} color="#38BDF8" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px" }}>Audit Trail</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Compliance records</div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

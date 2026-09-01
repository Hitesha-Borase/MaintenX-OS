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
  Zap,
  X,
  RefreshCw,
  Clock,
  Sparkles
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
  const { users = [], roles = [], items = [], dataHealthStats = {}, addUser } = useAdmin();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isAuditing, setIsAuditing] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Maintenance Lead",
    department: "Maintenance",
    plant: "Plant 1 (Austin)",
    status: "Active"
  });

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      addToast("System Health Audit Complete: All microservices, ERP connectors & IoT edge gateways are nominal (99.98% Uptime).", "success");
    }, 900);
  };

  const handleProvisionSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast("Please provide both name and email address.", "warning");
      return;
    }

    if (addUser) {
      addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        plant: formData.plant,
        status: formData.status
      });
    }

    addToast(`New user ${formData.name} (${formData.role}) successfully provisioned!`, "success");
    setIsProvisionModalOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "Maintenance Lead",
      department: "Maintenance",
      plant: "Plant 1 (Austin)",
      status: "Active"
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              System Administrator Command Dashboard
            </h1>
            <Badge variant="emerald" dot>
              SYSTEM HEALTH 99.98%
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={isAuditing ? RefreshCw : RotateCcw}
            onClick={handleRunAudit}
            disabled={isAuditing}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isAuditing ? "Auditing Systems..." : "Run Health Audit"}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsProvisionModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Provision User
          </Button>
        </div>
      </div>

      {/* 4 STREAMLINED CORE GOVERNANCE KPI CARDS - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        {/* 1. Active Users & RBAC */}
        <StatCard
          title="Active Users & RBAC"
          value={users.length.toString()}
          unit="Accounts"
          trend={{ value: `${users.filter(u => u.status === "Active").length || 5} Active • ${roles.length || 5} Roles`, isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
          onClick={() => navigate("/users")}
        />

        {/* 2. Enterprise Plants & Master Data */}
        <StatCard
          title="Plants & Master Data"
          value="2 Sites"
          unit="6 Lines"
          trend={{ value: `${items.length || 5} SKUs • 17 Tables Synced`, isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="amber"
          onClick={() => navigate("/master-data/items")}
        />

        {/* 3. Integrations Status */}
        <StatCard
          title="Integrations Status"
          value="4 / 4 Live"
          unit="Connectors"
          trend={{ value: "SAP S/4HANA & IoT Connected", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="emerald"
          onClick={() => navigate("/integrations/erp")}
        />

        {/* 4. Data Health & Security */}
        <StatCard
          title="Data Health & Security"
          value={`${dataHealthStats.healthScore || 96.2}%`}
          unit="Quality Index"
          trend={{ value: "Hardened MFA • 21 CFR Part 11", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
          onClick={() => navigate("/data-health/missing-data")}
        />
      </div>

      {/* Main Grid: System Latency & Governance Direct Actions */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", width: "100%", minWidth: 0 }}>
        {/* System Latency Trend */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              API Gateway & Database Query Response Time (ms)
            </h3>
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
            color="#8C5B23"
            unit="ms"
          />
        </Card>

        {/* Quick Admin Navigation Tiles */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              System Governance Direct Actions
            </h3>
            <Badge variant="cyan">6 DIRECT TILES</Badge>
          </div>

          <div
            className="kpi-grid-responsive"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
              width: "100%"
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                textAlign: "left",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
              onClick={() => navigate("/users/invitations")}
            >
              <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(140, 91, 35, 0.1)", color: "#8C5B23" }}>
                <Users size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>User Invites</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Onboarding portal</div>
              </div>
            </button>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                textAlign: "left",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
              onClick={() => navigate("/roles/permissions")}
            >
              <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(5, 150, 105, 0.1)", color: "#059669" }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>Permission Matrix</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Granular RBAC</div>
              </div>
            </button>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                textAlign: "left",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
              onClick={() => navigate("/data-health/remediation")}
            >
              <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(217, 119, 6, 0.1)", color: "#D97706" }}>
                <HeartPulse size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>Data Remediation</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Fix broken records</div>
              </div>
            </button>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                textAlign: "left",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
              onClick={() => navigate("/migration")}
            >
              <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(5, 150, 105, 0.1)", color: "#059669" }}>
                <UploadCloud size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>Data Migration</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>CSV bulk upload</div>
              </div>
            </button>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                textAlign: "left",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
              onClick={() => navigate("/security")}
            >
              <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#DC2626" }}>
                <Lock size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>Security & 2FA</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>SAML SSO policies</div>
              </div>
            </button>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                textAlign: "left",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
              onClick={() => navigate("/audit-logs")}
            >
              <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(140, 91, 35, 0.1)", color: "#8C5B23" }}>
                <FileText size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-primary)" }}>Audit Trail</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Compliance records</div>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* PROVISION USER MODAL */}
      {isProvisionModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsProvisionModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Provision New Enterprise User
              </h2>
              <button onClick={() => setIsProvisionModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Enterprise Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.miller@flowstate.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="System Administrator">System Administrator</option>
                    <option value="Plant Manager">Plant Manager</option>
                    <option value="Maintenance Lead">Maintenance Lead</option>
                    <option value="QA Manager">QA Manager</option>
                    <option value="Production Supervisor">Production Supervisor</option>
                    <option value="Operator / Line Tech">Operator / Line Tech</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Plant Location</label>
                  <select
                    className="form-select"
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                    <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                    <option value="All Plants">All Plants (Global)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Operations">Operations</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Production">Production</option>
                    <option value="IT & Digital Ops">IT & Digital Ops</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Invite">Pending Invite</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsProvisionModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Provision User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

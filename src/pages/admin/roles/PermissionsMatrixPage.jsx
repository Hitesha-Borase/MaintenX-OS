import React, { useState } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  Download,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function PermissionsMatrixPage() {
  const { addToast } = useApp();

  const [selectedRole, setSelectedRole] = useState("Plant Manager");

  const [matrix, setMatrix] = useState({
    "Master Production Scheduling": { read: true, write: true, delete: false, approve: true, export: true },
    "Batch Release & QA Disposition": { read: true, write: true, delete: false, approve: true, export: true },
    "CMMS Work Orders & PM": { read: true, write: true, delete: false, approve: true, export: true },
    "Warehouse Lots & Shipping": { read: true, write: true, delete: false, approve: false, export: true },
    "Master Data Governance": { read: true, write: true, delete: true, approve: true, export: true },
    "Security & SAML Configuration": { read: false, write: false, delete: false, approve: false, export: false }
  });

  const togglePermission = (module, perm) => {
    setMatrix((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [perm]: !prev[module][perm]
      }
    }));
  };

  const handleSave = () => {
    addToast(`Permission matrix updated for ${selectedRole}!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Granular Role Permission Matrix
            </h1>
            <Badge variant="cyan">MODULE SCOPING</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Save} onClick={handleSave} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Save Matrix Changes
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
        <StatCard
          title="Active Scope"
          value={selectedRole}
          unit="Role"
          trend={{ value: "RBAC Profile Active", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Modules Governed"
          value={Object.keys(matrix).length.toString()}
          unit="Modules"
          trend={{ value: "Full system breadth", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="E-Signature Rights"
          value="21 CFR Part 11"
          unit="Compliant"
          trend={{ value: "Strict dual verification", isPositive: true, text: "" }}
          icon={FileCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Security Enforcement"
          value="Hardened"
          unit="Least Privilege"
          trend={{ value: "Zero rogue elevation", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="amber"
        />
      </div>

      {/* Role Selector Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["Plant Manager", "QA Manager", "Maintenance Lead", "Operator / Line Tech"].map((r) => (
          <button
            key={r}
            className={`btn ${selectedRole === r ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedRole(r)}
            style={{ padding: "6px 14px", fontSize: "12px", borderRadius: "6px", fontWeight: 700 }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Permission Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Operational Module</th>
                <th style={{ textAlign: "center" }}>Read / View</th>
                <th style={{ textAlign: "center" }}>Create / Edit</th>
                <th style={{ textAlign: "center" }}>Delete</th>
                <th style={{ textAlign: "center" }}>E-Sign / Approve</th>
                <th style={{ textAlign: "center" }}>Export Data</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrix).map(([mod, perms]) => (
                <tr key={mod}>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{mod}</strong>
                  </td>
                  {["read", "write", "delete", "approve", "export"].map((p) => (
                    <td key={p} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={perms[p]}
                        onChange={() => togglePermission(mod, p)}
                        style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#8C5B23" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

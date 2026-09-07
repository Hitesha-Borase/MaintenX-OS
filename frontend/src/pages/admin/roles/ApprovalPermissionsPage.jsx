import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit2,
  FileCheck,
  AlertTriangle,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function ApprovalPermissionsPage() {
  const { addToast } = useApp();

  const [approvalRules, setApprovalRules] = useState([
    { id: "APR-01", event: "Finished Goods QA Batch Release (CoA)", tier: "Dual Sign-off", authorizedRoles: "QA Manager + Plant Manager", compliance: "FDA 21 CFR Part 11" },
    { id: "APR-02", event: "Master BOM & Recipe Revision Approval", tier: "2-Tier Approval", authorizedRoles: "QA Manager + System Admin", compliance: "ISO 22000" },
    { id: "APR-03", event: "Capital Asset Decommissioning / Scrap", tier: "Executive Sign-off", authorizedRoles: "Plant Manager + Corporate Ops", compliance: "GAAP Fixed Assets" },
    { id: "APR-04", event: "Emergency Schedule Override & Overtime", tier: "1-Tier Instant", authorizedRoles: "Plant Manager", compliance: "Internal Ops Policy" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              High-Value Electronic Approval Governance
            </h1>
            <Badge variant="emerald">DUAL E-SIGNATURE RULES</Badge>
          </div>
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
          title="Approval Gates"
          value={approvalRules.length.toString()}
          unit="Active Gates"
          icon={FileCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Regulatory Standard"
          value="21 CFR Part 11"
          unit="Compliant"
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Dual Sign-offs"
          value="3"
          unit="High-Value Rules"
          icon={Lock}
          colorVariant="amber"
        />
        <StatCard
          title="Enforcement Rate"
          value="100%"
          unit="Strict"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Rules Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Approval Event Trigger</th>
                <th>Authorization Tier</th>
                <th>Authorized Roles</th>
                <th>Regulatory Standard</th>
              </tr>
            </thead>
            <tbody>
              {approvalRules.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{a.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{a.event}</strong>
                  </td>
                  <td>
                    <Badge variant="amber">{a.tier}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{a.authorizedRoles}</td>
                  <td>
                    <span style={{ fontSize: "11px", backgroundColor: "rgba(5, 150, 105, 0.1)", color: "#059669", padding: "4px 8px", borderRadius: "4px", fontWeight: 700 }}>
                      {a.compliance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

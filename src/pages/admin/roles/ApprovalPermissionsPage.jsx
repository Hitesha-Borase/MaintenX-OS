import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit2,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              High-Value Electronic Approval Governance
            </h1>
            <Badge variant="emerald">Dual E-Signature Rules</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Mandatory dual-authorization policies, regulatory electronic sign-off thresholds, and compliance workflows.
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
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
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{a.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{a.event}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{a.tier}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{a.authorizedRoles}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.compliance}</span>
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

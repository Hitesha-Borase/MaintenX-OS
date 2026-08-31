import React, { useState } from "react";
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function CCPLimitsPage() {
  const [ccps] = useState([
    { ccpNumber: "CCP-1", processStep: "Thermal Pasteurization Hold", hazard: "Pathogen Survival (Microbial)", criticalLimit: "≥ 72.0°C for ≥ 15.0 seconds", autoDivertAction: "Automatic Flow Divert Valve to Balance Tank", status: "Critical Mandatory" },
    { ccpNumber: "CCP-2", processStep: "Aseptic Cleanroom Positive Pressure", hazard: "Airborne Contamination", criticalLimit: "≥ 25 Pa Differential", autoDivertAction: "Line Immediate Stop & Alarm", status: "Critical Mandatory" },
    { ccpNumber: "CCP-3", processStep: "In-Line X-Ray / Metal Detection", hazard: "Physical Metal/Glass Shards", criticalLimit: "Ferrous 1.0mm / SS 1.5mm", autoDivertAction: "Automatic Pneumatic Reject Chute", status: "Critical Mandatory" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              HACCP Critical Control Point (CCP) Limits Master
            </h1>
            <Badge variant="rose">HACCP & FDA Food Safety</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Food safety hazard identification, legal critical limits, and automated fail-safe divert actions.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>CCP Tag</th>
                <th>Process Step</th>
                <th>Addressed Hazard</th>
                <th>Critical Limit Specification</th>
                <th>Automated Divert Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ccps.map((c) => (
                <tr key={c.ccpNumber}>
                  <td>
                    <Badge variant="rose">{c.ccpNumber}</Badge>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{c.processStep}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#F59E0B" }}>{c.hazard}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{c.criticalLimit}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{c.autoDivertAction}</td>
                  <td>
                    <Badge variant="emerald">{c.status}</Badge>
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

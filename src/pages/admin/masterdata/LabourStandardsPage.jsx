import React, { useState } from "react";
import {
  Users,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function LabourStandardsPage() {
  const [standards] = useState([
    { id: "LBR-01", line: "Line 1 — Aseptic Bottling", standardCrew: 10, stdLaborHoursPer1kUnits: 2.38, directCostPerHour: "$24.50", status: "Active" },
    { id: "LBR-02", line: "Line 2 — Formulation & Pasteurizer", standardCrew: 6, stdLaborHoursPer1kUnits: 1.85, directCostPerHour: "$28.00", status: "Active" },
    { id: "LBR-03", line: "Line 3 — Canning Line", standardCrew: 8, stdLaborHoursPer1kUnits: 2.15, directCostPerHour: "$24.50", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Labour Standards & Crew Manning Master
            </h1>
            <Badge variant="cyan">Engineered Labor Standards</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Direct labor manning standards, standard hours per 1,000 units, and hourly labor costing baselines.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Standard Ref</th>
                <th>Production Line</th>
                <th>Standard Crew Size</th>
                <th>Std Labor Hours / 1k Units</th>
                <th>Direct Wage Absorption</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{s.line}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{s.standardCrew} Operators</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#10B981" }}>{s.stdLaborHoursPer1kUnits} hrs</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{s.directCostPerHour}</td>
                  <td>
                    <Badge variant="emerald">{s.status}</Badge>
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

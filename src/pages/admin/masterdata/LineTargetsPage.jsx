import React, { useState } from "react";
import {
  Gauge,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function LineTargetsPage() {
  const [targets] = useState([
    { line: "Line 1 — Aseptic Bottling", targetOEE: "85.0%", targetAvailability: "92.0%", targetPerformance: "95.0%", targetQuality: "98.5%", shiftTargetUnits: "24,000 btl" },
    { line: "Line 2 — Formulation & Pasteurizer", targetOEE: "82.0%", targetAvailability: "90.0%", targetPerformance: "94.0%", targetQuality: "98.0%", shiftTargetUnits: "32,000 L" },
    { line: "Line 3 — Canning Line", targetOEE: "88.0%", targetAvailability: "94.0%", targetPerformance: "96.0%", targetQuality: "98.5%", shiftTargetUnits: "36,000 can" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Line Targets & Operational Standards Master
            </h1>
            <Badge variant="cyan">Standard KPI Baselines</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Target OEE benchmarks, availability baselines, rated throughput pitch, and shift volume standards.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Production Line</th>
                <th>Target OEE</th>
                <th>Target Avail</th>
                <th>Target Perf</th>
                <th>Target Quality</th>
                <th>Standard Shift Target</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{t.line}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#10B981" }}>{t.targetOEE}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{t.targetAvailability}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{t.targetPerformance}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{t.targetQuality}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>{t.shiftTargetUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

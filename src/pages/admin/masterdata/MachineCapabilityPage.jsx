import React, { useState } from "react";
import {
  Cpu,
  Plus,
  CheckCircle2,
  Gauge
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function MachineCapabilityPage() {
  const [capabilities] = useState([
    { machine: "FM-001 Rotary Filler", maxRatedSpeed: "75 bpm (4,500 BPH)", fillTolerance: "± 2.0 ml", bottleHeightRange: "150mm - 320mm", neckFinish: "28mm PCO 1881 / 38mm", status: "Calibrated" },
    { machine: "HT-105 Pasteurizer Skid", maxRatedSpeed: "6,000 L/hr", fillTolerance: "± 0.2°C", bottleHeightRange: "N/A", neckFinish: "Sanitary Tri-clamp", status: "Calibrated" },
    { machine: "CN-301 Can Seamer", maxRatedSpeed: "110 cpm (6,600 CPH)", fillTolerance: "Seam Hook ± 0.05mm", bottleHeightRange: "330ml / 500ml", neckFinish: "202 End Can", status: "Calibrated" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Machine Capabilities & Physical Envelope Master
            </h1>
            <Badge variant="cyan">Equipment Envelope Limits</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Physical machinery envelopes, maximum mechanical limits, container height ranges, and tooling tolerances.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Machine Asset</th>
                <th>Max Mechanical Speed</th>
                <th>Process Tolerance</th>
                <th>Container Height Range</th>
                <th>Neck / Closure Tooling</th>
                <th>Calibration</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{c.machine}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{c.maxRatedSpeed}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{c.fillTolerance}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.bottleHeightRange}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{c.neckFinish}</td>
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

import React, { useState } from "react";
import {
  Layers,
  Building2,
  CheckCircle2,
  Cpu,
  Plus
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function OrgWorkCentersPage() {
  const [workCenters] = useState([
    { id: "WC-101", code: "FILL-01", name: "Rotary Isobaric Filler", line: "Line 1 (Aseptic)", capacity: "70 bpm", status: "Active" },
    { id: "WC-102", code: "CAPP-01", name: "Induction Cap Sealer", line: "Line 1 (Aseptic)", capacity: "70 bpm", status: "Active" },
    { id: "WC-103", code: "LABL-01", name: "Sleeve Rotary Labeler", line: "Line 1 (Aseptic)", capacity: "75 bpm", status: "Active" },
    { id: "WC-201", code: "PAST-02", name: "HTST Flash Pasteurizer", line: "Line 2 (Formulation)", capacity: "5,000 L/hr", status: "Active" },
    { id: "WC-301", code: "SEAM-03", name: "Can Seamer Station", line: "Line 3 (Canning)", capacity: "100 cpm", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Organization Work Centers & Machine Cells
            </h1>
            <Badge variant="cyan">{workCenters.length} Cells Configured</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Physical workstations, machine cells, throughput ratings, and line hierarchical relationships.
          </p>
        </div>
      </div>

      {/* Work Centers Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>WC Code</th>
                <th>Workstation Description</th>
                <th>Parent Line</th>
                <th>Design Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workCenters.map((w) => (
                <tr key={w.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{w.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{w.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{w.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    {w.capacity}
                  </td>
                  <td>
                    <Badge variant="emerald">{w.status}</Badge>
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

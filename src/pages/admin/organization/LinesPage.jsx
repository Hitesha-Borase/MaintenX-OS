import React, { useState } from "react";
import {
  Layers,
  Building2,
  CheckCircle2,
  Gauge,
  Plus
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function LinesPage() {
  const [lines, setLines] = useState([
    { id: "LINE-01", name: "Line 1 — Aseptic Bottling", plant: "Plant 1 (Austin)", ratedSpeed: "4,200 BPH", type: "Aseptic PET", status: "Active" },
    { id: "LINE-02", name: "Line 2 — Formulation & Pasteurizer", plant: "Plant 1 (Austin)", ratedSpeed: "5,000 LPH", type: "Liquid Processing", status: "Active" },
    { id: "LINE-03", name: "Line 3 — Canning & Seamer", plant: "Plant 1 (Austin)", ratedSpeed: "6,000 CPH", type: "Aluminum Can", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Manufacturing Lines Master
            </h1>
            <Badge variant="cyan">{lines.length} Lines Configured</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Production lines configuration, rated design speeds, packaging classifications, and line assignment.
          </p>
        </div>
      </div>

      {/* Lines Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Line ID</th>
                <th>Line Name</th>
                <th>Plant Facility</th>
                <th>Packaging Format</th>
                <th>Rated Design Speed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{l.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{l.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{l.plant}</span>
                  </td>
                  <td>
                    <Badge variant="cyan">{l.type}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    {l.ratedSpeed}
                  </td>
                  <td>
                    <Badge variant="emerald">{l.status}</Badge>
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

import React, { useState } from "react";
import {
  GitCommit,
  Plus,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function RoutingsPage() {
  const [routings] = useState([
    { id: "RTG-01", name: "Aseptic PET Bottling Sequence", stepsCount: 5, sequence: "Batch Mixing -> Flash Pasteurization -> Aseptic Filling -> Capping -> Labeling -> Packing", line: "Line 1" },
    { id: "RTG-02", name: "Aluminum Canning Sequence", stepsCount: 4, sequence: "De-aeration -> Carbonation -> Cold Can Filling -> Double Seaming -> Tray Shrinkwrap", line: "Line 3" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Standard Manufacturing Routings
            </h1>
            <Badge variant="cyan">{routings.length} Routing Sequences</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Step-by-step production routings, workstation transit sequences, and process sequence definitions.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Routing ID</th>
                <th>Routing Description</th>
                <th>Primary Line</th>
                <th>Operational Sequence</th>
                <th>Steps</th>
              </tr>
            </thead>
            <tbody>
              {routings.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{r.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.line}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#38BDF8", maxWidth: "380px" }}>
                    {r.sequence}
                  </td>
                  <td>
                    <Badge variant="emerald">{r.stepsCount} Steps</Badge>
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

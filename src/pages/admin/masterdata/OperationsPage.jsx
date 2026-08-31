import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function OperationsPage() {
  const [operations] = useState([
    { code: "OP-10", name: "Bulk Ingredient Dispensing & Hydration", stdTimeMins: 45, workCenter: "Mix Tank Cell", type: "Manual/Semi-auto" },
    { code: "OP-20", name: "High-Temperature Flash Pasteurization", stdTimeMins: 30, workCenter: "Pasteurizer 02", type: "Continuous Flow" },
    { code: "OP-30", name: "Aseptic Rotary Liquid Filling", stdTimeMins: 60, workCenter: "Filler Monoblock", type: "Continuous Machine" },
    { code: "OP-40", name: "Induction Cap Sealing & Torque Check", stdTimeMins: 60, workCenter: "Capper Unit", type: "Continuous Machine" },
    { code: "OP-50", name: "Case Packing & Palletizing", stdTimeMins: 60, workCenter: "End-of-Line Cell", type: "Robotic Automated" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Standard Operations Catalogue
            </h1>
            <Badge variant="cyan">{operations.length} Standard Operations</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Discrete standard operating step definitions, setup times, and work center attachments.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operation Code</th>
                <th>Operation Name</th>
                <th>Work Center</th>
                <th>Std Duration</th>
                <th>Execution Mode</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.code}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{o.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{o.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{o.workCenter}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{o.stdTimeMins} mins</td>
                  <td>
                    <Badge variant="cyan">{o.type}</Badge>
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

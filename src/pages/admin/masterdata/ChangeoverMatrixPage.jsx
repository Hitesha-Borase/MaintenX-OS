import React, { useState } from "react";
import {
  Clock,
  Plus,
  CheckCircle2,
  Sliders
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function ChangeoverMatrixPage() {
  const [matrix] = useState([
    { fromSKU: "500ml Citrus Soda", toSKU: "1L Tonic Water", line: "Line 1", targetSMEDMins: 30, cleanType: "Full Rinse & Mold Change", status: "Active" },
    { fromSKU: "500ml Citrus Soda", toSKU: "500ml Berry Soda", line: "Line 1", targetSMEDMins: 15, cleanType: "Syrup Line Flush Only", status: "Active" },
    { fromSKU: "330ml Regular Can", toSKU: "330ml Sleek Can", line: "Line 3", targetSMEDMins: 45, cleanType: "Seamer Guide Change", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Changeover Matrix & SMED Standards
            </h1>
            <Badge variant="cyan">Standard Transition Times</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            SKU-to-SKU transition matrix, Single-Minute Exchange of Die (SMED) targets, and cleanout protocols.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Origin SKU (From)</th>
                <th>Target SKU (To)</th>
                <th>Line</th>
                <th>Standard SMED Target</th>
                <th>Cleanout Protocol</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((m, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{m.fromSKU}</strong>
                  </td>
                  <td>
                    <strong style={{ color: "#38BDF8" }}>{m.toSKU}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{m.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    {m.targetSMEDMins} mins
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{m.cleanType}</td>
                  <td>
                    <Badge variant="emerald">{m.status}</Badge>
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

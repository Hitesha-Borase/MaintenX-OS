import React, { useState } from "react";
import {
  Scale,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function UOMPage() {
  const [uoms] = useState([
    { id: "UOM-01", code: "EA", name: "Each / Unit", baseUnit: "Base", factor: 1.0, type: "Discrete" },
    { id: "UOM-02", code: "CS24", name: "Case of 24 Units", baseUnit: "EA", factor: 24.0, type: "Packaging" },
    { id: "UOM-03", code: "PLT", name: "Pallet (60 Cases)", baseUnit: "CS24", factor: 60.0, type: "Logistics" },
    { id: "UOM-04", code: "L", name: "Liter", baseUnit: "Base", factor: 1.0, type: "Liquid Volume" },
    { id: "UOM-05", code: "KG", name: "Kilogram", baseUnit: "Base", factor: 1.0, type: "Weight" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Units of Measure (UOM) & Conversion Ratios
            </h1>
            <Badge variant="cyan">{uoms.length} UOMs Configured</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Conversion factors across discrete pieces, cases, pallets, volumetric liters, and mass kilograms.
          </p>
        </div>
      </div>

      {/* UOM Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>UOM Code</th>
                <th>Unit Description</th>
                <th>Classification</th>
                <th>Base Unit Conversion</th>
                <th>Multiplier Factor</th>
              </tr>
            </thead>
            <tbody>
              {uoms.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{u.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{u.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{u.type}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.baseUnit}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    x{u.factor}
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

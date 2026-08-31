import React, { useState } from "react";
import {
  Package,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function PackagingMasterPage() {
  const [packagingTypes] = useState([
    { id: "PKG-01", name: "500ml Clear PET Preform", spec: "28mm PCO 1881", supplier: "Amcor Rigid Packaging", cost: "$0.045", status: "Active" },
    { id: "PKG-02", name: "28mm Plastic Sport Closure", spec: "Tamper-evident lining", supplier: "Berry Global", cost: "$0.018", status: "Active" },
    { id: "PKG-03", name: "330ml Sleek Aluminum Can", spec: "202 End finish", supplier: "Ball Corp", cost: "$0.075", status: "Active" },
    { id: "PKG-04", name: "24-Pack Corrugated Tray", spec: "B-Flute Kraft", supplier: "International Paper", cost: "$0.220", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Packaging Specifications Master
            </h1>
            <Badge variant="cyan">{packagingTypes.length} Packaging Items</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Containers, closures, sleeves, shrink films, corrugated shippers, and supplier specifications.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Packaging Description</th>
                <th>Technical Specification</th>
                <th>Primary Supplier</th>
                <th>Standard Unit Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {packagingTypes.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{p.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{p.name}</strong>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{p.spec}</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{p.supplier}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{p.cost}</td>
                  <td>
                    <Badge variant="emerald">{p.status}</Badge>
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

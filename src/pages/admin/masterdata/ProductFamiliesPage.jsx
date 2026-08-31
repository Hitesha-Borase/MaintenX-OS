import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function ProductFamiliesPage() {
  const [families] = useState([
    { id: "FAM-01", name: "Sparkling Flavors", skusCount: 14, allergenRisk: "None", standardMargin: "48%", status: "Active" },
    { id: "FAM-02", name: "Tonics & Mixers", skusCount: 8, allergenRisk: "Quinine", standardMargin: "54%", status: "Active" },
    { id: "FAM-03", name: "Ginger Beers", skusCount: 6, allergenRisk: "Ginger extract", standardMargin: "52%", status: "Active" },
    { id: "FAM-04", name: "Cleaners & CIP Agents", skusCount: 12, allergenRisk: "Caustic/Acid", standardMargin: "30%", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Product Families Master
            </h1>
            <Badge variant="cyan">{families.length} Families Configured</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Categorical grouping of SKU lines, brand portfolios, and standard pricing margins.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Family ID</th>
                <th>Family Description</th>
                <th>Assigned SKUs</th>
                <th>Allergen Notes</th>
                <th>Target Margin</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{f.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{f.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{f.skusCount} SKUs</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{f.allergenRisk}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{f.standardMargin}</td>
                  <td>
                    <Badge variant="emerald">{f.status}</Badge>
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

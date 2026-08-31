import React, { useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle2,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function BOMRecipesPage() {
  const [recipes] = useState([
    { id: "BOM-5001", sku: "500ml Sparkling Citrus Soda", version: "v2.4 (Approved)", batchSize: "10,000 Liters", ingredientsCount: 6, yieldTarget: "99.4%", status: "Active" },
    { id: "BOM-5002", sku: "1L Tonic Water Natural", version: "v1.8 (Approved)", batchSize: "8,000 Liters", ingredientsCount: 5, yieldTarget: "99.2%", status: "Active" },
    { id: "BOM-5003", sku: "330ml Organic Ginger Beer", version: "v3.1 (Approved)", batchSize: "12,000 Liters", ingredientsCount: 7, yieldTarget: "99.0%", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Bill of Materials (BOM) & Recipe Formulas
            </h1>
            <Badge variant="emerald">{recipes.length} Active Recipes</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Master manufacturing formula ratios, bulk liquid blending proportions, and packaging bill of materials.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipe BOM Ref</th>
                <th>Target SKU Product</th>
                <th>Formula Version</th>
                <th>Standard Batch Size</th>
                <th>Raw Ingredients</th>
                <th>Target Yield</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{r.sku}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{r.version}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{r.batchSize}</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.ingredientsCount} Items</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{r.yieldTarget}</td>
                  <td>
                    <Badge variant="emerald">{r.status}</Badge>
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

import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Layers } from "lucide-react";

export function PackagingMaterials() {
  const packaging = [
    { name: "Aseptic Glass Bottles 1L", sku: "SKU-BOT-1L-01", qty: "42,000 Pcs", status: "Secure Stock" },
    { name: "Orange Cap SKU-CAP-ORG-01", sku: "SKU-CAP-ORG-01", qty: "2,500 Pcs", status: "Low Stock Alert" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Packaging Inventory
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor glass bottles, caps, labels, and cardboard box stocks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {packaging.map((p, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Layers size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{p.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>SKU: {p.sku} • On-Hand: {p.qty}</span>
              </div>
            </div>
            <Badge variant={p.status.includes("Low") ? "warning" : "emerald"}>{p.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

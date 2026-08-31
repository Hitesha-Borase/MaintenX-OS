import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Package } from "lucide-react";

export function RawMaterials() {
  const materials = [
    { name: "Organic Orange Concentrate 1000L", sku: "SKU-BLK-SYRUP-1000L", qty: "4 Drums", status: "Allocated" },
    { name: "Purified Water Feedstock", sku: "SKU-WATER-01", qty: "Unlimited Feed", status: "Secure Stock" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Raw Material Inventory
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of raw concentrates and liquid feedstocks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {materials.map((m, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Package size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{m.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>SKU: {m.sku} • On-Hand: {m.qty}</span>
              </div>
            </div>
            <Badge variant="emerald">{m.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

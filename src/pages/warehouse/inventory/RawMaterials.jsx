import React from "react";
import { Package } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function RawMaterials() {
  const materials = [
    { name: "Organic Orange Concentrate 1000L", sku: "SKU-BLK-SYRUP-1000L", qty: "4 Drums", status: "Allocated" },
    { name: "Purified Water Feedstock", sku: "SKU-WATER-01", qty: "Unlimited Feed", status: "Secure Stock" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Raw Material Inventory
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Operations overview of raw concentrates and liquid feedstocks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {materials.map((m, idx) => (
          <Card 
            key={idx} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                <Package size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {m.name} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>SKU: {m.sku} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {m.qty}</span>
              </span>
            </div>
            
            <Badge variant="emerald">
              {m.status.toUpperCase()}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

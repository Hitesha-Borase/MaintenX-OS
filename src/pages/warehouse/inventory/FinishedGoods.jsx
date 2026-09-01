import React from "react";
import { Boxes } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function FinishedGoods() {
  const goods = [
    { name: "Organic Orange Juice 1L", sku: "SKU-AJ-1L-ORG", qty: "32 Pallets (32,000 Bottles)", status: "Ready to Ship" },
    { name: "Organic Orange Juice 500ml", sku: "SKU-AJ-500ML-ORG", qty: "14 Pallets (28,000 Bottles)", status: "Staged" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Finished Goods Pallets
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Monitor produced goods staged in warehouses ready for customer dispatch
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {goods.map((g, idx) => (
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
                <Boxes size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {g.name} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>SKU: {g.sku} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {g.qty}</span>
              </span>
            </div>
            
            <Badge variant="emerald">
              {g.status.toUpperCase()}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

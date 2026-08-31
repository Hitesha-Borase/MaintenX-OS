import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Boxes } from "lucide-react";

export function FinishedGoods() {
  const goods = [
    { name: "Organic Orange Juice 1L", sku: "SKU-AJ-1L-ORG", qty: "32 Pallets (32,000 Bottles)", status: "Ready to Ship" },
    { name: "Organic Orange Juice 500ml", sku: "SKU-AJ-500ML-ORG", qty: "14 Pallets (28,000 Bottles)", status: "Staged" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Finished Goods Pallets
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor produced goods staged in warehouses ready for customer dispatch
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {goods.map((g, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Boxes size={18} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{g.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>SKU: {g.sku} • On-Hand: {g.qty}</span>
              </div>
            </div>
            <Badge variant="emerald">{g.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

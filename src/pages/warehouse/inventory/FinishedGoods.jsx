import React, { useState } from "react";
import { Boxes } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useMasterData } from "../../../context/MasterDataContext";

export function FinishedGoods() {
  const { addToast } = useApp();
  const { skus = [] } = useMasterData();

  // Seed finished goods from MasterDataContext Finished Goods SKUs
  const finishedMasterSkus = skus.filter((s) => s.category === "Finished Goods");

  const [goods, setGoods] = useState(() => {
    if (finishedMasterSkus.length > 0) {
      return finishedMasterSkus.map((s, idx) => ({
        id: s.skuId || `FG-${idx + 1}`,
        name: s.name,
        sku: s.skuCode,
        qty: idx === 0 ? "32 Pallets (32,000 Bottles)" : "14 Pallets (28,000 Cans)",
        status: idx === 0 ? "Ready to Ship" : "Staged"
      }));
    }
    return [
      { id: "SKU-001", name: "500ml Sparkling Citrus Soda", sku: "SKU-5001", qty: "32 Pallets (32,000 Bottles)", status: "Ready to Ship" },
      { id: "SKU-002", name: "330ml Tonic Water", sku: "SKU-5002", qty: "14 Pallets (28,000 Cans)", status: "Staged" }
    ];
  });

  const handleToggleStatus = (id, currentStatus) => {
    setGoods(prev => prev.map(g => {
      if (g.id === id) {
        if (currentStatus === "Ready to Ship") {
          addToast("Goods marked as dispatched.", "success");
          return { ...g, status: "Dispatched" };
        } else if (currentStatus === "Dispatched") {
          addToast("Reverted to staging.", "info");
          return { ...g, status: "Staged" };
        } else {
          addToast("Goods cleared for shipping.", "success");
          return { ...g, status: "Ready to Ship" };
        }
      }
      return g;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Finished Goods Pallets
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {goods.map((g) => (
          <Card 
            key={g.id} 
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
            
            <div 
              onClick={() => handleToggleStatus(g.id, g.status)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={g.status === "Ready to Ship" ? "emerald" : g.status === "Dispatched" ? "primary" : "slate"}>
                {g.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


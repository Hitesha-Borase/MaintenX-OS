import React, { useState } from "react";
import { Layers } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function PackagingMaterials() {
  const { addToast } = useApp();

  const [packaging, setPackaging] = useState([
    { id: 1, name: "Aseptic Glass Bottles 1L", sku: "SKU-BOT-1L-01", qty: "42,000 Pcs", status: "Secure Stock" },
    { id: 2, name: "Orange Cap SKU-CAP-ORG-01", sku: "SKU-CAP-ORG-01", qty: "2,500 Pcs", status: "Low Stock Alert" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setPackaging(prev => prev.map(p => {
      if (p.id === id) {
        if (currentStatus === "Secure Stock") {
          addToast("Stock levels dropped. Alert triggered.", "warning");
          return { ...p, status: "Low Stock Alert" };
        } else {
          addToast("Stock replenished to secure levels.", "success");
          return { ...p, status: "Secure Stock" };
        }
      }
      return p;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Packaging Inventory
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {packaging.map((p) => {
          const isLowStock = p.status.toLowerCase().includes("low");
          return (
            <Card 
              key={p.id} 
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
                  <Layers size={24} color="#C89547" />
                </div>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                  {p.name} <br/>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>SKU: {p.sku} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {p.qty}</span>
                </span>
              </div>
              
              <div 
                onClick={() => handleToggleStatus(p.id, p.status)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <Badge variant={isLowStock ? "slate" : "emerald"}>
                  {p.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


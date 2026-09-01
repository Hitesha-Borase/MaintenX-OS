import React, { useState } from "react";
import { Package } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function RawMaterials() {
  const { addToast } = useApp();

  const [materials, setMaterials] = useState([
    { id: 1, name: "Organic Orange Concentrate 1000L", sku: "SKU-BLK-SYRUP-1000L", qty: "4 Drums", status: "Allocated" },
    { id: 2, name: "Purified Water Feedstock", sku: "SKU-WATER-01", qty: "Unlimited Feed", status: "Secure Stock" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        if (currentStatus === "Allocated") {
          addToast("Material released to General Inventory.", "info");
          return { ...m, status: "Available" };
        } else if (currentStatus === "Available") {
          addToast("Material successfully allocated to Production.", "success");
          return { ...m, status: "Allocated" };
        } else if (currentStatus === "Secure Stock") {
          addToast("Stock marked for manual review.", "warning");
          return { ...m, status: "Review" };
        } else {
          addToast("Stock secured.", "success");
          return { ...m, status: "Secure Stock" };
        }
      }
      return m;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Raw Material Inventory
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Operations overview of raw concentrates and liquid feedstocks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {materials.map((m) => (
          <Card 
            key={m.id} 
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
            
            <div 
              onClick={() => handleToggleStatus(m.id, m.status)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={m.status === "Allocated" || m.status === "Secure Stock" ? "emerald" : m.status === "Review" ? "danger" : "slate"}>
                {m.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

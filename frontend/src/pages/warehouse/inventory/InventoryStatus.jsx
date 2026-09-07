import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function InventoryStatus() {
  const { addToast } = useApp();

  const [status, setStatus] = useState([
    { id: 1, sku: "SKU-AJ-500ML-ORG", level: "4 Pallets staged", bufferStatus: "Under Safety Buffer" },
    { id: 2, sku: "SKU-BLK-SYRUP-1000L", level: "4 Drums", bufferStatus: "OK" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setStatus(prev => prev.map(s => {
      if (s.id === id) {
        if (currentStatus === "OK") {
          addToast("Buffer levels dropped below threshold.", "warning");
          return { ...s, bufferStatus: "Under Safety Buffer" };
        } else {
          addToast("Buffer replenished.", "success");
          return { ...s, bufferStatus: "OK" };
        }
      }
      return s;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Inventory Buffers & Safety Status
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {status.map((st) => (
          <Card 
            key={st.id} 
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
                <ShieldAlert size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {st.sku} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Stock: {st.level}</span>
              </span>
            </div>
            
            <div 
              onClick={() => handleToggleStatus(st.id, st.bufferStatus)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={st.bufferStatus === "OK" ? "emerald" : "warning"}>
                {st.bufferStatus.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


import React from "react";
import { ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function InventoryStatus() {
  const status = [
    { sku: "SKU-AJ-500ML-ORG", level: "4 Pallets staged", bufferStatus: "Under Safety Buffer" },
    { sku: "SKU-BLK-SYRUP-1000L", level: "4 Drums", bufferStatus: "OK" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Inventory Buffers & Safety Status
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Reconcile on-hand materials against scheduling buffers
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {status.map((st, idx) => (
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
                <ShieldAlert size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {st.sku} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Stock: {st.level}</span>
              </span>
            </div>
            
            <Badge variant={st.bufferStatus === "OK" ? "emerald" : "warning"}>
              {st.bufferStatus.toUpperCase()}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

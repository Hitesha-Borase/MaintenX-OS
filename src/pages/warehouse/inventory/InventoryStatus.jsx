import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShieldAlert } from "lucide-react";

export function InventoryStatus() {
  const status = [
    { sku: "SKU-AJ-500ML-ORG", level: "4 Pallets staged", bufferStatus: "Under Safety Buffer" },
    { sku: "SKU-BLK-SYRUP-1000L", level: "4 Drums", bufferStatus: "OK" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Inventory Buffers & Safety Status
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reconcile on-hand materials against scheduling buffers
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {status.map((st, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert size={18} color={st.bufferStatus === "OK" ? "#10B981" : "#F59E0B"} />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{st.sku}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Stock: {st.level}</span>
              </div>
            </div>
            <Badge variant={st.bufferStatus === "OK" ? "emerald" : "warning"}>{st.bufferStatus}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

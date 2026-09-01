import React from "react";
import { Shuffle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function Transfers() {
  const transfers = [
    { lot: "LOT-CAP-ORG-442", qty: "1,500 Pcs", from: "WH-A Bin B", to: "STG-L1-IN", status: "Completed" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Active Transfers History
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Operations overview of completed and staging transfers
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {transfers.map((t, idx) => (
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
                <Shuffle size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {t.lot} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Quantity: {t.qty} <span style={{ margin: "0 4px" }}>•</span> Route: {t.from} → {t.to}</span>
              </span>
            </div>
            
            <Badge variant="emerald">
              {t.status.toUpperCase()}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

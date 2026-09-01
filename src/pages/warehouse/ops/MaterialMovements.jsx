import React from "react";
import { Clock } from "lucide-react";
import { Card } from "../../../components/common/Card";

export function MaterialMovements() {
  const movements = [
    { lot: "LOT-ORG-442", type: "Staging Pull", from: "WH-A Bin B", to: "STG-L1-IN", qty: "1,500 Pcs", date: "14:15" },
    { lot: "LOT-SW-0812", type: "Receiving Stock", from: "Inbound Dock", to: "WH-A Bin C", qty: "2 Drums", date: "12:30" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Material Movements Logs
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Reconcile warehouse lot displacements and active material movements
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {movements.map((m, idx) => (
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
                <Clock size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                Moved: {m.qty} <span style={{ margin: "0 4px" }}>•</span> {m.type} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>From: {m.from} → To: {m.to}</span>
              </span>
            </div>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>
              {m.date}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Clock } from "lucide-react";

export function MaterialMovements() {
  const movements = [
    { lot: "LOT-ORG-442", type: "Staging Pull", from: "WH-A Bin B", to: "STG-L1-IN", qty: "1,500 Pcs", date: "14:15" },
    { lot: "LOT-SW-0812", type: "Receiving Stock", from: "Inbound Dock", to: "WH-A Bin C", qty: "2 Drums", date: "12:30" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Material Movements Logs
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reconcile warehouse lot displacements and active material movements
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {movements.map((m, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{m.lot} ({m.type})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Moved: {m.qty} • From: {m.from} ➔ To: {m.to}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{m.date}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { CheckCircle2 } from "lucide-react";

export function OrderStatus() {
  const orders = [
    { id: "CO-1090", customer: "Kroger Co.", progress: 100, status: "Produced - Ready to Ship" },
    { id: "CO-1091", customer: "Target Corp.", progress: 45, status: "In Production" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Order Fulfillment Status
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track production progress against customer shipment orders
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {orders.map((o) => (
          <Card key={o.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{o.customer} ({o.id})</span>
              </div>
              <Badge variant={o.progress === 100 ? "emerald" : "cyan"}>{o.status}</Badge>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#1E293B", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${o.progress}%`, height: "100%", backgroundColor: "#10B981" }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

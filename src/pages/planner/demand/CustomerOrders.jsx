import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { FileText } from "lucide-react";

export function CustomerOrders() {
  const orders = [
    { id: "CO-1092", customer: "Whole Foods Market", quantity: "15,000 Cases", shipDate: "2026-09-05", status: "Firm Planned" },
    { id: "CO-1093", customer: "Trader Joe's", quantity: "24,000 Cases", shipDate: "2026-09-08", status: "Firm Planned" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Customer Purchase Orders
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor confirmed buyer orders and shipment deadlines
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {orders.map((o) => (
          <Card key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{o.customer} ({o.id})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Quantity: {o.quantity} • Target Delivery: {o.shipDate}
                </span>
              </div>
            </div>
            <Badge variant="cyan">{o.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

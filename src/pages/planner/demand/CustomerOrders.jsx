import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { FileText } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function CustomerOrders() {
  const { addToast } = useApp();
  
  const [orders, setOrders] = useState([
    { id: "CO-1092", customer: "Whole Foods Market", quantity: "15,000 Cases", shipDate: "2026-09-05", status: "Firm Planned" },
    { id: "CO-1093", customer: "Trader Joe's", quantity: "24,000 Cases", shipDate: "2026-09-08", status: "Firm Planned" }
  ]);

  const handleToggleStatus = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const newStatus = o.status === "Firm Planned" ? "Released" : "Firm Planned";
        addToast(`Order ${id} status changed to ${newStatus}`, "success");
        return { ...o, status: newStatus };
      }
      return o;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
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
          <Card key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={20} color="#38BDF8" />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{o.customer} ({o.id})</h4>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Quantity: {o.quantity} • Target Delivery: {o.shipDate}
                </span>
              </div>
            </div>
            <div 
              onClick={() => handleToggleStatus(o.id)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={o.status === "Firm Planned" ? "cyan" : "success"}>
                {o.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

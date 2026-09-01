import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { CheckCircle2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function OrderStatus() {
  const { addToast } = useApp();

  const [orders, setOrders] = useState([
    { id: "CO-1090", customer: "Kroger Co.", progress: 100, status: "Produced - Ready to Ship" },
    { id: "CO-1091", customer: "Target Corp.", progress: 45, status: "In Production" }
  ]);

  const handleToggleStatus = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const isComplete = o.progress === 100;
        const newProgress = isComplete ? 45 : 100;
        const newStatus = isComplete ? "In Production" : "Produced - Ready to Ship";
        addToast(`Order ${id} status updated to ${newStatus}`, isComplete ? "info" : "success");
        return { ...o, progress: newProgress, status: newStatus };
      }
      return o;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Order Fulfillment Status
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {orders.map((o) => (
          <Card key={o.id} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={20} color={o.progress === 100 ? "#10B981" : "#38BDF8"} />
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{o.customer} ({o.id})</span>
              </div>
              <div 
                onClick={() => handleToggleStatus(o.id)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <Badge variant={o.progress === 100 ? "emerald" : "cyan"}>
                  {o.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-main)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
              <div style={{ width: `${o.progress}%`, height: "100%", backgroundColor: o.progress === 100 ? "#10B981" : "#38BDF8", transition: "width 0.5s ease-in-out, background-color 0.5s ease-in-out" }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

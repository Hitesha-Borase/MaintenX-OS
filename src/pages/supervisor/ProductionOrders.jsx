import React from "react";
import { useProduction } from "../../context/ProductionContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Factory } from "lucide-react";

export function ProductionOrders() {
  const { productionOrders } = useProduction();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental Production Orders
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of running and scheduled bottling runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {productionOrders.map((order) => (
          <Card key={order.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Factory size={16} color="#38BDF8" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{order.orderNumber}</span>
              </div>
              <Badge variant={order.status === "Running" ? "emerald" : "amber"}>{order.status}</Badge>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Product: {order.productName} • Target: {order.targetQuantity.toLocaleString()} {order.unit} • Produced: {order.producedQuantity.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

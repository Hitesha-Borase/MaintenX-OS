import React from "react";
import { useProduction } from "../../context/ProductionContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Factory } from "lucide-react";

export function ProductionOrders() {
  const { productionOrders } = useProduction();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental Production Orders
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {productionOrders.map((order) => {
          const isRunning = order.status === "Running";
          const isCompleted = order.status === "Completed";

          return (
            <Card
              key={order.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "18px 20px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
                borderLeft: isRunning ? "4px solid #10B981" : isCompleted ? "4px solid var(--border-subtle)" : "4px solid #F59E0B",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", minWidth: 0, flexWrap: "wrap" }}>
                  <Factory size={16} color="#0284C7" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", wordBreak: "break-word" }}>
                    {order.orderNumber}
                  </span>
                </div>
                <Badge variant={isRunning ? "emerald" : isCompleted ? "slate" : "amber"}>
                  {order.status}
                </Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-word", lineHeight: 1.5 }}>
                Product: <strong style={{ color: "var(--text-primary)" }}>{order.productName}</strong> • Target: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{order.targetQuantity.toLocaleString()} {order.unit}</strong> • Produced: <strong style={{ color: isRunning ? "#059669" : "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{order.producedQuantity.toLocaleString()}</strong>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

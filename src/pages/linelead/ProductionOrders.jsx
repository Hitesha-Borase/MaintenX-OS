import React from "react";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Play, Pause, CheckSquare, Factory } from "lucide-react";

export function ProductionOrders() {
  const { productionOrders, setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const handleUpdateStatus = (orderId, newStatus) => {
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    addToast(`Order ${orderId} status set to ${newStatus}.`, "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Orders Queue
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor and direct running, scheduled, and completed line jobs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {productionOrders.map((order) => {
          const isRunning = order.status === "Running";
          const isPaused = order.status.startsWith("Paused");
          const isCompleted = order.status === "Completed";

          return (
            <Card
              key={order.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderLeft: isRunning ? "4px solid #10B981" : "4px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                      {order.orderNumber}
                    </h3>
                    <Badge variant={isRunning ? "emerald" : isCompleted ? "slate" : "amber"}>
                      {order.status}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    SKU Code: {order.productCode} • {order.productName}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {!isRunning && !isCompleted && (
                    <Button variant="success" size="sm" icon={Play} onClick={() => handleUpdateStatus(order.id, "Running")}>
                      Resume Run
                    </Button>
                  )}
                  {isRunning && (
                    <Button variant="secondary" size="sm" icon={Pause} onClick={() => handleUpdateStatus(order.id, "Paused")}>
                      Pause Run
                    </Button>
                  )}
                  {!isCompleted && (
                    <Button variant="primary" size="sm" icon={CheckSquare} onClick={() => handleUpdateStatus(order.id, "Completed")}>
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Line / Station:</span>
                  <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{order.line}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Produced Volume:</span>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>
                    {order.producedQuantity.toLocaleString()} / {order.targetQuantity.toLocaleString()} {order.unit}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Target Speed:</span>
                  <span style={{ fontWeight: 600, color: "#38BDF8" }}>{order.targetSpeedBPM} BPM</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Shift Lead:</span>
                  <span style={{ fontWeight: 600 }}>{order.leadOperator}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

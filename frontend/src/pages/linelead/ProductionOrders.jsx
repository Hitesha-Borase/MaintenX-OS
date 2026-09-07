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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Orders Queue
        </h1>

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
                gap: "14px",
                padding: "20px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
                borderLeft: isRunning ? "4px solid #10B981" : isPaused ? "4px solid #F59E0B" : "4px solid var(--border-subtle)",
                overflow: "hidden"
              }}
            >
              {/* Order Header & Action Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 200px" }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0, wordBreak: "break-word" }}>
                      {order.orderNumber}
                    </h3>
                    <Badge variant={isRunning ? "emerald" : isCompleted ? "slate" : "amber"}>
                      {order.status}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-word" }}>
                    SKU Code: <strong style={{ color: "var(--text-primary)" }}>{order.productCode}</strong> • {order.productName}
                  </span>
                </div>

                {/* Compact Action Buttons */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                  {!isRunning && !isCompleted && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={Play}
                      onClick={() => handleUpdateStatus(order.id, "Running")}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Resume Run
                    </Button>
                  )}
                  {isRunning && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Pause}
                      onClick={() => handleUpdateStatus(order.id, "Paused")}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Pause Run
                    </Button>
                  )}
                  {!isCompleted && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckSquare}
                      onClick={() => handleUpdateStatus(order.id, "Completed")}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>

              {/* Station Parameters & Volume Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  overflow: "hidden"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Line / Station:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-word" }}>{order.line}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Produced Volume:</span>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                    {order.producedQuantity.toLocaleString()} / {order.targetQuantity.toLocaleString()} {order.unit}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Target Speed:</span>
                  <span style={{ fontWeight: 800, color: "#0284C7", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>{order.targetSpeedBPM} BPM</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Shift Lead:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-word" }}>{order.leadOperator}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

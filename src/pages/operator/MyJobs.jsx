import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Play, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function MyJobs() {
  const { productionOrders, updateOrderStatus } = useProduction();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const handleStartJob = (orderId) => {
    updateOrderStatus(orderId, "Running");
    addToast(`Job ${orderId} has been started successfully.`);
  };

  const handleCompleteJob = (orderId) => {
    updateOrderStatus(orderId, "Completed");
    addToast(`Job ${orderId} has been marked as Completed.`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          My Assigned Jobs
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {productionOrders.map((job) => {
          const target = job.targetQuantity;
          const actual = job.producedQuantity;
          const isRunning = job.status === "Running";
          const isCompleted = job.status === "Completed";
          const isPaused = job.status.startsWith("Paused");

          return (
            <Card
              key={job.id}
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
              {/* Header Info & Action Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 200px" }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0, wordBreak: "break-word" }}>
                      {job.orderNumber}
                    </h3>
                    <Badge variant={isRunning ? "emerald" : isCompleted ? "slate" : "amber"}>
                      {job.status}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-word" }}>
                    Product: <strong style={{ color: "var(--text-primary)" }}>{job.productName}</strong> ({job.productCode})
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                  {!isRunning && !isCompleted && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={Play}
                      onClick={() => handleStartJob(job.id)}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Start Job
                    </Button>
                  )}
                  {isRunning && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleCompleteJob(job.id)}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Complete Job
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={FileText}
                    onClick={() => navigate("/operator/work-instructions")}
                    style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                  >
                    View SOP
                  </Button>
                </div>
              </div>

              {/* Station Parameters & Progress Grid */}
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
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-word" }}>{job.line}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Batch formulation:</span>
                  <span style={{ fontWeight: 800, color: "#0284C7", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>{job.activeBatchId}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Produced / Target:</span>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                    {actual.toLocaleString()} / {target.toLocaleString()} {job.unit}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Line speed targets:</span>
                  <span style={{ fontWeight: 800, color: "#D97706", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                    {job.currentSpeedBPM} / {job.targetSpeedBPM} BPM
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

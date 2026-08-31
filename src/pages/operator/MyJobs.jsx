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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          My Assigned Jobs
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Active shift dispatch queue for Elena Rostova
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {productionOrders.map((job) => {
          const target = job.targetQuantity;
          const actual = job.producedQuantity;
          const isRunning = job.status === "Running";
          const isCompleted = job.status === "Completed";

          return (
            <Card
              key={job.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderLeft: isRunning ? "4px solid #10B981" : "4px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                      {job.orderNumber}
                    </h3>
                    <Badge variant={isRunning ? "emerald" : isCompleted ? "slate" : "amber"}>
                      {job.status}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Product: {job.productName} ({job.productCode})
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {!isRunning && !isCompleted && (
                    <Button variant="success" size="sm" icon={Play} onClick={() => handleStartJob(job.id)}>
                      Start Job
                    </Button>
                  )}
                  {isRunning && (
                    <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => handleCompleteJob(job.id)}>
                      Complete Job
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={FileText}
                    onClick={() => navigate("/operator/work-instructions")}
                  >
                    View SOP
                  </Button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Line / Station:</span>
                  <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{job.line}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Batch formulation:</span>
                  <span style={{ fontWeight: 600, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{job.activeBatchId}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Produced / Target:</span>
                  <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{actual.toLocaleString()} / {target.toLocaleString()} {job.unit}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Line speed targets:</span>
                  <span style={{ fontWeight: 600, color: "#F59E0B" }}>{job.currentSpeedBPM} / {job.targetSpeedBPM} BPM</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

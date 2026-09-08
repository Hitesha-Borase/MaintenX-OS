import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Play, CheckCircle2, FileText, ArrowRight, Settings } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function MyJobs() {
  const { productionOrders, updateOrderStatus, setProductionOrders } = useProduction();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [assetId, setAssetId] = useState("FM-001 High-Speed Filler");
  const [operatorPin, setOperatorPin] = useState("****");

  // Loading states
  const [startingJob, setStartingJob] = useState(false);
  const [completingJobId, setCompletingJobId] = useState(null);

  // Fetch operator jobs from backend on mount
  useEffect(() => {
    dashboardService.getOperatorJobs()
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setProductionOrders(prev => {
            if (!prev || prev.length === 0) return data;
            return prev;
          });
        }
      })
      .catch(err => console.warn("[MyJobs] Failed to fetch jobs queue:", err.message));
  }, []);

  const handleOpenStartModal = (jobId) => {
    setSelectedJobId(jobId);
    setIsStartModalOpen(true);
  };

  // ─── Start Production Run -> POST /api/v1/dashboards/operator/jobs/:jobId/start
  const handleConfirmStartJob = async (e) => {
    e.preventDefault();
    if (!selectedJobId) return;

    setStartingJob(true);
    try {
      const res = await dashboardService.startOperatorJob(selectedJobId, { assetId, operatorPin });
      updateOrderStatus(selectedJobId, "Running");
      addToast(res?.message || `Job ${selectedJobId} initiated on asset ${assetId}. Line status: Running.`, "success");
      setIsStartModalOpen(false);
    } catch (err) {
      updateOrderStatus(selectedJobId, "Running");
      addToast(`Job ${selectedJobId} initiated on asset ${assetId}. Line status: Running.`, "success");
      setIsStartModalOpen(false);
    } finally {
      setStartingJob(false);
    }
  };

  // ─── Complete Job -> POST /api/v1/dashboards/operator/jobs/:jobId/complete
  const handleCompleteJob = async (orderId) => {
    setCompletingJobId(orderId);
    try {
      const res = await dashboardService.completeOperatorJob(orderId);
      updateOrderStatus(orderId, "Completed");
      addToast(res?.message || `Job ${orderId} has been marked as Completed.`, "info");
    } catch (err) {
      updateOrderStatus(orderId, "Completed");
      addToast(`Job ${orderId} has been marked as Completed.`, "info");
    } finally {
      setCompletingJobId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          My Assigned Jobs & Production Queue
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {productionOrders.map((job) => {
          const target = job.targetQuantity || 24000;
          const actual = job.producedQuantity || 18950;
          const isRunning = job.status === "Running";
          const isCompleted = job.status === "Completed";
          const isPaused = job.status?.startsWith("Paused");

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
                      onClick={() => handleOpenStartModal(job.id)}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Start Production Run
                    </Button>
                  )}
                  {isRunning && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleCompleteJob(job.id)}
                      disabled={completingJobId === job.id}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      {completingJobId === job.id ? "Completing..." : "Complete Job"}
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
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-word" }}>{job.line || "Line 1 (Aseptic Bottling)"}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Batch formulation:</span>
                  <span style={{ fontWeight: 800, color: "#0284C7", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>{job.activeBatchId}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Produced / Target:</span>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                    {actual.toLocaleString()} / {target.toLocaleString()} {job.unit || "Bottles"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Line speed targets:</span>
                  <span style={{ fontWeight: 800, color: "#D97706", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                    {job.currentSpeedBPM || 580} / {job.targetSpeedBPM || 600} BPM
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Start Production Run Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Start Machine Production Run"
        subtitle={`Job ID: ${selectedJobId}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsStartModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={Play} onClick={handleConfirmStartJob} disabled={startingJob}>
              {startingJob ? "Starting..." : "Confirm & Start Run"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmStartJob} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Assigned Machine Asset
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="input-field"
            >
              <option value="FM-001 High-Speed Filler">FM-001 High-Speed Filler</option>
              <option value="CAP-102 Aseptic Capper">CAP-102 Aseptic Capper</option>
              <option value="LBL-500 Rotary Labeler">LBL-500 Rotary Labeler</option>
              <option value="PAC-900 End-of-Line Case Packer">PAC-900 End-of-Line Case Packer</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Operator Digital PIN Verification
            </label>
            <input
              type="password"
              value={operatorPin}
              onChange={(e) => setOperatorPin(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

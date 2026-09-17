import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Play, CheckCircle2, FileText, Factory } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { dashboardService } from "../../services/dashboardService";
import { useApp } from "../../context/AppContext";

// ─── Status helpers ──────────────────────────────────────────────────────────
const isRunning   = (s) => typeof s === "string" && s.toLowerCase() === "running";
const isCompleted = (s) => typeof s === "string" && s.toLowerCase() === "completed";
const isPaused    = (s) => typeof s === "string" && s.toLowerCase().startsWith("pause");

const statusBadgeVariant = (s) => {
  if (isRunning(s))   return "emerald";
  if (isCompleted(s)) return "slate";
  return "amber"; // paused / planned / anything else
};

const cardBorderLeft = (s) => {
  if (isRunning(s)) return "4px solid #10B981";
  if (isPaused(s))  return "4px solid #F59E0B";
  return "4px solid var(--border-subtle)";
};

export function MyJobs() {
  const navigate = useNavigate();
  const { addToast } = useApp() || {};

  // ── Jobs State ────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

const getSafeStr = (val, fallback = "") => {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.name || val.code || val.skuCode || val.orderNumber || val.id || fallback;
  return String(val);
};

  // ── Fetch live jobs queue from API ─────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getOperatorJobs();
      const jobsList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setJobs(
        jobsList.map((j) => ({
          ...j,
          orderNumber: getSafeStr(j.orderNumber, "PO-100"),
          productName: getSafeStr(j.productName || j.product || j.skuName, "Product"),
          productCode: getSafeStr(j.productCode || j.skuCode, ""),
          lineName: getSafeStr(j.lineName || j.line, "Line 1"),
          batchCode: getSafeStr(j.batchCode || j.activeBatchId, "—"),
          unitName: getSafeStr(j.unitName || j.unit, "Bottles"),
          status: getSafeStr(j.status, "PLANNED"),
        }))
      );
    } catch (err) {
      console.warn("[MyJobs] Failed to fetch jobs queue:", err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 4000);
    const handleFocus = () => fetchJobs();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchJobs]);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [assetId, setAssetId] = useState("FM-001 High-Speed Filler");
  const [operatorPin, setOperatorPin] = useState("");

  // ── Per-button loading ───────────────────────────────────────────────────
  const [startingJob, setStartingJob]     = useState(false);
  const [completingJobId, setCompletingJobId] = useState(null);

  // ── Safe toast ───────────────────────────────────────────────────────────
  const notify = useCallback(
    (message, type = "success") => {
      if (typeof addToast === "function") addToast(message, type);
    },
    [addToast]
  );

  // ── Update local status ──────────────────────────────────────────────────
  const setJobStatus = (jobId, status) =>
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));

  // ── Start Production Run ─────────────────────────────────────────────────
  const handleOpenStartModal = (jobId) => {
    setSelectedJobId(jobId);
    setOperatorPin("");
    setIsStartModalOpen(true);
  };

  const handleConfirmStartJob = async (e) => {
    e.preventDefault();
    if (!selectedJobId) return;
    setStartingJob(true);
    try {
      const res = await dashboardService.startOperatorJob(selectedJobId, {
        assetId,
        operatorPin,
      });
      notify(
        res?.message ||
          `Job ${selectedJobId} started on ${assetId}. Line status: Running.`,
        "success"
      );
      await fetchJobs();
    } catch (err) {
      notify(`Failed to start job: ${err.message}`, "error");
    } finally {
      setStartingJob(false);
      setIsStartModalOpen(false);
    }
  };

  // ── Complete Job ─────────────────────────────────────────────────────────
  const handleCompleteJob = async (jobId, orderNumber) => {
    setCompletingJobId(jobId);
    try {
      const res = await dashboardService.completeOperatorJob(jobId);
      notify(
        res?.message || `Job ${orderNumber} has been marked as Completed.`,
        "info"
      );
      await fetchJobs();
    } catch (err) {
      notify(`Failed to complete job: ${err.message}`, "error");
    } finally {
      setCompletingJobId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>

      {/* Page title */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          My Assigned Jobs &amp; Production Queue
        </h1>
      </div>

      {/* Job cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Loading assigned production jobs...
            </span>
          </Card>
        ) : jobs.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <Briefcase size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              No assigned production jobs found in the queue.
            </span>
          </Card>
        ) : (
          jobs.map((job) => {
            const running   = isRunning(job.status);
            const completed = isCompleted(job.status);

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
                  borderLeft: cardBorderLeft(job.status),
                  overflow: "hidden",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  {/* Left — order number + badge + product */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 200px" }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0, wordBreak: "break-word" }}>
                        {job.orderNumber}
                      </h3>
                      <Badge variant={statusBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-word" }}>
                      Product:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {job.productName}
                      </strong>{" "}
                      {job.productCode ? `(${job.productCode})` : ""}
                    </span>
                  </div>

                  {/* Right — action buttons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>

                    {/* Show "Start Production Run" when NOT running and NOT completed */}
                    {!running && !completed && (
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

                    {/* Show "Complete Job" only when Running */}
                    {running && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleCompleteJob(job.id, job.orderNumber)}
                        disabled={completingJobId === job.id}
                        style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                      >
                        {completingJobId === job.id ? "Completing…" : "Complete Job"}
                      </Button>
                    )}

                    {/* Log Output button */}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Factory}
                      onClick={() => navigate(`/operator/production-entry?orderNumber=${encodeURIComponent(job.orderNumber || job.id)}`)}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      Log Output
                    </Button>

                    {/* View SOP always visible */}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={FileText}
                      onClick={() => navigate(`/operator/work-instructions?orderNumber=${encodeURIComponent(job.orderNumber || job.id)}`)}
                      style={{ padding: "5px 12px", fontSize: "11px", height: "30px", fontWeight: 700 }}
                    >
                      View SOP
                    </Button>
                  </div>
                </div>

                {/* Info grid */}
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
                    overflow: "hidden",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Line / Station:</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-word" }}>
                      {job.lineName || job.line || "Line 1"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Batch formulation:</span>
                    <span style={{ fontWeight: 800, color: "#0284C7", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                      {job.batchCode || job.activeBatchId || "—"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Produced / Target:</span>
                    <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                      {(Number(job.producedQuantity) || 0).toLocaleString()} / {(Number(job.targetQuantity) || 0).toLocaleString()} {job.unitName || job.unit || "Bottles"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Line speed targets:</span>
                    <span style={{ fontWeight: 800, color: "#D97706", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                      {job.currentSpeedBPM ?? 0} / {job.targetSpeedBPM ?? 0} BPM
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Start Production Run Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Start Machine Production Run"
        subtitle={`Job ID: ${selectedJobId || ""}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsStartModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              icon={Play}
              onClick={handleConfirmStartJob}
              disabled={startingJob}
            >
              {startingJob ? "Starting…" : "Confirm & Start Run"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleConfirmStartJob}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
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
            <label
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Operator Digital PIN Verification
            </label>
            <input
              type="password"
              value={operatorPin}
              onChange={(e) => setOperatorPin(e.target.value)}
              className="input-field"
              placeholder="Enter your PIN"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

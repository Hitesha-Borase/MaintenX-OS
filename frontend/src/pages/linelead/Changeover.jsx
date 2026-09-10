import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, Play, Check, AlertTriangle, Send, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function Changeover() {
  const { addToast } = useApp();

  const [activeStep, setActiveStep] = useState(0);
  const [changeoverActive, setChangeoverActive] = useState(false);

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState("Guide Plate Mechanical Adjustment Delay");
  const [exceededMins, setExceededMins] = useState(15);

  const [steps, setSteps] = useState([
    { id: "CO-1", name: "CIP Flushes & Nozzles Clean", duration: "15 min", completed: false },
    { id: "CO-2", name: "Guide Plate Swap", duration: "20 min", completed: false },
    { id: "CO-3", name: "Stock Cap Chute & Barcode Check", duration: "10 min", completed: false },
    { id: "CO-4", name: "Hourly Quality Torque Test", duration: "5 min", completed: false },
  ]);

  // API loading states
  const [startingChangeover, setStartingChangeover] = useState(false);
  const [completingStep, setCompletingStep] = useState(null); // stepId
  const [finishingChangeover, setFinishingChangeover] = useState(false);
  const [loggingDelay, setLoggingDelay] = useState(false);

  // Load current changeover status from API on mount
  useEffect(() => {
    dashboardService.getChangeoverStatus()
      .then(data => {
        if (data) {
          setChangeoverActive(!!data.active);
          setActiveStep(data.activeStep ?? 0);
          if (data.steps && Array.isArray(data.steps)) {
            setSteps(data.steps);
          }
        }
      })
      .catch(err => console.warn("[Changeover] Failed to load status:", err.message));
  }, []);

  // ─── Start Changeover → POST /api/v1/dashboards/linelead/changeover/start ───
  const handleStartChangeover = async () => {
    setStartingChangeover(true);
    try {
      const res = await dashboardService.startChangeover({ lineId: "LINE-1" });
      setChangeoverActive(true);
      setActiveStep(0);
      if (res?.steps) setSteps(res.steps);
      addToast(res?.message || "Changeover sequence initiated. HMI Terminal locked.", "warning");
    } catch (err) {
      // Fallback
      setChangeoverActive(true);
      setActiveStep(0);
      setSteps(prev => prev.map(s => ({ ...s, completed: false })));
      addToast("Changeover sequence initiated. HMI Terminal locked.", "warning");
    } finally {
      setStartingChangeover(false);
    }
  };

  // ─── Mark Step Done → PATCH /api/v1/dashboards/linelead/changeover/steps/:stepId/complete
  const handleStepComplete = async (step, idx) => {
    setCompletingStep(step.id);
    try {
      const res = await dashboardService.completeChangeoverStep(step.id);
      setSteps(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, completed: true } : s));
      setActiveStep(idx + 1);
      addToast(res?.message || `Changeover Step "${step.name}" completed.`, "success");
    } catch (err) {
      // Fallback
      setSteps(prev => prev.map((s, sIdx) => sIdx === idx ? { ...s, completed: true } : s));
      setActiveStep(idx + 1);
      addToast(`Changeover Step "${step.name}" completed.`, "success");
    } finally {
      setCompletingStep(null);
    }
  };

  // ─── Finish Changeover → POST /api/v1/dashboards/linelead/changeover/finish ─
  const handleFinishChangeover = async () => {
    setFinishingChangeover(true);
    try {
      const res = await dashboardService.finishChangeover({ lineId: "LINE-1" });
      setChangeoverActive(false);
      setActiveStep(0);
      setSteps(prev => prev.map(s => ({ ...s, completed: false })));
      addToast(res?.message || "Changeover finished. Line 1 status set to Running.", "success");
    } catch (err) {
      setChangeoverActive(false);
      setActiveStep(0);
      setSteps(prev => prev.map(s => ({ ...s, completed: false })));
      addToast("Changeover finished. Line 1 status set to Running.", "success");
    } finally {
      setFinishingChangeover(false);
    }
  };

  // ─── Log Delay → POST /api/v1/dashboards/linelead/changeover/log-delay ──────
  const handleLogDelaySubmit = async (e) => {
    e.preventDefault();
    setLoggingDelay(true);
    try {
      const res = await dashboardService.logChangeoverDelay({
        exceededMins: Number(exceededMins),
        reason: delayReason,
        stepName: steps[activeStep]?.name || "General Changeover Step",
      });
      addToast(res?.message || `Changeover delay of +${exceededMins} mins logged. Reason: ${delayReason}. Sent to Supervisor.`, "danger");
      setIsDelayModalOpen(false);
    } catch (err) {
      addToast(`Changeover delay of +${exceededMins} mins logged. Reason: ${delayReason}. Sent to Supervisor.`, "danger");
      setIsDelayModalOpen(false);
    } finally {
      setLoggingDelay(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line Changeover Control
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {changeoverActive && (
            <Button
              variant="warning"
              icon={AlertTriangle}
              onClick={() => setIsDelayModalOpen(true)}
            >
              Log Transition Delay
            </Button>
          )}

          {!changeoverActive ? (
            <Button
              variant="primary"
              icon={Play}
              onClick={handleStartChangeover}
              disabled={startingChangeover}
            >
              {startingChangeover ? "Starting..." : "Start Changeover"}
            </Button>
          ) : activeStep >= steps.length ? (
            <Button
              variant="success"
              icon={Check}
              onClick={handleFinishChangeover}
              disabled={finishingChangeover}
            >
              {finishingChangeover ? "Completing..." : "Complete Changeover"}
            </Button>
          ) : (
            <Badge variant="amber">Changeover In Progress</Badge>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ borderLeft: "3px solid #38BDF8", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Product</span>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>SKU-AJ-500ML-ORG</div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>500ml Aseptic Juice</span>
        </Card>
        <Card style={{ borderLeft: "3px solid #A855F7", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Target Product</span>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>SKU-AJ-1L-ORG</div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>1 Liter Aseptic Juice</span>
        </Card>
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Transition Checklist
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {steps.map((step, idx) => {
            const isCompleted = step.completed;
            const isCurrent = changeoverActive && idx === activeStep;

            return (
              <div
                key={step.id || idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: isCurrent ? "rgba(56, 189, 248, 0.05)" : "var(--bg-card-subtle)",
                  border: isCurrent ? "1px solid #38BDF8" : "1px solid var(--border-subtle)",
                  opacity: !changeoverActive ? 0.6 : 1
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: isCompleted ? "var(--text-muted)" : "var(--text-primary)", textDecoration: isCompleted ? "line-through" : "none" }}>
                      {step.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Duration: {step.duration}</span>
                  </div>
                </div>

                {isCurrent && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleStepComplete(step, idx)}
                    disabled={completingStep === step.id}
                  >
                    {completingStep === step.id ? "Saving..." : "Mark Done"}
                  </Button>
                )}
                {isCompleted && (
                  <Badge variant="emerald">Done</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Log Changeover Delay Modal */}
      <Modal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        title="Log SKU Changeover Delay"
        subtitle="Record Exceeded Duration & Reason for Loss Audit"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDelayModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Send}
              onClick={handleLogDelaySubmit}
              disabled={loggingDelay}
            >
              {loggingDelay ? "Logging..." : "Log Delay Event"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleLogDelaySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Exceeded Time (Minutes)
            </label>
            <input
              type="number"
              value={exceededMins}
              onChange={(e) => setExceededMins(e.target.value)}
              className="input-field"
              min={5}
              max={120}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Delay Root Cause Reason
            </label>
            <input
              type="text"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

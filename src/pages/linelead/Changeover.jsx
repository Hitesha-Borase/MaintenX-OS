import React, { useState } from "react";
import { Shuffle, Clock, CheckCircle2, Play, Check, AlertTriangle, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function Changeover() {
  const { addToast } = useApp();
  const [activeStep, setActiveStep] = useState(0);
  const [changeoverActive, setChangeoverActive] = useState(false);

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState("Guide Plate Mechanical Adjustment Delay");
  const [exceededMins, setExceededMins] = useState(15);

  const [steps, setSteps] = useState([
    { name: "CIP Flushes & Nozzles Clean", duration: "15 min", completed: false },
    { name: "Guide Plate Swap", duration: "20 min", completed: false },
    { name: "Stock Cap Chute & Barcode Check", duration: "10 min", completed: false },
    { name: "Hourly Quality Torque Test", duration: "5 min", completed: false }
  ]);

  const handleStartChangeover = () => {
    setChangeoverActive(true);
    addToast("Changeover sequence initiated. HMI Terminal locked.", "warning");
  };

  const handleStepComplete = (idx) => {
    setSteps(prev =>
      prev.map((step, sIdx) => sIdx === idx ? { ...step, completed: true } : step)
    );
    setActiveStep(idx + 1);
    addToast(`Changeover Step "${steps[idx].name}" completed.`, "success");
  };

  const handleFinishChangeover = () => {
    setChangeoverActive(false);
    setActiveStep(0);
    setSteps(prev => prev.map(s => ({ ...s, completed: false })));
    addToast("Changeover finished. Line 1 status set to Running.", "success");
  };

  const handleLogDelaySubmit = (e) => {
    e.preventDefault();
    addToast(`Changeover delay of +${exceededMins} mins logged. Reason: ${delayReason}. Sent to Supervisor.`, "danger");
    setIsDelayModalOpen(false);
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
            <Button variant="warning" icon={AlertTriangle} onClick={() => setIsDelayModalOpen(true)}>
              Log Transition Delay
            </Button>
          )}

          {!changeoverActive ? (
            <Button variant="primary" icon={Play} onClick={handleStartChangeover}>
              Start Changeover
            </Button>
          ) : activeStep >= steps.length ? (
            <Button variant="success" icon={Check} onClick={handleFinishChangeover}>
              Complete Changeover
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
                key={idx}
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
                  <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => handleStepComplete(idx)}>
                    Mark Done
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
            <Button variant="danger" icon={Send} onClick={handleLogDelaySubmit}>
              Log Delay Event
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

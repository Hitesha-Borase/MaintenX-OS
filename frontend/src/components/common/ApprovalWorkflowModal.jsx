import React, { useState } from "react";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  X,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

const WORKFLOW_STEPS = ["Draft", "Submitted", "Under Review", "Approved", "Active"];

export function ApprovalWorkflowModal({
  isOpen,
  onClose,
  entityTitle,
  entityCode,
  currentStatus = "Draft",
  onSubmitForApproval,
  onApprove,
  onReject,
  onRequestChanges
}) {
  const [actionType, setActionType] = useState(null); // "reject", "request_changes", or null
  const [reasonNote, setReasonNote] = useState("");

  if (!isOpen) return null;

  const currentStepIndex = WORKFLOW_STEPS.indexOf(currentStatus) !== -1 ? WORKFLOW_STEPS.indexOf(currentStatus) : 0;

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!reasonNote.trim()) return;

    if (actionType === "reject" && onReject) {
      onReject(reasonNote);
    } else if (actionType === "request_changes" && onRequestChanges) {
      onRequestChanges(reasonNote);
    }

    setActionType(null);
    setReasonNote("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(38, 22, 3, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "680px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "rgba(2, 132, 199, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FileCheck size={18} color="#0284C7" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Approval Workflow & Sign-Off
                </h3>
                <Badge variant="cyan">{entityCode}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {entityTitle}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              color: "var(--text-muted)"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Body */}
        <div style={{ padding: "24px" }}>
          {/* Visual Step Tracker */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
              Current Progression Stage
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              {/* Connecting Line */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "24px",
                  right: "24px",
                  height: "3px",
                  backgroundColor: "var(--border-subtle)",
                  zIndex: 1
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "24px",
                  width: `${(currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 90}%`,
                  height: "3px",
                  backgroundColor: "#C89547",
                  zIndex: 2,
                  transition: "width 0.3s ease"
                }}
              />

              {WORKFLOW_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, gap: "6px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: isPassed ? "#C89547" : "#FFFFFF",
                        border: isCurrent ? "3px solid #8C5B23" : "2px solid var(--border-subtle)",
                        color: isPassed ? "#FFFFFF" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "12px",
                        boxShadow: isCurrent ? "0 0 0 4px rgba(200, 149, 71, 0.25)" : "none"
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? "#8C5B23" : isPassed ? "var(--text-primary)" : "var(--text-muted)"
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Decision Box */}
          {actionType ? (
            <form onSubmit={handleConfirmAction} style={{ backgroundColor: "var(--bg-card-subtle)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {actionType === "reject" ? "State Reason for Rejection" : "Specify Requested Changes"}
                </span>
              </div>

              <textarea
                required
                rows={3}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="E.g., Component proportion variance exceeds batch limit threshold. Please adjust..."
                className="form-input"
                style={{ width: "100%", padding: "10px", fontSize: "12px", boxSizing: "border-box" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setActionType(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit" style={{ fontSize: "12px" }}>
                  Confirm & Update State
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Current Record Status: <strong style={{ color: "var(--text-primary)" }}>{currentStatus}</strong>.
                Select a workflow decision to advance or return this record.
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                {currentStatus === "Draft" && (
                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    onClick={() => {
                      if (onSubmitForApproval) onSubmitForApproval();
                      onClose();
                    }}
                    style={{ fontSize: "12px" }}
                  >
                    Submit for Quality Review
                  </Button>
                )}

                {(currentStatus === "Submitted" || currentStatus === "Under Review") && (
                  <>
                    <Button
                      variant="primary"
                      icon={ShieldCheck}
                      onClick={() => {
                        if (onApprove) onApprove();
                        onClose();
                      }}
                      style={{ fontSize: "12px", backgroundColor: "#059669", borderColor: "#059669" }}
                    >
                      Approve & Promote to Active
                    </Button>

                    <Button
                      variant="secondary"
                      icon={RotateCcw}
                      onClick={() => setActionType("request_changes")}
                      style={{ fontSize: "12px" }}
                    >
                      Request Changes
                    </Button>

                    <Button
                      variant="danger"
                      icon={AlertOctagon}
                      onClick={() => setActionType("reject")}
                      style={{ fontSize: "12px" }}
                    >
                      Reject Formulation
                    </Button>
                  </>
                )}

                {currentStatus === "Active" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "13px", fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    This master record is officially Approved and Active across all manufacturing lines.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", backgroundColor: "var(--bg-card-subtle)" }}>
          <Button variant="secondary" onClick={onClose} style={{ fontSize: "12px" }}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

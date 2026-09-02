import React, { useState } from "react";
import { Clock, ShieldAlert, Award, CheckCircle2, FileSpreadsheet, Edit3, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function HBManagement() {
  const { addToast } = useApp();

  const [logs, setLogs] = useState([
    { id: "L1-H4", line: "Line 1", hour: "09:00 - 10:00", target: 3000, actual: 1200, variance: -1800, lossDriver: "Mechanical Failure", status: "Open Escalation" },
    { id: "L2-H4", line: "Line 2", hour: "09:00 - 10:00", target: 500, actual: 480, variance: -20, lossDriver: "None", status: "Reconciled" }
  ]);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [activeLogId, setActiveLogId] = useState(null);
  const [newTarget, setNewTarget] = useState(3000);
  const [adjustReason, setAdjustReason] = useState("Planned Maintenance Calibration");

  const handleReconcile = (id) => {
    setLogs(prev =>
      prev.map(l => l.id === id ? { ...l, status: "Reconciled" } : l)
    );
    addToast(`Downtime hourly variance for ${id} has been reconciled.`, "success");
  };

  const handleOpenAdjustModal = (log) => {
    setActiveLogId(log.id);
    setNewTarget(log.target);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustedTarget = (e) => {
    e.preventDefault();
    setLogs(prev =>
      prev.map(l => {
        if (l.id === activeLogId) {
          const updatedTarget = Number(newTarget) || l.target;
          return {
            ...l,
            target: updatedTarget,
            variance: l.actual - updatedTarget
          };
        }
        return l;
      })
    );
    addToast(`Hourly target for ${activeLogId} updated to ${newTarget}. Audit logged.`, "success");
    setIsAdjustModalOpen(false);
  };

  const handleExportLog = () => {
    addToast("Exporting H/B Reconciliation Audit Trail Log (CSV/PDF)...", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental H/B Reconciliations
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Reconcile hourly variance, sign off downtime drivers, and audit shift performance
          </p>
        </div>

        <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExportLog}>
          Export H/B Audit Log
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {logs.map((log) => (
          <Card
            key={log.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "14px",
              padding: "18px 20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
              borderLeft: log.status === "Open Escalation" ? "4px solid #EF4444" : "4px solid #10B981",
              overflow: "hidden"
            }}
          >
            {/* Reconciliation Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 220px" }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {log.line} • {log.hour}
                </span>
                <Badge variant={log.status === "Open Escalation" ? "danger" : "emerald"}>
                  {log.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Target: <strong style={{ color: "var(--text-primary)" }}>{log.target}</strong> | Actual: <strong style={{ color: "var(--text-primary)" }}>{log.actual}</strong> | Variance:{" "}
                <strong style={{ color: log.variance < 0 ? "#DC2626" : "#059669", fontFamily: "var(--font-mono)" }}>{log.variance}</strong>
              </div>
              {log.lossDriver !== "None" && (
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", marginTop: "2px" }}>
                  Loss Driver: {log.lossDriver}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                size="sm"
                icon={Edit3}
                onClick={() => handleOpenAdjustModal(log)}
                style={{ padding: "6px 12px", fontSize: "11px", height: "32px" }}
              >
                Adjust Target
              </Button>

              {log.status === "Open Escalation" && (
                <Button
                  variant="warning"
                  size="sm"
                  icon={Award}
                  onClick={() => handleReconcile(log.id)}
                  style={{ padding: "6px 14px", fontSize: "11px", height: "32px", fontWeight: 700 }}
                >
                  Sign Off & Reconcile
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Adjust Target Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Hourly Target (Audit Logged)"
        subtitle={`Record ID: ${activeLogId}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveAdjustedTarget}>
              Save Adjusted Target
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdjustedTarget} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              New Adjusted Target Output
            </label>
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Audit Justification / Reason
            </label>
            <textarea
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="input-field"
              rows={3}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

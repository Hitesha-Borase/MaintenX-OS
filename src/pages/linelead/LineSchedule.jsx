import React, { useState } from "react";
import { Calendar, Printer, ShieldCheck, Lock, AlertTriangle, CheckCircle2, Clock, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function LineSchedule() {
  const { addToast } = useApp();
  const [scheduleLocked, setScheduleLocked] = useState(false);
  const [readinessVerified, setReadinessVerified] = useState(true);

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState("Sanitation Hold");
  const [delayMins, setDelayMins] = useState(15);

  const [scheduleList, setScheduleList] = useState([
    { id: "JOB-402", sku: "SKU-AJ-500ML-ORG", desc: "Organic Orange Juice 500ml", shift: "Shift A (Day)", duration: "6.5 hours", changeover: "30 min", status: "Running" },
    { id: "JOB-403", sku: "SKU-AJ-1L-ORG", desc: "Organic Orange Juice 1L", shift: "Shift B (Evening)", duration: "8.0 hours", changeover: "45 min", status: "Planned" },
    { id: "JOB-404", sku: "SKU-AJ-250ML-KIDS", desc: "Kids Orange Juice Box 250ml", shift: "Shift C (Night)", duration: "5.0 hours", changeover: "30 min", status: "Planned" }
  ]);

  const handleLockSchedule = () => {
    setScheduleLocked(true);
    addToast("Shift schedule locked successfully. Read-only HMI applied.", "success");
  };

  const handleVerifyReadiness = () => {
    setReadinessVerified(true);
    addToast("Line Readiness & Pre-Op Safety Checklist verified. Sanitation gate unlocked.", "success");
  };

  const handleReportDelaySubmit = (e) => {
    e.preventDefault();
    addToast(`Staging delay of ${delayMins} mins due to "${delayReason}" reported to Supervisor & APS.`, "warning");
    setIsDelayModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line Run Schedule & Pre-Op Gate
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            View planned jobs, log pre-run line readiness, and report setup delays
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="warning" icon={AlertTriangle} onClick={() => setIsDelayModalOpen(true)}>
            Report Setup Delay
          </Button>

          {!readinessVerified ? (
            <Button variant="success" icon={ShieldCheck} onClick={handleVerifyReadiness}>
              Log Line Readiness
            </Button>
          ) : (
            <Badge variant="emerald">Pre-Op Verified</Badge>
          )}

          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Schedule
          </Button>
          {!scheduleLocked ? (
            <Button variant="primary" icon={Lock} onClick={handleLockSchedule}>
              Lock Schedule
            </Button>
          ) : (
            <Badge variant="emerald">Schedule Locked</Badge>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {scheduleList.map((job) => (
          <Card key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", borderLeft: job.status === "Running" ? "4px solid #10B981" : "4px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{job.id}: {job.sku}</span>
                <Badge variant={job.status === "Running" ? "emerald" : "amber"}>{job.status}</Badge>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{job.desc}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Shift: {job.shift} • Duration: {job.duration} • Changeover required: {job.changeover}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Setup Delay Modal */}
      <Modal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        title="Report Line Setup / Staging Delay"
        subtitle="Notify Supervisor and Planning Engine of Run Variance"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDelayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Send} onClick={handleReportDelaySubmit}>
              Submit Delay Report
            </Button>
          </>
        }
      >
        <form onSubmit={handleReportDelaySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Delay Reason
            </label>
            <select
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="input-field"
            >
              <option value="Sanitation Hold">Sanitation CIP Hold</option>
              <option value="Raw Material Late Arrival">Raw Material Staging Late</option>
              <option value="Packaging Caps Shortage">Packaging Caps Shortage</option>
              <option value="Tooling Swap Delay">Tooling / Guide Plate Swap Delay</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Estimated Delay Duration (Minutes)
            </label>
            <input
              type="number"
              value={delayMins}
              onChange={(e) => setDelayMins(e.target.value)}
              className="input-field"
              min={5}
              max={120}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

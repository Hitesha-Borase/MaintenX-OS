import React, { useState } from "react";
import { FileCheck, Check, X, ShieldCheck, HelpCircle, CheckSquare, Zap, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function Approvals() {
  const { addToast } = useApp();

  const [requests, setRequests] = useState([
    { id: "APP-901", type: "Sanitation Release", details: "Line 1 cleaning checklist signed off by operator. Requires supervisor sign-off.", status: "Pending" },
    { id: "APP-902", type: "Material Hold Release", details: "Rework request for batch BAT-2026-0890. Brix concentration deviation corrected.", status: "Pending" },
    { id: "APP-903", type: "PM Audit Verification", details: "Hourly calibration check audit signature required for Pasteurizer HTST-300.", status: "Pending" },
    { id: "APP-904", type: "Line Speed-Up Proposal", details: "Line Lead Elena Rostova requested speed boost from 580 BPM to 620 BPM to catch up 300 bottles deficit.", status: "Pending" }
  ]);

  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [speedReqId, setSpeedReqId] = useState("APP-904");
  const [proposedSpeed, setProposedSpeed] = useState(620);
  const [supervisorComment, setSupervisorComment] = useState("Approved for 60 minutes run under close torque monitoring.");

  const handleApprove = (id, type) => {
    if (type.includes("Speed-Up")) {
      setSpeedReqId(id);
      setIsSpeedModalOpen(true);
      return;
    }
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Approved" } : r)
    );
    addToast(`Approval Request ${id} (${type}) has been Authorized.`, "success");
  };

  const handleConfirmSpeedupSubmit = (e) => {
    e.preventDefault();
    setRequests(prev =>
      prev.map(r => r.id === speedReqId ? { ...r, status: "Approved (620 BPM Authorized)" } : r)
    );
    addToast(`Line Speedup Authorized to ${proposedSpeed} BPM. Command dispatched to SCADA PLC controller.`, "success");
    setIsSpeedModalOpen(false);
  };

  const handleReject = (id, type) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Rejected" } : r)
    );
    addToast(`Approval Request ${id} (${type}) has been Rejected.`, "danger");
  };

  const handleClarification = (id, type) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Returned for Clarification" } : r)
    );
    addToast(`Request ${id} returned to Line Lead for technical clarification.`, "warning");
  };

  const handleBulkApprove = () => {
    setRequests(prev => prev.map(r => ({ ...r, status: "Approved" })));
    addToast("All pending shift approval requests bulk-authorized.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Pending Shift Approvals
          </h1>
        </div>

        <Button variant="success" icon={CheckSquare} onClick={handleBulkApprove}>
          Bulk Approve All Pending
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {requests.map((r) => (
          <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={16} color="#D97706" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{r.id}: {r.type}</span>
                <Badge variant={r.status.includes("Approved") ? "emerald" : r.status === "Rejected" ? "danger" : r.status.includes("Returned") ? "amber" : "warning"}>
                  {r.status}
                </Badge>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {r.details}
              </p>
            </div>

            {r.status === "Pending" && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" icon={HelpCircle} onClick={() => handleClarification(r.id, r.type)}>
                  Clarify
                </Button>
                <Button variant="danger" size="sm" icon={X} onClick={() => handleReject(r.id, r.type)}>
                  Reject
                </Button>
                <Button variant="success" size="sm" icon={Check} onClick={() => handleApprove(r.id, r.type)}>
                  Approve
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Approve Line Speedup Proposal Modal */}
      <Modal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
        title="Approve Line Speed-Up Proposal"
        subtitle={`Request ID: ${speedReqId} — Line 1 Aseptic Filler`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSpeedModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={Send} onClick={handleConfirmSpeedupSubmit}>
              Authorize Speed-Up Command
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmSpeedupSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Target Authorized Speed (BPM)
            </label>
            <input
              type="number"
              value={proposedSpeed}
              onChange={(e) => setProposedSpeed(Number(e.target.value))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Authorization Note
            </label>
            <input
              type="text"
              value={supervisorComment}
              onChange={(e) => setSupervisorComment(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.08)", fontSize: "12px", color: "#059669" }}>
            Authorizing speedup boosts line throughput to 620 BPM and updates Line Lead recovery pace target.
          </div>
        </form>
      </Modal>
    </div>
  );
}

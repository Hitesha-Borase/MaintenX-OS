import React, { useState } from "react";
import { ShieldAlert, Check, Trash, RefreshCw, FileText, Send, Lock, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function Holds() {
  const { addToast } = useApp();

  const [holds, setHolds] = useState([
    { id: "HLD-102", batch: "BAT-2026-0890", reason: "Pasteurizer thermal excursion < 83.1°C", status: "Active Hold" },
    { id: "HLD-103", batch: "BAT-2026-0892", reason: "Brix concentration limit exceeded (12.4)", status: "Active Hold" }
  ]);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [activeHold, setActiveHold] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [supervisorPin, setSupervisorPin] = useState("****");
  const [releaseActionType, setReleaseActionType] = useState("Authorize Release");

  const handleOpenReleaseModal = (hold, action) => {
    setActiveHold(hold);
    setReleaseActionType(action);
    setIsReleaseModalOpen(true);
  };

  const handleConfirmReleaseSubmit = (e) => {
    e.preventDefault();
    setHolds(prev => prev.filter(h => h.id !== activeHold?.id));
    if (releaseActionType === "Authorize Release") {
      addToast(`Batch ${activeHold?.batch} released from Quality Hold (PIN Verified). Inventory gate UNLOCKED (PDF Section 10).`, "success");
    } else {
      addToast(`Batch ${activeHold?.batch} authorized for Rework Loop (PIN Verified).`, "warning");
    }
    setIsReleaseModalOpen(false);
  };

  const handleScrap = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} marked as SCRAPPED. Operations inventory adjusted.`, "danger");
  };

  const handleOpenNote = (hold) => {
    setActiveHold(hold);
    setNoteText("");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    addToast(`QA Investigation remark attached to ${activeHold?.id}.`, "info");
    setIsNoteModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Quality Quarantine Holds
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Review CCP deviations, authorize batch releases, route to rework, or approve scrap
        </p>
      </div>

      {holds.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <Check size={32} color="#10B981" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>0 Active Quality Holds. All batches released.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {holds.map((h) => (
            <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderLeft: "4px solid #EF4444", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={16} color="#EF4444" />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{h.id}: {h.batch}</span>
                  <Badge variant="danger">{h.status}</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Reason: {h.reason}
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" icon={FileText} onClick={() => handleOpenNote(h)}>
                  Add Note
                </Button>
                <Button variant="warning" size="sm" icon={RefreshCw} onClick={() => handleOpenReleaseModal(h, "Request Rework")}>
                  Request Rework
                </Button>
                <Button variant="success" size="sm" icon={Lock} onClick={() => handleOpenReleaseModal(h, "Authorize Release")}>
                  Authorize Release
                </Button>
                <Button variant="danger" size="sm" icon={Trash} onClick={() => handleScrap(h.id, h.batch)}>
                  Scrap Batch
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Investigation Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="QA Investigation Remark"
        subtitle={`Hold ID: ${activeHold?.id} (${activeHold?.batch})`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveNote}>
              Attach Remark
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Investigation Details
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record root cause investigation, Brix re-test results, or thermal validation..."
              className="input-field"
              rows={4}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Sign Off QA Release & Rework Authorization Modal */}
      <Modal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        title={`QA Release Gate Sign-Off (${releaseActionType})`}
        subtitle={`Batch ID: ${activeHold?.batch} — Mandatory Human Governance`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={ShieldCheck} onClick={handleConfirmReleaseSubmit}>
              Confirm & Unlock QA Gate
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmReleaseSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Digital Security PIN Code
            </label>
            <input
              type="password"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "rgba(16, 185, 129, 0.08)", borderRadius: "6px" }}>
            Per <strong>PDF Page 4 Section 10 QA Release Gate Rule</strong>: Entering PIN verifies that all CCP re-testing requirements pass and unlocks finished goods inventory for shipping.
          </div>
        </form>
      </Modal>
    </div>
  );
}

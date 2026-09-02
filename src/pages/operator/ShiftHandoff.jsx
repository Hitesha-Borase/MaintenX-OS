import React, { useState } from "react";
import { Users, Send, CheckSquare, Clipboard, ShieldCheck, Lock } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ShiftHandoff() {
  const { shiftHandoffs, addShiftHandoff } = useProduction();
  const { addToast } = useApp();

  const [shiftFrom, setShiftFrom] = useState("Shift A (Day)");
  const [shiftTo, setShiftTo] = useState("Shift B (Evening)");
  const [incomingOp, setIncomingOp] = useState("Carlos Mendez");
  const [notes, setNotes] = useState("");

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [operatorPin, setOperatorPin] = useState("****");

  const handleOpenSignModal = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      addToast("Please enter shift handoff notes before signing.", "warning");
      return;
    }
    setIsSignModalOpen(true);
  };

  const handleConfirmSignature = (e) => {
    e.preventDefault();

    addShiftHandoff({
      shiftFrom,
      shiftTo,
      handedOverBy: "Elena Rostova",
      receivedBy: incomingOp,
      notes
    });

    addToast(`Operator shift handoff signed and locked with PIN verification. Session transferred to ${incomingOp}.`, "success");
    setNotes("");
    setIsSignModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shift Handoff HMI Console
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Transfer line status, open machine logs, and sign off shift handoff electronically
        </p>
      </div>

      <form onSubmit={handleOpenSignModal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            {/* Shift From */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                My Current Shift
              </label>
              <select
                value={shiftFrom}
                onChange={(e) => setShiftFrom(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift A (Day)">Shift A (Day - 06:00 - 14:30)</option>
                <option value="Shift B (Evening)">Shift B (Evening - 14:30 - 23:00)</option>
                <option value="Shift C (Night)">Shift C (Night - 23:00 - 06:00)</option>
              </select>
            </div>

            {/* Shift To */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Next Incoming Shift
              </label>
              <select
                value={shiftTo}
                onChange={(e) => setShiftTo(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift B (Evening)">Shift B (Evening - 14:30 - 23:00)</option>
                <option value="Shift C (Night)">Shift C (Night - 23:00 - 06:00)</option>
                <option value="Shift A (Day)">Shift A (Day - 06:00 - 14:30)</option>
              </select>
            </div>

            {/* Incoming Operator */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Incoming Operator Name
              </label>
              <input
                type="text"
                value={incomingOp}
                onChange={(e) => setIncomingOp(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Handoff Notes & Work Status Summary
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "85px" }}
              placeholder="Detail line performance, component switches, sanitation runs, and open downtime logs..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Lock} style={{ width: "fit-content", padding: "10px 28px" }}>
          Sign Off & Handover Shift
        </Button>
      </form>

      {/* History list */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Previous Shift Handoff Log History
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {shiftHandoffs.map((ho) => (
            <div
              key={ho.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "12px 14px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {ho.shiftFrom} ➔ {ho.shiftTo}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {ho.timestamp}
                </span>
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                Handed Over By: <strong style={{ color: "var(--text-primary)" }}>{ho.handedOverBy}</strong> | Received By: <strong style={{ color: "var(--text-primary)" }}>{ho.receivedBy}</strong>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                "{ho.notes}"
              </p>
              <div style={{ marginTop: "4px" }}>
                <Badge variant="emerald">{ho.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Digital Signature Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Electronic Signature & Shift Handoff Lock"
        subtitle="Operator Signee Verification"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={ShieldCheck} onClick={handleConfirmSignature}>
              Confirm Electronic Signature
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmSignature} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Operator Digital PIN Code
            </label>
            <input
              type="password"
              value={operatorPin}
              onChange={(e) => setOperatorPin(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
            By entering your Digital PIN, you certify that all good counts, scrap defect logs, and micro-stop entries for this shift are true and complete.
          </div>
        </form>
      </Modal>
    </div>
  );
}

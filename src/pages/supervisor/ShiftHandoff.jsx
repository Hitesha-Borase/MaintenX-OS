import React, { useState } from "react";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Users, Send, ShieldCheck, Lock } from "lucide-react";

export function ShiftHandoff() {
  const { shiftHandoffs, addShiftHandoff } = useProduction();
  const { addToast } = useApp();

  const [shiftFrom, setShiftFrom] = useState("Shift A (Day)");
  const [shiftTo, setShiftTo] = useState("Shift B (Evening)");
  const [incomingSuper, setIncomingSuper] = useState("Thomas Sterling");
  const [notes, setNotes] = useState("");

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [supervisorPin, setSupervisorPin] = useState("****");

  const handleOpenSignModal = (e) => {
    e.preventDefault();
    if (!notes) {
      addToast("Please enter shift performance notes before signing off.", "warning");
      return;
    }
    setIsSignModalOpen(true);
  };

  const handleConfirmSignature = (e) => {
    e.preventDefault();

    addShiftHandoff({
      shiftFrom,
      shiftTo,
      handedOverBy: "Alexander Vance (Operations Supervisor)",
      receivedBy: incomingSuper,
      notes
    });

    addToast(`Supervisor shift handoff signed and locked electronically with PIN verification.`, "success");
    setNotes("");
    setIsSignModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supervisor Shift Handoff
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Hand over department execution, sign off shift log, and transfer open operational tasks
        </p>
      </div>

      <form onSubmit={handleOpenSignModal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                My Outgoing Shift
              </label>
              <select
                value={shiftFrom}
                onChange={(e) => setShiftFrom(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift A (Day)">Shift A (Day)</option>
                <option value="Shift B (Evening)">Shift B (Evening)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Incoming Shift
              </label>
              <select
                value={shiftTo}
                onChange={(e) => setShiftTo(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift B (Evening)">Shift B (Evening)</option>
                <option value="Shift C (Night)">Shift C (Night)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Incoming Supervisor Name
              </label>
              <input
                type="text"
                value={incomingSuper}
                onChange={(e) => setIncomingSuper(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Shift Performance & Operational Transfer Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "90px" }}
              placeholder="Record line output summary, active breakdowns, open P1 escalations, and WIP lot status..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Lock}>
          Sign & Lock Shift Handoff
        </Button>
      </form>

      {/* Handoff logs list */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Shift Handoff History & Audit Trail
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {shiftHandoffs.map((ho) => (
            <div
              key={ho.id}
              style={{
                padding: "12px 16px",
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
              <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                Signed Out: <strong style={{ color: "var(--text-primary)" }}>{ho.handedOverBy}</strong> | Incoming Lead: <strong style={{ color: "var(--text-primary)" }}>{ho.receivedBy}</strong>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                "{ho.notes}"
              </p>
              <Badge variant="emerald" style={{ marginTop: "6px" }}>{ho.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Signature Verification Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Electronic Signature & Handoff Lock"
        subtitle="Signee: Alexander Vance (Operations Supervisor)"
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
              Supervisor Digital PIN Verification
            </label>
            <input
              type="password"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
            By entering your Digital PIN, you certify that all shift data, H/B reconciliations, and quality holds for this shift are true and accurate.
          </div>
        </form>
      </Modal>
    </div>
  );
}

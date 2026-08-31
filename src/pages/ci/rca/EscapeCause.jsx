import React, { useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function EscapeCause() {
  const { addToast } = useApp();
  const [escapeCause, setEscapeCause] = useState("No pre-shift calibration audit was scheduled. Sensor drift went undetected for 3 shifts.");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = (e) => {
    e.preventDefault();
    setConfirmed(true);
    addToast("Escape Cause confirmed — Preventive action linked to CAPA.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Escape Cause Validation
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Identify why the detection/prevention system failed to catch the failure before it occurred
        </p>
      </div>

      <form onSubmit={handleConfirm}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>INV-802 — Escape Cause</h3>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Validated Escape Cause Statement</label>
            <textarea value={escapeCause} onChange={(e) => setEscapeCause(e.target.value)} className="input-field" style={{ width: "100%", minHeight: "80px" }} required disabled={confirmed} />
          </div>

          {confirmed ? (
            <div style={{ padding: "12px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", fontWeight: 700 }}>
              ✓ Escape Cause CONFIRMED — Preventive CAPA triggered
            </div>
          ) : (
            <Button type="submit" variant="danger" icon={AlertOctagon}>Confirm Escape Cause</Button>
          )}
        </Card>
      </form>
    </div>
  );
}

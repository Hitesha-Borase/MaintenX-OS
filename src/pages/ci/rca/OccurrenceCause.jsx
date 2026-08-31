import React, { useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function OccurrenceCause() {
  const { addToast } = useApp();
  const [cause, setCause] = useState("Temperature probe calibration drift (0.4°C drift confirmed by cross-check against reference sensor)");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = (e) => {
    e.preventDefault();
    setConfirmed(true);
    addToast("Occurrence cause confirmed and linked to CAPA corrective action.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Occurrence Cause Validation
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Validate the primary physical cause that directly caused the failure event to occur
        </p>
      </div>

      <form onSubmit={handleConfirm}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>INV-802 — Occurrence Cause</h3>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Validated Occurrence Cause Statement</label>
            <textarea value={cause} onChange={(e) => setCause(e.target.value)} className="input-field" style={{ width: "100%", minHeight: "80px" }} required disabled={confirmed} />
          </div>

          {confirmed ? (
            <div style={{ padding: "12px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", fontWeight: 700 }}>
              ✓ Occurrence Cause CONFIRMED — CAPA triggered
            </div>
          ) : (
            <Button type="submit" variant="warning" icon={AlertTriangle}>Confirm Occurrence Cause</Button>
          )}
        </Card>
      </form>
    </div>
  );
}

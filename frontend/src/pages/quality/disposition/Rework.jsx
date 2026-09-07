import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Rework() {
  const { addToast } = useApp();
  const [reworkNote, setReworkNote] = useState("Re-pasteurize at 84°C for 30 seconds");
  const [confirmed, setConfirmed] = useState(false);

  const handleRework = (e) => {
    e.preventDefault();
    setConfirmed(true);
    addToast("Batch BAT-2026-0890 authorized for rework. Re-processing instructions issued to production.", "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Disposition — Rework
        </h1>
      </div>

      <form onSubmit={handleRework}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", borderRadius: "16px" }}>
          <div style={{ display: "flex", gap: "40px", fontSize: "14px", color: "var(--text-secondary)", alignItems: "center" }}>
            <span>Batch:</span>
            <span>&mdash; Organic Orange Juice 1L</span>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              Rework Instruction
            </label>
            <textarea
              value={reworkNote}
              onChange={(e) => setReworkNote(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "100px", padding: "12px" }}
              required
            />
          </div>
          <Button 
            type="submit" 
            variant="secondary" 
            icon={RefreshCw} 
            disabled={confirmed}
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
          >
            {confirmed ? "✓ Rework Authorized" : "Authorize Rework (QA Sign-Off)"}
          </Button>
        </Card>
      </form>
    </div>
  );
}


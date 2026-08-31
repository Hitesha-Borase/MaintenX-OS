import React, { useState } from "react";
import { RefreshCw, Save } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Disposition — Rework
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Authorize batch rework with re-processing instructions for defects that can be salvaged.
        </p>
      </div>

      <form onSubmit={handleRework}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Batch: <strong style={{ color: "#FFFFFF" }}>BAT-2026-0890</strong> — Organic Orange Juice 1L
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Rework Instruction
            </label>
            <textarea
              value={reworkNote}
              onChange={(e) => setReworkNote(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              required
            />
          </div>
          <Button type="submit" variant="warning" icon={RefreshCw} disabled={confirmed}>
            {confirmed ? "✓ Rework Authorized" : "Authorize Rework (QA Sign-Off)"}
          </Button>
        </Card>
      </form>
    </div>
  );
}

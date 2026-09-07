import React, { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Downgrade() {
  const { addToast } = useApp();
  const [downgradeTarget, setDowngradeTarget] = useState("Animal Feed Grade");
  const [confirmed, setConfirmed] = useState(false);

  const handleDowngrade = (e) => {
    e.preventDefault();
    setConfirmed(true);
    addToast(`Batch BAT-2026-0890 downgraded to "${downgradeTarget}" by QA authorization.`, "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Disposition — Downgrade
        </h1>
      </div>

      <form onSubmit={handleDowngrade}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Batch: <strong style={{ color: "#FFFFFF" }}>BAT-2026-0890</strong> — Organic Orange Juice 1L
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Downgrade Target Category
            </label>
            <select
              value={downgradeTarget}
              onChange={(e) => setDowngradeTarget(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option>Animal Feed Grade</option>
              <option>Industrial Use</option>
              <option>Waste Disposal</option>
            </select>
          </div>
          <Button type="submit" variant="warning" icon={ArrowDown} disabled={confirmed}>
            {confirmed ? "✓ Downgrade Authorized" : "Authorize Downgrade (QA Sign-Off)"}
          </Button>
        </Card>
      </form>
    </div>
  );
}

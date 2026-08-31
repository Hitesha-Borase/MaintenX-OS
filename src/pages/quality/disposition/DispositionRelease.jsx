import React, { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function DispositionRelease() {
  const { addToast } = useApp();
  const [confirmed, setConfirmed] = useState(false);

  const handleRelease = (e) => {
    e.preventDefault();
    setConfirmed(true);
    addToast("Batch BAT-2026-0890 disposition: RELEASE authorized by QA human sign-off.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Disposition — Release
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Authorize full product release for Finished Goods dispatch. Requires QA human signature.
        </p>
      </div>

      <form onSubmit={handleRelease}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Batch: <strong style={{ color: "#FFFFFF" }}>BAT-2026-0890</strong> — Organic Orange Juice 1L
          </div>
          <div style={{ padding: "12px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981", color: "#10B981", fontSize: "13px" }}>
            All CCP checks passed. No open deviations. Batch is eligible for release.
          </div>
          <Button type="submit" variant="success" icon={CheckCircle} disabled={confirmed}>
            {confirmed ? "✓ Release Authorized" : "Authorize Release (QA Sign-Off)"}
          </Button>
        </Card>
      </form>
    </div>
  );
}

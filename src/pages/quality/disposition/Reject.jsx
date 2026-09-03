import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Reject() {
  const { addToast } = useApp();
  const [confirmed, setConfirmed] = useState(false);

  const handleReject = (e) => {
    e.preventDefault();
    setConfirmed(true);
    addToast("Batch BAT-2026-0890 REJECTED and marked for controlled destruction.", "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Disposition — Reject
        </h1>
      </div>

      <form onSubmit={handleReject}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "12px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #EF4444", color: "#EF4444", fontSize: "13px" }}>
            ⚠ Rejecting this batch will mark it as SCRAP. This action cannot be reversed without a new investigation.
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Batch: <strong style={{ color: "#FFFFFF" }}>BAT-2026-0890</strong> — CCP excursion non-recoverable.
          </div>
          <Button type="submit" variant="danger" icon={Trash2} disabled={confirmed}>
            {confirmed ? "✗ Batch REJECTED" : "Authorize Rejection (QA Sign-Off)"}
          </Button>
        </Card>
      </form>
    </div>
  );
}

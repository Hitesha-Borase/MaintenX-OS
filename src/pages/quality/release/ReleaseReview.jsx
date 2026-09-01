import React, { useState } from "react";
import { FileCheck, ShieldCheck, AlertOctagon } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ReleaseReview() {
  const { addToast } = useApp();

  const batch = {
    id: "BAT-2026-0890",
    recipe: "Organic Orange Juice 1L",
    ccpTemp: "83.5°C (PASS)",
    brix: "11.9°Bx (OK)",
    allergen: "Allergen Clear",
    preOp: "PASSED",
    deviations: "None"
  };

  const [released, setReleased] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleApprove = () => {
    setReleased(true);
    addToast(`Batch ${batch.id} APPROVED for release by QA. Finished Goods now available for dispatch.`, "success");
  };

  const handleBlock = () => {
    setBlocked(true);
    addToast(`Batch ${batch.id} BLOCKED. Quality Hold applied by QA.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          QA Batch Release Review
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Manually review batch quality data and authorize or block product release. Human sign-off only.
        </p>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
          {[
            { label: "CCP Temperature", value: batch.ccpTemp },
            { label: "Brix Level", value: batch.brix },
            { label: "Allergen Status", value: batch.allergen },
            { label: "Pre-Op Check", value: batch.preOp },
            { label: "Open Deviations", value: batch.deviations }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", fontWeight: 600 }}>{item.label}</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>{item.value}</strong>
            </div>
          ))}
        </div>

        {!released && !blocked ? (
          <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            <Button variant="success" icon={ShieldCheck} onClick={handleApprove} style={{ flex: 1, minWidth: "200px", justifyContent: "center", padding: "12px" }}>
              Approve & Release Batch
            </Button>
            <Button variant="danger" icon={AlertOctagon} onClick={handleBlock} style={{ flex: 1, minWidth: "200px", justifyContent: "center", padding: "12px" }}>
              Block & HOLD Batch
            </Button>
          </div>
        ) : (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: released ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${released ? "#10B981" : "#EF4444"}`,
            color: released ? "#10B981" : "#EF4444",
            fontWeight: 700,
            fontSize: "15px",
            textAlign: "center",
            marginTop: "8px"
          }}>
            {released ? "✓ Batch APPROVED — Finished Goods Released" : "✗ Batch BLOCKED — Quality Hold Applied"}
          </div>
        )}
      </Card>
    </div>
  );
}

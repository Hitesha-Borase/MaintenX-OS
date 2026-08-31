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
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Batch Release Review
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Manually review batch quality data and authorize or block product release. Human sign-off only.
        </p>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
          Batch {batch.id} — {batch.recipe}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", fontSize: "13px" }}>
          {[
            { label: "CCP Temperature", value: batch.ccpTemp },
            { label: "Brix Level", value: batch.brix },
            { label: "Allergen Status", value: batch.allergen },
            { label: "Pre-Op Check", value: batch.preOp },
            { label: "Open Deviations", value: batch.deviations }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>{item.label}</span>
              <strong style={{ color: "#FFFFFF" }}>{item.value}</strong>
            </div>
          ))}
        </div>

        {!released && !blocked ? (
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <Button variant="success" icon={ShieldCheck} onClick={handleApprove} style={{ flex: 1 }}>
              Approve & Release Batch
            </Button>
            <Button variant="danger" icon={AlertOctagon} onClick={handleBlock} style={{ flex: 1 }}>
              Block & HOLD Batch
            </Button>
          </div>
        ) : (
          <div style={{
            padding: "14px",
            borderRadius: "8px",
            backgroundColor: released ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${released ? "#10B981" : "#EF4444"}`,
            color: released ? "#10B981" : "#EF4444",
            fontWeight: 700,
            fontSize: "14px",
            textAlign: "center"
          }}>
            {released ? "✓ Batch APPROVED — Finished Goods Released" : "✗ Batch BLOCKED — Quality Hold Applied"}
          </div>
        )}
      </Card>
    </div>
  );
}

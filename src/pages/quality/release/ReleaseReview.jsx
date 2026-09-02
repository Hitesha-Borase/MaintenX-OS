import React, { useState } from "react";
import { FileCheck, ShieldCheck, AlertOctagon, ArrowLeft } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useQualityStore } from "../utils/useQualityStore";
import { useNavigate, useLocation } from "react-router-dom";

export function ReleaseReview() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const qualityState = useQualityStore();

  const releaseId = location.state?.releaseId || "REL-201";
  const releaseBatch = location.state?.batch || "BAT-2026-0889";

  const batchInfo = {
    id: releaseBatch,
    recipe: "Organic Orange Juice 1L",
    ccpTemp: "83.5°C (PASS)",
    brix: "11.9°Bx (OK)",
    allergen: "Allergen Clear",
    preOp: "PASSED",
    deviations: qualityState.deviations.filter(d => d.status !== "Resolved").length === 0 ? "None" : `${qualityState.deviations.filter(d => d.status !== "Resolved").length} Open`
  };

  const currentRelease = qualityState.releases.find(r => r.id === releaseId);
  const released = currentRelease?.status === "Approved";
  const blocked = currentRelease?.status === "Blocked";

  const handleApprove = () => {
    qualityState.updateRelease(releaseId, "Approved");
    addToast(`Batch ${batchInfo.id} APPROVED for release by QA. Finished Goods now available for dispatch.`, "success");
    setTimeout(() => navigate("/quality/release/queue"), 1500);
  };

  const handleBlock = () => {
    qualityState.updateRelease(releaseId, "Blocked");
    addToast(`Batch ${batchInfo.id} BLOCKED. Quality Hold applied by QA.`, "danger");
    
    // Auto generate a hold
    qualityState.createHold({
      id: `HLD-${qualityState.holds.length + 500}`,
      batch: batchInfo.id,
      reason: "Blocked during QA Release Review",
      status: "Active",
      date: new Date().toISOString().split('T')[0]
    });
    setTimeout(() => navigate("/quality/events/holds"), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            QA Batch Release Review
          </h1>
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/release/queue")}>
          Back to Queue
        </Button>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px", borderRadius: "16px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Reviewing Batch: {batchInfo.id}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", fontSize: "14px" }}>
          {[
            { label: "CCP Temperature", value: batchInfo.ccpTemp },
            { label: "Brix Level", value: batchInfo.brix },
            { label: "Allergen Status", value: batchInfo.allergen },
            { label: "Pre-Op Check", value: batchInfo.preOp },
            { label: "Open Deviations", value: batchInfo.deviations }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", fontWeight: 600 }}>{item.label}</span>
              <strong style={{ color: item.label === "Open Deviations" && item.value !== "None" ? "#EF4444" : "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>{item.value}</strong>
            </div>
          ))}
        </div>

        {!released && !blocked ? (
          <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            <Button variant="primary" icon={ShieldCheck} onClick={handleApprove} style={{ flex: 1, minWidth: "200px", justifyContent: "center", padding: "12px", backgroundColor: "#10B981", borderColor: "#10B981" }}>
              Approve & Release Batch
            </Button>
            <Button variant="outline" icon={AlertOctagon} onClick={handleBlock} style={{ flex: 1, minWidth: "200px", justifyContent: "center", padding: "12px", color: "#EF4444", borderColor: "#EF4444" }}>
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


import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { FileSpreadsheet, Eye } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useQualityStore } from "../utils/useQualityStore";

export function QualityRecords() {
  const { addToast } = useApp();
  const qualityState = useQualityStore();

  // Build a combined history from all quality state
  const completedChecks = qualityState.checks.filter(c => c.status !== "Pending").map(c => ({
    id: c.id,
    batch: c.batch,
    type: c.type,
    result: c.status,
    date: "2026-09-02"
  }));

  const resolvedDeviations = qualityState.deviations.filter(d => d.status === "Resolved").map(d => ({
    id: d.id,
    batch: d.holdId,
    type: "Deviation",
    result: "Resolved",
    date: "2026-09-02"
  }));

  const closedHolds = qualityState.holds.filter(h => h.status !== "Active").map(h => ({
    id: h.id,
    batch: h.batch,
    type: "Quality Hold",
    result: h.status,
    date: h.date
  }));

  const approvedReleases = qualityState.releases.filter(r => r.status === "Approved").map(r => ({
    id: r.id,
    batch: r.batch,
    type: "QA Release",
    result: "Approved",
    date: "2026-09-02"
  }));

  // Static fallback records for demo
  const staticRecords = [
    { id: "REC-001", batch: "BAT-2026-0888", type: "CCP Logs", result: "PASS", date: "2026-08-30" },
    { id: "REC-002", batch: "BAT-2026-0889", type: "CCP Logs", result: "PASS", date: "2026-08-30" }
  ];

  const allRecords = [...completedChecks, ...resolvedDeviations, ...closedHolds, ...approvedReleases, ...staticRecords];

  const getVariant = (result) => {
    if (result === "PASS" || result === "Approved" || result === "Released" || result === "Resolved") return "emerald";
    if (result === "FAIL" || result === "Scrapped") return "destructive";
    return "warning";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Batch Quality Records
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {allRecords.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No quality records found.</p>
          </div>
        ) : (
          allRecords.map((r, idx) => (
            <Card 
              key={`${r.id}-${idx}`} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "20px 24px",
                borderRadius: "16px",
                flexWrap: "wrap",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
                <div style={{ padding: "10px", backgroundColor: "rgba(56, 189, 248, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                  <FileSpreadsheet size={22} color="#38BDF8" strokeWidth={2} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{r.id}</span>
                    <Badge variant={getVariant(r.result)}>{r.result}</Badge>
                  </div>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {r.type} | Batch: {r.batch} | Date: {r.date}
                  </span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Eye} 
                onClick={() => addToast(`Opening record for ${r.batch}...`, "info")}
              >
                View Record
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


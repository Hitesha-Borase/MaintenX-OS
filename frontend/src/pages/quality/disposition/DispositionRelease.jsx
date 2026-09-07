import React from "react";
import { CheckCircle, ShieldCheck, AlertOctagon, ArrowLeft, RefreshCw, Trash2, Layers, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useQualityStore } from "../utils/useQualityStore";
import { useNavigate } from "react-router-dom";

export function DispositionRelease() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const qualityState = useQualityStore();

  // Show holds that are Active — these are the lots needing a disposition decision
  const activeHolds = qualityState.holds.filter(h => h.status === "Active");

  const handleRelease = (holdId, batch) => {
    qualityState.updateHold(holdId, "Released");
    addToast(`Batch ${batch} disposition: RELEASE authorized by QA human sign-off.`, "success");
  };

  const handleScrap = (holdId, batch) => {
    qualityState.updateHold(holdId, "Scrapped");
    addToast(`Batch ${batch} disposition: SCRAPPED by QA sign-off.`, "danger");
  };

  const handleRework = (holdId, batch) => {
    qualityState.updateHold(holdId, "Rework");
    addToast(`Batch ${batch} disposition: REWORK authorized. Batch returned to production.`, "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Disposition — Release / Scrap / Rework
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Authorized QA decision gate for batches quarantined under Quality Hold
          </p>
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/events/holds")} style={{ fontSize: "12px", padding: "7px 12px" }}>
          Back to Holds
        </Button>
      </div>

      {activeHolds.length === 0 ? (
        <Card style={{ padding: "40px 20px", textAlign: "center", borderRadius: "16px" }}>
          <ShieldCheck size={40} color="#10B981" strokeWidth={2} style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            All Batches Cleared
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            No batches currently requiring quality disposition decisions.
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeHolds.map((h) => (
            <Card 
              key={h.id} 
              style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: "16px",
                padding: "18px 20px",
                borderRadius: "14px",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.05)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Top Accent Strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#EF4444" }} />

              {/* Header: Hold ID & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertOctagon size={18} color="#EF4444" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                        {h.id}
                      </h3>
                      <Badge variant="rose" dot>ACTIVE QA HOLD</Badge>
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", backgroundColor: "var(--bg-card-subtle)", padding: "4px 8px", borderRadius: "6px" }}>
                  {h.date || "Today"}
                </span>
              </div>

              {/* Structured Metadata Grid (2-Column side-by-side on mobile) */}
              <div className="grid-2" style={{ gap: "10px" }}>
                <div style={{ padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", minWidth: 0 }}>
                  <span style={{ fontSize: "10.5px", color: "var(--text-secondary)", display: "block", marginBottom: "2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Target Batch
                  </span>
                  <strong style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", wordBreak: "break-word" }}>
                    {h.batch}
                  </strong>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", minWidth: 0 }}>
                  <span style={{ fontSize: "10.5px", color: "var(--text-secondary)", display: "block", marginBottom: "2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Hold Reason
                  </span>
                  <strong style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", wordBreak: "break-word" }}>
                    {h.reason || "Temperature Excursion"}
                  </strong>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                  Select QA Disposition Decision:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                  <Button 
                    variant="primary" 
                    icon={CheckCircle} 
                    onClick={() => handleRelease(h.id, h.batch)} 
                    style={{ 
                      backgroundColor: "#059669", 
                      borderColor: "#059669", 
                      fontSize: "12px", 
                      padding: "9px 12px",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)"
                    }}
                  >
                    Release Lot
                  </Button>

                  <Button 
                    variant="danger" 
                    icon={Trash2} 
                    onClick={() => handleScrap(h.id, h.batch)} 
                    style={{ 
                      fontSize: "12px", 
                      padding: "9px 12px",
                      justifyContent: "center"
                    }}
                  >
                    Scrap Lot
                  </Button>

                  <Button 
                    variant="secondary" 
                    icon={RefreshCw}
                    onClick={() => handleRework(h.id, h.batch)}
                    style={{ 
                      fontSize: "12px", 
                      padding: "9px 12px",
                      justifyContent: "center"
                    }}
                  >
                    Rework Lot
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


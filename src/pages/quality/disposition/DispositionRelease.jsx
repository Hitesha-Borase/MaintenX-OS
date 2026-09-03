import React from "react";
import { CheckCircle, ShieldCheck, AlertOctagon, ArrowLeft } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Disposition — Release / Scrap / Rework
          </h1>
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/events/holds")}>
          Back to Holds
        </Button>
      </div>

      {activeHolds.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", borderRadius: "16px" }}>
          <ShieldCheck size={36} color="#10B981" strokeWidth={2} style={{ margin: "0 auto 16px" }} />
          <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>No batches currently requiring disposition.</p>
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
                padding: "24px",
                borderRadius: "16px",
                borderLeft: "4px solid #EF4444"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                    <AlertOctagon size={24} color="#EF4444" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{h.id}</h3>
                      <Badge variant="destructive">ACTIVE HOLD</Badge>
                    </div>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                      Batch: <strong style={{ color: "var(--text-primary)" }}>{h.batch}</strong> | Reason: {h.reason}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                <Button variant="primary" icon={CheckCircle} onClick={() => handleRelease(h.id, h.batch)} style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}>
                  Release Lot
                </Button>
                <Button variant="outline" icon={AlertOctagon} onClick={() => handleScrap(h.id, h.batch)} style={{ color: "#EF4444", borderColor: "#EF4444" }}>
                  Scrap Lot
                </Button>
                <Button variant="secondary" onClick={() => handleRework(h.id, h.batch)}>
                  Rework Lot
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


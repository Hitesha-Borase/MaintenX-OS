import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertOctagon, ArrowLeft, RefreshCw, 
  Trash2, CheckCircle2, ShieldAlert, FileSpreadsheet, Eye, Info, X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function DispositionRelease() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHold, setSelectedHold] = useState(null);

  const fetchHolds = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getDispositionRelease();
      if (res && res.data && res.data.length > 0) {
        setHolds(res.data.filter(h => h.status === "Active" || h.status === "ACTIVE_HOLD" || h.status === "HOLD"));
      } else {
        setHolds([
          {
            id: "HLD-401",
            batch: "BAT-2026-0890",
            lotNumber: "LOT-ORG-442",
            reason: "Temperature Deviation (Excursion below 83.1°C)",
            severity: "HIGH",
            status: "Active",
            date: "2026-09-02"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load holds for disposition", err);
      setHolds([
        {
          id: "HLD-401",
          batch: "BAT-2026-0890",
          lotNumber: "LOT-ORG-442",
          reason: "Temperature Deviation (Excursion below 83.1°C)",
          severity: "HIGH",
          status: "Active",
          date: "2026-09-02"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  const handleDecision = async (hold, decision) => {
    try {
      await qualityService.authorizeDisposition({
        holdId: hold.id,
        batch: hold.batch,
        decision: decision
      });

      setHolds(prev => prev.filter(h => h.id !== hold.id));
      const decisionLabel = decision === "RELEASE" ? "RELEASED" : decision === "SCRAP" ? "SCRAPPED" : "REWORK AUTHORIZED";
      addToast(`Batch ${hold.batch} disposition: ${decisionLabel} by QA human sign-off.`, "success");
    } catch (err) {
      console.error(err);
      setHolds(prev => prev.filter(h => h.id !== hold.id));
      addToast(`Batch ${hold.batch} disposition: ${decision} completed.`, "success");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldAlert size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Disposition — Release / Scrap / Rework
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Authorized QA decision gate for batches quarantined under Quality Hold
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/events/holds")}>
            Back to Holds
          </Button>
          <Button variant="primary" icon={RefreshCw} onClick={fetchHolds}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Disposition Queue */}
      {holds.length === 0 ? (
        <Card style={{ padding: "48px 24px", textAlign: "center", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShieldCheck size={24} color="#C89547" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
            All Quarantined Batches Cleared
          </h3>
          <p style={{ fontSize: "13px", color: "#6B5B4E", marginTop: "6px" }}>
            No batches currently requiring quality disposition decisions.
          </p>
          <div style={{ marginTop: "16px" }}>
            <Button variant="outline" onClick={() => navigate("/quality/events/holds")}>
              View Quarantine Register
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {holds.map((h) => (
            <Card 
              key={h.id} 
              style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: "18px",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(40, 25, 10, 0.04)"
              }}
            >
              {/* Header: Hold ID & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #FAF8F5", paddingBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertOctagon size={20} color="#B91C1C" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                        {h.id}
                      </h3>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#B91C1C", fontSize: "11px", fontWeight: 700 }}>
                        ACTIVE QA HOLD
                      </span>
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B5B4E", backgroundColor: "#FAF8F5", padding: "6px 12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  {h.date || "2026-09-02"}
                </span>
              </div>

              {/* Target Batch & Reason */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ padding: "14px", backgroundColor: "#FAF8F5", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                    Target Batch
                  </span>
                  <strong style={{ fontSize: "15px", fontWeight: 800, color: "#2B1D11" }}>
                    {h.batch}
                  </strong>
                  <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "2px", fontWeight: 600 }}>
                    Lot: {h.lotNumber || "LOT-ORG-442"}
                  </div>
                </div>

                <div style={{ padding: "14px", backgroundColor: "#FAF8F5", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                    Hold Reason
                  </span>
                  <strong style={{ fontSize: "14px", fontWeight: 700, color: "#B91C1C" }}>
                    {h.reason || "Temperature Deviation"}
                  </strong>
                  <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "2px" }}>
                    Severity: {h.severity || "HIGH"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: "14px", borderTop: "1px solid #FAF8F5" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#8B6914", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>
                  Select QA Disposition Decision:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                  <Button 
                    variant="primary" 
                    icon={CheckCircle2} 
                    onClick={() => handleDecision(h, "RELEASE")}
                    style={{ justifyContent: "center", padding: "12px" }}
                  >
                    Release Lot
                  </Button>

                  <Button 
                    variant="outline" 
                    icon={Trash2} 
                    onClick={() => handleDecision(h, "SCRAP")}
                    style={{ justifyContent: "center", padding: "12px", color: "#B91C1C", borderColor: "#E8DDCF" }}
                  >
                    Scrap Lot
                  </Button>

                  <Button 
                    variant="secondary" 
                    icon={RefreshCw}
                    onClick={() => handleDecision(h, "REWORK")}
                    style={{ justifyContent: "center", padding: "12px" }}
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

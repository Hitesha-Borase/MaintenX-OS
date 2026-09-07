import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { SearchCode, FileText, CheckCircle } from "lucide-react";
import { useQualityStore } from "../utils/useQualityStore";
import { useApp } from "../../../context/AppContext";

export function Investigations() {
  const navigate = useNavigate();
  const qualityState = useQualityStore();
  const { addToast } = useApp();

  const [activeInv, setActiveInv] = useState(null);
  const [findingText, setFindingText] = useState("");

  const handleAddFinding = (e, invId) => {
    e.preventDefault();
    if (!findingText) return;
    qualityState.updateInvestigation(invId, { finding: findingText, status: "In Progress" });
    addToast(`Findings added to investigation ${invId}.`, "success");
    setFindingText("");
    setActiveInv(null);
  };

  const handleCreateCapa = (invId) => {
    // Navigate to RCACAPA page, potentially passing the invId as query param or local storage
    addToast("Routing to Corrective Actions (CAPA) module...", "info");
    setTimeout(() => navigate("/quality/rca-capa"), 1000);
  };

  const handleComplete = (invId, devId) => {
    qualityState.updateInvestigation(invId, { status: "Completed" });
    // Also resolve the deviation
    qualityState.updateDeviation(devId, "Resolved");
    addToast(`Investigation ${invId} marked as completed. Deviation resolved.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Quality Investigations
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {qualityState.investigations.map((i) => (
          <Card 
            key={i.id} 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px",
              padding: "24px", 
              borderRadius: "16px",
              borderLeft: i.status === "Completed" ? "4px solid #10B981" : "4px solid #F59E0B"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "250px" }}>
                <div style={{ padding: "10px", backgroundColor: i.status === "Completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                  <SearchCode size={24} color={i.status === "Completed" ? "#10B981" : "#F59E0B"} strokeWidth={2} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{i.id}</span>
                    <Badge variant={i.status === "Completed" ? "emerald" : "warning"}>{i.status}</Badge>
                  </div>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Linked Deviation: <strong style={{ color: "var(--text-primary)" }}>{i.devId}</strong></span>
                  {i.finding && (
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Finding: <em>"{i.finding}"</em></span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {i.status !== "Completed" && (
                  <>
                    {!i.finding ? (
                      <Button variant="outline" size="sm" icon={FileText} onClick={() => setActiveInv(activeInv === i.id ? null : i.id)}>
                        Add Finding
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleCreateCapa(i.id)}>
                        Add Corrective Action
                      </Button>
                    )}
                    {i.finding && (
                      <Button variant="success" size="sm" icon={CheckCircle} onClick={() => handleComplete(i.id, i.devId)}>
                        Complete Inv.
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {activeInv === i.id && (
              <form onSubmit={(e) => handleAddFinding(e, i.id)} style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Investigation Findings / Root Cause</label>
                  <input 
                    type="text"
                    value={findingText}
                    onChange={(e) => setFindingText(e.target.value)}
                    placeholder="e.g. Valve sensor malfunction led to temp drop..."
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                    required
                  />
                </div>
                <Button type="submit" variant="primary">Save Finding</Button>
                <Button type="button" variant="outline" onClick={() => setActiveInv(null)}>Cancel</Button>
              </form>
            )}
          </Card>
        ))}

        {qualityState.investigations.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No active investigations.</p>
          </div>
        )}
      </div>
    </div>
  );
}


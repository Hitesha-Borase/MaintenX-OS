import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Package, Play, CheckCircle, Search, AlertOctagon } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useQualityStore } from "../utils/useQualityStore";
import { useNavigate } from "react-router-dom";

export function ProductChecks() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const qualityState = useQualityStore();
  
  // Mock form state for completing a check
  const [activeCheckId, setActiveCheckId] = useState(null);
  
  const handleStartCheck = () => {
    // In a real app, this would open a modal to select a batch and create a check
    addToast("Started new Quality Check sequence.", "info");
    // Mock creating a new one
    qualityState.updateState({
      ...qualityState,
      checks: [
        { id: `CHK-100${qualityState.checks.length + 1}`, batch: "BAT-2026-0899", type: "Visual Inspection", status: "Pending", time: new Date().toLocaleTimeString().slice(0, 5) },
        ...qualityState.checks
      ]
    });
  };

  const handleCompleteCheck = (id, result) => {
    qualityState.updateCheck(id, result);
    setActiveCheckId(null);
    
    if (result === "PASS") {
      addToast(`Check ${id} passed. Proceed to CCP verification.`, "success");
      setTimeout(() => navigate("/quality/checks/ccp"), 1500);
    } else {
      addToast(`Check ${id} failed! Generating Quality Hold.`, "error");
      // Auto-generate a hold
      const holdId = `HLD-4${qualityState.holds.length + 1}`;
      qualityState.createHold({
        id: holdId,
        batch: "BAT-2026-0891", // mocked batch
        reason: "Failed Product Check",
        status: "Active",
        date: new Date().toISOString().split('T')[0]
      });
      setTimeout(() => navigate("/quality/events/holds"), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Quality Checks
          </h1>
        </div>
        <Button variant="primary" icon={Play} onClick={handleStartCheck}>
          Start Quality Check
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {qualityState.checks.map((check) => (
          <Card 
            key={check.id} 
            style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: "16px",
              padding: "20px 24px",
              borderRadius: "16px",
              borderLeft: `4px solid ${check.status === 'PASS' ? '#10B981' : check.status === 'FAIL' ? '#EF4444' : '#F59E0B'}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                  <Package size={24} color="#C89547" />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                    {check.id} - {check.type}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", gap: "12px" }}>
                    <span>Batch: <strong style={{ color: "var(--text-primary)" }}>{check.batch}</strong></span>
                    <span>Time: {check.time}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Badge variant={check.status === "PASS" ? "emerald" : check.status === "FAIL" ? "destructive" : "warning"}>
                  {check.status.toUpperCase()}
                </Badge>
                
                {check.status === "Pending" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveCheckId(activeCheckId === check.id ? null : check.id)}
                  >
                    Complete Check
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" icon={Search}>
                    View Details
                  </Button>
                )}
              </div>
            </div>

            {/* Inline Action Form for Pending Checks */}
            {activeCheckId === check.id && (
              <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Record Result:</span>
                <Button variant="primary" size="sm" icon={CheckCircle} onClick={() => handleCompleteCheck(check.id, "PASS")} style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}>
                  Mark as PASS
                </Button>
                <Button variant="outline" size="sm" icon={AlertOctagon} onClick={() => handleCompleteCheck(check.id, "FAIL")} style={{ color: "#EF4444", borderColor: "#EF4444" }}>
                  Mark as FAIL
                </Button>
              </div>
            )}
          </Card>
        ))}

        {qualityState.checks.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No quality checks currently recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
}


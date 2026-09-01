import React, { useState } from "react";
import { AlertOctagon, Check, Trash } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function QualityHolds() {
  const { addToast } = useApp();

  const [holds, setHolds] = useState([
    { id: "HLD-202", batch: "BAT-2026-0890", reason: "CCP Excursion on Pasteurizer", status: "ACTIVE RED TAG" }
  ]);

  const handleRelease = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} released from Quality Hold by QA signature.`, "success");
  };

  const handleScrap = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} marked as SCRAPPED by QA signature.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Quality Quarantine Holds
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Confirm product dispositions for quarantine lots. Human QA signature is required.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {holds.map((h) => (
          <Card 
            key={h.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderLeft: "4px solid #EF4444",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
              <AlertOctagon size={22} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Badge variant="slate" style={{ alignSelf: "flex-start", marginBottom: "4px" }}>{h.status}</Badge>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Reason: {h.reason}
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button variant="success" size="md" icon={Check} onClick={() => handleRelease(h.id, h.batch)}>
                    Release Lot
                  </Button>
                  <Button variant="danger" size="md" icon={Trash} onClick={() => handleScrap(h.id, h.batch)}>
                    Scrap Lot
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

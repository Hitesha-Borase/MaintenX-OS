import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { AlertOctagon } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function BlockedBatches() {
  const { addToast } = useApp();

  const [holds, setHolds] = useState([
    { id: 1, batch: "BAT-2026-0890", reason: "CCP Pasteurizer temp excursion to 82.9°C", blockedBy: "Maria Santos (QA Lead)", date: "2026-08-31", status: "HOLD" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setHolds(prev => prev.map(h => {
      if (h.id === id) {
        if (currentStatus === "HOLD") {
          addToast(`Batch ${h.batch} RELEASED.`, "success");
          return { ...h, status: "RELEASED" };
        } else {
          addToast(`Batch ${h.batch} placed on HOLD.`, "warning");
          return { ...h, status: "HOLD" };
        }
      }
      return h;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Blocked / Quality HOLD Batches
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Batches under QA hold pending investigation and disposition decision
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
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Reason: {h.reason} &bull; Blocked by: {h.blockedBy} &bull; {h.date}
                </span>
                <div 
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  onClick={() => handleToggleStatus(h.id, h.status)}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                >
                  <Badge variant={h.status === "HOLD" ? "slate" : "emerald"}>{h.status}</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

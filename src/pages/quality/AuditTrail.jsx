import React from "react";
import { Card } from "../../components/common/Card";
import { Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function AuditTrail() {
  const { addToast } = useApp();

  const events = [
    { id: 1, user: "Maria Santos (QA Lead)", action: "Blocked Batch BAT-2026-0890 — CCP excursion", time: "14:32" },
    { id: 2, user: "Maria Santos (QA Lead)", action: "Approved Release BAT-2026-0888", time: "12:10" },
    { id: 3, user: "Maria Santos (QA Lead)", action: "Signed Pre-Op Checklist Line 1", time: "07:45" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Audit Trail
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {events.map((e) => (
          <Card 
            key={e.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
            onClick={() => addToast(`Viewing audit details for: ${e.action}`, "info")}
            onMouseOver={(ev) => ev.currentTarget.style.transform = "scale(1.01)"}
            onMouseOut={(ev) => ev.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Clock size={22} color="#38BDF8" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{e.action}</strong> &bull; By: {e.user}
              </span>
            </div>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>{e.time}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}


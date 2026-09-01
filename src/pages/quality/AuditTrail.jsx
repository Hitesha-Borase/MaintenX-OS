import React from "react";
import { Card } from "../../components/common/Card";
import { Clock } from "lucide-react";

export function AuditTrail() {
  const events = [
    { user: "Maria Santos (QA Lead)", action: "Blocked Batch BAT-2026-0890 — CCP excursion", time: "14:32" },
    { user: "Maria Santos (QA Lead)", action: "Approved Release BAT-2026-0888", time: "12:10" },
    { user: "Maria Santos (QA Lead)", action: "Signed Pre-Op Checklist Line 1", time: "07:45" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Audit Trail
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Immutable log of all QA authorizations, holds, and release decisions
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {events.map((e, idx) => (
          <Card 
            key={idx} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
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

import React from "react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Clock } from "lucide-react";

export function AuditTrail() {
  const events = [
    { user: "Maria Santos (QA Lead)", action: "Blocked Batch BAT-2026-0890 — CCP excursion", time: "14:32" },
    { user: "Maria Santos (QA Lead)", action: "Approved Release BAT-2026-0888", time: "12:10" },
    { user: "Maria Santos (QA Lead)", action: "Signed Pre-Op Checklist Line 1", time: "07:45" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Audit Trail
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Immutable log of all QA authorizations, holds, and release decisions
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {events.map((e, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{e.action}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>By: {e.user}</span>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{e.time}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

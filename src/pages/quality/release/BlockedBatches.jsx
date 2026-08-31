import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShieldAlert } from "lucide-react";

export function BlockedBatches() {
  const holds = [
    { batch: "BAT-2026-0890", reason: "CCP Pasteurizer temp excursion to 82.9°C", blockedBy: "Maria Santos (QA Lead)", date: "2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Blocked / Quality HOLD Batches
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Batches under QA hold pending investigation and disposition decision
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {holds.map((h, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #EF4444" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert size={18} color="#EF4444" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Batch {h.batch}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Reason: {h.reason} • Blocked by: {h.blockedBy} • {h.date}
                </span>
              </div>
            </div>
            <Badge variant="danger">HOLD</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShieldCheck } from "lucide-react";

export function ApprovedReleases() {
  const releases = [
    { batch: "BAT-2026-0888", recipe: "Organic Orange Juice 1L", approvedBy: "Maria Santos (QA Lead)", date: "2026-08-30" },
    { batch: "BAT-2026-0889", recipe: "Organic Orange Juice 500ml", approvedBy: "Maria Santos (QA Lead)", date: "2026-08-30" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Approved QA Releases
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Historical record of human-approved batch quality releases
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {releases.map((r, idx) => (
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
              <ShieldCheck size={22} color="#10B981" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {r.recipe} &bull; Approved by: {r.approvedBy} &bull; {r.date}
              </span>
            </div>
            <Badge variant="emerald">APPROVED</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

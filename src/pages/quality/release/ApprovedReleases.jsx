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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Approved QA Releases
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Historical record of human-approved batch quality releases
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {releases.map((r, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={18} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Batch {r.batch}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {r.recipe} • Approved by: {r.approvedBy} • {r.date}
                </span>
              </div>
            </div>
            <Badge variant="emerald">Approved</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

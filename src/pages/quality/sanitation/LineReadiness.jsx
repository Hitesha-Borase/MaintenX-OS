import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { CalendarRange } from "lucide-react";

export function LineReadiness() {
  const readiness = [
    { line: "Line 1 (Aseptic Bottling)", safety: "PASSED", sanitation: "PASSED", status: "READY" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Line Readiness
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Operations overview of plant safety and sanitation clearances
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {readiness.map((r, idx) => (
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
              <CalendarRange size={22} color="#38BDF8" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Safety: {r.safety} &bull; Sanitation: {r.sanitation}
              </span>
            </div>
            <Badge variant="emerald">{r.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

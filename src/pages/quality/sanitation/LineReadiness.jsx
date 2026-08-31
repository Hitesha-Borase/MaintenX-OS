import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { CalendarRange } from "lucide-react";

export function LineReadiness() {
  const readiness = [
    { line: "Line 1 (Aseptic Bottling)", safety: "PASSED", sanitation: "PASSED", status: "READY" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Line Readiness
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of plant safety and sanitation clearances
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {readiness.map((r, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CalendarRange size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{r.line}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Safety: {r.safety} • Sanitation: {r.sanitation}
                </span>
              </div>
            </div>
            <Badge variant="emerald">{r.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

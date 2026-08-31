import React from "react";
import { FileCheck, Printer } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";

export function VerifiedSolutions() {
  const solutions = [
    { id: "VS-21", failure: "HTST Temperature Sensor Drift", fix: "Replace with PT100 probe + add pre-shift calibration check", effectiveness: "100%", date: "2026-07-14" },
    { id: "VS-19", failure: "Filler nozzle over-fill weight", fix: "Recalibrate fill volume ±0.2g using Mettler Toledo weigh module", effectiveness: "100%", date: "2026-06-20" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Verified Solutions Library</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Proven, effectiveness-verified solutions to recurring failures — searchable knowledge base</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {solutions.map((s) => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderLeft: "4px solid #10B981" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <FileCheck size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{s.id}: {s.failure}</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Fix: {s.fix}</p>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Effectiveness: {s.effectiveness} | Verified: {s.date}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Badge variant="emerald">Verified</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { ShieldCheck, Award } from "lucide-react";

export function QualityStatus() {
  const lineQA = [
    { line: "Line 1 (Aseptic Bottling)", activeBatch: "BAT-2026-0892", lastCheckTime: "14:00", brix: "11.9 °Bx (PASS)", ph: "3.72 pH (PASS)" },
    { line: "Line 2 (Blending)", activeBatch: "BAT-2026-0893", lastCheckTime: "13:30", brix: "12.0 °Bx (PASS)", ph: "3.68 pH (PASS)" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental QA Status
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {lineQA.map((qa, idx) => (
          <Card key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#10B981" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{qa.line}</span>
              </div>
              <Badge variant="emerald">PASS</Badge>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Batch: {qa.activeBatch} • Brix: {qa.brix} • pH: {qa.ph} • Time: {qa.lastCheckTime}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

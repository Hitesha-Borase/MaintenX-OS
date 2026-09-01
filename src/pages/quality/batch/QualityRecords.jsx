import React from "react";
import { Card } from "../../../components/common/Card";
import { FileSpreadsheet } from "lucide-react";

export function QualityRecords() {
  const records = [
    { batch: "BAT-2026-0888", type: "CCP Logs", ccp: "PASS", brix: "11.9°Bx", date: "2026-08-30" },
    { batch: "BAT-2026-0889", type: "CCP Logs", ccp: "PASS", brix: "11.8°Bx", date: "2026-08-30" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Batch Quality Records
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Electronic batch records including CCP readings, brix levels, and QA sign-offs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {records.map((r, idx) => (
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
              <FileSpreadsheet size={22} color="#38BDF8" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                CCP: {r.ccp} | Brix: {r.brix} | Date: {r.date}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

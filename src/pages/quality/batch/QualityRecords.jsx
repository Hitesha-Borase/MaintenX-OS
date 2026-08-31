import React from "react";
import { Card } from "../../../components/common/Card";
import { FileSpreadsheet } from "lucide-react";

export function QualityRecords() {
  const records = [
    { batch: "BAT-2026-0888", type: "CCP Logs", ccp: "PASS", brix: "11.9°Bx", date: "2026-08-30" },
    { batch: "BAT-2026-0889", type: "CCP Logs", ccp: "PASS", brix: "11.8°Bx", date: "2026-08-30" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Batch Quality Records
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Electronic batch records including CCP readings, brix levels, and QA sign-offs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {records.map((r, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileSpreadsheet size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{r.batch} — {r.type}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  CCP: {r.ccp} | Brix: {r.brix} | Date: {r.date}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

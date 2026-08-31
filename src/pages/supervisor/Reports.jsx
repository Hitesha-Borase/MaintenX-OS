import React from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export function Reports() {
  const reportsList = [
    { name: "Shift A Production OEE Summary", date: "2026-08-31" },
    { name: "Allergen Sanitation Clean Log", date: "2026-08-31" },
    { name: "CCP Parameter Compliance Audit", date: "2026-08-30" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supervisor Reports
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Access shift OEE, sanitation reports, and CCP validation logs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reportsList.map((rep, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileSpreadsheet size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{rep.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Logged: {rep.date}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Report
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

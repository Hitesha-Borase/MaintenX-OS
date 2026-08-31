import React from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export function Reports() {
  const reports = [
    { name: "Enterprise Cost & Variance Report (MTD)", date: "2026-08-31" },
    { name: "Multi-Plant OEE & Volume Performance Summary", date: "2026-08-31" },
    { name: "Continuous Improvement Annualized Savings Audit", date: "2026-08-31" },
    { name: "Regional SLA Service Level Scorecard", date: "2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Executive Reports Portfolio
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Access standard costing variance models, OEE waterlines, and CI savings realizations
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reports.map((rep, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileSpreadsheet size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{rep.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Date: {rep.date}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>Print</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

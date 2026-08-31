import React from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export function PlanningReports() {
  const reports = [
    { name: "Cost Optimization & Loss Report", date: "2026-08-31" },
    { name: "Safety Stock Projection Matrix", date: "2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supply Planning Reports
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Access cost-variance reviews, safety stock projections, and MRP validation reports
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reports.map((rep, idx) => (
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

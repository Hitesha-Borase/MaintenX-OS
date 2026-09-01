import React from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Reports() {
  const { addToast } = useApp();

  const reports = [
    { id: 1, name: "CCP Pasteurizer Temperature Log", date: "2026-08-31" },
    { id: 2, name: "Batch Release & Reject Summary", date: "2026-08-31" },
    { id: 3, name: "Quality Events & Deviations Report", date: "2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Assurance Reports
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Access CCP logs, batch release summaries, and quality events reports
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {reports.map((rep) => (
          <Card 
            key={rep.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileSpreadsheet size={22} color="#38BDF8" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{rep.name}</strong> &bull; Date: {rep.date}
              </span>
            </div>
            <Button 
              variant="secondary" 
              size="md" 
              icon={Printer} 
              onClick={() => {
                addToast(`Preparing ${rep.name} for print...`, "info");
                setTimeout(() => window.print(), 500);
              }}
            >
              Print
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

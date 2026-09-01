import React, { useState } from "react";
import { FileSpreadsheet, Printer, CheckCircle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function PlanningReports() {
  const { addToast } = useApp();
  
  const [reports, setReports] = useState([
    { id: "RPT-001", title: "Cost-Variance Review", date: "2026-08-31", printed: false },
    { id: "RPT-002", title: "Safety Stock Projection", date: "2026-08-31", printed: false }
  ]);

  const handlePrint = (id) => {
    addToast("Sending report to default printer...", "info");
    setTimeout(() => {
      addToast("Report printed successfully.", "success");
      setReports(prev => prev.map(r => r.id === id ? { ...r, printed: true } : r));
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Supply Planning Reports
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reports.map((rep) => (
          <Card key={rep.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "20px", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                <FileSpreadsheet size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{rep.title} ({rep.id})</h4>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Logged: {rep.date}
                </span>
              </div>
            </div>
            
            <Button 
              variant={rep.printed ? "outline" : "secondary"} 
              size="sm" 
              icon={rep.printed ? CheckCircle : Printer} 
              onClick={() => handlePrint(rep.id)}
              disabled={rep.printed}
              style={{ opacity: rep.printed ? 0.7 : 1 }}
            >
              {rep.printed ? "Printed" : "Print Report"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

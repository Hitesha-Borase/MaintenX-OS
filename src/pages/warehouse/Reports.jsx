import React from "react";
import { FileSpreadsheet, Printer } from "lucide-react";

export function Reports() {
  const reports = [
    { name: "Inbound Deliveries Logs", date: "2026-08-31" },
    { name: "Cycle Stock Variance Audit", date: "2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Warehouse Inventory Reports
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Access stock adjustments logs, cycle counts audit results, and delivery histories
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {reports.map((rep, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e8e6e1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <FileSpreadsheet size={24} color="#38bdf8" strokeWidth={2} />
              <span style={{ fontSize: "15px", color: "#71717a" }}>
                Logged: {rep.date}
              </span>
            </div>
            
            <button 
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#f5f1ea",
                color: "#524f4a",
                border: "1px solid #e8e3dc",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ebe5dc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5f1ea'}
            >
              <Printer size={16} strokeWidth={2} />
              Print Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

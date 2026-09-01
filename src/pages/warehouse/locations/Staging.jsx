import React, { useState } from "react";
import { CalendarRange, Check } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function Staging() {
  const { addToast } = useApp();

  const [stagingList, setStagingList] = useState([
    { id: "STG-01", bay: "STG-L1-IN", line: "Line 1 Aseptic", item: "Organic Orange Caps (LOT-ORG-442)", status: "Awaiting Line Pull" }
  ]);

  const handlePullConfirm = (id) => {
    setStagingList(prev =>
      prev.map(s => s.id === id ? { ...s, status: "Pulled to HMI" } : s)
    );
    addToast(`Materials staging pull confirmed. Production Line 1 notified.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Shop Floor Staging Bays
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Confirm staging line pulls for scheduled production runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {stagingList.map((s) => {
          const isAwaiting = s.status.toLowerCase().includes("awaiting");
          return (
            <div 
              key={s.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e8e6e1",
                borderLeft: isAwaiting ? "4px solid #f59e0b" : "4px solid #10b981",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <CalendarRange size={24} color="#38bdf8" strokeWidth={2} />
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: isAwaiting ? "#f4f4f5" : "#e8fbf0", 
                    color: isAwaiting ? "#52525b" : "#10b981", 
                    border: `1px solid ${isAwaiting ? "#e4e4e7" : "#a7e6c4"}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "15px", color: "#71717a", marginTop: "4px" }}>
                  Target: {s.line} <span style={{ margin: "0 4px" }}>•</span> Staged item: {s.item}
                </div>
              </div>

              {isAwaiting && (
                <button 
                  onClick={() => handlePullConfirm(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "#e8fbf0",
                    color: "#10b981",
                    border: "1px solid #a7e6c4",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1f4e0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e8fbf0'}
                >
                  <Check size={16} strokeWidth={2} />
                  Confirm Pull
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Layers, AlertCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function Lots() {
  const { addToast } = useApp();

  const [lots, setLots] = useState([
    { code: "LOT-ORG-442", name: "Aseptic Orange Caps", status: "Approved" },
    { code: "LOT-SW-0812", name: "Liquid Cane Sugar Sugar", status: "Approved" }
  ]);

  const handleQuarantine = (code) => {
    setLots(prev =>
      prev.map(l => l.code === code ? { ...l, status: "Quarantined" } : l)
    );
    addToast(`Lot ${code} quarantined. Material movement blocked.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Inventory Lot Controls
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Track and trace material lot codes and verify Quality releases
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {lots.map((l) => (
          <div 
            key={l.code} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: l.status === "Quarantined" ? "1px solid #fca5a5" : "1px solid #e8e6e1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <Layers size={24} color="#a855f7" strokeWidth={2} />
                <span style={{ 
                  padding: "6px 12px", 
                  backgroundColor: l.status === "Approved" ? "#e8fbf0" : "#fee2e2", 
                  color: l.status === "Approved" ? "#10b981" : "#ef4444", 
                  border: `1px solid ${l.status === "Approved" ? "#a7e6c4" : "#fca5a5"}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase"
                }}>
                  {l.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: "15px", color: "#71717a", marginTop: "4px" }}>
                Material: {l.name}
              </div>
            </div>

            {l.status === "Approved" && (
              <button 
                onClick={() => handleQuarantine(l.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  border: "1px solid #fca5a5",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              >
                <AlertCircle size={16} strokeWidth={2} />
                Quarantine
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

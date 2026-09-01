import React, { useState } from "react";
import { Send, FileText } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function Dispatch() {
  const { addToast } = useApp();

  const [dispatches, setDispatches] = useState([
    { id: "SO-9002", dest: "Target regional Chicago", cargo: "12 Pallets", status: "Staged" }
  ]);

  const handleDispatch = (id) => {
    setDispatches(prev => prev.map(d => 
      d.id === id ? { ...d, status: "Dispatched" } : d
    ));
    addToast(`Shipment ${id} dispatched. Bill of Lading (BOL) signed off.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Outbound Cargo Dispatch
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Confirm outbound carrier loading and sign off carrier Bills of Lading
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {dispatches.map((d) => {
          const isStaged = d.status === "Staged";
          return (
            <div 
              key={d.id} 
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
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <FileText size={24} color="#a855f7" strokeWidth={2} />
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: isStaged ? "#f4f4f5" : "#e8fbf0", 
                    color: isStaged ? "#52525b" : "#10b981", 
                    border: `1px solid ${isStaged ? "#e4e4e7" : "#a7e6c4"}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    {d.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "15px", color: "#71717a", marginTop: "4px" }}>
                  Freight: {d.cargo}
                </div>
              </div>

              <button 
                onClick={() => isStaged && handleDispatch(d.id)}
                disabled={!isStaged}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: isStaged ? "#e8fbf0" : "#f1f5f9",
                  color: isStaged ? "#10b981" : "#94a3b8",
                  border: isStaged ? "1px solid #a7e6c4" : "1px solid #e2e8f0",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isStaged ? "pointer" : "default",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => { if (isStaged) e.currentTarget.style.backgroundColor = '#d1f4e0' }}
                onMouseOut={(e) => { if (isStaged) e.currentTarget.style.backgroundColor = '#e8fbf0' }}
              >
                <Send size={16} strokeWidth={2} />
                {isStaged ? "Dispatch Cargo" : "Dispatched"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

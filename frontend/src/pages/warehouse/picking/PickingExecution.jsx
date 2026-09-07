import React, { useState } from "react";
import { CheckSquare, ArrowRight } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function PickingExecution() {
  const { addToast } = useApp();

  const [items, setItems] = useState([
    { id: 1, name: "Organic Orange Caps SKU-CAP-ORG-01", bin: "Bin A-01-B", qty: "1,500 Pcs", status: "Pending" }
  ]);

  const handlePick = (id, name) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, status: "Picked" } : item)
    );
    addToast(`Material pick confirmed: ${name}. Staged at STG-L1-IN.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Picking Execution Console
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item) => {
          const isPending = item.status.toLowerCase() === "pending";
          return (
            <div 
              key={item.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e8e6e1",
                borderLeft: isPending ? "4px solid #f59e0b" : "4px solid #10b981",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <CheckSquare size={24} color="#a855f7" strokeWidth={2} />
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: isPending ? "#f4f4f5" : "#e8fbf0", 
                    color: isPending ? "#52525b" : "#10b981", 
                    border: `1px solid ${isPending ? "#e4e4e7" : "#a7e6c4"}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "15px", color: "#71717a", marginTop: "4px" }}>
                  Location: {item.bin} <span style={{ margin: "0 4px" }}>•</span> Pick Target: {item.qty}
                </div>
              </div>

              <button 
                onClick={() => isPending && handlePick(item.id, item.name)}
                disabled={!isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: isPending ? "#e8fbf0" : "#f1f5f9",
                  color: isPending ? "#10b981" : "#94a3b8",
                  border: isPending ? "1px solid #a7e6c4" : "1px solid #e2e8f0",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isPending ? "pointer" : "default",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => { if(isPending) e.currentTarget.style.backgroundColor = '#d1f4e0' }}
                onMouseOut={(e) => { if(isPending) e.currentTarget.style.backgroundColor = '#e8fbf0' }}
              >
                <ArrowRight size={16} strokeWidth={2} />
                {isPending ? "Confirm Pick" : "Picked"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

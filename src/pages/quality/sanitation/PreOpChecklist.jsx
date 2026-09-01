import React, { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function PreOpChecklist() {
  const { addToast } = useApp();

  const [items, setItems] = useState([
    { id: 1, name: "Physical inspection of filler nozzle seals", passed: true },
    { id: 2, name: "Pasteurizer pipeline pressure calibration", passed: true },
    { id: 3, name: "Line 1 clean of raw debris and tools", passed: false }
  ]);

  const handleToggle = (id) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, passed: !item.passed } : item)
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    addToast("Line 1 Pre-Op checklist verified and saved.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Pre-Op Startup Checklist
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Confirm startup criteria verification checks before releasing the line to operator HMI
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px",
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #e8e6e1",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: item.passed ? "#f6fbf8" : "#f5f1ea",
                  border: item.passed ? "1px solid #10b981" : "1px solid #e8e3dc",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: "15px", color: "#2d2825", fontWeight: 500 }}>{item.name}</span>
                <CheckCircle2 size={20} color={item.passed ? "#10b981" : "#a1a1aa"} />
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 24px",
              background: "linear-gradient(to right, #cd9738, #deae53, #cd9738)",
              backgroundSize: "200% auto",
              color: "#18181b",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background-position 0.3s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundPosition = 'right center'}
            onMouseOut={(e) => e.currentTarget.style.backgroundPosition = 'left center'}
          >
            <Save size={18} strokeWidth={2.5} />
            Save Pre-Op Checklist
          </button>
        </div>
      </form>
    </div>
  );
}

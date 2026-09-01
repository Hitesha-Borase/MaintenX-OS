import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Package } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function SafetyStock() {
  const { addToast } = useApp();

  const [safety, setSafety] = useState([
    { id: 1, part: "Aseptic Glass Bottles 1L", safetyMin: 5000, current: 8500, status: "Secure Buffer" },
    { id: 2, part: "Orange Cap SKU-CAP-ORG-01", safetyMin: 4000, current: 2500, status: "Below Safety Buffer" }
  ]);

  const handleToggleRestock = (id) => {
    setSafety(prev => prev.map(s => {
      if (s.id === id) {
        if (s.current < s.safetyMin) {
          // Simulate restock
          addToast(`${s.part} restocked to safe levels.`, "success");
          return { ...s, current: s.safetyMin + 1500, status: "Secure Buffer" };
        } else {
          // Simulate usage dropping below buffer
          addToast(`${s.part} dropped below safety buffer!`, "warning");
          return { ...s, current: s.safetyMin - 1500, status: "Below Safety Buffer" };
        }
      }
      return s;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Inventory Safety Buffers
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Monitor on-hand raw stocks against minimum safety buffers to prevent stockouts
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {safety.map((s) => {
          const isLow = s.current < s.safetyMin;
          return (
            <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ padding: "10px", backgroundColor: isLow ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)", borderRadius: "10px" }}>
                  <Package size={24} color={isLow ? "#F59E0B" : "#10B981"} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{s.part}</h4>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Minimum Safety Limit: {s.safetyMin.toLocaleString()} | Current Stock: <span style={{ color: isLow ? "#F59E0B" : "inherit", fontWeight: isLow ? 700 : 500 }}>{s.current.toLocaleString()}</span>
                  </span>
                </div>
              </div>
              <div 
                onClick={() => handleToggleRestock(s.id)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <Badge variant={isLow ? "warning" : "emerald"}>{s.status.toUpperCase()}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

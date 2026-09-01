import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Shuffle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Badge } from "../../../components/common/Badge";

export function Changeovers() {
  const { addToast } = useApp();

  const [transitions, setTransitions] = useState([
    { id: 1, from: "SKU-AJ-500ML-ORG", to: "SKU-AJ-1L-ORG", duration: "45 Minutes", standardClean: "Standard Clean & Guides swap" },
    { id: 2, from: "SKU-AJ-1L-ORG", to: "SKU-AJ-250ML-KIDS", duration: "60 Minutes", standardClean: "Allergen flush & Guide swap" }
  ]);

  const handleToggleDuration = (id) => {
    setTransitions(prev => prev.map(t => {
      if (t.id === id) {
        if (t.duration.includes("45") || t.duration.includes("60")) {
          addToast(`Changeover duration optimized!`, "success");
          return { ...t, duration: "30 Minutes" };
        } else {
          addToast(`Changeover duration reset to standard.`, "info");
          return { ...t, duration: id === 1 ? "45 Minutes" : "60 Minutes" };
        }
      }
      return t;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          SKU Changeover Matrix
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {transitions.map((t) => (
          <Card key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Shuffle size={18} color="#EF4444" />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t.from} ➔ {t.to}
                </h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {t.standardClean}
                </span>
              </div>
            </div>
            <div 
              onClick={() => handleToggleDuration(t.id)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <span style={{ fontSize: "14px", fontWeight: 750, color: "#38BDF8" }}>
                {t.duration}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

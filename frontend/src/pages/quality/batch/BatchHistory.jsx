import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Clock } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function BatchHistory() {
  const { addToast } = useApp();

  const [history, setHistory] = useState([
    { id: "BAT-2026-0888", recipe: "Organic Orange Juice 1L", date: "2026-08-30", status: "RELEASED" },
    { id: "BAT-2026-0889", recipe: "Organic Orange Juice 500ml", date: "2026-08-30", status: "RELEASED" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setHistory(prev => prev.map(h => {
      if (h.id === id) {
        if (currentStatus === "RELEASED") {
          addToast(`${h.id} marked as ARCHIVED.`, "warning");
          return { ...h, status: "ARCHIVED" };
        } else {
          addToast(`${h.id} marked as RELEASED.`, "success");
          return { ...h, status: "RELEASED" };
        }
      }
      return h;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Historical Batch Quality Logs
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {history.map((h) => (
          <Card 
            key={h.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Clock size={22} color="#10B981" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Recipe: {h.recipe} &bull; Released Date: {h.date}
              </span>
            </div>
            <div 
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onClick={() => handleToggleStatus(h.id, h.status)}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={h.status === "RELEASED" ? "emerald" : "slate"}>{h.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { CalendarRange } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function LineReadiness() {
  const { addToast } = useApp();

  const [readiness, setReadiness] = useState([
    { id: 1, line: "Line 1 (Aseptic Bottling)", safety: "PASSED", sanitation: "PASSED", status: "READY" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setReadiness(prev => prev.map(r => {
      if (r.id === id) {
        if (currentStatus === "READY") {
          addToast(`${r.line} marked as NOT READY.`, "warning");
          return { ...r, status: "NOT READY", safety: "PENDING", sanitation: "PENDING" };
        } else {
          addToast(`${r.line} marked as READY.`, "success");
          return { ...r, status: "READY", safety: "PASSED", sanitation: "PASSED" };
        }
      }
      return r;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Line Readiness
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {readiness.map((r) => (
          <Card 
            key={r.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CalendarRange size={22} color="#38BDF8" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Safety: {r.safety} &bull; Sanitation: {r.sanitation}
              </span>
            </div>
            <div 
              onClick={() => handleToggleStatus(r.id, r.status)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={r.status === "READY" ? "emerald" : "warning"}>{r.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


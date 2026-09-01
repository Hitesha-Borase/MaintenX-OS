import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Activity } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function ProcessChecks() {
  const { addToast } = useApp();

  const [processes, setProcesses] = useState([
    { id: 1, name: "Blending agitator speed (Tank TK-02)", target: "450 RPM", actual: "448 RPM", status: "OK" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        if (currentStatus === "OK") {
          addToast(`${p.name} marked as WARNING.`, "warning");
          return { ...p, status: "WARNING" };
        } else {
          addToast(`${p.name} marked as OK.`, "success");
          return { ...p, status: "OK" };
        }
      }
      return p;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          In-Process Checks
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Operations overview of active line process parameters
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {processes.map((p) => (
          <Card 
            key={p.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                <Activity size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{p.name}</span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Target: {p.target} | Actual: <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>{p.actual}</strong>
                </span>
              </div>
            </div>
            <div 
              style={{ display: "flex", alignItems: "center", cursor: "pointer", transition: "opacity 0.2s" }}
              onClick={() => handleToggleStatus(p.id, p.status)}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={p.status === "OK" ? "emerald" : "warning"}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

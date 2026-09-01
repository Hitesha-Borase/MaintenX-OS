import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Factory } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function WorkCenterCapacity() {
  const { addToast } = useApp();

  const [centers, setCenters] = useState([
    { id: "WC-01", name: "Aseptic Filler WC-01", line: "Line 1", utilization: "92% Utilization", maxHrs: "144 Hours" },
    { id: "WC-02", name: "Blending Tank WC-02", line: "Line 2", utilization: "64% Utilization", maxHrs: "120 Hours" }
  ]);

  const handleToggleUtilization = (id) => {
    setCenters(prev => prev.map(c => {
      if (c.id === id) {
        if (c.utilization.includes("92%")) {
          addToast(`Load balanced for ${c.name}.`, "success");
          return { ...c, utilization: "75% Utilization" };
        } else if (c.utilization.includes("64%")) {
          addToast(`Load increased for ${c.name}!`, "warning");
          return { ...c, utilization: "85% Utilization" };
        } else {
          addToast(`Load reset for ${c.name}.`, "info");
          return { ...c, utilization: id === "WC-01" ? "92% Utilization" : "64% Utilization" };
        }
      }
      return c;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Work Center Utilization
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of active capacity limits and work center status
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {centers.map((c) => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Factory size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{c.name} ({c.id})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Scheduled Limit: {c.maxHrs} • Line: {c.line}
                </span>
              </div>
            </div>
            <div 
              onClick={() => handleToggleUtilization(c.id)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant="cyan">{c.utilization.toUpperCase()}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

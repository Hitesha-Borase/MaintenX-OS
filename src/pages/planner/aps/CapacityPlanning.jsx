import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { CalendarRange } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function CapacityPlanning() {
  const { addToast } = useApp();

  const [centers, setCenters] = useState([
    { id: 1, name: "Aseptic Filler WC-01", scheduledLoad: "92% Load", availableHrs: "120 Hours", status: "Highly Scheduled" },
    { id: 2, name: "Blending Tank WC-02", scheduledLoad: "64% Load", availableHrs: "80 Hours", status: "Secure Capacity" }
  ]);

  const handleToggleStatus = (id) => {
    setCenters(prev => prev.map(c => {
      if (c.id === id) {
        if (c.status.includes("Highly")) {
          addToast(`Load balanced for ${c.name}.`, "success");
          return { ...c, scheduledLoad: "65% Load", status: "Secure Capacity" };
        } else {
          addToast(`Load increased for ${c.name}!`, "warning");
          return { ...c, scheduledLoad: "95% Load", status: "Highly Scheduled" };
        }
      }
      return c;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          APS Capacity Planning
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {centers.map((c) => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CalendarRange size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{c.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Scheduled: {c.scheduledLoad} | Available: {c.availableHrs}
                </span>
              </div>
            </div>
            <div 
              onClick={() => handleToggleStatus(c.id)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={c.status.includes("Highly") ? "slate" : "emerald"}>
                {c.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

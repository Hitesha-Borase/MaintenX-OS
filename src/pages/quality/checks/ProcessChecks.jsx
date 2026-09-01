import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Activity } from "lucide-react";

export function ProcessChecks() {
  const processes = [
    { name: "Blending agitator speed (Tank TK-02)", target: "450 RPM", actual: "448 RPM", status: "OK" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          In-Process Checks
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Operations overview of active line process parameters
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {processes.map((p, idx) => (
          <Card 
            key={idx} 
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
            <div style={{ display: "flex", alignItems: "center" }}>
              <Badge variant="emerald">{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

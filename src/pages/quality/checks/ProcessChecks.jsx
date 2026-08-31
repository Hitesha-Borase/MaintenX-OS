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
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          In-Process Checks
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of active line process parameters
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {processes.map((p, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{p.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Target: {p.target} | Actual: {p.actual}
                </span>
              </div>
            </div>
            <Badge variant="emerald">{p.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

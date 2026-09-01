import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Factory } from "lucide-react";

export function WorkCenterCapacity() {
  const centers = [
    { id: "WC-01", name: "Aseptic Filler WC-01", line: "Line 1", utilization: "92% Utilization", maxHrs: "144 Hours" },
    { id: "WC-02", name: "Blending Tank WC-02", line: "Line 2", utilization: "64% Utilization", maxHrs: "120 Hours" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
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
            <Badge variant="cyan">{c.utilization}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

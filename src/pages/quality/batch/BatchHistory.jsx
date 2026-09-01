import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Clock } from "lucide-react";

export function BatchHistory() {
  const history = [
    { id: "BAT-2026-0888", recipe: "Organic Orange Juice 1L", date: "2026-08-30", status: "RELEASED" },
    { id: "BAT-2026-0889", recipe: "Organic Orange Juice 500ml", date: "2026-08-30", status: "RELEASED" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Historical Batch Quality Logs
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Operations overview of completed run releases
        </p>
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
            <Badge variant="emerald">{h.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

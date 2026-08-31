import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Clock } from "lucide-react";

export function BatchHistory() {
  const history = [
    { id: "BAT-2026-0888", recipe: "Organic Orange Juice 1L", date: "2026-08-30", status: "Released" },
    { id: "BAT-2026-0889", recipe: "Organic Orange Juice 500ml", date: "2026-08-30", status: "Released" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Historical Batch Quality Logs
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of completed run releases
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {history.map((h) => (
          <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={18} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Batch {h.id}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Recipe: {h.recipe} • Released Date: {h.date}
                </span>
              </div>
            </div>
            <Badge variant="emerald">{h.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

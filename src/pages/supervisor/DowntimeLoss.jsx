import React from "react";
import { useCMMS } from "../../context/CMMSContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Clock } from "lucide-react";

export function DowntimeLoss() {
  const { breakdowns } = useCMMS();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Department Downtime & Micro-Stops
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations breakdown logs and active line stop tracking
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {breakdowns.map((bd) => (
          <Card key={bd.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="#EF4444" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{bd.assetName} ({bd.assetId})</span>
                <Badge variant={!bd.endTime ? "danger" : "slate"}>{!bd.endTime ? "Active" : "Resolved"}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Reason: {bd.failureCategory} • Time Open: {bd.durationMinutes} min • Logged: {bd.startTime}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

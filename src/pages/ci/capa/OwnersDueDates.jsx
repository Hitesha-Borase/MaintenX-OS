import React from "react";
import { Users } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function OwnersDueDates() {
  const items = [
    { id: "CA-301", type: "Corrective", action: "Replace HTST temperature probe", owner: "Pedro Alves", due: "2026-09-02", status: "Overdue" },
    { id: "PA-101", type: "Preventive", action: "Monthly sensor calibration schedule", owner: "Engineering Team", due: "2026-09-15", status: "On Track" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          CAPA Owners & Due Dates
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track CAPA ownership accountability and completion target dates
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item) => (
          <Card key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.id} ({item.type})</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.action}</p>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Owner: {item.owner} | Due: {item.due}</span>
              </div>
            </div>
            <Badge variant={item.status === "Overdue" ? "danger" : "emerald"}>{item.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

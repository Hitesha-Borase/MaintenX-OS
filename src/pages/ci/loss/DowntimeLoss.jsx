import React from "react";
import { Clock } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";

export function DowntimeLoss() {
  const events = [
    { event: "Filler nozzle seal failure — Line 1", duration: "45 min", category: "Unplanned" },
    { event: "Changeover SKU-AJ-500ML → SKU-AJ-1L", duration: "32 min", category: "Planned" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Downtime Loss Analysis</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Planned and unplanned downtime events and total OEE Availability impact</p>
      </div>
      <div className="grid-3">
        <StatCard title="Planned Downtime" value="112 min" description="Changeovers + CIPs" icon={Clock} color="#38BDF8" />
        <StatCard title="Unplanned Downtime" value="67 min" description="Breakdowns + micro-stops" icon={Clock} color="#EF4444" />
        <StatCard title="Availability" value="93.8%" description="OEE Availability" icon={Clock} color="#10B981" />
      </div>
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>Top Downtime Events</h3>
        {events.map((ev, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
            <span style={{ color: "var(--text-primary)" }}>{ev.event}</span>
            <span style={{ color: ev.category === "Unplanned" ? "#EF4444" : "#38BDF8", fontWeight: 700 }}>{ev.duration} ({ev.category})</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

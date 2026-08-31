import React from "react";
import { Activity } from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";

export function ReliabilityInsights() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Reliability Insights</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Asset MTBF, MTTR, OEE Availability, and failure pattern analysis</p>
      </div>

      <div className="grid-4">
        <StatCard title="Fleet MTBF" value="112 hrs" description="vs. 95 hrs last month" icon={Activity} color="#10B981" />
        <StatCard title="Fleet MTTR" value="48 min" description="vs. 52 min target" icon={Activity} color="#38BDF8" />
        <StatCard title="OEE Availability" value="93.8%" description="vs. 95% target" icon={Activity} color="#F59E0B" />
        <StatCard title="Repeat Failures" value="2 Assets" description="HTST probe + filler nozzle" icon={Activity} color="#EF4444" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>Top Assets by Downtime (Week)</h3>
        {[
          { asset: "HTST Pasteurizer — Line 1", mtbf: "88 hrs", mttr: "45 min", failures: 2 },
          { asset: "Filler — Line 1", mtbf: "102 hrs", mttr: "38 min", failures: 1 }
        ].map((a, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: "6px", marginBottom: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{a.asset}</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              MTBF: {a.mtbf} | MTTR: {a.mttr} | Failures: <strong style={{ color: "#EF4444" }}>{a.failures}</strong>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

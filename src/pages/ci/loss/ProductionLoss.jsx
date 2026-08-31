import React from "react";
import { Factory } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";

export function ProductionLoss() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Production Loss Analysis</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Weekly production loss waterfall vs target output</p>
      </div>
      <div className="grid-3">
        <StatCard title="Target Output" value="480,000 Bottles" description="Week target" icon={Factory} color="#38BDF8" />
        <StatCard title="Actual Output" value="421,440 Bottles" description="Achieved" icon={Factory} color="#10B981" />
        <StatCard title="Production Loss" value="58,560 Bottles (12.2%)" description="Below target" icon={Factory} color="#EF4444" />
      </div>
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>Top Loss Causes</h3>
        {[["Planned Downtime", "3.2%"], ["Unplanned Breakdowns", "4.1%"], ["Quality Rejects", "2.8%"], ["Speed Loss", "2.1%"]].map(([cause, pct], idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
            <span style={{ color: "var(--text-primary)" }}>{cause}</span>
            <span style={{ color: "#EF4444", fontWeight: 700 }}>{pct}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

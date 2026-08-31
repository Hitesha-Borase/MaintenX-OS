import React from "react";
import { LineChart } from "lucide-react";
import { StatCard } from "../../../components/common/StatCard";
import { Card } from "../../../components/common/Card";

export function YieldLoss() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Yield Loss Analysis</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Raw material yield conversion efficiency and loss tracking</p>
      </div>
      <div className="grid-3">
        <StatCard title="Theoretical Yield" value="100%" description="Ideal ingredient conversion" icon={LineChart} color="#38BDF8" />
        <StatCard title="Actual Yield" value="96.9%" description="Per batch fill weight audit" icon={LineChart} color="#10B981" />
        <StatCard title="Yield Gap" value="3.1%" description="Material efficiency opportunity" icon={LineChart} color="#A855F7" />
      </div>
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>Yield Loss Breakdown</h3>
        {[["Filler dribble and nozzle overweight", "1.2%"], ["Tank heel / pipeline flush losses", "0.9%"], ["CIP chemical rinse losses", "1.0%"]].map(([cause, pct], idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
            <span style={{ color: "var(--text-primary)" }}>{cause}</span>
            <span style={{ color: "#A855F7", fontWeight: 700 }}>{pct}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

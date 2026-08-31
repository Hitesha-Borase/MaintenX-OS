import React from "react";
import { ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";

export function QualityLoss() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Quality Loss Analysis</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>First-pass yield failures, rejects, and rework OEE impact</p>
      </div>
      <div className="grid-3">
        <StatCard title="Total Quality Loss" value="3.1% OEE" description="FPY impact this week" icon={ShieldAlert} color="#EF4444" />
        <StatCard title="Batch Rejects" value="1 Batch" description="BAT-2026-0890 — CCP" icon={ShieldAlert} color="#F59E0B" />
        <StatCard title="First Pass Yield" value="96.9%" description="vs. 98% target" icon={ShieldAlert} color="#10B981" />
      </div>
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>Quality Loss Causes</h3>
        {[["CCP Excursion Reject", "2.1%"], ["Seal torque out-of-spec", "0.6%"], ["Label application defect", "0.4%"]].map(([cause, pct], idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
            <span style={{ color: "var(--text-primary)" }}>{cause}</span>
            <span style={{ color: "#EF4444", fontWeight: 700 }}>{pct}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

import React from "react";
import { Trash2 } from "lucide-react";
import { StatCard } from "../../../components/common/StatCard";
import { Card } from "../../../components/common/Card";

export function ScrapReworkLoss() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Scrap & Rework Loss</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Batches rejected for scrap vs. rework and associated material cost impact</p>
      </div>
      <div className="grid-3">
        <StatCard title="Scrap Loss (Week)" value="1 Batch / $4,200" description="CCP reject" icon={Trash2} color="#EF4444" />
        <StatCard title="Rework Loss (Week)" value="0 Batches" description="No rework orders" icon={Trash2} color="#10B981" />
        <StatCard title="Scrap Rate" value="0.8% of Production" description="vs. <0.5% target" icon={Trash2} color="#F59E0B" />
      </div>
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>Scrap Events</h3>
        {[["BAT-2026-0890 — CCP Pasteurizer excursion", "$4,200", "Destroyed"]].map(([batch, cost, disposition], idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
            <span style={{ color: "var(--text-primary)" }}>{batch}</span>
            <span style={{ color: "#EF4444", fontWeight: 700 }}>{cost} — {disposition}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

import React from "react";
import { Settings } from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";

export function Engineering() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Engineering Dashboard</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Engineering project register, capex tracking, and facility modification requests</p>
      </div>

      <div className="grid-3">
        <StatCard title="Open Engineering Projects" value="2" description="Active capital projects" icon={Settings} color="#38BDF8" />
        <StatCard title="Change Requests" value="3 Pending" description="Awaiting engineering sign-off" icon={Settings} color="#F59E0B" />
        <StatCard title="CAPEX Spend YTD" value="$82,400" description="vs. $110,000 budget" icon={Settings} color="#10B981" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>Active Engineering Projects</h3>
        {[
          { name: "Filler Line 1 — Fill Volume Control Upgrade", status: "In Progress", budget: "$38,000" },
          { name: "CIP Skid Automation Retrofit", status: "Design Phase", budget: "$44,400" }
        ].map((proj, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: "6px", marginBottom: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", display: "block" }}>{proj.name}</span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Budget: {proj.budget}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>{proj.status}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

import React from "react";
import { DollarSign } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";

export function Savings() {
  const projects = [
    { id: "CI-001", title: "OEE Improvement — Line 1 Filler", projected: "$42,000", actual: "$38,200", verified: false },
    { id: "CI-002", title: "CIP Cycle Time Reduction", projected: "$18,000", actual: "$14,800", verified: false },
    { id: "CI-003", title: "Label Application Defect Elimination", projected: "$11,200", actual: "$11,200", verified: true }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>CI Project Savings Tracker</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Track projected vs. realized savings across all CI projects</p>
      </div>
      <div className="grid-3">
        <StatCard title="YTD Projected Savings" value="$71,200" description="Across all active projects" icon={DollarSign} color="#38BDF8" />
        <StatCard title="YTD Actual Savings" value="$64,200" description="Realized to date" icon={DollarSign} color="#10B981" />
        <StatCard title="Verified Savings" value="$11,200" description="Formally benefits-verified" icon={DollarSign} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>Project Savings Breakdown</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {projects.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{p.id}: {p.title}</span>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Projected: {p.projected} → Actual: <strong style={{ color: "#10B981" }}>{p.actual}</strong>
                </div>
              </div>
              {p.verified && <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>✓ Verified</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

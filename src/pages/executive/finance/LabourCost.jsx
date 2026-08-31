import React from "react";
import { Users, AlertCircle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function LabourCost() {
  const { addToast } = useApp();

  const handleAudit = () => {
    addToast("Triggered direct labor wage allocation audit...", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Labour Cost Analysis
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Monitor direct operators, line lead, shift premiums, and direct labour variance
          </p>
        </div>
        <Button variant="secondary" icon={AlertCircle} onClick={handleAudit}>
          Audit Labor Allocation
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Labor Cost (MTD)" value="$118,500" description="Std target: $110,000" icon={Users} color="#38BDF8" />
        <StatCard title="Direct Labor Efficiency" value="94.2%" description="Resource utilization rate" icon={Users} color="#10B981" />
        <StatCard title="Overtime Premiums" value="$8,500" description="Due to Line 1 breakdown delays" icon={Users} color="#EF4444" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Labor Standard vs. Actual Rates</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { role: "Line Operator", stdRate: "$22.00/hr", actRate: "$22.50/hr", variance: "+$0.50/hr", status: "Over" },
            { role: "Line Lead / Setup", stdRate: "$28.00/hr", actRate: "$28.00/hr", variance: "$0.00/hr", status: "Optimal" },
            { role: "Operations Supervisor", stdRate: "$35.00/hr", actRate: "$35.00/hr", variance: "$0.00/hr", status: "Optimal" },
            { role: "Overtime Premium (1.5x)", stdRate: "$33.00/hr", actRate: "$36.20/hr", variance: "+$3.20/hr", status: "Over" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.role}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Std Rate: {item.stdRate}</span>
                  <span>Act Rate: <strong>{item.actRate}</strong></span>
                </div>
              </div>
              <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#10B981" : "#EF4444", fontWeight: 700 }}>
                {item.variance}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import React from "react";
import { LineChart, DollarSign } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function CostVariance() {
  const { addToast } = useApp();

  const handleValidate = () => {
    addToast("Manufacturing target variance checks executed.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Cost Variance Analysis
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Identify costing gaps between standard theoretical projections and actual plant outcomes
          </p>
        </div>
        <Button variant="secondary" icon={LineChart} onClick={handleValidate}>
          Validate Variance Targets
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Cost Variance" value="+$12,800" description="Over budget MTD" icon={DollarSign} color="#EF4444" />
        <StatCard title="Material Yield Variance" value="+$5,200" description="Due to raw milk weight drift" icon={DollarSign} color="#EF4444" />
        <StatCard title="Labour Variance" value="+$8,500" description="Due to unplanned line changeovers" icon={DollarSign} color="#EF4444" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Variance Breakdown by Department</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { dept: "Blending / Processing", variance: "+$4,800", cause: "Base ingredient yield loss" },
            { dept: "Filling / Bottling", variance: "+$2,200", cause: "Nozzle overweight calibration variance" },
            { dept: "Packaging & Case Packing", variance: "-$900", cause: "Under standard case carton wastage" },
            { dept: "Direct Labour & Shift Premiums", variance: "+$6,700", cause: "Line breakdowns extending overtime" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.dept}</span>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Cause: {item.cause}</p>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: item.variance.startsWith("+") ? "#EF4444" : "#10B981" }}>{item.variance}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

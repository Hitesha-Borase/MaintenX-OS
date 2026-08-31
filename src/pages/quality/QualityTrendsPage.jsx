import React, { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  BarChart2
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";

export function QualityTrendsPage() {
  const { addToast } = useApp();

  const defectPareto = [
    { label: "Cap Seal Torque Deviation", value: 38 },
    { label: "Fill Volume Under/Overfill", value: 24 },
    { label: "Label Skew / Wrinkles", value: 18 },
    { label: "Foreign Particulate Swab", value: 12 },
    { label: "Date Code Ink Smudge", value: 8 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Statistical Process Control (SPC) & Quality Trends
            </h1>
            <Badge variant="emerald">Cpk 1.48 (Capable)</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Six-sigma process capability analysis, control limit deviations, defect category Pareto, and yield stability.
          </p>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Process Capability (Cpk)"
          value="1.48"
          unit="Six-Sigma"
          trend={{ value: "Target: > 1.33 Capable", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="emerald"
        />
        <StatCard
          title="Process Performance (Ppk)"
          value="1.42"
          unit="Ppk Index"
          trend={{ value: "Stable long-term capability", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Defect Pareto Concentration"
          value="62%"
          unit="Top 2 Causes"
          trend={{ value: "Cap torque & fill volume", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Defect Pareto */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Defect Category Pareto Distribution
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Percentage contribution to total quality rejections
              </p>
            </div>
            <Badge variant="rose">Top Drivers</Badge>
          </div>

          <BarChart
            data={defectPareto}
            height={220}
            color="#EF4444"
            unit="%"
          />
        </Card>

        {/* Cpk Capability Trend */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly Process Capability (Cpk) Trajectory
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Continuous variance reduction across filling lines
              </p>
            </div>
            <Badge variant="emerald">UCL: 1.60</Badge>
          </div>

          <AreaChart
            data={[
              { label: "Mar", value: 1.34 },
              { label: "Apr", value: 1.38 },
              { label: "May", value: 1.41 },
              { label: "Jun", value: 1.44 },
              { label: "Jul", value: 1.46 },
              { label: "Aug", value: 1.48 }
            ]}
            height={220}
            color="#10B981"
            unit=""
          />
        </Card>
      </div>
    </div>
  );
}

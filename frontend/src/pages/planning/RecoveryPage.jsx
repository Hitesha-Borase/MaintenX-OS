import React, { useState } from "react";
import {
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function RecoveryPage() {
  const { addToast } = useApp();

  const [speedBoostPercent, setSpeedBoostPercent] = useState(5);
  const [overtimeHours, setOvertimeHours] = useState(1.5);

  const unitsRecoveredFromSpeed = Math.round(4200 * (speedBoostPercent / 100) * 8);
  const unitsRecoveredFromOT = Math.round(4200 * overtimeHours);
  const totalRecovered = unitsRecoveredFromSpeed + unitsRecoveredFromOT;

  const handleApplyPlan = () => {
    addToast(
      `Recovery Plan applied: +${totalRecovered.toLocaleString()} units projected recovery. Line speed set to ${100 + speedBoostPercent}%.`,
      "success"
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Schedule Recovery & Catch-Up Simulator
            </h1>
            <Badge variant="emerald">DYNAMIC SCENARIO MODELING</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Play} onClick={handleApplyPlan} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Apply Recovery Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Recovery Volume"
          value={`+${totalRecovered.toLocaleString()}`}
          unit="Units"
          trend={{ value: "Covers 100% of morning downtime lag", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Line Speed Adjustment"
          value={`+${speedBoostPercent}%`}
          unit="Over Nominal"
          trend={{ value: `${100 + speedBoostPercent}% operational speed`, isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Shift Extension"
          value={`+${overtimeHours} hrs`}
          unit="Overtime"
          trend={{ value: "Approved within labor budget", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Recovery Feasibility"
          value="100%"
          unit="Simulated"
          trend={{ value: "Within thermal & machine thresholds", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Simulator Interactive Card */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px" }}>
          Scenario Modeler: Real-Time Output Recovery
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>1. Controlled Line Acceleration Boost:</span>
              <strong style={{ color: "#8C5B23" }}>+{speedBoostPercent}% ({unitsRecoveredFromSpeed.toLocaleString()} units)</strong>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={speedBoostPercent}
              onChange={(e) => setSpeedBoostPercent(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8C5B23", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>0% (Nominal Speed)</span>
              <span>+5% (Standard Lean Catch-up)</span>
              <span>+10% (Maximum Machine Limit)</span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>2. Shift Extension / Overtime Buffer:</span>
              <strong style={{ color: "#8C5B23" }}>+{overtimeHours} hrs ({unitsRecoveredFromOT.toLocaleString()} units)</strong>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8C5B23", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>0 hrs (Normal Shift End)</span>
              <span>1.5 hrs (Shift Handoff Extension)</span>
              <span>3.0 hrs (Double Shift Buffer)</span>
            </div>
          </div>

          {/* Result Banner */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#059669", fontWeight: 800, textTransform: "uppercase" }}>
                Total Projected Volume Recovery
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                +{totalRecovered.toLocaleString()} Units Recovered
              </div>
            </div>

            <Button variant="primary" onClick={handleApplyPlan} style={{ fontSize: "12px", padding: "7px 14px" }}>
              Commit Catch-Up Plan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

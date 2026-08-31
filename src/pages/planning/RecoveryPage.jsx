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
  DollarSign
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function RecoveryPage() {
  const { addToast } = useApp();

  const [speedBoostPercent, setSpeedBoostPercent] = useState(5); // +5% speed
  const [overtimeHours, setOvertimeHours] = useState(1.5); // 1.5 hrs overtime

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Schedule Recovery & Catch-Up Simulator
            </h1>
            <Badge variant="emerald">Dynamic Scenario Modeling</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Model recovery scenarios after downtime: speed acceleration, shift overtime extension, and dynamic line reallocation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Play} onClick={handleApplyPlan}>
            Apply Selected Recovery Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Projected Recovery Volume"
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
          colorVariant="blue"
        />
      </div>

      {/* Simulator Interactive Card */}
      <Card>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px" }}>
          Scenario Modeler: Real-Time Output Recovery
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>1. Controlled Line Acceleration Boost:</span>
              <strong style={{ color: "#38BDF8" }}>+{speedBoostPercent}% ({unitsRecoveredFromSpeed.toLocaleString()} units)</strong>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={speedBoostPercent}
              onChange={(e) => setSpeedBoostPercent(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#38BDF8", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>0% (Nominal Speed)</span>
              <span>+5% (Standard Lean Catch-up)</span>
              <span>+10% (Maximum Machine Limit)</span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>2. Shift Extension / Overtime Buffer:</span>
              <strong style={{ color: "#F59E0B" }}>+{overtimeHours} hrs ({unitsRecoveredFromOT.toLocaleString()} units)</strong>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#F59E0B", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>0 hrs (Normal Shift End)</span>
              <span>1.5 hrs (Shift Handoff Extension)</span>
              <span>3.0 hrs (Double Shift Buffer)</span>
            </div>
          </div>

          {/* Result Banner */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#10B981", fontWeight: 700, textTransform: "uppercase" }}>
                Total Projected Volume Recovery
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#10B981", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                +{totalRecovered.toLocaleString()} Units Recovered
              </div>
            </div>

            <Button variant="primary" onClick={handleApplyPlan}>
              Commit Catch-Up Plan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

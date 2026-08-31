import React, { useState } from "react";
import { Gauge, TrendingUp, RefreshCw, Layers } from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionPerformance() {
  const { productionOrders } = useProduction();
  const { addToast } = useApp();

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];

  const [hoursLeft, setHoursLeft] = useState(3.5);
  const [overrideTarget, setOverrideTarget] = useState(activeOrder.targetQuantity);

  const actual = activeOrder.producedQuantity;
  const remaining = Math.max(0, overrideTarget - actual);
  const calculatedRecoveryBPM = Math.round(remaining / (hoursLeft * 60));

  const handleApplyOverride = () => {
    addToast("Target override updated. Schedule recovery recalculated.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Performance & Pace Analytics
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor pace deviations, hour-by-hour metrics, and schedule recovery
        </p>
      </div>

      {/* Speed Metrics Grid */}
      <div className="grid-2">
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Attainment Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF" }}>
              {actual.toLocaleString()} Bottles
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Target: {overrideTarget.toLocaleString()} Bottles
            </span>
          </div>

          <div style={{ width: "100%", height: "8px", backgroundColor: "#1E293B", borderRadius: "4px", overflow: "hidden", marginTop: "10px" }}>
            <div
              style={{
                width: `${Math.min(100, Math.round((actual / overrideTarget) * 100))}%`,
                height: "100%",
                backgroundColor: "#10B981"
              }}
            />
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Speed Parameters
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Current Line Speed:</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{activeOrder.currentSpeedBPM} BPM</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Target Speed:</span>
            <span style={{ fontWeight: 600, color: "#38BDF8" }}>{activeOrder.targetSpeedBPM} BPM</span>
          </div>
        </Card>
      </div>

      {/* Recovery Calculator */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
          <TrendingUp size={16} color="#A855F7" /> Recovery Pace Calculator
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Remaining Shift Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={hoursLeft}
              onChange={(e) => setHoursLeft(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Target Output (Bottles)
            </label>
            <input
              type="number"
              value={overrideTarget}
              onChange={(e) => setOverrideTarget(Math.max(actual, parseInt(e.target.value) || 0))}
              className="input-field"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "6px", backgroundColor: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Calculated Recovery Target:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#A855F7", display: "block", marginTop: "2px" }}>
              {calculatedRecoveryBPM} BPM
            </span>
          </div>

          <Button variant="secondary" onClick={handleApplyOverride}>
            Apply Target Override
          </Button>
        </div>
      </Card>
    </div>
  );
}

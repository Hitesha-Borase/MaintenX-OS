import React from "react";
import { useProduction } from "../../context/ProductionContext";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Gauge, Target, TrendingUp } from "lucide-react";

export function ProductionPerformance() {
  const { productionOrders } = useProduction();

  const activeOrder = productionOrders[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental OEE & Performance
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track availability, performance rate, and hourly target compliance
        </p>
      </div>

      <div className="grid-3">
        <StatCard title="OEE Rating" value={`${activeOrder?.currentOEE || 85}%`} description="Target: 85.0%" icon={Gauge} color="#10B981" />
        <StatCard title="Performance Rate" value={`${activeOrder?.performance || 96.6}%`} description="Target: 95.0%" icon={Target} color="#38BDF8" />
        <StatCard title="Quality Rate" value={`${activeOrder?.qualityRate || 98.1}%`} description="Target: 99.0%" icon={TrendingUp} color="#10B981" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>
          Production Velocity Analysis
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Line 1 is currently operating at <strong style={{ color: "#FFFFFF" }}>{activeOrder?.currentSpeedBPM} BPM</strong>.
          Availability losses are primarily driven by the scheduled wash CIP cycle and transition changeovers.
        </p>
      </Card>
    </div>
  );
}

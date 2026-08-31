import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  CalendarRange,
  Layers,
  AlertTriangle,
  BrainCircuit,
  ShoppingBag,
  LineChart,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export function PlannerDashboard() {
  const navigate = useNavigate();

  const [horizon, setHorizon] = useState("14d"); // "14d" detailed execution, "90d" projection

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header and Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Supply Chain Planning Dashboard
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Demand planning, MRP net requirements, scheduling, and capacity constraints
          </p>
        </div>

        <div style={{ display: "flex", gap: "4px", backgroundColor: "#0F172A", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => setHorizon("14d")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: horizon === "14d" ? "#0284C7" : "transparent",
              color: horizon === "14d" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer"
            }}
          >
            14-Day Execution Horizon
          </button>
          <button
            onClick={() => setHorizon("90d")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: horizon === "90d" ? "#0284C7" : "transparent",
              color: horizon === "90d" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer"
            }}
          >
            90-Day Projection
          </button>
        </div>
      </div>

      {/* Stats tickers */}
      <div className="grid-4">
        <StatCard
          title="Active Customer Demand"
          value={horizon === "14d" ? "42,000 Cases" : "248,000 Cases"}
          description="Firm commitments"
          icon={ShoppingBag}
          color="#38BDF8"
        />
        <StatCard
          title="Forecasted Uplift"
          value="+12.4%"
          description="Promotion events active"
          icon={LineChart}
          color="#10B981"
        />
        <StatCard
          title="Active Material Shortages"
          value={horizon === "14d" ? "1 SKU Alert" : "3 SKU Alerts"}
          description="Aseptic orange caps safety stock"
          icon={AlertTriangle}
          color="#F59E0B"
        />
        <StatCard
          title="Service Risk Index"
          value={horizon === "14d" ? "0.2% OTIF Penalty" : "1.8% Risk Proj."}
          description="Target OTIF: 98.5%"
          icon={ShieldAlert}
          color={horizon === "14d" ? "#10B981" : "#EF4444"}
        />
      </div>

      {/* Operational Modules Oversight */}
      <div className="grid-2">
        {/* MRP Net Requirements & Shortages */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={16} color="#A855F7" /> MRP Material Allocation
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Orange Caps Stock:</span>
              <Badge variant="warning">Shortage Week 2</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>1L Aseptic Glass:</span>
              <Badge variant="emerald">Safety Stock OK</Badge>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/planner/mrp/shortages")} style={{ marginTop: "auto" }}>
            Check Material Shortages
          </Button>
        </Card>

        {/* Scheduling & APS Capacity */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <CalendarRange size={16} color="#10B981" /> Capacity & Scheduling (APS)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Work Center 1 (Filling):</span>
              <span style={{ fontWeight: 600 }}>92% Scheduled Capacity</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Active Schedule Version:</span>
              <Badge variant="emerald">V4.2 Published</Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
            <Button variant="secondary" onClick={() => navigate("/planner/aps/scheduler")} style={{ flex: 1 }}>
              APS Scheduler
            </Button>
            <Button variant="secondary" onClick={() => navigate("/planner/aps/capacity")} style={{ flex: 1 }}>
              Capacity Plans
            </Button>
          </div>
        </Card>
      </div>

      {/* AI Assistant Callout */}
      <Card style={{ borderLeft: "4px solid #06B6D4", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <BrainCircuit size={16} color="#06B6D4" /> AI Planning Assistant Recommendation
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            "Forecasted Organic Concentrate demand exceeds safety stocks for Shift C. Recommend moving Blending Order #ORD-908 to next Tuesday."
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/planner/ai-assistant")}>
          Open Planning Assistant
        </Button>
      </Card>
    </div>
  );
}

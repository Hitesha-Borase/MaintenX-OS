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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`
        /* Mobile Responsiveness for Planner Dashboard */
        @media (max-width: 600px) {
          .planner-header-toggle {
            flex-direction: column !important;
            width: 100%;
          }
          .planner-header-toggle button {
            width: 100%;
            text-align: center;
          }
          .planner-card-buttons {
            flex-direction: column !important;
            width: 100%;
          }
          .planner-card-buttons button {
            width: 100%;
          }
          .ai-callout-btn {
            width: 100%;
          }
        }
      `}</style>
      
      {/* Header and Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Supply Chain Planning Dashboard
          </h1>

        </div>

        <div className="planner-header-toggle" style={{ display: "flex", gap: "4px", backgroundColor: "#0F172A", padding: "6px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => setHorizon("14d")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: horizon === "14d" ? "#C89547" : "transparent",
              color: horizon === "14d" ? "#261603" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            14-Day Execution Horizon
          </button>
          <button
            onClick={() => setHorizon("90d")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: horizon === "90d" ? "#C89547" : "transparent",
              color: horizon === "90d" ? "#261603" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            90-Day Projection
          </button>
        </div>
      </div>

      {/* Stats tickers */}
      <div className="grid-3">
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
      </div>

      {/* Operational Modules Oversight */}
      <div className="grid-2">
        {/* MRP Net Requirements & Shortages */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Layers size={20} color="#A855F7" strokeWidth={2} /> MRP Material Allocation
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Orange Caps Stock:</span>
              <Badge variant="warning">Shortage Week 2</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>1L Aseptic Glass:</span>
              <Badge variant="emerald">Safety Stock OK</Badge>
            </div>
          </div>
          <div className="planner-card-buttons" style={{ display: "flex", marginTop: "auto", gap: "8px" }}>
            <Button variant="secondary" onClick={() => navigate("/planner/mrp/shortages")} style={{ flex: 1 }}>
              Check Material Shortages
            </Button>
          </div>
        </Card>

        {/* Scheduling & APS Capacity */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <CalendarRange size={20} color="#10B981" strokeWidth={2} /> Capacity & Scheduling (APS)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Work Center 1 (Filling):</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>92% Scheduled Capacity</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Active Schedule Version:</span>
              <Badge variant="emerald">V4.2 Published</Badge>
            </div>
          </div>
          <div className="planner-card-buttons" style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
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
      <Card style={{ borderLeft: "4px solid #06B6D4", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", padding: "24px", borderRadius: "16px" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <BrainCircuit size={20} color="#06B6D4" strokeWidth={2} /> AI Planning Assistant Recommendation
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.5" }}>
            "Forecasted Organic Concentrate demand exceeds safety stocks for Shift C. Recommend moving Blending Order #ORD-908 to next Tuesday."
          </p>
        </div>
        <div className="ai-callout-btn" style={{ flexShrink: 0 }}>
          <Button variant="primary" onClick={() => navigate("/planner/ai-assistant")} style={{ width: "100%" }}>
            Open Planning Assistant
          </Button>
        </div>
      </Card>
    </div>
  );
}

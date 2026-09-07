import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanning } from "../../context/PlanningContext";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import {
  TrendingUp,
  CalendarRange,
  Layers,
  AlertTriangle,
  BrainCircuit,
  ShoppingBag,
  LineChart,
  ShieldAlert,
  ChevronRight,
  Factory,
  Boxes,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Cpu
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export function PlannerDashboard() {
  const navigate = useNavigate();
  const {
    demandOrders = [],
    forecasts = [],
    mrpCalculations = [],
    capacityCalculations = [],
    schedules = [],
    scheduleVersions = [],
    materialReservations = [],
    validateActiveSchedule
  } = usePlanning();

  const { productionOrders = [] } = useProduction();
  const { skus = [], lines = [] } = useMasterData();

  const [horizon, setHorizon] = useState("14d");

  // Dynamic Live KPIs
  const openDemandVolume = demandOrders
    .filter((d) => d.status === "Open" || d.status === "Allocated")
    .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

  const totalForecastVolume = forecasts
    .reduce((sum, f) => sum + (Number(f.finalForecast) || 0), 0);

  const shortagesCount = mrpCalculations.filter((m) => m.shortage > 0).length;
  const conflictsCount = capacityCalculations.filter((c) => c.hasConflict).length;
  const avgLineUtil = Math.round(
    capacityCalculations.reduce((sum, c) => sum + c.utilizationPercent, 0) / (capacityCalculations.length || 1)
  );
  const unreservedMaterialsCount = materialReservations.filter((r) => r.status === "Partially Reserved" || r.status === "Unreserved").length;
  const activePublishedVer = scheduleVersions.find((v) => v.status === "Published")?.versionId || "V4.2";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header and Horizon Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Supply & Production Planning Command Center
            </h1>
            <Badge variant="emerald">MASTER SCHEDULE {activePublishedVer} ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", backgroundColor: "#0F172A", padding: "6px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
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
            14-Day Detailed Run Horizon
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
            90-Day S&OP Projection
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (All Clickable) */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <div onClick={() => navigate("/planner/demand/customer-orders")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Firm Customer Demand"
            value={horizon === "14d" ? `${openDemandVolume.toLocaleString()} Units` : `${(openDemandVolume * 2.5).toLocaleString()} Units`}
            description={`${demandOrders.length} active customer requisitions`}
            icon={ShoppingBag}
            colorVariant="cyan"
          />
        </div>

        <div onClick={() => navigate("/planner/forecast/overrides")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Statistical Forecast"
            value={horizon === "14d" ? `${totalForecastVolume.toLocaleString()} Units` : `${(totalForecastVolume * 2.8).toLocaleString()} Units`}
            description="Baseline + promotional uplift"
            icon={LineChart}
            colorVariant="emerald"
          />
        </div>

        <div onClick={() => navigate("/planner/mrp/shortages")} style={{ cursor: "pointer" }}>
          <StatCard
            title="BOM Material Shortages"
            value={`${shortagesCount} SKU Alerts`}
            description={shortagesCount > 0 ? "Expedited purchase action required" : "All materials covered"}
            icon={AlertTriangle}
            colorVariant={shortagesCount > 0 ? "rose" : "emerald"}
          />
        </div>

        <div onClick={() => navigate("/planner/aps/capacity")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Work Center Capacity Load"
            value={`${avgLineUtil}% Load`}
            description={`${conflictsCount} line overload conflicts`}
            icon={CalendarRange}
            colorVariant={conflictsCount > 0 ? "rose" : "amber"}
          />
        </div>
      </div>

      {/* Secondary Quick-Access Planning Flow Status */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <div onClick={() => navigate("/planner/production-orders")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Production Orders"
            value={productionOrders.length.toString()}
            unit="Planning Runs"
            icon={Factory}
            colorVariant="emerald"
          />
        </div>

        <div onClick={() => navigate("/planner/aps/scheduler")} style={{ cursor: "pointer" }}>
          <StatCard
            title="APS Finite Schedules"
            value={schedules.length.toString()}
            unit="Scheduled Batches"
            icon={Clock}
            colorVariant="cyan"
          />
        </div>

        <div onClick={() => navigate("/planner/material-reservation")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Material Allocations"
            value={materialReservations.length.toString()}
            unit={`${unreservedMaterialsCount} Partial Holds`}
            icon={Boxes}
            colorVariant="amber"
          />
        </div>

        <div onClick={() => navigate("/planner/aps/validation")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Schedule Gate Status"
            value={validateActiveSchedule.isPublishable ? "VALIDATED" : "CHECK REQUIRED"}
            unit={`${validateActiveSchedule.passCount}/${validateActiveSchedule.checks.length} Passed`}
            icon={CheckCircle2}
            colorVariant={validateActiveSchedule.isPublishable ? "emerald" : "rose"}
          />
        </div>
      </div>

      {/* Interactive Planning Exceptions & Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* MRP Material Allocations Card */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Layers size={20} color="#A855F7" strokeWidth={2} /> MRP Net Material Allocation
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>28mm HDPE Caps (PKG-2001):</span>
              <Badge variant={shortagesCount > 0 ? "rose" : "emerald"}>
                {shortagesCount > 0 ? "Shortage Detected" : "Safety Stock OK"}
              </Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Liquid Cane Sugar (ING-1001):</span>
              <Badge variant="emerald">Safety Stock 18.5kL OK</Badge>
            </div>
          </div>
          <div style={{ display: "flex", marginTop: "auto", gap: "8px", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={() => navigate("/planner/mrp/shortages")} style={{ flex: 1, fontSize: "12px" }}>
              Material Shortages
            </Button>
            <Button variant="secondary" onClick={() => navigate("/planner/mrp/net-requirements")} style={{ flex: 1, fontSize: "12px" }}>
              Net Requirements
            </Button>
          </div>
        </Card>

        {/* Capacity & APS Scheduling Card */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <CalendarRange size={20} color="#10B981" strokeWidth={2} /> Capacity & APS Scheduling
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Bottling Line 1 Scheduled Load:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>94% Capacity Load</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Active Shop Floor Version:</span>
              <Badge variant="emerald">Version {activePublishedVer} Published</Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "auto", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={() => navigate("/planner/aps/scheduler")} style={{ flex: 1, fontSize: "12px" }}>
              APS Scheduler
            </Button>
            <Button variant="secondary" onClick={() => navigate("/planner/aps/capacity")} style={{ flex: 1, fontSize: "12px" }}>
              Capacity Board
            </Button>
          </div>
        </Card>
      </div>

      {/* AI Planning Assistant Callout */}
      <Card style={{ borderLeft: "4px solid #06B6D4", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", padding: "24px", borderRadius: "16px" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BrainCircuit size={20} color="#06B6D4" strokeWidth={2} />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              AI Planning Assistant — Heuristic Optimization Advice
            </h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.5" }}>
            "Kroger urgent demand PO-KR-99321 requires 24,000 bottles of 1L Tonic Water on Line 1. Recommend sequencing directly after 500ml Citrus Soda to merge sanitation CIP-04 washouts."
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/planner/ai-assistant")}>
          Open Planning Assistant
        </Button>
      </Card>
    </div>
  );
}

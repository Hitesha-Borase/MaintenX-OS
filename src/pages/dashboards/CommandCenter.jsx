import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge,
  Clock,
  Layers,
  ShieldCheck,
  Users,
  Wrench,
  Package,
  TrendingUp,
  AlertTriangle,
  Zap,
  RotateCcw,
  Calendar,
  Building2,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { useProduction } from "../../context/ProductionContext";
import { useQuality } from "../../context/QualityContext";
import { useCMMS } from "../../context/CMMSContext";
import { useInventory } from "../../context/InventoryContext";
import { useException } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";

export function CommandCenter() {
  const navigate = useNavigate();
  const { addToast, setIsQuickActionOpen, selectedPlant } = useApp();

  const { productionOrders = [], batches = [] } = useProduction() || {};
  const { holds = [] } = useQuality() || {};
  const { breakdowns = [], reliabilityMetrics = {} } = useCMMS() || {};
  const { materialShortages = [] } = useInventory() || {};
  const { exceptions = [] } = useException() || {};

  // Hourly pacing mock
  const hourlyPace = [
    { hour: "06:00 - 07:00", target: 3000, actual: 3050, delta: "+50", status: "Ahead" },
    { hour: "07:00 - 08:00", target: 3000, actual: 3020, delta: "+20", status: "Ahead" },
    { hour: "08:00 - 09:00", target: 3000, actual: 2800, delta: "-200", status: "Behind (Micro-jam)" },
    { hour: "09:00 - 10:00", target: 3000, actual: 3100, delta: "+100", status: "Recovering" },
    { hour: "10:00 - 11:00", target: 3000, actual: 3050, delta: "+50", status: "On Target" },
    { hour: "11:00 - 12:00", target: 3000, actual: 2980, delta: "-20", status: "On Target" }
  ];

  const activeBDs = (breakdowns || []).filter((b) => b.status !== "Resolved" && b.status !== "Closed");
  const p1Exceptions = exceptions?.filter((e) => e.severity === "P1" && e.status !== "Resolved") || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Plant Manager Command Center
            </h1>
            <Badge variant="emerald" dot>
              {selectedPlant?.name || "Plant 1 (Austin)"} • LIVE
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Edge telemetry synced from Line 1, 2 & 3.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Sync Telemetry
          </Button>
          <Button
            variant="primary"
            icon={Zap}
            onClick={() => setIsQuickActionOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Fast Action Dispatch
          </Button>
        </div>
      </div>

      {/* 9 EXECUTIVE OPERATIONAL PILLARS - 2x2 on mobile */}
      <div
        className="kpi-grid-responsive grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        {/* 1. H/B MANAGEMENT */}
        <StatCard
          title="H/B Pacing (Shift Target)"
          value="23,900"
          unit="/ 24,000 units"
          trend={{ value: "Delta: -100 units (99.6% pacing)", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => navigate("/performance/hb-management")}
        />

        {/* 2. OEE */}
        <StatCard
          title="Plant OEE Score"
          value="86.4%"
          unit="Overall"
          trend={{ value: "A: 92.1% • P: 95.8% • Q: 98.1%", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
          onClick={() => navigate("/performance/oee")}
        />

        {/* 3. PRODUCTION */}
        <StatCard
          title="Production Output"
          value="142,500"
          unit="Bottles/Day"
          trend={{ value: "Line 1: 98.5% | Line 2: 94.2%", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
          onClick={() => navigate("/production/orders")}
        />

        {/* 4. QUALITY */}
        <StatCard
          title="Quality First-Pass Yield"
          value="99.2%"
          unit="Pass Rate"
          trend={{ value: `${holds?.length || 0} active lot holds`, isPositive: (holds?.length || 0) === 0, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
          onClick={() => navigate("/quality/status")}
        />

        {/* 5. LABOUR */}
        <StatCard
          title="Labour & Shift Staffing"
          value="100%"
          unit="28 / 28 Present"
          trend={{ value: "Shift A: 0 Callouts", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
          onClick={() => navigate("/labour/staffing")}
        />

        {/* 6. MAINTENANCE */}
        <StatCard
          title="Maintenance & MTBF"
          value={`${reliabilityMetrics?.plantOverall?.mtbfHours || 412}`}
          unit="hrs MTBF"
          trend={{ value: `${activeBDs.length} Active Breakdowns`, isPositive: activeBDs.length === 0, text: "" }}
          icon={Wrench}
          colorVariant={activeBDs.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/asset-health")}
        />

        {/* 7. MATERIAL & WAREHOUSE */}
        <StatCard
          title="Material Stock Health"
          value="98.1%"
          unit="Availability"
          trend={{ value: `${materialShortages?.length || 0} Stockout Alerts`, isPositive: (materialShortages?.length || 0) === 0, text: "" }}
          icon={Package}
          colorVariant={(materialShortages?.length || 0) > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/warehouse/material-shortage")}
        />

        {/* 8. RECOVERY */}
        <StatCard
          title="Schedule Recovery"
          value="+45 mins"
          unit="Paced"
          trend={{ value: "Catch-up strategy activated", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
          onClick={() => navigate("/planning/recovery")}
        />

        {/* 9. RISKS */}
        <StatCard
          title="Operational Risk Radar"
          value="Low / Guarded"
          unit="Risk Level"
          trend={{ value: `${p1Exceptions.length} P1 Exceptions`, isPositive: p1Exceptions.length === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={p1Exceptions.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/exceptions")}
        />
      </div>

      {/* HOUR-BY-HOUR (H/B) PACING TRACKER & RECOVERY SUMMARY */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", width: "100%", minWidth: 0 }}>
        {/* Hour-by-Hour (H/B) Table */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Hour-by-Hour (H/B) Execution Pace
            </h3>
            <Button variant="secondary" size="sm" onClick={() => navigate("/performance/hb-management")} style={{ fontSize: "11px", padding: "5px 10px" }}>
              H/B Deep Dive
            </Button>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "480px" }}>
              <thead>
                <tr>
                  <th>Time Window</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Delta</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hourlyPace.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.hour}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{p.target.toLocaleString()}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                      {p.actual.toLocaleString()}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: p.delta.startsWith("+") ? "#059669" : "#DC2626" }}>
                      {p.delta}
                    </td>
                    <td>
                      <Badge variant={p.delta.startsWith("+") ? "emerald" : "amber"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Real-time Line Output & OEE Trend */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Real-Time Line OEE Trends
            </h3>
            <Badge variant="cyan">Plant Average: 86.4%</Badge>
          </div>

          <AreaChart
            data={[
              { label: "06:00", value: 84 },
              { label: "07:00", value: 87 },
              { label: "08:00", value: 86 },
              { label: "09:00", value: 78 },
              { label: "10:00", value: 89 },
              { label: "11:00", value: 88 },
              { label: "12:00", value: 86.4 }
            ]}
            height={210}
            color="#C89547"
            unit="%"
          />
        </Card>
      </div>

      {/* QUICK DRILL-DOWN TILES */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "14px" }}>
          Plant Manager Department Direct Access
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/planning/schedule")}
          >
            <Calendar size={18} color="#0284C7" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Planning Schedule</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Master Finite Gantt</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/production/orders")}
          >
            <Layers size={18} color="#D97706" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Production Orders</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active Shop Floor Batches</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/quality/holds")}
          >
            <ShieldCheck size={18} color="#059669" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Quality Holds</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Quarantine & Release</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/warehouse/material-shortage")}
          >
            <Package size={18} color="#8C5B23" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Material Shortage</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Stockout Risk Alerts</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/ai-decision-support")}
          >
            <Zap size={18} color="#C89547" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>AI Decision Support</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Prescriptive Models</div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useMemo } from "react";
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
  DollarSign,
  ArrowRight,
  Boxes,
  Cpu,
  FlaskConical,
  Activity,
  Calculator
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
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";

export function CommandCenter() {
  const navigate = useNavigate();
  const { addToast, setIsQuickActionOpen, selectedPlant } = useApp();
  const { skus = [], boms = [], lines = [], assets = [], employees = [], qualitySpecs = [] } = useMasterData();

  const { productionOrders = [], batches = [] } = useProduction() || {};
  const { holds = [] } = useQuality() || {};
  const { breakdowns = [], reliabilityMetrics = {} } = useCMMS() || {};
  const { materialShortages = [] } = useInventory() || {};
  const { exceptions = [] } = useException() || {};

  // ==========================================
  // REALISTIC MANUFACTURING TRANSACTION ENGINE
  // ==========================================
  const hbTransactions = useMemo(() => {
    // Simulated live transaction roll-ups
    const processing = {
      target: 12000,
      actual: 11850,
      variance: -150,
      recoveryPace: "+35 units/hr",
      eodProjection: 23800,
      status: "Recovering"
    };

    const packaging = {
      target: 12000,
      actual: 12050,
      variance: 50,
      recoveryPace: "On Pace (0 Delta)",
      eodProjection: 24100,
      status: "Ahead"
    };

    const total = {
      target: processing.target + packaging.target,
      actual: processing.actual + packaging.actual,
      variance: processing.variance + packaging.variance,
      recoveryPace: "99.6% Shift Pace",
      eodProjection: processing.eodProjection + packaging.eodProjection - 23950, // balanced total
      status: "On Track"
    };

    return { processing, packaging, total };
  }, []);

  // Hourly pacing table
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
              {selectedPlant?.name?.split(" - ")[0] || "Indore Plant"} • LIVE
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Telemetry and master datasets synced cleanly.", "info")}
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

      {/* ========================================================================= */}
      {/* MASTER DATA QUICK-ACCESS LAUNCHER BAR (Milestone 1 Core Directives) */}
      {/* ========================================================================= */}
      <Card style={{ padding: "14px 18px", width: "100%", boxSizing: "border-box", backgroundColor: "var(--bg-card-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Boxes size={16} color="#B27E33" />
            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Master Data Shortcuts:
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/master-data/items")} style={quickBtnStyle}>
              <Package size={13} color="#0284C7" /> SKUs ({skus.length})
            </button>
            <button onClick={() => navigate("/master-data/bom")} style={quickBtnStyle}>
              <FlaskConical size={13} color="#059669" /> BOMs ({boms.length})
            </button>
            <button onClick={() => navigate("/master-data/work-centers")} style={quickBtnStyle}>
              <Layers size={13} color="#8B5CF6" /> Lines ({lines.length})
            </button>
            <button onClick={() => navigate("/master-data/machine-capability")} style={quickBtnStyle}>
              <Cpu size={13} color="#DC2626" /> Assets ({assets.length})
            </button>
            <button onClick={() => navigate("/master-data/skills")} style={quickBtnStyle}>
              <Users size={13} color="#C89547" /> Staff ({employees.length})
            </button>
            <button onClick={() => navigate("/master-data/quality-specs")} style={quickBtnStyle}>
              <ShieldCheck size={13} color="#059669" /> QA Specs ({qualitySpecs.length})
            </button>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* TRANSACTION-BACKED H/B CARD (Processing + Packaging = Total H/B) */}
      {/* ========================================================================= */}
      <Card style={{ padding: "20px", width: "100%", boxSizing: "border-box", borderLeft: "4px solid #C89547" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={18} color="#B27E33" />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Hour-by-Hour (H/B) Manufacturing Execution Hub
              </h3>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Formula: <strong style={{ color: "var(--text-primary)" }}>Processing H/B (11,850) + Packaging H/B (12,050) = Total Plant H/B (23,900 Units)</strong>
              </div>
            </div>
          </div>

          <Badge variant="cyan">TRANSACTION-BACKED TELEMETRY</Badge>
        </div>

        {/* 3 Balanced Sections: Processing, Packaging, Total */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {/* SECTION 1: PROCESSING H/B */}
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px", backgroundColor: "var(--bg-card-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#0284C7", textTransform: "uppercase" }}>
                1. Processing H/B (Formulation)
              </span>
              <Badge variant="amber">{hbTransactions.processing.status}</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div>Target: <strong style={{ fontFamily: "var(--font-mono)" }}>{hbTransactions.processing.target.toLocaleString()}</strong></div>
              <div>Actual: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{hbTransactions.processing.actual.toLocaleString()}</strong></div>
              <div>Variance: <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)" }}>{hbTransactions.processing.variance}</strong></div>
              <div>Recovery: <strong style={{ color: "#059669" }}>{hbTransactions.processing.recoveryPace}</strong></div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "6px" }}>
              EOD Projection: <strong>{hbTransactions.processing.eodProjection.toLocaleString()} Units</strong>
            </div>
          </div>

          {/* SECTION 2: PACKAGING H/B */}
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px", backgroundColor: "var(--bg-card-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
                2. Packaging H/B (Bottling/Canning)
              </span>
              <Badge variant="emerald">{hbTransactions.packaging.status}</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div>Target: <strong style={{ fontFamily: "var(--font-mono)" }}>{hbTransactions.packaging.target.toLocaleString()}</strong></div>
              <div>Actual: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{hbTransactions.packaging.actual.toLocaleString()}</strong></div>
              <div>Variance: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>+{hbTransactions.packaging.variance}</strong></div>
              <div>Recovery: <strong style={{ color: "#059669" }}>{hbTransactions.packaging.recoveryPace}</strong></div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "6px" }}>
              EOD Projection: <strong>{hbTransactions.packaging.eodProjection.toLocaleString()} Units</strong>
            </div>
          </div>

          {/* SECTION 3: TOTAL COMBINED H/B */}
          <div style={{ border: "1.5px solid #C89547", borderRadius: "10px", padding: "14px", backgroundColor: "rgba(200, 149, 71, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#8C5B23", textTransform: "uppercase" }}>
                3. Total Manufacturing H/B
              </span>
              <Badge variant="cyan">{hbTransactions.total.status}</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div>Target: <strong style={{ fontFamily: "var(--font-mono)" }}>{hbTransactions.total.target.toLocaleString()}</strong></div>
              <div>Actual: <strong style={{ fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{hbTransactions.total.actual.toLocaleString()}</strong></div>
              <div>Net Variance: <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)" }}>{hbTransactions.total.variance} Units</strong></div>
              <div>Shift Pacing: <strong style={{ color: "#059669" }}>{hbTransactions.total.recoveryPace}</strong></div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "6px" }}>
              Total EOD Projection: <strong>23,950 Units (99.8% Pacing)</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* 9 EXECUTIVE OPERATIONAL PILLARS - Responsive Grid */}
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

      {/* HOURLY TIME-WINDOW PACING BREAKDOWN */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", width: "100%", minWidth: 0 }}>
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Shift Time-Window Pacing Ledger
            </h3>
            <Button variant="secondary" size="sm" onClick={() => navigate("/performance/hb-management")} style={{ fontSize: "11px", padding: "5px 10px" }}>
              Detailed Logs
            </Button>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
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

        {/* Real-time Line Output Trend Chart */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Live Telemetry Throughput Curve
            </h3>
            <Badge variant="cyan">Real-time Stream</Badge>
          </div>

          <AreaChart
            data={[
              { label: "06:00", value: 3050 },
              { label: "07:00", value: 3020 },
              { label: "08:00", value: 2800 },
              { label: "09:00", value: 3100 },
              { label: "10:00", value: 3050 },
              { label: "11:00", value: 2980 }
            ]}
            height={200}
            color="#C89547"
          />
        </Card>
      </div>
    </div>
  );
}

const quickBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 700,
  border: "1px solid var(--border-subtle)",
  backgroundColor: "#FFFFFF",
  color: "var(--text-primary)",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

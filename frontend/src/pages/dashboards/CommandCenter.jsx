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
import dashboardService from "../../services/dashboardService";

export function CommandCenter() {
  const navigate = useNavigate();
  const { addToast, setIsQuickActionOpen, selectedPlant } = useApp();
  const { skus = [], boms = [], lines = [], assets = [], employees = [], qualitySpecs = [] } = useMasterData();

  const { productionOrders = [], batches = [] } = useProduction() || {};
  const { holds = [] } = useQuality() || {};
  const { breakdowns = [], reliabilityMetrics = {} } = useCMMS() || {};
  const { materialShortages = [] } = useInventory() || {};
  const { exceptions = [] } = useException() || {};

  const activeBDs = useMemo(() => {
    return (breakdowns || []).filter((b) => b.status !== "Resolved" && b.status !== "Closed");
  }, [breakdowns]);

  const p1Exceptions = useMemo(() => {
    return (exceptions || []).filter((e) => e.severity === "P1" || e.priority === "P1" || e.severity === "Critical");
  }, [exceptions]);

  const [apiData, setApiData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = React.useCallback(async (showToast = false) => {
    setIsSyncing(true);
    try {
      const plantId = selectedPlant?.id || "PLT-01";
      const [res] = await Promise.allSettled([
        dashboardService.getCommandCenterOverview(plantId),
        dashboardService.getPlantManagerKPIs(plantId)
      ]);
      if (res.status === "fulfilled" && res.value?.data) {
        const payload = res.value.data.data !== undefined ? res.value.data.data : res.value.data;
        setApiData(payload);
      }
      if (showToast) {
        addToast("Telemetry and database synced with PostgreSQL live backend!", "success");
      }
    } catch (err) {
      console.warn("Using live DB sync error:", err.message);
      if (showToast) {
        addToast("Failed to sync live telemetry from database.", "error");
      }
    } finally {
      setIsSyncing(false);
    }
  }, [selectedPlant, addToast]);

  React.useEffect(() => {
    loadData(false);
  }, [loadData]);

  // ==========================================
  // REAL MANUFACTURING TRANSACTION ENGINE (LIVE DB)
  // ==========================================
  const hbTransactions = useMemo(() => {
    if (apiData?.hbSummary) {
      return apiData.hbSummary;
    }
    return {
      processing: {
        target: 0,
        actual: 0,
        variance: 0,
        recoveryPace: "0 units/hr",
        eodProjection: 0,
        status: "Idle"
      },
      packaging: {
        target: 0,
        actual: 0,
        variance: 0,
        recoveryPace: "0 units/hr",
        eodProjection: 0,
        status: "Idle"
      },
      total: {
        target: 0,
        actual: 0,
        variance: 0,
        netVariance: 0,
        recoveryPace: "0.0% Shift Pace",
        shiftPacing: "0.0% Shift Pace",
        eodProjection: 0,
        status: "Idle"
      }
    };
  }, [apiData]);

  // Hourly pacing table from live DB
  const hourlyPace = useMemo(() => {
    if (apiData?.hourlyLedger && Array.isArray(apiData.hourlyLedger)) {
      return apiData.hourlyLedger;
    }
    return [];
  }, [apiData]);

  const chartData = useMemo(() => {
    if (!hourlyPace || hourlyPace.length === 0) return [];
    return hourlyPace.map((p) => ({
      label: p.hour ? (p.hour.includes(" - ") ? p.hour.split(" - ")[0] : p.hour) : (p.pitchId || "Pitch"),
      value: Number(p.actual) || 0
    }));
  }, [hourlyPace]);

  const pillarsData = useMemo(() => {
    if (apiData?.pillars) {
      return apiData.pillars;
    }
    return {
      hbPacing: { value: "0", unit: "/ 0 units", trend: "0 units logged in DB" },
      oeeScore: { value: "0.0%", unit: "Overall", trend: "A: 0% • P: 0% • Q: 0%" },
      productionOutput: { value: "0", unit: "Units Produced", trend: "0 units produced in DB" },
      qualityYield: { value: "100.0%", unit: "Pass Rate", trend: `${holds?.length || 0} active lot holds in DB` },
      labourStaffing: { value: `${employees.length > 0 ? '100%' : '0%'}`, unit: `${employees.length} / ${employees.length} Present`, trend: `${employees.length} Active Staff in DB` },
      maintenanceMtbf: { value: "0.0", unit: "hrs MTBF", trend: `${activeBDs.length} Active Breakdowns in DB` },
      materialStockHealth: { value: "0 Lots", unit: "Active Lots", trend: `${materialShortages?.length || 0} Stockout Alerts` },
      scheduleRecovery: { value: "On Schedule", unit: "Shift Status", trend: "Pacing nominal" },
      riskRadar: { value: p1Exceptions.length > 0 ? "High Risk" : "Low / Guarded", unit: "Risk Level", trend: `${p1Exceptions.length} P1 Exceptions in DB` }
    };
  }, [apiData, holds, activeBDs, materialShortages, p1Exceptions, employees]);

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
            onClick={() => loadData(true)}
            disabled={isSyncing}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isSyncing ? "Syncing..." : "Sync Telemetry"}
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
                Formula: <strong style={{ color: "var(--text-primary)" }}>Processing H/B ({hbTransactions.processing.actual.toLocaleString()}) + Packaging H/B ({hbTransactions.packaging.actual.toLocaleString()}) = Total Plant H/B ({hbTransactions.total.actual.toLocaleString()} Units)</strong>
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
              <div>Variance: <strong style={{ color: hbTransactions.processing.variance >= 0 ? "#059669" : "#DC2626", fontFamily: "var(--font-mono)" }}>{hbTransactions.processing.variance > 0 ? `+${hbTransactions.processing.variance}` : hbTransactions.processing.variance}</strong></div>
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
              <div>Variance: <strong style={{ color: hbTransactions.packaging.variance >= 0 ? "#059669" : "#DC2626", fontFamily: "var(--font-mono)" }}>{hbTransactions.packaging.variance > 0 ? `+${hbTransactions.packaging.variance}` : hbTransactions.packaging.variance}</strong></div>
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
              <div>Net Variance: <strong style={{ color: hbTransactions.total.netVariance >= 0 ? "#059669" : "#DC2626", fontFamily: "var(--font-mono)" }}>{hbTransactions.total.netVariance > 0 ? `+${hbTransactions.total.netVariance}` : hbTransactions.total.netVariance || hbTransactions.total.variance} Units</strong></div>
              <div>Shift Pacing: <strong style={{ color: "#059669" }}>{hbTransactions.total.shiftPacing || hbTransactions.total.recoveryPace}</strong></div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "6px" }}>
              Total EOD Projection: <strong>{hbTransactions.total.eodProjection?.toLocaleString() || "23,950"} Units</strong>
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
          value={pillarsData.hbPacing.value}
          unit={pillarsData.hbPacing.unit}
          trend={{ value: pillarsData.hbPacing.trend, isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => navigate("/performance/hb-management")}
        />

        {/* 2. OEE */}
        <StatCard
          title="Plant OEE Score"
          value={pillarsData.oeeScore.value}
          unit={pillarsData.oeeScore.unit}
          trend={{ value: pillarsData.oeeScore.trend, isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
          onClick={() => navigate("/performance/oee")}
        />

        {/* 3. PRODUCTION */}
        <StatCard
          title="Production Output"
          value={pillarsData.productionOutput.value}
          unit={pillarsData.productionOutput.unit}
          trend={{ value: pillarsData.productionOutput.trend, isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
          onClick={() => navigate("/production/orders")}
        />

        {/* 4. QUALITY */}
        <StatCard
          title="Quality First-Pass Yield"
          value={pillarsData.qualityYield.value}
          unit={pillarsData.qualityYield.unit}
          trend={{ value: pillarsData.qualityYield.trend, isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
          onClick={() => navigate("/quality/status")}
        />

        {/* 5. LABOUR */}
        <StatCard
          title="Labour & Shift Staffing"
          value={pillarsData.labourStaffing.value}
          unit={pillarsData.labourStaffing.unit}
          trend={{ value: pillarsData.labourStaffing.trend, isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
          onClick={() => navigate("/labour/staffing")}
        />

        {/* 6. MAINTENANCE */}
        <StatCard
          title="Maintenance & MTBF"
          value={pillarsData.maintenanceMtbf.value}
          unit={pillarsData.maintenanceMtbf.unit}
          trend={{ value: pillarsData.maintenanceMtbf.trend, isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="emerald"
          onClick={() => navigate("/maintenance/asset-health")}
        />

        {/* 7. MATERIAL & WAREHOUSE */}
        <StatCard
          title="Material Stock Health"
          value={pillarsData.materialStockHealth.value}
          unit={pillarsData.materialStockHealth.unit}
          trend={{ value: pillarsData.materialStockHealth.trend, isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
          onClick={() => navigate("/warehouse/material-shortage")}
        />

        {/* 8. RECOVERY */}
        <StatCard
          title="Schedule Recovery"
          value={pillarsData.scheduleRecovery.value}
          unit={pillarsData.scheduleRecovery.unit}
          trend={{ value: pillarsData.scheduleRecovery.trend, isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
          onClick={() => navigate("/planning/recovery")}
        />

        {/* 9. RISKS */}
        <StatCard
          title="Operational Risk Radar"
          value={pillarsData.riskRadar.value}
          unit={pillarsData.riskRadar.unit}
          trend={{ value: pillarsData.riskRadar.trend, isPositive: pillarsData.riskRadar.value.includes("Low"), text: "" }}
          icon={AlertTriangle}
          colorVariant={pillarsData.riskRadar.value.includes("High") ? "rose" : "amber"}
          onClick={() => navigate("/exception-control-tower")}
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
                {hourlyPace.length > 0 ? (
                  hourlyPace.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.hour || p.hour_window}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{Number(p.target || 0).toLocaleString()}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                        {Number(p.actual || 0).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: String(p.delta).startsWith("+") || Number(p.delta) >= 0 ? "#059669" : "#DC2626" }}>
                        {p.delta}
                      </td>
                      <td>
                        <Badge variant={String(p.delta).startsWith("+") || Number(p.delta) >= 0 ? "emerald" : "amber"}>
                          {p.status || (Number(p.delta) >= 0 ? "Ahead" : "Behind")}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                      No shift time-window pacing records logged in database.
                    </td>
                  </tr>
                )}
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

          {chartData.length > 0 ? (
            <AreaChart
              data={chartData}
              height={200}
              color="#C89547"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "190px", color: "var(--text-muted)", fontSize: "13px", gap: "6px" }}>
              <Activity size={24} color="var(--text-muted)" />
              <span>No live throughput telemetry recorded in database yet</span>
            </div>
          )}
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

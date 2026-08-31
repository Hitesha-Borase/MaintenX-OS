import React, { useState } from "react";
import {
  Wrench,
  Activity,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Gauge,
  DollarSign,
  RotateCcw,
  Plus,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Layers,
  Radio,
  Sliders,
  Package,
  FileSpreadsheet,
  Cpu,
  Zap,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  LifeBuoy
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { ParetoChart } from "../../components/charts/ParetoChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function MaintenanceDashboard() {
  const {
    assets,
    workOrders,
    breakdowns,
    pmSchedules,
    spareParts,
    calibrations,
    iotTelemetry,
    isLiveTelemetryStreaming,
    setIsLiveTelemetryStreaming,
    reliabilityMetrics
  } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  // Metrics calculations
  const onlineCount = assets.filter((a) => a.status === "Operational").length;
  const offlineCount = assets.filter((a) => a.status === "Breakdown" || a.status === "Out of Service").length;
  const degradedCount = assets.filter((a) => a.status === "Degraded").length;

  const activeWOs = workOrders.filter((w) => w.status !== "Closed" && w.status !== "Completed");
  const criticalWOs = workOrders.filter((w) => w.priority.includes("P1"));

  const pmDueCount = pmSchedules.filter((p) => p.status === "Due Today" || p.status === "Upcoming").length;
  const pmOverdueCount = pmSchedules.filter((p) => p.status === "Overdue").length;

  const activeBDs = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed");
  const totalDowntimeLostCost = breakdowns.reduce((sum, b) => sum + (b.impact?.downtimeCostUSD || 0), 0);

  const calValidCount = calibrations.filter((c) => c.status === "Valid").length;
  const calDueCount = calibrations.filter((c) => c.status === "Due Soon" || c.status === "Overdue").length;

  const lowStockParts = spareParts.filter((p) => p.stock <= p.minStock);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Title & Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Maintenance Dashboard
            </h1>
            <Badge variant="cyan">Real-Time Operational Control</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Unified maintenance intelligence across fleet assets, work orders, PM compliance, active breakdowns, downtime cost, calibration, spare parts, IoT, and reliability.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={Radio}
            onClick={() => {
              setIsLiveTelemetryStreaming(!isLiveTelemetryStreaming);
              addToast(isLiveTelemetryStreaming ? "Live IoT stream paused." : "Live IoT stream active.", "info");
            }}
          >
            {isLiveTelemetryStreaming ? "Pause Live IoT" : "Resume Live IoT"}
          </Button>
          <Button variant="secondary" icon={Clock} onClick={() => navigate("/preventive-maintenance/execution")}>
            Execute PM Checklist
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsQuickActionOpen(true)}>
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* 9 OPERATIONAL PILLARS KPI GRID */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        
        {/* 1. Assets Fleet Health */}
        <StatCard
          title="1. Assets Fleet Health"
          value={`${onlineCount} / ${assets.length}`}
          unit="Online"
          trend={{ value: `${offlineCount} Offline, ${degradedCount} Degraded`, isPositive: offlineCount === 0, text: "" }}
          icon={Layers}
          colorVariant={offlineCount > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/assets/register")}
        />

        {/* 2. Work Orders */}
        <StatCard
          title="2. Open Work Orders"
          value={activeWOs.length.toString()}
          unit="Active"
          trend={{ value: `${criticalWOs.length} Critical (P1)`, isPositive: criticalWOs.length === 0, text: "" }}
          icon={Wrench}
          colorVariant="amber"
          onClick={() => navigate("/work-orders/open")}
        />

        {/* 3. Preventive Maintenance */}
        <StatCard
          title="3. PM Compliance"
          value={`${reliabilityMetrics.plantOverall.pmComplianceRate}%`}
          unit=""
          trend={{ value: `${pmOverdueCount} Overdue, ${pmDueCount} Upcoming`, isPositive: pmOverdueCount === 0, text: "" }}
          icon={CheckCircle2}
          colorVariant={pmOverdueCount > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/preventive-maintenance/schedule")}
        />

        {/* 4. Breakdowns */}
        <StatCard
          title="4. Active Breakdowns"
          value={activeBDs.length.toString()}
          unit="Unplanned"
          trend={{ value: activeBDs.length > 0 ? `${activeBDs[0].assetId} in repair` : "Zero active", isPositive: activeBDs.length === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant={activeBDs.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/breakdowns/log")}
        />

        {/* 5. Downtime Impact */}
        <StatCard
          title="5. Downtime Impact"
          value={`$${totalDowntimeLostCost.toLocaleString()}`}
          unit="Total Loss"
          trend={{ value: `${breakdowns.reduce((s, b) => s + (b.impact?.productionLossUnits || 0), 0)} Units lost`, isPositive: false, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
          onClick={() => navigate("/breakdowns/downtime-impact")}
        />

        {/* 6. Calibration */}
        <StatCard
          title="6. Calibration Status"
          value={`${calValidCount} / ${calibrations.length}`}
          unit="Certified"
          trend={{ value: `${calDueCount} Due/Overdue`, isPositive: calDueCount === 0, text: "" }}
          icon={Sliders}
          colorVariant={calDueCount > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/calibration/records")}
        />

        {/* 7. Spare Parts */}
        <StatCard
          title="7. Spare Parts Health"
          value={`${spareParts.length - lowStockParts.length} / ${spareParts.length}`}
          unit="In Stock"
          trend={{ value: `${lowStockParts.length} Reorder required`, isPositive: lowStockParts.length === 0, text: "" }}
          icon={Package}
          colorVariant={lowStockParts.length > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/spare-parts/inventory")}
        />

        {/* 8. Machine / IoT Live */}
        <StatCard
          title="8. Machine / IoT Live"
          value={`${iotTelemetry.vibration} mm/s`}
          unit="Vibration"
          trend={{ value: `${iotTelemetry.temperature}°C | ${iotTelemetry.pressure} bar`, isPositive: iotTelemetry.status === "Normal", text: "" }}
          icon={Radio}
          colorVariant={iotTelemetry.status === "Normal" ? "cyan" : "rose"}
          onClick={() => navigate("/machine-iot")}
        />

        {/* 9. Reliability (MTBF/MTTR) */}
        <StatCard
          title="9. Reliability (MTBF)"
          value={`${reliabilityMetrics.plantOverall.mtbfHours}`}
          unit="hrs MTBF"
          trend={{ value: `MTTR: ${reliabilityMetrics.plantOverall.mttrHours}h`, isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="emerald"
          onClick={() => navigate("/reliability")}
        />
      </div>

      {/* IoT LIVE TELEMETRY TICKER BAR */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isLiveTelemetryStreaming ? "#10B981" : "#F59E0B",
                boxShadow: isLiveTelemetryStreaming ? "0 0 10px #10B981" : "none",
                animation: isLiveTelemetryStreaming ? "pulse 2s infinite" : "none"
              }}
            />
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                Active Machine IoT Stream: High-Speed Rotary Filler 12-Head (FM-001)
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                Updated: {iotTelemetry.lastUpdated}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Vibration: </span>
              <span style={{ fontWeight: 700, color: iotTelemetry.vibration > 3.0 ? "#EF4444" : "#10B981", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.vibration} mm/s
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Temp: </span>
              <span style={{ fontWeight: 700, color: iotTelemetry.temperature > 70 ? "#EF4444" : "#38BDF8", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.temperature}°C
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Pressure: </span>
              <span style={{ fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.pressure} bar
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Speed: </span>
              <span style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.rpm} RPM
              </span>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/machine-iot")}>
              Full IoT Center
            </Button>
          </div>
        </div>
      </Card>

      {/* MAIN CHARTS: MTBF TREND & BREAKDOWN PARETO */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Reliability Growth Trend (Monthly MTBF)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Operating hours between functional failures across production lines
              </p>
            </div>
            <Badge variant="cyan">Target: 420h</Badge>
          </div>

          <AreaChart
            data={reliabilityMetrics.monthlyTrend.map((m) => ({ label: m.month, value: m.mtbf }))}
            height={220}
            color="#38BDF8"
            unit="h"
          />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Top Breakdown Causes by Downtime (Pareto Analysis)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Primary root causes by cumulative operational downtime hours lost
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/breakdowns/analysis")}>
              Analysis
            </Button>
          </div>

          <ParetoChart
            items={[
              { label: "Gasket Rupture (HYD-002)", count: 36, percentage: 42.0 },
              { label: "Bearing Fatigue (MEC-004)", count: 22, percentage: 68.0 },
              { label: "Optical Drift (ELE-008)", count: 12, percentage: 82.0 },
              { label: "Belt Guide Jam (MEC-009)", count: 8, percentage: 91.0 },
              { label: "Solenoid Sticking (PNE-003)", count: 7, percentage: 100.0 }
            ]}
            height={220}
          />
        </Card>
      </div>

      {/* DETAILED TABLES: ASSETS REGISTRY & OPEN WORK ORDERS */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Assets Fleet Status */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Equipment Fleet Health
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Condition index, vibration, and operating status
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/assets/register")}>
              All Assets ({assets.length})
            </Button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Vibration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 5).map((a) => {
                  const isOp = a.status === "Operational";
                  const isBD = a.status === "Breakdown";
                  const badgeVar = isOp ? "emerald" : isBD ? "rose" : "amber";

                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{a.id}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {a.name}
                        </div>
                      </td>
                      <td>
                        <Badge variant={badgeVar} dot={isOp || isBD}>
                          {a.status}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: a.health > 80 ? "#10B981" : a.health > 60 ? "#F59E0B" : "#EF4444" }}>
                          {a.health}%
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: a.vibration > 3.0 ? "#EF4444" : "var(--text-primary)" }}>
                        {a.vibration} mm/s
                      </td>
                      <td>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/assets/360?id=${a.id}`)}>
                          Asset 360
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Open Work Orders Dispatch */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Active Work Orders Dispatch Queue
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Priority queue and assigned technicians
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/work-orders/open")}>
              All WOs ({workOrders.length})
            </Button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Work Order</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Tech</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.slice(0, 5).map((wo) => {
                  const isP1 = wo.priority.includes("P1");
                  const isP2 = wo.priority.includes("P2");

                  return (
                    <tr key={wo.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{wo.id}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                          {wo.title}
                        </div>
                      </td>
                      <td>
                        <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>
                          {wo.priority.split(" - ")[0]}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant="slate">{wo.status}</Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "#38BDF8" }}>
                        {wo.assignedTechnician?.split(" ")[0]} {wo.assignedTechnician?.split(" ")[1]}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/work-orders/open?view=${wo.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* QUICK DRILL-DOWN TILES */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
          Maintenance Hub Quick Navigation
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/assets/hierarchy")}
          >
            <Layers size={18} color="#38BDF8" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Asset Hierarchy</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Plant & Line Tree</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/preventive-maintenance/plans")}
          >
            <CalendarCheck size={18} color="#10B981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>PM Plans</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Master SOP catalog</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/spare-parts/bom")}
          >
            <Package size={18} color="#A855F7" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Spare Parts BOM</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Bill of materials</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/troubleshooting")}
          >
            <LifeBuoy size={18} color="#EAB308" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Troubleshooting</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Diagnostic tree</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/reports")}
          >
            <FileSpreadsheet size={18} color="#60A5FA" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>Reports Center</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Export PDF / CSV</div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}

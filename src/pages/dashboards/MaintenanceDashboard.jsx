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
    assets = [],
    workOrders = [],
    breakdowns = [],
    pmSchedules = [],
    spareParts = [],
    calibrations = [],
    iotTelemetry = { vibration: 1.8, temperature: 48.5, pressure: 5.2, rpm: 1250, status: "Normal", lastUpdated: "Just now" },
    isLiveTelemetryStreaming = true,
    setIsLiveTelemetryStreaming,
    reliabilityMetrics = {
      plantOverall: { pmComplianceRate: 98.4, mtbfHours: 412, mttrHours: 1.8 },
      monthlyTrend: [
        { month: "Jan", mtbf: 320 },
        { month: "Feb", mtbf: 345 },
        { month: "Mar", mtbf: 370 },
        { month: "Apr", mtbf: 388 },
        { month: "May", mtbf: 405 },
        { month: "Jun", mtbf: 412 }
      ]
    }
  } = useCMMS();

  const { addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  // Metrics calculations
  const onlineCount = assets.filter((a) => a.status === "Operational").length;
  const offlineCount = assets.filter((a) => a.status === "Breakdown" || a.status === "Out of Service").length;
  const degradedCount = assets.filter((a) => a.status === "Degraded").length;

  const activeWOs = workOrders.filter((w) => w.status !== "Closed" && w.status !== "Completed");
  const criticalWOs = workOrders.filter((w) => w.priority?.includes("P1"));

  const pmDueCount = pmSchedules.filter((p) => p.status === "Due Today" || p.status === "Upcoming").length;
  const pmOverdueCount = pmSchedules.filter((p) => p.status === "Overdue").length;

  const activeBDs = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed");
  const totalDowntimeLostCost = breakdowns.reduce((sum, b) => sum + (b.impact?.downtimeCostUSD || 0), 0);

  const calValidCount = calibrations.filter((c) => c.status === "Valid").length;
  const calDueCount = calibrations.filter((c) => c.status === "Due Soon" || c.status === "Overdue").length;

  const lowStockParts = spareParts.filter((p) => p.stock <= p.minStock);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Page Title & Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Maintenance Dashboard
            </h1>
            <Badge variant="cyan">REAL-TIME OPERATIONAL CONTROL</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={Radio}
            onClick={() => {
              if (setIsLiveTelemetryStreaming) setIsLiveTelemetryStreaming(!isLiveTelemetryStreaming);
              addToast(isLiveTelemetryStreaming ? "Live IoT stream paused." : "Live IoT stream active.", "info");
            }}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isLiveTelemetryStreaming ? "Pause Live IoT" : "Resume Live IoT"}
          </Button>
          <Button
            variant="secondary"
            icon={Clock}
            onClick={() => navigate("/pm/execution")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Execute PM Checklist
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsQuickActionOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* STREAMLINED ESSENTIAL KPI GRID - 2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        {/* Assets Fleet Health */}
        <StatCard
          title="Assets Fleet Health"
          value={`${onlineCount} / ${assets.length}`}
          unit="Online"
          trend={{ value: `${offlineCount} Offline, ${degradedCount} Degraded`, isPositive: offlineCount === 0, text: "" }}
          icon={Layers}
          colorVariant={offlineCount > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/assets/register")}
        />

        {/* Work Orders */}
        <StatCard
          title="Open Work Orders"
          value={activeWOs.length.toString()}
          unit="Active"
          trend={{ value: `${criticalWOs.length} Critical (P1)`, isPositive: criticalWOs.length === 0, text: "" }}
          icon={Wrench}
          colorVariant="amber"
          onClick={() => navigate("/work-orders/open")}
        />

        {/* Preventive Maintenance */}
        <StatCard
          title="PM Compliance"
          value={`${reliabilityMetrics?.plantOverall?.pmComplianceRate || 98.4}%`}
          unit=""
          trend={{ value: `${pmOverdueCount} Overdue, ${pmDueCount} Upcoming`, isPositive: pmOverdueCount === 0, text: "" }}
          icon={CheckCircle2}
          colorVariant={pmOverdueCount > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/pm/schedule")}
        />

        {/* Downtime Impact */}
        <StatCard
          title="Downtime Impact"
          value={`$${totalDowntimeLostCost.toLocaleString()}`}
          unit="Loss"
          trend={{ value: activeBDs.length > 0 ? `${activeBDs.length} Breakdown Active` : "Zero active breakdown", isPositive: activeBDs.length === 0, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
          onClick={() => navigate("/breakdowns/downtime-impact")}
        />
      </div>

      {/* IoT LIVE TELEMETRY TICKER BAR */}
      <Card style={{ padding: "14px 16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "220px", flex: 1 }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isLiveTelemetryStreaming ? "#10B981" : "#F59E0B",
                boxShadow: isLiveTelemetryStreaming ? "0 0 10px #10B981" : "none"
              }}
            />
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                Active IoT Stream: High-Speed Rotary Filler 12-Head (FM-001)
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                Updated: {iotTelemetry.lastUpdated}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Vibration: </span>
              <span style={{ fontWeight: 700, color: iotTelemetry.vibration > 3.0 ? "#EF4444" : "#10B981", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.vibration} mm/s
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Temp: </span>
              <span style={{ fontWeight: 700, color: iotTelemetry.temperature > 70 ? "#EF4444" : "#0284C7", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.temperature}°C
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Pressure: </span>
              <span style={{ fontWeight: 700, color: "#D97706", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.pressure} bar
              </span>
            </div>
            <div style={{ fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Speed: </span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry.rpm} RPM
              </span>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/machine-iot")}>
              Full IoT Center
            </Button>
          </div>
        </div>
      </Card>

      {/* MAIN CHARTS: MTBF TREND & BREAKDOWN PARETO - Full 1 Column on Mobile, 2 on Desktop */}
      <div className="grid-2" style={{ width: "100%", minWidth: 0 }}>
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Reliability Growth Trend (Monthly MTBF)
            </h3>
            <Badge variant="cyan">Target: 420h</Badge>
          </div>

          <AreaChart
            data={(reliabilityMetrics?.monthlyTrend || []).map((m) => ({ label: m.month, value: m.mtbf }))}
            height={220}
            color="#C89547"
            unit="h"
          />
        </Card>

        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Top Breakdown Causes by Downtime (Pareto Analysis)
            </h3>
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
      <div className="grid-2" style={{ width: "100%", minWidth: 0 }}>
        {/* Assets Fleet Status */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Equipment Fleet Health
            </h3>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/assets/register")}>
              All Assets ({assets.length})
            </Button>
          </div>

          {/* Table Container with Horizontal Scroll Enabled */}
          <div
            className="data-table-container"
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              width: "100%",
              maxWidth: "100%",
              display: "block",
              boxSizing: "border-box"
            }}
          >
            <table className="data-table" style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: "140px" }}>Asset ID</th>
                  <th style={{ minWidth: "120px" }}>Status</th>
                  <th style={{ minWidth: "80px" }}>Health</th>
                  <th style={{ minWidth: "90px" }}>Vibration</th>
                  <th style={{ minWidth: "90px", textAlign: "right" }}>Action</th>
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
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                          {a.id}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {a.name}
                        </div>
                      </td>
                      <td>
                        <Badge variant={badgeVar} dot={isOp || isBD}>
                          {a.status}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: a.health > 80 ? "#059669" : a.health > 60 ? "#D97706" : "#DC2626" }}>
                          {a.health}%
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: a.vibration > 3.0 ? "#DC2626" : "var(--text-primary)" }}>
                        {a.vibration} mm/s
                      </td>
                      <td style={{ textAlign: "right" }}>
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
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Active Work Orders Dispatch Queue
            </h3>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/work-orders/open")}>
              All WOs ({workOrders.length})
            </Button>
          </div>

          {/* Table Container with Horizontal Scroll Enabled */}
          <div
            className="data-table-container"
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              width: "100%",
              maxWidth: "100%",
              display: "block",
              boxSizing: "border-box"
            }}
          >
            <table className="data-table" style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: "140px" }}>Work Order</th>
                  <th style={{ minWidth: "80px" }}>Priority</th>
                  <th style={{ minWidth: "110px" }}>Status</th>
                  <th style={{ minWidth: "100px" }}>Assigned Tech</th>
                  <th style={{ minWidth: "80px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.slice(0, 5).map((wo) => {
                  const isP1 = wo.priority?.includes("P1");
                  const isP2 = wo.priority?.includes("P2");

                  return (
                    <tr key={wo.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                          {wo.id}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}>
                          {wo.title}
                        </div>
                      </td>
                      <td>
                        <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>
                          {wo.priority?.split(" - ")[0] || "P2"}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant="slate">{wo.status}</Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "#0284C7", fontWeight: 600 }}>
                        {wo.assignedTechnician}
                      </td>
                      <td style={{ textAlign: "right" }}>
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
    </div>
  );
}

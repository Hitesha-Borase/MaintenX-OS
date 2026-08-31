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
  Layers
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
  const { assets, workOrders, breakdowns, pmSchedules, reliabilityMetrics, repeatFailures } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState("month");

  const onlineCount = assets.filter((a) => a.status === "Operational").length;
  const offlineCount = assets.filter((a) => a.status === "Breakdown" || a.status === "Out of Service").length;
  const pmDueCount = pmSchedules.filter((p) => p.status === "Due Today" || p.status === "Upcoming").length;
  const pmOverdueCount = pmSchedules.filter((p) => p.status === "Overdue").length;
  const activeWOs = workOrders.filter((w) => w.status !== "Closed" && w.status !== "Completed");
  const activeBDs = breakdowns.filter((b) => b.status !== "Resolved");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Maintenance & CMMS Dashboard
            </h1>
            <Badge variant="cyan">Asset Reliability OS</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Asset health management, PM compliance, active breakdown triage, and MTBF/MTTR analytics.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Clock} onClick={() => navigate("/maintenance/pm-checklists")}>
            Execute PM Checklist
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsQuickActionOpen(true)}>
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* KPI Ticker Grid */}
      <div className="grid-6">
        <StatCard
          title="Assets Fleet Health"
          value={`${onlineCount} / ${assets.length}`}
          unit="Online"
          trend={{ value: `${offlineCount} Offline`, isPositive: offlineCount === 0, text: "status" }}
          icon={Gauge}
          colorVariant={offlineCount > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/assets")}
        />
        <StatCard
          title="Open Work Orders"
          value={activeWOs.length.toString()}
          unit="Active"
          trend={{ value: `${workOrders.filter(w => w.priority.includes("P1")).length} Critical`, isPositive: false, text: "priority" }}
          icon={Wrench}
          colorVariant="blue"
          onClick={() => navigate("/maintenance/work-orders")}
        />
        <StatCard
          title="Active Breakdowns"
          value={activeBDs.length.toString()}
          unit="Unplanned"
          trend={{ value: "HT-105", isPositive: false, text: "in repair" }}
          icon={AlertOctagon}
          colorVariant={activeBDs.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/breakdowns")}
        />
        <StatCard
          title="PM Compliance"
          value={`${reliabilityMetrics.plantOverall.pmComplianceRate}%`}
          unit=""
          trend={{ value: `${pmOverdueCount} Overdue`, isPositive: pmOverdueCount === 0, text: "schedules" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => navigate("/maintenance/pm-schedules")}
        />
        <StatCard
          title="Plant MTBF"
          value={`${reliabilityMetrics.plantOverall.mtbfHours}`}
          unit="hrs"
          trend={{ value: "Target 420h", isPositive: false, text: "-34.6h variance" }}
          icon={Activity}
          colorVariant="cyan"
          onClick={() => navigate("/maintenance/reliability")}
        />
        <StatCard
          title="Plant MTTR"
          value={`${reliabilityMetrics.plantOverall.mttrHours}`}
          unit="hrs"
          trend={{ value: "Target 1.2h", isPositive: false, text: "+25m variance" }}
          icon={Clock}
          colorVariant="amber"
          onClick={() => navigate("/maintenance/reliability")}
        />
      </div>

      {/* Main Charts: MTBF/MTTR Trends & Downtime Pareto */}
      <div className="grid-2">
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly MTBF (Reliability Growth Trend)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Mean operating hours between unplanned functional failures
              </p>
            </div>
            <Badge variant="cyan">Target: 420 hrs</Badge>
          </div>

          <AreaChart
            data={reliabilityMetrics.monthlyTrend.map((m) => ({ label: m.month, value: m.mtbf }))}
            height={200}
            color="#38BDF8"
            unit="h"
          />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Top Breakdown Causes by Downtime (Pareto)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Failure modes ranked by cumulative operational hours lost
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/maintenance/repeat-failures")}>
              Repeat Failures
            </Button>
          </div>

          <ParetoChart
            items={[
              { label: "Gasket Rupture (HYD-002)", count: 36, percentage: 42.0 },
              { label: "Bearing Fatigue (MEC-004)", count: 22, percentage: 68.0 },
              { label: "Optical Glare (ELE-008)", count: 12, percentage: 82.0 },
              { label: "Belt Guide Jam (MEC-009)", count: 8, percentage: 91.0 },
              { label: "Solenoid Sticking (PNE-003)", count: 7, percentage: 100.0 }
            ]}
            height={200}
          />
        </Card>
      </div>

      {/* Critical Tables: Critical Assets & Open Work Orders */}
      <div className="grid-2">
        {/* Critical Assets Status Table */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Critical Production Assets Registry
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Condition monitoring health index, vibration, and temperature
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/maintenance/assets")}>
              View All ({assets.length})
            </Button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Status</th>
                  <th>Health Index</th>
                  <th>Vibration</th>
                  <th>Actions</th>
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
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.name}</div>
                      </td>
                      <td>
                        <Badge variant={badgeVar} dot={isOp || isBD}>
                          {a.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: a.health > 80 ? "#10B981" : a.health > 60 ? "#F59E0B" : "#EF4444" }}>
                            {a.health}%
                          </span>
                          <div style={{ width: "40px", height: "4px", backgroundColor: "#1E293B", borderRadius: "2px" }}>
                            <div style={{ width: `${a.health}%`, height: "100%", backgroundColor: a.health > 80 ? "#10B981" : a.health > 60 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: a.vibration > 3.0 ? "#EF4444" : "var(--text-primary)" }}>
                        {a.vibration} mm/s
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/maintenance/assets/${a.id}`)}
                        >
                          Asset 360°
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Open Work Orders Table */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Active Maintenance Work Orders
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Triage dispatch queue, technicians, and repair progress
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/maintenance/work-orders")}>
              View All ({workOrders.length})
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
                  <th>Actions</th>
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
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                          {wo.title}
                        </div>
                      </td>
                      <td>
                        <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>
                          {wo.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant="slate">{wo.status}</Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "#38BDF8" }}>
                        {wo.assignedTechnician}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/maintenance/work-orders/${wo.id}`)}
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

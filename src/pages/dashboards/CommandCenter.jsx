import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Factory,
  Gauge,
  Layers,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { OEEGauges } from "../../components/charts/OEEGauges";
import { SparkLine } from "../../components/charts/SparkLine";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useProduction } from "../../context/ProductionContext";
import { useExceptions } from "../../context/ExceptionContext";
import { useNavigate } from "react-router-dom";

export function CommandCenter() {
  const { selectedPlant, selectedShift, setIsQuickActionOpen, openQrModal, addToast } = useApp();
  const { assets, workOrders, breakdowns } = useCMMS();
  const { productionOrders } = useProduction();
  const { exceptions } = useExceptions();
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    addToast("Live plant telemetry refreshed from edge gateway.");
  };

  const activeBDs = breakdowns.filter((b) => b.status !== "Resolved");
  const p1Exceptions = exceptions.filter((e) => e.severity === "P1" && e.status !== "Resolved");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner: Plant Command Header & Telemetry Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Operational Command Center
            </h1>
            <Badge variant="emerald" dot>
              LIVE TELEMETRY STREAM
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time manufacturing execution, machine health, and cross-functional telemetry for {selectedPlant.name}.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={RotateCcw} onClick={handleRefresh}>
            Sync Gateway
          </Button>
          <Button variant="primary" icon={Zap} onClick={() => setIsQuickActionOpen(true)}>
            Fast Action Dispatch
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner (If P1 Breakdown or Safety Exception Active) */}
      {p1Exceptions.length > 0 && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "#EF4444", color: "#FFFFFF" }}>
              <AlertOctagon size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>
                  CRITICAL P1 EXCEPTION ACTIVE: {p1Exceptions[0].title}
                </span>
                <Badge variant="rose">HALT RISK</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "#FCA5A5", marginTop: "2px" }}>
                Discovered on {p1Exceptions[0].assetOrOrder} • Assigned to {p1Exceptions[0].owner} • Open for {p1Exceptions[0].timeOpenMinutes} mins
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            icon={ArrowUpRight}
            onClick={() => navigate("/exception-control-tower")}
          >
            Open Control Tower
          </Button>
        </div>
      )}

      {/* KPI Ticker Cards Grid */}
      <div className="grid-6">
        <StatCard
          title="Overall Plant OEE"
          value="86.4"
          unit="%"
          trend={{ value: "+2.1%", isPositive: true, text: "vs target 85%" }}
          icon={Gauge}
          colorVariant="cyan"
          onClick={() => navigate("/oee-performance")}
        />
        <StatCard
          title="Hourly Throughput"
          value="18,450"
          unit="units"
          trend={{ value: "580 BPM", isPositive: true, text: "Line 1 pace" }}
          icon={TrendingUp}
          colorVariant="emerald"
          onClick={() => navigate("/production")}
        />
        <StatCard
          title="Active Breakdowns"
          value={activeBDs.length.toString()}
          unit="unplanned"
          trend={{ value: "1 Critical", isPositive: false, text: "HT-105" }}
          icon={Wrench}
          colorVariant={activeBDs.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/breakdowns")}
        />
        <StatCard
          title="Quality Yield"
          value="98.1"
          unit="%"
          trend={{ value: "0.9% Scrap", isPositive: true, text: "under 1.5% limit" }}
          icon={ShieldCheck}
          colorVariant="blue"
          onClick={() => navigate("/quality")}
        />
        <StatCard
          title="PM Compliance"
          value="96.2"
          unit="%"
          trend={{ value: "2 Overdue", isPositive: false, text: "action required" }}
          icon={Clock}
          colorVariant="amber"
          onClick={() => navigate("/maintenance/pm-schedules")}
        />
        <StatCard
          title="Labour Productivity"
          value="97.4"
          unit="%"
          trend={{ value: "100% Rostered", isPositive: true, text: "Shift A" }}
          icon={Users}
          colorVariant="indigo"
          onClick={() => navigate("/labour")}
        />
      </div>

      {/* Main Command Room Matrix: OEE Multi-Gauge & Real-time Lines Telemetry */}
      <div className="grid-2">
        {/* Real-time OEE Gauge & Loss Analysis */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Live Production Efficiency (OEE Matrix)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                World-class benchmark target 85.0%
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/oee-performance")}>
              Drill-down
            </Button>
          </div>

          <OEEGauges oee={86.4} availability={91.2} performance={96.6} quality={98.1} />

          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
            <span>Planned Production Time: <strong>8.0h</strong></span>
            <span>Operating Time: <strong>7.3h</strong></span>
            <span>Unplanned Downtime: <strong style={{ color: "#EF4444" }}>42m</strong></span>
          </div>
        </Card>

        {/* Live Shop-Floor Production Lines Status */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Live Shop Floor Production Status
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Active running orders, speeds, and health across manufacturing bays
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate("/production")}>
              MES Live View
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {productionOrders.map((order) => {
              const isRunning = order.status === "Running";
              const isPaused = order.status.includes("Paused");
              const isCompleted = order.status === "Completed";

              const badgeVariant = isRunning ? "emerald" : isPaused ? "rose" : "slate";

              return (
                <div
                  key={order.id}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: `1px solid ${isRunning ? "rgba(16, 185, 129, 0.3)" : isPaused ? "rgba(239, 68, 68, 0.3)" : "var(--border-subtle)"}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {order.line}
                      </span>
                      <Badge variant={badgeVariant} dot={isRunning}>
                        {order.status}
                      </Badge>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                      {order.currentSpeedBPM} / {order.targetSpeedBPM} BPM
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {order.productName} ({order.orderNumber})
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>Progress: {order.producedQuantity.toLocaleString()} / {order.targetQuantity.toLocaleString()} {order.unit}</span>
                      <span>{Math.round((order.producedQuantity / order.targetQuantity) * 100)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "#1E293B", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, (order.producedQuantity / order.targetQuantity) * 100)}%`,
                          height: "100%",
                          backgroundColor: isRunning ? "#10B981" : isPaused ? "#EF4444" : "#38BDF8",
                          borderRadius: "3px"
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Hourly Production Target vs Actual Bar Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Hourly Production Output vs Plan (Line 1 Aseptic)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Units bottled per operating hour vs scheduled APS takt rate
            </p>
          </div>
          <Badge variant="cyan">Shift A Active (06:00 - 14:30)</Badge>
        </div>

        <BarChart
          data={[
            { label: "06:00", actual: 540, target: 600 },
            { label: "07:00", actual: 590, target: 600 },
            { label: "08:00", actual: 580, target: 600 },
            { label: "09:00", actual: 575, target: 600 },
            { label: "10:00", actual: 605, target: 600 },
            { label: "11:00", actual: 595, target: 600 },
            { label: "12:00", actual: 580, target: 600 },
            { label: "13:00 (est)", actual: 590, target: 600 }
          ]}
          height={190}
          barColor="#0284C7"
          targetColor="#F59E0B"
          yAxisUnit="BPM"
        />
      </Card>

      {/* Bottom Cross-Functional Status Pillars */}
      <div className="grid-3">
        {/* Pillar 1: Maintenance Status */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
              <Wrench size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Maintenance Status</h4>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Asset health & active work orders</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Assets Online:</span>
              <span style={{ fontWeight: 700, color: "#10B981" }}>7 / 8 (87.5%)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Critical Asset Alert:</span>
              <span style={{ fontWeight: 700, color: "#EF4444" }}>HT-105 (Gasket Leak)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Open Work Orders:</span>
              <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>{workOrders.filter(w => w.status === "In Progress" || w.status === "Open").length} Active</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ width: "100%", marginTop: "12px" }} onClick={() => navigate("/maintenance")}>
            Open CMMS Portal
          </Button>
        </Card>

        {/* Pillar 2: Quality & Compliance */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Quality (QMS) Status</h4>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>HACCP Critical Control Points & Holds</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>CCP Verification:</span>
              <span style={{ fontWeight: 700, color: "#10B981" }}>100% In Spec</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Active QA Holds:</span>
              <span style={{ fontWeight: 700, color: "#F59E0B" }}>1 Batch (Tank TK-04)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Scrap Rate (Shift A):</span>
              <span style={{ fontWeight: 700, color: "#34D399" }}>0.9% (Target &lt; 1.5%)</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ width: "100%", marginTop: "12px" }} onClick={() => navigate("/quality")}>
            Open Quality Center
          </Button>
        </Card>

        {/* Pillar 3: Material & Warehouse */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
              <Layers size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Material & Logistics</h4>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Raw material lots & cold storage</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Cold Chain Storage:</span>
              <span style={{ fontWeight: 700, color: "#10B981" }}>3.8°C (Optimal)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>MRP Shortage Alert:</span>
              <span style={{ fontWeight: 700, color: "#F59E0B" }}>Ginger Extract (-330kg)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Outbound OTIF:</span>
              <span style={{ fontWeight: 700, color: "#34D399" }}>98.4%</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ width: "100%", marginTop: "12px" }} onClick={() => navigate("/inventory")}>
            Open Warehouse Hub
          </Button>
        </Card>
      </div>
    </div>
  );
}

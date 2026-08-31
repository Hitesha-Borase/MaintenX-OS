import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  Package,
  FileSpreadsheet,
  Cpu,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  Flame,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useProduction } from "../../context/ProductionContext";
import { useQuality } from "../../context/QualityContext";
import { useInventory } from "../../context/InventoryContext";
import { useExceptions } from "../../context/ExceptionContext";
import { useNavigate } from "react-router-dom";

export function CommandCenter() {
  const { selectedPlant, selectedShift, setIsQuickActionOpen, addToast } = useApp();
  const { assets, workOrders, breakdowns, reliabilityMetrics } = useCMMS();
  const { productionOrders, batches } = useProduction();
  const { qualityChecks, holds } = useQuality();
  const { materialShortages, rawMaterials } = useInventory();
  const { exceptions } = useExceptions();
  const navigate = useNavigate();

  // Hourly Pace Data (H/B)
  const [hourlyPace] = useState([
    { hour: "06:00 - 07:00", target: 4000, actual: 4120, delta: "+120", status: "On-Track" },
    { hour: "07:00 - 08:00", target: 4000, actual: 3950, delta: "-50", status: "Minor Lag" },
    { hour: "08:00 - 09:00", target: 4000, actual: 4080, delta: "+80", status: "On-Track" },
    { hour: "09:00 - 10:00", target: 4000, actual: 3400, delta: "-600", status: "CIP Wash" },
    { hour: "10:00 - 11:00", target: 4000, actual: 4200, delta: "+200", status: "On-Track" },
    { hour: "11:00 - 12:00", target: 4000, actual: 4150, delta: "+150", status: "On-Track" }
  ]);

  const activeBDs = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed");
  const p1Exceptions = exceptions?.filter((e) => e.severity === "P1" && e.status !== "Resolved") || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Plant Manager Command Center
            </h1>
            <Badge variant="emerald" dot>
              {selectedPlant.name} • LIVE
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Executive manufacturing command cockpit covering Hour-by-Hour (H/B), OEE, Production, Quality, Labour, Maintenance, Materials, Recovery, and Risk Radar.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Edge telemetry synced from Line 1, 2 & 3.", "info")}
          >
            Sync Telemetry
          </Button>
          <Button variant="primary" icon={Zap} onClick={() => setIsQuickActionOpen(true)}>
            Fast Action Dispatch
          </Button>
        </div>
      </div>

      {/* 9 EXECUTIVE OPERATIONAL PILLARS */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        
        {/* 1. H/B MANAGEMENT */}
        <StatCard
          title="1. H/B Pacing (Shift Target)"
          value="23,900"
          unit="/ 24,000 units"
          trend={{ value: "Delta: -100 units (99.6% pacing)", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => navigate("/performance/hb-management")}
        />

        {/* 2. OEE */}
        <StatCard
          title="2. Plant OEE Score"
          value="86.4%"
          unit="Overall"
          trend={{ value: "A: 92.1% • P: 95.8% • Q: 98.1%", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
          onClick={() => navigate("/performance/oee")}
        />

        {/* 3. PRODUCTION */}
        <StatCard
          title="3. Production Output"
          value="142,500"
          unit="Bottles/Day"
          trend={{ value: "Line 1: 98.5% | Line 2: 94.2%", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="blue"
          onClick={() => navigate("/production/orders")}
        />

        {/* 4. QUALITY */}
        <StatCard
          title="4. Quality First-Pass Yield"
          value="99.2%"
          unit="Pass Rate"
          trend={{ value: `${holds?.length || 0} active lot holds`, isPositive: (holds?.length || 0) === 0, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
          onClick={() => navigate("/quality/status")}
        />

        {/* 5. LABOUR */}
        <StatCard
          title="5. Labour & Shift Staffing"
          value="100%"
          unit="28 / 28 Present"
          trend={{ value: "Shift A: 0 Callouts", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
          onClick={() => navigate("/labour/staffing")}
        />

        {/* 6. MAINTENANCE */}
        <StatCard
          title="6. Maintenance & MTBF"
          value={`${reliabilityMetrics.plantOverall.mtbfHours}`}
          unit="hrs MTBF"
          trend={{ value: `${activeBDs.length} Active Breakdowns`, isPositive: activeBDs.length === 0, text: "" }}
          icon={Wrench}
          colorVariant={activeBDs.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/asset-health")}
        />

        {/* 7. MATERIAL & WAREHOUSE */}
        <StatCard
          title="7. Material Stock Health"
          value="98.1%"
          unit="Availability"
          trend={{ value: `${materialShortages?.length || 0} Stockout Alerts`, isPositive: (materialShortages?.length || 0) === 0, text: "" }}
          icon={Package}
          colorVariant={(materialShortages?.length || 0) > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/warehouse/material-shortage")}
        />

        {/* 8. RECOVERY */}
        <StatCard
          title="8. Schedule Recovery"
          value="+45 mins"
          unit="Paced"
          trend={{ value: "Catch-up strategy activated", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
          onClick={() => navigate("/planning/recovery")}
        />

        {/* 9. RISKS */}
        <StatCard
          title="9. Operational Risk Radar"
          value="Low / Guarded"
          unit="Risk Level"
          trend={{ value: `${p1Exceptions.length} P1 Exceptions`, isPositive: p1Exceptions.length === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={p1Exceptions.length > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/exceptions")}
        />
      </div>

      {/* HOUR-BY-HOUR (H/B) PACING TRACKER & RECOVERY SUMMARY */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Hour-by-Hour (H/B) Table */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Hour-by-Hour (H/B) Execution Pace
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Shift A pacing vs target run-rates across packaging lines
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/performance/hb-management")}>
              H/B Deep Dive
            </Button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
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
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#FFFFFF" }}>
                      {p.actual.toLocaleString()}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: p.delta.startsWith("+") ? "#10B981" : "#EF4444" }}>
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
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Real-Time Line OEE Trends
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Continuous 24-hour efficiency trends
              </p>
            </div>
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
            color="#38BDF8"
            unit="%"
          />
        </Card>
      </div>

      {/* QUICK DRILL-DOWN TILES */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
          Plant Manager Department Direct Access
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "12px", gap: "10px", textAlign: "left", height: "auto" }}
            onClick={() => navigate("/planning/schedule")}
          >
            <Calendar size={18} color="#60A5FA" />
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
            <Layers size={18} color="#F59E0B" />
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
            <ShieldCheck size={18} color="#10B981" />
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
            <Package size={18} color="#FB923C" />
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
            <Zap size={18} color="#EC4899" />
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

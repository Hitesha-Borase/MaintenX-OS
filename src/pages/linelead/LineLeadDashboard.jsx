import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Clock,
  Shuffle,
  AlertOctagon,
  ShieldAlert,
  Package,
  Wrench,
  Gauge,
  Factory,
  ChevronRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useCMMS } from "../../context/CMMSContext";
import { useExceptions } from "../../context/ExceptionContext";

export function LineLeadDashboard() {
  const navigate = useNavigate();
  const { productionOrders } = useProduction();
  const { workOrders } = useCMMS();
  const { exceptions } = useExceptions();

  const activeOrder = productionOrders?.find((o) => o.status === "Running") || productionOrders?.[0] || {};

  // Calculations for dashboard safely
  const target = activeOrder?.targetQuantity || 0;
  const actual = activeOrder?.producedQuantity || 0;
  const pace = activeOrder?.currentSpeedBPM || 0;
  const targetPace = activeOrder?.targetSpeedBPM || 0;
  
  // Calculate recovery pace (remaining quantity divided by remaining hours)
  const remainingQty = Math.max(0, target - actual);
  const remainingHours = 3.5; // Simulated remaining shift hours
  const recoveryPaceBPM = Math.round(remainingQty / (remainingHours * 60)) || 0;

  const activeWOs = workOrders ? workOrders.filter((w) => w.line === activeOrder?.line && w.status !== "Closed" && w.status !== "Completed") : [];
  const openP1Count = exceptions ? exceptions.filter((e) => e.location?.includes("Line 1") && e.status !== "Resolved").length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Control Console
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Hour-by-hour operational pace and recovery steering for Line 1
        </p>
      </div>

      {/* KPI Ticker Grid */}
      <div className="grid-4">
        <StatCard
          title="Current H/B Attainment"
          value={`${actual.toLocaleString()} / ${target.toLocaleString()}`}
          description={`Projected EOD: ${Math.round(actual + pace * 60 * 3.5).toLocaleString()} Bottles`}
          icon={TrendingUp}
          color="#38BDF8"
        />
        <StatCard
          title="Line Pace (BPM)"
          value={`${pace} BPM`}
          description={`Target Pace: ${targetPace} BPM`}
          icon={Gauge}
          color={pace < targetPace ? "#F59E0B" : "#10B981"}
        />
        <StatCard
          title="Required Recovery Pace"
          value={`${recoveryPaceBPM} BPM`}
          description="Needed to hit shift target"
          icon={TrendingUp}
          color="#A855F7"
        />
        <StatCard
          title="EOD Projection"
          value={actual + pace * 60 * remainingHours >= target ? "On Target" : "Behind Schedule"}
          description="Based on current speed"
          icon={Factory}
          color={actual + pace * 60 * remainingHours >= target ? "#10B981" : "#EF4444"}
        />
      </div>

      {/* Grid containing critical alerts and statuses */}
      <div className="grid-3">
        {/* Staffing & Work Status */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Staffing Status
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={20} color="#38BDF8" />
            <div>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>5 / 5 Operators</span>
              <span style={{ fontSize: "11px", color: "#10B981", display: "block" }}>Line fully staffed</span>
            </div>
          </div>
          <button onClick={() => navigate("/linelead/staffing")} className="btn btn-ghost" style={{ fontSize: "12px", justifyContent: "flex-start", padding: "4px 0", marginTop: "auto" }}>
            Manage Staffing <ChevronRight size={14} />
          </button>
        </Card>

        {/* Changeover Status */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Next Changeover
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shuffle size={20} color="#F59E0B" />
            <div>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>In 45 Minutes</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>To: SKU-AJ-1L-ORG</span>
            </div>
          </div>
          <button onClick={() => navigate("/linelead/changeover")} className="btn btn-ghost" style={{ fontSize: "12px", justifyContent: "flex-start", padding: "4px 0", marginTop: "auto" }}>
            Configure Changeover <ChevronRight size={14} />
          </button>
        </Card>

        {/* Downtime Alert */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Downtime Logged
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={20} color="#EF4444" />
            <div>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>35 Minutes</span>
              <span style={{ fontSize: "11px", color: "#EF4444", display: "block" }}>Micro-stops active</span>
            </div>
          </div>
          <button onClick={() => navigate("/linelead/downtime-loss")} className="btn btn-ghost" style={{ fontSize: "12px", justifyContent: "flex-start", padding: "4px 0", marginTop: "auto" }}>
            Analyze Losses <ChevronRight size={14} />
          </button>
        </Card>
      </div>

      {/* Material, Quality, Maintenance Issue Status */}
      <div className="grid-3">
        {/* Material Shortage */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={15} color="#38BDF8" /> Material Stock Alert
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Lot: <strong style={{ color: "#FFFFFF" }}>LOT-ORG-442</strong></div>
            <div style={{ marginTop: "6px", color: "#F59E0B" }}>Supply Status: Low Orange Caps stock</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate("/linelead/material-status")} style={{ marginTop: "auto" }}>
            Check Material Log
          </Button>
        </Card>

        {/* Quality Hold */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={15} color="#10B981" /> Quality Holds
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Holds: <strong style={{ color: "#FFFFFF" }}>0 Batches on Hold</strong></div>
            <div style={{ marginTop: "6px", color: "var(--text-muted)" }}>Last check: 14:00 (PASSED)</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate("/linelead/quality-events")} style={{ marginTop: "auto" }}>
            View Quality Log
          </Button>
        </Card>

        {/* Maintenance Issue */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <Wrench size={15} color="#EF4444" /> Maintenance Issues
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Work Orders: <strong style={{ color: "#FFFFFF" }}>{activeWOs.length} Open WOs</strong></div>
            <div style={{ marginTop: "6px", color: "#F87171" }}>Escalated P1: {openP1Count} Incidents</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate("/linelead/maintenance-issues")} style={{ marginTop: "auto" }}>
            Inspect Work Orders
          </Button>
        </Card>
      </div>
    </div>
  );
}

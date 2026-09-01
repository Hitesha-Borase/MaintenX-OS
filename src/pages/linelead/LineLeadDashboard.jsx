import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Clock,
  Shuffle,
  ShieldAlert,
  Package,
  Wrench,
  Gauge,
  Factory,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useCMMS } from "../../context/CMMSContext";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";

export function LineLeadDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { productionOrders } = useProduction();
  const { workOrders } = useCMMS();
  const { exceptions } = useExceptions();

  // Modals state for working buttons
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isWOModalOpen, setIsWOModalOpen] = useState(false);

  const [requestingStock, setRequestingStock] = useState(false);
  const [loggingQA, setLoggingQA] = useState(false);

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

  const handleRequestStock = () => {
    setRequestingStock(true);
    setTimeout(() => {
      setRequestingStock(false);
      addToast("Expedited material request for Orange Caps sent to Warehouse.", "success");
      setIsMaterialModalOpen(false);
    }, 1000);
  };

  const handleLogQA = () => {
    setLoggingQA(true);
    setTimeout(() => {
      setLoggingQA(false);
      addToast("QA sample check logged successfully. All CCP limits within range.", "success");
      setIsQualityModalOpen(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Control Console
        </h1>
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
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>5 / 5 Operators</span>
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
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>In 45 Minutes</span>
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
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>35 Minutes</span>
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
        {/* Material Shortage Card & Button */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={15} color="#38BDF8" /> Material Stock Alert
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Lot: <strong style={{ color: "var(--text-primary)" }}>LOT-ORG-442</strong></div>
            <div style={{ marginTop: "6px", color: "#F59E0B", fontWeight: 700 }}>Supply Status: Low Orange Caps stock</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setIsMaterialModalOpen(true)} style={{ marginTop: "auto" }}>
            Check Material Log
          </Button>
        </Card>

        {/* Quality Hold Card & Button */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={15} color="#10B981" /> Quality Holds
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Holds: <strong style={{ color: "var(--text-primary)" }}>0 Batches on Hold</strong></div>
            <div style={{ marginTop: "6px", color: "var(--text-muted)" }}>Last check: 14:00 (PASSED)</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setIsQualityModalOpen(true)} style={{ marginTop: "auto" }}>
            View Quality Log
          </Button>
        </Card>

        {/* Maintenance Issue Card & Button */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Wrench size={15} color="#EF4444" /> Maintenance Issues
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Work Orders: <strong style={{ color: "var(--text-primary)" }}>{activeWOs.length || 3} Open WOs</strong></div>
            <div style={{ marginTop: "6px", color: "#F87171", fontWeight: 700 }}>Escalated P1: {openP1Count || 1} Incidents</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setIsWOModalOpen(true)} style={{ marginTop: "auto" }}>
            Inspect Work Orders
          </Button>
        </Card>
      </div>

      {/* 1. Check Material Log Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Line 1 Material Inventory Log"
        subtitle="Active Raw Material & Packaging Stock Ledger — Lot: LOT-ORG-442"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsMaterialModalOpen(false); navigate("/linelead/material-status"); }}>
              Full Material Status →
            </Button>
            <Button variant="primary" icon={Package} onClick={handleRequestStock}>
              {requestingStock ? "Requesting..." : "Request Stock Replenishment"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#F59E0B", display: "flex", gap: "8px", alignItems: "center" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span><strong>Low Stock Alert:</strong> Orange Caps stock at 1,200 units (~45 mins remaining at 580 BPM).</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { name: "Orange Screw Caps (500ml PET)", lot: "LOT-CAP-901", qty: "1,200 caps", status: "Low Stock", color: "#F59E0B" },
              { name: "Organic Cold-Pressed Juice Base", lot: "LOT-ORG-442", qty: "8,400 Liters", status: "Optimal", color: "#10B981" },
              { name: "500ml Clear PET Bottles", lot: "LOT-BOT-112", qty: "22,000 units", status: "Optimal", color: "#10B981" },
              { name: "Carton Outer Boxes (12x500ml)", lot: "LOT-BOX-880", qty: "4,500 boxes", status: "Optimal", color: "#10B981" }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Lot: {item.lot} | Qty: {item.qty}</span>
                </div>
                <Badge variant={item.status === "Optimal" ? "emerald" : "warning"}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 2. View Quality Log Modal */}
      <Modal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        title="Line 1 Quality & Compliance Log"
        subtitle="Critical Control Point (CCP) Checkpoints & Quality Verification"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsQualityModalOpen(false); navigate("/linelead/quality-events"); }}>
              View Quality Events →
            </Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleLogQA}>
              {loggingQA ? "Logging Check..." : "Log QA Sample Check"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10B981", display: "flex", gap: "8px", alignItems: "center" }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span><strong>Quality Status Green:</strong> 0 Batches on Quality Hold. All 3 CCP checks passed at 14:00.</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { ccp: "CCP 1 — Pasteurizer Thermal Limit", target: "83.5°C (Min 82.0°C)", actual: "83.5°C", time: "14:00", result: "PASSED" },
              { ccp: "CCP 2 — Brix Sugar Concentration", target: "11.9 °BX (Range 11.5 - 12.2)", actual: "11.9 °BX", time: "13:45", result: "PASSED" },
              { ccp: "Quality Check — Bottle pH Value", target: "3.72 pH (Range 3.60 - 3.85)", actual: "3.72 pH", time: "13:45", result: "PASSED" },
              { ccp: "Nozzle Seal & Capping Torque", target: "1.8 Nm ± 0.2", actual: "1.85 Nm", time: "13:30", result: "PASSED" }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.ccp}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: {item.target} | Actual: <strong style={{ color: "#10B981" }}>{item.actual}</strong></span>
                </div>
                <Badge variant="emerald">{item.result}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 3. Inspect Work Orders Modal */}
      <Modal
        isOpen={isWOModalOpen}
        onClose={() => setIsWOModalOpen(false)}
        title="Inspect Open Work Orders & Incident Logs"
        subtitle="Active Line 1 Maintenance Tickets & Technician Dispatch Status"
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsWOModalOpen(false); navigate("/linelead/maintenance-issues"); }}>
              Full Maintenance Center →
            </Button>
            <Button variant="primary" icon={Wrench} onClick={() => { setIsWOModalOpen(false); navigate("/work-orders"); }}>
              Open CMMS Work Orders
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444", display: "flex", gap: "8px", alignItems: "center" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span><strong>P1 Escalation Active:</strong> Rotary Filler Nozzle 4 Drip Leak causing micro-stops. Tech assigned.</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { id: "WO-2026-8941", issue: "Rotary Nozzle 4 Drip Leak & Micro-stops", priority: "P1 Critical", assigned: "J. Miller (Maint. Tech)", status: "In Progress", color: "#EF4444" },
              { id: "WO-2026-8930", issue: "Capper Belt Tension Adjustment", priority: "P3 Normal", assigned: "R. Sterling (Maint. Tech)", status: "Scheduled", color: "#38BDF8" },
              { id: "WO-2026-8912", issue: "Bottle Counter Sensor Alignment", priority: "P4 Low", assigned: "A. Vance (Line Lead)", status: "Verified", color: "#10B981" }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{item.id}: {item.issue}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                    Assigned: {item.assigned}
                  </span>
                </div>
                <Badge variant={item.priority.includes("P1") ? "danger" : item.priority.includes("P3") ? "cyan" : "emerald"}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

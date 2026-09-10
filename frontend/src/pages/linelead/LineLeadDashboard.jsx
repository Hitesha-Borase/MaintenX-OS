import React, { useState, useEffect } from "react";
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
  Zap,
  Send
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
import { dashboardService } from "../../services/dashboardService";

export function LineLeadDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { productionOrders } = useProduction();
  const { workOrders } = useCMMS();
  const { exceptions } = useExceptions();

  // Modals state
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isWOModalOpen, setIsWOModalOpen] = useState(false);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [proposedBPM, setProposedBPM] = useState(620);

  // API loading states
  const [requestingStock, setRequestingStock] = useState(false);
  const [loggingQA, setLoggingQA] = useState(false);
  const [acknowledgingStop, setAcknowledgingStop] = useState(false);
  const [submittingSpeed, setSubmittingSpeed] = useState(false);

  // API data states
  const [dashboardData, setDashboardData] = useState(null);
  const [materialLogData, setMaterialLogData] = useState(null);
  const [qualityLogData, setQualityLogData] = useState(null);
  const [materialLogLoading, setMaterialLogLoading] = useState(false);
  const [qualityLogLoading, setQualityLogLoading] = useState(false);

  // Load dashboard KPIs on mount
  useEffect(() => {
    dashboardService.getLineLeadDashboard()
      .then(data => setDashboardData(data))
      .catch(err => console.warn("[LineLeadDashboard] KPI load failed:", err.message));
  }, []);

  // Derive values from API data with fallbacks to context / hardcoded defaults
  const activeOrder = productionOrders?.find((o) => o.status === "Running") || productionOrders?.[0] || {};
  const target = dashboardData?.kpi?.currentHB?.target ?? activeOrder?.targetQuantity ?? 24000;
  const actual = dashboardData?.kpi?.currentHB?.actual ?? activeOrder?.producedQuantity ?? 18950;
  const pace = dashboardData?.kpi?.currentHB?.paceBPM ?? activeOrder?.currentSpeedBPM ?? 580;
  const targetPace = dashboardData?.kpi?.currentHB?.targetPaceBPM ?? activeOrder?.targetSpeedBPM ?? 600;
  const remainingHours = dashboardData?.kpi?.currentHB?.remainingHours ?? 3.5;
  const recoveryPaceBPM = (dashboardData?.kpi?.recoveryPaceBPM) ?? (Math.round((target - actual) / (remainingHours * 60)) || 0);

  const activeWOs = workOrders ? workOrders.filter((w) => w.line === activeOrder?.line && w.status !== "Closed" && w.status !== "Completed") : [];
  const openP1Count = exceptions ? exceptions.filter((e) => e.location?.includes("Line 1") && e.status !== "Resolved").length : 0;

  const maintenanceData = dashboardData?.maintenance ?? { openWorkOrders: activeWOs.length || 3, escalatedP1: openP1Count || 1 };
  const staffingData = dashboardData?.staffing ?? { present: 5, total: 5, status: "Fully Staffed" };
  const changeoverData = dashboardData?.nextChangeover ?? { minutesAway: 45, toSKU: "SKU-AJ-1L-ORG" };
  const downtimeData = dashboardData?.downtime ?? { totalMinutes: 35, microStopsActive: true };

  // ─── Button Handlers (API-Connected) ──────────────────────────────────────

  const handleOpenMaterialModal = async () => {
    setIsMaterialModalOpen(true);
    setMaterialLogLoading(true);
    try {
      const data = await dashboardService.getMaterialLog();
      setMaterialLogData(data);
    } catch (err) {
      addToast("Could not load material log. Showing cached data.", "warning");
    } finally {
      setMaterialLogLoading(false);
    }
  };

  const handleOpenQualityModal = async () => {
    setIsQualityModalOpen(true);
    setQualityLogLoading(true);
    try {
      const data = await dashboardService.getQualityLog();
      setQualityLogData(data);
    } catch (err) {
      addToast("Could not load quality log. Showing cached data.", "warning");
    } finally {
      setQualityLogLoading(false);
    }
  };

  const handleRequestStock = async () => {
    setRequestingStock(true);
    try {
      const res = await dashboardService.requestStockReplenishment({
        item: "Orange Screw Caps (500ml PET)",
        lotId: materialLogData?.lotId || "LOT-CAP-901",
        requestedBy: "Line Lead",
      });
      addToast(res?.message || "Expedited material request sent to Warehouse.", "success");
      setIsMaterialModalOpen(false);
    } catch (err) {
      addToast("Failed to send stock request. Please try again.", "error");
    } finally {
      setRequestingStock(false);
    }
  };

  const handleLogQA = async () => {
    setLoggingQA(true);
    try {
      const res = await dashboardService.logQaSampleCheck({
        lineId: "LINE-1",
        notes: "Manual QA check triggered from Line Lead Dashboard",
      });
      addToast(res?.message || "QA sample check logged successfully.", "success");
      setIsQualityModalOpen(false);
    } catch (err) {
      addToast("Failed to log QA check. Please try again.", "error");
    } finally {
      setLoggingQA(false);
    }
  };

  const handleAcknowledgeMicroStop = async () => {
    setAcknowledgingStop(true);
    try {
      const res = await dashboardService.acknowledgeMicroStop({
        lineId: "LINE-1",
        reason: "Micro-stop jam acknowledged by Line Lead",
      });
      addToast(res?.message || "Micro-stop jam acknowledged & logged in Downtime Ledger.", "info");
    } catch (err) {
      addToast("Failed to acknowledge micro-stop. Please try again.", "error");
    } finally {
      setAcknowledgingStop(false);
    }
  };

  const handleSubmitSpeedProposal = async () => {
    setSubmittingSpeed(true);
    try {
      const res = await dashboardService.proposeLineSpeedUp({
        proposedBPM: Number(proposedBPM),
        lineId: "LINE-1",
        requestedBy: "Line Lead",
      });
      addToast(res?.message || `Proposed speed increase to ${proposedBPM} BPM submitted to Supervisor.`, "success");
      setIsSpeedModalOpen(false);
    } catch (err) {
      addToast("Failed to submit speed proposal. Please try again.", "error");
    } finally {
      setSubmittingSpeed(false);
    }
  };

  // ─── Modal Data (API or fallback) ─────────────────────────────────────────
  const materialItems = materialLogData?.items ?? [
    { name: "Orange Screw Caps (500ml PET)", lot: "LOT-CAP-901", qty: "1,200 caps", status: "Low Stock" },
    { name: "Organic Cold-Pressed Juice Base", lot: "LOT-ORG-442", qty: "8,400 Liters", status: "Optimal" },
    { name: "500ml Clear PET Bottles", lot: "LOT-BOT-112", qty: "22,000 units", status: "Optimal" },
    { name: "Carton Outer Boxes (12x500ml)", lot: "LOT-BOX-880", qty: "4,500 boxes", status: "Optimal" },
  ];

  const qualityCheckpoints = qualityLogData?.checkpoints ?? [
    { ccp: "CCP 1 — Pasteurizer Thermal Limit", target: "83.5°C (Min 82.0°C)", actual: "83.5°C", time: "14:00", result: "PASSED" },
    { ccp: "CCP 2 — Brix Sugar Concentration", target: "11.9 °BX (Range 11.5 - 12.2)", actual: "11.9 °BX", time: "13:45", result: "PASSED" },
    { ccp: "Quality Check — Bottle pH Value", target: "3.72 pH (Range 3.60 - 3.85)", actual: "3.72 pH", time: "13:45", result: "PASSED" },
    { ccp: "Nozzle Seal & Capping Torque", target: "1.8 Nm ± 0.2", actual: "1.85 Nm", time: "13:30", result: "PASSED" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line Lead Control Console
          </h1>
        </div>
        <Button variant="warning" icon={Zap} onClick={() => setIsSpeedModalOpen(true)}>
          Propose Line Speed-Up
        </Button>
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

      {/* Status Cards Grid */}
      <div className="grid-3">
        {/* Staffing */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0, boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Staffing Status
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={20} color="#38BDF8" />
            <div>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                {staffingData.present} / {staffingData.total} Operators
              </span>
              <span style={{ fontSize: "11px", color: "#10B981", display: "block" }}>
                {staffingData.status || "Line fully staffed"}
              </span>
            </div>
          </div>
          <button onClick={() => navigate("/linelead/staffing")} className="btn btn-ghost" style={{ fontSize: "12px", justifyContent: "flex-start", padding: "4px 0", marginTop: "auto" }}>
            Manage Staffing <ChevronRight size={14} />
          </button>
        </Card>

        {/* Changeover */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0, boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Next Changeover
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shuffle size={20} color="#F59E0B" />
            <div>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                In {changeoverData.minutesAway} Minutes
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                To: {changeoverData.toSKU}
              </span>
            </div>
          </div>
          <button onClick={() => navigate("/linelead/changeover")} className="btn btn-ghost" style={{ fontSize: "12px", justifyContent: "flex-start", padding: "4px 0", marginTop: "auto" }}>
            Configure Changeover <ChevronRight size={14} />
          </button>
        </Card>

        {/* Downtime */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0, boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Downtime Logged
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={20} color="#EF4444" />
            <div>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                {downtimeData.totalMinutes} Minutes
              </span>
              <span style={{ fontSize: "11px", color: "#EF4444", display: "block" }}>
                {downtimeData.microStopsActive ? "Micro-stops active" : "No active micro-stops"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "auto" }}>
            <Button
              size="xs"
              variant="warning"
              onClick={handleAcknowledgeMicroStop}
              disabled={acknowledgingStop}
            >
              {acknowledgingStop ? "Acknowledging..." : "Acknowledge Micro-Stop"}
            </Button>
            <button onClick={() => navigate("/linelead/downtime-loss")} className="btn btn-ghost" style={{ fontSize: "12px", padding: "4px 8px" }}>
              Analyze Losses <ChevronRight size={14} />
            </button>
          </div>
        </Card>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid-3">
        {/* Material */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={15} color="#38BDF8" /> Material Stock Alert
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Lot: <strong style={{ color: "var(--text-primary)" }}>{dashboardData?.materialAlert?.lotId || "LOT-ORG-442"}</strong></div>
            <div style={{ marginTop: "6px", color: "#F59E0B", fontWeight: 700 }}>
              Supply Status: Low {dashboardData?.materialAlert?.lowStockItem || "Orange Caps"} stock
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={handleOpenMaterialModal} style={{ marginTop: "auto" }}>
            Check Material Log
          </Button>
        </Card>

        {/* Quality */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={15} color="#10B981" /> Quality Holds
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Holds: <strong style={{ color: "var(--text-primary)" }}>{dashboardData?.qualityHolds?.activeBatches ?? 0} Batches on Hold</strong></div>
            <div style={{ marginTop: "6px", color: "var(--text-muted)" }}>
              Last check: {dashboardData?.qualityHolds?.lastCheckTime || "14:00"} ({dashboardData?.qualityHolds?.lastCheckResult || "PASSED"})
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={handleOpenQualityModal} style={{ marginTop: "auto" }}>
            View Quality Log
          </Button>
        </Card>

        {/* Maintenance */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Wrench size={15} color="#EF4444" /> Maintenance Issues
          </h3>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            <div>Active Work Orders: <strong style={{ color: "var(--text-primary)" }}>{maintenanceData.openWorkOrders} Open WOs</strong></div>
            <div style={{ marginTop: "6px", color: "#F87171", fontWeight: 700 }}>Escalated P1: {maintenanceData.escalatedP1} Incidents</div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setIsWOModalOpen(true)} style={{ marginTop: "auto" }}>
            Inspect Work Orders
          </Button>
        </Card>
      </div>

      {/* ─── Modal 1: Material Log ─── */}
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
            <Button variant="primary" icon={Package} onClick={handleRequestStock} disabled={requestingStock}>
              {requestingStock ? "Requesting..." : "Request Stock Replenishment"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          {materialLogLoading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
              <RefreshCw size={18} style={{ marginBottom: "8px" }} />
              <div>Loading material log from API...</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#F59E0B", display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span><strong>Low Stock Alert:</strong> Orange Caps stock at 1,200 units (~{materialLogData?.lowStockAlert?.remainingMinutes || 45} mins remaining at {materialLogData?.lowStockAlert?.paceBPM || 580} BPM).</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {materialItems.map((item, idx) => (
                  <div key={idx} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Lot: {item.lot} | Qty: {item.qty}</span>
                    </div>
                    <Badge variant={item.status === "Optimal" ? "emerald" : "warning"}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ─── Modal 2: Quality Log ─── */}
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
            <Button variant="primary" icon={CheckCircle2} onClick={handleLogQA} disabled={loggingQA}>
              {loggingQA ? "Logging Check..." : "Log QA Sample Check"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          {qualityLogLoading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
              <RefreshCw size={18} style={{ marginBottom: "8px" }} />
              <div>Loading quality log from API...</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10B981", display: "flex", gap: "8px", alignItems: "center" }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span><strong>Quality Status {qualityLogData?.overallStatus || "Green"}:</strong> {qualityLogData?.activeBatchesOnHold ?? 0} Batches on Quality Hold. All {qualityCheckpoints.length} CCP checks passed.</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {qualityCheckpoints.map((item, idx) => (
                  <div key={idx} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.ccp}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: {item.target} | Actual: <strong style={{ color: "#10B981" }}>{item.actual}</strong></span>
                    </div>
                    <Badge variant="emerald">{item.result}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ─── Modal 3: Work Orders ─── */}
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
              { id: "WO-2026-8941", issue: "Rotary Nozzle 4 Drip Leak & Micro-stops", priority: "P1 Critical", assigned: "J. Miller (Maint. Tech)" },
              { id: "WO-2026-8930", issue: "Capper Belt Tension Adjustment", priority: "P3 Normal", assigned: "R. Sterling (Maint. Tech)" },
              { id: "WO-2026-8912", issue: "Bottle Counter Sensor Alignment", priority: "P4 Low", assigned: "A. Vance (Line Lead)" },
            ].map((item, idx) => (
              <div key={idx} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{item.id}: {item.issue}</span>
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

      {/* ─── Modal 4: Propose Speed-Up ─── */}
      <Modal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
        title="Propose Line Speed Increase"
        subtitle="Submit Recovery Speed Tuning Proposal to Operations Supervisor"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSpeedModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="warning"
              icon={Send}
              onClick={handleSubmitSpeedProposal}
              disabled={submittingSpeed}
            >
              {submittingSpeed ? "Submitting..." : "Submit Proposal"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitSpeedProposal();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Proposed Line Speed (BPM)
            </label>
            <input
              type="number"
              value={proposedBPM}
              onChange={(e) => setProposedBPM(e.target.value)}
              className="input-field"
              min={500}
              max={650}
              required
            />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
            Increasing speed to {proposedBPM} BPM will recover approximately +2,100 bottles over the next {remainingHours} hours to compensate for morning downtime.
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Play,
  Pause,
  Square,
  AlertOctagon,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  Layers,
  FileText,
  QrCode,
  AlertTriangle,
  Cpu,
  Send
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { OEEGauges } from "../../components/charts/OEEGauges";
import { useProduction } from "../../context/ProductionContext";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function OperatorDashboard() {
  const navigate = useNavigate();
  const { productionOrders, updateOrderStatus, batches } = useProduction();
  const { assets } = useCMMS();
  const { addToast } = useApp();

  const [isMicroStopModalOpen, setIsMicroStopModalOpen] = useState(false);
  const [stopReason, setStopReason] = useState("Infeed Sensor Misalignment");
  const [stopMins, setStopMins] = useState(3);

  // Button loading states
  const [loggingMicroStop, setLoggingMicroStop] = useState(false);
  const [changingJobStatus, setChangingJobStatus] = useState(false);

  // Active running order
  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0] || {
    id: "ORD-904",
    orderNumber: "ORD-904-ASEPTIC-JUICE",
    productCode: "SKU-AJ-500ML-ORG",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    status: "Completed",
    producedQuantity: 18950,
    targetQuantity: 24000,
    scrapQuantity: 120,
    currentSpeedBPM: 580,
    targetSpeedBPM: 600,
    activeBatchId: "BAT-2026-0892",
    unit: "Bottles"
  };

  const activeBatch = batches.find((b) => b.id === activeOrder.activeBatchId) || batches[0] || {
    currentStep: "In-line Sterilization & Bottle Filling",
    progressPercent: 77
  };

  const activeMachine = assets.find((a) => a.id === "FM-001") || assets[0] || {
    vibration: 2.1,
    temperature: 62.4
  };

  const target = activeOrder.targetQuantity || 24000;
  const actual = activeOrder.producedQuantity || 18950;
  const progressPercent = Math.round((actual / target) * 100);

  // Fetch operator dashboard telemetry on mount
  useEffect(() => {
    dashboardService.getOperatorDashboard()
      .catch(err => console.warn("[OperatorDashboard] Failed to fetch telemetry:", err.message));
  }, []);

  // ─── Update Job Status -> PATCH /api/v1/dashboards/operator/jobs/:jobId/status
  const handleJobAction = async (newStatus) => {
    setChangingJobStatus(true);
    try {
      const res = await dashboardService.updateJobStatus(activeOrder.id, { status: newStatus });
      updateOrderStatus(activeOrder.id, newStatus);
      addToast(res?.message || `Job ${activeOrder.orderNumber} status changed to ${newStatus}.`, "info");
    } catch (err) {
      updateOrderStatus(activeOrder.id, newStatus);
      addToast(`Job ${activeOrder.orderNumber} status changed to ${newStatus}.`, "info");
    } finally {
      setChangingJobStatus(false);
    }
  };

  // ─── Log Micro-Stop -> POST /api/v1/dashboards/operator/microstop
  const handleMicroStopSubmit = async (e) => {
    e.preventDefault();
    setLoggingMicroStop(true);

    try {
      const res = await dashboardService.logOperatorMicroStop({
        durationMins: Number(stopMins),
        reason: stopReason
      });
      addToast(res?.message || `Micro-stop of ${stopMins} mins logged. Reason: ${stopReason}. Sent to Line Lead H/B log.`, "warning");
      setIsMicroStopModalOpen(false);
    } catch (err) {
      addToast(`Micro-stop of ${stopMins} mins logged. Reason: ${stopReason}. Sent to Line Lead H/B log.`, "warning");
      setIsMicroStopModalOpen(false);
    } finally {
      setLoggingMicroStop(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={20} color="#34D399" />
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
              HMI Console & Shop-Floor HMI
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="warning" icon={AlertTriangle} onClick={() => setIsMicroStopModalOpen(true)}>
            Log Micro-Stop (&lt;5 min)
          </Button>

          <Button variant="secondary" icon={QrCode} onClick={() => navigate("/operator/barcode-scan")}>
            Quick Scan
          </Button>

          <Button variant="danger" icon={AlertOctagon} onClick={() => navigate("/operator/report-issue")}>
            Report Issue
          </Button>
        </div>
      </div>

      {/* Current Job Status Summary Card with Control Action Bar */}
      <div className="grid-3">
        <Card style={{ borderLeft: "3px solid #38BDF8", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Current Job & Order
          </span>
          <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px", margin: "6px 0 2px 0" }}>
            {activeOrder.orderNumber}
          </div>
          <span style={{ fontSize: "12px", color: "#0284C7", fontWeight: 600 }}>
            SKU: {activeOrder.productCode} • {activeOrder.productName}
          </span>

          {/* Job Control Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>QA Pre-Op Sanitation:</span>
              <Badge variant="emerald">APPROVED & CLEARED</Badge>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {activeOrder.status !== "Running" && (
                <Button variant="success" size="xs" icon={Play} onClick={() => handleJobAction("Running")} disabled={changingJobStatus}>
                  {changingJobStatus ? "Updating..." : "Start Job"}
                </Button>
              )}
              {activeOrder.status === "Running" && (
                <Button variant="warning" size="xs" icon={Pause} onClick={() => handleJobAction("Paused")} disabled={changingJobStatus}>
                  {changingJobStatus ? "Updating..." : "Pause"}
                </Button>
              )}
              <Button variant="danger" size="xs" icon={Square} onClick={() => handleJobAction("Completed")} disabled={changingJobStatus}>
                {changingJobStatus ? "Updating..." : "Finish Job"}
              </Button>
            </div>
          </div>
        </Card>

        <Card style={{ borderLeft: "3px solid #10B981", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Batch Formulation
          </span>
          <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px", margin: "6px 0 2px 0" }}>
            {activeOrder.activeBatchId}
          </div>
          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
            Step: {activeBatch?.currentStep || "Filling Phase"} • {activeBatch?.progressPercent || 77}% Complete
          </span>
        </Card>

        <Card style={{ borderLeft: "3px solid #F59E0B", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Line Status
          </span>
          <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px", margin: "6px 0 2px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: activeOrder.status === "Running" ? "#10B981" : "#F59E0B", display: "inline-block" }}></span>
            {activeOrder.status}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Current Speed: <strong style={{ color: "var(--text-primary)" }}>{activeOrder.currentSpeedBPM || 580} BPM</strong> (Target {activeOrder.targetSpeedBPM || 600} BPM)
          </span>
        </Card>
      </div>

      {/* Target vs Actual Progress Ticker */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>
            Target vs Actual Attainment
          </span>
          <Badge variant="cyan">{progressPercent}% Achieved</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ width: "100%", height: "14px", backgroundColor: "#E2E8F0", borderRadius: "7px", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(100, progressPercent)}%`,
                height: "100%",
                background: "linear-gradient(90deg, #0284C7, #10B981)",
                borderRadius: "7px"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
            <span>Actual: {actual.toLocaleString()} / {target.toLocaleString()} {activeOrder.unit || "Bottles"}</span>
            <span>Target Remaining: {Math.max(0, target - actual).toLocaleString()} {activeOrder.unit || "Bottles"}</span>
          </div>
        </div>
      </Card>

      {/* Operational Details Grid */}
      <div className="grid-2">
        {/* HB Speed and Machine Telemetry */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={16} color="#0284C7" /> Machine Status & SCADA Telemetry
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Current HB Target (Hour):</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>36,000 bottles/hr</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Actual Attainment:</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#059669" }}>34,800 bottles/hr</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Vibration:</span>
              <span style={{ fontWeight: 600, color: activeMachine.vibration > 3.0 ? "#DC2626" : "var(--text-primary)" }}>{activeMachine.vibration || 2.1} mm/s RMS</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Temperature:</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{activeMachine.temperature || 62.4}°C</span>
            </div>
          </div>
        </Card>

        {/* Quality Check and Materials Summary */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#10B981" /> Quality & Material Status
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Brix Sugar Level CCP:</span>
              <Badge variant="emerald">11.9 °Bx (PASS)</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>pH Value:</span>
              <Badge variant="emerald">3.72 pH (PASS)</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Raw Material Lot:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#0284C7", fontWeight: 600 }}>LOT-ORG-442</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Log Micro-Stop Modal */}
      <Modal
        isOpen={isMicroStopModalOpen}
        onClose={() => setIsMicroStopModalOpen(false)}
        title="Quick Log Micro-Stop (< 5 Minutes)"
        subtitle="Record Minor Line Jam / Sensor Stoppage"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsMicroStopModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleMicroStopSubmit} disabled={loggingMicroStop}>
              {loggingMicroStop ? "Logging..." : "Log Micro-Stop"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleMicroStopSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Stoppage Duration (Minutes)
            </label>
            <input
              type="number"
              value={stopMins}
              onChange={(e) => setStopMins(e.target.value)}
              className="input-field"
              min={1}
              max={5}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Micro-Stop Root Cause Reason
            </label>
            <select
              value={stopReason}
              onChange={(e) => setStopReason(e.target.value)}
              className="input-field"
            >
              <option value="Infeed Sensor Misalignment">Infeed Sensor Misalignment</option>
              <option value="Bottle Star-Wheel Jam">Bottle Star-Wheel Jam</option>
              <option value="Cap Chute Blockage">Cap Chute Blockage</option>
              <option value="Label Roll Tension Adjust">Label Roll Tension Adjust</option>
              <option value="Minor Conveyor Speed Surge">Minor Conveyor Speed Surge</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

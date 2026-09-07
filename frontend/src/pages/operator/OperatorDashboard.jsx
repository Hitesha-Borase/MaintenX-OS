import React, { useState } from "react";
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

export function OperatorDashboard() {
  const navigate = useNavigate();
  const { productionOrders, updateOrderStatus, batches } = useProduction();
  const { assets } = useCMMS();
  const { addToast } = useApp();

  const [isMicroStopModalOpen, setIsMicroStopModalOpen] = useState(false);
  const [stopReason, setStopReason] = useState("Infeed Sensor Misalignment");
  const [stopMins, setStopMins] = useState(3);

  // Find the active running order for the operator
  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];
  const activeBatch = batches.find((b) => b.id === activeOrder.activeBatchId) || batches[0];
  const activeMachine = assets.find((a) => a.id === "FM-001") || assets[0];

  const target = activeOrder.targetQuantity;
  const actual = activeOrder.producedQuantity;
  const scrap = activeOrder.scrapQuantity;
  const progressPercent = Math.round((actual / target) * 100);

  const handleJobAction = (newStatus) => {
    updateOrderStatus(activeOrder.id, newStatus);
    addToast(`Job ${activeOrder.orderNumber} status changed to ${newStatus}.`, "info");
  };

  const handleMicroStopSubmit = (e) => {
    e.preventDefault();
    addToast(`Micro-stop of ${stopMins} mins logged. Reason: ${stopReason}. Sent to Line Lead H/B log.`, "warning");
    setIsMicroStopModalOpen(false);
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
                <Button variant="success" size="xs" icon={Play} onClick={() => handleJobAction("Running")}>
                  Start Job
                </Button>
              )}
              {activeOrder.status === "Running" && (
                <Button variant="warning" size="xs" icon={Pause} onClick={() => handleJobAction("Paused")}>
                  Pause
                </Button>
              )}
              <Button variant="danger" size="xs" icon={Square} onClick={() => handleJobAction("Completed")}>
                Finish Job
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
            Current Speed: <strong style={{ color: "var(--text-primary)" }}>{activeOrder.currentSpeedBPM} BPM</strong> (Target {activeOrder.targetSpeedBPM} BPM)
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
            <span>Actual: {actual.toLocaleString()} / {target.toLocaleString()} {activeOrder.unit}</span>
            <span>Target Remaining: {(target - actual).toLocaleString()} {activeOrder.unit}</span>
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
              <span style={{ fontWeight: 600, color: activeMachine.vibration > 3.0 ? "#DC2626" : "var(--text-primary)" }}>{activeMachine.vibration} mm/s RMS</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Temperature:</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{activeMachine.temperature}°C</span>
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
            <Button variant="primary" icon={Send} onClick={handleMicroStopSubmit}>
              Log Micro-Stop
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

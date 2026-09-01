import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Play,
  AlertOctagon,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  Layers,
  FileText,
  QrCode,
  AlertTriangle,
  Cpu
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { OEEGauges } from "../../components/charts/OEEGauges";
import { useProduction } from "../../context/ProductionContext";
import { useCMMS } from "../../context/CMMSContext";

export function OperatorDashboard() {
  const navigate = useNavigate();
  const { productionOrders, batches } = useProduction();
  const { assets } = useCMMS();

  // Find the active running order for the operator
  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];
  const activeBatch = batches.find((b) => b.id === activeOrder.activeBatchId) || batches[0];
  const activeMachine = assets.find((a) => a.id === "FM-001") || assets[0];

  const target = activeOrder.targetQuantity;
  const actual = activeOrder.producedQuantity;
  const scrap = activeOrder.scrapQuantity;
  const progressPercent = Math.round((actual / target) * 100);

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

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" icon={QrCode} onClick={() => navigate("/operator/barcode-scan")}>
            Quick Scan
          </Button>
          <Button variant="danger" icon={AlertOctagon} onClick={() => navigate("/operator/report-issue")}>
            Report Issue
          </Button>
        </div>
      </div>

      {/* Current Job Status Summary Card */}
      <div className="grid-3">
        <Card style={{ borderLeft: "3px solid #38BDF8" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Current Job & Order
          </span>
          <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "15px", margin: "6px 0 2px 0" }}>
            {activeOrder.orderNumber}
          </div>
          <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>
            SKU: {activeOrder.productCode} • {activeOrder.productName}
          </span>
        </Card>

        <Card style={{ borderLeft: "3px solid #10B981" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Batch Formulation
          </span>
          <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "15px", margin: "6px 0 2px 0" }}>
            {activeOrder.activeBatchId}
          </div>
          <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>
            Step: {activeBatch?.currentStep || "Filling Phase"} • {activeBatch?.progressPercent || 77}% Complete
          </span>
        </Card>

        <Card style={{ borderLeft: "3px solid #F59E0B" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Line Status
          </span>
          <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "15px", margin: "6px 0 2px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }}></span>
            {activeOrder.status}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Current Speed: <strong style={{ color: "#FFFFFF" }}>{activeOrder.currentSpeedBPM} BPM</strong> (Target {activeOrder.targetSpeedBPM} BPM)
          </span>
        </Card>
      </div>

      {/* Target vs Actual Progress Ticker */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
            Target vs Actual Attainment
          </span>
          <Badge variant="cyan">{progressPercent}% Achieved</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ width: "100%", height: "14px", backgroundColor: "#1E293B", borderRadius: "7px", overflow: "hidden" }}>
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
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
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
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
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
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>LOT-ORG-442</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

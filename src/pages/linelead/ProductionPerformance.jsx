import React, { useState } from "react";
import { Gauge, TrendingUp, RefreshCw, Layers, CheckCircle2, AlertOctagon, Zap, Send, ShieldCheck, X } from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionPerformance() {
  const { productionOrders, setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];

  const [hoursLeft, setHoursLeft] = useState(3.5);
  const [overrideTarget, setOverrideTarget] = useState(activeOrder.targetQuantity);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("Shift Downtime Catch-up");
  const [isOverrideActive, setIsOverrideActive] = useState(false);

  const actual = activeOrder.producedQuantity;
  const targetNum = Number(overrideTarget) || 0;
  const remaining = Math.max(0, targetNum - actual);
  const calculatedRecoveryBPM = Math.round(remaining / (hoursLeft * 60)) || 0;

  const handleOpenOverrideModal = () => {
    setIsOverrideModalOpen(true);
  };

  const handleConfirmOverride = (e) => {
    e.preventDefault();

    // Update global production context with the new target quantity & speed
    setProductionOrders((prev) =>
      prev.map((o) => {
        if (o.id === activeOrder.id) {
          return {
            ...o,
            targetQuantity: Number(overrideTarget),
            targetSpeedBPM: calculatedRecoveryBPM > 0 ? calculatedRecoveryBPM : o.targetSpeedBPM
          };
        }
        return o;
      })
    );

    setIsOverrideActive(true);
    addToast(`Target override of ${overrideTarget.toLocaleString()} ${activeOrder.unit} applied to ${activeOrder.orderNumber}! New recovery speed: ${calculatedRecoveryBPM} BPM.`, "success");
    setIsOverrideModalOpen(false);
  };

  const handleResetOverride = () => {
    const originalTarget = 24000;
    setOverrideTarget(originalTarget);
    setProductionOrders((prev) =>
      prev.map((o) => {
        if (o.id === activeOrder.id) {
          return {
            ...o,
            targetQuantity: originalTarget
          };
        }
        return o;
      })
    );
    setIsOverrideActive(false);
    addToast("Target override reset to standard master schedule target.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production Performance & Pace Analytics
        </h1>
      </div>

      {/* Active Override Status Banner */}
      {isOverrideActive && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Zap size={18} color="#A855F7" />
            <div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                Target Override Active ({activeOrder.orderNumber})
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block" }}>
                Target set to <strong>{overrideTarget.toLocaleString()}</strong> bottles. Recovery Speed: <strong style={{ color: "#A855F7" }}>{calculatedRecoveryBPM} BPM</strong>.
              </span>
            </div>
          </div>
          <Button variant="secondary" size="xs" onClick={handleResetOverride}>
            Reset to Standard Target
          </Button>
        </div>
      )}

      {/* Speed Metrics Grid */}
      <div className="grid-2">
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Attainment Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {actual.toLocaleString()} Bottles
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Target: <strong style={{ color: "#B27E33", fontFamily: "var(--font-mono)" }}>{overrideTarget.toLocaleString()}</strong> Bottles
            </span>
          </div>

          <div style={{ width: "100%", height: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "5px", overflow: "hidden", marginTop: "10px", border: "1px solid var(--border-subtle)" }}>
            <div
              style={{
                width: `${Math.min(100, Math.round((actual / overrideTarget) * 100))}%`,
                height: "100%",
                background: "linear-gradient(90deg, #0284C7, #10B981)",
                borderRadius: "5px"
              }}
            />
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Speed Parameters
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Current Line Speed:</span>
            <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{activeOrder.currentSpeedBPM} BPM</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Target Speed:</span>
            <span style={{ fontWeight: 800, color: "#0284C7", fontFamily: "var(--font-mono)" }}>{activeOrder.targetSpeedBPM} BPM</span>
          </div>
        </Card>
      </div>

      {/* Recovery Calculator */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
          <TrendingUp size={18} color="#A855F7" /> Recovery Pace Calculator
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Remaining Shift Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={hoursLeft}
              onChange={(e) => setHoursLeft(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Target Output (Bottles)
            </label>
            <input
              type="number"
              value={overrideTarget}
              onChange={(e) => setOverrideTarget(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Calculated Recovery Target:</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#7C3AED", display: "block", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
              {calculatedRecoveryBPM} BPM
            </span>
          </div>

          <Button
            variant="primary"
            icon={Zap}
            onClick={handleOpenOverrideModal}
            style={{ padding: "10px 20px" }}
          >
            Apply Target Override
          </Button>
        </div>
      </Card>

      {/* Target Override Confirmation Modal */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        title="Apply Production Target Override"
        subtitle={`Order: ${activeOrder.orderNumber} (${activeOrder.productName})`}
        maxWidth="580px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleConfirmOverride}>
              Confirm & Apply Override
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmOverride} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Summary Box */}
          <div
            style={{
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: "var(--bg-card-subtle)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Current Produced:</span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "#059669" }}>{actual.toLocaleString()} Bottles</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-secondary)" }}>New Target Output:</span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "#7C3AED" }}>{overrideTarget.toLocaleString()} Bottles</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Required Speed Pace:</span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "#0284C7" }}>{calculatedRecoveryBPM} BPM</strong>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Justification & Reason for Override
            </label>
            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="input-field"
            >
              <option value="Shift Downtime Catch-up">Shift Downtime Catch-up</option>
              <option value="Customer Rush Order Surge">Customer Rush Order Surge</option>
              <option value="Line Pace Acceleration">Line Pace Acceleration</option>
              <option value="Material Availability Adjustment">Material Availability Adjustment</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Badge } from "../../components/common/Badge";
import { Gauge, Target, TrendingUp, Sliders, PieChart, Send } from "lucide-react";

export function ProductionPerformance() {
  const { productionOrders } = useProduction();
  const { addToast } = useApp();

  const activeOrder = productionOrders[0];

  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [isParetoModalOpen, setIsParetoModalOpen] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(600);

  const handleSaveSpeedLimit = (e) => {
    e.preventDefault();
    addToast(`Line speed cap set to ${speedLimit} BPM for ${activeOrder?.line || "Line 1"}.`, "success");
    setIsSpeedModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental OEE & Performance
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Sliders} onClick={() => setIsSpeedModalOpen(true)}>
            Set Speed Limit
          </Button>
          <Button variant="primary" icon={PieChart} onClick={() => setIsParetoModalOpen(true)}>
            View Downtime Pareto
          </Button>
        </div>
      </div>

      <div className="grid-3">
        <StatCard title="OEE Rating" value={`${activeOrder?.currentOEE || 85}%`} description="Target: 85.0%" icon={Gauge} color="#10B981" />
        <StatCard title="Performance Rate" value={`${activeOrder?.performance || 96.6}%`} description="Target: 95.0%" icon={Target} color="#0284C7" />
        <StatCard title="Quality Rate" value={`${activeOrder?.qualityRate || 98.1}%`} description="Target: 99.0%" icon={TrendingUp} color="#10B981" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
          Production Velocity Analysis
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Line 1 is currently operating at <strong style={{ color: "var(--text-primary)" }}>{activeOrder?.currentSpeedBPM || 580} BPM</strong> (Capped Limit: <strong style={{ color: "#0284C7" }}>{speedLimit} BPM</strong>).
          Availability losses are primarily driven by scheduled wash CIP cycles and filler guide plate transition changeovers.
        </p>
      </Card>

      {/* Set Speed Limit Modal */}
      <Modal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
        title="Authorize Line Speed Limit"
        subtitle="Line: Aseptic Bottling Line 1"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSpeedModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveSpeedLimit}>
              Set Speed Limit
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSpeedLimit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Maximum Authorized Speed (BPM)
            </label>
            <input
              type="number"
              value={speedLimit}
              onChange={(e) => setSpeedLimit(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
            Setting a speed limit prevents operators from over-speeding filler nozzles beyond rated sanitation & torque safety specs.
          </div>
        </form>
      </Modal>

      {/* Downtime Pareto Modal */}
      <Modal
        isOpen={isParetoModalOpen}
        onClose={() => setIsParetoModalOpen(false)}
        title="Department Downtime Pareto Drilldown"
        subtitle="Shift A Loss Driver Analysis"
        maxWidth="560px"
        footer={
          <Button variant="secondary" onClick={() => setIsParetoModalOpen(false)}>
            Close Pareto
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span>1. Mechanical Capper Motor Overheat:</span>
            <Badge variant="danger">45 mins (48% Loss)</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span>2. CIP Wash Sanitation Cycle:</span>
            <Badge variant="amber">25 mins (27% Loss)</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span>3. Labeler Roll Changeover:</span>
            <Badge variant="cyan">15 mins (16% Loss)</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>4. Minor Micro-Stops & Jams:</span>
            <Badge variant="slate">8 mins (9% Loss)</Badge>
          </div>
        </div>
      </Modal>
    </div>
  );
}

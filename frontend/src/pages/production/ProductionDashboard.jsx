import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Users,
  ChevronRight,
  TrendingUp,
  Download,
  X,
  Zap,
  Activity,
  Gauge,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";

export function ProductionDashboard() {
  const { productionOrders = [], updateOrderStatus, batches = [], shiftHandoffs = [], addShiftHandoff, setProductionOrders } = useProduction();
  const { lines = [] } = useMasterData();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [handoffNotes, setHandoffNotes] = useState("");
  const [isSimulating, setIsSimulating] = useState(true);

  // Live Machine Telemetry State
  const [machines, setMachines] = useState([
    {
      id: "MCH-LIN-01",
      lineId: "LIN-01",
      name: "Line 1 — High-Speed Aseptic Bottling",
      status: "RUNNING", // RUNNING, STOPPED, IDLE, CHANGEOVER
      speed: 580,
      targetSpeed: 600,
      speedUnit: "BPM",
      targetCount: 24000,
      producedCount: 18450,
      scrapCount: 210,
      runtimeHours: 6.8,
      downtimeMinutes: 12,
      efficiencyPercent: 94.6,
      currentOrder: "PO-2026-904",
      currentBatch: "BAT-2026-0892",
      product: "500ml Sparkling Citrus Soda",
      operator: "Elena Rostova"
    },
    {
      id: "MCH-LIN-02",
      lineId: "LIN-02",
      name: "Line 2 — Thermal Formulation & Blending",
      status: "CHANGEOVER",
      speed: 0,
      targetSpeed: 1200,
      speedUnit: "L/hr",
      targetCount: 15000,
      producedCount: 11200,
      scrapCount: 45,
      runtimeHours: 5.2,
      downtimeMinutes: 38,
      efficiencyPercent: 82.0,
      currentOrder: "PO-2026-905",
      currentBatch: "BAT-2026-0890",
      product: "Artisan Ginger-Lime Concentrate 5000L",
      operator: "Amina Al-Mansoor"
    },
    {
      id: "MCH-LIN-03",
      lineId: "LIN-03",
      name: "Line 3 — Rotary Canning & Seaming",
      status: "RUNNING",
      speed: 720,
      targetSpeed: 750,
      speedUnit: "CPM",
      targetCount: 36000,
      producedCount: 29400,
      scrapCount: 140,
      runtimeHours: 7.1,
      downtimeMinutes: 8,
      efficiencyPercent: 96.8,
      currentOrder: "PO-2026-906",
      currentBatch: "BAT-2026-0885",
      product: "Sparkling Yuzu Tea 330ml Can",
      operator: "Liam Chen"
    }
  ]);

  // Live simulation ticker: Increment produced count and animate speeds
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (m.status === "RUNNING") {
            const increment = Math.floor(8 + Math.random() * 6);
            const newProduced = Math.min(m.targetCount, m.producedCount + increment);
            const speedJitter = Math.floor(m.targetSpeed * 0.95 + Math.random() * (m.targetSpeed * 0.05));
            return {
              ...m,
              producedCount: newProduced,
              speed: speedJitter,
              runtimeHours: Math.round((m.runtimeHours + 0.01) * 100) / 100
            };
          }
          return m;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleMachineStatus = (machineId) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          const nextStatus = m.status === "RUNNING" ? "STOPPED" : "RUNNING";
          const newSpeed = nextStatus === "RUNNING" ? m.targetSpeed : 0;
          addToast(`${m.name} switched to ${nextStatus}`, nextStatus === "RUNNING" ? "success" : "warning");
          return { ...m, status: nextStatus, speed: newSpeed };
        }
        return m;
      })
    );
  };

  const getProduced = (o) => o.producedQuantity ?? o.producedQty ?? 0;
  const getScrap = (o) => o.scrapQuantity ?? o.scrapQty ?? 0;
  const getTarget = (o) => o.targetQuantity ?? o.targetQty ?? 1;
  const getName = (o) => o.productName ?? o.skuName ?? o.orderNumber ?? "Production Run";

  const totalProduced = machines.reduce((sum, m) => sum + m.producedCount, 0);
  const totalTarget = machines.reduce((sum, m) => sum + m.targetCount, 0);
  const totalScrap = machines.reduce((sum, m) => sum + m.scrapCount, 0);
  const overallEfficiency = Math.round((totalProduced / (totalTarget || 1)) * 100);

  const handleCreateHandoff = (e) => {
    e.preventDefault();
    if (!handoffNotes.trim()) {
      addToast("Please enter shift handoff notes", "warning");
      return;
    }
    addShiftHandoff({
      shiftFrom: "Shift A (Day)",
      shiftTo: "Shift B (Evening)",
      handedOverBy: "Elena Rostova",
      receivedBy: "Liam Chen",
      notes: handoffNotes
    });
    addToast("Shift handoff log recorded and digitally signed!", "success");
    setIsHandoffModalOpen(false);
    setHandoffNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              MES Production Floor & Line Telemetry
            </h1>
            <Badge variant="emerald">2 OF 3 LINES RUNNING</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Live shop floor machine status, speeds, target vs actual counts, real-time downtime tracking, and batch controls.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Simulation Toggle */}
          <button
            onClick={() => {
              setIsSimulating(!isSimulating);
              addToast(`Live production simulation ${!isSimulating ? "Enabled" : "Paused"}`, "info");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: isSimulating ? "rgba(16, 185, 129, 0.12)" : "var(--bg-card-subtle)",
              color: isSimulating ? "#059669" : "var(--text-secondary)",
              border: isSimulating ? "1px solid #10B981" : "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Activity size={14} />
            {isSimulating ? "Live Feed: Active" : "Live Feed: Paused"}
          </button>

          <Button variant="secondary" icon={Users} onClick={() => setIsHandoffModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Shift Handoff Log
          </Button>
          <Button variant="primary" icon={Layers} onClick={() => navigate("/production/orders")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Production Orders
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Total Output Today"
          value={totalProduced.toLocaleString()}
          unit="Master Units"
          trend={{ value: `${overallEfficiency}% Shift Target`, isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Line 1 High-Speed"
          value={`${machines[0]?.speed || 580}`}
          unit="BPM (580 Target)"
          trend={{ value: "96.6% Speed Adherence", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Floor Scrap Loss"
          value={totalScrap.toString()}
          unit="Units (< 1.0%)"
          trend={{ value: "0.68% Scrap Rate", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Batches"
          value="3 Batches"
          unit="Formulation & Pack"
          trend={{ value: "All CCP limits passing", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
      </div>

      {/* VISUAL MES PRODUCTION FLOOR MACHINE CARDS */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Active Production Floor Work Centers
          </h2>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Auto-refreshing via OPC-UA / PLC telemetry gateway
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
          {machines.map((m) => {
            const pct = Math.min(100, Math.round((m.producedCount / (m.targetCount || 1)) * 100));
            const isRunning = m.status === "RUNNING";
            const isChangeover = m.status === "CHANGEOVER";
            const remaining = Math.max(0, m.targetCount - m.producedCount);

            return (
              <Card
                key={m.id}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border: isRunning ? "1px solid #059669" : isChangeover ? "1px solid #D97706" : "1px solid #DC2626",
                  boxShadow: isRunning ? "0 4px 12px rgba(5, 150, 105, 0.08)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{m.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      ID: {m.id} • Operator: <strong>{m.operator}</strong>
                    </div>
                  </div>

                  <Badge variant={isRunning ? "emerald" : isChangeover ? "amber" : "rose"}>
                    {m.status}
                  </Badge>
                </div>

                {/* Live Order & Batch Box */}
                <div style={{ padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Order: <strong>{m.currentOrder}</strong></span>
                    <span style={{ color: "#8C5B23", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{m.currentBatch}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{m.product}</div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
                  <div style={{ padding: "8px", backgroundColor: "rgba(200, 149, 71, 0.06)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Run Speed</span>
                    <strong style={{ fontSize: "15px", color: isRunning ? "#059669" : "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {m.speed} <span style={{ fontSize: "10px" }}>{m.speedUnit}</span>
                    </strong>
                  </div>

                  <div style={{ padding: "8px", backgroundColor: "rgba(200, 149, 71, 0.06)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Efficiency</span>
                    <strong style={{ fontSize: "15px", color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {m.efficiencyPercent}%
                    </strong>
                  </div>

                  <div style={{ padding: "8px", backgroundColor: "rgba(200, 149, 71, 0.06)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Downtime</span>
                    <strong style={{ fontSize: "15px", color: m.downtimeMinutes > 20 ? "#DC2626" : "#D97706", fontFamily: "var(--font-mono)" }}>
                      {m.downtimeMinutes}m
                    </strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                    <span>Target: <strong>{m.targetCount.toLocaleString()}</strong></span>
                    <span>Produced: <strong style={{ color: "#059669" }}>{m.producedCount.toLocaleString()}</strong> ({pct}%)</span>
                    <span>Remaining: <strong>{remaining.toLocaleString()}</strong></span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: pct >= 100 ? "#059669" : isRunning ? "linear-gradient(90deg, #E2B670 0%, #059669 100%)" : "#D97706",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                  <button
                    onClick={() => toggleMachineStatus(m.id)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      backgroundColor: isRunning ? "rgba(220, 38, 38, 0.1)" : "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                      color: isRunning ? "#DC2626" : "#261603",
                      border: isRunning ? "1px solid #DC2626" : "1px solid #E8C182",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {isRunning ? <Pause size={14} /> : <Play size={14} />}
                    {isRunning ? "Stop Line" : "Run Line"}
                  </button>

                  <button
                    onClick={() => navigate("/production/batches")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      backgroundColor: "var(--bg-card-subtle)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Layers size={14} />
                    Batch Record
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SHIFT HANDOFF MODAL */}
      {isHandoffModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsHandoffModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Record Shift Handoff Log
              </h2>
              <button onClick={() => setIsHandoffModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHandoff} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Shift Transition</label>
                <input
                  type="text"
                  disabled
                  value="Shift A (Day 06:00 - 14:30) ➔ Shift B (Evening 14:30 - 23:00)"
                  className="form-input"
                  style={{ backgroundColor: "var(--bg-card-subtle)", color: "var(--text-muted)" }}
                />
              </div>

              <div>
                <label className="form-label">Operational Notes & Handover State *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Line 1 running at 580 BPM. Next changeover scheduled for 18:00. CIP sanitization completed at 14:00."
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsHandoffModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Sign Off & Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


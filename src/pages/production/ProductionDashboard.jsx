import React, { useState } from "react";
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
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionDashboard() {
  const { productionOrders = [], updateOrderStatus, batches = [], shiftHandoffs = [], addShiftHandoff } = useProduction();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [handoffNotes, setHandoffNotes] = useState("");

  const getProduced = (o) => o.producedQuantity ?? o.producedQty ?? 0;
  const getScrap = (o) => o.scrapQuantity ?? o.scrapQty ?? 0;
  const getTarget = (o) => o.targetQuantity ?? o.targetQty ?? 1;
  const getName = (o) => o.productName ?? o.skuName ?? o.orderNumber ?? "Production Run";

  const totalProduced = productionOrders.reduce((sum, o) => sum + getProduced(o), 0);
  const totalScrap = productionOrders.reduce((sum, o) => sum + getScrap(o), 0);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    addToast(`Production order ${orderId} updated to ${newStatus}`, "success");
  };

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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Production Operations & MES Execution
            </h1>
            <Badge variant="emerald">Line 1 at 580 BPM</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Users} onClick={() => setIsHandoffModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Shift Handoff Log
          </Button>
          <Button variant="primary" icon={Layers} onClick={() => navigate("/production")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Production Orders
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Units Produced Today"
          value={totalProduced.toLocaleString()}
          unit="units"
          trend={{ value: "+4.2%", isPositive: true, text: "vs shift plan" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Line 1 Speed"
          value="580"
          unit="BPM"
          trend={{ value: "Target: 600 BPM", isPositive: true, text: "96.6% speed" }}
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Scrap Rate"
          value="0.9%"
          unit="Rate"
          trend={{ value: `${totalScrap} units lost`, isPositive: true, text: "< 1.5% target" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Batches"
          value={batches.length.toString()}
          unit="In-Process"
          trend={{ value: "All vessels in spec", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
      </div>

      {/* Active Runs Cards */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Live Shop-Floor Lines & Execution Status
          </h3>
          <Badge variant="cyan">{productionOrders.length} REGISTERED RUNS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {productionOrders.map((o) => {
            const prod = getProduced(o);
            const tgt = getTarget(o);
            const pct = Math.min(100, Math.round((prod / tgt) * 100));
            const isRunning = (o.status || "").toLowerCase().includes("run");

            return (
              <div
                key={o.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: isRunning ? "1px solid rgba(5, 150, 105, 0.4)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {o.id}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {getName(o)}
                    </span>
                    <Badge variant={isRunning ? "emerald" : "amber"}>{o.status || "Scheduled"}</Badge>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <span>Line: <strong style={{ color: "var(--text-primary)" }}>{o.line}</strong></span>
                    <span>Produced: <strong style={{ color: "#059669" }}>{prod.toLocaleString()} / {tgt.toLocaleString()}</strong></span>
                    <span>Progress: <strong style={{ color: "#8C5B23" }}>{pct}%</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => navigate("/production")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      backgroundColor: "var(--bg-card-subtle)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>Manage Run</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal */}
      {isHandoffModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsHandoffModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
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
                <Button variant="secondary" onClick={() => setIsHandoffModalOpen(false)}>
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

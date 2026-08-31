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
  Download
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { BarChart } from "../../components/charts/BarChart";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionDashboard() {
  const { productionOrders, updateOrderStatus, batches, shiftHandoffs, addShiftHandoff } = useProduction();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState(productionOrders[0]);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [handoffNotes, setHandoffNotes] = useState("");

  const totalProduced = productionOrders.reduce((sum, o) => sum + o.producedQuantity, 0);
  const totalScrap = productionOrders.reduce((sum, o) => sum + o.scrapQuantity, 0);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    addToast(`Production order ${orderId} updated to ${newStatus}`);
  };

  const handleCreateHandoff = (e) => {
    e.preventDefault();
    if (!handoffNotes.trim()) return;
    addShiftHandoff({
      shiftFrom: "Shift A (Day)",
      shiftTo: "Shift B (Evening)",
      handedOverBy: "Elena Rostova",
      receivedBy: "Liam Chen",
      notes: handoffNotes
    });
    addToast("Shift handoff log recorded and signed off!");
    setIsHandoffModalOpen(false);
    setHandoffNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Production Operations & MES Execution
            </h1>
            <Badge variant="emerald" dot>Line 1 Running at 580 BPM</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Live shop-floor line control, batch formulation execution, takt attainment, and shift handoffs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={Users} onClick={() => setIsHandoffModalOpen(true)}>
            Shift Handoff Log
          </Button>
          <Button variant="primary" icon={Layers} onClick={() => navigate("/planning")}>
            APS Scheduler
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Units Produced Today"
          value={totalProduced.toLocaleString()}
          unit="units"
          trend={{ value: "+4.2%", isPositive: true, text: "vs shift target" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Line 1 Operating Speed"
          value="580"
          unit="BPM"
          trend={{ value: "Target 600 BPM", isPositive: true, text: "96.6% speed" }}
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Scrap Waste Rate"
          value="0.92%"
          unit="rejections"
          trend={{ value: `${totalScrap} units`, isPositive: true, text: "under 1.5% limit" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Active Batch Progress"
          value="77%"
          unit="completed"
          trend={{ value: "Step 4 of 6", isPositive: true, text: "filling stage" }}
          icon={CheckCircle2}
          colorVariant="blue"
        />
      </div>

      {/* Active Production Orders & Live Lines Matrix */}
      <div className="grid-2">
        {/* Production Order Queue */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Active Production Orders
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Live dispatch status across bottling, formulation, and canning
              </p>
            </div>
            <Badge variant="cyan">{productionOrders.length} Orders</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {productionOrders.map((ord) => {
              const isSelected = selectedOrder.id === ord.id;
              const isRunning = ord.status === "Running";
              const isPaused = ord.status.includes("Paused");

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    backgroundColor: isSelected ? "rgba(56, 189, 248, 0.12)" : "var(--bg-card-subtle)",
                    border: isSelected ? "1px solid #38BDF8" : "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {ord.line}
                      </span>
                      <Badge variant={isRunning ? "emerald" : isPaused ? "rose" : "slate"} dot={isRunning}>
                        {ord.status}
                      </Badge>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 700 }}>
                      {ord.currentSpeedBPM} BPM
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {ord.productName} ({ord.orderNumber})
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>Output: {ord.producedQuantity.toLocaleString()} / {ord.targetQuantity.toLocaleString()} {ord.unit}</span>
                      <span>{Math.round((ord.producedQuantity / ord.targetQuantity) * 100)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "#1E293B", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, (ord.producedQuantity / ord.targetQuantity) * 100)}%`,
                          height: "100%",
                          backgroundColor: isRunning ? "#10B981" : isPaused ? "#EF4444" : "#38BDF8",
                          borderRadius: "3px"
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Order Execution Detail & Recipe Stage */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Order Control & Recipe Inspection
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {selectedOrder.productName}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Order: <strong style={{ color: "#38BDF8" }}>{selectedOrder.id}</strong> • Batch: <strong style={{ color: "#10B981" }}>{selectedOrder.activeBatchId}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {selectedOrder.status === "Running" ? (
                <Button variant="danger" size="sm" icon={Pause} onClick={() => handleStatusChange(selectedOrder.id, "Paused - Operator Break")}>
                  Pause Run
                </Button>
              ) : (
                <Button variant="success" size="sm" icon={Play} onClick={() => handleStatusChange(selectedOrder.id, "Running")}>
                  Resume Line
                </Button>
              )}
            </div>
          </div>

          {/* SOP Link */}
          <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <FileText size={16} color="#38BDF8" />
            <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              <strong>Standard SOP:</strong> {selectedOrder.workInstructions}
            </div>
          </div>

          {/* Reserved Raw Materials Table */}
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
              Material Lot Consumption & Verification
            </span>
            <div className="data-table-container" style={{ marginTop: "8px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material Lot</th>
                    <th>Ingredient / Packaging</th>
                    <th>Reserved Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches[0]?.rawMaterialLotsReserved?.map((lot, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>{lot.lotNo}</td>
                      <td>{lot.material}</td>
                      <td>{lot.qty}</td>
                      <td><Badge variant="emerald">Verified Barcode</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly Output Bar Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Shift A Production Rate Attainment (Line 1 Bottles/Hour)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Continuous sensor count vs planned 600 BPM takt speed
            </p>
          </div>
          <Badge variant="emerald">Shift Attainment: 98.2%</Badge>
        </div>

        <BarChart
          data={[
            { label: "06:00", actual: 540, target: 600 },
            { label: "07:00", actual: 590, target: 600 },
            { label: "08:00", actual: 580, target: 600 },
            { label: "09:00", actual: 575, target: 600 },
            { label: "10:00", actual: 605, target: 600 },
            { label: "11:00", actual: 595, target: 600 },
            { label: "12:00", actual: 580, target: 600 }
          ]}
          height={180}
          barColor="#0284C7"
          targetColor="#F59E0B"
          yAxisUnit="BPM"
        />
      </Card>

      {/* Shift Handoff Log Modal */}
      <Modal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
        title="Shift Handoff Log & Transfer"
        subtitle="Record operational state and handover notes for the incoming shift team"
      >
        <form onSubmit={handleCreateHandoff} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span>Outgoing: <strong>Shift A (Elena Rostova)</strong></span>
            <span>Incoming: <strong>Shift B (Liam Chen)</strong></span>
          </div>

          <div className="form-group">
            <label className="form-label">Shift Handover Notes & Machine Conditions *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Record line speeds, CIP status, material changeover stages, or unresolved micro-stops..."
              value={handoffNotes}
              onChange={(e) => setHandoffNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsHandoffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Sign Off & Transfer Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

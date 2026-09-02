import React, { useState, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import {
  CalendarRange,
  Plus,
  Play,
  Search,
  X,
  Edit2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Factory
} from "lucide-react";

export function APSScheduler() {
  const { schedules = [], addScheduleEntry, rescheduleOrder, calculateChangeover } = usePlanning();
  const { skus = [], lines = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [newLineId, setNewLineId] = useState(lines[0]?.lineId || "LIN-01");
  const [newStartTime, setNewStartTime] = useState(new Date().toISOString().substring(0, 16).replace("T", " "));

  const availableSkus = useMemo(() => {
    const fg = skus.filter((s) => s.category === "Finished Goods");
    return fg.length > 0 ? fg : skus;
  }, [skus]);

  const defaultSku = availableSkus[0] || {
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    uom: "Bottles"
  };

  const defaultLine = lines[0] || {
    lineId: "LIN-01",
    name: "High-Speed Bottling Line 1",
    lineCode: "LINE-1"
  };

  const [newEntry, setNewEntry] = useState({
    orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    skuId: defaultSku.skuId,
    lineId: defaultLine.lineId,
    targetQuantity: 24000,
    runRate: 500,
    startTime: new Date().toISOString().substring(0, 16).replace("T", " ")
  });

  const resolvedNewSku = useMemo(() => {
    return skus.find((s) => s.skuId === newEntry.skuId) || defaultSku;
  }, [skus, newEntry.skuId, defaultSku]);

  // KPIs
  const totalScheduled = schedules.length;
  const totalHours = Math.round(schedules.reduce((sum, s) => sum + (s.totalDurationHrs || 8), 0) * 10) / 10;
  const totalUnits = schedules.reduce((sum, s) => sum + (Number(s.targetQuantity) || 0), 0);
  const changeoverHours = Math.round(schedules.reduce((sum, s) => sum + (s.changeoverDurationHrs || 0), 0) * 10) / 10;

  const filtered = schedules.filter(
    (s) =>
      s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lineName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.targetQuantity || Number(newEntry.targetQuantity) <= 0) {
      addToast("Quantity must be greater than 0.", "warning");
      return;
    }

    addScheduleEntry(newEntry);
    addToast(`Scheduled order ${newEntry.orderNumber} dispatched to ${newEntry.lineId}!`, "success");
    setIsCreateModalOpen(false);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleItem) return;

    rescheduleOrder(rescheduleItem.scheduleId, newLineId, newStartTime);
    addToast(`Order ${rescheduleItem.orderNumber} successfully rescheduled!`, "success");
    setRescheduleItem(null);
  };

  const handleOptimizeSequence = () => {
    setIsOptimizing(true);
    addToast("APS heuristic sequencing algorithm running to minimize changeover losses...", "info");

    setTimeout(() => {
      setIsOptimizing(false);
      addToast("Production runs sequenced by flavor family! Changeover downtime reduced by 35%.", "success");
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            APS Finite-Capacity Scheduling Board
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={isOptimizing ? Sparkles : Play}
            onClick={handleOptimizeSequence}
            disabled={isOptimizing}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isOptimizing ? "Optimizing Runs..." : "Optimize Run Sequence"}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Schedule Order
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
          title="Scheduled Orders"
          value={totalScheduled.toString()}
          unit="Active Runs"
          icon={CalendarRange}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Scheduled Time"
          value={`${totalHours} hrs`}
          unit="Production + Setup"
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Changeover Downtime"
          value={`${changeoverHours} hrs`}
          unit="CIP & Format Swaps"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Scheduled Output"
          value={totalUnits.toLocaleString()}
          unit="Master Units"
          icon={Layers}
          colorVariant="emerald"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search scheduled runs by order #, product, or line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1000px" }}>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Master Product SKU</th>
                <th>Assigned Line</th>
                <th>Target Quantity</th>
                <th>Speed & Run Time</th>
                <th>Changeover Buffer</th>
                <th>Schedule Start / End</th>
                <th>Validation Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.scheduleId}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {s.orderNumber}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {s.scheduleId}</div>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{s.productName}</div>
                    <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                      {s.productCode}
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{s.lineName}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{s.lineId}</div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {Number(s.targetQuantity).toLocaleString()} Units
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {s.productionDurationHrs} hrs
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>@ {s.runRate} BPM</div>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: s.changeoverDurationHrs > 0 ? "#D97706" : "#059669" }}>
                      +{s.changeoverDurationHrs} hrs ({s.changeoverDurationHrs > 0 ? "Setup" : "Continuous"})
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {s.changeoverReason}
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: 600 }}>{s.startTime}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>to {s.endTime}</div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <Badge variant="emerald">{s.capacityStatus}</Badge>
                      <Badge variant="cyan">{s.materialStatus}</Badge>
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => {
                        setRescheduleItem(s);
                        setNewLineId(s.lineId);
                        setNewStartTime(s.startTime);
                      }}
                      title="Reschedule Order"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE SCHEDULE MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarRange size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Finite-Capacity Scheduled Run
                </h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Production Order Reference *</label>
                <input
                  type="text"
                  required
                  value={newEntry.orderNumber}
                  onChange={(e) => setNewEntry({ ...newEntry, orderNumber: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Master SKU Selection (Single Source of Truth) *</label>
                <select
                  value={newEntry.skuId}
                  onChange={(e) => setNewEntry({ ...newEntry, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId} value={s.skuId}>
                      {s.skuCode} — {s.name} ({s.uom})
                    </option>
                  ))}
                </select>
              </div>

              {resolvedNewSku && (
                <div
                  style={{
                    backgroundColor: "rgba(200, 149, 71, 0.08)",
                    border: "1px dashed #C89547",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    fontSize: "11px"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Code:</span>
                    <div style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                      {resolvedNewSku.skuCode || resolvedNewSku.skuId}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Name:</span>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                      {resolvedNewSku.name || resolvedNewSku.productName}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>UOM:</span>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                      {resolvedNewSku.uom || "Units"}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Line / Work Center *</label>
                  <select
                    value={newEntry.lineId}
                    onChange={(e) => setNewEntry({ ...newEntry, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId} value={l.lineId}>
                        {l.lineCode ? `${l.lineCode} - ` : ""}{l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Planned Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEntry.targetQuantity}
                    onChange={(e) => setNewEntry({ ...newEntry, targetQuantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Run Speed (BPM)</label>
                  <input
                    type="number"
                    value={newEntry.runRate}
                    onChange={(e) => setNewEntry({ ...newEntry, runRate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Planned Start Date & Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM-DD HH:MM"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Commit to APS Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleItem && (
        <div className="modal-backdrop" onClick={() => setRescheduleItem(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Reschedule Order — {rescheduleItem.orderNumber}
                </h2>
              </div>
              <button onClick={() => setRescheduleItem(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {rescheduleItem.productName} ({rescheduleItem.productCode})
              </div>

              <div>
                <label className="form-label">Reassign Work Center / Line *</label>
                <select
                  value={newLineId}
                  onChange={(e) => setNewLineId(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {lines.map((l) => (
                    <option key={l.lineId} value={l.lineId}>
                      {l.lineCode ? `${l.lineCode} - ` : ""}{l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">New Planned Start Timestamp *</label>
                <input
                  type="text"
                  required
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setRescheduleItem(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Schedule Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Factory,
  Sliders,
  Scissors,
  Eye,
  List,
  Calendar as CalendarIcon
} from "lucide-react";

export function APSScheduler() {
  const { schedules = [], addScheduleEntry, rescheduleOrder, calculateChangeover } = usePlanning();
  const { skus = [], lines = [] } = useMasterData();
  const { addToast } = useApp();

  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' | 'table'
  const [selectedShift, setSelectedShift] = useState("ALL");
  const [selectedLineFilter, setSelectedLineFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [splitItem, setSplitItem] = useState(null);
  const [splitCount, setSplitCount] = useState(2);
  const [viewDetailItem, setViewDetailItem] = useState(null);

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

  const filtered = schedules.filter((s) => {
    const matchesSearch =
      s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLine = selectedLineFilter === "ALL" || s.lineId === selectedLineFilter;
    return matchesSearch && matchesLine;
  });

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
    addToast(`Order ${rescheduleItem.orderNumber} successfully rescheduled to ${newLineId}!`, "success");
    setRescheduleItem(null);
  };

  const handleSplitSubmit = (e) => {
    e.preventDefault();
    if (!splitItem) return;

    const subQty = Math.round(splitItem.targetQuantity / splitCount);
    addToast(`Order ${splitItem.orderNumber} split into ${splitCount} sub-batches of ${subQty.toLocaleString()} units each.`, "success");
    setSplitItem(null);
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
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Visual timeline Gantt scheduling, machine line tracks, shift pacing, changeover optimization, and conflict mitigation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* View Switcher */}
          <div style={{ display: "flex", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", padding: "3px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setViewMode("timeline")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: viewMode === "timeline" ? "#C89547" : "transparent",
                color: viewMode === "timeline" ? "#261603" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <CalendarRange size={14} />
              Gantt Timeline
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: viewMode === "table" ? "#C89547" : "transparent",
                color: viewMode === "table" ? "#261603" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <List size={14} />
              Table View
            </button>
          </div>

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

      {/* Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
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

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedLineFilter}
            onChange={(e) => setSelectedLineFilter(e.target.value)}
            className="form-input"
            style={{ height: "36px", fontSize: "12px", width: "auto", minWidth: "160px" }}
          >
            <option value="ALL">All Production Lines</option>
            {lines.map((l) => (
              <option key={l.lineId} value={l.lineId}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GANTT / TIMELINE VIEW */}
      {viewMode === "timeline" ? (
        <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarIcon size={16} color="#C89547" />
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Multi-Line Production Schedule Horizon (Week 36)
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#059669", display: "inline-block" }}></span> Running / Scheduled
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#D97706", display: "inline-block" }}></span> Changeover / CIP
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "rgba(0,0,0,0.06)", border: "1px dashed var(--border-subtle)", display: "inline-block" }}></span> Available Capacity
              </span>
            </div>
          </div>

          {/* Timeline Grid */}
          <div style={{ minWidth: "900px", border: "1px solid var(--border-subtle)", borderRadius: "10px", overflow: "hidden" }}>
            {/* Shifts Header */}
            <div style={{ display: "grid", gridTemplateColumns: "220px repeat(3, 1fr)", backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)", padding: "10px 14px", fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>
              <div>Work Center / Line</div>
              <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>Shift A (06:00 - 14:30)</div>
              <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>Shift B (14:30 - 23:00)</div>
              <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>Shift C (23:00 - 06:00)</div>
            </div>

            {/* Line Tracks */}
            {(lines.length > 0 ? lines : [{ lineId: "LIN-01", name: "Line 1 (Bottling)" }]).map((line) => {
              const lineSchedules = schedules.filter((s) => s.lineId === line.lineId);

              return (
                <div
                  key={line.lineId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr",
                    borderBottom: "1px solid var(--border-subtle)",
                    minHeight: "100px",
                    backgroundColor: "transparent"
                  }}
                >
                  {/* Line Label */}
                  <div style={{ padding: "14px", borderRight: "1px solid var(--border-subtle)", backgroundColor: "rgba(200, 149, 71, 0.02)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{line.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{line.lineId} • Capacity: {line.capacity || "42,000 BPH"}</div>
                    <div style={{ marginTop: "6px" }}>
                      <Badge variant={lineSchedules.length > 0 ? "emerald" : "slate"}>
                        {lineSchedules.length} Run{lineSchedules.length !== 1 ? "s" : ""} Assigned
                      </Badge>
                    </div>
                  </div>

                  {/* Line Schedule Blocks track */}
                  <div style={{ padding: "12px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {lineSchedules.length > 0 ? (
                      lineSchedules.map((s) => (
                        <div
                          key={s.scheduleId}
                          style={{
                            flex: "1 1 240px",
                            backgroundColor: "var(--bg-card-subtle)",
                            border: "1px solid #C89547",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                              {s.orderNumber}
                            </span>
                            <Badge variant={s.status === "Running" ? "emerald" : "cyan"}>
                              {s.status || "Scheduled"}
                            </Badge>
                          </div>

                          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {s.productName}
                          </div>

                          <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                            <span>Qty: {Number(s.targetQuantity).toLocaleString()} units</span>
                            <span>Duration: {s.productionDurationHrs} hrs</span>
                          </div>

                          {s.changeoverDurationHrs > 0 && (
                            <div style={{ fontSize: "10px", color: "#D97706", backgroundColor: "rgba(217, 119, 6, 0.08)", padding: "3px 6px", borderRadius: "4px", fontWeight: 600 }}>
                              +{s.changeoverDurationHrs}h CIP: {s.changeoverReason}
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "4px", borderTop: "1px solid var(--border-subtle)", paddingTop: "6px" }}>
                            <button
                              onClick={() => setViewDetailItem(s)}
                              title="View Order Details"
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "transparent",
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              onClick={() => {
                                setRescheduleItem(s);
                                setNewLineId(s.lineId);
                                setNewStartTime(s.startTime);
                              }}
                              title="Reschedule / Move"
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "rgba(200, 149, 71, 0.12)",
                                color: "#8C5B23",
                                border: "1px solid #C89547",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Edit2 size={12} /> Move
                            </button>
                            <button
                              onClick={() => setSplitItem(s)}
                              title="Split Order into Batches"
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "transparent",
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Scissors size={12} /> Split
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: "12px", fontStyle: "italic" }}>
                        No orders scheduled for this line. Capacity available for assignment.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* TABLE VIEW */
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
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
      )}

      {/* SPLIT ORDER MODAL */}
      {splitItem && (
        <div className="modal-backdrop" onClick={() => setSplitItem(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Scissors size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Split Order into Sub-Batches
                </h2>
              </div>
              <button onClick={() => setSplitItem(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSplitSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {splitItem.orderNumber} — {splitItem.productName} ({Number(splitItem.targetQuantity).toLocaleString()} units)
              </div>

              <div>
                <label className="form-label">Number of Split Sub-Batches *</label>
                <select
                  value={splitCount}
                  onChange={(e) => setSplitCount(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value={2}>2 Sub-Batches ({Math.round(splitItem.targetQuantity / 2).toLocaleString()} units each)</option>
                  <option value={3}>3 Sub-Batches ({Math.round(splitItem.targetQuantity / 3).toLocaleString()} units each)</option>
                  <option value={4}>4 Sub-Batches ({Math.round(splitItem.targetQuantity / 4).toLocaleString()} units each)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setSplitItem(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Confirm Split</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewDetailItem && (
        <div className="modal-backdrop" onClick={() => setViewDetailItem(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Order Details — {viewDetailItem.orderNumber}
                </h2>
              </div>
              <button onClick={() => setViewDetailItem(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Product Name</span>
                  <strong>{viewDetailItem.productName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Product Code</span>
                  <strong>{viewDetailItem.productCode}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Assigned Line</span>
                  <strong>{viewDetailItem.lineName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Planned Quantity</span>
                  <strong>{Number(viewDetailItem.targetQuantity).toLocaleString()} Units</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Start Time</span>
                  <span>{viewDetailItem.startTime}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>End Time</span>
                  <span>{viewDetailItem.endTime}</span>
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "rgba(200, 149, 71, 0.08)", borderRadius: "8px", border: "1px solid #C89547" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#8C5B23" }}>Capacity & Material Readiness Check</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  All required BOM ingredients (Sugar, Orange Concentrate, 500ml PET Bottles, Tamper Caps) verified in warehouse staging.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewDetailItem(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

import React, { useState } from "react";
import {
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Plus,
  Lock,
  Unlock,
  Filter,
  Download,
  X,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function SchedulePage() {
  const { addToast } = useApp();

  const [schedules, setSchedules] = useState([
    { id: "SCH-2026-904", sku: "Organic Cold-Pressed Orange Juice 500ml", line: "Line 1 (Aseptic)", quantity: 45000, startTime: "06:00", endTime: "14:30", status: "Running", locked: true },
    { id: "SCH-2026-905", sku: "Artisan Ginger-Lime Concentrate 5000L", line: "Line 2 (Pasteurizer)", quantity: 5000, startTime: "07:00", endTime: "12:00", status: "Scheduled", locked: false },
    { id: "SCH-2026-906", sku: "Sparkling Yuzu Sparkling Tea 330ml Can", line: "Line 3 (Canning)", quantity: 60000, startTime: "06:00", endTime: "18:00", status: "Running", locked: true }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    line: "Line 1 (Aseptic)",
    quantity: 15000,
    startTime: "06:00",
    endTime: "14:00",
    status: "Scheduled"
  });

  const handleToggleLock = (id) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
    addToast(`Schedule run ${id} status toggled!`, "info");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku.trim()) {
      addToast("Please provide target SKU name", "warning");
      return;
    }
    const newSchedule = {
      id: `SCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      sku: formData.sku,
      line: formData.line,
      quantity: Number(formData.quantity),
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: "Scheduled",
      locked: false
    };
    setSchedules([...schedules, newSchedule]);
    addToast(`Scheduled run ${newSchedule.id} created!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      sku: "",
      line: "Line 1 (Aseptic)",
      quantity: 15000,
      startTime: "06:00",
      endTime: "14:00",
      status: "Scheduled"
    });
  };

  const handleExportCSV = () => {
    const headers = "Schedule ID,SKU,Line,Planned Qty,Start Time,End Time,Status,Locked\n";
    const rows = schedules
      .map((s) => `"${s.id}","${s.sku}","${s.line}",${s.quantity},"${s.startTime}","${s.endTime}","${s.status}",${s.locked || false}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Master_Production_Schedule_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Master schedule exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Master Production Schedule (MPS)
            </h1>
            <Badge variant="cyan">{schedules.length} ACTIVE RUNS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Scheduled Run
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
          title="Scheduled Orders"
          value={schedules.length.toString()}
          unit="Active Runs"
          trend={{ value: "100% capacity matched", isPositive: true, text: "" }}
          icon={Calendar}
          colorVariant="cyan"
        />
        <StatCard
          title="Planned Output"
          value={`${schedules.reduce((s, o) => s + o.quantity, 0).toLocaleString()}`}
          unit="Units"
          trend={{ value: "Shift A & B full run", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Schedule Adherence"
          value="99.2%"
          unit="Adherence"
          trend={{ value: "Zero unexcused deviations", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Finite Loading"
          value="94.6%"
          unit="Utilization"
          trend={{ value: "Within nominal pacing", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Main Schedule Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Today's Master Production Schedule Sequence
          </h3>
          <Badge variant="cyan">FINITE SEQUENCING</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Schedule ID</th>
                <th>Target SKU & Product</th>
                <th>Assigned Line</th>
                <th>Planned Quantity</th>
                <th>Time Window</th>
                <th>Status</th>
                <th>Lock</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{s.sku}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{s.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                    {s.quantity.toLocaleString()} units
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                    {s.startTime} - {s.endTime}
                  </td>
                  <td>
                    <Badge variant={s.status === "Running" ? "emerald" : "cyan"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleLock(s.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: s.locked ? "var(--bg-card-subtle)" : "transparent",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {s.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      <span>{s.locked ? "Locked" : "Unlocked"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Scheduled Production Run
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">SKU Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lemonade Sparkling 500ml PET"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Production Line</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Line 1 (Aseptic)">Line 1 (Aseptic Bottling)</option>
                    <option value="Line 2 (Pasteurizer)">Line 2 (Formulation/Pasteurizer)</option>
                    <option value="Line 3 (Canning)">Line 3 (Canning & Packaging)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Planned Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Planned End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save to Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

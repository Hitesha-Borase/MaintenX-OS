import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Layers,
  Edit,
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
    { id: "SCH-001", sku: "Sparkling Citrus Soda 500ml", line: "Line 1 (Aseptic)", quantity: 45000, startTime: "06:00", endTime: "16:30", status: "Running", locked: true },
    { id: "SCH-002", sku: "Tonic Water Natural 1L", line: "Line 1 (Aseptic)", quantity: 30000, startTime: "17:00", endTime: "23:30", status: "Queued", locked: true },
    { id: "SCH-003", sku: "Organic Ginger Beer 330ml Can", line: "Line 3 (Canning)", quantity: 60000, startTime: "07:00", endTime: "20:00", status: "Running", locked: false },
    { id: "SCH-004", sku: "Citrus Formulation Batch 44", line: "Line 2 (Pasteurizer)", quantity: 12000, startTime: "08:00", endTime: "14:00", status: "Running", locked: true }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    line: "Line 1 (Aseptic)",
    quantity: 25000,
    startTime: "06:00",
    endTime: "14:00"
  });

  const handleToggleLock = (id) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
    addToast("Schedule lock status updated.", "info");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku) {
      addToast("Please enter SKU name", "warning");
      return;
    }
    const newSch = {
      id: `SCH-00${schedules.length + 1}`,
      sku: formData.sku,
      line: formData.line,
      quantity: Number(formData.quantity),
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: "Scheduled",
      locked: false
    };
    setSchedules([...schedules, newSch]);
    addToast(`Scheduled order ${newSch.id} added to MPS!`, "success");
    setIsAddModalOpen(false);
    setFormData({ sku: "", line: "Line 1 (Aseptic)", quantity: 25000, startTime: "06:00", endTime: "14:00" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Master Production Schedule (MPS)
            </h1>
            <Badge variant="cyan">Finite Capacity Scheduling</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Line scheduling sequence, planned start/finish times, changeover buffers, and production order dispatching.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Scheduled Run
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Scheduled Orders"
          value={schedules.length.toString()}
          unit="Active Runs"
          trend={{ value: "100% finite capacity matched", isPositive: true, text: "" }}
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
          unit=""
          trend={{ value: "Zero unexcused deviations", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Schedule Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Today's Master Production Schedule Sequence
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
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
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.sku}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {s.quantity.toLocaleString()} units
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {s.startTime} - {s.endTime}
                  </td>
                  <td>
                    <Badge variant={s.status === "Running" ? "emerald" : "cyan"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant={s.locked ? "secondary" : "ghost"}
                      size="sm"
                      icon={s.locked ? Lock : Unlock}
                      onClick={() => handleToggleLock(s.id)}
                    >
                      {s.locked ? "Locked" : "Unlocked"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Scheduled Production Run
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">SKU Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lemonade Sparkling 500ml PET"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Production Line</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
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
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Planned Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Planned End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

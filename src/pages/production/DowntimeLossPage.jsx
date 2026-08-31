import React, { useState } from "react";
import {
  AlertOctagon,
  Clock,
  DollarSign,
  TrendingDown,
  Download,
  Plus,
  X,
  Layers,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";

export function DowntimeLossPage() {
  const { addToast } = useApp();

  const [downtimeEvents, setDowntimeEvents] = useState([
    { id: "DT-101", line: "Line 2 (Pasteurizer)", reason: "Thermal seal degradation & CIP re-flush", durationMins: 45, costUSD: 2625, status: "Resolved" },
    { id: "DT-102", line: "Line 1 (Aseptic)", reason: "Cap conveyor sensor jam", durationMins: 18, costUSD: 1050, status: "Resolved" },
    { id: "DT-103", line: "Line 3 (Canning)", reason: "Seamer head micro-adjustment", durationMins: 12, costUSD: 700, status: "Resolved" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    line: "Line 1 (Aseptic)",
    reason: "",
    durationMins: 20
  });

  const totalDowntimeMins = downtimeEvents.reduce((s, d) => s + d.durationMins, 0);
  const totalFinancialLoss = downtimeEvents.reduce((s, d) => s + d.costUSD, 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.reason) {
      addToast("Please provide stoppage reason", "warning");
      return;
    }
    const cost = Number(newEvent.durationMins) * 58.33; // Approx $3500/hr
    const event = {
      id: `DT-10${downtimeEvents.length + 1}`,
      line: newEvent.line,
      reason: newEvent.reason,
      durationMins: Number(newEvent.durationMins),
      costUSD: Math.round(cost),
      status: "Logged"
    };
    setDowntimeEvents([...downtimeEvents, event]);
    addToast(`Downtime Event ${event.id} registered!`, "success");
    setIsModalOpen(false);
    setNewEvent({ line: "Line 1 (Aseptic)", reason: "", durationMins: 20 });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Production Downtime & Stoppage Loss Log
            </h1>
            <Badge variant="rose">Cost of Stoppages</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Quantification of unplanned line stoppages, production speed losses, and direct financial impact.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Log Production Stoppage
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Total Downtime Duration"
          value={`${totalDowntimeMins} mins`}
          unit="Shift Total"
          trend={{ value: "3 Events logged", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="rose"
        />
        <StatCard
          title="Total Financial Loss"
          value={`$${totalFinancialLoss.toLocaleString()}`}
          unit="Direct Loss"
          trend={{ value: "Lost unit capacity", isPositive: false, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="Downtime Availability Loss"
          value="3.1%"
          unit="Impact"
          trend={{ value: "Within 5% shift tolerance", isPositive: true, text: "" }}
          icon={TrendingDown}
          colorVariant="amber"
        />
      </div>

      {/* Events Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Today's Production Outages & Major Stops
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Affected Line</th>
                <th>Root Cause / Symptom</th>
                <th>Duration</th>
                <th>Cost Impact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {downtimeEvents.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{d.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.line}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.reason}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#EF4444" }}>
                    {d.durationMins} mins
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#F59E0B" }}>
                    ${d.costUSD.toLocaleString()}
                  </td>
                  <td>
                    <Badge variant="emerald">{d.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOG MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log Production Stoppage
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Production Line</label>
                <select
                  className="form-select"
                  value={newEvent.line}
                  onChange={(e) => setNewEvent({ ...newEvent, line: e.target.value })}
                >
                  <option value="Line 1 (Aseptic)">Line 1 (Aseptic Bottling)</option>
                  <option value="Line 2 (Pasteurizer)">Line 2 (Formulation/Pasteurizer)</option>
                  <option value="Line 3 (Canning)">Line 3 (Canning Line)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Stoppage Symptom / Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infeed conveyor bottle jam / Sensor drift"
                  value={newEvent.reason}
                  onChange={(e) => setNewEvent({ ...newEvent, reason: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Downtime Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newEvent.durationMins}
                  onChange={(e) => setNewEvent({ ...newEvent, durationMins: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Stoppage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

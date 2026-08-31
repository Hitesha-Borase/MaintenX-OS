import React, { useState } from "react";
import {
  Clock,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Gauge,
  Layers,
  Wrench
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function HBManagementPage() {
  const { addToast } = useApp();

  const [hourlyLogs, setHourlyLogs] = useState([
    { id: 1, hour: "06:00 - 07:00", target: 4000, actual: 4120, delta: 120, cumDelta: 120, reason: "Nominal steady state", action: "None" },
    { id: 2, hour: "07:00 - 08:00", target: 4000, actual: 3950, delta: -50, cumDelta: 70, reason: "Label reel splice pause", action: "Reel pre-staging verified" },
    { id: 3, hour: "08:00 - 09:00", target: 4000, actual: 4080, delta: 80, cumDelta: 150, reason: "Speed increased to 102%", action: "Maintain pace" },
    { id: 4, hour: "09:00 - 10:00", target: 4000, actual: 3400, delta: -600, cumDelta: -450, reason: "Scheduled CIP line flush", action: "CIP completed in 22 mins" },
    { id: 5, hour: "10:00 - 11:00", target: 4000, actual: 4200, delta: 200, cumDelta: -250, reason: "Recovery run-rate enabled", action: "Catch-up pace maintained" },
    { id: 6, hour: "11:00 - 12:00", target: 4000, actual: 4150, delta: 150, cumDelta: -100, reason: "Optimal filling performance", action: "On-track" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    hour: "12:00 - 13:00",
    target: 4000,
    actual: 4100,
    reason: "",
    action: ""
  });

  const totalTarget = hourlyLogs.reduce((sum, h) => sum + h.target, 0);
  const totalActual = hourlyLogs.reduce((sum, h) => sum + h.actual, 0);
  const totalDelta = totalActual - totalTarget;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const delta = Number(newEntry.actual) - Number(newEntry.target);
    const lastCum = hourlyLogs[hourlyLogs.length - 1]?.cumDelta || 0;
    const cumDelta = lastCum + delta;

    const entry = {
      id: Date.now(),
      hour: newEntry.hour,
      target: Number(newEntry.target),
      actual: Number(newEntry.actual),
      delta,
      cumDelta,
      reason: newEntry.reason || "Normal production",
      action: newEntry.action || "Standard monitoring"
    };

    setHourlyLogs([...hourlyLogs, entry]);
    addToast(`H/B entry for ${newEntry.hour} logged successfully!`, "success");
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Time Window,Target (units),Actual (units),Hourly Delta,Cumulative Delta,Root Cause / Reason,Corrective Action\n";
    const rows = hourlyLogs
      .map((h) => `"${h.hour}",${h.target},${h.actual},${h.delta},${h.cumDelta},"${h.reason}","${h.action}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Hour_By_Hour_Pacing_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Hour-by-Hour report exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Hour-by-Hour (H/B) Pacing Management
            </h1>
            <Badge variant="cyan">Shift A Active Board</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Granular hourly pitch monitoring, short-interval control (SIC), pace variances, and shop-floor countermeasures.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export H/B Board
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Log Hour Pitch
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Shift Target Output"
          value={totalTarget.toLocaleString()}
          unit="Units"
          trend={{ value: "Planned Shift Run", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="blue"
        />
        <StatCard
          title="Actual Output (YTD)"
          value={totalActual.toLocaleString()}
          unit="Units"
          trend={{ value: `${Math.round((totalActual / totalTarget) * 100)}% of target met`, isPositive: totalActual >= totalTarget, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Cumulative Pace Delta"
          value={totalDelta >= 0 ? `+${totalDelta}` : `${totalDelta}`}
          unit="Units"
          trend={{ value: totalDelta >= 0 ? "Ahead of pace" : "Recovery needed", isPositive: totalDelta >= 0, text: "" }}
          icon={totalDelta >= 0 ? TrendingUp : TrendingDown}
          colorVariant={totalDelta >= 0 ? "emerald" : "rose"}
        />
        <StatCard
          title="Line Run Rate"
          value="4,150 / hr"
          unit="Bottles/hr"
          trend={{ value: "+3.7% above nominal pitch", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
      </div>

      {/* Main H/B Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Short-Interval Hourly Pitch Log (Line 1 Aseptic)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Hour-by-hour output, delta vs plan, root cause of loss, and shop-floor recovery actions
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time Window</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Hourly Delta</th>
                <th>Cumulative Delta</th>
                <th>Primary Variance Reason</th>
                <th>Corrective Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {hourlyLogs.map((h) => (
                <tr key={h.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{h.hour}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{h.target.toLocaleString()}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                    {h.actual.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: h.delta >= 0 ? "#10B981" : "#EF4444" }}>
                    {h.delta >= 0 ? `+${h.delta}` : h.delta}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: h.cumDelta >= 0 ? "#10B981" : "#F59E0B" }}>
                    {h.cumDelta >= 0 ? `+${h.cumDelta}` : h.cumDelta}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {h.reason}
                  </td>
                  <td>
                    <span style={{ fontSize: "11px", backgroundColor: "var(--bg-surface)", padding: "4px 8px", borderRadius: "4px", color: "#38BDF8", border: "1px solid var(--border-subtle)" }}>
                      {h.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: ADD HOURLY LOG */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Record Hour-by-Hour Pitch
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Time Window *</label>
                <input
                  type="text"
                  required
                  value={newEntry.hour}
                  onChange={(e) => setNewEntry({ ...newEntry, hour: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Units</label>
                  <input
                    type="number"
                    value={newEntry.target}
                    onChange={(e) => setNewEntry({ ...newEntry, target: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Actual Units Produced *</label>
                  <input
                    type="number"
                    required
                    value={newEntry.actual}
                    onChange={(e) => setNewEntry({ ...newEntry, actual: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Variance Reason (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. Minor sensor alignment stop / Jam cleared"
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Corrective Countermeasure Taken</label>
                <input
                  type="text"
                  placeholder="e.g. Line speed increased to 105% / Cleaned photoeye"
                  value={newEntry.action}
                  onChange={(e) => setNewEntry({ ...newEntry, action: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Hourly Pitch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

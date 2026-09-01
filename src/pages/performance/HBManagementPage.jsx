import React, { useState } from "react";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Gauge,
  Layers,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  X,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function HBManagementPage() {
  const { addToast } = useApp();

  const [hourlyLogs, setHourlyLogs] = useState([
    { id: "HB-01", hour: "06:00 - 07:00", target: 4000, actual: 4050, delta: +50, cumDelta: +50, reason: "Smooth startup", action: "None" },
    { id: "HB-02", hour: "07:00 - 08:00", target: 4000, actual: 4020, delta: +20, cumDelta: +70, reason: "Optimal pacing", action: "None" },
    { id: "HB-03", hour: "08:00 - 09:00", target: 4000, actual: 3650, delta: -350, cumDelta: -280, reason: "Starwheel infeed bottle jam", action: "Sensor re-calibrated & speed restored" },
    { id: "HB-04", hour: "09:00 - 10:00", target: 4000, actual: 4180, delta: +180, cumDelta: -100, reason: "Recovery run rate", action: "Operating at 105% nominal speed" },
    { id: "HB-05", hour: "10:00 - 11:00", target: 4000, actual: 4100, delta: +100, cumDelta: 0, reason: "Balanced flow", action: "None" },
    { id: "HB-06", hour: "11:00 - 12:00", target: 4000, actual: 3980, delta: -20, cumDelta: -20, reason: "Operator meal transition", action: "Cross-trained coverage active" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    hour: "12:00 - 13:00",
    target: 4000,
    actual: 4050,
    reason: "On target",
    action: "None"
  });

  const totalTarget = hourlyLogs.reduce((sum, h) => sum + h.target, 0);
  const totalActual = hourlyLogs.reduce((sum, h) => sum + h.actual, 0);
  const totalDelta = totalActual - totalTarget;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const delta = newEntry.actual - newEntry.target;
    const lastCum = hourlyLogs.length > 0 ? hourlyLogs[hourlyLogs.length - 1].cumDelta : 0;
    const cumDelta = lastCum + delta;

    const entry = {
      id: `HB-0${hourlyLogs.length + 1}`,
      hour: newEntry.hour,
      target: Number(newEntry.target),
      actual: Number(newEntry.actual),
      delta,
      cumDelta,
      reason: newEntry.reason || "Nominal run",
      action: newEntry.action || "None"
    };

    setHourlyLogs([...hourlyLogs, entry]);
    addToast(`Hourly pitch record logged (${entry.hour})!`, "success");
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Pitch ID,Hour Window,Target,Actual,Delta,Cumulative Delta,Reason,Action\n";
    const rows = hourlyLogs
      .map((h) => `"${h.id}","${h.hour}",${h.target},${h.actual},${h.delta},${h.cumDelta},"${h.reason}","${h.action}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Hour_By_Hour_Pitch_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Hour-by-hour tracking exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Hour-by-Hour (H/B) Pacing Management
            </h1>
            <Badge variant="cyan">SHIFT A ACTIVE BOARD</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export H/B Board
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log Hour Pitch
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
          title="Shift Target Output"
          value={totalTarget.toLocaleString()}
          unit="Units"
          trend={{ value: "Planned Shift Run", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
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
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Short-Interval Hourly Pitch Log (Line 1 Aseptic)
          </h3>
          <Badge variant="emerald">{hourlyLogs.length} RECORDED PITCHES</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
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
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{h.hour}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{h.target.toLocaleString()}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                    {h.actual.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: h.delta >= 0 ? "#059669" : "#DC2626" }}>
                    {h.delta >= 0 ? `+${h.delta}` : h.delta}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: h.cumDelta >= 0 ? "#059669" : "#D97706" }}>
                    {h.cumDelta >= 0 ? `+${h.cumDelta}` : h.cumDelta}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {h.reason}
                  </td>
                  <td>
                    <span style={{ fontSize: "11px", backgroundColor: "var(--bg-card-subtle)", padding: "4px 8px", borderRadius: "4px", color: "#8C5B23", border: "1px solid var(--border-subtle)", fontWeight: 600 }}>
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
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Record Hour-by-Hour Pitch
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Time Window *</label>
                <input
                  type="text"
                  required
                  value={newEntry.hour}
                  onChange={(e) => setNewEntry({ ...newEntry, hour: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
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
                    style={{ backgroundColor: "#FFFFFF" }}
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
                    style={{ backgroundColor: "#FFFFFF" }}
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
                  style={{ backgroundColor: "#FFFFFF" }}
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
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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

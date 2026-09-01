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
  AlertTriangle,
  Factory,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function DowntimeLossPage() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [downtimeEvents, setDowntimeEvents] = useState([
    { id: "DT-101", line: "Line 2 (Pasteurizer)", reason: "Thermal seal degradation & CIP re-flush", durationMins: 45, costUSD: 2625, status: "Resolved" },
    { id: "DT-102", line: "Line 1 (Aseptic)", reason: "Cap conveyor sensor glare & micro-jam", durationMins: 18, costUSD: 1050, status: "Resolved" },
    { id: "DT-103", line: "Line 3 (Canning)", reason: "Seamer head roller micro-adjustment", durationMins: 12, costUSD: 700, status: "Resolved" }
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
    if (!newEvent.reason.trim()) {
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

  const handleExportCSV = () => {
    const headers = "Event ID,Line Asset,Stoppage Reason,Duration (Mins),Financial Loss ($),Status\n";
    const rows = downtimeEvents
      .map((d) => `"${d.id}","${d.line}","${d.reason}",${d.durationMins},${d.costUSD},"${d.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Production_Downtime_Loss_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Downtime loss log exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Production Downtime & Stoppage Loss Log
            </h1>
            <Badge variant="rose">{downtimeEvents.length} STOPPAGE EVENTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log Stoppage
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
          title="Total Downtime"
          value={`${totalDowntimeMins} mins`}
          unit="Shift Total"
          trend={{ value: "3 Events logged", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="rose"
        />
        <StatCard
          title="Direct Financial Loss"
          value={`$${totalFinancialLoss.toLocaleString()}`}
          unit="USD"
          trend={{ value: "Capacity loss impact", isPositive: false, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="OEE Availability"
          value="91.2%"
          unit="Availability"
          trend={{ value: "Target: 95.0%", isPositive: false, text: "" }}
          icon={TrendingDown}
          colorVariant="amber"
        />
        <StatCard
          title="Mean Time to Repair"
          value="25 min"
          unit="MTTR"
          trend={{ value: "Rapid triage response", isPositive: true, text: "" }}
          icon={AlertOctagon}
          colorVariant="emerald"
        />
      </div>

      {/* Downtime Events Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Logged Stoppage Records & Root Causes
          </h3>
          <Badge variant="cyan">{downtimeEvents.length} INCIDENTS</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Line / Machine</th>
                <th>Stoppage Reason</th>
                <th>Duration (Mins)</th>
                <th>Financial Loss</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {downtimeEvents.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{d.id}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{d.line}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{d.reason}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626" }}>
                    {d.durationMins} min
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626" }}>
                    ${d.costUSD.toLocaleString()}
                  </td>
                  <td>
                    <Badge variant={d.status === "Resolved" ? "emerald" : "amber"}>
                      {d.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate("/ci/rca/investigations")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
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
                      <span>RCA 8D</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log Production Stoppage
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Production Line *</label>
                <select
                  className="form-select"
                  value={newEvent.line}
                  onChange={(e) => setNewEvent({ ...newEvent, line: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Line 1 (Aseptic)">Line 1 (Aseptic Bottling)</option>
                  <option value="Line 2 (Pasteurizer)">Line 2 (Formulation & Blending)</option>
                  <option value="Line 3 (Canning)">Line 3 (Canning Line)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Stoppage Reason / Failure Mode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starwheel bottle jam or temperature sensor alarm"
                  value={newEvent.reason}
                  onChange={(e) => setNewEvent({ ...newEvent, reason: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Downtime Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  value={newEvent.durationMins}
                  onChange={(e) => setNewEvent({ ...newEvent, durationMins: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Log Stoppage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
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
import { useMasterData } from "../../context/MasterDataContext";
import { useNavigate } from "react-router-dom";
import productionService from "../../services/productionService";

export function DowntimeLossPage() {
  const { addToast } = useApp();
  const { lines = [] } = useMasterData();
  const navigate = useNavigate();

  const [downtimeEvents, setDowntimeEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    line: "",
    reason: "",
    durationMins: ""
  });

  useEffect(() => {
    productionService.getDowntime()
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        if (Array.isArray(data)) {
          setDowntimeEvents(data);
        }
      })
      .catch((err) => console.warn("Downtime load:", err.message));
  }, []);

  const totalDowntimeMins = downtimeEvents.reduce((s, d) => s + Number(d.durationMins || d.durationMinutes || 0), 0);
  const totalFinancialLoss = downtimeEvents.reduce((s, d) => s + Number(d.costUSD || (Number(d.durationMins || d.durationMinutes || 0) * 58.33)), 0);
  const mttr = downtimeEvents.length > 0 ? Math.round(totalDowntimeMins / downtimeEvents.length) : 0;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.reason.trim()) {
      addToast("Please provide stoppage reason", "warning");
      return;
    }
    const cost = Math.round(Number(newEvent.durationMins) * 58.33); // Approx $3500/hr
    const eventPayload = {
      line: newEvent.line,
      reason: newEvent.reason,
      durationMins: Number(newEvent.durationMins),
      costUSD: cost,
      status: "Logged"
    };

    try {
      const res = await productionService.logDowntime(eventPayload);
      const saved = res?.data?.data || res?.data || res;
      const newId = saved?.id || `DT-${Date.now()}`;
      setDowntimeEvents((prev) => [{ id: newId, ...eventPayload }, ...prev]);
      addToast(`Downtime Event registered!`, "success");
    } catch (err) {
      const newId = `DT-${Date.now()}`;
      setDowntimeEvents((prev) => [{ id: newId, ...eventPayload }, ...prev]);
      addToast(`Downtime Event registered (local)!`, "info");
    }

    setIsModalOpen(false);
    setNewEvent({ line: "", reason: "", durationMins: "" });
  };

  const handleExportCSV = () => {
    const headers = "Event ID,Line Asset,Stoppage Reason,Duration (Mins),Financial Loss ($),Status\n";
    const rows = downtimeEvents
      .map((d) => `"${d.id}","${d.line || ''}","${d.reason || ''}",${d.durationMins || 0},${Math.round(d.costUSD || 0)},"${d.status || ''}"`)
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
            <Badge variant={downtimeEvents.length > 0 ? "rose" : "zinc"}>
              {downtimeEvents.length} STOPPAGE EVENTS
            </Badge>
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
          trend={{
            value: `${downtimeEvents.length} Events logged`,
            isPositive: downtimeEvents.length === 0,
            text: ""
          }}
          icon={Clock}
          colorVariant="rose"
        />
        <StatCard
          title="Direct Financial Loss"
          value={`$${Math.round(totalFinancialLoss).toLocaleString()}`}
          unit="USD"
          trend={{
            value: totalFinancialLoss > 0 ? "Capacity loss impact" : "Zero stoppage loss",
            isPositive: totalFinancialLoss === 0,
            text: ""
          }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="OEE Availability"
          value={downtimeEvents.length > 0 ? "91.2%" : "100%"}
          unit="Availability"
          trend={{
            value: downtimeEvents.length > 0 ? "Target: 95.0%" : "Zero unplanned downtime",
            isPositive: downtimeEvents.length === 0,
            text: ""
          }}
          icon={TrendingDown}
          colorVariant="amber"
        />
        <StatCard
          title="Mean Time to Repair"
          value={`${mttr} min`}
          unit="MTTR"
          trend={{
            value: mttr > 0 ? "Average stoppage duration" : "No stoppage events",
            isPositive: true,
            text: ""
          }}
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
              {downtimeEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "var(--text-secondary)" }}>
                    No stoppage events recorded.
                  </td>
                </tr>
              ) : (
                downtimeEvents.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{d.id}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{d.line || "Line 1"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{d.reason}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626" }}>
                      {d.durationMins || d.durationMinutes || 0} min
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626" }}>
                      ${Math.round(Number(d.costUSD || ((d.durationMins || d.durationMinutes || 0) * 58.33))).toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={d.status === "Resolved" ? "emerald" : "amber"}>
                        {d.status || "Logged"}
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
                ))
              )}
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
                  required
                >
                  <option value="">-- Select Production Line from DB --</option>
                  {lines.map((l) => (
                    <option key={l.lineId || l.id} value={l.name}>
                      {l.lineCode ? `${l.lineCode} — ` : ""}{l.name}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: "6px" }}>
                  <input
                    type="text"
                    placeholder="Or Enter Line Name manually"
                    value={newEvent.line}
                    onChange={(e) => setNewEvent({ ...newEvent, line: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF", fontSize: "12px", height: "30px" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Stoppage Reason / Failure Mode *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Stoppage Reason / Failure Mode"
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
                  min="1"
                  placeholder="Enter Duration in Minutes"
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

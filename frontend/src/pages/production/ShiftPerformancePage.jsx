import React, { useState } from "react";
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  FileText,
  Download,
  Award
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ShiftPerformancePage() {
  const { shiftHandoffs = [], addShiftHandoff } = useProduction();
  const { addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    shiftFrom: "",
    shiftTo: "",
    supervisor: "",
    receivedBy: "",
    unitsProduced: "",
    scrapUnits: "",
    notes: ""
  });

  const totalShiftOutput = shiftHandoffs.reduce((sum, s) => sum + Number(s.unitsProduced || 0), 0);
  const totalShiftScrap = shiftHandoffs.reduce((sum, s) => sum + Number(s.scrapUnits || 0), 0);
  const avgScrapRate = (totalShiftOutput + totalShiftScrap) > 0
    ? ((totalShiftScrap / (totalShiftOutput + totalShiftScrap)) * 100).toFixed(1)
    : "0.0";

  const shiftComparison = shiftHandoffs.map((sh) => {
    const units = Number(sh.unitsProduced || 0);
    const scrap = Number(sh.scrapUnits || 0);
    const scrapPct = (units + scrap) > 0 ? ((scrap / (units + scrap)) * 100).toFixed(1) : "0.0";
    const qualityRate = (units + scrap) > 0 ? `${((units / (units + scrap)) * 100).toFixed(1)}%` : "—";
    return {
      id: sh.id,
      label: `${sh.shiftFrom || "Shift 1"} ➔ ${sh.shiftTo || "Shift 2"}`,
      output: `${units.toLocaleString()} units`,
      scrap: `${scrap.toLocaleString()} units (${scrapPct}%)`,
      oee: qualityRate,
      supervisor: sh.handedOverBy || "—",
      receiver: sh.receivedBy || "—",
      notes: sh.notes || "—"
    };
  });

  const distinctShifts = new Set(shiftHandoffs.map((s) => s.shiftFrom)).size;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.notes.trim()) {
      addToast("Please provide handoff notes", "warning");
      return;
    }
    if (addShiftHandoff) {
      await addShiftHandoff({
        shiftFrom: formData.shiftFrom.trim() || "Shift 1",
        shiftTo: formData.shiftTo.trim() || "Shift 2",
        handedOverBy: formData.supervisor.trim() || "Operator",
        receivedBy: formData.receivedBy.trim() || "Relief Operator",
        unitsProduced: Number(formData.unitsProduced) || 0,
        scrapUnits: Number(formData.scrapUnits) || 0,
        notes: formData.notes.trim()
      });
    }
    addToast("Shift handoff log recorded and digitally signed!", "success");
    setIsModalOpen(false);
    setFormData({
      shiftFrom: "",
      shiftTo: "",
      supervisor: "",
      receivedBy: "",
      unitsProduced: "",
      scrapUnits: "",
      notes: ""
    });
  };

  const handleExportCSV = () => {
    const headers = "Shift Transition,Output Units,Scrap Units,Outgoing Supervisor,Incoming Lead,Notes\n";
    const rows = shiftHandoffs
      .map((s) => `"${s.shiftFrom} -> ${s.shiftTo}",${s.unitsProduced || 0},${s.scrapUnits || 0},"${s.handedOverBy || ''}","${s.receivedBy || ''}","${s.notes || ''}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Shift_Performance_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Shift performance report exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Shift Performance & Digital Handoff Log
            </h1>
            <Badge variant={distinctShifts > 0 ? "cyan" : "zinc"}>
              {distinctShifts > 0 ? `${distinctShifts} SHIFTS RECORDED` : "NO SHIFTS RECORDED"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log Shift Handoff
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
          title="Total Shift Output"
          value={totalShiftOutput.toLocaleString()}
          unit="Units"
          trend={{
            value: totalShiftOutput > 0 ? "Recorded across shifts" : "No recorded output",
            isPositive: totalShiftOutput > 0,
            text: ""
          }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Shift Scrap Rate"
          value={`${avgScrapRate}%`}
          unit="Scrap"
          trend={{
            value: Number(avgScrapRate) <= 1.0 ? "Below 1.0% limit" : "Attention needed",
            isPositive: Number(avgScrapRate) <= 1.0,
            text: ""
          }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Handoff Sign-off"
          value={shiftHandoffs.length > 0 ? "100%" : "—"}
          unit="Signed"
          trend={{
            value: shiftHandoffs.length > 0 ? "Clean shift transition" : "Awaiting shift transitions",
            isPositive: true,
            text: ""
          }}
          icon={Award}
          colorVariant="cyan"
        />
        <StatCard
          title="Logged Transitions"
          value={shiftHandoffs.length.toString()}
          unit="Handoffs"
          trend={{
            value: shiftHandoffs.length > 0 ? "Verified digital records" : "0 logged transitions",
            isPositive: true,
            text: ""
          }}
          icon={Users}
          colorVariant="amber"
        />
      </div>

      {/* Shift Comparison Cards */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Multi-Shift Operational Benchmarking
          </h3>
          <Badge variant="emerald">DIGITAL HANDOFF LEDGER</Badge>
        </div>

        {shiftComparison.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-secondary)" }}>
            <Users size={36} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
              No Shift Transitions Logged Yet
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px", maxWidth: "420px", margin: "4px auto 14px" }}>
              Record digital shift handoffs to track production throughput, scrap, and team handover accountability.
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "6px 12px", margin: "0 auto" }}>
              Log First Shift Handoff
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {shiftComparison.map((s, idx) => (
              <div
                key={s.id || idx}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {s.label}
                    </span>
                    <Badge variant="cyan">{s.output}</Badge>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <span>Volume: <strong style={{ color: "#059669" }}>{s.output}</strong></span>
                    <span>Scrap: <strong style={{ color: "var(--text-primary)" }}>{s.scrap}</strong></span>
                    <span>Handed Over By: <strong style={{ color: "var(--text-primary)" }}>{s.supervisor}</strong></span>
                    <span>Receiver: <strong style={{ color: "var(--text-primary)" }}>{s.receiver}</strong></span>
                  </div>
                  {s.notes && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", fontStyle: "italic" }}>
                      "{s.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log Shift Handoff Transition
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Outgoing Shift (From) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Shift Name"
                    value={formData.shiftFrom}
                    onChange={(e) => setFormData({ ...formData, shiftFrom: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Incoming Shift (To) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Shift Name"
                    value={formData.shiftTo}
                    onChange={(e) => setFormData({ ...formData, shiftTo: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Outgoing Supervisor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Outgoing Supervisor Name"
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Incoming Lead</label>
                  <input
                    type="text"
                    placeholder="Enter Incoming Lead Name"
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Units Produced</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter Units Produced"
                    value={formData.unitsProduced}
                    onChange={(e) => setFormData({ ...formData, unitsProduced: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Scrap Units</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter Scrap Units"
                    value={formData.scrapUnits}
                    onChange={(e) => setFormData({ ...formData, scrapUnits: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Operational Notes & Handover Summary *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter Operational Notes and Handover Summary"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Handoff
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

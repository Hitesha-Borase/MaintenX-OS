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
    shift: "Shift A -> Shift B",
    supervisor: "David Miller",
    unitsProduced: 48200,
    scrapUnits: 380,
    notes: ""
  });

  const shiftComparison = [
    { label: "Shift A (06:00 - 14:30)", output: "48,200 units", scrap: "380 units", oee: "88.4%", supervisor: "Thomas Sterling" },
    { label: "Shift B (14:30 - 23:00)", output: "46,800 units", scrap: "410 units", oee: "86.1%", supervisor: "Chloe Dupuis" },
    { label: "Shift C (23:00 - 06:00)", output: "44,500 units", scrap: "520 units", oee: "84.2%", supervisor: "Carlos Mendez" }
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.notes.trim()) {
      addToast("Please provide handoff notes", "warning");
      return;
    }
    if (addShiftHandoff) {
      addShiftHandoff({
        shiftFrom: formData.shift.split("->")[0]?.trim() || "Shift A",
        shiftTo: formData.shift.split("->")[1]?.trim() || "Shift B",
        handedOverBy: formData.supervisor,
        receivedBy: "Next Shift Lead",
        notes: formData.notes
      });
    }
    addToast("Shift handoff log recorded and digitally signed!", "success");
    setIsModalOpen(false);
    setFormData({ shift: "Shift A -> Shift B", supervisor: "David Miller", unitsProduced: 48200, scrapUnits: 380, notes: "" });
  };

  const handleExportCSV = () => {
    const headers = "Shift,Output,Scrap,OEE %,Supervisor\n";
    const rows = shiftComparison
      .map((s) => `"${s.label}","${s.output}","${s.scrap}","${s.oee}","${s.supervisor}"`)
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
            <Badge variant="cyan">3 SHIFTS ACTIVE</Badge>
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
          title="Shift A Output"
          value="48,200"
          unit="Units"
          trend={{ value: "100.4% target achieved", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Shift Scrap Rate"
          value="0.8%"
          unit="Scrap"
          trend={{ value: "Below 1.0% limit", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Handoff Sign-off"
          value="100%"
          unit="Signed"
          trend={{ value: "Clean shift transition", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="cyan"
        />
        <StatCard
          title="Logged Transitions"
          value={shiftHandoffs.length.toString()}
          unit="Handoffs"
          trend={{ value: "Verified digital records", isPositive: true, text: "" }}
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
          <Badge variant="emerald">24-HOUR RUNTIME</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {shiftComparison.map((s, idx) => (
            <div
              key={idx}
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
                  <Badge variant="cyan">OEE {s.oee}</Badge>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Volume: <strong style={{ color: "#059669" }}>{s.output}</strong></span>
                  <span>Scrap: <strong style={{ color: "var(--text-primary)" }}>{s.scrap}</strong></span>
                  <span>Supervisor: <strong style={{ color: "var(--text-primary)" }}>{s.supervisor}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
              <div>
                <label className="form-label">Shift Transition *</label>
                <select
                  className="form-select"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Shift A -> Shift B">Shift A (Day) ➔ Shift B (Evening)</option>
                  <option value="Shift B -> Shift C">Shift B (Evening) ➔ Shift C (Night)</option>
                  <option value="Shift C -> Shift A">Shift C (Night) ➔ Shift A (Day)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Outgoing Supervisor *</label>
                <input
                  type="text"
                  required
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Operational Notes & Handover Summary *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Line 1 runs smoothly at 580 BPM. Material replenishment staged at Bay 3."
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

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
  Download
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ShiftPerformancePage() {
  const { shiftHandoffs, addShiftHandoff } = useProduction();
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
    { label: "Shift A (06:00 - 14:30)", value: 48200 },
    { label: "Shift B (14:30 - 23:00)", value: 46800 },
    { label: "Shift C (23:00 - 06:00)", value: 44500 }
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (addShiftHandoff) {
      addShiftHandoff({
        ...formData,
        unitsProduced: Number(formData.unitsProduced),
        scrapUnits: Number(formData.scrapUnits),
        timestamp: new Date().toLocaleTimeString()
      });
    }
    addToast("Shift handoff log recorded and digitally signed!", "success");
    setIsModalOpen(false);
    setFormData({ shift: "Shift A -> Shift B", supervisor: "David Miller", unitsProduced: 48200, scrapUnits: 380, notes: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Shift Performance & Digital Handoff Log
            </h1>
            <Badge variant="cyan">Multi-Shift Benchmarking</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Cross-shift output comparison, scrap rates, operator handoff notes, and supervisor sign-offs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Log Shift Handoff
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
          unit="Completed"
          trend={{ value: "Clean transition recorded", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="blue"
        />
      </div>

      {/* Comparison Chart & Handoff Log */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Output Comparison */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Shift-by-Shift Total Output Comparison
            </h3>
            <Badge variant="cyan">Daily Total: 139.5k</Badge>
          </div>

          <BarChart
            data={shiftComparison}
            height={220}
            color="#38BDF8"
            unit=" units"
          />
        </Card>

        {/* Recent Handoff Notes */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Recent Shift Handoff Records
            </h3>
            <Badge variant="emerald">Live</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {shiftHandoffs && shiftHandoffs.length > 0 ? (
              shiftHandoffs.map((sh, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--bg-card-subtle)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>{sh.shift}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sh.timestamp || "Today"}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Supervisor: <strong style={{ color: "#38BDF8" }}>{sh.supervisor}</strong> • Output: <strong>{sh.unitsProduced?.toLocaleString()} units</strong> • Scrap: <strong style={{ color: "#EF4444" }}>{sh.scrapUnits} units</strong>
                  </div>
                  {sh.notes && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)", padding: "6px 10px", borderRadius: "4px" }}>
                      "{sh.notes}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                No handoff records logged yet for this shift.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* HANDOFF MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Submit Shift Handoff Log
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Shift Transition</label>
                  <select
                    className="form-select"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  >
                    <option value="Shift A -> Shift B">Shift A -&gt; Shift B</option>
                    <option value="Shift B -> Shift C">Shift B -&gt; Shift C</option>
                    <option value="Shift C -> Shift A">Shift C -&gt; Shift A</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Supervisor Sign-off</label>
                  <input
                    type="text"
                    required
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Total Units Produced</label>
                  <input
                    type="number"
                    required
                    value={formData.unitsProduced}
                    onChange={(e) => setFormData({ ...formData, unitsProduced: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Scrapped Units</label>
                  <input
                    type="number"
                    value={formData.scrapUnits}
                    onChange={(e) => setFormData({ ...formData, scrapUnits: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Handoff Instructions / Critical Equipment Notes</label>
                <textarea
                  rows={3}
                  placeholder="Note any raw material batch issues, upcoming mold changes, or maintenance follow-ups..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Sign & Save Handoff
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

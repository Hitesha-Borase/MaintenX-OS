import React, { useState } from "react";
import {
  Gauge,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Activity,
  Percent,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function LineTargetsPage() {
  const { addToast } = useApp();

  const [targets, setTargets] = useState([
    { id: "TGT-01", line: "Line 1 — Aseptic Bottling", targetOEE: "85.0%", targetAvailability: "92.0%", targetPerformance: "95.0%", targetQuality: "98.5%", shiftTargetUnits: "24,000 btl", status: "Active" },
    { id: "TGT-02", line: "Line 2 — Formulation & Pasteurizer", targetOEE: "82.0%", targetAvailability: "90.0%", targetPerformance: "94.0%", targetQuality: "98.0%", shiftTargetUnits: "32,000 L", status: "Active" },
    { id: "TGT-03", line: "Line 3 — Canning Line", targetOEE: "88.0%", targetAvailability: "94.0%", targetPerformance: "96.0%", targetQuality: "98.5%", shiftTargetUnits: "36,000 can", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [newTarget, setNewTarget] = useState({
    line: "Line 1 — Aseptic Bottling",
    targetOEE: "85.0%",
    targetAvailability: "92.0%",
    targetPerformance: "95.0%",
    targetQuality: "98.5%",
    shiftTargetUnits: "25,000 btl"
  });

  const filteredTargets = targets.filter((t) => {
    if (!searchQuery.trim()) return true;
    return t.line.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `TGT-0${targets.length + 1}`,
      line: newTarget.line,
      targetOEE: newTarget.targetOEE || "85.0%",
      targetAvailability: newTarget.targetAvailability || "90.0%",
      targetPerformance: newTarget.targetPerformance || "95.0%",
      targetQuality: newTarget.targetQuality || "98.0%",
      shiftTargetUnits: newTarget.shiftTargetUnits || "20,000 units",
      status: "Active"
    };

    setTargets([...targets, created]);
    addToast(`Target standard updated for ${created.line}!`, "success");
    setIsModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setTargets(targets.map((t) => (t.id === editingTarget.id ? editingTarget : t)));
    addToast(`Line target for ${editingTarget.line} updated!`, "success");
    setEditingTarget(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Line Targets & Operational Standards
            </h1>
            <Badge variant="cyan">{targets.length} BASELINES ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Set Line Target
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
          title="Enterprise Target OEE"
          value="85.0%"
          unit="Weighted"
          trend={{ value: "World class benchmark", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="Target Availability"
          value="92.0%"
          unit="Uptime"
          trend={{ value: "< 8% allowable downtime", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Target Quality"
          value="98.3%"
          unit="First-Pass"
          trend={{ value: "< 1.7% scrap / defect rate", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="amber"
        />
        <StatCard
          title="Nominal Shift Output"
          value="92,000"
          unit="Units/Shift"
          trend={{ value: "Combined all 3 lines", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search production line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Production Line</th>
                <th>Target OEE</th>
                <th>Target Avail</th>
                <th>Target Perf</th>
                <th>Target Quality</th>
                <th>Standard Shift Target</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTargets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{t.line}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669" }}>{t.targetOEE}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.targetAvailability}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.targetPerformance}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.targetQuality}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{t.shiftTargetUnits}</td>
                  <td>
                    <button
                      onClick={() => setEditingTarget({ ...t })}
                      title="Edit Target"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD TARGET MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Set Line Target Standards
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
                  value={newTarget.line}
                  onChange={(e) => setNewTarget({ ...newTarget, line: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Line 1 — Aseptic Bottling">Line 1 — Aseptic Bottling</option>
                  <option value="Line 2 — Formulation & Pasteurizer">Line 2 — Formulation & Pasteurizer</option>
                  <option value="Line 3 — Canning Line">Line 3 — Canning Line</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target OEE</label>
                  <input
                    type="text"
                    placeholder="e.g. 85.0%"
                    value={newTarget.targetOEE}
                    onChange={(e) => setNewTarget({ ...newTarget, targetOEE: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Availability</label>
                  <input
                    type="text"
                    placeholder="e.g. 92.0%"
                    value={newTarget.targetAvailability}
                    onChange={(e) => setNewTarget({ ...newTarget, targetAvailability: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Performance</label>
                  <input
                    type="text"
                    placeholder="e.g. 95.0%"
                    value={newTarget.targetPerformance}
                    onChange={(e) => setNewTarget({ ...newTarget, targetPerformance: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Quality</label>
                  <input
                    type="text"
                    placeholder="e.g. 98.5%"
                    value={newTarget.targetQuality}
                    onChange={(e) => setNewTarget({ ...newTarget, targetQuality: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Standard Shift Target Output</label>
                <input
                  type="text"
                  placeholder="e.g. 24,000 btl"
                  value={newTarget.shiftTargetUnits}
                  onChange={(e) => setNewTarget({ ...newTarget, shiftTargetUnits: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Line Target
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TARGET MODAL */}
      {editingTarget && (
        <div className="modal-backdrop" onClick={() => setEditingTarget(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Target — {editingTarget.line}
                </h2>
              </div>
              <button onClick={() => setEditingTarget(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target OEE</label>
                  <input
                    type="text"
                    value={editingTarget.targetOEE}
                    onChange={(e) => setEditingTarget({ ...editingTarget, targetOEE: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Availability</label>
                  <input
                    type="text"
                    value={editingTarget.targetAvailability}
                    onChange={(e) => setEditingTarget({ ...editingTarget, targetAvailability: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Performance</label>
                  <input
                    type="text"
                    value={editingTarget.targetPerformance}
                    onChange={(e) => setEditingTarget({ ...editingTarget, targetPerformance: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Quality</label>
                  <input
                    type="text"
                    value={editingTarget.targetQuality}
                    onChange={(e) => setEditingTarget({ ...editingTarget, targetQuality: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Standard Shift Target Output</label>
                <input
                  type="text"
                  value={editingTarget.shiftTargetUnits}
                  onChange={(e) => setEditingTarget({ ...editingTarget, shiftTargetUnits: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingTarget(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

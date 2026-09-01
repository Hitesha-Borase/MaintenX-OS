import React, { useState } from "react";
import {
  GitCommit,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  ArrowRight,
  Layers,
  Workflow,
  Cpu,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function RoutingsPage() {
  const { addToast } = useApp();

  const [routings, setRoutings] = useState([
    { id: "RTG-01", name: "Aseptic PET Bottling Sequence", stepsCount: 5, sequence: "Batch Mixing -> Flash Pasteurization -> Aseptic Filling -> Capping -> Labeling -> Packing", line: "Line 1 (Aseptic)", status: "Active" },
    { id: "RTG-02", name: "Aluminum Canning Sequence", stepsCount: 4, sequence: "De-aeration -> Carbonation -> Cold Can Filling -> Double Seaming -> Tray Shrinkwrap", line: "Line 3 (Canning)", status: "Active" },
    { id: "RTG-03", name: "Liquid Processing & Bulk Pasteurized", stepsCount: 3, sequence: "Ingredient Blending -> HTST Pasteurization -> Sterile Buffer Storage", line: "Line 2 (Formulation)", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRouting, setNewRouting] = useState({
    name: "",
    line: "Line 1 (Aseptic)",
    sequence: "Mixing -> Filling -> Capping -> Packing",
    stepsCount: 4
  });

  const filteredRoutings = routings.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.line.toLowerCase().includes(q) ||
      r.sequence.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRouting.name.trim()) {
      addToast("Please provide routing sequence description.", "warning");
      return;
    }

    const created = {
      id: `RTG-0${routings.length + 1}`,
      name: newRouting.name,
      line: newRouting.line,
      sequence: newRouting.sequence,
      stepsCount: Number(newRouting.stepsCount) || 4,
      status: "Active"
    };

    setRoutings([...routings, created]);
    addToast(`Routing sequence "${created.id}" created!`, "success");
    setIsModalOpen(false);
    setNewRouting({ name: "", line: "Line 1 (Aseptic)", sequence: "Mixing -> Filling -> Capping -> Packing", stepsCount: 4 });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Standard Manufacturing Routings
            </h1>
            <Badge variant="cyan">{routings.length} ROUTING SEQUENCES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Routing Sequence
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
          title="Active Routings"
          value={routings.length.toString()}
          unit="Sequences"
          trend={{ value: "Step-by-step process paths", isPositive: true, text: "" }}
          icon={Workflow}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Cycle Steps"
          value="4.0"
          unit="Stages"
          trend={{ value: "Standardized cell transitions", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Critical Bottleneck"
          value="Filling"
          unit="Station"
          trend={{ value: "Pacing constraint node", isPositive: false, text: "" }}
          icon={Cpu}
          colorVariant="amber"
        />
        <StatCard
          title="Line Balance Rate"
          value="94.8%"
          unit="Optimized"
          trend={{ value: "Zero inter-stage buffer starve", isPositive: true, text: "" }}
          icon={CheckCircle2}
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
              placeholder="Search routing ID, description, line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "720px" }}>
            <thead>
              <tr>
                <th>Routing ID</th>
                <th>Routing Description</th>
                <th>Primary Line</th>
                <th>Operational Sequence</th>
                <th>Steps</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutings.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{r.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{r.line}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#8C5B23", maxWidth: "340px", fontWeight: 600 }}>
                    {r.sequence}
                  </td>
                  <td>
                    <Badge variant="emerald">{r.stepsCount} Steps</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened sequence graph for ${r.id}`, "info")}
                      title="Edit Routing"
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

      {/* ADD ROUTING MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Manufacturing Routing
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Routing Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Glass Bottling Hot-Fill Sequence"
                  value={newRouting.name}
                  onChange={(e) => setNewRouting({ ...newRouting, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Primary Line Facility</label>
                  <select
                    className="form-select"
                    value={newRouting.line}
                    onChange={(e) => setNewRouting({ ...newRouting, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Line 1 (Aseptic)">Line 1 (Aseptic)</option>
                    <option value="Line 2 (Formulation)">Line 2 (Formulation)</option>
                    <option value="Line 3 (Canning)">Line 3 (Canning)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Number of Sequential Steps</label>
                  <input
                    type="number"
                    min="1"
                    value={newRouting.stepsCount}
                    onChange={(e) => setNewRouting({ ...newRouting, stepsCount: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Process Flow Sequence</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mixing -> De-aeration -> Pasteurization -> Filling -> Packing"
                  value={newRouting.sequence}
                  onChange={(e) => setNewRouting({ ...newRouting, sequence: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Routing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

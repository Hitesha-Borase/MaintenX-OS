import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Gauge,
  Activity,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function LinesPage() {
  const { addToast } = useApp();

  const [lines, setLines] = useState([
    { id: "LINE-01", name: "Line 1 — High Speed Bottling", plant: "Plant 1 (Austin)", ratedSpeed: "4,500 BPH", type: "Aseptic PET", status: "Active" },
    { id: "LINE-02", name: "Line 2 — Canning & Seaming", plant: "Plant 1 (Austin)", ratedSpeed: "6,600 CPH", type: "Sleek Can", status: "Active" },
    { id: "LINE-03", name: "Line 3 — Keg & Bulk Filling", plant: "Plant 1 (Austin)", ratedSpeed: "120 Kegs/hr", type: "Stainless Keg", status: "Active" },
    { id: "LINE-04", name: "Line 4 — Cold Brew Extraction", plant: "Plant 2 (Dallas)", ratedSpeed: "3,000 L/hr", type: "Direct Extract", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);

  const [newLine, setNewLine] = useState({
    name: "",
    plant: "Plant 1 (Austin)",
    ratedSpeed: "4,000 BPH",
    type: "Aseptic PET"
  });

  const filteredLines = lines.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      l.plant.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLine.name.trim()) {
      addToast("Please provide line name.", "warning");
      return;
    }

    const created = {
      id: `LINE-0${lines.length + 1}`,
      name: newLine.name,
      plant: newLine.plant,
      ratedSpeed: newLine.ratedSpeed,
      type: newLine.type,
      status: "Active"
    };

    setLines([...lines, created]);
    addToast(`Line "${created.name}" registered successfully!`, "success");
    setIsModalOpen(false);
    setNewLine({ name: "", plant: "Plant 1 (Austin)", ratedSpeed: "4,000 BPH", type: "Aseptic PET" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingLine.name.trim()) {
      addToast("Please provide line name.", "warning");
      return;
    }

    setLines((prev) =>
      prev.map((l) => (l.id === editingLine.id ? editingLine : l))
    );
    addToast(`Line "${editingLine.name}" updated successfully!`, "success");
    setEditingLine(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Manufacturing Lines Master
            </h1>
            <Badge variant="cyan">{lines.length} LINES CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Production Line
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
          title="Total Lines"
          value={lines.length.toString()}
          unit="Active Lines"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Peak Rated Speed"
          value="6,600 CPH"
          unit="Line 2 Can"
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Telemetry State"
          value="100%"
          unit="Connected"
          icon={Activity}
          colorVariant="amber"
        />
        <StatCard
          title="Line OEE Target"
          value="85.0%"
          unit="Benchmark"
          icon={Zap}
          colorVariant="emerald"
        />
      </div>

      {/* Lines Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search line name, format, facility..."
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
                <th>Line Code</th>
                <th>Line Name</th>
                <th>Facility / Plant</th>
                <th>Line Type</th>
                <th>Rated Nameplate Speed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{l.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{l.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{l.plant}</span>
                  </td>
                  <td>
                    <Badge variant="cyan">{l.type}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {l.ratedSpeed}
                  </td>
                  <td>
                    <Badge variant="emerald">{l.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingLine({ ...l })}
                      title="Edit Line"
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

      {/* ADD LINE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New Production Line
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Line Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Line 5 — Glass Bottling & Packaging"
                  value={newLine.name}
                  onChange={(e) => setNewLine({ ...newLine, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Packaging Technology</label>
                  <select
                    className="form-select"
                    value={newLine.type}
                    onChange={(e) => setNewLine({ ...newLine, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Aseptic PET">Aseptic PET</option>
                    <option value="Sleek Can">Sleek Can</option>
                    <option value="Glass Bottle">Glass Bottle</option>
                    <option value="Stainless Keg">Stainless Keg</option>
                    <option value="Direct Extract">Direct Extract</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Nameplate Rated Speed</label>
                  <input
                    type="text"
                    placeholder="e.g. 5,000 BPH"
                    value={newLine.ratedSpeed}
                    onChange={(e) => setNewLine({ ...newLine, ratedSpeed: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Facility / Plant</label>
                <select
                  className="form-select"
                  value={newLine.plant}
                  onChange={(e) => setNewLine({ ...newLine, plant: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                  <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Line
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LINE MODAL */}
      {editingLine && (
        <div className="modal-backdrop" onClick={() => setEditingLine(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit Line — {editingLine.id}
              </h2>
              <button onClick={() => setEditingLine(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Line Name *</label>
                <input
                  type="text"
                  required
                  value={editingLine.name}
                  onChange={(e) => setEditingLine({ ...editingLine, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Packaging Technology</label>
                  <select
                    className="form-select"
                    value={editingLine.type}
                    onChange={(e) => setEditingLine({ ...editingLine, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Aseptic PET">Aseptic PET</option>
                    <option value="Sleek Can">Sleek Can</option>
                    <option value="Glass Bottle">Glass Bottle</option>
                    <option value="Stainless Keg">Stainless Keg</option>
                    <option value="Direct Extract">Direct Extract</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Nameplate Rated Speed</label>
                  <input
                    type="text"
                    value={editingLine.ratedSpeed}
                    onChange={(e) => setEditingLine({ ...editingLine, ratedSpeed: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Facility / Plant</label>
                  <select
                    className="form-select"
                    value={editingLine.plant}
                    onChange={(e) => setEditingLine({ ...editingLine, plant: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                    <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingLine.status}
                    onChange={(e) => setEditingLine({ ...editingLine, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingLine(null)}>
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

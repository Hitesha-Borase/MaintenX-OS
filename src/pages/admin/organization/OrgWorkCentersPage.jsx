import React, { useState } from "react";
import {
  Layers,
  Building2,
  CheckCircle2,
  Cpu,
  Plus,
  Search,
  X,
  Edit2,
  Gauge,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function OrgWorkCentersPage() {
  const { addToast } = useApp();

  const [workCenters, setWorkCenters] = useState([
    { id: "WC-101", code: "FILL-01", name: "Rotary Isobaric Filler", line: "Line 1 (Aseptic)", capacity: "70 bpm", status: "Active" },
    { id: "WC-102", code: "CAPP-01", name: "Induction Cap Sealer", line: "Line 1 (Aseptic)", capacity: "70 bpm", status: "Active" },
    { id: "WC-103", code: "LABL-01", name: "Sleeve Rotary Labeler", line: "Line 1 (Aseptic)", capacity: "75 bpm", status: "Active" },
    { id: "WC-201", code: "PAST-02", name: "HTST Flash Pasteurizer", line: "Line 2 (Formulation)", capacity: "5,000 L/hr", status: "Active" },
    { id: "WC-301", code: "SEAM-03", name: "Can Seamer Station", line: "Line 3 (Canning)", capacity: "100 cpm", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWC, setEditingWC] = useState(null);

  const [newWC, setNewWC] = useState({
    code: "",
    name: "",
    line: "Line 1 (Aseptic)",
    capacity: "60 bpm"
  });

  const filteredWCs = workCenters.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.code.toLowerCase().includes(q) ||
      w.line.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newWC.code.trim() || !newWC.name.trim()) {
      addToast("Please provide work center code and name.", "warning");
      return;
    }

    const created = {
      id: `WC-${Math.floor(400 + Math.random() * 99)}`,
      code: newWC.code.toUpperCase(),
      name: newWC.name,
      line: newWC.line,
      capacity: newWC.capacity || "50 bpm",
      status: "Active"
    };

    setWorkCenters([...workCenters, created]);
    addToast(`Work Center "${created.name}" created!`, "success");
    setIsModalOpen(false);
    setNewWC({ code: "", name: "", line: "Line 1 (Aseptic)", capacity: "60 bpm" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingWC.name.trim() || !editingWC.code.trim()) {
      addToast("Please provide work center code and name.", "warning");
      return;
    }

    setWorkCenters((prev) =>
      prev.map((w) => (w.id === editingWC.id ? editingWC : w))
    );
    addToast(`Work Center "${editingWC.name}" updated successfully!`, "success");
    setEditingWC(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Organization Work Centers & Machine Cells
            </h1>
            <Badge variant="cyan">{workCenters.length} CELLS CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Work Center
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
          title="Active Cells"
          value={workCenters.length.toString()}
          unit="Stations"
          icon={Cpu}
          colorVariant="emerald"
        />
        <StatCard
          title="Bottleneck Cell"
          value="FILL-01"
          unit="Critical Pitch"
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Line Bindings"
          value="3 Lines"
          unit="Hierarchical"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Sensor Telemetry"
          value="100%"
          unit="OPC-UA"
          icon={Zap}
          colorVariant="emerald"
        />
      </div>

      {/* Work Centers Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search work center, code, line..."
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
                <th>WC Code</th>
                <th>Workstation Description</th>
                <th>Parent Line</th>
                <th>Design Capacity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWCs.map((w) => (
                <tr key={w.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{w.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{w.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{w.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {w.capacity}
                  </td>
                  <td>
                    <Badge variant="emerald">{w.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingWC({ ...w })}
                      title="Edit Work Center"
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

      {/* ADD WORK CENTER MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New Work Center
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">WC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PACK-04"
                    value={newWC.code}
                    onChange={(e) => setNewWC({ ...newWC, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Rated Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 70 bpm"
                    value={newWC.capacity}
                    onChange={(e) => setNewWC({ ...newWC, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Workstation Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Case Packer & Palletizer Cell"
                  value={newWC.name}
                  onChange={(e) => setNewWC({ ...newWC, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Parent Line</label>
                <select
                  className="form-select"
                  value={newWC.line}
                  onChange={(e) => setNewWC({ ...newWC, line: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Line 1 (Aseptic)">Line 1 (Aseptic)</option>
                  <option value="Line 2 (Formulation)">Line 2 (Formulation)</option>
                  <option value="Line 3 (Canning)">Line 3 (Canning)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Work Center
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORK CENTER MODAL */}
      {editingWC && (
        <div className="modal-backdrop" onClick={() => setEditingWC(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit Work Center — {editingWC.code}
              </h2>
              <button onClick={() => setEditingWC(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">WC Code *</label>
                  <input
                    type="text"
                    required
                    value={editingWC.code}
                    onChange={(e) => setEditingWC({ ...editingWC, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Rated Capacity</label>
                  <input
                    type="text"
                    value={editingWC.capacity}
                    onChange={(e) => setEditingWC({ ...editingWC, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Workstation Description *</label>
                <input
                  type="text"
                  required
                  value={editingWC.name}
                  onChange={(e) => setEditingWC({ ...editingWC, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Parent Line</label>
                  <select
                    className="form-select"
                    value={editingWC.line}
                    onChange={(e) => setEditingWC({ ...editingWC, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Line 1 (Aseptic)">Line 1 (Aseptic)</option>
                    <option value="Line 2 (Formulation)">Line 2 (Formulation)</option>
                    <option value="Line 3 (Canning)">Line 3 (Canning)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingWC.status}
                    onChange={(e) => setEditingWC({ ...editingWC, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingWC(null)}>
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

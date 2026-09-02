import React, { useState, useMemo } from "react";
import {
  Layers,
  Building2,
  CheckCircle2,
  Cpu,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Gauge,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function OrgWorkCentersPage() {
  const { lines = [], assets = [], plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [workCenters, setWorkCenters] = useState([
    { id: "WC-101", code: "FILL-01", name: "Rotary Isobaric Filler", lineId: "LIN-01", lineName: "Line 1 — Aseptic Bottling", capacity: "38,000 BPH", status: "Active" },
    { id: "WC-102", code: "CAPP-01", name: "Induction Cap Sealer", lineId: "LIN-01", lineName: "Line 1 — Aseptic Bottling", capacity: "38,000 BPH", status: "Active" },
    { id: "WC-103", code: "LABL-01", name: "Sleeve Rotary Labeler", lineId: "LIN-01", lineName: "Line 1 — Aseptic Bottling", capacity: "40,000 BPH", status: "Active" },
    { id: "WC-201", code: "PAST-02", name: "HTST Flash Pasteurizer", lineId: "LIN-02", lineName: "Line 2 — Formulation & Pasteurizer", capacity: "30,000 L/hr", status: "Active" },
    { id: "WC-301", code: "SEAM-03", name: "Can Seamer Station", lineId: "LIN-03", lineName: "Line 3 — Canning Line", capacity: "45,000 CPH", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWC, setEditingWC] = useState(null);

  const [newWC, setNewWC] = useState({
    code: "",
    name: "",
    lineId: lines[0]?.lineId || "LIN-01",
    capacity: "35,000 BPH"
  });

  const filteredWCs = useMemo(() => {
    return workCenters.filter((w) => {
      const matchesLine = lineFilter === "ALL" || w.lineId === lineFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        w.lineName.toLowerCase().includes(q);

      return matchesLine && matchesSearch;
    });
  }, [workCenters, lineFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newWC.code.trim() || !newWC.name.trim()) {
      addToast("Please provide work center code and name.", "warning");
      return;
    }

    const selLine = lines.find((l) => l.lineId === newWC.lineId);
    const created = {
      id: `WC-${Math.floor(400 + Math.random() * 99)}`,
      code: newWC.code.toUpperCase(),
      name: newWC.name,
      lineId: newWC.lineId,
      lineName: selLine ? selLine.name : "Production Line",
      capacity: newWC.capacity || "35,000 BPH",
      status: "Active"
    };

    setWorkCenters([...workCenters, created]);
    addToast(`Work Center "${created.name}" created!`, "success");
    setIsModalOpen(false);
    setNewWC({ code: "", name: "", lineId: lines[0]?.lineId || "LIN-01", capacity: "35,000 BPH" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingWC.name.trim()) {
      addToast("Please provide work center name.", "warning");
      return;
    }

    const selLine = lines.find((l) => l.lineId === editingWC.lineId);
    setWorkCenters((prev) =>
      prev.map((w) =>
        w.id === editingWC.id
          ? { ...editingWC, lineName: selLine ? selLine.name : editingWC.lineName }
          : w
      )
    );
    addToast(`Work Center "${editingWC.name}" updated!`, "success");
    setEditingWC(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete Work Center "${name}"?`)) {
      setWorkCenters(workCenters.filter((w) => w.id !== id));
      addToast(`Work Center "${name}" deleted.`, "info");
    }
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

      {/* KPI Tickers */}
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
          title="Active Work Centers"
          value={workCenters.length.toString()}
          unit="Cells"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Connected Assets"
          value={assets.length.toString()}
          unit="Machines"
          icon={Cpu}
          colorVariant="cyan"
        />
        <StatCard
          title="Cell Reliability"
          value="99.4%"
          unit="Audited"
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Line Balancing"
          value="Balanced"
          unit="Optimized"
          icon={Zap}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search work center name, code or line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Parent Lines</option>
              {lines.map((l) => (
                <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>WC Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Work Center Cell Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Parent Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Rated Speed</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWCs.map((w) => (
                <tr key={w.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                    {w.code}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                    {w.name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Layers size={12} color="#C89547" />
                      <span>{w.lineName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706" }}>
                    {w.capacity}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="emerald">{w.status}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setEditingWC({ ...w })}
                        title="Edit Work Center"
                        style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id, w.name)}
                        title="Delete Work Center"
                        style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD WC MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Machine Cell / Work Center
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">WC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PACK-01"
                    value={newWC.code}
                    onChange={(e) => setNewWC({ ...newWC, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Cell Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Automated Case Packer"
                    value={newWC.name}
                    onChange={(e) => setNewWC({ ...newWC, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Parent Line</label>
                  <select
                    value={newWC.lineId}
                    onChange={(e) => setNewWC({ ...newWC, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Rated Speed</label>
                  <input
                    type="text"
                    value={newWC.capacity}
                    onChange={(e) => setNewWC({ ...newWC, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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

      {/* EDIT WC MODAL */}
      {editingWC && (
        <div className="modal-backdrop" onClick={() => setEditingWC(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Work Center — {editingWC.code}
                </h2>
              </div>
              <button onClick={() => setEditingWC(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Work Center Name *</label>
                <input
                  type="text"
                  required
                  value={editingWC.name}
                  onChange={(e) => setEditingWC({ ...editingWC, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Parent Line</label>
                  <select
                    value={editingWC.lineId}
                    onChange={(e) => setEditingWC({ ...editingWC, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Rated Speed</label>
                  <input
                    type="text"
                    value={editingWC.capacity}
                    onChange={(e) => setEditingWC({ ...editingWC, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingWC(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Work Center
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

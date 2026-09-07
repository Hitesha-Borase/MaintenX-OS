import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Gauge,
  Activity,
  Zap,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function LinesPage() {
  const { lines = [], plants = [], assets = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);

  const [localLines, setLocalLines] = useState([
    { lineId: "LIN-01", lineCode: "L1-BOTTLING", name: "Bottling Line 1 (Indore Aseptic)", plantId: "PLT-01", ratedSpeed: "38,000 BPH", type: "Rotary Aseptic PET", status: "Active" },
    { lineId: "LIN-02", lineCode: "L2-PASTEURIZER", name: "Processing Cell 2 (Pasteurizer & Blend)", plantId: "PLT-01", ratedSpeed: "30,000 LPH", type: "HTST Continuous Flow", status: "Active" },
    { lineId: "LIN-03", lineCode: "L3-CANNING", name: "Canning Line 3 (High Speed 330ml)", plantId: "PLT-01", ratedSpeed: "45,000 CPH", type: "High-Speed Sleek Can", status: "Active" }
  ]);

  const allLines = useMemo(() => {
    return lines.length > 0 ? lines : localLines;
  }, [lines, localLines]);

  const filteredLines = useMemo(() => {
    return allLines.filter((l) => {
      const matchesPlant = plantFilter === "ALL" || l.plantId === plantFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.name || "").toLowerCase().includes(q) ||
        (l.lineCode || l.lineId || "").toLowerCase().includes(q) ||
        (l.type || "").toLowerCase().includes(q);

      return matchesPlant && matchesSearch;
    });
  }, [allLines, plantFilter, searchQuery]);

  const [newLine, setNewLine] = useState({
    lineCode: "",
    name: "",
    plantId: "PLT-01",
    ratedSpeed: "40,000 BPH",
    type: "Rotary Aseptic PET"
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLine.name.trim() || !newLine.lineCode.trim()) {
      addToast("Please provide line name and code.", "warning");
      return;
    }

    const created = {
      lineId: `LIN-0${allLines.length + 1}`,
      lineCode: newLine.lineCode.toUpperCase(),
      name: newLine.name,
      plantId: newLine.plantId,
      ratedSpeed: newLine.ratedSpeed,
      type: newLine.type,
      status: "Active"
    };

    setLocalLines([...allLines, created]);
    addToast(`Line "${created.name}" registered!`, "success");
    setIsModalOpen(false);
    setNewLine({ lineCode: "", name: "", plantId: "PLT-01", ratedSpeed: "40,000 BPH", type: "Rotary Aseptic PET" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingLine.name.trim()) {
      addToast("Please provide line name.", "warning");
      return;
    }

    setLocalLines((prev) =>
      prev.map((l) => (l.lineId === editingLine.lineId ? editingLine : l))
    );
    addToast(`Line "${editingLine.name}" updated!`, "success");
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
            <Badge variant="cyan">{allLines.length} LINES CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Line Cell
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
          title="Active Production Lines"
          value={allLines.length.toString()}
          unit="Lines"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Mapped Assets"
          value={assets.length.toString()}
          unit="Machines"
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Average Rated Speed"
          value="38,000 BPH"
          unit="Paced"
          icon={Activity}
          colorVariant="amber"
        />
        <StatCard
          title="OEE Benchmark Target"
          value="88.0%"
          unit="Standard"
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
              placeholder="Search line name, code or packaging format..."
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
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Line Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Line Cell Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Packaging Format</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Nameplate Speed</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((l) => {
                const plantName = plants.find((p) => p.id === l.plantId)?.name?.split(" - ")[0] || "Indore Plant 1";
                return (
                  <tr key={l.lineId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {l.lineCode || l.lineId}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                      {l.name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Building2 size={12} color="#C89547" />
                        <span>{plantName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{l.type || "Continuous Flow"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706" }}>
                      {l.ratedSpeed || "38,000 BPH"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{l.status || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => setEditingLine({ ...l })}
                        title="Edit Line"
                        style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD LINE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Line Cell
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Line Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LIN-04"
                    value={newLine.lineCode}
                    onChange={(e) => setNewLine({ ...newLine, lineCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Line Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Glass Bottling Line 4"
                    value={newLine.name}
                    onChange={(e) => setNewLine({ ...newLine, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility</label>
                  <select
                    value={newLine.plantId}
                    onChange={(e) => setNewLine({ ...newLine, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Rated Speed</label>
                  <input
                    type="text"
                    placeholder="e.g. 40,000 BPH"
                    value={newLine.ratedSpeed}
                    onChange={(e) => setNewLine({ ...newLine, ratedSpeed: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Packaging Format / Cell Type</label>
                <input
                  type="text"
                  placeholder="e.g. Rotary Aseptic PET or Sleek Can"
                  value={newLine.type}
                  onChange={(e) => setNewLine({ ...newLine, type: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Line — {editingLine.lineCode || editingLine.lineId}
                </h2>
              </div>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Rated Speed</label>
                  <input
                    type="text"
                    value={editingLine.ratedSpeed}
                    onChange={(e) => setEditingLine({ ...editingLine, ratedSpeed: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Format Type</label>
                  <input
                    type="text"
                    value={editingLine.type}
                    onChange={(e) => setEditingLine({ ...editingLine, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingLine(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Line
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

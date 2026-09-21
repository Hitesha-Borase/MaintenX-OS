import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  Gauge,
  Activity,
  Zap,
  Building2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function LinesPage() {
  const { lines = [], setLines, addLine, updateLine, deleteLine, plants = [], setPlants, assets = [] } = useMasterData();
  const { addToast } = useApp();

  const fetchLines = async () => {
    try {
      const res = await masterDataService.getLines();
      const data = res?.data !== undefined ? res.data : res;
      if (Array.isArray(data) && typeof setLines === "function") {
        setLines(data);
      }
    } catch (err) {
      console.warn("Live lines fetch:", err.message);
    }
  };

  const fetchPlants = async () => {
    try {
      const res = await masterDataService.getPlants();
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0 && typeof setPlants === "function") {
        setPlants(data);
      }
    } catch (err) {
      console.warn("Live plants fetch:", err.message);
    }
  };

  // Trigger live GET on mount and clear old cached demo data
  useEffect(() => {
    try {
      localStorage.removeItem("mx_master_lines");
    } catch (_) {}
    fetchLines();
    fetchPlants();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [viewingLine, setViewingLine] = useState(null);

  // Dynamic KPI stats calculated directly from actual database rows
  const activeLinesCount = useMemo(() => {
    return lines.filter(
      (l) => (l.status || "").toUpperCase() === "RUNNING" || (l.status || "").toUpperCase() === "ACTIVE"
    ).length;
  }, [lines]);

  const mappedAssetsCount = useMemo(() => {
    const lineIds = new Set(lines.map((l) => String(l.id || l.lineId || l.code || l.lineCode)));
    return assets.filter((a) => a.lineId && lineIds.has(String(a.lineId))).length;
  }, [lines, assets]);

  const avgSpeedDisplay = useMemo(() => {
    if (!lines.length) return "0 BPH";
    const speeds = lines
      .map((l) => {
        if (l.ratedSpeedBPH && !isNaN(Number(l.ratedSpeedBPH)) && Number(l.ratedSpeedBPH) > 0) {
          return Number(l.ratedSpeedBPH);
        }
        if (l.nominalSpeedBpm && !isNaN(Number(l.nominalSpeedBpm)) && Number(l.nominalSpeedBpm) > 0) {
          return Number(l.nominalSpeedBpm) * 60;
        }
        if (l.nominal_speed_bpm && !isNaN(Number(l.nominal_speed_bpm)) && Number(l.nominal_speed_bpm) > 0) {
          return Number(l.nominal_speed_bpm) * 60;
        }
        if (typeof l.ratedSpeed === "string") {
          const num = parseInt(l.ratedSpeed.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(num) && num > 0) return num;
        }
        return null;
      })
      .filter((s) => s !== null);

    if (!speeds.length) return "0 BPH";
    const avg = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
    return `${avg.toLocaleString()} BPH`;
  }, [lines]);

  const avgOeeDisplay = useMemo(() => {
    if (!lines.length) return "0.0%";
    const oees = lines
      .map((l) => {
        const val = l.ratedOEE || l.targetOee || l.rated_oee;
        if (val) {
          const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
          if (!isNaN(num) && num > 0) return num;
        }
        return null;
      })
      .filter((v) => v !== null);

    if (!oees.length) return "0.0%";
    const avg = (oees.reduce((a, b) => a + b, 0) / oees.length).toFixed(1);
    return `${avg}%`;
  }, [lines]);

  const resolvePlantName = (line) => {
    if (!line) return "—";
    const matched = plants.find(
      (p) =>
        (p.id && p.id === line.plantId) ||
        (p.plantId && p.plantId === line.plantId) ||
        (p.code && p.code === line.plantId)
    );
    if (matched?.name) return matched.name.split(" - ")[0];
    if (line.plantName && line.plantName !== "Main Facility") return line.plantName;
    if (plants.length > 0 && plants[0]?.name) return plants[0].name.split(" - ")[0];
    return "Plant 1 - Meat Processing Facility";
  };

  const filteredLines = useMemo(() => {
    return lines.filter((l) => {
      const plantName = resolvePlantName(l);
      const matchesPlant =
        plantFilter === "ALL" ||
        l.plantId === plantFilter ||
        plantName.toLowerCase().includes(plantFilter.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.name || "").toLowerCase().includes(q) ||
        (l.lineCode || l.code || l.lineId || "").toLowerCase().includes(q) ||
        (l.type || l.lineType || "").toLowerCase().includes(q) ||
        plantName.toLowerCase().includes(q);

      return matchesPlant && matchesSearch;
    });
  }, [lines, plantFilter, searchQuery, plants]);

  const [newLine, setNewLine] = useState({
    lineCode: "",
    name: "",
    plantId: plants[0]?.id || "",
    ratedSpeed: "",
    type: "Bottling"
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newLine.name.trim() || !newLine.lineCode.trim()) {
      addToast("Please provide line name and code.", "warning");
      return;
    }

    try {
      const created = await addLine(newLine);
      addToast(`Line "${created?.name || newLine.name}" registered in database!`, "success");
      setIsModalOpen(false);
      setNewLine({ lineCode: "", name: "", plantId: plants[0]?.id || "", ratedSpeed: "", type: "Bottling" });
      await fetchLines();
    } catch (err) {
      addToast(`Failed to register line: ${err.message}`, "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingLine.name.trim()) {
      addToast("Please provide line name.", "warning");
      return;
    }

    try {
      const idToUpdate = editingLine.id || editingLine.lineId || editingLine.code || editingLine.lineCode;
      const payload = {
        ...editingLine,
        type: editingLine.type || editingLine.lineType,
        lineType: editingLine.type || editingLine.lineType
      };
      await updateLine(idToUpdate, payload);
      addToast(`Line "${editingLine.name}" updated in database!`, "success");
      setEditingLine(null);
      await fetchLines();
    } catch (err) {
      addToast(`Failed to update line: ${err.message}`, "error");
    }
  };

  const handleDelete = async (lineId, name) => {
    if (window.confirm(`Are you sure you want to delete Line "${name}" from database?`)) {
      try {
        await deleteLine(lineId);
        addToast(`Line "${name}" deleted from database.`, "info");
        if (viewingLine && (viewingLine.lineId === lineId || viewingLine.id === lineId || viewingLine.lineCode === lineId || viewingLine.code === lineId)) {
          setViewingLine(null);
        }
        if (editingLine && (editingLine.lineId === lineId || editingLine.id === lineId || editingLine.lineCode === lineId || editingLine.code === lineId)) {
          setEditingLine(null);
        }
        await fetchLines();
      } catch (err) {
        addToast(`Failed to delete line: ${err.message}`, "error");
      }
    }
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
          value={activeLinesCount.toString()}
          unit="Lines"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Mapped Assets"
          value={mappedAssetsCount.toString()}
          unit="Machines"
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Average Rated Speed"
          value={avgSpeedDisplay}
          unit="Paced"
          icon={Activity}
          colorVariant="amber"
        />
        <StatCard
          title="OEE Benchmark Target"
          value={avgOeeDisplay}
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
                <option key={p.id || p.plantId} value={p.id || p.plantId}>
                  {p.name ? p.name.split(" - ")[0] : p.code || "Plant"}
                </option>
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
              {filteredLines.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--bg-card-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                        <Layers size={24} />
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                        No Manufacturing Lines Configured
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "380px" }}>
                        All dummy data has been removed. Click "+ Add Line Cell" above to register your real production lines.
                      </div>
                      <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px", marginTop: "6px" }}>
                        + Add Line Cell
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLines.map((l) => {
                  const plantName = resolvePlantName(l);
                  const speedDisplay =
                    l.ratedSpeed && l.ratedSpeed !== "—"
                      ? l.ratedSpeed
                      : l.ratedSpeedBPH
                      ? `${Number(l.ratedSpeedBPH).toLocaleString()} BPH`
                      : l.nominalSpeedBpm
                      ? `${(Number(l.nominalSpeedBpm) * 60).toLocaleString()} BPH`
                      : "—";

                  const isRunning = (l.status || "").toUpperCase() === "RUNNING" || (l.status || "").toUpperCase() === "ACTIVE";

                  return (
                    <tr key={l.lineId || l.id || l.lineCode || l.code} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {l.lineCode || l.code || l.lineId}
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
                        <Badge variant="cyan">{l.type || l.lineType || "Standard"}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706" }}>
                        {speedDisplay}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant={isRunning ? "emerald" : "amber"}>{l.status || "Active"}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setViewingLine({ ...l })}
                            title="View Line Details"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingLine({ ...l })}
                            title="Edit Line"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(l.lineId || l.id || l.lineCode || l.code, l.name)}
                            title="Delete Line"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
                    placeholder="e.g. LIN-06"
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
                    placeholder="e.g. Aseptic PET Line 6"
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
                      <option key={p.id || p.plantId} value={p.id || p.plantId}>
                        {p.name ? p.name.split(" - ")[0] : p.code || "Plant"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Rated Speed (BPH)</label>
                  <input
                    type="text"
                    placeholder="e.g. 36,000 BPH"
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
                  placeholder="e.g. Bottling, Canning, Aseptic"
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
                  Edit Line — {editingLine.lineCode || editingLine.code || editingLine.lineId}
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
                  value={editingLine.name || ""}
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
                    value={editingLine.ratedSpeed || ""}
                    placeholder="e.g. 38,000 BPH"
                    onChange={(e) => setEditingLine({ ...editingLine, ratedSpeed: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Format Type</label>
                  <input
                    type="text"
                    value={editingLine.type || editingLine.lineType || ""}
                    placeholder="e.g. Bottling, Canning"
                    onChange={(e) => setEditingLine({ ...editingLine, type: e.target.value, lineType: e.target.value })}
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

      {/* VIEW LINE DETAILS MODAL */}
      {viewingLine && (
        <div className="modal-backdrop" onClick={() => setViewingLine(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Manufacturing Line Details
                </h2>
              </div>
              <button onClick={() => setViewingLine(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Line Code</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {viewingLine.lineCode || viewingLine.code || viewingLine.lineId || viewingLine.id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                  <div style={{ marginTop: "4px" }}>
                    <Badge variant={(viewingLine.status || "").toUpperCase() === "RUNNING" || (viewingLine.status || "").toUpperCase() === "ACTIVE" ? "emerald" : "amber"}>
                      {viewingLine.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Line Cell Name</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {viewingLine.name}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Building2 size={13} color="#C89547" />
                    <span>{resolvePlantName(viewingLine)}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Packaging Format</div>
                  <div style={{ marginTop: "4px" }}>
                    <Badge variant="cyan">{viewingLine.type || viewingLine.lineType || "Standard"}</Badge>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Nameplate Speed</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#D97706", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {viewingLine.ratedSpeed && viewingLine.ratedSpeed !== "—"
                      ? viewingLine.ratedSpeed
                      : viewingLine.ratedSpeedBPH
                      ? `${Number(viewingLine.ratedSpeedBPH).toLocaleString()} BPH`
                      : viewingLine.nominalSpeedBpm
                      ? `${(Number(viewingLine.nominalSpeedBpm) * 60).toLocaleString()} BPH`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>OEE Target / Health</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "4px" }}>
                    {viewingLine.ratedOEE || "85.0% Standard"} {viewingLine.healthScore ? `(${viewingLine.healthScore}% Health)` : ""}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(viewingLine.lineId || viewingLine.id || viewingLine.lineCode || viewingLine.code, viewingLine.name)}
                  style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} /> Delete
                </Button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingLine({ ...viewingLine });
                      setViewingLine(null);
                    }}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Edit2 size={13} /> Edit
                  </Button>
                  <Button variant="secondary" onClick={() => setViewingLine(null)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

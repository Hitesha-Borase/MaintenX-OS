import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Building2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function LabourStandardsPage() {
  const { lines = [], employees = [], plants = [], activePlantId } = useMasterData();
  const { addToast } = useApp();

  const [standards, setStandards] = useState([
    { id: "LBR-01", lineId: "LIN-01", lineName: "Line 1 — Aseptic Bottling", standardCrew: 10, stdLaborHoursPer1kUnits: 2.38, directCostPerHour: "$24.50", status: "Active" },
    { id: "LBR-02", lineId: "LIN-02", lineName: "Line 2 — Formulation & Pasteurizer", standardCrew: 6, stdLaborHoursPer1kUnits: 1.85, directCostPerHour: "$28.00", status: "Active" },
    { id: "LBR-03", lineId: "LIN-03", lineName: "Line 3 — Canning Line", standardCrew: 8, stdLaborHoursPer1kUnits: 2.15, directCostPerHour: "$24.50", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [newStandard, setNewStandard] = useState({
    lineId: lines[0]?.lineId || "LIN-01",
    standardCrew: 8,
    stdLaborHoursPer1kUnits: 2.0,
    directCostPerHour: "$25.00"
  });

  const totalCrew = useMemo(() => standards.reduce((sum, s) => sum + (s.standardCrew || 0), 0), [standards]);

  const filteredStandards = useMemo(() => {
    return standards.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.lineName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.directCostPerHour.toLowerCase().includes(q)
      );
    });
  }, [standards, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const selLine = lines.find((l) => l.lineId === newStandard.lineId);
    const created = {
      id: `LBR-0${standards.length + 1}`,
      lineId: newStandard.lineId,
      lineName: selLine ? selLine.name : "Production Line",
      standardCrew: Number(newStandard.standardCrew) || 8,
      stdLaborHoursPer1kUnits: Number(newStandard.stdLaborHoursPer1kUnits) || 2.0,
      directCostPerHour: newStandard.directCostPerHour || "$25.00",
      status: "Active"
    };

    setStandards([...standards, created]);
    addToast(`Labour standard created for ${created.lineName}!`, "success");
    setIsModalOpen(false);
    setNewStandard({
      lineId: lines[0]?.lineId || "LIN-01",
      standardCrew: 8,
      stdLaborHoursPer1kUnits: 2.0,
      directCostPerHour: "$25.00"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const selLine = lines.find((l) => l.lineId === editingStandard.lineId);
    setStandards(
      standards.map((s) =>
        s.id === editingStandard.id
          ? {
              ...editingStandard,
              lineName: selLine ? selLine.name : editingStandard.lineName,
              standardCrew: Number(editingStandard.standardCrew) || 8,
              stdLaborHoursPer1kUnits: Number(editingStandard.stdLaborHoursPer1kUnits) || 2.0
            }
          : s
      )
    );
    addToast(`Labour standard for ${editingStandard.lineName} updated!`, "success");
    setEditingStandard(null);
  };

  const handleDelete = (id, lineName) => {
    if (window.confirm(`Are you sure you want to delete labour standard for ${lineName}?`)) {
      setStandards(standards.filter((s) => s.id !== id));
      addToast("Labour standard removed.", "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Labour Standards & Crew Manning
            </h1>
            <Badge variant="cyan">{standards.length} CREW PROFILES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Labour Standard
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
          title="Total Crew Allocated"
          value={totalCrew.toString()}
          unit="Operators"
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="Onboarded Techs"
          value={employees.length.toString()}
          unit="Qualified"
          icon={Briefcase}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg Manning Cost"
          value="$25.66"
          unit="PerHour"
          icon={DollarSign}
          colorVariant="amber"
        />
        <StatCard
          title="Labor Variance Target"
          value="< 2.0%"
          unit="Variance"
          icon={ShieldCheck}
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
          <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
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
              placeholder="Search labour profile by line or cost rate..."
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
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Work Center Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Standard Crew Size</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Std Labor / 1k Units</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Direct Blended Cost</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandards.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{s.lineName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{s.standardCrew} Crew Members</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>
                    {s.stdLaborHoursPer1kUnits} hrs / 1k units
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669" }}>
                    {s.directCostPerHour} / hr
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="emerald">{s.status}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setEditingStandard({ ...s })}
                        title="Edit Standard"
                        style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.lineName)}
                        title="Delete Standard"
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

      {/* ADD STANDARD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Manning Standard
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Production Line *</label>
                <select
                  value={newStandard.lineId}
                  onChange={(e) => setNewStandard({ ...newStandard, lineId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {lines.map((l) => (
                    <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Standard Crew Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStandard.standardCrew}
                    onChange={(e) => setNewStandard({ ...newStandard, standardCrew: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Std Hours / 1k Units</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newStandard.stdLaborHoursPer1kUnits}
                    onChange={(e) => setNewStandard({ ...newStandard, stdLaborHoursPer1kUnits: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Direct Blended Labor Cost ($/hr)</label>
                <input
                  type="text"
                  placeholder="e.g. $25.00"
                  value={newStandard.directCostPerHour}
                  onChange={(e) => setNewStandard({ ...newStandard, directCostPerHour: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STANDARD MODAL */}
      {editingStandard && (
        <div className="modal-backdrop" onClick={() => setEditingStandard(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Manning Standard — {editingStandard.lineName}
                </h2>
              </div>
              <button onClick={() => setEditingStandard(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Standard Crew Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingStandard.standardCrew}
                    onChange={(e) => setEditingStandard({ ...editingStandard, standardCrew: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Std Hours / 1k Units</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingStandard.stdLaborHoursPer1kUnits}
                    onChange={(e) => setEditingStandard({ ...editingStandard, stdLaborHoursPer1kUnits: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Direct Blended Labor Cost ($/hr)</label>
                <input
                  type="text"
                  value={editingStandard.directCostPerHour}
                  onChange={(e) => setEditingStandard({ ...editingStandard, directCostPerHour: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingStandard(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

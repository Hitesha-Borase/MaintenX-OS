import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  X,
  Gauge,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function PlantsPage() {
  const { plants = [], addPlant, updatePlant, deletePlant, lines = [], activePlantId, setActivePlantId } = useMasterData();
  const { addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [newPlant, setNewPlant] = useState({
    code: "",
    name: "",
    location: "Indore, Madhya Pradesh, India",
    timezone: "Asia/Kolkata (IST)",
    linesCount: 3,
    dailyCapacity: "280,000 Units / Day"
  });

  const totalLines = useMemo(() => lines.length, [lines]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPlant.name.trim() || !newPlant.code.trim()) {
      addToast("Please provide plant name and code.", "warning");
      return;
    }

    const created = addPlant(newPlant);
    addToast(`Plant "${created.name}" registered in Enterprise Master!`, "success");
    setIsModalOpen(false);
    setNewPlant({
      code: "",
      name: "",
      location: "Indore, Madhya Pradesh, India",
      timezone: "Asia/Kolkata (IST)",
      linesCount: 3,
      dailyCapacity: "280,000 Units / Day"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPlant.name.trim() || !editingPlant.code.trim()) {
      addToast("Please provide plant name and code.", "warning");
      return;
    }

    updatePlant(editingPlant.id || editingPlant.plantId, editingPlant);
    addToast(`Plant "${editingPlant.name}" updated!`, "success");
    setEditingPlant(null);
  };

  const handleDelete = (plantId, name) => {
    if (window.confirm(`Are you sure you want to delete Plant "${name}"?`)) {
      deletePlant(plantId);
      addToast(`Plant "${name}" deleted.`, "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Plant Facilities & Site Configuration
            </h1>
            <Badge variant="emerald">{plants.length} SITES ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Provision Plant
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
          title="Active Plants"
          value={plants.length.toString()}
          unit="Facilities"
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Operational Lines"
          value={totalLines.toString()}
          unit="Packaging Cells"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Rated Capacity"
          value="450k"
          unit="Units/Day"
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Site Availability"
          value="99.8%"
          unit="Operational"
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
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Facility Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Geographic Location</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Timezone</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Lines Configured</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((p) => {
                const plantLines = lines.filter((l) => l.plantId === p.id).length;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {p.code || p.id}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.name}</div>
                      {p.id === activePlantId && <Badge variant="cyan" style={{ marginTop: "4px" }}>Active Current Plant</Badge>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} color="#C89547" />
                        <span>{p.location}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {p.timezone || "Asia/Kolkata (IST)"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{plantLines || 3} Active Lines</Badge>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{p.status || "Operational"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setEditingPlant({ ...p })}
                          title="Edit Plant"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Delete Plant"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD PLANT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Provision Manufacturing Plant
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLT-03"
                    value={newPlant.code}
                    onChange={(e) => setNewPlant({ ...newPlant, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Plant Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune Beverage Hub"
                    value={newPlant.name}
                    onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Geographic Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Maharashtra, India"
                  value={newPlant.location}
                  onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Timezone</label>
                  <input
                    type="text"
                    value={newPlant.timezone}
                    onChange={(e) => setNewPlant({ ...newPlant, timezone: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Daily Capacity</label>
                  <input
                    type="text"
                    value={newPlant.dailyCapacity}
                    onChange={(e) => setNewPlant({ ...newPlant, dailyCapacity: e.target.value })}
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
                  Provision Plant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLANT MODAL */}
      {editingPlant && (
        <div className="modal-backdrop" onClick={() => setEditingPlant(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Plant — {editingPlant.code || editingPlant.id}
                </h2>
              </div>
              <button onClick={() => setEditingPlant(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={editingPlant.name}
                  onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Geographic Location</label>
                <input
                  type="text"
                  value={editingPlant.location}
                  onChange={(e) => setEditingPlant({ ...editingPlant, location: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Timezone</label>
                  <input
                    type="text"
                    value={editingPlant.timezone || "Asia/Kolkata (IST)"}
                    onChange={(e) => setEditingPlant({ ...editingPlant, timezone: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Daily Capacity</label>
                  <input
                    type="text"
                    value={editingPlant.dailyCapacity || "250,000 Units / Day"}
                    onChange={(e) => setEditingPlant({ ...editingPlant, dailyCapacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingPlant(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Plant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

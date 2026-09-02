import React, { useState } from "react";
import {
  Building2,
  Plus,
  CheckCircle2,
  MapPin,
  Layers,
  X,
  Gauge,
  Edit2,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function PlantsPage() {
  const { addToast } = useApp();

  const [plants, setPlants] = useState([
    { id: "PLANT-01", name: "Austin Manufacturing Facility", code: "ATX-01", location: "Austin, Texas", lines: 3, capacity: "180,000 btl/day", status: "Operational" },
    { id: "PLANT-02", name: "Dallas Regional Facility", code: "DFW-02", location: "Dallas, Texas", lines: 3, capacity: "150,000 btl/day", status: "Operational" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [newPlant, setNewPlant] = useState({
    name: "",
    code: "",
    location: "",
    lines: 2,
    capacity: "120,000 btl/day"
  });

  const totalLines = plants.reduce((sum, p) => sum + (p.lines || 0), 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPlant.name.trim() || !newPlant.code.trim()) {
      addToast("Please provide plant name and code.", "warning");
      return;
    }

    const created = {
      id: `PLANT-0${plants.length + 1}`,
      name: newPlant.name,
      code: newPlant.code.toUpperCase(),
      location: newPlant.location || "North America",
      lines: Number(newPlant.lines) || 1,
      capacity: newPlant.capacity || "100,000 btl/day",
      status: "Operational"
    };

    setPlants([...plants, created]);
    addToast(`Plant "${created.name}" registered successfully!`, "success");
    setIsModalOpen(false);
    setNewPlant({ name: "", code: "", location: "", lines: 2, capacity: "120,000 btl/day" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPlant.name.trim() || !editingPlant.code.trim()) {
      addToast("Please provide plant name and code.", "warning");
      return;
    }

    setPlants(plants.map((p) => (p.id === editingPlant.id ? { ...editingPlant, lines: Number(editingPlant.lines) || 1 } : p)));
    addToast(`Plant "${editingPlant.name}" updated successfully!`, "success");
    setEditingPlant(null);
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
          title="Active Plants"
          value={plants.length.toString()}
          unit="Facilities"
          trend={{ value: "100% online telemetry", isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Lines"
          value={totalLines.toString()}
          unit="Active Lines"
          trend={{ value: "6 packaging cells", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Combined Capacity"
          value="330k"
          unit="Btl / Day"
          trend={{ value: "Rated nominal speed", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Audit Readiness"
          value="100%"
          unit="FDA / SQF"
          trend={{ value: "Dual site compliance", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Plants Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", width: "100%", minWidth: 0 }}>
        {plants.map((p) => (
          <Card key={p.id} style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{p.name}</h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Code: {p.code}</span>
              </div>
              <Badge variant="emerald" dot>
                {p.status}
              </Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} color="#8C5B23" /> <span>{p.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={14} color="#D97706" /> <span>{p.lines} Active Lines • Rated: {p.capacity}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingPlant({ ...p })}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Edit2 size={11} />
                <span>Configure Site</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* ADD PLANT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Provision New Plant Site
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Houston Bottling Plant"
                    value={newPlant.name}
                    onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Plant Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOU-03"
                    value={newPlant.code}
                    onChange={(e) => setNewPlant({ ...newPlant, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Geographic Location</label>
                <input
                  type="text"
                  placeholder="e.g. Houston, Texas, USA"
                  value={newPlant.location}
                  onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Number of Lines</label>
                  <input
                    type="number"
                    min="1"
                    value={newPlant.lines}
                    onChange={(e) => setNewPlant({ ...newPlant, lines: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Rated Daily Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 150,000 btl/day"
                    value={newPlant.capacity}
                    onChange={(e) => setNewPlant({ ...newPlant, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Plant Site — {editingPlant.code}
                </h2>
              </div>
              <button onClick={() => setEditingPlant(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility Name *</label>
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
                  <label className="form-label">Plant Code *</label>
                  <input
                    type="text"
                    required
                    value={editingPlant.code}
                    onChange={(e) => setEditingPlant({ ...editingPlant, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Number of Lines</label>
                  <input
                    type="number"
                    min="1"
                    value={editingPlant.lines}
                    onChange={(e) => setEditingPlant({ ...editingPlant, lines: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Rated Daily Capacity</label>
                  <input
                    type="text"
                    value={editingPlant.capacity}
                    onChange={(e) => setEditingPlant({ ...editingPlant, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingPlant(null)}>
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

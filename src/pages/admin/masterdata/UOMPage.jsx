import React, { useState } from "react";
import {
  Scale,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Edit2,
  X,
  ShieldCheck,
  Percent,
  Cpu
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function UOMPage() {
  const { addToast } = useApp();

  const [uoms, setUoms] = useState([
    { id: "UOM-01", code: "CASE-24", name: "Case of 24 Units", baseUnit: "EA", factor: 24.0, type: "Packaging" },
    { id: "UOM-02", code: "CASE-12", name: "Case of 12 Units", baseUnit: "EA", factor: 12.0, type: "Packaging" },
    { id: "UOM-03", code: "PALLET-60", name: "Standard 48x40 Wood Pallet", baseUnit: "CASE-24", factor: 60.0, type: "Warehouse Logistics" },
    { id: "UOM-04", code: "LITER", name: "Metric Volume (1,000 ml)", baseUnit: "ML", factor: 1000.0, type: "Liquid Measure" },
    { id: "UOM-05", code: "KG", name: "Kilogram (1,000 g)", baseUnit: "G", factor: 1000.0, type: "Mass Measure" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState(null);

  const [newUOM, setNewUOM] = useState({
    code: "",
    name: "",
    baseUnit: "EA",
    factor: 12.0,
    type: "Packaging"
  });

  const filteredUOMs = uoms.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.code.toLowerCase().includes(q) ||
      u.type.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newUOM.code.trim() || !newUOM.name.trim()) {
      addToast("Please provide UOM code and description.", "warning");
      return;
    }

    const created = {
      id: `UOM-0${uoms.length + 1}`,
      code: newUOM.code.toUpperCase(),
      name: newUOM.name,
      baseUnit: newUOM.baseUnit,
      factor: Number(newUOM.factor) || 1.0,
      type: newUOM.type
    };

    setUoms([...uoms, created]);
    addToast(`UOM "${created.code}" registered successfully!`, "success");
    setIsModalOpen(false);
    setNewUOM({ code: "", name: "", baseUnit: "EA", factor: 12.0, type: "Packaging" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUOM.code.trim() || !editingUOM.name.trim()) {
      addToast("Please provide UOM code and description.", "warning");
      return;
    }

    setUoms((prev) =>
      prev.map((u) => (u.id === editingUOM.id ? editingUOM : u))
    );
    addToast(`UOM "${editingUOM.code}" updated successfully!`, "success");
    setEditingUOM(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Units of Measure (UOM) & Conversions
            </h1>
            <Badge variant="cyan">{uoms.length} UOMS CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add UOM Factor
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
          title="Active UOMs"
          value={uoms.length.toString()}
          unit="Conversion Factors"
          icon={Scale}
          colorVariant="emerald"
        />
        <StatCard
          title="Standard Pallet"
          value="60 Cases"
          unit="48x40 GMA"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Precision Factor"
          value="100%"
          unit="Deterministic"
          icon={Percent}
          colorVariant="amber"
        />
        <StatCard
          title="ERP Sync State"
          value="Live"
          unit="Auto-Mapped"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table Section */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search UOM code, name, type..."
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
                <th>UOM Code</th>
                <th>Unit Description</th>
                <th>Category</th>
                <th>Base Reference</th>
                <th>Multiplier Ratio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUOMs.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {u.code}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{u.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{u.type}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{u.baseUnit}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    1 {u.code} = {u.factor} {u.baseUnit}
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingUOM({ ...u })}
                      title="Edit UOM"
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

      {/* ADD UOM MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add UOM Conversion Factor
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">UOM Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRAY-6"
                    value={newUOM.code}
                    onChange={(e) => setNewUOM({ ...newUOM, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newUOM.type}
                    onChange={(e) => setNewUOM({ ...newUOM, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Warehouse Logistics">Warehouse Logistics</option>
                    <option value="Liquid Measure">Liquid Measure</option>
                    <option value="Mass Measure">Mass Measure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Unit Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multipack Tray of 6 Cans"
                  value={newUOM.name}
                  onChange={(e) => setNewUOM({ ...newUOM, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Base Reference Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. EA or CAN"
                    value={newUOM.baseUnit}
                    onChange={(e) => setNewUOM({ ...newUOM, baseUnit: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Multiplier Factor Ratio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newUOM.factor}
                    onChange={(e) => setNewUOM({ ...newUOM, factor: e.target.value })}
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
                  Save UOM
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UOM MODAL */}
      {editingUOM && (
        <div className="modal-backdrop" onClick={() => setEditingUOM(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit UOM — {editingUOM.code}
              </h2>
              <button onClick={() => setEditingUOM(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">UOM Code *</label>
                  <input
                    type="text"
                    required
                    value={editingUOM.code}
                    onChange={(e) => setEditingUOM({ ...editingUOM, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editingUOM.type}
                    onChange={(e) => setEditingUOM({ ...editingUOM, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Warehouse Logistics">Warehouse Logistics</option>
                    <option value="Liquid Measure">Liquid Measure</option>
                    <option value="Mass Measure">Mass Measure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Unit Description *</label>
                <input
                  type="text"
                  required
                  value={editingUOM.name}
                  onChange={(e) => setEditingUOM({ ...editingUOM, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Base Reference Unit</label>
                  <input
                    type="text"
                    value={editingUOM.baseUnit}
                    onChange={(e) => setEditingUOM({ ...editingUOM, baseUnit: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Multiplier Factor Ratio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editingUOM.factor}
                    onChange={(e) => setEditingUOM({ ...editingUOM, factor: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingUOM(null)}>
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

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Edit2,
  X,
  ShieldCheck,
  Percent,
  Tag
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function ProductFamiliesPage() {
  const { addToast } = useApp();

  const [families, setFamilies] = useState([
    { id: "FAM-01", name: "Sparkling Flavored Beverages", skusCount: 12, allergenRisk: "None", standardMargin: "58.4%", status: "Active" },
    { id: "FAM-02", name: "Tonics & Mixers Premium", skusCount: 8, allergenRisk: "None", standardMargin: "62.1%", status: "Active" },
    { id: "FAM-03", name: "Organic Ginger Brews", skusCount: 6, allergenRisk: "Ginger Extract", standardMargin: "54.0%", status: "Active" },
    { id: "FAM-04", name: "Functional Energy Formulations", skusCount: 4, allergenRisk: "None", standardMargin: "66.5%", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  const [newFamily, setNewFamily] = useState({
    name: "",
    skusCount: 4,
    allergenRisk: "None",
    standardMargin: "50%"
  });

  const totalSKUs = families.reduce((sum, f) => sum + (f.skusCount || 0), 0);

  const filteredFamilies = families.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.allergenRisk.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFamily.name.trim()) {
      addToast("Please provide family description.", "warning");
      return;
    }

    const created = {
      id: `FAM-0${families.length + 1}`,
      name: newFamily.name,
      skusCount: Number(newFamily.skusCount) || 1,
      allergenRisk: newFamily.allergenRisk || "None",
      standardMargin: newFamily.standardMargin || "50%",
      status: "Active"
    };

    setFamilies([...families, created]);
    addToast(`Product family "${created.name}" registered!`, "success");
    setIsModalOpen(false);
    setNewFamily({ name: "", skusCount: 4, allergenRisk: "None", standardMargin: "50%" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingFamily.name.trim()) {
      addToast("Please provide family description.", "warning");
      return;
    }

    setFamilies((prev) =>
      prev.map((f) => (f.id === editingFamily.id ? editingFamily : f))
    );
    addToast(`Product family "${editingFamily.name}" updated successfully!`, "success");
    setEditingFamily(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Product Families Master
            </h1>
            <Badge variant="cyan">{families.length} FAMILIES CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Product Family
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
          title="Active Families"
          value={families.length.toString()}
          unit="Categories"
          icon={Boxes}
          colorVariant="emerald"
        />
        <StatCard
          title="Associated SKUs"
          value={totalSKUs.toString()}
          unit="Formulations"
          icon={Tag}
          colorVariant="cyan"
        />
        <StatCard
          title="Target Gross Margin"
          value="58.2%"
          unit="Blended"
          icon={Percent}
          colorVariant="amber"
        />
        <StatCard
          title="Allergen Segregation"
          value="100%"
          unit="Compliant"
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
              placeholder="Search family name, code, allergens..."
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
                <th>Family Code</th>
                <th>Family Description</th>
                <th>SKU Count</th>
                <th>Allergen Profile</th>
                <th>Target Margin</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilies.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {f.id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{f.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                      {f.skusCount} SKUs
                    </span>
                  </td>
                  <td>
                    <Badge variant={f.allergenRisk === "None" ? "emerald" : "amber"}>
                      {f.allergenRisk}
                    </Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "#D97706" }}>
                    {f.standardMargin}
                  </td>
                  <td>
                    <Badge variant="emerald">{f.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingFamily({ ...f })}
                      title="Edit Product Family"
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

      {/* ADD FAMILY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New Product Family
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Family Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cold-Pressed Premium Juices"
                  value={newFamily.name}
                  onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Estimated SKU Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newFamily.skusCount}
                    onChange={(e) => setNewFamily({ ...newFamily, skusCount: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Gross Margin</label>
                  <input
                    type="text"
                    placeholder="e.g. 55%"
                    value={newFamily.standardMargin}
                    onChange={(e) => setNewFamily({ ...newFamily, standardMargin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Allergen Risk Profile</label>
                <input
                  type="text"
                  placeholder="e.g. None or Soy / Dairy"
                  value={newFamily.allergenRisk}
                  onChange={(e) => setNewFamily({ ...newFamily, allergenRisk: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Family
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FAMILY MODAL */}
      {editingFamily && (
        <div className="modal-backdrop" onClick={() => setEditingFamily(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit Family — {editingFamily.id}
              </h2>
              <button onClick={() => setEditingFamily(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Family Name / Description *</label>
                <input
                  type="text"
                  required
                  value={editingFamily.name}
                  onChange={(e) => setEditingFamily({ ...editingFamily, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">SKU Count</label>
                  <input
                    type="number"
                    min="1"
                    value={editingFamily.skusCount}
                    onChange={(e) => setEditingFamily({ ...editingFamily, skusCount: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Gross Margin</label>
                  <input
                    type="text"
                    value={editingFamily.standardMargin}
                    onChange={(e) => setEditingFamily({ ...editingFamily, standardMargin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Allergen Risk Profile</label>
                  <input
                    type="text"
                    value={editingFamily.allergenRisk}
                    onChange={(e) => setEditingFamily({ ...editingFamily, allergenRisk: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingFamily.status}
                    onChange={(e) => setEditingFamily({ ...editingFamily, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingFamily(null)}>
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

import React, { useState, useMemo } from "react";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  Percent,
  Tag,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function ProductFamiliesPage() {
  const { productFamilies = [], addProductFamily, updateProductFamily, deleteProductFamily, toggleProductFamilyStatus, skus = [], plants = [], activePlantId } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  const [newFamily, setNewFamily] = useState({
    code: "",
    name: "",
    category: "Finished Goods",
    description: "",
    plantId: activePlantId || "PLT-01",
    allergenRisk: "None",
    standardMargin: "55.0%",
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveTo: "2030-12-31"
  });

  const totalSKUs = useMemo(() => {
    return productFamilies.reduce((sum, f) => {
      const linked = skus.filter((s) => s.familyId === f.familyId || s.family === f.name).length;
      return sum + linked;
    }, 0);
  }, [productFamilies, skus]);

  const filteredFamilies = useMemo(() => {
    return productFamilies.filter((f) => {
      const matchesPlant = plantFilter === "ALL" || f.plantId === plantFilter;
      const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        (f.allergenRisk || "").toLowerCase().includes(q) ||
        (f.description || "").toLowerCase().includes(q);

      return matchesPlant && matchesStatus && matchesSearch;
    });
  }, [productFamilies, plantFilter, statusFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFamily.name.trim()) {
      addToast("Please provide product family name.", "warning");
      return;
    }

    if (newFamily.code && productFamilies.some((f) => f.code.toLowerCase() === newFamily.code.trim().toLowerCase())) {
      addToast(`Family Code "${newFamily.code}" already exists.`, "warning");
      return;
    }

    const created = addProductFamily(newFamily);
    addToast(`Product family "${created.name}" registered in Master Data!`, "success");
    setIsModalOpen(false);
    setNewFamily({
      code: "",
      name: "",
      category: "Finished Goods",
      description: "",
      plantId: activePlantId || "PLT-01",
      allergenRisk: "None",
      standardMargin: "55.0%",
      effectiveFrom: new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingFamily.name.trim()) {
      addToast("Please provide family description.", "warning");
      return;
    }

    updateProductFamily(editingFamily.familyId, editingFamily);
    addToast(`Product family "${editingFamily.name}" updated successfully!`, "success");
    setEditingFamily(null);
  };

  const handleDelete = (familyId, name) => {
    if (window.confirm(`Are you sure you want to delete Product Family "${name}"?`)) {
      deleteProductFamily(familyId);
      addToast(`Product family "${name}" deleted.`, "info");
    }
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
            <Badge variant="cyan">{productFamilies.length} FAMILIES CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Product Family
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
          title="Active Families"
          value={productFamilies.filter((f) => f.status === "Active").length.toString()}
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
              placeholder="Search product family by name, code or allergen..."
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Family Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Family Name & Description</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked SKUs</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Allergen Risk</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Margin</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No product families found matching filters.
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((f) => {
                  const linkedCount = skus.filter((s) => s.familyId === f.familyId || s.family === f.name).length;
                  const plantName = plants.find((p) => p.id === f.plantId)?.name?.split(" - ")[0] || "Global / Enterprise";
                  return (
                    <tr key={f.familyId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {f.code}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{f.name}</div>
                        {f.description && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{f.description}</div>}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Building2 size={12} color="#C89547" />
                          <span>{plantName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="cyan">{linkedCount} Master SKUs</Badge>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {f.allergenRisk && f.allergenRisk !== "None" ? (
                          <Badge variant="amber">{f.allergenRisk}</Badge>
                        ) : (
                          <Badge variant="emerald">None (Safe)</Badge>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#D97706" }}>
                        {f.standardMargin || "55%"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => toggleProductFamilyStatus(f.familyId)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          title="Click to toggle status"
                        >
                          <Badge variant={f.status === "Active" ? "emerald" : "gray"}>{f.status}</Badge>
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
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
                          <button
                            onClick={() => handleDelete(f.familyId, f.name)}
                            title="Delete Product Family"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#EF4444",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
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

      {/* ADD FAMILY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Boxes size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add New Product Family
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Family Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAM-05"
                    value={newFamily.code}
                    onChange={(e) => setNewFamily({ ...newFamily, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Family Name *</label>
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility *</label>
                  <select
                    value={newFamily.plantId}
                    onChange={(e) => setNewFamily({ ...newFamily, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Gross Margin</label>
                  <input
                    type="text"
                    placeholder="e.g. 58.0%"
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
                  placeholder="e.g. None or Ginger Extract / Citrus Terpenes"
                  value={newFamily.allergenRisk}
                  onChange={(e) => setNewFamily({ ...newFamily, allergenRisk: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Description / Scope</label>
                <textarea
                  rows={2}
                  placeholder="Technical description of this product line..."
                  value={newFamily.description}
                  onChange={(e) => setNewFamily({ ...newFamily, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Effective From</label>
                  <input
                    type="date"
                    value={newFamily.effectiveFrom}
                    onChange={(e) => setNewFamily({ ...newFamily, effectiveFrom: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Effective To</label>
                  <input
                    type="date"
                    value={newFamily.effectiveTo}
                    onChange={(e) => setNewFamily({ ...newFamily, effectiveTo: e.target.value })}
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
                  Save Product Family
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FAMILY MODAL */}
      {editingFamily && (
        <div className="modal-backdrop" onClick={() => setEditingFamily(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Product Family — {editingFamily.code}
                </h2>
              </div>
              <button onClick={() => setEditingFamily(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Family Code *</label>
                  <input
                    type="text"
                    required
                    value={editingFamily.code}
                    onChange={(e) => setEditingFamily({ ...editingFamily, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Family Name *</label>
                  <input
                    type="text"
                    required
                    value={editingFamily.name}
                    onChange={(e) => setEditingFamily({ ...editingFamily, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility</label>
                  <select
                    value={editingFamily.plantId}
                    onChange={(e) => setEditingFamily({ ...editingFamily, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
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
                <label className="form-label">Description / Scope</label>
                <textarea
                  rows={2}
                  value={editingFamily.description || ""}
                  onChange={(e) => setEditingFamily({ ...editingFamily, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingFamily(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Product Family
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

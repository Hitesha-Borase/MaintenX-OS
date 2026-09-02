import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Edit2,
  X,
  Boxes,
  Tag,
  ShieldCheck,
  Eye,
  History,
  Building2,
  Power
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function ItemMasterPage() {
  const { skus = [], addSKU, updateSKU, toggleSKUStatus, plants = [], boms = [], qualitySpecs = [], auditLogs = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [plantFilter, setPlantFilter] = useState("ALL");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSku, setEditingSku] = useState(null);
  const [viewingSku, setViewingSku] = useState(null);

  const [newSku, setNewSku] = useState({
    skuCode: "",
    name: "",
    category: "Finished Goods",
    family: "Sparkling Flavors",
    uom: "Bottles",
    plantId: "PLT-01",
    status: "Active",
    stdCost: "$0.50",
    description: ""
  });

  const filteredSkus = useMemo(() => {
    return skus.filter((sku) => {
      const matchesCategory = categoryFilter === "ALL" || sku.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || sku.status === statusFilter;
      const matchesPlant = plantFilter === "ALL" || sku.plantId === plantFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sku.name?.toLowerCase().includes(q) ||
        sku.skuCode?.toLowerCase().includes(q) ||
        sku.skuId?.toLowerCase().includes(q) ||
        sku.family?.toLowerCase().includes(q) ||
        sku.createdBy?.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesPlant && matchesSearch;
    });
  }, [skus, categoryFilter, statusFilter, plantFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSku.name.trim()) {
      addToast("Please provide SKU Name.", "warning");
      return;
    }

    // Check duplicate code
    if (newSku.skuCode && skus.some((s) => s.skuCode?.toLowerCase() === newSku.skuCode?.trim().toLowerCase())) {
      addToast(`SKU Code "${newSku.skuCode}" already exists! Please use a unique identifier.`, "warning");
      return;
    }

    const created = addSKU(newSku);
    addToast(`SKU ${created.skuCode} (${created.name}) created successfully!`, "success");
    setIsAddModalOpen(false);
    setNewSku({
      skuCode: "",
      name: "",
      category: "Finished Goods",
      family: "Sparkling Flavors",
      uom: "Bottles",
      plantId: "PLT-01",
      status: "Active",
      stdCost: "$0.50",
      description: ""
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingSku.name.trim()) {
      addToast("Please provide SKU Name.", "warning");
      return;
    }
    updateSKU(editingSku.skuId, editingSku);
    addToast(`SKU ${editingSku.skuCode} updated successfully!`, "success");
    setEditingSku(null);
  };

  const finishedGoodsCount = skus.filter((i) => i.category?.includes("Finished")).length;
  const materialsCount = skus.filter((i) => !i.category?.includes("Finished")).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Item & SKU Master Management
            </h1>
            <Badge variant="cyan">{skus.length} MASTER SKUs</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create New SKU
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Cards */}
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
          title="Finished Goods SKUs"
          value={finishedGoodsCount.toString()}
          unit="Active Products"
          trend={{ value: "Commercial inventory", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Ingredients & Packaging"
          value={materialsCount.toString()}
          unit="Input Items"
          trend={{ value: "Raw & packaging materials", isPositive: true, text: "" }}
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Active Master Plants"
          value={plants.length.toString()}
          unit="Facilities"
          trend={{ value: "Indore & Austin multi-site", isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="amber"
        />
        <StatCard
          title="Single Source Compliance"
          value="100%"
          unit="Certified"
          trend={{ value: "Unified ID master architecture", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "200px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Categories</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Raw Ingredients">Raw Ingredients</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            {/* Plant Filter */}
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "140px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "130px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredSkus.length}</strong> of {skus.length} SKUs
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>SKU Code</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>SKU Name & Family</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>UOM</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Plant</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rev</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Created By / Date</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkus.length > 0 ? (
                filteredSkus.map((sku) => {
                  const plantObj = plants.find((p) => p.id === sku.plantId);
                  return (
                    <tr
                      key={sku.skuId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {sku.skuCode}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {sku.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {sku.family}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={sku.category === "Finished Goods" ? "emerald" : sku.category === "Packaging" ? "amber" : "cyan"}>
                          {sku.category}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {sku.uom}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {plantObj ? plantObj.name.split(" - ")[0] : "Indore Plant"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)", padding: "2px 6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "4px" }}>
                          {sku.revision || "R1"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={sku.status === "Active" ? "emerald" : "rose"}>
                          {sku.status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {sku.createdBy || "Alexander Vance"}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {sku.createdDate || "2026-08-01"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => setViewingSku(sku)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            title="View SKU Details"
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingSku(sku)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            title="Edit SKU"
                          >
                            Edit
                          </Button>
                          <button
                            onClick={() => {
                              toggleSKUStatus(sku.skuId);
                              addToast(`SKU ${sku.skuCode} status toggled!`, "info");
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: "1px solid var(--border-subtle)",
                              backgroundColor: sku.status === "Active" ? "rgba(220, 38, 38, 0.08)" : "rgba(5, 150, 105, 0.08)",
                              color: sku.status === "Active" ? "#DC2626" : "#059669",
                              cursor: "pointer"
                            }}
                            title={sku.status === "Active" ? "Deactivate SKU" : "Activate SKU"}
                          >
                            <Power size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No SKU items match the selected category, plant or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE NEW SKU MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Register New Master SKU
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>SKU Code (Auto/Custom)</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-5004"
                    value={newSku.skuCode}
                    onChange={(e) => setNewSku({ ...newSku, skuCode: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category *</label>
                  <select
                    value={newSku.category}
                    onChange={(e) => setNewSku({ ...newSku, category: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Raw Ingredients">Raw Ingredients</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>SKU Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 750ml Sparkling Mineral Tonic"
                  value={newSku.name}
                  onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>UOM *</label>
                  <select
                    value={newSku.uom}
                    onChange={(e) => setNewSku({ ...newSku, uom: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Bottles">Bottles</option>
                    <option value="Cans">Cans</option>
                    <option value="Liters">Liters</option>
                    <option value="Kg">Kg</option>
                    <option value="Units">Units</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Plant Facility</label>
                  <select
                    value={newSku.plantId}
                    onChange={(e) => setNewSku({ ...newSku, plantId: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Standard Cost</label>
                  <input
                    type="text"
                    placeholder="$0.50"
                    value={newSku.stdCost}
                    onChange={(e) => setNewSku({ ...newSku, stdCost: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description & Quality Notes</label>
                <textarea
                  rows={2}
                  placeholder="Provide formula description, allergen flags, or packaging specs..."
                  value={newSku.description}
                  onChange={(e) => setNewSku({ ...newSku, description: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px", fontSize: "12px", marginTop: "4px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save & Register SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SKU MODAL */}
      {editingSku && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit SKU — {editingSku.skuCode}
                </h3>
              </div>
              <button onClick={() => setEditingSku(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>SKU Item Name *</label>
                <input
                  type="text"
                  required
                  value={editingSku.name}
                  onChange={(e) => setEditingSku({ ...editingSku, name: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category</label>
                  <select
                    value={editingSku.category}
                    onChange={(e) => setEditingSku({ ...editingSku, category: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Raw Ingredients">Raw Ingredients</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                  <select
                    value={editingSku.status}
                    onChange={(e) => setEditingSku({ ...editingSku, status: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>UOM</label>
                  <input
                    type="text"
                    value={editingSku.uom}
                    onChange={(e) => setEditingSku({ ...editingSku, uom: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Standard Cost</label>
                  <input
                    type="text"
                    value={editingSku.stdCost}
                    onChange={(e) => setEditingSku({ ...editingSku, stdCost: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description</label>
                <textarea
                  rows={2}
                  value={editingSku.description || ""}
                  onChange={(e) => setEditingSku({ ...editingSku, description: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px", fontSize: "12px", marginTop: "4px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingSku(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Update SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SKU DETAILS MODAL (Single Source of Truth Links) */}
      {viewingSku && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "720px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Package size={20} color="#B27E33" />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      {viewingSku.name}
                    </h3>
                    <Badge variant="cyan">{viewingSku.skuCode}</Badge>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Global Entity ID: {viewingSku.skuId} • Revision: {viewingSku.revision || "R1"}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingSku(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Core Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Category</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>{viewingSku.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>UOM</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>{viewingSku.uom}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Std Cost</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23", marginTop: "2px" }}>{viewingSku.stdCost}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Status</div>
                  <Badge variant={viewingSku.status === "Active" ? "emerald" : "rose"}>{viewingSku.status}</Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Description</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {viewingSku.description || "Standard master catalog specification."}
                </div>
              </div>

              {/* Linked BOM Recipes */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>Linked BOM & Recipes (Single Source of Truth)</div>
                {boms.filter((b) => b.finishedSkuId === viewingSku.skuId || b.finishedSkuName === viewingSku.name).length > 0 ? (
                  boms.filter((b) => b.finishedSkuId === viewingSku.skuId || b.finishedSkuName === viewingSku.name).map((b) => (
                    <div key={b.bomId} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{b.bomNumber}</strong> ({b.revision}) — {b.batchSize}
                      </div>
                      <Badge variant="emerald">{b.status}</Badge>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No linked BOM formulation found for this raw material.</div>
                )}
              </div>

              {/* Linked Quality Specifications */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>Linked Quality Specifications</div>
                {qualitySpecs.filter((q) => q.skuId === viewingSku.skuId || q.skuCode === viewingSku.skuCode).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {qualitySpecs.filter((q) => q.skuId === viewingSku.skuId || q.skuCode === viewingSku.skuCode).map((q) => (
                      <div key={q.specId} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{q.parameter}:</strong> Target {q.target} {q.uom} (Range: {q.min} - {q.max} {q.uom})
                        </div>
                        <Badge variant="cyan">{q.criticality}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No active quality parameter specs registered.</div>
                )}
              </div>

              {/* Audit History Snapshot */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>Audit Trail History</div>
                {auditLogs.filter((a) => a.entityId === viewingSku.skuCode || a.entityId === viewingSku.skuId).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {auditLogs.filter((a) => a.entityId === viewingSku.skuCode || a.entityId === viewingSku.skuId).map((a) => (
                      <div key={a.auditId} style={{ backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", padding: "8px 10px", fontSize: "11px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>{a.action} by {a.user}</strong>
                          <span style={{ color: "var(--text-muted)" }}>{a.timestamp}</span>
                        </div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>{a.newValue || a.notes}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Created on {viewingSku.createdDate || "2026-08-01"} by {viewingSku.createdBy || "Alexander Vance"}.</div>
                )}
              </div>
            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setViewingSku(null)} style={{ fontSize: "12px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Package,
  Boxes,
  Thermometer,
  ShieldCheck,
  Tag
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function StorageTypesPage() {
  const {
    storageTypes = [],
    setStorageTypes,
    addStorageType,
    updateStorageType,
    deleteStorageType
  } = useMasterData();
  const { addToast } = useApp();

  const fetchStorageTypes = useCallback(async () => {
    try {
      const res = await masterDataService.getStorageTypes();
      const data = res?.data?.data !== undefined ? res.data.data : (res?.data !== undefined ? res.data : res);
      if (Array.isArray(data) && typeof setStorageTypes === "function") {
        setStorageTypes(data);
      }
    } catch (err) {
      console.warn("Storage types load error:", err.message);
    }
  }, [setStorageTypes]);

  useEffect(() => {
    fetchStorageTypes();
  }, [fetchStorageTypes]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [viewingType, setViewingType] = useState(null);

  const [newType, setNewType] = useState({
    typeCode: "",
    name: "",
    category: "Racking & High-Bay",
    description: "",
    status: "Active"
  });

  const categories = useMemo(() => {
    const set = new Set();
    storageTypes.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [storageTypes]);

  const filteredTypes = useMemo(() => {
    return storageTypes.filter((t) => {
      const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.typeCode || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [storageTypes, categoryFilter, statusFilter, searchQuery]);

  const handleOpenAddModal = () => {
    const nextNum = storageTypes.length + 1;
    setNewType({
      typeCode: `ST-${nextNum.toString().padStart(2, "0")}`,
      name: "",
      category: "Racking & High-Bay",
      description: "",
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newType.name.trim()) {
      addToast("Please provide storage type name.", "warning");
      return;
    }

    try {
      const created = await addStorageType(newType);
      addToast(`Storage Type "${created?.name || newType.name}" registered!`, "success");
      setIsModalOpen(false);
      fetchStorageTypes();
    } catch (err) {
      addToast(`Failed to register storage type: ${err.message}`, "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingType.name.trim()) {
      addToast("Please provide storage type name.", "warning");
      return;
    }

    try {
      await updateStorageType(editingType.id, editingType);
      addToast(`Storage Type "${editingType.name}" updated!`, "success");
      setEditingType(null);
      fetchStorageTypes();
    } catch (err) {
      addToast(`Failed to update storage type: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete Storage Type "${name}"?`)) {
      try {
        await deleteStorageType(id);
        addToast(`Storage Type "${name}" deleted.`, "info");
        fetchStorageTypes();
      } catch (err) {
        addToast(`Failed to delete storage type: ${err.message}`, "error");
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "32px", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Storage Types Master
            </h1>
            <Badge variant="cyan">{storageTypes.length} STORAGE TYPES</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Define physical storage classification types, high-bays, silos, and cold rooms for warehouse nodes.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Storage Type
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
          title="Total Storage Types"
          value={storageTypes.length.toString()}
          unit="Master Classes"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Storage Types"
          value={storageTypes.filter((t) => t.status === "Active").length.toString()}
          unit="Enabled"
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Liquid & Bulk Types"
          value={storageTypes.filter((t) => (t.category || "").toLowerCase().includes("liquid") || (t.name || "").toLowerCase().includes("silo")).length.toString()}
          unit="Silo & Tanks"
          icon={Boxes}
          colorVariant="amber"
        />
        <StatCard
          title="Cold-Chain Zones"
          value={storageTypes.filter((t) => (t.category || "").toLowerCase().includes("cold") || (t.name || "").toLowerCase().includes("freeze") || (t.name || "").toLowerCase().includes("refrigerated")).length.toString()}
          unit="Regulated"
          icon={Thermometer}
          colorVariant="emerald"
        />
      </div>

      {/* Main Content Card */}
      <Card style={{ padding: "0px", overflow: "hidden", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100%" }}>
        {/* Filters */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "220px", maxWidth: "360px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search storage type code, name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "30px", fontSize: "12px", height: "34px", width: "100%", backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
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

        {/* Table */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Type Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Storage Type Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Classification Category</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Description</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No storage types found. Click "+ Add Storage Type" to create one.
                  </td>
                </tr>
              ) : (
                filteredTypes.map((t) => (
                  <tr key={t.id || t.typeCode} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {t.typeCode}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                      {t.name}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{t.category || "Warehouse Storage"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)", maxWidth: "280px" }}>
                      {t.description || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={t.status === "Active" ? "emerald" : "amber"}>{t.status || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setViewingType(t)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-subtle)",
                            backgroundColor: "transparent",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "inline-flex"
                          }}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setEditingType({ ...t })}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-subtle)",
                            backgroundColor: "transparent",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "inline-flex"
                          }}
                          title="Edit Storage Type"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-subtle)",
                            backgroundColor: "transparent",
                            color: "var(--text-danger, #EF4444)",
                            cursor: "pointer",
                            display: "inline-flex"
                          }}
                          title="Delete Storage Type"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD STORAGE TYPE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#C89547" />
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Add Storage Type Master
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Type Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ST-RACK"
                    value={newType.typeCode}
                    onChange={(e) => setNewType({ ...newType, typeCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Type Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Selective Pallet Rack"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Classification Category</label>
                  <select
                    value={newType.category}
                    onChange={(e) => setNewType({ ...newType, category: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Racking & High-Bay">Racking & High-Bay</option>
                    <option value="Bulk Liquid Storage">Bulk Liquid Storage</option>
                    <option value="Cold Chain (2°C - 4°C)">Cold Chain (2°C - 4°C)</option>
                    <option value="Cold Chain (-18°C)">Cold Chain (-18°C)</option>
                    <option value="Secondary Packaging">Secondary Packaging</option>
                    <option value="Automated High-Bay">Automated High-Bay</option>
                    <option value="Floor Staging Lane">Floor Staging Lane</option>
                    <option value="Warehouse Storage">Warehouse Storage</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={newType.status}
                    onChange={(e) => setNewType({ ...newType, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description / Specifications</label>
                <textarea
                  rows="3"
                  placeholder="Describe dimensions, temperature criteria, or storage constraints..."
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Storage Type
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STORAGE TYPE MODAL */}
      {editingType && (
        <div className="modal-backdrop" onClick={() => setEditingType(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#C89547" />
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Edit Storage Type: {editingType.typeCode}
                </h3>
              </div>
              <button onClick={() => setEditingType(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Type Code</label>
                  <input
                    type="text"
                    required
                    value={editingType.typeCode}
                    onChange={(e) => setEditingType({ ...editingType, typeCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Type Name *</label>
                  <input
                    type="text"
                    required
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={editingType.category || "Warehouse Storage"}
                    onChange={(e) => setEditingType({ ...editingType, category: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Racking & High-Bay">Racking & High-Bay</option>
                    <option value="Bulk Liquid Storage">Bulk Liquid Storage</option>
                    <option value="Cold Chain (2°C - 4°C)">Cold Chain (2°C - 4°C)</option>
                    <option value="Cold Chain (-18°C)">Cold Chain (-18°C)</option>
                    <option value="Secondary Packaging">Secondary Packaging</option>
                    <option value="Automated High-Bay">Automated High-Bay</option>
                    <option value="Floor Staging Lane">Floor Staging Lane</option>
                    <option value="Warehouse Storage">Warehouse Storage</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={editingType.status || "Active"}
                    onChange={(e) => setEditingType({ ...editingType, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  value={editingType.description || ""}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingType(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Type
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STORAGE TYPE MODAL */}
      {viewingType && (
        <div className="modal-backdrop" onClick={() => setViewingType(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#C89547" />
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Storage Type Details
                </h3>
              </div>
              <button onClick={() => setViewingType(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                  {viewingType.typeCode}
                </span>
                <Badge variant={viewingType.status === "Active" ? "emerald" : "amber"}>{viewingType.status || "Active"}</Badge>
              </div>

              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {viewingType.name}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge variant="cyan">{viewingType.category || "Warehouse Storage"}</Badge>
              </div>

              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>
                  Description / Warehouse Specifications
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {viewingType.description || "No description provided."}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setViewingType(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

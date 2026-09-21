import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Cpu,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Layers,
  Wrench,
  ShieldCheck,
  Tag,
  Building2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function AssetTypesPage() {
  const {
    assetTypes = [],
    setAssetTypes,
    addAssetType,
    updateAssetType,
    deleteAssetType,
    assets = []
  } = useMasterData();
  const { addToast } = useApp();

  const fetchAssetTypes = useCallback(async () => {
    try {
      const res = await masterDataService.getAssetTypes();
      const data = res?.data?.data !== undefined ? res.data.data : (res?.data !== undefined ? res.data : res);
      if (Array.isArray(data) && typeof setAssetTypes === "function") {
        setAssetTypes(data);
      }
    } catch (err) {
      console.warn("Asset types load error:", err.message);
    }
  }, [setAssetTypes]);

  useEffect(() => {
    fetchAssetTypes();
  }, []); // Run on mount only

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [viewingType, setViewingType] = useState(null);

  const [newType, setNewType] = useState({
    code: "",
    name: "",
    description: ""
  });

  const filteredTypes = useMemo(() => {
    return assetTypes.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.code || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [assetTypes, searchQuery]);

  const handleOpenAddModal = () => {
    const nextNum = assetTypes.length + 1;
    setNewType({
      code: `EQ-${nextNum.toString().padStart(2, "0")}`,
      name: "",
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newType.name.trim()) {
      addToast("Please provide asset category name.", "warning");
      return;
    }

    try {
      const code = (newType.code || newType.name.replace(/[^A-Z0-9]/gi, "").substring(0, 8)).toUpperCase();
      const created = await addAssetType({
        name: newType.name.trim(),
        code,
        description: newType.description.trim()
      });

      addToast(`Asset Category "${created?.name || newType.name}" registered successfully!`, "success");
      setIsModalOpen(false);
      setNewType({ code: "", name: "", description: "" });
      fetchAssetTypes();
    } catch (err) {
      addToast(`Failed to register asset category: ${err.message}`, "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingType.name.trim()) {
      addToast("Please provide asset category name.", "warning");
      return;
    }

    try {
      const targetId = editingType.id || editingType.code;
      await updateAssetType(targetId, {
        name: editingType.name.trim(),
        code: (editingType.code || "").toUpperCase(),
        description: (editingType.description || "").trim()
      });

      addToast(`Asset Category "${editingType.name}" updated successfully!`, "success");
      setEditingType(null);
      fetchAssetTypes();
    } catch (err) {
      addToast(`Failed to update asset category: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Asset Category "${name}"?`)) return;

    try {
      await deleteAssetType(id);
      addToast(`Asset Category "${name}" deleted from database.`, "info");
      fetchAssetTypes();
    } catch (err) {
      addToast(`Failed to delete asset category: ${err.message}`, "error");
    }
  };

  // Calculate live machine mappings
  const totalAssetsCount = assets.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Asset Categories & Machine Types Master
            </h1>
            <Badge variant="cyan">{assetTypes.length} CATEGORIES</Badge>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
            Standard machinery taxonomy & equipment classifications used across Factory Assets & Maintenance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Asset Type
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Total Machine Categories"
          value={assetTypes.length.toString()}
          unit="Taxonomies"
          icon={Cpu}
          colorVariant="cyan"
        />
        <StatCard
          title="Commissioned Machine Assets"
          value={totalAssetsCount.toString()}
          unit="Machinery in Plant"
          icon={Wrench}
          colorVariant="emerald"
        />
        <StatCard
          title="Database Status"
          value="Live Sync"
          unit="public.asset_types"
          icon={ShieldCheck}
          colorVariant="amber"
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
              placeholder="Search category name, code, or description..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Type Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Category / Type Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Description</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Created Date</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No asset categories found in database. Click "+ Add Asset Type" to register equipment types.
                  </td>
                </tr>
              ) : (
                filteredTypes.map((t) => {
                  const code = t.code || t.typeCode || "N/A";
                  const createdDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Active";
                  return (
                    <tr key={t.id || t.code || t.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {code}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Cpu size={14} color="#B27E33" />
                          <span>{t.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)", maxWidth: "300px" }}>
                        {t.description || "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                        {createdDate}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setViewingType(t)}
                            title="View Category Details"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#0284C7",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingType({ ...t })}
                            title="Edit Category"
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
                            onClick={() => handleDelete(t.id || t.code, t.name)}
                            title="Delete Category"
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

      {/* ADD ASSET TYPE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Machine / Asset Category
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Category Code</label>
                  <input
                    type="text"
                    placeholder="e.g. EQ-01"
                    value={newType.code}
                    onChange={(e) => setNewType({ ...newType, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Category / Type Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meat Processing Machine"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Describe the machinery type, applications, or functional characteristics..."
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", height: "auto", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save to Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ASSET TYPE MODAL */}
      {editingType && (
        <div className="modal-backdrop" onClick={() => setEditingType(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Machine Category
                </h2>
              </div>
              <button onClick={() => setEditingType(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Category Code</label>
                  <input
                    type="text"
                    value={editingType.code || ""}
                    onChange={(e) => setEditingType({ ...editingType, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editingType.name || ""}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  value={editingType.description || ""}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", height: "auto", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingType(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ASSET TYPE DETAILS MODAL */}
      {viewingType && (
        <div className="modal-backdrop" onClick={() => setViewingType(null)}>
          <div className="modal-content" style={{ maxWidth: "460px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Category Specifications
                </h2>
              </div>
              <button onClick={() => setViewingType(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Category Name</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{viewingType.name}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Type Code</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#8C5B23", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                    {viewingType.code || "—"}
                  </div>
                </div>

                <div style={{ padding: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Database ID</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                    {viewingType.id || "UUID"}
                  </div>
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Description</div>
                <div style={{ fontSize: "12px", color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.5 }}>
                  {viewingType.description || "No description provided."}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
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

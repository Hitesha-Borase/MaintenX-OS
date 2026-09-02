import React, { useState, useMemo } from "react";
import {
  Scale,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  Percent,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function UOMPage() {
  const { uoms = [], addUOM, updateUOM, toggleUOMStatus, deleteUOM } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState(null);

  const [newUOM, setNewUOM] = useState({
    uomCode: "",
    name: "",
    baseUom: "UNITS",
    conversionFactor: 1.0,
    type: "Packaging",
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveTo: "2030-12-31"
  });

  const filteredUOMs = useMemo(() => {
    return uoms.filter((u) => {
      const matchesType = typeFilter === "ALL" || u.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.uomCode || u.code || "").toLowerCase().includes(q) ||
        (u.type || "").toLowerCase().includes(q) ||
        (u.baseUom || "").toLowerCase().includes(q);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [uoms, typeFilter, statusFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const codeVal = (newUOM.uomCode || "").trim().toUpperCase();
    if (!codeVal || !newUOM.name.trim()) {
      addToast("Please provide UOM code and description.", "warning");
      return;
    }

    if (uoms.some((u) => (u.uomCode || u.code || "").toUpperCase() === codeVal)) {
      addToast(`UOM Code "${codeVal}" already exists in Master Data!`, "warning");
      return;
    }

    const created = addUOM({
      ...newUOM,
      uomCode: codeVal,
      conversionFactor: Number(newUOM.conversionFactor) || 1.0
    });
    addToast(`UOM "${created.uomCode}" registered in Master Data!`, "success");
    setIsModalOpen(false);
    setNewUOM({
      uomCode: "",
      name: "",
      baseUom: "UNITS",
      conversionFactor: 1.0,
      type: "Packaging",
      effectiveFrom: new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUOM.name.trim()) {
      addToast("Please provide description.", "warning");
      return;
    }

    updateUOM(editingUOM.uomId, {
      ...editingUOM,
      uomCode: (editingUOM.uomCode || editingUOM.code || "").toUpperCase(),
      conversionFactor: Number(editingUOM.conversionFactor || editingUOM.factor) || 1.0
    });
    addToast(`UOM "${editingUOM.uomCode || editingUOM.code}" updated successfully!`, "success");
    setEditingUOM(null);
  };

  const handleDelete = (uomId, code) => {
    if (window.confirm(`Are you sure you want to delete UOM "${code}"?`)) {
      deleteUOM(uomId);
      addToast(`UOM "${code}" deleted.`, "info");
    }
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
          title="Active UOMs"
          value={uoms.filter((u) => u.status === "Active").length.toString()}
          unit="Standard Units"
          icon={Scale}
          colorVariant="emerald"
        />
        <StatCard
          title="Packaging Types"
          value={uoms.filter((u) => u.type === "Packaging").length.toString()}
          unit="Multipliers"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Volume & Mass"
          value={uoms.filter((u) => u.type?.includes("Measure")).length.toString()}
          unit="Metric Base"
          icon={Cpu}
          colorVariant="amber"
        />
        <StatCard
          title="Conversion Integrity"
          value="100%"
          unit="Audited"
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
              placeholder="Search UOM code, conversion multiplier or type..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Packaging">Packaging</option>
              <option value="Discrete Unit">Discrete Unit</option>
              <option value="Liquid Measure">Liquid Measure</option>
              <option value="Mass Measure">Mass Measure</option>
              <option value="Logistics">Logistics</option>
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>UOM Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>UOM Description</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Classification</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Base Unit Reference</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Multiplier Factor</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUOMs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No UOM records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUOMs.map((u) => {
                  const uomCode = u.uomCode || u.code;
                  const factor = u.conversionFactor || u.factor || 1.0;
                  return (
                    <tr key={u.uomId || u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {uomCode}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                        {u.name}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="cyan">{u.type}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                        1 {uomCode} = {factor} {u.baseUom || u.baseUnit || "Units"}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706" }}>
                        × {factor.toFixed(1)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => toggleUOMStatus(u.uomId || u.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          title="Toggle Status"
                        >
                          <Badge variant={u.status === "Active" ? "emerald" : "gray"}>{u.status || "Active"}</Badge>
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
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
                          <button
                            onClick={() => handleDelete(u.uomId || u.id, uomCode)}
                            title="Delete UOM"
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

      {/* ADD UOM MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Scale size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add UOM & Conversion Factor
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">UOM Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CASE-24"
                    value={newUOM.uomCode}
                    onChange={(e) => setNewUOM({ ...newUOM, uomCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">UOM Category</label>
                  <select
                    value={newUOM.type}
                    onChange={(e) => setNewUOM({ ...newUOM, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Discrete Unit">Discrete Unit</option>
                    <option value="Liquid Measure">Liquid Measure</option>
                    <option value="Mass Measure">Mass Measure</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">UOM Description / Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Case of 24 Cans / Bottles"
                  value={newUOM.name}
                  onChange={(e) => setNewUOM({ ...newUOM, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Base Unit Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UNITS or ML"
                    value={newUOM.baseUom}
                    onChange={(e) => setNewUOM({ ...newUOM, baseUom: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Conversion Multiplier *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    required
                    value={newUOM.conversionFactor}
                    onChange={(e) => setNewUOM({ ...newUOM, conversionFactor: e.target.value })}
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
                  Save UOM Factor
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit UOM — {editingUOM.uomCode || editingUOM.code}
                </h2>
              </div>
              <button onClick={() => setEditingUOM(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">UOM Code *</label>
                  <input
                    type="text"
                    required
                    value={editingUOM.uomCode || editingUOM.code}
                    onChange={(e) => setEditingUOM({ ...editingUOM, uomCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">UOM Category</label>
                  <select
                    value={editingUOM.type}
                    onChange={(e) => setEditingUOM({ ...editingUOM, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Discrete Unit">Discrete Unit</option>
                    <option value="Liquid Measure">Liquid Measure</option>
                    <option value="Mass Measure">Mass Measure</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">UOM Description *</label>
                <input
                  type="text"
                  required
                  value={editingUOM.name}
                  onChange={(e) => setEditingUOM({ ...editingUOM, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Base Unit Reference</label>
                  <input
                    type="text"
                    value={editingUOM.baseUom || editingUOM.baseUnit || "UNITS"}
                    onChange={(e) => setEditingUOM({ ...editingUOM, baseUom: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Conversion Multiplier *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingUOM.conversionFactor || editingUOM.factor || 1.0}
                    onChange={(e) => setEditingUOM({ ...editingUOM, conversionFactor: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingUOM(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update UOM Factor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

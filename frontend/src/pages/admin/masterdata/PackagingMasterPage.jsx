import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Layers,
  Truck,
  DollarSign,
  ShieldCheck,
  Boxes,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function PackagingMasterPage() {
  const { packConfigs = [], addPackConfig, updatePackConfig, deletePackConfig, skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [skuFilter, setSkuFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  const finishedSkus = useMemo(() => skus.filter((s) => s.category === "Finished Goods"), [skus]);

  const [newPkg, setNewPkg] = useState({
    packCode: "",
    skuId: finishedSkus[0]?.skuId || "SKU-001",
    unitsPerPack: 24,
    packType: "Corrugated Tray & Shrink Wrap",
    packagingUom: "CASE-24",
    caseConfiguration: "4x6 Units (24 Count)",
    palletConfiguration: "60 Cases / 1,440 Units per Pallet",
    tareWeightKg: 12.5
  });

  const filteredPkg = useMemo(() => {
    return packConfigs.filter((p) => {
      const matchesSku = skuFilter === "ALL" || p.skuId === skuFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.packCode || "").toLowerCase().includes(q) ||
        (p.skuName || "").toLowerCase().includes(q) ||
        (p.skuCode || "").toLowerCase().includes(q) ||
        (p.packType || "").toLowerCase().includes(q);

      return matchesSku && matchesSearch;
    });
  }, [packConfigs, skuFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => s.skuId === newPkg.skuId);
    if (!selSku) {
      addToast("Please select a valid SKU.", "warning");
      return;
    }

    const created = addPackConfig({
      ...newPkg,
      skuCode: selSku.skuCode,
      skuName: selSku.name,
      unitsPerPack: Number(newPkg.unitsPerPack) || 24,
      tareWeightKg: Number(newPkg.tareWeightKg) || 12.0
    });

    addToast(`Pack configuration "${created.packCode}" created!`, "success");
    setIsModalOpen(false);
    setNewPkg({
      packCode: "",
      skuId: finishedSkus[0]?.skuId || "SKU-001",
      unitsPerPack: 24,
      packType: "Corrugated Tray & Shrink Wrap",
      packagingUom: "CASE-24",
      caseConfiguration: "4x6 Units (24 Count)",
      palletConfiguration: "60 Cases / 1,440 Units per Pallet",
      tareWeightKg: 12.5
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => s.skuId === editingPkg.skuId);
    updatePackConfig(editingPkg.packConfigId, {
      ...editingPkg,
      skuCode: selSku ? selSku.skuCode : editingPkg.skuCode,
      skuName: selSku ? selSku.name : editingPkg.skuName,
      unitsPerPack: Number(editingPkg.unitsPerPack) || 24
    });
    addToast(`Pack Configuration "${editingPkg.packCode}" updated successfully!`, "success");
    setEditingPkg(null);
  };

  const handleDelete = (packConfigId, code) => {
    if (window.confirm(`Are you sure you want to delete Pack Configuration "${code}"?`)) {
      deletePackConfig(packConfigId);
      addToast(`Pack Configuration "${code}" deleted.`, "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Pack Configurations & Case Master
            </h1>
            <Badge variant="cyan">{packConfigs.length} PACK CONFIGURATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Pack Config
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
          title="Active Pack Configurations"
          value={packConfigs.length.toString()}
          unit="Configurations"
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="SKUs Covered"
          value={new Set(packConfigs.map((p) => p.skuId)).size.toString()}
          unit="Finished SKUs"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Pallet Multipliers"
          value="100%"
          unit="Standardized"
          icon={Truck}
          colorVariant="amber"
        />
        <StatCard
          title="Secondary Packaging"
          value="Audited"
          unit="GMP Compliant"
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
              placeholder="Search by pack code, SKU or box type..."
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
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Associated SKUs</option>
              {finishedSkus.map((s) => (
                <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Pack Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Associated Master SKU</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Units / Pack</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Packaging Type</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Pallet Config</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPkg.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No pack configurations found matching filters.
                  </td>
                </tr>
              ) : (
                filteredPkg.map((p) => (
                  <tr key={p.packConfigId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {p.packCode}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.skuName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.skuCode}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                      {p.unitsPerPack} Units
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div>{p.packType}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.caseConfiguration}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B5B4E" }}>
                      {p.palletConfiguration}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{p.status}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setEditingPkg({ ...p })}
                          title="Edit Pack Configuration"
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
                          onClick={() => handleDelete(p.packConfigId, p.packCode)}
                          title="Delete Pack Configuration"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD PACK CONFIG MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Pack Configuration
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Pack Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PCK-5001-24"
                    value={newPkg.packCode}
                    onChange={(e) => setNewPkg({ ...newPkg, packCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Finished SKU Reference *</label>
                  <select
                    value={newPkg.skuId}
                    onChange={(e) => setNewPkg({ ...newPkg, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Units per Pack *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPkg.unitsPerPack}
                    onChange={(e) => setNewPkg({ ...newPkg, unitsPerPack: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Pack Format Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Corrugated Tray & Shrink Wrap"
                    value={newPkg.packType}
                    onChange={(e) => setNewPkg({ ...newPkg, packType: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Case Matrix Description</label>
                <input
                  type="text"
                  placeholder="e.g. 4x6 Units (24 Count)"
                  value={newPkg.caseConfiguration}
                  onChange={(e) => setNewPkg({ ...newPkg, caseConfiguration: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Pallet Configuration</label>
                <input
                  type="text"
                  placeholder="e.g. 60 Cases / 1,440 Units per Pallet"
                  value={newPkg.palletConfiguration}
                  onChange={(e) => setNewPkg({ ...newPkg, palletConfiguration: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Configuration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PACK CONFIG MODAL */}
      {editingPkg && (
        <div className="modal-backdrop" onClick={() => setEditingPkg(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Pack Configuration — {editingPkg.packCode}
                </h2>
              </div>
              <button onClick={() => setEditingPkg(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Pack Code *</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.packCode}
                    onChange={(e) => setEditingPkg({ ...editingPkg, packCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Units per Pack *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingPkg.unitsPerPack}
                    onChange={(e) => setEditingPkg({ ...editingPkg, unitsPerPack: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Pack Format Type</label>
                <input
                  type="text"
                  value={editingPkg.packType}
                  onChange={(e) => setEditingPkg({ ...editingPkg, packType: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Pallet Configuration</label>
                <input
                  type="text"
                  value={editingPkg.palletConfiguration}
                  onChange={(e) => setEditingPkg({ ...editingPkg, palletConfiguration: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingPkg(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Configuration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

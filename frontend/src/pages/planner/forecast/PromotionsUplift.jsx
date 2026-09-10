import React, { useState, useEffect, useMemo } from "react";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import planningService from "../../../services/planningService";
import {
  Tag,
  Plus,
  Search,
  X,
  Calendar,
  Layers,
  TrendingUp,
  Percent,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Database,
  Pencil
} from "lucide-react";

export function PromotionsUplift() {
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();

  const availableSkus = useMemo(() => {
    const fg = skus.filter((s) => s.category === "Finished Goods" || s.category === "FINISHED_GOODS");
    return fg.length > 0 ? fg : skus;
  }, [skus]);

  const defaultSku = availableSkus[0] || {
    id: "SKU-001",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    uom: "Bottles"
  };

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: "",
    skuId: defaultSku.id || defaultSku.skuId,
    upliftPercent: 10,
    duration: "2026-09-15 to 2026-09-30",
    channel: "Retail Endcap"
  });

  const [editingPromo, setEditingPromo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const res = await planningService.getPromotions();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setPromos(list);
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    if (availableSkus.length > 0 && !newPromo.skuId) {
      setNewPromo(prev => ({
        ...prev,
        skuId: availableSkus[0].id || availableSkus[0].skuId
      }));
    }
  }, [availableSkus]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPromo.name.trim()) {
      addToast("Please provide promotion title.", "warning");
      return;
    }

    const targetSku = skus.find((s) => (s.id || s.skuId) === newPromo.skuId) || defaultSku;
    const baseEst = 40000;
    const inc = Math.round(baseEst * (Number(newPromo.upliftPercent) / 100));

    try {
      setIsSubmitting(true);
      const payload = {
        name: newPromo.name.trim(),
        skuId: targetSku.id || targetSku.skuId,
        upliftPercent: Number(newPromo.upliftPercent),
        incrementalUnits: inc,
        duration: newPromo.duration,
        channel: newPromo.channel,
        status: "SCHEDULED"
      };

      const res = await planningService.createPromotion(payload);
      if (res) {
        addToast(`Promotion "${newPromo.name.trim()}" registered in database!`, "success");
        await loadPromotions();
        setIsModalOpen(false);
        setNewPromo({
          name: "",
          skuId: targetSku.id || targetSku.skuId,
          upliftPercent: 10,
          duration: "2026-09-15 to 2026-09-30",
          channel: "Retail Endcap"
        });
      }
    } catch (err) {
      console.error("Failed to save promotion:", err);
      addToast("Failed to save promotion campaign.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete promotion campaign "${name}"?`)) return;
    try {
      await planningService.deletePromotion(id);
      addToast(`Promotion "${name}" deleted from database.`, "success");
      await loadPromotions();
    } catch (err) {
      console.error("Failed to delete promotion:", err);
      addToast("Failed to delete promotion.", "error");
    }
  };

  const handleOpenEdit = (promo) => {
    setEditingPromo({
      id: promo.id,
      name: promo.name,
      skuId: promo.skuId,
      upliftPercent: promo.upliftPercent,
      incrementalUnits: promo.incrementalUnits,
      duration: promo.duration,
      channel: promo.channel,
      status: promo.status ? promo.status.toUpperCase() : "SCHEDULED",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingPromo.name.trim()) {
      addToast("Please provide promotion title.", "warning");
      return;
    }

    try {
      setIsUpdating(true);
      const baseEst = 40000;
      const inc = Math.round(baseEst * (Number(editingPromo.upliftPercent) / 100));

      const payload = {
        name: editingPromo.name.trim(),
        skuId: editingPromo.skuId,
        upliftPercent: Number(editingPromo.upliftPercent),
        incrementalUnits: inc,
        duration: editingPromo.duration,
        channel: editingPromo.channel,
        status: editingPromo.status,
      };

      await planningService.updatePromotion(editingPromo.id, payload);
      addToast(`Promotion "${editingPromo.name.trim()}" updated successfully in database!`, "success");
      setIsEditModalOpen(false);
      setEditingPromo(null);
      await loadPromotions();
    } catch (err) {
      console.error("Failed to update promotion:", err);
      addToast("Failed to update promotion in database.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const totalIncremental = promos.reduce((sum, p) => sum + (Number(p.incrementalUnits) || 0), 0);
  const avgUplift = promos.length > 0
    ? (promos.reduce((sum, p) => sum + (Number(p.upliftPercent) || 0), 0) / promos.length).toFixed(1)
    : "0";
  const uniqueSkusCount = new Set(promos.map(p => p.skuId)).size;


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Commercial Promotions & Demand Uplift Events
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={loadPromotions} disabled={loading} style={{ fontSize: "12px", padding: "7px 12px" }}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Promo Campaign
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Campaigns"
          value={promos.length.toString()}
          unit="Promotions in DB"
          icon={Database}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Incremental Lift"
          value={totalIncremental.toLocaleString()}
          unit="Extra Units Forecasted"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Average Uplift Rate"
          value={`+${avgUplift}%`}
          unit="Above Statistical Baseline"
          icon={Percent}
          colorVariant="amber"
        />
        <StatCard
          title="Promoted Master SKUs"
          value={`${uniqueSkusCount} Products`}
          unit="Featured Lines"
          icon={Layers}
          colorVariant="emerald"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px" }}>
            <thead>
              <tr>
                <th>Promotion Title</th>
                <th>Target Master SKU</th>
                <th>Demand Uplift (%)</th>
                <th>Projected Incremental Qty</th>
                <th>Event Horizon</th>
                <th>Channel / Medium</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && promos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading promotion campaigns from database...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No promotion campaigns found in database. Click "+ Add Promo Campaign" above to create one.
                  </td>
                </tr>
              ) : (
                promos.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {p.id}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{p.productName}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {p.productCode}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge variant="emerald">+{p.upliftPercent}% Uplift</Badge>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#059669" }}>
                        +{Number(p.incrementalUnits).toLocaleString()} Units
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span>{p.duration}</span>
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{p.channel}</span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge variant={p.status === "Active" || p.status === "ACTIVE" ? "emerald" : "cyan"}>{p.status}</Badge>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Promotion in Database"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            padding: "4px 6px",
                            borderRadius: "4px",
                            transition: "color 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Delete Promotion from Database"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "4px 6px",
                            borderRadius: "4px",
                            transition: "color 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                          <Trash2 size={15} />
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

      {/* ADD PROMO MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Register Commercial Promotional Event
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Promotion / Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Costco Holiday Pallet Drop"
                  value={newPromo.name}
                  onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Master SKU Selection *</label>
                <select
                  value={newPromo.skuId}
                  onChange={(e) => setNewPromo({ ...newPromo, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.id || s.skuId} value={s.id || s.skuId}>
                      {s.skuCode || s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Demand Uplift (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={newPromo.upliftPercent}
                    onChange={(e) => setNewPromo({ ...newPromo, upliftPercent: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Retail Channel / Format</label>
                  <input
                    type="text"
                    value={newPromo.channel}
                    onChange={(e) => setNewPromo({ ...newPromo, channel: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Promotion Active Horizon</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-10-01 to 2026-10-15"
                  value={newPromo.duration}
                  onChange={(e) => setNewPromo({ ...newPromo, duration: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Promo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROMO MODAL */}
      {isEditModalOpen && editingPromo && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} color="#2563EB" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Promotion Campaign
                </h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Promotion / Event Name *</label>
                <input
                  type="text"
                  required
                  value={editingPromo.name}
                  onChange={(e) => setEditingPromo({ ...editingPromo, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Master SKU Selection *</label>
                <select
                  value={editingPromo.skuId}
                  onChange={(e) => setEditingPromo({ ...editingPromo, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.id || s.skuId} value={s.id || s.skuId}>
                      {s.skuCode || s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Demand Uplift (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={editingPromo.upliftPercent}
                    onChange={(e) => setEditingPromo({ ...editingPromo, upliftPercent: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Campaign Status</label>
                  <select
                    value={editingPromo.status}
                    onChange={(e) => setEditingPromo({ ...editingPromo, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Retail Channel / Format</label>
                <input
                  type="text"
                  value={editingPromo.channel}
                  onChange={(e) => setEditingPromo({ ...editingPromo, channel: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Promotion Active Horizon</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-10-01 to 2026-10-15"
                  value={editingPromo.duration}
                  onChange={(e) => setEditingPromo({ ...editingPromo, duration: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={CheckCircle2} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Update Promo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

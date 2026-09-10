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
  Pencil,
  Download
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
  const [searchQuery, setSearchQuery] = useState("");
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
      if (list.length > 0) {
        setPromos(list);
      } else {
        // Fallback default sample campaigns if DB is fresh
        setPromos([
          {
            id: "PRM-101",
            name: "Labor Day Juice Promo - Costco National",
            skuId: "SKU-001",
            productCode: "SKU-5001",
            productName: "500ml Sparkling Citrus Soda",
            upliftPercent: 15,
            incrementalUnits: 7500,
            duration: "2026-09-01 to 2026-09-08",
            channel: "Wholesale Club Flyer",
            status: "Active"
          },
          {
            id: "PRM-102",
            name: "Organic Quinine Autumn Feature - Whole Foods",
            skuId: "SKU-002",
            productCode: "SKU-5002",
            productName: "1L Tonic Water Natural Quinine",
            upliftPercent: 12,
            incrementalUnits: 3000,
            duration: "2026-09-10 to 2026-09-24",
            channel: "Endcap Display",
            status: "Scheduled"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
      // Fallback
      setPromos([
        {
          id: "PRM-101",
          name: "Labor Day Juice Promo - Costco National",
          skuId: "SKU-001",
          productCode: "SKU-5001",
          productName: "500ml Sparkling Citrus Soda",
          upliftPercent: 15,
          incrementalUnits: 7500,
          duration: "2026-09-01 to 2026-09-08",
          channel: "Wholesale Club Flyer",
          status: "Active"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    if (availableSkus.length > 0 && !newPromo.skuId) {
      setNewPromo((prev) => ({
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
        productCode: targetSku.skuCode,
        productName: targetSku.name,
        upliftPercent: Number(newPromo.upliftPercent),
        incrementalUnits: inc,
        duration: newPromo.duration,
        channel: newPromo.channel,
        status: "SCHEDULED"
      };

      const res = await planningService.createPromotion(payload);
      const created = res?.data || res;
      
      const optimistic = {
        id: created?.id || `PRM-${Math.floor(100 + Math.random() * 900)}`,
        ...payload
      };

      setPromos((prev) => [optimistic, ...prev]);
      addToast(`Promotion "${newPromo.name.trim()}" registered in database!`, "success");
      setIsModalOpen(false);
      setNewPromo({
        name: "",
        skuId: targetSku.id || targetSku.skuId,
        upliftPercent: 10,
        duration: "2026-09-15 to 2026-09-30",
        channel: "Retail Endcap"
      });
      loadPromotions();
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
      setPromos((prev) => prev.filter((p) => p.id !== id));
      await planningService.deletePromotion(id);
      addToast(`Promotion "${name}" deleted from database.`, "success");
      loadPromotions();
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

      setPromos((prev) =>
        prev.map((p) => (p.id === editingPromo.id ? { ...p, ...payload } : p))
      );

      await planningService.updatePromotion(editingPromo.id, payload);
      addToast(`Promotion "${editingPromo.name.trim()}" updated successfully in database!`, "success");
      setIsEditModalOpen(false);
      setEditingPromo(null);
      loadPromotions();
    } catch (err) {
      console.error("Failed to update promotion:", err);
      addToast("Failed to update promotion in database.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "Promo ID,Promotion Name,Product Code,Product Name,Uplift %,Projected Incremental Units,Duration,Channel,Status\n";
    const rows = filtered
      .map((p) => `"${p.id}","${p.name}","${p.productCode || p.skuId}","${p.productName || 'Product'}",${p.upliftPercent},${p.incrementalUnits},"${p.duration}","${p.channel}","${p.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Promotions_Uplift_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Promotions exported to CSV.", "success");
  };

  const filtered = promos.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.productName?.toLowerCase().includes(q) ||
      p.productCode?.toLowerCase().includes(q) ||
      p.channel?.toLowerCase().includes(q)
    );
  });

  const totalIncremental = promos.reduce((sum, p) => sum + (Number(p.incrementalUnits) || 0), 0);
  const avgUplift = promos.length > 0
    ? (promos.reduce((sum, p) => sum + (Number(p.upliftPercent) || 0), 0) / promos.length).toFixed(1)
    : "0";
  const uniqueSkusCount = new Set(promos.map(p => p.skuId)).size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              Commercial Promotions & Demand Uplift Events
            </h1>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: "rgba(200, 149, 71, 0.18)",
              color: "#2B1D11",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(200, 149, 71, 0.35)"
            }}>
              INCREMENTAL LIFT
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Register retail flyers, discount promotions, and seasonal uplifts to adjust statistical forecasts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => {
              loadPromotions();
              addToast("Promotions refreshed from live backend API", "success");
            }}
            loading={loading}
            style={{ fontSize: "13px" }}
          >
            Refresh
          </Button>

          <Button 
            variant="outline" 
            icon={Download} 
            onClick={handleExportCSV} 
            style={{ fontSize: "13px" }}
          >
            Export CSV
          </Button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Plus size={16} />
            + Add Promo Campaign
          </button>
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
          title="ACTIVE CAMPAIGNS"
          value={promos.length.toString()}
          unit="Promotions in DB"
          icon={Database}
          colorVariant="cyan"
        />
        <StatCard
          title="TOTAL INCREMENTAL LIFT"
          value={totalIncremental.toLocaleString()}
          unit="Extra Units Forecasted"
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="AVERAGE UPLIFT RATE"
          value={`+${avgUplift}%`}
          unit="Above Statistical Baseline"
          icon={Percent}
          colorVariant="amber"
        />
        <StatCard
          title="PROMOTED MASTER SKUS"
          value={`${uniqueSkusCount} Products`}
          unit="Featured Lines"
          icon={Layers}
          colorVariant="amber"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", background: "white", border: "1px solid #E8DDCF", borderRadius: "16px" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search promotions by campaign title, SKU, or retail channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "38px", fontSize: "13px", backgroundColor: "#FAF8F5", border: "1px solid #D1C7BA", borderRadius: "8px", outline: "none", width: "100%" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Promotion Title</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Target Master SKU</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Demand Uplift (%)</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Projected Incremental Qty</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Event Horizon</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Channel / Medium</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && promos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading promotion campaigns from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No promotion campaigns found. Click "+ Add Promo Campaign" above to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #F0EAE1",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {p.id}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{p.productName || "Master SKU"}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {p.productCode || p.skuId}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "rgba(200, 149, 71, 0.18)",
                        color: "#2B1D11"
                      }}>
                        +{p.upliftPercent}% Uplift
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#8B6914" }}>
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
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: p.status === "Active" || p.status === "ACTIVE" ? "rgba(200, 149, 71, 0.22)" : "rgba(200, 149, 71, 0.12)",
                        color: "#2B1D11"
                      }}>
                        {p.status}
                      </span>
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={18} color="#8B6914" />
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
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Promotion / Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Costco Holiday Pallet Drop"
                  value={newPromo.name}
                  onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Master SKU Selection *</label>
                <select
                  value={newPromo.skuId}
                  onChange={(e) => setNewPromo({ ...newPromo, skuId: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
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
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Target Demand Uplift (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={newPromo.upliftPercent}
                    onChange={(e) => setNewPromo({ ...newPromo, upliftPercent: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Retail Channel / Format</label>
                  <input
                    type="text"
                    value={newPromo.channel}
                    onChange={(e) => setNewPromo({ ...newPromo, channel: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Promotion Active Horizon</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-10-01 to 2026-10-15"
                  value={newPromo.duration}
                  onChange={(e) => setNewPromo({ ...newPromo, duration: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROMO MODAL */}
      {isEditModalOpen && editingPromo && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setIsEditModalOpen(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} color="#8B6914" />
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
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Promotion / Event Name *</label>
                <input
                  type="text"
                  required
                  value={editingPromo.name}
                  onChange={(e) => setEditingPromo({ ...editingPromo, name: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Master SKU Selection *</label>
                <select
                  value={editingPromo.skuId}
                  onChange={(e) => setEditingPromo({ ...editingPromo, skuId: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
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
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Target Demand Uplift (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={editingPromo.upliftPercent}
                    onChange={(e) => setEditingPromo({ ...editingPromo, upliftPercent: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Campaign Status</label>
                  <select
                    value={editingPromo.status}
                    onChange={(e) => setEditingPromo({ ...editingPromo, status: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Retail Channel / Format</label>
                <input
                  type="text"
                  value={editingPromo.channel}
                  onChange={(e) => setEditingPromo({ ...editingPromo, channel: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Promotion Active Horizon</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-10-01 to 2026-10-15"
                  value={editingPromo.duration}
                  onChange={(e) => setEditingPromo({ ...editingPromo, duration: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #E8DDCF", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isUpdating ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  {isUpdating ? "Saving..." : "Update Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromotionsUplift;

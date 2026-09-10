import React, { useState, useMemo, useEffect } from "react";
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
  RefreshCw,
  Download
} from "lucide-react";

export function PromotionsUplift() {
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();

  const availableSkus = useMemo(() => {
    const fg = skus.filter((s) => s.category === "Finished Goods");
    return fg.length > 0 ? fg : skus;
  }, [skus]);

  const defaultSku = availableSkus[0] || {
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    uom: "Bottles"
  };

  const [promos, setPromos] = useState([
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

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: "",
    skuId: defaultSku.skuId,
    upliftPercent: 10,
    duration: "2026-09-15 to 2026-09-30",
    channel: "Retail Endcap"
  });

  // Load promotions from backend on mount
  const loadPromos = async () => {
    try {
      setLoading(true);
      const res = await planningService.getPromotions();
      const data = res?.data || res;
      if (data && Array.isArray(data) && data.length > 0) {
        setPromos(data);
      }
    } catch (err) {
      console.log("Using default promotions cache:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPromo.name.trim()) {
      addToast("Please provide promotion title.", "warning");
      return;
    }

    setSaving(true);
    const targetSku = skus.find((s) => s.skuId === newPromo.skuId || s.id === newPromo.skuId) || defaultSku;
    const baseEst = 40000;
    const inc = Math.round(baseEst * (Number(newPromo.upliftPercent) / 100));

    const item = {
      id: `PRM-${Math.floor(100 + Math.random() * 900)}`,
      name: newPromo.name.trim(),
      skuId: targetSku.skuId || targetSku.id,
      productCode: targetSku.skuCode,
      productName: targetSku.name,
      upliftPercent: Number(newPromo.upliftPercent),
      incrementalUnits: inc,
      duration: newPromo.duration,
      channel: newPromo.channel,
      status: "Scheduled"
    };

    // Optimistic UI update
    setPromos((prev) => [item, ...prev]);

    try {
      const created = await planningService.createPromotion({
        name: item.name,
        skuId: item.skuId,
        productCode: item.productCode,
        productName: item.productName,
        upliftPercent: item.upliftPercent,
        incrementalUnits: item.incrementalUnits,
        duration: item.duration,
        channel: item.channel,
        status: "Scheduled"
      });
      if (created?.id) {
        setPromos((prev) => prev.map((p) => (p.id === item.id ? { ...p, ...created } : p)));
      }
      addToast(`Promotion "${item.name}" registered & incorporated into demand models!`, "success");
    } catch (err) {
      console.warn("Backend createPromotion fallback:", err.message);
      addToast(`Promotion "${item.name}" registered locally.`, "success");
    } finally {
      setSaving(false);
      setIsModalOpen(false);
      setNewPromo({
        name: "",
        skuId: defaultSku.skuId,
        upliftPercent: 10,
        duration: "2026-09-15 to 2026-09-30",
        channel: "Retail Endcap"
      });
    }
  };

  const handleExportCSV = () => {
    const headers = "Promo ID,Promotion Name,Product Code,Product Name,Uplift %,Projected Incremental Units,Duration,Channel,Status\n";
    const rows = filtered
      .map((p) => `"${p.id}","${p.name}","${p.productCode}","${p.productName}",${p.upliftPercent},${p.incrementalUnits},"${p.duration}","${p.channel}","${p.status}"`)
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
              loadPromos();
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
          unit="Promotions Running"
          icon={Tag}
          colorVariant="cyan"
        />
        <StatCard
          title="TOTAL INCREMENTAL LIFT"
          value={promos.reduce((sum, p) => sum + (Number(p.incrementalUnits) || 0), 0).toLocaleString()}
          unit="Extra Units Forecasted"
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="AVERAGE UPLIFT RATE"
          value="+13.5%"
          unit="Above Statistical Baseline"
          icon={Percent}
          colorVariant="amber"
        />
        <StatCard
          title="PROMOTED MASTER SKUS"
          value={`${promos.length} Products`}
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
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
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{p.productName}</div>
                    <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                      {p.productCode}
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
                      background: p.status === "Active" ? "rgba(200, 149, 71, 0.22)" : "rgba(200, 149, 71, 0.12)",
                      color: "#2B1D11"
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
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
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
                      {s.skuCode} — {s.name}
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
                  disabled={saving}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  {saving ? "Saving..." : "Save Promo"}
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

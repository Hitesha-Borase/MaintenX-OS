import React, { useState, useMemo } from "react";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import {
  Tag,
  Plus,
  Search,
  X,
  Calendar,
  Layers,
  TrendingUp,
  Percent,
  CheckCircle2
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: "",
    skuId: defaultSku.skuId,
    upliftPercent: 10,
    duration: "2026-09-15 to 2026-09-30",
    channel: "Retail Endcap"
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPromo.name.trim()) {
      addToast("Please provide promotion title.", "warning");
      return;
    }

    const targetSku = skus.find((s) => s.skuId === newPromo.skuId) || defaultSku;
    const baseEst = 40000;
    const inc = Math.round(baseEst * (Number(newPromo.upliftPercent) / 100));

    const item = {
      id: `PRM-${Math.floor(100 + Math.random() * 900)}`,
      name: newPromo.name.trim(),
      skuId: targetSku.skuId,
      productCode: targetSku.skuCode,
      productName: targetSku.name,
      upliftPercent: Number(newPromo.upliftPercent),
      incrementalUnits: inc,
      duration: newPromo.duration,
      channel: newPromo.channel,
      status: "Scheduled"
    };

    setPromos((prev) => [item, ...prev]);
    addToast(`Promotion "${item.name}" registered and incorporated into demand models!`, "success");
    setIsModalOpen(false);
    setNewPromo({
      name: "",
      skuId: defaultSku.skuId,
      upliftPercent: 10,
      duration: "2026-09-15 to 2026-09-30",
      channel: "Retail Endcap"
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Commercial Promotions & Demand Uplift Events
          </h1>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
          + Add Promo Campaign
        </Button>
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
          unit="Promotions Running"
          icon={Tag}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Incremental Lift"
          value={promos.reduce((sum, p) => sum + p.incrementalUnits, 0).toLocaleString()}
          unit="Extra Units Forecasted"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Average Uplift Rate"
          value="+13.5%"
          unit="Above Statistical Baseline"
          icon={Percent}
          colorVariant="amber"
        />
        <StatCard
          title="Promoted Master SKUs"
          value="3 Products"
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
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
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
                      +{p.incrementalUnits.toLocaleString()} Units
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
                    <Badge variant={p.status === "Active" ? "emerald" : "cyan"}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
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
                    <option key={s.skuId} value={s.skuId}>
                      {s.skuCode} — {s.name}
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
                <Button variant="primary" type="submit" icon={Plus}>
                  Save Promo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

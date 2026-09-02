import React, { useState, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import {
  TrendingUp,
  Plus,
  Search,
  X,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Calendar,
  Layers,
  FileText,
  Sparkles
} from "lucide-react";

export function ForecastOverrides() {
  const { forecasts = [], addForecast, applyForecastOverride, approveForecast, rejectForecast } = usePlanning();
  const { skus = [], plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [overrideModalItem, setOverrideModalItem] = useState(null);
  const [overrideQty, setOverrideQty] = useState(5000);
  const [overrideReason, setOverrideReason] = useState("");

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

  const [newFc, setNewFc] = useState({
    period: "2026-W39 (Sep 22 - Sep 28)",
    skuId: defaultSku.skuId,
    plantId: "PLT-01",
    baselineForecast: 45000,
    historicalDemand: 42000,
    overrideQuantity: 0,
    method: "Historical Average + Promo Uplift",
    reason: "Q3 baseline run"
  });

  const resolvedNewSku = useMemo(() => {
    return skus.find((s) => s.skuId === newFc.skuId) || defaultSku;
  }, [skus, newFc.skuId, defaultSku]);

  // KPIs
  const totalForecasts = forecasts.length;
  const pendingApprovals = forecasts.filter((f) => f.status === "Submitted").length;
  const approvedForecasts = forecasts.filter((f) => f.status === "Approved").length;
  const totalVolume = forecasts.reduce((sum, f) => sum + (Number(f.finalForecast) || 0), 0);

  const filtered = useMemo(() => {
    return forecasts.filter((f) => {
      const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.period.toLowerCase().includes(q) ||
        f.productName.toLowerCase().includes(q) ||
        f.productCode.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [forecasts, statusFilter, searchQuery]);

  const handleCreateForecastSubmit = (e) => {
    e.preventDefault();
    if (!newFc.baselineForecast || Number(newFc.baselineForecast) <= 0) {
      addToast("Baseline forecast must be greater than 0.", "warning");
      return;
    }

    addForecast(newFc);
    addToast(`New forecast created for ${resolvedNewSku.name}!`, "success");
    setIsAddModalOpen(false);
  };

  const handleOpenOverrideModal = (item) => {
    setOverrideModalItem(item);
    setOverrideQty(item.overrideQuantity || 5000);
    setOverrideReason(item.reason || "");
  };

  const handleApplyOverrideSubmit = (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      addToast("A business justification reason is required for forecast overrides.", "warning");
      return;
    }

    applyForecastOverride(overrideModalItem.id, overrideQty, overrideReason);
    addToast(`Forecast override submitted for approval!`, "success");
    setOverrideModalItem(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Demand Forecasts & Manager Overrides
            </h1>
            <Badge variant="cyan">{pendingApprovals} PENDING APPROVAL</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Forecast Record
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
          title="Total Forecast Records"
          value={totalForecasts.toString()}
          unit="Period Horizons"
          icon={TrendingUp}
          colorVariant="cyan"
        />
        <StatCard
          title="Pending Approval"
          value={pendingApprovals.toString()}
          unit="Override Requests"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Approved Forecasts"
          value={approvedForecasts.toString()}
          unit="Committed to MRP"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Final Forecast"
          value={totalVolume.toLocaleString()}
          unit="Master Units"
          icon={Layers}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search forecast by period, product, code, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "Draft", "Submitted", "Approved", "Rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: statusFilter === st ? "#C89547" : "var(--bg-card-subtle)",
                  color: statusFilter === st ? "#261603" : "var(--text-secondary)",
                  border: statusFilter === st ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "950px" }}>
            <thead>
              <tr>
                <th>Period Horizon</th>
                <th>Master Product SKU</th>
                <th>Baseline</th>
                <th>Override</th>
                <th>Final Forecast</th>
                <th>Method / Model</th>
                <th>Owner & Justification</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{f.period}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {f.id}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{f.productName}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {f.productCode}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {Number(f.baselineForecast).toLocaleString()} {f.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                          color: f.overrideQuantity > 0 ? "#059669" : f.overrideQuantity < 0 ? "#DC2626" : "var(--text-muted)"
                        }}
                      >
                        {f.overrideQuantity > 0 ? `+${f.overrideQuantity.toLocaleString()}` : f.overrideQuantity || "0"} {f.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#8C5B23" }}>
                        {Number(f.finalForecast).toLocaleString()} {f.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{f.method}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Historical: {Number(f.historicalDemand).toLocaleString()}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{f.owner}</div>
                      {f.reason && <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "2px" }}>"{f.reason}"</div>}
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge
                        variant={
                          f.status === "Approved"
                            ? "emerald"
                            : f.status === "Submitted"
                            ? "amber"
                            : f.status === "Rejected"
                            ? "rose"
                            : "slate"
                        }
                      >
                        {f.status}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenOverrideModal(f)}
                          title="Apply Manual Override"
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Edit2 size={12} /> Override
                        </button>

                        {f.status === "Submitted" && (
                          <>
                            <button
                              onClick={() => {
                                approveForecast(f.id);
                                addToast(`Forecast for ${f.productName} Approved!`, "success");
                              }}
                              title="Approve Forecast"
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(5, 150, 105, 0.12)",
                                color: "#059669",
                                border: "1px solid rgba(5, 150, 105, 0.3)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <CheckCircle2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                rejectForecast(f.id, "Unjustified market forecast spike");
                                addToast(`Forecast for ${f.productName} Rejected.`, "info");
                              }}
                              title="Reject Forecast"
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(220, 38, 38, 0.12)",
                                color: "#DC2626",
                                border: "1px solid rgba(220, 38, 38, 0.3)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No forecast records match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE FORECAST MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Generate Statistical Demand Forecast
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateForecastSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Planning Period Horizon *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-W40 (Sep 29 - Oct 5)"
                    value={newFc.period}
                    onChange={(e) => setNewFc({ ...newFc, period: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Manufacturing Plant</label>
                  <select
                    value={newFc.plantId}
                    onChange={(e) => setNewFc({ ...newFc, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Master SKU Selection (Single Source of Truth) *</label>
                <select
                  value={newFc.skuId}
                  onChange={(e) => setNewFc({ ...newFc, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId} value={s.skuId}>
                      {s.skuCode} — {s.name} ({s.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Statistical Baseline Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newFc.baselineForecast}
                    onChange={(e) => setNewFc({ ...newFc, baselineForecast: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Modeling Method</label>
                  <select
                    value={newFc.method}
                    onChange={(e) => setNewFc({ ...newFc, method: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Historical Average + Promo Uplift">Historical Average + Promo Uplift</option>
                    <option value="Moving Average (4-Week)">Moving Average (4-Week)</option>
                    <option value="Trend Analysis">Trend Analysis</option>
                    <option value="Manual Entry">Manual Entry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Reason / Assumption Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Seasonal beverage demand projection."
                  value={newFc.reason}
                  onChange={(e) => setNewFc({ ...newFc, reason: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Generate Forecast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERRIDE MODAL */}
      {overrideModalItem && (
        <div className="modal-backdrop" onClick={() => setOverrideModalItem(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Apply Demand Override: {overrideModalItem.productName}
                </h2>
              </div>
              <button onClick={() => setOverrideModalItem(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyOverrideSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ backgroundColor: "rgba(200, 149, 71, 0.08)", border: "1px solid #C89547", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Current Baseline:</span>
                  <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{Number(overrideModalItem.baselineForecast).toLocaleString()} {overrideModalItem.uom}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Projected Final:</span>
                  <div style={{ fontWeight: 900, color: "#8C5B23" }}>
                    {(Number(overrideModalItem.baselineForecast) + Number(overrideQty)).toLocaleString()} {overrideModalItem.uom}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Override Adjustment Quantity (+ / - Units) *</label>
                <input
                  type="number"
                  required
                  value={overrideQty}
                  onChange={(e) => setOverrideQty(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Commercial / Promotional Justification *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this demand adjustment is necessary (e.g., promotional endcap rollout confirmed with key retailer)."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setOverrideModalItem(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Send}>
                  Submit Override for Sign-Off
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

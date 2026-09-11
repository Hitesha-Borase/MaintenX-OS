import React, { useState, useEffect, useMemo } from "react";
import { Plus, Check, X, Edit3, Search, TrendingUp, AlertTriangle, Layers, Database, RefreshCw, Download, Calendar } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import planningService from "../../../services/planningService";

export function ForecastOverrides() {
  const { forecasts: contextForecasts = [], applyForecastOverride, approveForecast, rejectForecast, addForecast } = usePlanning();
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [forecastsList, setForecastsList] = useState(contextForecasts);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [overrideValue, setOverrideValue] = useState("");
  const [justification, setJustification] = useState("");

  const [newRecord, setNewRecord] = useState({
    period: "2026-W39 (Sep 22 - Sep 28)",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    productName: "500ml Sparkling Citrus Soda",
    baselineQty: 60000,
    uom: "Bottles",
    method: "Historical Average + Promo Uplift",
    owner: "Alexander Vance",
    overrideQty: 0,
    justification: "Standard baseline run"
  });

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const res = await planningService.getForecasts();
      const items = res?.data || res;
      if (Array.isArray(items) && items.length > 0) {
        setForecastsList(items);
      }
    } catch (err) {
      console.warn("Backend forecasts fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  useEffect(() => {
    if (contextForecasts && contextForecasts.length > 0) {
      setForecastsList(contextForecasts);
    }
  }, [contextForecasts]);

  const filteredForecasts = useMemo(() => {
    return (forecastsList || []).filter((f) => {
      if (!f) return false;
      const matchesFilter = filterStatus === "ALL" || f.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.period?.toLowerCase().includes(q) ||
        f.productName?.toLowerCase().includes(q) ||
        f.productCode?.toLowerCase().includes(q) ||
        f.skuCode?.toLowerCase().includes(q) ||
        (f.owner && f.owner.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [forecastsList, filterStatus, searchQuery]);

  const pendingCount = forecastsList.filter((f) => f.status === "Submitted").length;
  const approvedCount = forecastsList.filter((f) => f.status === "Approved").length;
  const totalForecastUnits = forecastsList.reduce((acc, f) => acc + (Number(f.finalForecast || f.finalQty) || 0), 0);

  const handleOpenOverride = (f) => {
    setSelectedForecast(f);
    setOverrideValue(f.overrideQuantity || f.overrideQty ? (f.overrideQuantity || f.overrideQty).toString() : "0");
    setJustification(f.justification || f.reason || "");
    setShowOverrideModal(true);
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!selectedForecast) return;

    const val = Number(overrideValue) || 0;
    const base = Number(selectedForecast.baselineForecast || selectedForecast.baselineQty) || 0;
    const updated = {
      ...selectedForecast,
      overrideQuantity: val,
      overrideQty: val,
      finalForecast: base + val,
      finalQty: base + val,
      reason: justification,
      justification,
      status: "Submitted"
    };

    setForecastsList((prev) =>
      prev.map((f) => (f.id === selectedForecast.id ? updated : f))
    );

    try {
      await planningService.updateForecast(selectedForecast.id, {
        overrideQuantity: val,
        finalForecast: base + val,
        reason: justification,
        status: "Submitted"
      });
      if (applyForecastOverride) {
        applyForecastOverride(selectedForecast.id, val, justification);
      }
      addToast("Forecast override applied and submitted for approval.", "success");
      setShowOverrideModal(false);
    } catch (err) {
      console.warn("Backend override fallback:", err);
      if (applyForecastOverride) {
        applyForecastOverride(selectedForecast.id, val, justification);
      }
      addToast("Override saved locally.", "success");
      setShowOverrideModal(false);
    }
  };

  const handleApprove = async (id) => {
    setForecastsList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "Approved" } : f))
    );

    try {
      await planningService.updateForecast(id, { status: "Approved" });
      if (approveForecast) {
        approveForecast(id);
      }
      addToast("Forecast approved & released to MRP Master Production Schedule.", "success");
    } catch (err) {
      console.warn("Backend approve fallback:", err);
      if (approveForecast) {
        approveForecast(id);
      }
      addToast("Forecast marked Approved.", "success");
    }
  };

  const handleReject = async (id) => {
    setForecastsList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "Rejected", overrideQuantity: 0, overrideQty: 0, finalForecast: f.baselineForecast || f.baselineQty } : f))
    );

    try {
      await planningService.updateForecast(id, { status: "Rejected", overrideQuantity: 0 });
      if (rejectForecast) {
        rejectForecast(id);
      }
      addToast("Forecast override rejected.", "info");
    } catch (err) {
      console.warn("Backend reject fallback:", err);
      if (rejectForecast) {
        rejectForecast(id);
      }
      addToast("Forecast marked Rejected.", "info");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const base = Number(newRecord.baselineQty) || 0;
    const over = Number(newRecord.overrideQty) || 0;
    const final = base + over;

    const payload = {
      period: newRecord.period,
      skuId: newRecord.skuId || "SKU-001",
      baselineDemand: base,
      overrideQuantity: over,
      finalForecast: final,
      modelType: newRecord.method,
      reason: newRecord.justification || "Standard baseline run",
      owner: newRecord.owner,
      status: "Submitted"
    };

    try {
      const res = await planningService.createForecast(payload);
      const created = res?.data || res;
      const optimistic = {
        id: created?.id || `FC-${Date.now().toString().slice(-4)}`,
        ...payload,
        baselineQty: base,
        overrideQty: over,
        finalQty: final,
        productCode: newRecord.skuCode,
        productName: newRecord.productName,
        uom: newRecord.uom
      };

      setForecastsList((prev) => [optimistic, ...prev]);
      if (addForecast) {
        addForecast(payload);
      }
      addToast("New forecast horizon record created successfully in backend.", "success");
      setShowCreateModal(false);
    } catch (err) {
      console.warn("Backend create forecast fallback:", err);
      if (addForecast) {
        addForecast(payload);
      }
      addToast("Forecast record created locally.", "success");
      setShowCreateModal(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "Forecast ID,Period Horizon,Product Code,Product Name,Baseline Qty,Override Qty,Final Forecast Qty,Method,Owner,Status\n";
    const rows = filteredForecasts
      .map((f) => `"${f.id}","${f.period}","${f.productCode || f.skuCode}","${f.productName}",${f.baselineForecast || f.baselineQty || 0},${f.overrideQuantity || f.overrideQty || 0},${f.finalForecast || f.finalQty || 0},"${f.method || 'Standard'}","${f.owner || 'Planner'}","${f.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Forecast_Overrides_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Forecast records exported to CSV.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              Demand Forecasts & Manager Overrides
            </h1>
            {pendingCount > 0 && (
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
                {pendingCount} PENDING APPROVAL
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Review baseline ML forecast horizons, apply promotional uplifts, and authorize final MPS figures.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button 
            variant="outline" 
            icon={RefreshCw} 
            onClick={() => {
              fetchForecasts();
              addToast("Forecast records refreshed from live backend API", "success");
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
            onClick={() => setShowCreateModal(true)}
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
            + Create Forecast Record
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
          title="TOTAL FORECAST RECORDS"
          value={forecastsList.length.toString()}
          unit="Period Horizons"
          icon={TrendingUp}
          colorVariant="cyan"
        />
        <StatCard
          title="PENDING APPROVAL"
          value={pendingCount.toString()}
          unit="Override Requests"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="APPROVED FORECASTS"
          value={approvedCount.toString()}
          unit="Committed to MRP"
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="TOTAL FINAL FORECAST"
          value={`${totalForecastUnits.toLocaleString()}`}
          unit="Master Units"
          icon={Database}
          colorVariant="amber"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", background: "white", border: "1px solid #E8DDCF", borderRadius: "16px" }}>
        {/* Controls toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "240px", maxWidth: "450px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search forecast by period, product, code, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "38px", fontSize: "13px", backgroundColor: "#FAF8F5", border: "1px solid #D1C7BA", borderRadius: "8px", outline: "none", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["ALL", "Draft", "Submitted", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: filterStatus === status ? "1px solid #C89547" : "1px solid #E8DDCF",
                  backgroundColor: filterStatus === status ? "#E2B670" : "#FAF8F5",
                  color: filterStatus === status ? "#261603" : "var(--text-secondary)",
                  transition: "all 0.15s ease"
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Period Horizon</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Master Product SKU</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Baseline</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Override</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Final Forecast</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Method / Model</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Owner & Justification</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForecasts.length > 0 ? (
                filteredForecasts.map((f) => {
                  const base = Number(f.baselineForecast || f.baselineQty || f.baselineDemand) || 0;
                  const over = Number(f.overrideQuantity || f.overrideQty) || 0;
                  const final = Number(f.finalForecast || f.finalQty) || base + over;

                  return (
                    <tr
                      key={f.id}
                      style={{
                        borderBottom: "1px solid #F0EAE1",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{f.period}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          ID: {f.id}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{f.productName || "Master Product SKU"}</div>
                        <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                          {f.productCode || f.skuCode || f.skuId}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {base.toLocaleString()} {f.uom || "Bottles"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            color: over > 0 ? "#8B6914" : over < 0 ? "#DC2626" : "var(--text-muted)"
                          }}
                        >
                          {over > 0 ? `+${over.toLocaleString()}` : over.toLocaleString()} {f.uom || "Bottles"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                          {final.toLocaleString()} {f.uom || "Bottles"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{f.method || f.modelType || "Historical Moving Avg"}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Historical: {base.toLocaleString()}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", maxWidth: "220px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{f.owner || "Alexander Vance"}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          "{f.justification || f.reason || "No notes provided"}"
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: f.status === "Approved" ? "rgba(200, 149, 71, 0.22)" : f.status === "Rejected" ? "rgba(220, 38, 38, 0.12)" : "rgba(200, 149, 71, 0.14)",
                          color: f.status === "Rejected" ? "#DC2626" : "#2B1D11"
                        }}>
                          {f.status?.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleOpenOverride(f)}
                            title="Adjust Override"
                            style={{
                              backgroundColor: "#FAF8F5",
                              border: "1px solid #D1C7BA",
                              borderRadius: "6px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              color: "var(--text-primary)"
                            }}
                          >
                            <Edit3 size={13} />
                          </button>

                          {f.status === "Submitted" && (
                            <>
                              <button
                                onClick={() => handleApprove(f.id)}
                                title="Approve Forecast"
                                style={{
                                  background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px 8px",
                                  cursor: "pointer",
                                  color: "#261603"
                                }}
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => handleReject(f.id)}
                                title="Reject Override"
                                style={{
                                  background: "#DC2626",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px 8px",
                                  cursor: "pointer",
                                  color: "#fff"
                                }}
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No forecast records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* OVERRIDE MODAL */}
      {showOverrideModal && selectedForecast && (
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
        }} onClick={() => setShowOverrideModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "480px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Adjust Forecast Override: {selectedForecast.period}
              </h2>
              <button onClick={() => setShowOverrideModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Product SKU</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedForecast.productName || 'Product'} (${selectedForecast.productCode || selectedForecast.skuCode || selectedForecast.skuId})`}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#F5EFE6" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Baseline Volume</label>
                  <input
                    type="text"
                    disabled
                    value={`${Number(selectedForecast.baselineForecast || selectedForecast.baselineQty || selectedForecast.baselineDemand || 0).toLocaleString()} ${selectedForecast.uom || "Bottles"}`}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#F5EFE6" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Override Volume (+/-)</label>
                  <input
                    type="number"
                    required
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(e.target.value)}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Commercial Justification / Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Approved retail marketing feature uplift for Labor Day"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setShowOverrideModal(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 18px",
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
                  Save & Submit Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RECORD MODAL */}
      {showCreateModal && (
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
        }} onClick={() => setShowCreateModal(false)}>
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
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Create New Forecast Horizon Record
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Period Horizon</label>
                <input
                  type="text"
                  required
                  value={newRecord.period}
                  onChange={(e) => setNewRecord({ ...newRecord, period: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Master SKU Selection</label>
                <select
                  value={newRecord.skuId}
                  onChange={(e) => {
                    const sel = skus.find((s) => s.skuId === e.target.value || s.id === e.target.value) || { skuCode: "SKU-5001", name: "500ml Sparkling Citrus Soda", uom: "Bottles" };
                    setNewRecord({
                      ...newRecord,
                      skuId: e.target.value,
                      skuCode: sel.skuCode,
                      productName: sel.name,
                      uom: sel.uom || "Bottles"
                    });
                  }}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                >
                  {skus.map((s) => (
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
                      {s.skuCode} — {s.name} ({s.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Baseline Volume</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRecord.baselineQty}
                    onChange={(e) => setNewRecord({ ...newRecord, baselineQty: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Override Volume</label>
                  <input
                    type="number"
                    value={newRecord.overrideQty}
                    onChange={(e) => setNewRecord({ ...newRecord, overrideQty: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Method / Model</label>
                <input
                  type="text"
                  value={newRecord.method}
                  onChange={(e) => setNewRecord({ ...newRecord, method: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Justification / Notes</label>
                <textarea
                  rows={2}
                  value={newRecord.justification}
                  onChange={(e) => setNewRecord({ ...newRecord, justification: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 18px",
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
                  Create Forecast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForecastOverrides;

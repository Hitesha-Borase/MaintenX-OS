import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import {
  LineChart,
  Sparkles,
  Play,
  Settings,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCircle2,
  Calendar
} from "lucide-react";

export function ForecastRun() {
  const { forecasts = [], addForecast } = usePlanning();
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [selectedMethod, setSelectedMethod] = useState("Moving Average (4-Week)");
  const [horizonWeeks, setHorizonWeeks] = useState(4);
  const [smoothingAlpha, setSmoothingAlpha] = useState(0.35);
  const [includePromotions, setIncludePromotions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const availableSkus = skus.filter((s) => s.category === "Finished Goods").length > 0
    ? skus.filter((s) => s.category === "Finished Goods")
    : skus;

  const handleExecuteForecastEngine = () => {
    setIsGenerating(true);
    addToast("Executing statistical demand algorithm across all master SKUs...", "info");

    setTimeout(() => {
      // Generate forecasts for available SKUs
      availableSkus.forEach((sku, idx) => {
        const base = sku.skuCode === "SKU-5001" ? 52000 : sku.skuCode === "SKU-5002" ? 26000 : 38000;
        const promoUplift = includePromotions ? Math.round(base * 0.1) : 0;

        addForecast({
          period: `2026-W${40 + idx} (Oct 2026)`,
          plantId: "PLT-01",
          skuId: sku.skuId,
          baselineForecast: base,
          overrideQuantity: promoUplift,
          historicalDemand: Math.round(base * 0.92),
          method: selectedMethod,
          reason: `Engine Run (${selectedMethod}, α=${smoothingAlpha})`
        });
      });

      setIsGenerating(false);
      addToast(`Statistical forecast baseline computed for ${availableSkus.length} finished SKUs!`, "success");
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Statistical Demand Forecasting Engine
          </h1>
        </div>

        <Button
          variant="primary"
          icon={isGenerating ? Sparkles : Play}
          onClick={handleExecuteForecastEngine}
          disabled={isGenerating}
          style={{ fontSize: "13px", padding: "8px 16px", fontWeight: 700 }}
        >
          {isGenerating ? "Computing Baselines..." : "Execute Forecast Run"}
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
          title="Engine Accuracy (MAPE)"
          value="94.6%"
          unit="Mean Absolute % Error"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Algorithms"
          value="4 Models"
          unit="Available in Engine"
          icon={LineChart}
          colorVariant="cyan"
        />
        <StatCard
          title="Tracked Master SKUs"
          value={availableSkus.length.toString()}
          unit="Finished Products"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Forecast Horizon"
          value={`${horizonWeeks} Weeks`}
          unit="Lookahead Window"
          icon={Calendar}
          colorVariant="amber"
        />
      </div>

      {/* Configuration Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Model Configuration Card */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings size={18} color="#B27E33" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Algorithm & Horizon Parameters
            </h3>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Forecasting Model Architecture
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="form-input"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <option value="Moving Average (4-Week)">Moving Average (4-Week Rolling)</option>
              <option value="Exponential Smoothing (Holt-Winters)">Exponential Smoothing (Holt-Winters Multiplicative)</option>
              <option value="Historical Average + Promo Uplift">Historical Average + Promotional Event Uplift</option>
              <option value="Trend-Adjusted Linear Regression">Trend-Adjusted Linear Regression</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Horizon Weeks
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={horizonWeeks}
                onChange={(e) => setHorizonWeeks(Number(e.target.value))}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Smoothing Factor (α)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                max="1.0"
                value={smoothingAlpha}
                onChange={(e) => setSmoothingAlpha(Number(e.target.value))}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <input
              type="checkbox"
              id="includePromos"
              checked={includePromotions}
              onChange={(e) => setIncludePromotions(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "#C89547" }}
            />
            <label htmlFor="includePromos" style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}>
              Factor in active marketing & promotional uplift campaigns (+10%)
            </label>
          </div>
        </Card>

        {/* Projected Model Output Preview */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} color="#059669" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Live Model Execution Projections
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {availableSkus.slice(0, 3).map((sku) => {
              const baseVal = sku.skuCode === "SKU-5001" ? 52000 : sku.skuCode === "SKU-5002" ? 26000 : 38000;
              const withPromo = includePromotions ? Math.round(baseVal * 1.1) : baseVal;

              return (
                <div
                  key={sku.skuId}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{sku.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Code: {sku.skuCode}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {withPromo.toLocaleString()} {sku.uom}
                    </div>
                    <div style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>
                      {includePromotions ? "+10% Promo Uplift" : "Baseline Model"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

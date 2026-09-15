import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Download,
  Percent,
  ArrowRight,
  TrendingUp,
  Droplets,
  Scale,
  Sparkles
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useCI } from "../../../context/CIContext";
import ciService from "../../../services/ciService";

export function YieldLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { lossRecords = [] } = useCI();

  useEffect(() => {
    ciService.getLosses("ALL", "Yield").catch((err) => console.warn("Yield loss load:", err.message));
  }, []);

  const yieldLossRecords = useMemo(() => {
    return lossRecords.filter((l) => l.category?.toLowerCase().includes("yield") || l.category?.toLowerCase().includes("speed"));
  }, [lossRecords]);

  const totalYieldCost = useMemo(() => {
    return yieldLossRecords.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [yieldLossRecords]);

  const totalUnitsLost = useMemo(() => {
    return yieldLossRecords.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [yieldLossRecords]);

  const yieldPercentage = useMemo(() => {
    if (totalUnitsLost === 0) return "100.0%";
    return "98.2%";
  }, [totalUnitsLost]);

  const yieldLosses = useMemo(() => {
    if (yieldLossRecords.length === 0) return [];
    return yieldLossRecords.map((y) => ({
      source: y.eventName || y.category,
      pct: totalYieldCost > 0 ? `${Math.round(((y.financialImpactUSD || 0) / totalYieldCost) * 100)}%` : "0%",
      volume: `${(y.unitsLost || 0).toLocaleString()} Units`,
      cost: `$${(y.financialImpactUSD || 0).toLocaleString()}`,
      category: y.category || "Yield Deviation"
    }));
  }, [yieldLossRecords, totalYieldCost]);

  const handleExportCSV = () => {
    const headers = "Yield Loss Point,Yield Loss %,Volume Lost (Units),Financial Impact,Category\n";
    const rows = yieldLosses
      .map((y) => `"${y.source}","${y.pct}","${y.volume}","${y.cost}","${y.category}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Yield_Loss_Analysis_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Yield loss breakdown exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Yield Loss Analysis
            </h1>
            <Badge variant={totalYieldCost > 0 ? "amber" : "emerald"}>{yieldPercentage} MATERIAL YIELD</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/quality")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Quality Loss
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/loss/scrap")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Scrap & Rework Hub
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
          title="Theoretical Yield"
          value="100%"
          unit="Stoichiometric"
          trend={{ value: "Ideal mass conversion baseline", isPositive: true, text: "" }}
          icon={Scale}
          colorVariant="cyan"
        />
        <StatCard
          title="Actual Yield"
          value={yieldPercentage}
          unit="Achieved"
          trend={{ value: totalYieldCost > 0 ? "Material giveaway logged" : "100% Conversion", isPositive: totalYieldCost === 0, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Yield Efficiency Gap"
          value={totalYieldCost > 0 ? `${(100 - parseFloat(yieldPercentage)).toFixed(1)}%` : "0.0%"}
          unit="Loss Gap"
          trend={{ value: `${totalUnitsLost.toLocaleString()} units lost`, isPositive: totalUnitsLost === 0, text: "" }}
          icon={Droplets}
          colorVariant={totalYieldCost > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Yield Financial Loss"
          value={`$${totalYieldCost.toLocaleString()}`}
          unit="Direct Loss"
          trend={{ value: totalYieldCost > 0 ? "Recoverable ingredient value" : "Zero financial loss", isPositive: totalYieldCost === 0, text: "" }}
          icon={TrendingUp}
          colorVariant={totalYieldCost > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Yield Loss Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Mass-Balance Yield Loss Breakdown
          </h3>
          <Badge variant="cyan">{yieldLosses.length} LOSS STREAMS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {yieldLosses.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No yield loss streams or material deviations recorded.
            </div>
          ) : (
            yieldLosses.map((y, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {y.source}
                    </span>
                    <Badge variant="slate">{y.category}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>Volume Lost: <strong style={{ color: "var(--text-primary)" }}>{y.volume}</strong></span>
                    <span>Financial Impact: <strong style={{ color: "#8C5B23" }}>{y.cost}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                    {y.pct}
                  </span>

                  <button
                    onClick={() => navigate("/ci/projects/list")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: "var(--bg-card-subtle)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>Kaizen Project</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

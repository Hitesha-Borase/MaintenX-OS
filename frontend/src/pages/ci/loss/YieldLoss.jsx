import React, { useState } from "react";
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

export function YieldLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const yieldLosses = [
    { source: "Filler nozzle post-drip and volumetric over-fill (+2.4g/bottle)", pct: "1.2%", volume: "5,760 L", cost: "$5,180", category: "Filling Over-Delivery" },
    { source: "CIP cycle chemical pre-rinse product wash-down to drain", pct: "1.0%", volume: "4,800 L", cost: "$4,320", category: "CIP Flush Loss" },
    { source: "Blending tank residual heel & transfer pipeline dead-leg retention", pct: "0.9%", volume: "4,320 L", cost: "$3,880", category: "Tank Bottom Retention" }
  ];

  const handleExportCSV = () => {
    const headers = "Yield Loss Point,Yield Loss %,Volume Lost (L),Financial Impact,Category\n";
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
            <Badge variant="cyan">96.9% MATERIAL YIELD</Badge>
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

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          value="96.9%"
          unit="Achieved"
          trend={{ value: "Finished goods fill weight audit", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Yield Efficiency Gap"
          value="3.1%"
          unit="Loss"
          trend={{ value: "14,880 L liquid giveaway/loss", isPositive: false, text: "" }}
          icon={Droplets}
          colorVariant="amber"
        />
        <StatCard
          title="Yield Opportunity"
          value="$13,380"
          unit="Weekly"
          trend={{ value: "Recoverable ingredient value", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
      </div>

      {/* Yield Loss Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Mass-Balance Yield Loss Breakdown
          </h3>
          <Badge variant="cyan">3 CORE LOSS STREAMS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {yieldLosses.map((y, idx) => (
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
          ))}
        </div>
      </Card>
    </div>
  );
}

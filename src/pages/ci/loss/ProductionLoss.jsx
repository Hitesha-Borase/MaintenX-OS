import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Download,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Layers,
  Sparkles,
  BarChart3,
  Calendar
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ProductionLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [timeRange, setTimeRange] = useState("Week 35 (Current)");

  const lossCauses = [
    { cause: "Unplanned Mechanical & Electrical Breakdowns", percentage: "4.1%", volume: "19,680 Bottles", cost: "$9,840", route: "/ci/loss/downtime" },
    { cause: "Planned Clean-in-Place (CIP) & Changeover Overhead", percentage: "3.2%", volume: "15,360 Bottles", cost: "$7,680", route: "/ci/loss/downtime" },
    { cause: "Quality Quarantine & Out-of-Spec Rejects", percentage: "2.8%", volume: "13,440 Bottles", cost: "$6,720", route: "/ci/loss/quality" },
    { cause: "Micro-Stoppages & Speed Derating", percentage: "2.1%", volume: "10,080 Bottles", cost: "$5,040", route: "/ci/loss/yield" }
  ];

  const handleExportCSV = () => {
    const headers = "Loss Category,OEE Impact %,Lost Volume (Units),Financial Loss ($)\n";
    const rows = lossCauses
      .map((l) => `"${l.cause}","${l.percentage}","${l.volume}","${l.cost}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Production_Loss_Waterfall_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Production Loss Waterfall exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Production Loss Analysis
            </h1>
            <Badge variant="rose">12.2% TOTAL LOSS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/loss/downtime")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Downtime Breakdown
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
          title="Target Output"
          value="480,000"
          unit="Bottles"
          trend={{ value: "Weekly production baseline", isPositive: true, text: "" }}
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Actual Output"
          value="421,440"
          unit="Bottles"
          trend={{ value: "Achieved gross output (87.8%)", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Production Loss"
          value="58,560"
          unit="Bottles"
          trend={{ value: "-12.2% output gap", isPositive: false, text: "" }}
          icon={TrendingDown}
          colorVariant="rose"
        />
        <StatCard
          title="Financial Opportunity"
          value="$29,280"
          unit="Weekly"
          trend={{ value: "Recoverable capacity value", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Loss Waterfall Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} color="#B27E33" />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              Weekly Production Loss Waterfall
            </h3>
          </div>
          <Badge variant="cyan">{timeRange}</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {lossCauses.map((item, idx) => (
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
              <div style={{ minWidth: "200px", flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {item.cause}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span>Lost Units: <strong style={{ color: "var(--text-primary)" }}>{item.volume}</strong></span>
                  <span>Financial Impact: <strong style={{ color: "#DC2626" }}>{item.cost}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                  {item.percentage}
                </span>

                <button
                  onClick={() => navigate(item.route)}
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
                  <span>Drill Down</span>
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

import React, { useState, useEffect, useMemo } from "react";
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
import { useCI } from "../../../context/CIContext";
import ciService from "../../../services/ciService";

export function ProductionLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { lossRecords = [] } = useCI();

  useEffect(() => {
    ciService.getLosses("ALL", "Production").catch((err) => console.warn("Production loss load:", err.message));
  }, []);

  const [timeRange, setTimeRange] = useState("Active Operational Cycle");

  const totalUnitsLost = useMemo(() => {
    return lossRecords.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [lossRecords]);

  const totalFinancialLoss = useMemo(() => {
    return lossRecords.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [lossRecords]);

  const totalHoursLost = useMemo(() => {
    return lossRecords.reduce((acc, l) => acc + (Number(l.hoursLost) || 0), 0);
  }, [lossRecords]);

  const lossCauses = useMemo(() => {
    if (lossRecords.length === 0) return [];
    return lossRecords.map((item) => ({
      cause: item.eventName || item.category,
      percentage: totalFinancialLoss > 0
        ? `${Math.round(((item.financialImpactUSD || 0) / totalFinancialLoss) * 100)}%`
        : "0%",
      volume: `${(item.unitsLost || 0).toLocaleString()} Units`,
      cost: `$${(item.financialImpactUSD || 0).toLocaleString()}`,
      route: item.category?.toLowerCase().includes("quality")
        ? "/ci/loss/quality"
        : item.category?.toLowerCase().includes("yield")
        ? "/ci/loss/yield"
        : "/ci/loss/downtime"
    }));
  }, [lossRecords, totalFinancialLoss]);

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
            <Badge variant={totalFinancialLoss > 0 ? "rose" : "emerald"}>
              {totalFinancialLoss > 0 ? `$${totalFinancialLoss.toLocaleString()} LOGGED LOSS` : "ZERO UNPLANNED LOSS"}
            </Badge>
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
          title="Recorded Incidents"
          value={lossRecords.length.toString()}
          unit="Events"
          trend={{ value: lossRecords.length > 0 ? "Under investigation" : "Clean operational baseline", isPositive: lossRecords.length === 0, text: "" }}
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Lost Production Hours"
          value={`${totalHoursLost.toFixed(1)} hrs`}
          unit="Aggregate Hours"
          trend={{ value: totalHoursLost > 0 ? "Production stoppage logged" : "Zero stoppage", isPositive: totalHoursLost === 0, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Units Lost"
          value={totalUnitsLost.toLocaleString()}
          unit="Units"
          trend={{ value: totalUnitsLost > 0 ? "Volume deficit" : "Zero unit loss", isPositive: totalUnitsLost === 0, text: "" }}
          icon={TrendingDown}
          colorVariant={totalUnitsLost > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Financial Loss"
          value={`$${totalFinancialLoss.toLocaleString()}`}
          unit="Direct Impact"
          trend={{ value: totalFinancialLoss > 0 ? "Direct downtime value" : "Zero loss logged", isPositive: totalFinancialLoss === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={totalFinancialLoss > 0 ? "rose" : "emerald"}
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
          {lossCauses.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No production loss events recorded in current cycle.
            </div>
          ) : (
            lossCauses.map((item, idx) => (
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
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Download,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  SearchCode,
  ShieldCheck,
  Percent
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function QualityLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const qualityCauses = [
    { cause: "CCP Pasteurizer Temperature Excursion Reject", pct: "2.1%", batch: "BAT-2026-0890", cost: "$4,200", status: "Quarantined" },
    { cause: "Capping dynamic seal torque out-of-spec", pct: "0.6%", batch: "NCR-402", cost: "$1,200", status: "Reworked" },
    { cause: "Label application alignment defect & barcode unreadable", pct: "0.4%", batch: "BAT-2026-0888", cost: "$800", status: "Re-labeled" }
  ];

  const handleExportCSV = () => {
    const headers = "Defect Cause,OEE Impact %,Affected Batch,Financial Loss,Disposition\n";
    const rows = qualityCauses
      .map((q) => `"${q.cause}","${q.pct}","${q.batch}","${q.cost}","${q.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quality_Loss_Analysis_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Quality loss analysis exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Quality Loss Analysis
            </h1>
            <Badge variant="amber">3.1% QUALITY GAP</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            RCA Investigations
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/loss/yield")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Yield Loss Hub
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
          title="Total Quality Loss"
          value="3.1%"
          unit="OEE Impact"
          trend={{ value: "First pass yield gap", isPositive: false, text: "" }}
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="Batch Non-Conformances"
          value="1 Batch"
          unit="Destroyed"
          trend={{ value: "BAT-2026-0890 (CCP excursion)", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="First Pass Yield (FPY)"
          value="96.9%"
          unit="Target: 98%"
          trend={{ value: "-1.1% vs quality KPI target", isPositive: false, text: "" }}
          icon={Percent}
          colorVariant="cyan"
        />
        <StatCard
          title="Scrap Cost Impact"
          value="$6,200"
          unit="Direct Loss"
          trend={{ value: "Non-recoverable packaging/liquid", isPositive: false, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Quality Loss Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Root Quality Loss Pareto Causes
          </h3>
          <Badge variant="cyan">{qualityCauses.length} INCIDENTS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {qualityCauses.map((q, idx) => (
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
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {q.cause}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span>Batch: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{q.batch}</strong></span>
                  <span>Financial Loss: <strong style={{ color: "#DC2626" }}>{q.cost}</strong></span>
                  <span>Status: <strong style={{ color: "#8C5B23" }}>{q.status}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                  {q.pct}
                </span>

                <button
                  onClick={() => navigate("/ci/rca/investigations")}
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
                  <SearchCode size={12} />
                  <span>RCA 8D</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

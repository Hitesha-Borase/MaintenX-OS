import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Download,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  SearchCode,
  Gauge
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function ReliabilityInsights() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const assets = [
    {
      asset: "HTST Pasteurizer — Line 1",
      mtbf: "88 hrs",
      mttr: "45 min",
      failures: 2,
      availability: "91.2%",
      criticality: "Critical"
    },
    {
      asset: "Rotary Filler — Line 1",
      mtbf: "102 hrs",
      mttr: "38 min",
      failures: 1,
      availability: "94.6%",
      criticality: "High"
    },
    {
      asset: "CIP Sanitation Skid Bay 2",
      mtbf: "148 hrs",
      mttr: "22 min",
      failures: 1,
      availability: "97.5%",
      criticality: "Medium"
    }
  ];

  const handleExportCSV = () => {
    const headers = "Asset Name,MTBF (hrs),MTTR (min),Failure Count,Availability %,Criticality\n";
    const rows = assets
      .map((a) => `"${a.asset}","${a.mtbf}","${a.mttr}",${a.failures},"${a.availability}","${a.criticality}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Fleet_Reliability_MTBF_MTTR_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Reliability analytics exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Reliability Insights & Asset MTBF
            </h1>
            <Badge variant="cyan">FLEET ANALYTICS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Reliability CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/downtime")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Downtime Loss
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/reports")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Reports Hub
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
          title="Fleet MTBF"
          value="112 hrs"
          unit="MTBF"
          trend={{ value: "+17 hrs vs last month", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="emerald"
        />
        <StatCard
          title="Fleet MTTR"
          value="48 min"
          unit="MTTR"
          trend={{ value: "vs. 52 min SLA target", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Fleet Availability"
          value="93.8%"
          unit="OEE"
          trend={{ value: "vs. 95% benchmark", isPositive: false, text: "" }}
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Repeat Failure Assets"
          value="2 Assets"
          unit="Triage"
          trend={{ value: "Pasteurizer probe & filler nozzle", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
      </div>

      {/* Top Assets Reliability Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Top Fleet Assets by Downtime Frequency
          </h3>
          <Badge variant="cyan">{assets.length} MONITORED ASSETS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {assets.map((a, idx) => {
            const isCritical = a.criticality === "Critical";

            return (
              <div
                key={idx}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: isCritical ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {a.asset}
                    </span>
                    <Badge variant={isCritical ? "rose" : "amber"}>{a.criticality}</Badge>
                    <Badge variant="emerald">{a.availability} UPTIME</Badge>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <span>Mean Time Between Failure: <strong style={{ color: "#059669" }}>{a.mtbf}</strong></span>
                    <span>Mean Time to Repair: <strong style={{ color: "#0284C7" }}>{a.mttr}</strong></span>
                    <span>Weekly Outages: <strong style={{ color: isCritical ? "#DC2626" : "var(--text-primary)" }}>{a.failures}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => navigate("/ci/rca/investigations")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                      color: "#261603",
                      border: "1px solid #E8C182",
                      boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <SearchCode size={13} />
                    <span>Initiate RCA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

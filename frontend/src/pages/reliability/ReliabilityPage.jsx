import React from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function ReliabilityPage() {
  const { reliabilityMetrics, assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const badActors = [
    { id: "HT-105", name: "Plate Heat Exchanger & Pasteurizer", mtbf: 180, mttr: 3.2, availability: "88.2%", failuresCount: 5, status: "Critical" },
    { id: "LB-204", name: "Krones Autocol Rotary Labeler", mtbf: 240, mttr: 2.1, availability: "92.4%", failuresCount: 3, status: "High" },
    { id: "FM-001", name: "High-Speed Rotary Filler 12-Head", mtbf: 385, mttr: 1.4, availability: "97.1%", failuresCount: 2, status: "Moderate" }
  ];

  const handleExportCSV = () => {
    const headers = "Asset ID,Name,MTBF (Hours),MTTR (Hours),Availability,Failures,Risk Status\n";
    const rows = badActors
      .map((ba) => `"${ba.id}","${ba.name}",${ba.mtbf},${ba.mttr},"${ba.availability}",${ba.failuresCount},"${ba.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reliability_Bad_Actors_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Reliability report exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Reliability Engineering & MTBF/MTTR Analytics
            </h1>
            <Badge variant="cyan">ASSET AVAILABILITY INDEX</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Reliability Report
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
          title="Plant MTBF"
          value={`${reliabilityMetrics?.plantOverall?.mtbfHours || 412}`}
          unit="Operating hrs"
          trend={{ value: "Target: 420 hrs", isPositive: false, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Plant MTTR"
          value={`${reliabilityMetrics?.plantOverall?.mttrHours || 1.8}`}
          unit="Repair hrs"
          trend={{ value: "Target: 1.2 hrs", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Operational Availability"
          value="96.4%"
          unit="Uptime"
          trend={{ value: "+0.8% vs benchmark", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="PM Compliance Rate"
          value={`${reliabilityMetrics?.plantOverall?.pmComplianceRate || 98.4}%`}
          unit="Compliance"
          trend={{ value: "Within target tolerance", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Charts */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", width: "100%", minWidth: 0 }}>
        {/* MTBF Monthly Trend */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Monthly Plant MTBF Reliability Growth (Hours)
            </h3>
            <Badge variant="cyan">Target: 420h</Badge>
          </div>

          <AreaChart
            data={(reliabilityMetrics?.monthlyTrend || []).map((m) => ({ label: m.month, value: m.mtbf }))}
            height={220}
            color="#8C5B23"
            unit="h"
          />
        </Card>

        {/* MTTR Monthly Trend */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Monthly Mean Time To Repair (MTTR in Hours)
            </h3>
            <Badge variant="emerald">Target: 1.2h</Badge>
          </div>

          <AreaChart
            data={(reliabilityMetrics?.monthlyTrend || []).map((m) => ({ label: m.month, value: m.mttr || 1.8 }))}
            height={220}
            color="#059669"
            unit="h"
          />
        </Card>
      </div>

      {/* Bad Actor Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Bad Actor Equipment Ranking Matrix
          </h3>
          <Badge variant="rose">PRIORITY DRILL-DOWN</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Equipment Name</th>
                <th>MTBF (Hours)</th>
                <th>MTTR (Hours)</th>
                <th>Operational Availability</th>
                <th>Failures (90d)</th>
                <th>Risk Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {badActors.map((ba) => (
                <tr key={ba.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{ba.id}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{ba.name}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: ba.mtbf < 250 ? "#DC2626" : "var(--text-primary)", fontWeight: 700 }}>
                    {ba.mtbf} hrs
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: ba.mttr > 2.0 ? "#D97706" : "var(--text-primary)", fontWeight: 700 }}>
                    {ba.mttr} hrs
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: ba.availability.startsWith("9") ? "#059669" : "#DC2626" }}>
                      {ba.availability}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626" }}>
                    {ba.failuresCount}x
                  </td>
                  <td>
                    <Badge variant={ba.status === "Critical" ? "rose" : ba.status === "High" ? "amber" : "cyan"}>
                      {ba.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/assets/360?id=${ba.id}`)}
                      style={{
                        padding: "4px 10px",
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
                      <span>Asset 360</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

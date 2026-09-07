import React from "react";
import {
  Gauge,
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";

export function OEEPage() {
  const { addToast } = useApp();

  const lineOEE = [
    { line: "Line 1 (Aseptic Bottling 500ml)", oee: 88.4, avail: 94.0, perf: 96.0, qual: 98.0, status: "Optimal" },
    { line: "Line 2 (Formulation & Blending)", oee: 84.1, avail: 88.0, perf: 97.0, qual: 98.5, status: "Thermal Loss" },
    { line: "Line 3 (Canning & Seaming 330ml)", oee: 86.8, avail: 94.5, perf: 94.5, qual: 97.8, status: "Optimal" }
  ];

  const sixBigLosses = [
    { label: "Unplanned Stoppages", value: 4.8 },
    { label: "Changeovers / Setup", value: 3.1 },
    { label: "Minor Idling / Micro-jams", value: 2.2 },
    { label: "Speed Reduction Loss", value: 2.0 },
    { label: "Startup Scrap & Rejects", value: 0.9 },
    { label: "In-Process Defect Loss", value: 0.6 }
  ];

  const handleExportCSV = () => {
    const headers = "Line,OEE %,Availability %,Performance %,Quality %,Status\n";
    const rows = lineOEE
      .map((l) => `"${l.line}",${l.oee},${l.avail},${l.perf},${l.qual},"${l.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Plant_OEE_Performance_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("OEE performance metrics exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Overall Equipment Effectiveness (OEE)
            </h1>
            <Badge variant="emerald">WORLD-CLASS: 85%+</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export OEE Deck
          </Button>
        </div>
      </div>

      {/* 4 OEE Factor KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Overall Plant OEE"
          value="86.4%"
          unit="Aggregate"
          trend={{ value: "+1.8% vs monthly benchmark", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="Availability Rate"
          value="92.1%"
          unit="Uptime"
          trend={{ value: "Downtime: 4.8 hrs (Line 2)", isPositive: false, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Performance Rate"
          value="95.8%"
          unit="Speed Efficiency"
          trend={{ value: "Rated vs Operating speed", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="cyan"
        />
        <StatCard
          title="Quality Rate"
          value="98.1%"
          unit="First-Pass Yield"
          trend={{ value: "0.8% Scrap & Rejects", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Grid: Line-by-Line Breakdown & Six Big Losses */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", width: "100%", minWidth: 0 }}>
        {/* Line by Line OEE Table */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Line-by-Line OEE Breakdown
            </h3>
            <Badge variant="cyan">3 Active Lines</Badge>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "480px" }}>
              <thead>
                <tr>
                  <th>Production Line</th>
                  <th>OEE</th>
                  <th>Avail</th>
                  <th>Perf</th>
                  <th>Qual</th>
                </tr>
              </thead>
              <tbody>
                {lineOEE.map((l, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{l.line}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Status: {l.status}</div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: l.oee >= 85 ? "#059669" : "#D97706", fontSize: "14px" }}>
                      {l.oee}%
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{l.avail}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{l.perf}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#059669" }}>{l.qual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Six Big Losses Pareto Chart */}
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Six Big Losses Impact (% of Production)
            </h3>
            <Badge variant="rose">Loss: 13.6%</Badge>
          </div>

          <BarChart
            data={sixBigLosses}
            height={220}
            color="#DC2626"
            unit="%"
          />
        </Card>
      </div>

      {/* Hourly OEE Trend */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
            24-Hour Rolling OEE Trend Curve
          </h3>
          <Badge variant="emerald">UCL: 92%</Badge>
        </div>

        <AreaChart
          data={[
            { label: "00:00", value: 84 },
            { label: "03:00", value: 86 },
            { label: "06:00", value: 85 },
            { label: "09:00", value: 79 },
            { label: "12:00", value: 87 },
            { label: "15:00", value: 89 },
            { label: "18:00", value: 86.4 }
          ]}
          height={200}
          color="#059669"
          unit="%"
        />
      </Card>
    </div>
  );
}

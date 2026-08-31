import React, { useState } from "react";
import {
  Gauge,
  Activity,
  CheckCircle2,
  TrendingUp,
  Download,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
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
  const [selectedLine, setSelectedLine] = useState("ALL");

  const lineOEE = [
    { line: "Line 1 — Aseptic Bottling (FM-001)", oee: 88.2, avail: 94.0, perf: 95.5, qual: 98.4, status: "Optimal" },
    { line: "Line 2 — Formulation & Pasteurizer (HT-105)", oee: 82.5, avail: 89.2, perf: 94.0, qual: 98.0, status: "Degraded" },
    { line: "Line 3 — Canning & Secondary Packaging", oee: 89.4, avail: 93.5, perf: 96.8, qual: 98.8, status: "Optimal" }
  ];

  const sixBigLosses = [
    { label: "1. Equipment Failure (Unplanned)", value: 4.2 },
    { label: "2. Setup & Adjustments (Changeovers)", value: 3.8 },
    { label: "3. Idling & Minor Stops (< 5 min)", value: 2.5 },
    { label: "4. Reduced Speed (Derated Speed)", value: 1.8 },
    { label: "5. Process Defects & Scrapped Bottles", value: 0.9 },
    { label: "6. Reduced Yield (Startup Flushes)", value: 0.4 }
  ];

  const handleExportCSV = () => {
    const headers = "Production Line,OEE (%),Availability (%),Performance (%),Quality (%),Status\n";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Overall Equipment Effectiveness (OEE)
            </h1>
            <Badge variant="emerald">World-Class Target: 85%+</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Comprehensive Availability, Performance, and Quality factor decomposition across all plant manufacturing lines.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export OEE Deck
          </Button>
        </div>
      </div>

      {/* 4 OEE Factor KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
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
          colorVariant="blue"
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
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Line by Line OEE Table */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Line-by-Line OEE Breakdown
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Factor decomposition across active packaging & processing halls
              </p>
            </div>
            <Badge variant="cyan">3 Active Lines</Badge>
          </div>

          <div className="data-table-container">
            <table className="data-table">
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
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{l.line}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Status: {l.status}</div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: l.oee >= 85 ? "#10B981" : "#F59E0B", fontSize: "14px" }}>
                      {l.oee}%
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{l.avail}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{l.perf}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#10B981" }}>{l.qual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Six Big Losses Pareto Chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Six Big Losses Impact (% of Planned Production)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Root cause loss drivers impacting availability and speed
              </p>
            </div>
            <Badge variant="rose">Total Loss: 13.6%</Badge>
          </div>

          <BarChart
            data={sixBigLosses}
            height={220}
            color="#EF4444"
            unit="%"
          />
        </Card>
      </div>

      {/* Hourly OEE Trend */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              24-Hour Rolling OEE Trend Curve
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Continuous automated telemetry from PLC run-signals
            </p>
          </div>
          <Badge variant="emerald">Upper Control Limit: 92%</Badge>
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
          color="#10B981"
          unit="%"
        />
      </Card>
    </div>
  );
}

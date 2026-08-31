import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  DollarSign,
  Zap,
  ShieldCheck,
  Download,
  Filter,
  Layers,
  Flame,
  Award
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";

export function KPIAnalyticsPage() {
  const { addToast } = useApp();

  const kpis = [
    { title: "OTIF (On-Time In-Full)", current: "98.6%", target: "98.0%", variance: "+0.6%", status: "Optimal", category: "Customer Service" },
    { title: "First-Pass Quality Yield (FPY)", current: "99.2%", target: "99.0%", variance: "+0.2%", status: "Optimal", category: "Quality" },
    { title: "Conversion Cost / Unit", current: "$0.082", target: "$0.085", variance: "-$0.003", status: "Optimal", category: "Financial" },
    { title: "Specific Energy / Bottle", current: "0.14 kWh", target: "0.15 kWh", variance: "-0.01", status: "Optimal", category: "Sustainability" },
    { title: "Scrap & Waste Rate", current: "0.8%", target: "< 1.0%", variance: "-0.2%", status: "Optimal", category: "Quality" },
    { title: "Days Without Lost-Time Incident", current: "384 Days", target: "> 365", variance: "+19 Days", status: "Optimal", category: "Safety" }
  ];

  const handleExportCSV = () => {
    const headers = "KPI Metric,Category,Current Value,Target Benchmark,Variance,Status\n";
    const rows = kpis
      .map((k) => `"${k.title}","${k.category}","${k.current}","${k.target}","${k.variance}","${k.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Executive_KPI_Scorecard_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Executive KPI scorecard exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Executive Plant KPI Analytics Scorecard
            </h1>
            <Badge variant="emerald">Top Decile Benchmark</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Holistic plant performance analytics tracking OTIF, conversion cost, yield, sustainability, and safety metrics.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Executive Deck
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="OTIF Delivery"
          value="98.6%"
          unit="On-Time"
          trend={{ value: "Target: 98.0%", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
        <StatCard
          title="Unit Conversion Cost"
          value="$0.082"
          unit="/ Bottle"
          trend={{ value: "Target: $0.085", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Safety Record"
          value="384 Days"
          unit="Zero LTI"
          trend={{ value: "ISO 45001 Compliant", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* KPI Scorecard Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Key Operational Benchmarks & Targets
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Actual performance vs corporate budget and industry standard benchmarks
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>KPI Metric</th>
                <th>Category</th>
                <th>Current Value</th>
                <th>Target Benchmark</th>
                <th>Variance vs Plan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((k, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{k.title}</div>
                  </td>
                  <td>
                    <Badge variant="cyan">{k.category}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", color: "#38BDF8" }}>
                    {k.current}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {k.target}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    {k.variance}
                  </td>
                  <td>
                    <Badge variant="emerald" dot>
                      {k.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Historical Yield & Cost Trends */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly Conversion Cost Trend ($ / unit)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Steadily declining unit production costs via lean manufacturing
              </p>
            </div>
            <Badge variant="emerald">-3.5% YTD</Badge>
          </div>

          <AreaChart
            data={[
              { label: "Mar", value: 0.089 },
              { label: "Apr", value: 0.087 },
              { label: "May", value: 0.085 },
              { label: "Jun", value: 0.084 },
              { label: "Jul", value: 0.083 },
              { label: "Aug", value: 0.082 }
            ]}
            height={200}
            color="#10B981"
            unit="$"
          />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                First-Pass Yield (%) Trend
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                High-quality output compliance across shifts
              </p>
            </div>
            <Badge variant="cyan">Avg: 99.2%</Badge>
          </div>

          <AreaChart
            data={[
              { label: "Mar", value: 98.4 },
              { label: "Apr", value: 98.8 },
              { label: "May", value: 99.0 },
              { label: "Jun", value: 98.9 },
              { label: "Jul", value: 99.1 },
              { label: "Aug", value: 99.2 }
            ]}
            height={200}
            color="#38BDF8"
            unit="%"
          />
        </Card>
      </div>
    </div>
  );
}

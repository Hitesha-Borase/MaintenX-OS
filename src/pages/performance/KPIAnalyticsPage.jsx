import React from "react";
import {
  TrendingUp,
  Award,
  DollarSign,
  ShieldCheck,
  Zap,
  Download,
  Filter,
  CheckCircle2,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { useApp } from "../../context/AppContext";

export function KPIAnalyticsPage() {
  const { addToast } = useApp();

  const kpis = [
    { title: "OTIF Customer Delivery", category: "Supply Chain", current: "98.6%", target: "98.0%", variance: "+0.6%", status: "Achieved" },
    { title: "Plant Conversion Cost", category: "Financial", current: "$0.082/unit", target: "$0.085/unit", variance: "-$0.003", status: "Achieved" },
    { title: "First-Pass Quality Yield", category: "Quality", current: "99.2%", target: "99.0%", variance: "+0.2%", status: "Achieved" },
    { title: "Overall Equipment Effectiveness (OEE)", category: "Manufacturing", current: "86.4%", target: "85.0%", variance: "+1.4%", status: "Achieved" },
    { title: "Energy Intensity (kWh/kL)", category: "Sustainability", current: "14.2 kWh", target: "15.0 kWh", variance: "-0.8 kWh", status: "Achieved" },
    { title: "Lost Time Injury Frequency (LTIFR)", category: "Safety", current: "0.00", target: "0.00", variance: "0.00", status: "Achieved" }
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
    a.download = `Plant_KPI_Scorecard_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Plant KPI Scorecard exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Executive Plant KPI Analytics Scorecard
            </h1>
            <Badge variant="emerald">TOP DECILE BENCHMARK</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Executive Deck
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
        <StatCard
          title="OEE Plant Score"
          value="86.4%"
          unit="Overall"
          trend={{ value: "+1.4% above budget", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="cyan"
        />
      </div>

      {/* KPI Scorecard Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Key Operational Benchmarks & Targets
          </h3>
          <Badge variant="cyan">{kpis.length} ACTIVE TARGETS</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
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
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{k.title}</div>
                  </td>
                  <td>
                    <Badge variant="cyan">{k.category}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", color: "#8C5B23" }}>
                    {k.current}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {k.target}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
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
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", width: "100%", minWidth: 0 }}>
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Monthly Conversion Cost Trend ($ / unit)
            </h3>
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
            color="#059669"
            unit="$"
          />
        </Card>

        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              First-Pass Yield (%) Trend
            </h3>
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
            color="#8C5B23"
            unit="%"
          />
        </Card>
      </div>
    </div>
  );
}

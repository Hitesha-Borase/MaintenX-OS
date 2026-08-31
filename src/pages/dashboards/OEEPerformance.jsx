import React, { useState } from "react";
import {
  Gauge,
  TrendingUp,
  Activity,
  Layers,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  ArrowDownRight,
  ArrowUpRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { OEEGauges } from "../../components/charts/OEEGauges";
import { BarChart } from "../../components/charts/BarChart";
import { AreaChart } from "../../components/charts/AreaChart";
import { ParetoChart } from "../../components/charts/ParetoChart";
import { useApp } from "../../context/AppContext";

export function OEEPerformance() {
  const { addToast } = useApp();
  const [selectedLine, setSelectedLine] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("daily"); // daily, weekly, monthly
  const [selectedShiftFilter, setSelectedShiftFilter] = useState("all");

  const trendData =
    selectedPeriod === "daily"
      ? [
          { label: "06:00", value: 84.2 },
          { label: "07:00", value: 87.5 },
          { label: "08:00", value: 86.4 },
          { label: "09:00", value: 82.0 },
          { label: "10:00", value: 89.1 },
          { label: "11:00", value: 88.3 },
          { label: "12:00", value: 85.9 },
          { label: "13:00", value: 87.0 }
        ]
      : selectedPeriod === "weekly"
      ? [
          { label: "Mon", value: 83.1 },
          { label: "Tue", value: 85.4 },
          { label: "Wed", value: 88.0 },
          { label: "Thu", value: 86.2 },
          { label: "Fri", value: 87.4 },
          { label: "Sat", value: 89.2 },
          { label: "Sun", value: 86.4 }
        ]
      : [
          { label: "Mar", value: 81.5 },
          { label: "Apr", value: 83.2 },
          { label: "May", value: 84.8 },
          { label: "Jun", value: 85.5 },
          { label: "Jul", value: 86.0 },
          { label: "Aug", value: 86.4 }
        ];

  const sixBigLosses = [
    { name: "1. Unplanned Equipment Breakdown", durationMin: 185, category: "Availability Loss", impactOEE: "-4.2%", color: "#EF4444" },
    { name: "2. Setup & SKU Changeovers", durationMin: 45, category: "Availability Loss", impactOEE: "-1.8%", color: "#F59E0B" },
    { name: "3. Idling & Micro-Stops (< 5 min)", durationMin: 28, category: "Performance Loss", impactOEE: "-1.2%", color: "#38BDF8" },
    { name: "4. Reduced Speed Operation (580 vs 600 BPM)", durationMin: 18, category: "Performance Loss", impactOEE: "-0.8%", color: "#38BDF8" },
    { name: "5. In-Process Scrap & Rejects (210 btls)", durationMin: 14, category: "Quality Loss", impactOEE: "-0.6%", color: "#10B981" },
    { name: "6. Startup Yield Stabilization", durationMin: 8, category: "Quality Loss", impactOEE: "-0.3%", color: "#10B981" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              OEE & Performance Analytics
            </h1>
            <Badge variant="cyan">TPM Standard</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Overall Equipment Effectiveness breakdown, Six Big Losses waterfall, and rate attainment.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto", height: "36px", fontSize: "12px" }}
            value={selectedLine}
            onChange={(e) => {
              setSelectedLine(e.target.value);
              addToast(`Filtered OEE by line: ${e.target.value}`);
            }}
          >
            <option value="all">All Manufacturing Lines</option>
            <option value="line-1">Line 1 (Aseptic Bottling)</option>
            <option value="line-2">Line 2 (Formulation & Blending)</option>
            <option value="line-3">Line 3 (Canning Line)</option>
          </select>

          <div style={{ display: "flex", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", padding: "2px" }}>
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: selectedPeriod === p ? 700 : 500,
                  color: selectedPeriod === p ? "#FFFFFF" : "var(--text-secondary)",
                  backgroundColor: selectedPeriod === p ? "#0284C7" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s ease"
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            icon={Download}
            onClick={() => addToast("Exporting OEE Detailed Waterfall Report (PDF/Excel)...")}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid-4">
        <StatCard
          title="Overall OEE"
          value="86.4"
          unit="%"
          trend={{ value: "+2.1%", isPositive: true, text: "vs 85% benchmark" }}
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Availability (A)"
          value="91.2"
          unit="%"
          trend={{ value: "-1.8%", isPositive: false, text: "downtime impact" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Performance (P)"
          value="96.6"
          unit="%"
          trend={{ value: "+0.6%", isPositive: true, text: "580/600 BPM run rate" }}
          icon={Zap}
          colorVariant="blue"
        />
        <StatCard
          title="Quality Rate (Q)"
          value="98.1"
          unit="%"
          trend={{ value: "+0.4%", isPositive: true, text: "first pass yield" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Gauges & Historical Trend Area Chart */}
      <div className="grid-2">
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                OEE Component Deconstruction
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Formula: OEE = Availability × Performance × Quality
              </p>
            </div>
            <Badge variant="emerald">World Class Tier</Badge>
          </div>

          <OEEGauges oee={86.4} availability={91.2} performance={96.6} quality={98.1} />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {selectedPeriod === "daily" ? "Hourly OEE Progression" : selectedPeriod === "weekly" ? "7-Day Weekly OEE Trend" : "6-Month Historical OEE"}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Continuously calculated from edge SCADA telemetry
              </p>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#38BDF8", fontWeight: 700 }}>
              Mean: 86.4%
            </span>
          </div>

          <AreaChart data={trendData} height={200} color="#38BDF8" unit="%" />
        </Card>
      </div>

      {/* Six Big Losses Breakdown & Loss Waterfall */}
      <div className="grid-2">
        {/* Six Big Losses Table */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                TPM Six Big Losses Analysis
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Detailed impact on scheduled shift availability and output
              </p>
            </div>
            <Badge variant="rose">Total Loss: 298 mins</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sixBigLosses.map((loss, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {loss.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {loss.category}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: loss.color }}>
                    {loss.durationMin} mins
                  </div>
                  <div style={{ fontSize: "11px", color: "#F87171", fontWeight: 600 }}>
                    {loss.impactOEE} OEE
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pareto Downtime Breakdown */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Loss Pareto 80/20 Distribution
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Root cause loss categories ranked by frequency and downtime duration
              </p>
            </div>
            <Badge variant="amber">Pareto Priority</Badge>
          </div>

          <ParetoChart
            items={[
              { label: "Bearing & Spindle", count: 185, percentage: 62.0 },
              { label: "CIP Changeover", count: 45, percentage: 77.1 },
              { label: "Micro-Stops", count: 28, percentage: 86.5 },
              { label: "Speed Derating", count: 18, percentage: 92.6 },
              { label: "Quality Scraps", count: 14, percentage: 97.3 },
              { label: "Startup Tuning", count: 8, percentage: 100.0 }
            ]}
            height={200}
          />
        </Card>
      </div>

      {/* Line-by-Line OEE Comparison Grid */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Plant Line Performance Matrix
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Cross-line benchmarking across Packaging, Processing, and Canning departments
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Production Line</th>
                <th>Department</th>
                <th>Current Status</th>
                <th>Availability (A)</th>
                <th>Performance (P)</th>
                <th>Quality (Q)</th>
                <th>Overall OEE</th>
                <th>Target vs Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: "#FFFFFF" }}>Line 1 (Aseptic Bottling)</td>
                <td>Packaging</td>
                <td><Badge variant="emerald" dot>Running</Badge></td>
                <td>91.2%</td>
                <td>96.6%</td>
                <td>98.1%</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>86.4%</td>
                <td><span style={{ color: "#34D399", fontWeight: 600 }}>+1.4% vs Plan</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: "#FFFFFF" }}>Line 2 (Formulation & Blending)</td>
                <td>Processing</td>
                <td><Badge variant="rose" dot>Breakdown Paused</Badge></td>
                <td>48.0%</td>
                <td>89.0%</td>
                <td>98.2%</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#EF4444" }}>42.0%</td>
                <td><span style={{ color: "#F87171", fontWeight: 600 }}>-43.0% vs Plan</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: "#FFFFFF" }}>Line 3 (Canning Line)</td>
                <td>Packaging</td>
                <td><Badge variant="slate">Batch Completed</Badge></td>
                <td>94.5%</td>
                <td>98.0%</td>
                <td>99.1%</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>91.8%</td>
                <td><span style={{ color: "#34D399", fontWeight: 600 }}>+6.8% vs Plan</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

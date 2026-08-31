import React, { useState } from "react";
import {
  AlertOctagon,
  Activity,
  BarChart2,
  Clock,
  TrendingDown,
  Download,
  Filter,
  ExternalLink,
  ShieldAlert,
  Repeat
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { ParetoChart } from "../../components/charts/ParetoChart";
import { BarChart } from "../../components/charts/BarChart";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function BreakdownAnalysis() {
  const { breakdowns, repeatFailures, reliabilityMetrics } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState("month");

  const paretoData = [
    { label: "Gasket Rupture (HYD-002)", count: 36, percentage: 42.0 },
    { label: "Bearing Fatigue (MEC-004)", count: 22, percentage: 68.0 },
    { label: "Optical Glare (ELE-008)", count: 12, percentage: 82.0 },
    { label: "Belt Guide Jam (MEC-009)", count: 8, percentage: 91.0 },
    { label: "Solenoid Sticking (PNE-003)", count: 7, percentage: 100.0 }
  ];

  const departmentLossData = [
    { label: "Processing (Line 2)", value: 48 },
    { label: "Packaging (Line 1)", value: 32 },
    { label: "Canning (Line 3)", value: 16 },
    { label: "Utilities Backbone", value: 4 }
  ];

  const handleExport = () => {
    const csvContent =
      "Root Cause,Failure Code,Occurrences,Downtime Hours Lost,Cumulative %\n" +
      paretoData.map((d) => `"${d.label}","${d.label.split("(")[1]?.replace(")", "")}",${d.count},${(d.count * 1.8).toFixed(1)},${d.percentage}%`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Breakdown_Analysis_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Breakdown analysis report exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Breakdown Analysis & Root Cause Triage
            </h1>
            <Badge variant="cyan">Pareto 80/20 Rule</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Statistical analysis of failure modes, MTTR distributions, repeat stoppage frequencies, and corrective solutions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export Analysis
          </Button>
          <Button variant="primary" icon={ExternalLink} onClick={() => navigate("/breakdowns/downtime-impact")}>
            Downtime Financial Impact
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Plant MTTR"
          value={`${reliabilityMetrics.plantOverall.mttrHours}`}
          unit="hrs"
          trend={{ value: "Target: 1.2 hrs", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Top Failure Cause"
          value="HYD-002"
          unit="Gaskets"
          trend={{ value: "42% of total downtime", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
        <StatCard
          title="Repeat Failures"
          value={repeatFailures.length.toString()}
          unit="Identified"
          trend={{ value: "Action plans assigned", isPositive: true, text: "" }}
          icon={Repeat}
          colorVariant="blue"
        />
        <StatCard
          title="First-Time Fix Rate"
          value="88.4%"
          unit=""
          trend={{ value: "+3.2% vs last month", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="emerald"
        />
      </div>

      {/* Main Charts */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Pareto Chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Downtime Root Cause Pareto Analysis
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Rank-ordered failure categories by downtime hours lost
              </p>
            </div>
            <Badge variant="rose">Top 80% Cutoff</Badge>
          </div>

          <ParetoChart items={paretoData} height={240} />
        </Card>

        {/* Breakdown Hours by Department */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Unplanned Stoppage Hours by Production Line
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Cumulative hours lost per production facility
              </p>
            </div>
            <Badge variant="cyan">Monthly Sum</Badge>
          </div>

          <BarChart data={departmentLossData} height={240} color="#F59E0B" unit="h" />
        </Card>
      </div>

      {/* Repeat Failures Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Repeat Failures & Bad Actor Equipment Registry
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Machines with 3+ identical failure codes within a rolling 90-day window
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Repeat Failure Mode</th>
                <th>Recurrences (90d)</th>
                <th>Total Lost Hours</th>
                <th>Status / CAPA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {repeatFailures.map((rf, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{rf.assetId}</strong>
                  </td>
                  <td>{rf.assetName}</td>
                  <td>
                    <Badge variant="amber">{rf.failureCode}</Badge>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{rf.failureMode}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#EF4444" }}>
                    {rf.recurrences} times
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#FFFFFF" }}>{rf.totalDowntimeHours} hrs</td>
                  <td>
                    <Badge variant={rf.capaStatus === "Closed" ? "emerald" : "rose"}>
                      {rf.capaStatus}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/troubleshooting?search=${rf.failureCode}`)}
                    >
                      Troubleshoot
                    </Button>
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

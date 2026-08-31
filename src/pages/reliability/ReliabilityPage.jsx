import React, { useState } from "react";
import {
  Activity,
  TrendingUp,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Layers,
  Wrench
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function ReliabilityPage() {
  const { reliabilityMetrics, assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Bad Actor assets ranking
  const badActors = [
    { id: "HT-105", name: "Pasteurizer HTST-300", mtbf: 210, mttr: 4.2, availability: "88.5%", failuresCount: 5, status: "Critical" },
    { id: "LB-204", name: "Autocol Rotary Labeler", mtbf: 180, mttr: 2.8, availability: "91.2%", failuresCount: 3, status: "High" },
    { id: "FM-001", name: "Rotary Filler 12-Head", mtbf: 342, mttr: 1.4, availability: "96.4%", failuresCount: 4, status: "Medium" },
    { id: "CV-301", name: "Incline Belt Conveyor", mtbf: 390, mttr: 1.2, availability: "97.8%", failuresCount: 2, status: "Low" }
  ];

  const handleExportCSV = () => {
    const headers = "Asset ID,Name,MTBF (hrs),MTTR (hrs),Availability,Failures (90d),Status\n";
    const rows = badActors
      .map((b) => `"${b.id}","${b.name}",${b.mtbf},${b.mttr},"${b.availability}",${b.failuresCount},"${b.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reliability_MTBF_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Reliability report exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Reliability Engineering & MTBF/MTTR Analytics
            </h1>
            <Badge variant="cyan">Asset Availability Index</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Fleet-wide mean time between failures, mean time to repair, equipment availability, and bad actor containment.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Reliability Report
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Plant MTBF"
          value={`${reliabilityMetrics.plantOverall.mtbfHours}`}
          unit="Operating hrs"
          trend={{ value: "Target: 420 hrs", isPositive: false, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Plant MTTR"
          value={`${reliabilityMetrics.plantOverall.mttrHours}`}
          unit="Repair hrs"
          trend={{ value: "Target: 1.2 hrs", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Operational Availability"
          value="96.4%"
          unit=""
          trend={{ value: "+0.8% vs benchmark", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="PM Compliance Rate"
          value={`${reliabilityMetrics.plantOverall.pmComplianceRate}%`}
          unit=""
          trend={{ value: "Within target tolerance", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Charts */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* MTBF Monthly Trend */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly Plant MTBF Reliability Growth (Hours)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Continuous reliability growth trajectory tracking
              </p>
            </div>
            <Badge variant="cyan">Target: 420h</Badge>
          </div>

          <AreaChart
            data={reliabilityMetrics.monthlyTrend.map((m) => ({ label: m.month, value: m.mtbf }))}
            height={220}
            color="#38BDF8"
            unit="h"
          />
        </Card>

        {/* MTTR Monthly Trend */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly Mean Time To Repair (MTTR in Hours)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Lower values indicate faster diagnosis & resolution times
              </p>
            </div>
            <Badge variant="emerald">Target: 1.2h</Badge>
          </div>

          <AreaChart
            data={reliabilityMetrics.monthlyTrend.map((m) => ({ label: m.month, value: m.mttr }))}
            height={220}
            color="#10B981"
            unit="h"
          />
        </Card>
      </div>

      {/* Bad Actor Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Bad Actor Equipment Ranking Matrix
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Assets requiring proactive reliability engineering focus, PM interval review, or root cause elimination
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
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
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{ba.id}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ba.name}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: ba.mtbf < 250 ? "#EF4444" : "var(--text-primary)", fontWeight: 700 }}>
                    {ba.mtbf} hrs
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: ba.mttr > 2.0 ? "#F59E0B" : "var(--text-primary)", fontWeight: 700 }}>
                    {ba.mttr} hrs
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: ba.availability.startsWith("9") ? "#10B981" : "#EF4444" }}>
                      {ba.availability}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#EF4444" }}>
                    {ba.failuresCount}x
                  </td>
                  <td>
                    <Badge variant={ba.status === "Critical" ? "rose" : ba.status === "High" ? "amber" : "cyan"}>
                      {ba.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/assets/360?id=${ba.id}`)}
                    >
                      Asset 360
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

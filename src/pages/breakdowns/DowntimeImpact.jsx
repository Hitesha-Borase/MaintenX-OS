import React, { useState } from "react";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Clock,
  Download,
  Calculator,
  Layers,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function DowntimeImpact() {
  const { breakdowns, assets } = useCMMS();
  const { addToast } = useApp();

  // What-if simulator state
  const [targetMttrReduction, setTargetMttrReduction] = useState(25); // 25% reduction
  const [hourlyLineCost, setHourlyLineCost] = useState(3500); // $3500/hr

  const totalDowntimeHours = breakdowns.reduce((s, b) => s + (b.durationMinutes || 0) / 60, 0);
  const totalDirectCost = breakdowns.reduce((s, b) => s + (b.impact?.downtimeCostUSD || 0), 0);
  const totalUnitsLost = breakdowns.reduce((s, b) => s + (b.impact?.productionLossUnits || 0), 0);

  // Line impact data
  const lineImpacts = [
    { line: "Line 1 (Aseptic Bottling)", hours: 14.5, unitsLost: 8550, financialLoss: 50750, scrapRate: "2.1%" },
    { line: "Line 2 (Formulation & Pasteurization)", hours: 22.0, unitsLost: 12400, financialLoss: 77000, scrapRate: "4.8%" },
    { line: "Line 3 (Canning Line)", hours: 6.8, unitsLost: 3200, financialLoss: 23800, scrapRate: "1.2%" },
    { line: "Facilities Utilities Backbone", hours: 1.5, unitsLost: 0, financialLoss: 5250, scrapRate: "0.0%" }
  ];

  const simulatedAnnualSavings = Math.round(
    ((totalDowntimeHours * (targetMttrReduction / 100) * hourlyLineCost) * 12)
  );

  const handleExportCSV = () => {
    const headers = "Production Line,Downtime Hours,Units Lost,Financial Loss ($),Scrap Rate\n";
    const rows = lineImpacts
      .map((l) => `"${l.line}",${l.hours},${l.unitsLost},${l.financialLoss},"${l.scrapRate}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Downtime_Financial_Impact_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Downtime impact report exported.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Downtime Financial & Production Impact
            </h1>
            <Badge variant="rose">Cost of Unreliability</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Financial quantification of lost capacity, scrapped product batches, line-stoppage hourly rates, and ROI modeling.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Financial Report
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Total Financial Loss"
          value={`$${totalDirectCost.toLocaleString()}`}
          unit="Direct Outage"
          trend={{ value: "44.8 hrs total downtime", isPositive: false, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="Production Output Lost"
          value={totalUnitsLost.toLocaleString()}
          unit="Bottles/Cans"
          trend={{ value: "Across 3 production lines", isPositive: false, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="Average Hourly Line Loss"
          value={`$${hourlyLineCost}`}
          unit="/ hour"
          trend={{ value: "Line 2 highest cost rate", isPositive: false, text: "" }}
          icon={TrendingDown}
          colorVariant="rose"
        />
        <StatCard
          title="Avg Scrap Waste"
          value="2.7%"
          unit="Scrap rate"
          trend={{ value: "Thermal CIP flushes", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Main Grid: Line Impact Table & ROI Simulator */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Line by Line Financial Loss */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Facility Downtime Cost Breakdown
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Cumulative lost revenue and scrap costs per production asset line
              </p>
            </div>
            <Badge variant="rose">Direct Loss</Badge>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Production Line</th>
                  <th>Hours Lost</th>
                  <th>Units Lost</th>
                  <th>Financial Loss</th>
                </tr>
              </thead>
              <tbody>
                {lineImpacts.map((l, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{l.line}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Scrap Rate: {l.scrapRate}</div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#F59E0B", fontWeight: 700 }}>
                      {l.hours} hrs
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {l.unitsLost.toLocaleString()}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444" }}>
                      ${l.financialLoss.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* What-If Reliability ROI Calculator */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Reliability ROI & MTTR Reduction Simulator
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Project annual savings from reducing mean time to repair through PM & verified troubleshooting
              </p>
            </div>
            <Calculator size={18} color="#38BDF8" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span>Target MTTR Reduction:</span>
                <strong style={{ color: "#38BDF8" }}>{targetMttrReduction}% Reduction</strong>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={targetMttrReduction}
                onChange={(e) => setTargetMttrReduction(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#38BDF8", cursor: "pointer" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span>Average Line Cost per Hour:</span>
                <strong style={{ color: "#F59E0B" }}>${hourlyLineCost.toLocaleString()} / hr</strong>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="500"
                value={hourlyLineCost}
                onChange={(e) => setHourlyLineCost(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#F59E0B", cursor: "pointer" }}
              />
            </div>

            {/* Projected Annual Savings Banner */}
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "#10B981", textTransform: "uppercase", fontWeight: 700 }}>
                  Projected Annual Cost Recovery
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#10B981", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  +${simulatedAnnualSavings.toLocaleString()} / yr
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => addToast(`Savings plan of $${simulatedAnnualSavings.toLocaleString()} registered in CAPA budget.`, "success")}
              >
                Apply Target
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

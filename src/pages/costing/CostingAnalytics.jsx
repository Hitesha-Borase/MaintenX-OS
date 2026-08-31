import React from "react";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Sparkles,
  PieChart,
  Download,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { COSTING_DATA } from "../../data/mockCosting";
import { useApp } from "../../context/AppContext";

export function CostingAnalytics() {
  const { addToast } = useApp();
  const summary = COSTING_DATA.batchCostSummary;

  const getTagBadge = (tag) => {
    switch (tag) {
      case "FACT":
        return <Badge variant="emerald">FACT (Direct Invoice / Scan)</Badge>;
      case "CALCULATION":
        return <Badge variant="cyan">CALCULATED (Deterministic)</Badge>;
      case "ESTIMATE":
        return <Badge variant="amber">ESTIMATE (Standard Allocation)</Badge>;
      case "AI_RECOMMENDATION":
        return <Badge variant="purple">AI RECOMMENDATION</Badge>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Activity-Based Manufacturing Costing & Variance
            </h1>
            <Badge variant="cyan">ERP Ledger Reconciliation</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Standard vs actual cost accounting across materials, direct labour, machine kilowatt duty, downtime loss, and scrap waste.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={Download} onClick={() => addToast("Exporting Cost Variance Audit Ledger (CSV/Excel)...")}>
            Export Cost Model
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Actual Cost Per Unit"
          value={`$${summary.costPerUnitUSD.toFixed(2)}`}
          unit="/ unit"
          trend={{ value: `+$${summary.varianceUSD.toFixed(2)}`, isPositive: false, text: "vs $0.76 budget" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="Total Batch Actual Spend"
          value={`$${summary.totalBatchCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          unit="USD"
          trend={{ value: `+${summary.variancePercentage}% Variance`, isPositive: false, text: "absorbed" }}
          icon={TrendingDown}
          colorVariant="amber"
        />
        <StatCard
          title="Raw & Packaging Material"
          value="$14,270"
          unit="USD"
          trend={{ value: "Direct Match", isPositive: true, text: "ERP invoices" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Downtime & Scrap Waste"
          value="$980"
          unit="absorbed"
          trend={{ value: "+$730 over budget", isPositive: false, text: "Line 1 micro-stops" }}
          icon={AlertCircle}
          colorVariant="rose"
        />
      </div>

      {/* Tagged Cost Breakdown Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Detailed Batch Cost Breakdown by Category
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Batch ID: <strong style={{ color: "#38BDF8" }}>{summary.batchId}</strong> ({summary.productName})
            </p>
          </div>
          <Badge variant="cyan">Standard Absorption Model</Badge>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cost Category</th>
                <th>Source Classification</th>
                <th>Actual Cost (USD)</th>
                <th>Budget Cost (USD)</th>
                <th>Variance Gap</th>
                <th>Accounting Basis / Telemetry Source</th>
              </tr>
            </thead>
            <tbody>
              {summary.costBreakdown.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.category}</td>
                  <td>{getTagBadge(row.tag)}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    ${row.actualCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                    ${row.budgetCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <Badge variant={row.varianceUSD <= 0 ? "emerald" : "rose"}>
                      {row.varianceUSD > 0 ? `+$${row.varianceUSD.toFixed(2)}` : `$${row.varianceUSD.toFixed(2)}`} ({row.variancePercent}%)
                    </Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Cost Reduction Opportunities */}
      <Card style={{ borderLeft: "4px solid #A855F7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <Sparkles size={20} color="#A855F7" />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            AI Predictive Cost Reduction Insights
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {summary.aiCostOptimizations.map((opt, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {opt.insight}
                  </h4>
                  {getTagBadge(opt.tag)}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {opt.reason} • Confidence: <strong style={{ color: "#38BDF8" }}>{opt.confidence}</strong>
                </p>
                <div style={{ fontSize: "12px", color: "#34D399", fontWeight: 600, marginTop: "4px" }}>
                  Action: {opt.recommendedAction}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => addToast("Applied AI Cost Optimization to APS master scheduling recipe.")}
              >
                Apply Optimization
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

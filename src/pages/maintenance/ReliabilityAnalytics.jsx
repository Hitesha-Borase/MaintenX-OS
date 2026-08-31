import React, { useState } from "react";
import {
  Activity,
  Gauge,
  Clock,
  Wrench,
  DollarSign,
  Download,
  Filter,
  TrendingUp,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function ReliabilityAnalytics() {
  const { reliabilityMetrics, assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const rankingColumns = [
    {
      header: "Asset",
      accessor: "assetId",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.assetId}</div>
        </div>
      )
    },
    {
      header: "MTBF (hrs)",
      accessor: "mtbf",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val > 400 ? "#10B981" : val > 250 ? "#F59E0B" : "#EF4444" }}>
          {val}h
        </span>
      )
    },
    {
      header: "MTTR (hrs)",
      accessor: "mttr",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          {val}h
        </span>
      )
    },
    {
      header: "Availability",
      accessor: "availability",
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 95 ? "#10B981" : val > 90 ? "#38BDF8" : "#EF4444" }}>
          {val}%
        </span>
      )
    },
    {
      header: "Downtime (hrs)",
      accessor: "downtimeHours",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", color: val > 15 ? "#EF4444" : "var(--text-primary)" }}>
          {val}h
        </span>
      )
    },
    {
      header: "Repeat Events",
      accessor: "repeatFailures",
      render: (val) => (
        <Badge variant={val === 0 ? "emerald" : val > 2 ? "rose" : "amber"}>
          {val} Repeats
        </Badge>
      )
    },
    {
      header: "Status Tier",
      accessor: "status",
      render: (val) => {
        const variant = val === "Top Performer" ? "emerald" : val === "Critical Risk" ? "rose" : val === "High Risk" ? "amber" : "cyan";
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maintenance/assets/${row.assetId}`);
          }}
        >
          Asset 360°
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Reliability Engineering & MTBF / MTTR
            </h1>
            <Badge variant="cyan">Weibull Distribution</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Mean Time Between Failures, Mean Time To Repair, asset criticality ranking, and maintenance cost growth.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={Download} onClick={() => addToast("Exporting Reliability Analytics Report...")}>
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Plant MTBF"
          value={`${reliabilityMetrics.plantOverall.mtbfHours}`}
          unit="hrs"
          trend={{ value: "Target 420h", isPositive: false, text: "-34.6h variance" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Plant MTTR"
          value={`${reliabilityMetrics.plantOverall.mttrHours}`}
          unit="hrs"
          trend={{ value: "Target 1.2h", isPositive: false, text: "+25m variance" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Asset Availability"
          value={`${reliabilityMetrics.plantOverall.overallAvailability}%`}
          unit=""
          trend={{ value: "Target 95.0%", isPositive: false, text: "uptime" }}
          icon={Gauge}
          colorVariant="blue"
        />
        <StatCard
          title="Maintenance Cost (Mo)"
          value={`$${reliabilityMetrics.plantOverall.totalMaintenanceCostMonth.toLocaleString()}`}
          unit="USD"
          trend={{ value: "Under Budget", isPositive: true, text: "budget $38k" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly MTBF Growth Trend (6-Months)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Continuous reliability trend progression across all production bays
              </p>
            </div>
            <Badge variant="emerald">+24.2% Growth</Badge>
          </div>

          <AreaChart
            data={reliabilityMetrics.monthlyTrend.map((m) => ({ label: m.month, value: m.mtbf }))}
            height={200}
            color="#38BDF8"
            unit=" hrs"
          />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Monthly Maintenance Spend ($ USD)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Parts consumption, external services, and overtime repair cost
              </p>
            </div>
            <Badge variant="cyan">Budget Control</Badge>
          </div>

          <BarChart
            data={reliabilityMetrics.monthlyTrend.map((m) => ({ label: m.month, actual: m.cost, target: 38000 }))}
            height={200}
            barColor="#0284C7"
            targetColor="#F59E0B"
            yAxisUnit="$"
          />
        </Card>
      </div>

      {/* Asset Criticality & Reliability Ranking Table */}
      <Card>
        <DataTable
          title="Fleet Asset Reliability & Criticality Ranking"
          columns={rankingColumns}
          data={reliabilityMetrics.assetRanking}
          searchPlaceholder="Search machine name or asset tag..."
          onRowClick={(row) => navigate(`/maintenance/assets/${row.assetId}`)}
          exportFilename="flowstate_asset_reliability_ranking.csv"
        />
      </Card>
    </div>
  );
}

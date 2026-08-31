import React, { useState } from "react";
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Clock,
  ShieldCheck,
  Package,
  DollarSign,
  Users,
  Truck,
  Filter,
  Download,
  Calendar,
  Layers,
  Search,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function KPIAnalytics() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("last-30");

  const kpis = [
    {
      id: "kpi-oee",
      name: "Overall Equipment Effectiveness (OEE)",
      category: "Operations",
      value: "86.4%",
      target: "85.0%",
      variance: "+1.4%",
      isPositive: true,
      trend: [82, 84, 85, 87, 86, 88, 86.4],
      route: "/oee-performance"
    },
    {
      id: "kpi-sched",
      name: "Schedule Attainment Rate",
      category: "Planning",
      value: "98.2%",
      target: "95.0%",
      variance: "+3.2%",
      isPositive: true,
      trend: [94, 96, 95, 97, 98, 97.5, 98.2],
      route: "/planning"
    },
    {
      id: "kpi-yield",
      name: "First Pass Quality Yield (FPY)",
      category: "Quality",
      value: "98.1%",
      target: "98.0%",
      variance: "+0.1%",
      isPositive: true,
      trend: [97.5, 97.8, 98.0, 97.9, 98.2, 98.1],
      route: "/quality"
    },
    {
      id: "kpi-scrap",
      name: "Total Production Scrap Rate",
      category: "Quality",
      value: "0.92%",
      target: "< 1.50%",
      variance: "-0.58%",
      isPositive: true,
      trend: [1.4, 1.2, 1.1, 0.98, 0.95, 0.92],
      route: "/quality"
    },
    {
      id: "kpi-mtbf",
      name: "Mean Time Between Failures (MTBF)",
      category: "Maintenance",
      value: "385.4h",
      target: "420.0h",
      variance: "-34.6h",
      isPositive: false,
      trend: [310, 335, 360, 375, 390, 385.4],
      route: "/maintenance/reliability"
    },
    {
      id: "kpi-mttr",
      name: "Mean Time to Repair (MTTR)",
      category: "Maintenance",
      value: "1.62h",
      target: "< 1.20h",
      variance: "+0.42h",
      isPositive: false,
      trend: [2.1, 1.9, 1.8, 1.7, 1.5, 1.62],
      route: "/maintenance/reliability"
    },
    {
      id: "kpi-inv",
      name: "Inventory Record Accuracy (IRA)",
      category: "Warehouse",
      value: "99.4%",
      target: "99.0%",
      variance: "+0.4%",
      isPositive: true,
      trend: [98.5, 98.8, 99.1, 99.2, 99.4],
      route: "/inventory"
    },
    {
      id: "kpi-otif",
      name: "On-Time In-Full Delivery (OTIF)",
      category: "Logistics",
      value: "98.4%",
      target: "97.0%",
      variance: "+1.4%",
      isPositive: true,
      trend: [96.0, 96.8, 97.2, 98.0, 98.4],
      route: "/inventory"
    },
    {
      id: "kpi-labour",
      name: "Labour Efficiency & Productivity",
      category: "Human Resources",
      value: "97.4%",
      target: "95.0%",
      variance: "+2.4%",
      isPositive: true,
      trend: [94.0, 95.5, 96.2, 97.0, 97.4],
      route: "/labour"
    },
    {
      id: "kpi-cost",
      name: "Standard Manufacturing Cost Variance",
      category: "Costing",
      value: "+$0.05/u",
      target: "$0.00",
      variance: "+6.5%",
      isPositive: false,
      trend: [0.02, 0.03, 0.04, 0.06, 0.05],
      route: "/costing"
    }
  ];

  const filteredKPIs = selectedCategory === "all" ? kpis : kpis.filter((k) => k.category === selectedCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              KPI & Real-Time Enterprise Analytics
            </h1>
            <Badge variant="emerald">Live Multi-Dimensional Engine</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Executive and operational scorecard tracking key manufacturing performance indicators across facilities.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto", height: "36px", fontSize: "12px" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All KPI Categories</option>
            <option value="Operations">Operations & OEE</option>
            <option value="Quality">Quality Assurance</option>
            <option value="Maintenance">Maintenance & CMMS</option>
            <option value="Planning">Planning & MRP</option>
            <option value="Warehouse">Warehouse & Inventory</option>
            <option value="Costing">Costing & Finance</option>
            <option value="Human Resources">Labour & HR</option>
          </select>

          <select
            className="form-select"
            style={{ width: "auto", height: "36px", fontSize: "12px" }}
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              addToast(`Updated KPI date range: ${e.target.value}`);
            }}
          >
            <option value="today">Today (Shift A/B/C)</option>
            <option value="last-7">Last 7 Days</option>
            <option value="last-30">Last 30 Days (Rolling)</option>
            <option value="quarter">Current Quarter (Q3 2026)</option>
            <option value="ytd">Year to Date (2026)</option>
          </select>

          <Button
            variant="secondary"
            icon={Download}
            onClick={() => addToast("Exporting KPI Enterprise Summary (CSV/Excel)...")}
          >
            Export Scorecard
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-3">
        {filteredKPIs.map((kpi) => (
          <Card
            key={kpi.id}
            interactive
            onClick={() => navigate(kpi.route)}
            style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: `3px solid ${kpi.isPositive ? "#10B981" : "#EF4444"}` }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {kpi.category}
                </span>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                  {kpi.name}
                </h3>
              </div>
              <ExternalLink size={15} color="var(--text-muted)" />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span className="stat-value">{kpi.value}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target: {kpi.target}</span>
              </div>
              <Badge variant={kpi.isPositive ? "emerald" : "rose"}>
                {kpi.variance}
              </Badge>
            </div>

            {/* Mini Trend Line */}
            <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>30-Day Trend</span>
              <div style={{ width: "120px", height: "30px" }}>
                <AreaChart
                  data={kpi.trend.map((val, idx) => ({ label: `P${idx}`, value: val }))}
                  height={30}
                  color={kpi.isPositive ? "#10B981" : "#EF4444"}
                  gradientId={`grad-${kpi.id}`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cross-Facility KPI Performance Matrix Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Cross-Facility Scorecard Matrix
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Benchmarking Plant 1 (North Bottling) vs Plant 2 (South Canning)
            </p>
          </div>
          <Badge variant="cyan">Multi-Site Synchronization</Badge>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>KPI Metric</th>
                <th>Category</th>
                <th>Plant 1 (North)</th>
                <th>Plant 2 (South)</th>
                <th>Corporate Target</th>
                <th>Variance Gap</th>
                <th>Trend Direction</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: "#FFFFFF" }}>Overall Equipment Effectiveness (OEE)</td>
                <td>Operations</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>86.4%</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>91.8%</td>
                <td>85.0%</td>
                <td><Badge variant="emerald">+4.1% Above</Badge></td>
                <td><span style={{ color: "#34D399", fontWeight: 600 }}>↑ Improving</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: "#FFFFFF" }}>Mean Time Between Failures (MTBF)</td>
                <td>Maintenance</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#EF4444" }}>342.0h</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>435.0h</td>
                <td>420.0h</td>
                <td><Badge variant="rose">-31.5h Deficit</Badge></td>
                <td><span style={{ color: "#F87171", fontWeight: 600 }}>↓ Degrading (HT-105)</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: "#FFFFFF" }}>First Pass Quality Yield (FPY)</td>
                <td>Quality</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>98.1%</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>99.1%</td>
                <td>98.0%</td>
                <td><Badge variant="emerald">+0.6% Above</Badge></td>
                <td><span style={{ color: "#34D399", fontWeight: 600 }}>↑ Stable Grade A</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: "#FFFFFF" }}>On-Time In-Full Delivery (OTIF)</td>
                <td>Logistics</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>98.4%</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>97.8%</td>
                <td>97.0%</td>
                <td><Badge variant="emerald">+1.1% Above</Badge></td>
                <td><span style={{ color: "#34D399", fontWeight: 600 }}>↑ On Schedule</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

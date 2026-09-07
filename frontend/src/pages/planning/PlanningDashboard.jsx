import React, { useState } from "react";
import {
  CalendarRange,
  Layers,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  Building2
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { GanttTimeline } from "../../components/charts/GanttTimeline";
import { DataTable } from "../../components/tables/DataTable";
import { INITIAL_PLANNING_ORDERS, MRP_ITEMS } from "../../data/mockPlanning";
import { useApp } from "../../context/AppContext";

export function PlanningDashboard() {
  const { addToast } = useApp();
  const [plans, setPlans] = useState(INITIAL_PLANNING_ORDERS);
  const [mrpList, setMrpList] = useState(MRP_ITEMS);

  const totalDemandUnits = plans.reduce((sum, p) => sum + p.demandQty, 0);
  const shortageCount = mrpList.filter((m) => m.status.includes("Shortage") || m.status.includes("PO Required")).length;

  const handlePublishSchedule = () => {
    setPlans((prev) => prev.map((p) => ({ ...p, status: "Published" })));
    addToast("Master Production Schedule (MPS) published to MES and Shop Floor Lines!");
  };

  const planColumns = [
    {
      header: "Plan ID & Customer",
      accessor: "customer",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {row.id} • {row.customerOrderNo}
          </div>
        </div>
      )
    },
    {
      header: "Product SKU",
      accessor: "productName",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.productCode}</div>
        </div>
      )
    },
    {
      header: "Demand Qty",
      accessor: "demandQty",
      render: (val, row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
          {val.toLocaleString()} {row.unit}
        </span>
      )
    },
    {
      header: "Target Line",
      accessor: "line",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{val}</span>
    },
    {
      header: "Capacity Load",
      accessor: "capacityUtilization",
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val > 90 ? "#F59E0B" : "#10B981" }}>
            {val}%
          </span>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const variant = val === "Published" ? "emerald" : val.includes("Shortage") ? "rose" : "cyan";
        return <Badge variant={variant}>{val}</Badge>;
      }
    }
  ];

  const mrpColumns = [
    {
      header: "Material Item",
      accessor: "description",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.itemCode} • {row.category}</div>
        </div>
      )
    },
    {
      header: "On Hand Stock",
      accessor: "currentStock",
      render: (val, row) => <span style={{ fontFamily: "var(--font-mono)" }}>{val.toLocaleString()} {row.unit}</span>
    },
    {
      header: "Allocated",
      accessor: "allocated",
      render: (val, row) => <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{val.toLocaleString()} {row.unit}</span>
    },
    {
      header: "Net Projected Deficit",
      accessor: "netDeficit",
      render: (val, row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val > 0 ? "#EF4444" : "#10B981" }}>
          {val > 0 ? `-${val.toLocaleString()}` : "0"} {row.unit}
        </span>
      )
    },
    {
      header: "MRP Status",
      accessor: "status",
      render: (val) => <Badge variant={val.includes("Critical") ? "rose" : "amber"}>{val}</Badge>
    },
    {
      header: "Suggested PO",
      accessor: "suggestedPoQty",
      render: (val, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            addToast(`Generated Draft PO for ${val.toLocaleString()} ${row.unit} of ${row.itemCode}`);
          }}
        >
          Create PO ({val.toLocaleString()} {row.unit})
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
              Planning, APS & MRP Material Requirements
            </h1>
            <Badge variant="indigo">Capacity Horizon: Week 36</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Advanced planning scheduling (APS), finite capacity scheduling, takt balance, and MRP gross-to-net netting.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={CheckCircle2} onClick={handlePublishSchedule}>
            Publish Master Schedule (MPS)
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Scheduled Customer Demand"
          value={totalDemandUnits.toLocaleString()}
          unit="units"
          trend={{ value: "3 Retail Accounts", isPositive: true, text: "orders confirmed" }}
          icon={TrendingUp}
          colorVariant="blue"
        />
        <StatCard
          title="Mean Capacity Utilization"
          value="88.2%"
          unit="load"
          trend={{ value: "Optimal Takt", isPositive: true, text: "balanced lines" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Material Shortages (MRP)"
          value={shortageCount.toString()}
          unit="items"
          trend={{ value: "Ginger Extract", isPositive: false, text: "PO required" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Schedule Attainment SLA"
          value="98.2%"
          unit=""
          trend={{ value: "On-Time Dispatch", isPositive: true, text: "SLA target 95%" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* APS Schedule Gantt Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Finite Capacity Production Schedule (APS Gantt Timeline)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Interactive 24-hour job sequences, changeover buffers, and scheduled CIP windows
            </p>
          </div>
          <Badge variant="cyan">Current Time: 08:30 (Live)</Badge>
        </div>

        <GanttTimeline />
      </Card>

      {/* Customer Demand & Orders */}
      <Card>
        <DataTable
          title="Customer Demand & Master Production Schedule (MPS)"
          columns={planColumns}
          data={plans}
          searchPlaceholder="Search customer, order ID, product SKU..."
          exportFilename="flowstate_production_plan.csv"
        />
      </Card>

      {/* MRP Material Requirements Gross-to-Net Calculator */}
      <Card>
        <DataTable
          title="MRP Net Material Requirements & Shortage Alerts"
          columns={mrpColumns}
          data={mrpList}
          searchPlaceholder="Search material ingredient, code, supplier..."
          exportFilename="flowstate_mrp_requirements.csv"
        />
      </Card>
    </div>
  );
}

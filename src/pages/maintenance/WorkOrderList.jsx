import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Plus,
  Filter,
  Search,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function WorkOrderList() {
  const { workOrders, updateWorkOrderStatus } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const openCount = workOrders.filter((w) => w.status === "Open" || w.status === "Assigned").length;
  const inProgressCount = workOrders.filter((w) => w.status === "In Progress").length;
  const waitingPartsCount = workOrders.filter((w) => w.status === "Waiting for Parts").length;
  const completedCount = workOrders.filter((w) => w.status === "Completed" || w.status === "Verified" || w.status === "Closed").length;

  const columns = [
    {
      header: "WO ID & Title",
      accessor: "id",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <Wrench size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{row.id}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{row.title}</div>
          </div>
        </div>
      )
    },
    {
      header: "Asset",
      accessor: "assetName",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{row.assetId}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetName}</div>
        </div>
      )
    },
    {
      header: "Type",
      accessor: "type",
      render: (val) => <Badge variant="slate">{val}</Badge>
    },
    {
      header: "Priority",
      accessor: "priority",
      render: (val) => {
        const isP1 = val.includes("P1");
        const isP2 = val.includes("P2");
        return <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>{val}</Badge>;
      }
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const variant =
          val === "In Progress"
            ? "cyan"
            : val === "Completed" || val === "Verified"
            ? "emerald"
            : val === "Waiting for Parts"
            ? "amber"
            : "slate";
        return <Badge variant={variant} dot={val === "In Progress"}>{val}</Badge>;
      }
    },
    {
      header: "Assigned Tech",
      accessor: "assignedTechnician",
      render: (val) => (
        <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 500 }}>
          {val || "Unassigned"}
        </span>
      )
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      render: (val) => (
        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          {val}
        </span>
      )
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
            navigate(`/maintenance/work-orders/${row.id}`);
          }}
        >
          View / Edit
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
              Work Orders Management
            </h1>
            <Badge variant="cyan">{workOrders.length} Total Orders</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => navigate("/maintenance/work-orders/new")}>
            Create New Work Order
          </Button>
        </div>
      </div>

      {/* KPI Status Tickers */}
      <div className="grid-4">
        <StatCard
          title="Open / Assigned"
          value={openCount.toString()}
          unit="orders"
          trend={{ value: "Pending Start", isPositive: true, text: "triage queue" }}
          icon={Clock}
          colorVariant="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount.toString()}
          unit="active"
          trend={{ value: "Active Dispatches", isPositive: true, text: "shop-floor" }}
          icon={Wrench}
          colorVariant="cyan"
        />
        <StatCard
          title="Waiting for Parts"
          value={waitingPartsCount.toString()}
          unit="orders"
          trend={{ value: "Gaskets / Sensors", isPositive: false, text: "supply chain" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Completed / Verified"
          value={completedCount.toString()}
          unit="closed"
          trend={{ value: "100% Sign-Off", isPositive: true, text: "QA cleared" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Data Table */}
      <Card>
        <DataTable
          title="Maintenance Work Orders Register"
          columns={columns}
          data={workOrders}
          searchPlaceholder="Search work order title, ID, asset, technician, failure code..."
          onRowClick={(row) => navigate(`/maintenance/work-orders/${row.id}`)}
          exportFilename="flowstate_work_orders.csv"
        />
      </Card>
    </div>
  );
}


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Plus,
  Play,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PMScheduleList() {
  const { pmSchedules, assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list"); // list | calendar

  const dueTodayCount = pmSchedules.filter((p) => p.status === "Due Today").length;
  const overdueCount = pmSchedules.filter((p) => p.status === "Overdue").length;
  const upcomingCount = pmSchedules.filter((p) => p.status === "Upcoming").length;

  const columns = [
    {
      header: "PM Schedule Title",
      accessor: "title",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.title}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.checklistName}</div>
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
      header: "Frequency",
      accessor: "frequency",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Runtime / Trigger",
      accessor: "currentRuntimeHours",
      render: (val, row) => (
        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)" }}>
          {row.currentRuntimeHours}h / {row.runtimeThresholdHours}h
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const variant = val === "Overdue" ? "rose" : val === "Due Today" ? "amber" : "emerald";
        return <Badge variant={variant} dot={val === "Due Today" || val === "Overdue"}>{val}</Badge>;
      }
    },
    {
      header: "Due Next",
      accessor: "dueNext",
      render: (val) => (
        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          {val}
        </span>
      )
    },
    {
      header: "Assigned Tech",
      accessor: "assignedTechnician",
      render: (val) => <span style={{ fontSize: "12px", color: "#38BDF8" }}>{val}</span>
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maintenance/checklists/${row.checklistTemplateId}`);
          }}
        >
          Start PM
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
              Preventive Maintenance (PM) Scheduling
            </h1>
            <Badge variant="emerald">Calendar & Runtime Master</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Automated calendar recurrence (Daily/Weekly/Monthly/Quarterly) and runtime-based telemetry thresholds.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={RotateCcw} onClick={() => addToast("PM schedule recalculation synchronized.")}>
            Sync Schedules
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => addToast("Create PM Schedule modal opened.")}>
            Create PM Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Due Today"
          value={dueTodayCount.toString()}
          unit="tasks"
          trend={{ value: "Action Required", isPositive: false, text: "shift maintenance" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Overdue PMs"
          value={overdueCount.toString()}
          unit="tasks"
          trend={{ value: "HT-105 Pasteurizer", isPositive: false, text: "critical threshold" }}
          icon={Clock}
          colorVariant="rose"
        />
        <StatCard
          title="Upcoming Next 7 Days"
          value={upcomingCount.toString()}
          unit="tasks"
          trend={{ value: "On Schedule", isPositive: true, text: "workload balanced" }}
          icon={Calendar}
          colorVariant="cyan"
        />
        <StatCard
          title="PM Compliance Rate"
          value="96.2%"
          unit=""
          trend={{ value: "+1.8%", isPositive: true, text: "vs 95% target" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Data Table */}
      <Card>
        <DataTable
          title="Preventive Maintenance Master Schedules"
          columns={columns}
          data={pmSchedules}
          searchPlaceholder="Search PM title, asset, checklist template, technician..."
          onRowClick={(row) => navigate(`/maintenance/checklists/${row.checklistTemplateId}`)}
          exportFilename="flowstate_pm_schedules.csv"
        />
      </Card>
    </div>
  );
}

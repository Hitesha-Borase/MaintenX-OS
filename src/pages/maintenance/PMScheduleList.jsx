import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarRange,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Layers,
  Wrench,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PMScheduleList() {
  const navigate = useNavigate();
  const { pmSchedules, addPMSchedule } = useCMMS();
  const { addToast } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    assetName: "Rotary Bottling Filler (Aseptic)",
    assetId: "ASSET-001",
    frequency: "Weekly",
    assignedTo: "Marcus Vance (Senior Tech)",
    dueDate: new Date().toISOString().substring(0, 10),
    templateId: "CHK-001"
  });

  const dueTodayCount = pmSchedules.filter((s) => s.status.includes("Due Today")).length;
  const overdueCount = pmSchedules.filter((s) => s.status.includes("Overdue")).length;
  const upcomingCount = pmSchedules.filter((s) => s.status.includes("Upcoming")).length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSchedule.title.trim()) {
      addToast("Please provide schedule title.", "warning");
      return;
    }
    if (addPMSchedule) {
      addPMSchedule(newSchedule);
    }
    addToast(`PM Plan "${newSchedule.title}" created successfully!`, "success");
    setIsAddModalOpen(false);
    setNewSchedule({
      title: "",
      assetName: "Rotary Bottling Filler (Aseptic)",
      assetId: "ASSET-001",
      frequency: "Weekly",
      assignedTo: "Marcus Vance (Senior Tech)",
      dueDate: new Date().toISOString().substring(0, 10),
      templateId: "CHK-001"
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Overdue":
        return <Badge variant="rose" dot>{status}</Badge>;
      case "Due Today":
        return <Badge variant="amber" dot>{status}</Badge>;
      case "Upcoming":
        return <Badge variant="cyan">{status}</Badge>;
      case "Completed":
        return <Badge variant="emerald">{status}</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: "PM Title & Task",
      accessor: "title",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
            <CalendarRange size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{row.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              ID: {row.id} • Ref: {row.templateId}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Target Machine / Asset",
      accessor: "assetName",
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--text-primary)" }}>{row.assetName}</strong>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetId}</div>
        </div>
      )
    },
    {
      header: "Recurrence",
      accessor: "frequency",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Assigned Tech",
      accessor: "assignedTo",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{val}</span>
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      render: (val) => (
        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>
          {val}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => getStatusBadge(val)
    },
    {
      header: "Execution",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maintenance/pm-checklists/execute/${row.templateId || "CHK-001"}?asset=${row.assetId}`);
          }}
        >
          Start PM
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Preventive Maintenance (PM) Scheduling
            </h1>
            <Badge variant="emerald">Calendar & Runtime Master</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={RotateCcw} onClick={() => addToast("PM schedule recalculation synchronized.", "info")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Sync Schedules
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Create PM Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Due Today"
          value={dueTodayCount.toString()}
          unit="Tasks"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Overdue PMs"
          value={overdueCount.toString()}
          unit="Tasks"
          icon={Clock}
          colorVariant="rose"
        />
        <StatCard
          title="Upcoming Schedule"
          value={upcomingCount.toString()}
          unit="Queued"
          icon={CalendarRange}
          colorVariant="cyan"
        />
        <StatCard
          title="PM Compliance"
          value="98.2%"
          unit="On-Time Rate"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Table Section */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <DataTable
          title="Active Preventive Maintenance Schedules"
          columns={columns}
          data={pmSchedules}
          searchPlaceholder="Search PM task, machine ID, technician, recurrence..."
          exportFilename="flowstate_pm_schedules.csv"
        />
      </Card>

      {/* CREATE PM PLAN MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Preventive Maintenance Plan
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">PM Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Capper Spindle Lubrication & Torque Audit"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset</label>
                  <select
                    className="form-select"
                    value={newSchedule.assetName}
                    onChange={(e) => setNewSchedule({ ...newSchedule, assetName: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Rotary Bottling Filler (Aseptic)">Rotary Bottling Filler (Aseptic)</option>
                    <option value="Induction Cap Sealer">Induction Cap Sealer</option>
                    <option value="HTST Flash Pasteurizer">HTST Flash Pasteurizer</option>
                    <option value="Sleeve Rotary Labeler">Sleeve Rotary Labeler</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Recurrence Frequency</label>
                  <select
                    className="form-select"
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Technician</label>
                  <input
                    type="text"
                    value={newSchedule.assignedTo}
                    onChange={(e) => setNewSchedule({ ...newSchedule, assignedTo: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Initial Due Date</label>
                  <input
                    type="date"
                    value={newSchedule.dueDate}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dueDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save PM Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

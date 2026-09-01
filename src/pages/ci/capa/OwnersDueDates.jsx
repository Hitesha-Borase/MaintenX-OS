import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  Send,
  Calendar,
  UserCheck,
  ShieldAlert,
  Layers,
  Plus
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function OwnersDueDates() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [items, setItems] = useState([
    {
      id: "CA-301",
      type: "Corrective",
      action: "Replace HTST temperature modulating valve actuator diaphragm with high-temp Viton kit",
      owner: "Pedro Alves (Maintenance Lead)",
      due: "2026-09-02",
      priority: "Critical",
      status: "Overdue"
    },
    {
      id: "PA-101",
      type: "Preventive",
      action: "Monthly temperature sensor calibration schedule and dry-well verification SOP",
      owner: "Engineering Team",
      due: "2026-09-15",
      priority: "High",
      status: "On Track"
    },
    {
      id: "CA-302",
      type: "Corrective",
      action: "Replace capping spindle #4 torque clutch compression springs and re-test torque curve",
      owner: "Elena Rostova (Tooling Tech)",
      due: "2026-09-05",
      priority: "High",
      status: "On Track"
    },
    {
      id: "PA-103",
      type: "Preventive",
      action: "In-line wireless torque telemetry sensor installation on rotary carousel",
      owner: "David Kim (Automation)",
      due: "2026-08-30",
      priority: "Medium",
      status: "Completed"
    }
  ]);

  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  const [newAssign, setNewAssign] = useState({
    id: "CA-303",
    type: "Corrective",
    action: "",
    owner: "Pedro Alves (Maintenance Lead)",
    due: "2026-09-20",
    priority: "High",
    status: "On Track"
  });

  const handleSendReminder = (owner, id) => {
    addToast(`Automated escalation reminder dispatched to ${owner} for ${id}!`, "info");
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!newAssign.action.trim()) {
      addToast("Please provide an action description.", "warning");
      return;
    }

    setItems((prev) => [newAssign, ...prev]);
    addToast(`CAPA ${newAssign.id} assigned to ${newAssign.owner}!`, "success");
    setNewAssign({
      id: `CA-${Math.floor(304 + Math.random() * 50)}`,
      type: "Corrective",
      action: "",
      owner: "Pedro Alves (Maintenance Lead)",
      due: "2026-09-20",
      priority: "High",
      status: "On Track"
    });
  };

  const handleExportCSV = () => {
    const headers = "CAPA ID,Type,Action Scope,Owner,Target Due Date,Priority,Status\n";
    const rows = filteredItems
      .map((item) => `"${item.id}","${item.type}","${item.action}","${item.owner}","${item.due}","${item.priority}","${item.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CAPA_Owners_Due_Dates_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CAPA Ownership matrix exported to CSV.", "info");
  };

  const filteredItems = items.filter((item) => {
    const matchOwner = selectedOwnerFilter === "ALL" || item.owner.includes(selectedOwnerFilter);
    const matchStatus = selectedStatusFilter === "ALL" || item.status === selectedStatusFilter;
    return matchOwner && matchStatus;
  });

  const overdueCount = items.filter((i) => i.status === "Overdue").length;
  const onTrackCount = items.filter((i) => i.status === "On Track").length;
  const completedCount = items.filter((i) => i.status === "Completed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CAPA Owners & Due Dates
            </h1>
            <Badge variant="cyan">{items.length} TRACKED ASSIGNMENTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Matrix
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/capa/corrective")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Corrective (D6)
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/capa/verification")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Verification (D8)
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
          title="Overdue Actions"
          value={overdueCount.toString()}
          unit="Escalated"
          trend={{ value: "Requires immediate closure", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
          onClick={() => setSelectedStatusFilter("Overdue")}
        />
        <StatCard
          title="On-Track Programs"
          value={onTrackCount.toString()}
          unit="Active"
          trend={{ value: "Within target SLA target", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
          onClick={() => setSelectedStatusFilter("On Track")}
        />
        <StatCard
          title="Completed & Signed"
          value={completedCount.toString()}
          unit="Verified"
          trend={{ value: "Effectiveness confirmed", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => setSelectedStatusFilter("Completed")}
        />
        <StatCard
          title="On-Time Delivery SLA"
          value="94.2%"
          unit="SLA"
          trend={{ value: "Accountability metric", isPositive: true, text: "" }}
          icon={UserCheck}
          colorVariant="cyan"
        />
      </div>

      {/* Filter Row */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Filter Status:</span>
            {["ALL", "Overdue", "On Track", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: selectedStatusFilter === st ? 800 : 600,
                  backgroundColor: selectedStatusFilter === st ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  color: selectedStatusFilter === st ? "#261603" : "var(--text-secondary)",
                  border: selectedStatusFilter === st ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  background: selectedStatusFilter === st ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  cursor: "pointer"
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Showing {filteredItems.length} of {items.length} assignments
          </div>
        </div>
      </Card>

      {/* Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {filteredItems.map((item) => {
          const isOverdue = item.status === "Overdue";
          const isCompleted = item.status === "Completed";
          const isCorrective = item.type === "Corrective";

          return (
            <Card
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px",
                borderLeft: `4px solid ${isOverdue ? "#DC2626" : isCompleted ? "#059669" : "#D97706"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Users size={16} color={isOverdue ? "#DC2626" : isCompleted ? "#059669" : "#D97706"} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {item.id}
                  </span>
                  <Badge variant={isCorrective ? "rose" : "cyan"}>{item.type}</Badge>
                  <Badge variant={isOverdue ? "rose" : isCompleted ? "emerald" : "amber"}>
                    {item.status}
                  </Badge>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.4, fontWeight: 600 }}>
                  {item.action}
                </p>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Assigned Owner: <strong style={{ color: "var(--text-primary)" }}>{item.owner}</strong></span>
                  <span>Target Due: <strong style={{ color: isOverdue ? "#DC2626" : isCompleted ? "#059669" : "#8C5B23" }}>{item.due}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {isOverdue && (
                  <button
                    onClick={() => handleSendReminder(item.owner, item.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      color: "#DC2626",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Send size={12} /> Send Escalation
                  </button>
                )}

                <button
                  onClick={() => navigate(isCorrective ? "/ci/capa/corrective" : "/ci/capa/preventive")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-card-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Assign Ownership Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Assign CAPA Ownership & Set Target SLA
        </div>

        <form onSubmit={handleAddAssignment} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Action Classification *</label>
              <select
                value={newAssign.type}
                onChange={(e) => setNewAssign({ ...newAssign, type: e.target.value })}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="Corrective">Corrective Action (Immediate)</option>
                <option value="Preventive">Preventive Action (Systemic)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Responsible Owner *</label>
              <select
                value={newAssign.owner}
                onChange={(e) => setNewAssign({ ...newAssign, owner: e.target.value })}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="Pedro Alves (Maintenance Lead)">Pedro Alves (Maintenance Lead)</option>
                <option value="Elena Rostova (Tooling Tech)">Elena Rostova (Tooling Tech)</option>
                <option value="David Kim (Automation Lead)">David Kim (Automation Lead)</option>
                <option value="Quality Assurance Team">Quality Assurance Team</option>
                <option value="Engineering Team">Engineering Team</option>
              </select>
            </div>

            <div>
              <label className="form-label">Target Completion Due Date *</label>
              <input
                type="date"
                value={newAssign.due}
                onChange={(e) => setNewAssign({ ...newAssign, due: e.target.value })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Action Scope & Deliverable *</label>
            <textarea
              rows={2}
              placeholder="Describe exact deliverable, engineering sign-off requirements, or replacement scope..."
              value={newAssign.action}
              onChange={(e) => setNewAssign({ ...newAssign, action: e.target.value })}
              className="form-textarea"
              style={{ backgroundColor: "#FFFFFF" }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
            <button
              type="submit"
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                color: "#261603",
                border: "1px solid #E8C182",
                boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={14} /> Assign Accountability
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

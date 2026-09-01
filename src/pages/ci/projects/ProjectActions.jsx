import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Plus,
  Download,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Calendar,
  User,
  Check
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ProjectActions() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [actions, setActions] = useState([
    {
      id: "ACT-01",
      project: "CI-001",
      description: "Kaizen event — filler nozzle flow rate dynamic laser calibration",
      owner: "Ahmed Hassan",
      due: "2026-09-07",
      status: "Open"
    },
    {
      id: "ACT-02",
      project: "CI-002",
      description: "Reduce CIP pre-rinse cycle from 8 to 5 min by modulating burst wash valves",
      owner: "Engineering Team",
      due: "2026-09-10",
      status: "Open"
    },
    {
      id: "ACT-03",
      project: "CI-003",
      description: "Install Cognex 2D barcode inspection camera on labeling outfeed conveyor",
      owner: "Maria Santos",
      due: "2026-08-28",
      status: "Complete"
    }
  ]);

  const [newAction, setNewAction] = useState({
    project: "CI-001",
    description: "",
    owner: "Ahmed Hassan",
    due: "2026-09-15"
  });

  const handleClose = (id) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Complete" } : a))
    );
    addToast(`Action ${id} marked complete and closed!`, "success");
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAction.description.trim()) {
      addToast("Please provide action deliverable description.", "warning");
      return;
    }

    const id = `ACT-0${actions.length + 1}`;
    setActions((prev) => [
      ...prev,
      {
        ...newAction,
        id,
        status: "Open"
      }
    ]);
    addToast(`Kaizen Action ${id} added to ${newAction.project}!`, "success");
    setNewAction({
      project: "CI-001",
      description: "",
      owner: "Ahmed Hassan",
      due: "2026-09-15"
    });
  };

  const handleExportCSV = () => {
    const headers = "Action ID,Project ID,Description,Owner,Due Date,Status\n";
    const rows = actions
      .map((a) => `"${a.id}","${a.project}","${a.description}","${a.owner}","${a.due}","${a.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Project_Actions_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Project actions register exported to CSV.", "info");
  };

  const openCount = actions.filter((a) => a.status === "Open").length;
  const completeCount = actions.filter((a) => a.status === "Complete").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI Project Work Actions
            </h1>
            <Badge variant="cyan">{actions.length} WORK ITEMS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Projects List
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
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
          title="Open Work Items"
          value={openCount.toString()}
          unit="In Progress"
          trend={{ value: "Active Kaizen execution", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Completed & Closed"
          value={completeCount.toString()}
          unit="Delivered"
          trend={{ value: "100% QA verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Velocity"
          value="3.8 Days"
          unit="Avg Duration"
          trend={{ value: "Within Kaizen sprint SLA", isPositive: true, text: "" }}
          icon={CheckSquare}
          colorVariant="cyan"
        />
        <StatCard
          title="Implementation Rate"
          value="96.5%"
          unit="Compliance"
          trend={{ value: "Action completion velocity", isPositive: true, text: "" }}
          icon={Briefcase}
          colorVariant="emerald"
        />
      </div>

      {/* Action Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {actions.map((a) => {
          const isComplete = a.status === "Complete";

          return (
            <Card
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px",
                borderLeft: `4px solid ${isComplete ? "#059669" : "#0284C7"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <CheckSquare size={16} color={isComplete ? "#059669" : "#0284C7"} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {a.id}
                  </span>
                  <Badge variant="cyan">{a.project}</Badge>
                  <Badge variant={isComplete ? "emerald" : "amber"}>{a.status}</Badge>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.4, fontWeight: 600 }}>
                  {a.description}
                </p>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Owner: <strong style={{ color: "var(--text-primary)" }}>{a.owner}</strong></span>
                  <span>Target Due: <strong style={{ color: isComplete ? "#059669" : "#8C5B23" }}>{a.due}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {!isComplete ? (
                  <button
                    onClick={() => handleClose(a.id)}
                    style={{
                      padding: "6px 14px",
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
                      gap: "4px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Check size={14} /> Mark Complete
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700, fontSize: "12px" }}>
                    <CheckCircle2 size={16} /> Complete & Verified
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Action Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Log Kaizen Action Item
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Parent CI Project *</label>
              <select
                value={newAction.project}
                onChange={(e) => setNewAction({ ...newAction, project: e.target.value })}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="CI-001">CI-001: OEE Improvement — Line 1</option>
                <option value="CI-002">CI-002: CIP Cycle Time Reduction</option>
                <option value="CI-003">CI-003: Label Application Elimination</option>
              </select>
            </div>

            <div>
              <label className="form-label">Assigned Owner *</label>
              <input
                type="text"
                value={newAction.owner}
                onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Target Completion Date *</label>
              <input
                type="date"
                value={newAction.due}
                onChange={(e) => setNewAction({ ...newAction, due: e.target.value })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Action Work Item Deliverable *</label>
            <textarea
              rows={2}
              placeholder="e.g. Conduct ultrasonic leak audit on steam manifold and log decibel readings..."
              value={newAction.description}
              onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
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
              <Plus size={14} /> Add Work Item
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

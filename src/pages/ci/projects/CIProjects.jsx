import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Download,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  DollarSign
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function CIProjects() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [projects, setProjects] = useState([
    {
      id: "CI-001",
      title: "OEE Improvement — Line 1 Filler",
      owner: "Ahmed Hassan (Lead CI)",
      target: "$42,000",
      actual: "$38,200",
      progress: 91,
      status: "Active"
    },
    {
      id: "CI-002",
      title: "CIP Cycle Time & Water Consumption Reduction",
      owner: "Engineering Team",
      target: "$18,000",
      actual: "$14,800",
      progress: 82,
      status: "Active"
    },
    {
      id: "CI-003",
      title: "Label Application Defect Elimination & Vision Upgrade",
      owner: "Maria Santos (Packaging)",
      target: "$11,200",
      actual: "$11,200",
      progress: 100,
      status: "Completed"
    }
  ]);

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("Ahmed Hassan (Lead CI)");
  const [target, setTarget] = useState("$25,000");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast("Please provide a project title.", "warning");
      return;
    }

    const id = `CI-00${projects.length + 1}`;
    setProjects((prev) => [
      ...prev,
      {
        id,
        title,
        owner,
        target,
        actual: "$0",
        progress: 10,
        status: "Active"
      }
    ]);
    addToast(`CI Kaizen Project ${id} created and registered!`, "success");
    setTitle("");
  };

  const handleExportCSV = () => {
    const headers = "Project ID,Title,Owner,Target Savings,Realized Savings,Progress %,Status\n";
    const rows = projects
      .map((p) => `"${p.id}","${p.title}","${p.owner}","${p.target}","${p.actual}",${p.progress},"${p.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Projects_Register_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CI Projects register exported to CSV.", "info");
  };

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI Projects & Kaizen Programs
            </h1>
            <Badge variant="cyan">{projects.length} KAIZEN PROJECTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/actions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Project Actions
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
          title="Active Projects"
          value={activeCount.toString()}
          unit="In-Flight"
          trend={{ value: "Active Kaizen execution", isPositive: true, text: "" }}
          icon={Briefcase}
          colorVariant="cyan"
        />
        <StatCard
          title="Completed & Signed"
          value={completedCount.toString()}
          unit="Closed"
          trend={{ value: "100% benefits verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Target Savings"
          value="$71,200"
          unit="Annualized"
          trend={{ value: "Across active pipeline", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="amber"
        />
        <StatCard
          title="Realized Run-Rate"
          value="$64,200"
          unit="Realized"
          trend={{ value: "90.1% realization rate", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
      </div>

      {/* Project Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {projects.map((p) => {
          const isCompleted = p.status === "Completed";

          return (
            <Card
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px",
                borderLeft: `4px solid ${isCompleted ? "#059669" : "#0284C7"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Briefcase size={16} color={isCompleted ? "#059669" : "#0284C7"} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {p.id}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {p.title}
                  </span>
                  <Badge variant={isCompleted ? "emerald" : "cyan"}>{p.status}</Badge>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Owner: <strong style={{ color: "var(--text-primary)" }}>{p.owner}</strong></span>
                  <span>Target: <strong style={{ color: "#8C5B23" }}>{p.target}</strong></span>
                  <span>Realized: <strong style={{ color: "#059669" }}>{p.actual}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/ci/projects/actions")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
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
                  <span>Work Items</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Project Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Initiate New CI Kaizen Project
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label className="form-label">Project Title & Objective *</label>
              <input
                type="text"
                placeholder="e.g. Bottling Line 1 Micro-Stop Reduction & Starwheel Alignment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Project Lead / Owner *</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Annual Savings Target *</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>
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
              <Plus size={14} /> Create Kaizen Project
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

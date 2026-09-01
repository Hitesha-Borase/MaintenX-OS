import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Plus,
  Download,
  ArrowRight,
  Sparkles,
  TrendingUp,
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Engineering() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [projects, setProjects] = useState([
    {
      id: "ENG-2026-01",
      name: "Filler Line 1 — Volumetric Servo Dosing & Fill Volume Upgrade",
      status: "In Progress",
      budget: "$38,000",
      spent: "$26,400",
      lead: "Ahmed Hassan",
      phase: "Installation & FAT"
    },
    {
      id: "ENG-2026-02",
      name: "CIP Skid Automation & Burst Wash Retrofit",
      status: "Design Phase",
      budget: "$44,400",
      spent: "$12,000",
      lead: "David Kim",
      phase: "P&ID Review"
    }
  ]);

  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("$25,000");
  const [newLead, setNewLead] = useState("Ahmed Hassan");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      addToast("Please provide an engineering project name.", "warning");
      return;
    }

    const id = `ENG-2026-0${projects.length + 1}`;
    setProjects((prev) => [
      ...prev,
      {
        id,
        name: newName,
        status: "Design Phase",
        budget: newBudget,
        spent: "$0",
        lead: newLead,
        phase: "Concept & Spec"
      }
    ]);
    addToast(`Engineering Capex Project ${id} logged!`, "success");
    setNewName("");
  };

  const handleExportCSV = () => {
    const headers = "Project ID,Project Name,Status,Budget,Spent,Lead,Phase\n";
    const rows = projects
      .map((p) => `"${p.id}","${p.name}","${p.status}","${p.budget}","${p.spent}","${p.lead}","${p.phase}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Engineering_Projects_Capex_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Engineering capex register exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Engineering Dashboard & Capex
            </h1>
            <Badge variant="cyan">{projects.length} CAPEX PROJECTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Capex CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Standards
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/reliability")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Reliability Insights
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
          title="Open Capex Projects"
          value={projects.length.toString()}
          unit="Active"
          trend={{ value: "Facility upgrades in progress", isPositive: true, text: "" }}
          icon={Settings}
          colorVariant="cyan"
        />
        <StatCard
          title="Change Requests"
          value="3 Pending"
          unit="Review"
          trend={{ value: "Awaiting engineering sign-off", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="CAPEX Spend YTD"
          value="$82,400"
          unit="Spent"
          trend={{ value: "vs. $110,000 annual budget", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Budget Variance"
          value="-4.2%"
          unit="Under Budget"
          trend={{ value: "Favorable capex control", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Engineering Projects List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {projects.map((proj) => (
          <Card
            key={proj.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px",
              borderLeft: "4px solid #0284C7",
              boxSizing: "border-box",
              minWidth: 0,
              width: "100%"
            }}
          >
            <div style={{ minWidth: "220px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Settings size={16} color="#0284C7" />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {proj.id}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {proj.name}
                </span>
                <Badge variant="cyan">{proj.status}</Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <span>Budget: <strong style={{ color: "var(--text-primary)" }}>{proj.budget}</strong></span>
                <span>Spent to Date: <strong style={{ color: "#059669" }}>{proj.spent}</strong></span>
                <span>Lead Engineer: <strong style={{ color: "var(--text-primary)" }}>{proj.lead}</strong></span>
                <span>Phase: <strong style={{ color: "#8C5B23" }}>{proj.phase}</strong></span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => addToast(`Opening engineering dossier for ${proj.id}...`, "info")}
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
                <span>Engineering Spec</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Project Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Register Capital Engineering Modification Project
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label className="form-label">Project Scope & Machine Target *</label>
              <input
                type="text"
                placeholder="e.g. Pasteurizer Holding Tube Insulation & Thermal Jacket Retrofit"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Lead Project Engineer *</label>
              <input
                type="text"
                value={newLead}
                onChange={(e) => setNewLead(e.target.value)}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Capex Budget ($) *</label>
              <input
                type="text"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
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
              <Plus size={14} /> Log Capex Project
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

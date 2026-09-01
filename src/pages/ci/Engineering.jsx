import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Plus,
  Download,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  User,
  X
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [newProject, setNewProject] = useState({
    name: "",
    budget: "$25,000",
    lead: "Ahmed Hassan",
    phase: "Concept & Spec"
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      addToast("Please provide an engineering project name.", "warning");
      return;
    }

    const nextNum = projects.length + 1;
    const id = `ENG-2026-0${nextNum}`;
    setProjects((prev) => [
      {
        id,
        name: newProject.name.trim(),
        status: "Design Phase",
        budget: newProject.budget.startsWith("$") ? newProject.budget : `$${newProject.budget}`,
        spent: "$0",
        lead: newProject.lead.trim(),
        phase: newProject.phase
      },
      ...prev
    ]);
    addToast(`Engineering Capex Project ${id} registered successfully!`, "success");
    setNewProject({
      name: "",
      budget: "$25,000",
      lead: "Ahmed Hassan",
      phase: "Concept & Spec"
    });
    setIsModalOpen(false);
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

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.lead?.toLowerCase().includes(q) ||
        p.budget?.toLowerCase().includes(q) ||
        p.spent?.toLowerCase().includes(q) ||
        p.phase?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
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
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Log Capex Project
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Capex CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Standards
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/reliability")} style={{ fontSize: "12px", padding: "7px 12px" }}>
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

      {/* Structured Projects Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "150px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Design Phase">Design Phase</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredProjects.length}</strong> of {projects.length} Capex Projects
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project Scope & Target</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Lead Engineer</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Capex Budget</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Spent to Date</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Phase</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj) => {
                  return (
                    <tr
                      key={proj.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {proj.id}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {proj.name}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          <User size={13} color="var(--text-muted)" />
                          <span>{proj.lead}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23" }}>
                          {proj.budget}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>
                          {proj.spent}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {proj.phase}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Badge variant={proj.status === "In Progress" ? "cyan" : "amber"}>{proj.status}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => addToast(`Opening engineering dossier for ${proj.id}...`, "info")}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Spec Dossier
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No engineering capex projects match the search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* POPUP MODAL: REGISTER CAPEX PROJECT */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(26, 15, 2, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#261603" }}>
                  <Settings size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Log Capital Engineering Project
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Register a new Capex project or machine upgrade
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAdd} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                  Project Scope & Machine Target *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pasteurizer Holding Tube Insulation & Thermal Jacket Retrofit"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "38px", fontSize: "13px" }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Lead Project Engineer *
                  </label>
                  <input
                    type="text"
                    value={newProject.lead}
                    onChange={(e) => setNewProject({ ...newProject, lead: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Capex Budget ($) *
                  </label>
                  <input
                    type="text"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                  Initial Project Phase *
                </label>
                <select
                  value={newProject.phase}
                  onChange={(e) => setNewProject({ ...newProject, phase: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "38px", fontSize: "13px" }}
                >
                  <option value="Concept & Spec">Concept & Spec</option>
                  <option value="P&ID Review">P&ID Review</option>
                  <option value="Installation & FAT">Installation & FAT</option>
                  <option value="Commissioning">Commissioning</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Register Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

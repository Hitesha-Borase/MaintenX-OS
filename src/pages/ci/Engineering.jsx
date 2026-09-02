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
  X,
  Zap,
  Layers,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCI } from "../../context/CIContext";
import { useApp } from "../../context/AppContext";

export function Engineering() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    capexProjects = [],
    createCapexProject,
    investigations = [],
    ciProjects = [],
    openCapexCount
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    budget: "50000",
    estimatedCost: "45000",
    owner: "David Kim (Lead CI)",
    linkedRcaId: investigations[0]?.id || "",
    linkedProjectId: ciProjects[0]?.id || "",
    engineeringJustification: ""
  });

  const totalBudget = useMemo(() => {
    return capexProjects.reduce((acc, c) => acc + (Number(c.budget) || 0), 0);
  }, [capexProjects]);

  const totalActual = useMemo(() => {
    return capexProjects.reduce((acc, c) => acc + (Number(c.actualCost) || 0), 0);
  }, [capexProjects]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      addToast("Please provide an engineering project name.", "warning");
      return;
    }

    createCapexProject(newProject);
    setNewProject({
      name: "",
      budget: "50000",
      estimatedCost: "45000",
      owner: "David Kim (Lead CI)",
      linkedRcaId: investigations[0]?.id || "",
      linkedProjectId: ciProjects[0]?.id || "",
      engineeringJustification: ""
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Capex ID,Project Name,Asset ID,Linked RCA,Linked CI Project,Budget,Actual Spent,Status,Owner,Target Date,Approval Status\n";
    const rows = filteredProjects
      .map((p) => `"${p.id}","${p.name}","${p.assetId}","${p.linkedRcaId || "-"}","${p.linkedProjectId || "-"}","${p.budget}","${p.actualCost}","${p.status}","${p.owner}","${p.targetCommissionDate}","${p.approvalStatus}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Engineering_Capex_Register_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Engineering Capex register exported to CSV.", "info");
  };

  const filteredProjects = useMemo(() => {
    return capexProjects.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.dossierRef?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [capexProjects, statusFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Engineering Capex & Permanent Redesign
            </h1>
            <Badge variant="cyan">{capexProjects.length} CAPITAL INITIATIVES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Capex CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Kaizen Projects
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Create Capex Project
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
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
          title="Total Capex Budget"
          value={`$${totalBudget.toLocaleString()}`}
          unit="Approved Allocation"
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Committed / Spent"
          value={`$${totalActual.toLocaleString()}`}
          unit="Actual Incurred"
          icon={TrendingUp}
          colorVariant="cyan"
        />
        <StatCard
          title="Active Redesigns"
          value={openCapexCount.toString()}
          unit="In Engineering Review"
          icon={Zap}
          colorVariant="amber"
        />
        <StatCard
          title="P&ID Dossiers"
          value="100%"
          unit="Engineering Approved"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search Capex project name, ID, owner or dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Capex Statuses</option>
              <option value="Budget Approved">Budget Approved</option>
              <option value="Under Engineering Review">Under Engineering Review</option>
              <option value="Execution">Execution</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Capex Initiative</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Origins (RCA / Kaizen)</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Budget / Actual</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Engineering Lead</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Dossier Ref</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {p.id} • Target: {p.targetCommissionDate}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "#8C5B23" }}>
                    <div>RCA: {p.linkedRcaId || "Direct Initiative"}</div>
                    <div style={{ color: "var(--text-muted)" }}>Project: {p.linkedProjectId || "Standalone"}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                      Budget: ${p.budget?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: "#059669", fontFamily: "var(--font-mono)" }}>
                      Spent: ${p.actualCost?.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {p.owner}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#0284C7", fontWeight: 700 }}>
                    {p.dossierRef}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={p.status === "Budget Approved" ? "emerald" : "amber"}>
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Initiate Engineering Capex Project
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Capex Redesign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Tri-Clamp Steam Modulating Valve Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Linked RCA Investigation</label>
                  <select
                    value={newProject.linkedRcaId}
                    onChange={(e) => setNewProject({ ...newProject, linkedRcaId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">Direct Engineering Initiative</option>
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Linked CI Project</label>
                  <select
                    value={newProject.linkedProjectId}
                    onChange={(e) => setNewProject({ ...newProject, linkedProjectId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">Standalone Capex</option>
                    {ciProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.id} — {p.name.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Approved Capex Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Engineering Lead</label>
                  <input
                    type="text"
                    required
                    value={newProject.owner}
                    onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Engineering Justification & P&ID Scope</label>
                <textarea
                  rows={3}
                  placeholder="Describe the permanent equipment modification to eliminate failure modes..."
                  value={newProject.engineeringJustification}
                  onChange={(e) => setNewProject({ ...newProject, engineeringJustification: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit for GM Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Download,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  X,
  Target,
  User,
  Activity
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

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    owner: "Ahmed Hassan (Lead CI)",
    target: "$25,000"
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast("Please provide a project title.", "warning");
      return;
    }

    const nextNum = projects.length + 1;
    const id = `CI-00${nextNum}`;
    const newProject = {
      id,
      title: formData.title.trim(),
      owner: formData.owner.trim() || "CI Team",
      target: formData.target.startsWith("$") ? formData.target : `$${formData.target}`,
      actual: "$0",
      progress: 15,
      status: "Active"
    };

    setProjects((prev) => [newProject, ...prev]);
    addToast(`CI Kaizen Project ${id} created successfully!`, "success");
    setFormData({
      title: "",
      owner: "Ahmed Hassan (Lead CI)",
      target: "$25,000"
    });
    setIsModalOpen(false);
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

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.owner?.toLowerCase().includes(q) ||
        p.target?.toLowerCase().includes(q) ||
        p.actual?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [projects, searchQuery, statusFilter]);

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
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
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Initiate Project
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/actions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Project Actions
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
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

      {/* Main Structured Projects Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Filter & Search Toolbar */}
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
                style={{ height: "36px", fontSize: "12px", width: "140px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredProjects.length}</strong> of {projects.length} Kaizen Projects
          </div>
        </div>

        {/* Clean Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project Title & Scope</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Lead / Owner</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Savings</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Realized Savings</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", width: "160px" }}>Progress</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => {
                  const isCompleted = p.status === "Completed";
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {p.id}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {p.title}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          <User size={13} color="var(--text-muted)" />
                          <span>{p.owner}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23" }}>
                          {p.target}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>
                          {p.actual}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                            <div
                              style={{
                                width: `${p.progress}%`,
                                height: "100%",
                                background: isCompleted
                                  ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                                  : "linear-gradient(90deg, #E2B670 0%, #C89547 100%)",
                                borderRadius: "3px"
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", minWidth: "32px" }}>
                            {p.progress}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Badge variant={isCompleted ? "emerald" : "cyan"}>{p.status}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => navigate("/ci/projects/actions")}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Work Items
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No Kaizen projects match the selected search or status criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* POPUP MODAL: INITIATE NEW CI KAIZEN PROJECT */}
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
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Initiate CI Kaizen Project
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Register a new continuous improvement initiative
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

            {/* Modal Body / Form */}
            <form onSubmit={handleAdd} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                  Project Title & Objective *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bottling Line 1 Micro-Stop Reduction & Starwheel Alignment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "38px", fontSize: "13px" }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Project Lead / Owner *
                  </label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Annual Target Savings *
                  </label>
                  <input
                    type="text"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

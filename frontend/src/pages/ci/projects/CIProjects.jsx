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
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";
import { ciService } from "../../../services/ciService";

export function CIProjects() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  // Trigger live GET /api/v1/ci/projects on mount
  React.useEffect(() => {
    ciService.getProjects().catch((err) => console.warn("Live projects fetch:", err.message));
  }, []);
  const {
    ciProjects = [],
    createProject,
    updateProject,
    deleteProject,
    investigations = [],
    activeProjectsCount,
    realizedSavingsTotal,
    projectedSavingsTotal,
    currentUser
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Kaizen Event",
    linkedRcaId: investigations[0]?.id || "",
    owner: currentUser?.name || currentUser?.email || "CI Engineer",
    sponsor: "Plant Operations",
    projectedSavingsAnnual: "",
    realizedSavingsYTD: "",
    baselineMetric: "",
    targetMetric: "",
    targetDate: new Date(Date.now() + 60 * 86400000).toISOString().substring(0, 10)
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast("Please provide a project title.", "warning");
      return;
    }

    await createProject({
      ...formData,
      projectedSavingsAnnual: Number(formData.projectedSavingsAnnual) || 0,
      realizedSavingsYTD: Number(formData.realizedSavingsYTD) || 0,
      benefitStatus: Number(formData.realizedSavingsYTD) > 0 ? "Pending Verification" : "Draft"
    });
    setFormData({
      name: "",
      type: "Kaizen Event",
      linkedRcaId: investigations[0]?.id || "",
      owner: currentUser?.name || currentUser?.email || "CI Engineer",
      sponsor: "Plant Operations",
      projectedSavingsAnnual: "",
      realizedSavingsYTD: "",
      baselineMetric: "",
      targetMetric: "",
      targetDate: new Date(Date.now() + 60 * 86400000).toISOString().substring(0, 10)
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Project ID,Project Name,Type,Linked RCA,Owner,Sponsor,Status,Progress %,Projected Savings,Realized Savings,Benefit Status\n";
    const rows = filteredProjects
      .map((p) => `"${p.id}","${p.name}","${p.type}","${p.linkedRcaId || "-"}","${p.owner}","${p.sponsor}","${p.status}",${p.progress || 0},${p.projectedSavingsAnnual},${p.realizedSavingsYTD},"${p.benefitStatus}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Kaizen_Projects_Register_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CI Projects register exported to CSV.", "info");
  };

  const filteredProjects = useMemo(() => {
    return ciProjects.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesType = typeFilter === "ALL" || p.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [ciProjects, statusFilter, typeFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI & Kaizen Projects Register
            </h1>
            <Badge variant="cyan">{ciProjects.length} CONTINUOUS IMPROVEMENT INITIATIVES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Register CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Launch CI Project
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
          title="Active Projects"
          value={activeProjectsCount.toString()}
          unit="In Flight"
          icon={Briefcase}
          colorVariant="cyan"
        />
        <StatCard
          title="Realized Benefit"
          value={`$${realizedSavingsTotal.toLocaleString()}`}
          unit="Verified YTD"
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Projected Target"
          value={`$${projectedSavingsTotal.toLocaleString()}`}
          unit="Annual Commitment"
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="Average ROI"
          value="340%"
          unit="Financial Multiple"
          icon={Target}
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
              placeholder="Search CI project name, owner, type or ID..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Methodologies</option>
              <option value="DMAIC 6-Sigma">DMAIC 6-Sigma</option>
              <option value="Kaizen Event">Kaizen Event</option>
              <option value="SMED Rapid Setup">SMED Rapid Setup</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Implementation">Implementation</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Project Scope</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Methodology</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked RCA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Owner / Sponsor</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Projected / Realized</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Benefit Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No continuous improvement or Kaizen projects found. Click <strong>"Launch CI Project"</strong> to initiate one.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.id} • Target: {p.targetDate}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{p.type}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                    {p.linkedRcaId || "Direct Kaizen"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div>{p.owner}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.sponsor}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", fontSize: "12px" }}>
                      ${p.realizedSavingsYTD?.toLocaleString()} (Realized)
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      ${p.projectedSavingsAnnual?.toLocaleString()} (Projected)
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={p.benefitStatus === "Verified & Locked" ? "emerald" : p.benefitStatus === "Pending Verification" ? "amber" : "gray"}>
                      {p.benefitStatus}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => navigate("/ci/projects/benefits")}
                        title="Benefits Verification"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <ShieldCheck size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete CI Project "${p.name}" (${p.id})?`)) {
                            await deleteProject(p.id);
                          }
                        }}
                        title="Delete CI Project"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#DC2626",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Briefcase size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Initiate CI / Kaizen Project
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Line 1 Filler Capping Quality & Yield Optimization"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">CI Methodology</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Kaizen Event">Kaizen Rapid Event</option>
                    <option value="DMAIC 6-Sigma">DMAIC 6-Sigma</option>
                    <option value="SMED Rapid Setup">SMED Setup Reduction</option>
                    <option value="Yield Optimization">Yield Optimization</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Linked RCA</label>
                  <select
                    value={formData.linkedRcaId}
                    onChange={(e) => setFormData({ ...formData, linkedRcaId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">Direct Initiative</option>
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 24)}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Project Owner</label>
                  <input
                    type="text"
                    required
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Projected Annual Savings ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={formData.projectedSavingsAnnual}
                    onChange={(e) => setFormData({ ...formData, projectedSavingsAnnual: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Realized Savings YTD ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000 (if already verified)"
                    value={formData.realizedSavingsYTD}
                    onChange={(e) => setFormData({ ...formData, realizedSavingsYTD: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Baseline Metric Statement</label>
                  <input
                    type="text"
                    placeholder="e.g. Jam rate 1.4%, 8.2 hrs loss/mo"
                    value={formData.baselineMetric}
                    onChange={(e) => setFormData({ ...formData, baselineMetric: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Metric Objective</label>
                  <input
                    type="text"
                    placeholder="e.g. Jam rate < 0.1%, zero jams"
                    value={formData.targetMetric}
                    onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Launch Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

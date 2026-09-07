import React, { useState, useMemo } from "react";
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
  Check,
  Search,
  Filter,
  X,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function ProjectActions() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    capaActions = [],
    ciProjects = [],
    createCapaAction,
    updateCapaStatus,
    overdueCapaCount
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAction, setNewAction] = useState({
    projectId: ciProjects[0]?.id || "PRJ-CI-001",
    description: "",
    actionType: "Corrective",
    owner: "David Kim (Lead CI)",
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().substring(0, 10),
    priority: "High"
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAction.description.trim()) {
      addToast("Please provide action deliverable description.", "warning");
      return;
    }

    createCapaAction(newAction);
    setNewAction({
      projectId: ciProjects[0]?.id || "PRJ-CI-001",
      description: "",
      actionType: "Corrective",
      owner: "David Kim (Lead CI)",
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().substring(0, 10),
      priority: "High"
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Action ID,Linked Project,Description,Owner,Due Date,Status,Effectiveness Result\n";
    const rows = filteredActions
      .map((a) => `"${a.id}","${a.projectId || "-"}","${a.description}","${a.owner}","${a.dueDate}","${a.status}","${a.effectivenessResult || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Kaizen_Project_Actions_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Project Actions exported to CSV.", "info");
  };

  const filteredActions = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return capaActions.filter((a) => {
      const isOverdue = a.status !== "Completed" && a.status !== "Verified" && a.status !== "Closed" && a.dueDate < today;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OVERDUE" ? isOverdue : a.status === statusFilter);

      const matchesProject = projectFilter === "ALL" || a.projectId === projectFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q);

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [capaActions, statusFilter, projectFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI & Kaizen Project Action Items
            </h1>
            <Badge variant="cyan">{capaActions.length} DELIVERABLES IN TRACKING</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Add Action Deliverable
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
          title="Open Deliverables"
          value={capaActions.filter((a) => a.status === "Open" || a.status === "In Progress").length.toString()}
          unit="In Flight"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Overdue Action Items"
          value={overdueCapaCount.toString()}
          unit="Requires Escalation"
          icon={CheckSquare}
          colorVariant={overdueCapaCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Verified Complete"
          value={capaActions.filter((a) => a.status === "Verified" || a.status === "Closed").length.toString()}
          unit="Certified"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Execution Pace"
          value="94%"
          unit="On-Time Delivery"
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
              placeholder="Search action deliverable, ID, owner or project..."
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
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All CI Projects</option>
              {ciProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.id} — {p.name.substring(0, 24)}...</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Verified">Verified</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Deliverable Details</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked Project / RCA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Owner</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Due Date</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((a) => {
                const isOverdue = a.status !== "Completed" && a.status !== "Verified" && a.status !== "Closed" && a.dueDate < new Date().toISOString().substring(0, 10);
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{a.description}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{a.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                      {a.projectId || a.rcaId || "Standalone Initiative"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {a.owner}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isOverdue ? "#EF4444" : "var(--text-primary)", fontSize: "12px" }}>
                        {a.dueDate}
                      </div>
                      {isOverdue && <span style={{ fontSize: "10px", color: "#EF4444", fontWeight: 800 }}>OVERDUE</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={a.status === "Verified" || a.status === "Closed" ? "emerald" : a.status === "Completed" ? "cyan" : "amber"}>
                        {a.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {a.status === "Open" && (
                          <button
                            onClick={() => updateCapaStatus(a.id, "In Progress")}
                            title="Start Deliverable"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#0284C7", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Clock size={13} />
                          </button>
                        )}
                        {a.status === "In Progress" && (
                          <button
                            onClick={() => updateCapaStatus(a.id, "Completed", "Deliverable implemented")}
                            title="Mark Completed"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#059669", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Check size={13} />
                          </button>
                        )}
                        {a.status === "Completed" && (
                          <button
                            onClick={() => updateCapaStatus(a.id, "Verified", "Deliverable verified")}
                            title="Verify Deliverable"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#059669", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Kaizen Project Deliverable
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Linked CI Project</label>
                <select
                  value={newAction.projectId}
                  onChange={(e) => setNewAction({ ...newAction, projectId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {ciProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.id} — {p.name.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Action Item Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the technical action deliverable..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Owner</label>
                  <input
                    type="text"
                    required
                    value={newAction.owner}
                    onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newAction.dueDate}
                    onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
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
                  Save Action
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

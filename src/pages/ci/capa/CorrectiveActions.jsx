import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  CheckCircle2,
  Download,
  ArrowRight,
  Plus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Search,
  X,
  Check,
  Filter,
  CheckSquare,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function CorrectiveActions() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    capaActions = [],
    createCapaAction,
    updateCapaStatus,
    investigations = [],
    overdueCapaCount
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAction, setNewAction] = useState({
    rcaId: investigations[0]?.id || "RCA-2026-001",
    description: "",
    actionType: "Corrective",
    owner: "Marcus Vance (Maintenance Lead)",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    priority: "High"
  });

  const correctiveList = useMemo(() => {
    return capaActions.filter((c) => c.actionType === "Corrective");
  }, [capaActions]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAction.description.trim()) {
      addToast("Please provide a corrective action description.", "warning");
      return;
    }

    createCapaAction(newAction);
    setIsModalOpen(false);
    setNewAction({
      rcaId: investigations[0]?.id || "RCA-2026-001",
      description: "",
      actionType: "Corrective",
      owner: "Marcus Vance (Maintenance Lead)",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      priority: "High"
    });
  };

  const handleExportCSV = () => {
    const headers = "Action ID,RCA ID,Description,Owner,Due Date,Priority,Status,Completion Date,Evidence Notes\n";
    const rows = filteredActions
      .map((a) => `"${a.id}","${a.rcaId || "-"}","${a.description}","${a.owner}","${a.dueDate}","${a.priority}","${a.status}","${a.completionDate || "-"}","${a.evidenceNotes || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Corrective_Actions_CAPA_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Corrective actions exported to CSV.", "info");
  };

  const filteredActions = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return correctiveList.filter((a) => {
      const isOverdue = a.status !== "Completed" && a.status !== "Verified" && a.status !== "Closed" && a.dueDate < today;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OVERDUE" ? isOverdue : a.status === statusFilter);

      const matchesPriority = priorityFilter === "ALL" || a.priority === priorityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        (a.rcaId && a.rcaId.toLowerCase().includes(q));

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [correctiveList, statusFilter, priorityFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CAPA — Corrective Action Lifecycle
            </h1>
            <Badge variant="cyan">{correctiveList.length} CORRECTIVE ACTIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/capa/verification")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Effectiveness Verification
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Create Corrective Action
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
          title="Open Corrective Actions"
          value={correctiveList.filter((a) => a.status === "Open" || a.status === "In Progress").length.toString()}
          unit="In Progress"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Overdue Items"
          value={overdueCapaCount.toString()}
          unit="Requires Attention"
          icon={AlertTriangle}
          colorVariant={overdueCapaCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Verified Closed"
          value={correctiveList.filter((a) => a.status === "Verified" || a.status === "Closed").length.toString()}
          unit="Verified Effective"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Compliance Target"
          value="100%"
          unit="Audit Ready"
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
              placeholder="Search action description, ID, owner or RCA ID..."
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
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Verified">Verified</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Action Details</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked RCA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Owner</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Due Date</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Priority</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Lifecycle Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((a) => {
                const isOverdue = a.status !== "Completed" && a.status !== "Verified" && a.status !== "Closed" && a.dueDate < new Date().toISOString().substring(0, 10);
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.02)" : "transparent" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{a.description}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{a.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>
                      {a.rcaId || "Standalone CAPA"}
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
                      <Badge variant={a.priority === "Critical" ? "rose" : a.priority === "High" ? "amber" : "gray"}>
                        {a.priority}
                      </Badge>
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
                            title="Start Action (In Progress)"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#0284C7", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Clock size={13} />
                          </button>
                        )}
                        {a.status === "In Progress" && (
                          <button
                            onClick={() => updateCapaStatus(a.id, "Completed", "Action completed by technician")}
                            title="Mark Completed"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#059669", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Check size={13} />
                          </button>
                        )}
                        {a.status === "Completed" && (
                          <button
                            onClick={() => updateCapaStatus(a.id, "Verified", "Effectiveness verified in production")}
                            title="Verify Effectiveness"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#059669", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        {a.status === "Verified" && (
                          <button
                            onClick={() => updateCapaStatus(a.id, "Closed")}
                            title="Close CAPA"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <CheckSquare size={13} />
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

      {/* CREATE CAPA MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Create Corrective Action Item
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Linked Investigation</label>
                <select
                  value={newAction.rcaId}
                  onChange={(e) => setNewAction({ ...newAction, rcaId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {investigations.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Corrective Action Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the permanent engineering or operational correction..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Owner</label>
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
                  <label className="form-label">Target Due Date</label>
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
                  Assign Action
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

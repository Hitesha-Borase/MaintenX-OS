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
  X
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

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
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

    const nextNum = actions.length + 1;
    const id = `ACT-0${nextNum}`;
    setActions((prev) => [
      {
        ...newAction,
        id,
        status: "Open"
      },
      ...prev
    ]);
    addToast(`Kaizen Action ${id} added to ${newAction.project}!`, "success");
    setNewAction({
      project: "CI-001",
      description: "",
      owner: "Ahmed Hassan",
      due: "2026-09-15"
    });
    setIsModalOpen(false);
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

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.id?.toLowerCase().includes(q) ||
        a.project?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.owner?.toLowerCase().includes(q) ||
        a.due?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [actions, searchQuery, statusFilter]);

  const openCount = actions.filter((a) => a.status === "Open").length;
  const completeCount = actions.filter((a) => a.status === "Complete").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
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
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Log Action Item
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Projects List
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
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

      {/* Main Structured Table Card */}
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
                style={{ height: "36px", fontSize: "12px", width: "140px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredActions.length}</strong> of {actions.length} Action Items
          </div>
        </div>

        {/* Structured Actions Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Linked Project</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action Deliverable / Task</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Owner</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Due</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.length > 0 ? (
                filteredActions.map((a) => {
                  const isComplete = a.status === "Complete";
                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {a.id}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{a.project}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                          {a.description}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          <User size={13} color="var(--text-muted)" />
                          <span>{a.owner}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: isComplete ? "#059669" : "#8C5B23", fontWeight: 700 }}>
                          <Calendar size={13} color={isComplete ? "#059669" : "var(--text-muted)"} />
                          <span>{a.due}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Badge variant={isComplete ? "emerald" : "amber"}>{a.status}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        {!isComplete ? (
                          <button
                            onClick={() => handleClose(a.id)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "7px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                              color: "#261603",
                              border: "1px solid #E8C182",
                              boxShadow: "0 2px 5px rgba(178, 126, 51, 0.22)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <Check size={13} /> Mark Complete
                          </button>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#059669", fontWeight: 700, fontSize: "12px" }}>
                            <CheckCircle2 size={15} /> Verified
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No Kaizen action items match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* POPUP MODAL: LOG KAIZEN ACTION ITEM */}
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
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Log Kaizen Action Item
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Assign a deliverable to a continuous improvement project
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
                  Parent CI Project *
                </label>
                <select
                  value={newAction.project}
                  onChange={(e) => setNewAction({ ...newAction, project: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "38px", fontSize: "13px" }}
                  required
                >
                  <option value="CI-001">CI-001: OEE Improvement — Line 1</option>
                  <option value="CI-002">CI-002: CIP Cycle Time Reduction</option>
                  <option value="CI-003">CI-003: Label Defect Elimination</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                  Action Deliverable Description *
                </label>
                <textarea
                  placeholder="e.g. Conduct laser beam alignment check on filler carousel infeed..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "80px", fontSize: "13px", padding: "10px", resize: "none" }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Assigned Owner *
                  </label>
                  <input
                    type="text"
                    value={newAction.owner}
                    onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    value={newAction.due}
                    onChange={(e) => setNewAction({ ...newAction, due: e.target.value })}
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
                  Log Action Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

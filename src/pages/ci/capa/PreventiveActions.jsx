import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  ArrowRight,
  Plus,
  AlertTriangle,
  Lock,
  Search,
  X,
  Check,
  Clock,
  Filter
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function PreventiveActions() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [actions, setActions] = useState([
    {
      id: "PA-101",
      inv: "INV-802",
      action: "Upgrade all steam modulating valve rolling diaphragms across Plant 1 & 2 to High-Temperature Fluoroelastomer (Viton) specification.",
      owner: "Engineering & Reliability Team",
      due: "2026-09-15",
      type: "Material Upgrade / Standardization",
      status: "Open"
    },
    {
      id: "PA-102",
      inv: "INV-802",
      action: "Codify mandatory 3-point pre-shift temperature sensor cross-check against dry-well calibrator in Master SOP-MNT-HTST-REV4.",
      owner: "Quality Assurance & Metrology",
      due: "2026-09-18",
      type: "SOP & Poka-Yoke Safeguard",
      status: "Open"
    },
    {
      id: "PA-103",
      inv: "INV-803",
      action: "Install continuous in-line wireless slip-torque telemetry sensors on all 12 rotary capping spindles with automatic reject interlock.",
      owner: "Automation & Controls Lead",
      due: "2026-08-30",
      type: "Automated Poka-Yoke Interlock",
      status: "Implemented"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAction, setNewAction] = useState({
    inv: "INV-802",
    action: "",
    owner: "Engineering Team",
    due: "2026-09-25",
    type: "Material Upgrade / Standardization"
  });

  const handleClose = (id) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Implemented" } : a))
    );
    addToast(`Preventive action ${id} marked as Implemented! Standard updated in CMMS.`, "success");
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAction.action.trim()) {
      addToast("Please provide a preventive action description.", "warning");
      return;
    }

    const id = `PA-${Math.floor(104 + Math.random() * 50)}`;
    const created = {
      ...newAction,
      id,
      status: "Open"
    };

    setActions((prev) => [created, ...prev]);
    addToast(`Preventive Action ${id} scheduled for implementation!`, "success");
    setIsModalOpen(false);
    setNewAction({
      inv: "INV-802",
      action: "",
      owner: "Engineering Team",
      due: "2026-09-25",
      type: "Material Upgrade / Standardization"
    });
  };

  const handleExportCSV = () => {
    const headers = "PA ID,Investigation,Preventive Action Scope,Assigned Owner,Due Date,Classification,Status\n";
    const rows = actions
      .map((a) => `"${a.id}","${a.inv}","${a.action}","${a.owner}","${a.due}","${a.type}","${a.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CAPA_Preventive_Actions_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Preventive Actions exported to CSV.", "info");
  };

  const filteredActions = actions.filter((a) => {
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.inv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openCount = actions.filter((a) => a.status === "Open").length;
  const implementedCount = actions.filter((a) => a.status === "Implemented").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CAPA — Preventive Actions
            </h1>
            <Badge variant="cyan">{actions.length} PREVENTIVE CAPA ACTIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log Preventive Action
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/capa/corrective")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Corrective Actions (D6)
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/capa/owners")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Owners & Due Dates
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
          title="Open Systemic Actions"
          value={openCount.toString()}
          unit="In-Flight"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Implemented & Locked"
          value={implementedCount.toString()}
          unit="Active"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Poka-Yoke Defense"
          value="100%"
          unit="Interlocked"
          icon={Lock}
          colorVariant="cyan"
        />
        <StatCard
          title="Recurrence Rate"
          value="0.0%"
          unit="Target"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Structured Clean Data Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Toolbar Search & Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "220px" }}>
            <div style={{ position: "relative", minWidth: "200px", flex: 1 }}>
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: "auto", minWidth: "140px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open Actions</option>
              <option value="Implemented">Implemented</option>
            </select>
          </div>
        </div>

        {/* Structured Clean Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "750px" }}>
            <thead>
              <tr>
                <th>Action ID</th>
                <th>RCA Case</th>
                <th>Preventive Engineering Scope</th>
                <th>Classification</th>
                <th>Assigned Owner</th>
                <th>Target Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((a) => {
                const isImplemented = a.status === "Implemented";
                return (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                        {a.id}
                      </span>
                    </td>
                    <td>
                      <Badge variant="cyan">{a.inv}</Badge>
                    </td>
                    <td style={{ maxWidth: "340px", minWidth: "220px" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.4 }}>
                        {a.action}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {a.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {a.owner}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: isImplemented ? "#059669" : "#8C5B23" }}>
                        {a.due}
                      </span>
                    </td>
                    <td>
                      <Badge variant={isImplemented ? "emerald" : "amber"}>
                        {a.status}
                      </Badge>
                    </td>
                    <td>
                      {!isImplemented ? (
                        <button
                          onClick={() => handleClose(a.id)}
                          title="Mark as Implemented"
                          style={{
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                            color: "#261603",
                            border: "1px solid #E8C182",
                            boxShadow: "0 2px 4px rgba(178, 126, 51, 0.2)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <Check size={12} /> Mark Implemented
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#059669",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <CheckCircle2 size={13} /> Active
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOG PREVENTIVE ACTION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log Long-Term Preventive Action (D7 Poka-Yoke)
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Linked RCA Case *</label>
                  <select
                    value={newAction.inv}
                    onChange={(e) => setNewAction({ ...newAction, inv: e.target.value })}
                    className="form-select"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="INV-802">INV-802: HTST Temp Excursion</option>
                    <option value="INV-803">INV-803: Cap Dimension NCR</option>
                    <option value="INV-804">INV-804: CIP Pump Seal Leak</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Prevention Category *</label>
                  <select
                    value={newAction.type}
                    onChange={(e) => setNewAction({ ...newAction, type: e.target.value })}
                    className="form-select"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Material Upgrade / Standardization">Material Upgrade</option>
                    <option value="SOP & Poka-Yoke Safeguard">SOP Safeguard</option>
                    <option value="Automated Poka-Yoke Interlock">Automated Interlock</option>
                    <option value="Design Modification (FMEA)">Design Modification</option>
                    <option value="Operator Training">Operator Training</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Owner *</label>
                  <input
                    type="text"
                    value={newAction.owner}
                    onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Target Due Date *</label>
                  <input
                    type="date"
                    value={newAction.due}
                    onChange={(e) => setNewAction({ ...newAction, due: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Systemic Preventive Scope *</label>
                <textarea
                  rows={3}
                  placeholder="Detail engineering drawings, replacement kits, SOP revision, or sensor interlocking..."
                  value={newAction.action}
                  onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Schedule Action
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

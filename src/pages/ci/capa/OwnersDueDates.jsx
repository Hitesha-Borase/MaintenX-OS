import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  Send,
  Calendar,
  UserCheck,
  ShieldAlert,
  Layers,
  Plus,
  Search,
  Filter,
  Bell
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function OwnersDueDates() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { capaActions = [], overdueCapaCount } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  const handleSendReminder = (owner, id) => {
    addToast(`Automated escalation reminder dispatched to ${owner} for ${id}!`, "info");
  };

  const handleExportCSV = () => {
    const headers = "Action ID,Type,Action Scope,Owner,Due Date,Priority,Status,Completion Date\n";
    const rows = filteredItems
      .map((a) => `"${a.id}","${a.actionType}","${a.description}","${a.owner}","${a.dueDate}","${a.priority}","${a.status}","${a.completionDate || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CAPA_Owners_DueDates_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CAPA owners and schedule exported to CSV.", "info");
  };

  const filteredItems = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return capaActions.filter((a) => {
      const isOverdue = a.status !== "Completed" && a.status !== "Verified" && a.status !== "Closed" && a.dueDate < today;
      const matchesOwner = selectedOwnerFilter === "ALL" || a.owner.includes(selectedOwnerFilter);
      const matchesStatus =
        selectedStatusFilter === "ALL" ||
        (selectedStatusFilter === "OVERDUE" ? isOverdue : a.status === selectedStatusFilter);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q);

      return matchesOwner && matchesStatus && matchesSearch;
    });
  }, [capaActions, selectedOwnerFilter, selectedStatusFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CAPA — Owners & Due Dates Governance
            </h1>
            <Badge variant="cyan">{capaActions.length} TOTAL ASSIGNMENTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Schedule CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/capa/corrective")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Corrective Actions
          </Button>
          <Button variant="primary" onClick={() => navigate("/ci/capa/preventive")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Preventive Actions
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
          title="Total Assigned Actions"
          value={capaActions.length.toString()}
          unit="Actions"
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="Overdue Actions"
          value={overdueCapaCount.toString()}
          unit="Overdue"
          icon={AlertTriangle}
          colorVariant={overdueCapaCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Verified Complete"
          value={capaActions.filter((a) => a.status === "Verified" || a.status === "Closed").length.toString()}
          unit="Closed"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="SLA Compliance"
          value="96.2%"
          unit="On-Time Delivery"
          icon={Clock}
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
              placeholder="Search by action scope, owner or ID..."
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
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CAPA Scope</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Classification</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Owner</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Due Date</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Priority</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((a) => {
                const isOverdue = a.status !== "Completed" && a.status !== "Verified" && a.status !== "Closed" && a.dueDate < new Date().toISOString().substring(0, 10);
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.02)" : "transparent" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{a.description}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{a.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={a.actionType === "Corrective" ? "amber" : "cyan"}>
                        {a.actionType?.toUpperCase()}
                      </Badge>
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
                      <button
                        onClick={() => handleSendReminder(a.owner, a.id)}
                        title="Send Escalation Reminder"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#C89547",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Bell size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

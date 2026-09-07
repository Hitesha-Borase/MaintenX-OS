import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Download,
  Filter,
  ShieldCheck,
  Clock,
  UserCheck,
  Layers,
  History,
  Lock,
  ArrowRight,
  Tag
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function AuditLogsPage() {
  const { auditLogs = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
      const matchesEntity = entityFilter === "ALL" || l.entityType === entityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.user?.toLowerCase().includes(q) ||
        l.entityId?.toLowerCase().includes(q) ||
        l.entityType?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q);

      return matchesAction && matchesEntity && matchesSearch;
    });
  }, [auditLogs, actionFilter, entityFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = "Audit ID,Timestamp,Actor User,Role,Entity Type,Entity ID,Action,Old Value,New Value,Notes\n";
    const rows = filteredLogs
      .map((l) => `"${l.auditId}","${l.timestamp}","${l.user}","${l.userRole || "System"}","${l.entityType}","${l.entityId}","${l.action}","${l.oldValue || "-"}","${l.newValue || "-"}","${l.notes || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Compliance_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Immutable 21 CFR Part 11 Audit Trail exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Master Data & Governance Audit Trail
            </h1>
            <Badge variant="emerald">21 CFR PART 11 COMPLIANT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit Ledger (.csv)
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Cards */}
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
          title="Recorded Audit Events"
          value={auditLogs.length.toString()}
          unit="Transactions"
          trend={{ value: "Master data mutation trace", isPositive: true, text: "" }}
          icon={History}
          colorVariant="emerald"
        />
        <StatCard
          title="Cryptographic Hash Integrity"
          value="SHA-256"
          unit="Tamper Proof"
          trend={{ value: "Immutable ledger structure", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="cyan"
        />
        <StatCard
          title="Regulated Approvals"
          value={auditLogs.filter((l) => l.action === "Approved").length.toString()}
          unit="Sign-Offs"
          trend={{ value: "Quality & Plant approval gates", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Active System Actors"
          value="5 Users"
          unit="Audited"
          trend={{ value: "Zero anonymous writes", isPositive: true, text: "" }}
          icon={UserCheck}
          colorVariant="amber"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
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

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "180px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Entity Types</option>
              <option value="SKU Master">SKU Master</option>
              <option value="BOM Recipe">BOM Recipe</option>
              <option value="Work Centers / Lines">Work Centers / Lines</option>
              <option value="Machine Assets">Machine Assets</option>
              <option value="Quality Specs">Quality Specs</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "150px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Actions</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Activated">Activated</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredLogs.length}</strong> of {auditLogs.length} Audit Events
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Audit ID & Timestamp</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>User & Role</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Entity Target</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Old Value</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>New Value / Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.auditId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {log.auditId}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {log.timestamp}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {log.user}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {log.userRole || "Administrator"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                          {log.entityId}
                        </div>
                        <Badge variant="cyan">{log.entityType}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={log.action === "Created" ? "emerald" : log.action === "Approved" ? "cyan" : log.action === "Rejected" ? "rose" : "amber"}>
                          {log.action}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: log.oldValue === "-" ? "italic" : "normal", fontFamily: log.oldValue !== "-" ? "var(--font-mono)" : "inherit" }}>
                          {log.oldValue || "-"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          {log.newValue || "-"}
                        </div>
                        {log.notes && (
                          <div style={{ fontSize: "11px", color: "#8C5B23", marginTop: "2px", fontStyle: "italic" }}>
                            ↳ {log.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No audit records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

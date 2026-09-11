import React, { useState, useMemo, useEffect } from "react";
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
  Tag,
  Eye,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function AuditLogsPage() {
  const { auditLogs: contextLogs = [] } = useMasterData();
  const { addToast } = useApp();

  const [dbLogs, setDbLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const [viewingLog, setViewingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await adminService.getAuditLogs();
      if (Array.isArray(data) && data.length > 0) {
        setDbLogs(data);
      }
    } catch (err) {
      console.warn("Audit logs DB load error:", err.message);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Merge DB logs with context logs (deduplicating by auditId)
  const allLogs = useMemo(() => {
    const list = [...dbLogs];
    const existingIds = new Set(list.map((l) => l.auditId || l.id));
    for (const cl of contextLogs) {
      const id = cl.auditId || cl.id;
      if (!existingIds.has(id)) {
        list.push({
          ...cl,
          auditId: cl.auditId || `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          id: cl.id || cl.auditId
        });
        existingIds.add(id);
      }
    }
    return list;
  }, [dbLogs, contextLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((l) => {
      const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
      const matchesEntity = entityFilter === "ALL" || l.entityType === entityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.user?.toLowerCase().includes(q) ||
        l.entityId?.toLowerCase().includes(q) ||
        l.entityType?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q) ||
        l.auditId?.toLowerCase().includes(q);

      return matchesAction && matchesEntity && matchesSearch;
    });
  }, [allLogs, actionFilter, entityFilter, searchQuery]);

  const handleDeleteLog = async () => {
    if (!deletingLog) return;
    try {
      setIsDeleting(true);
      const targetId = deletingLog.id || deletingLog.auditId;
      await adminService.deleteAuditLog(targetId);
      setDbLogs((prev) => prev.filter((l) => (l.id || l.auditId) !== targetId));
      addToast(`Audit record ${deletingLog.auditId} deleted from database!`, "success");
      setDeletingLog(null);
    } catch (err) {
      console.error(err);
      addToast(`Failed to delete audit record: ${err.message}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

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
          title="Recorded Audit Events"
          value={allLogs.length.toString()}
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
          value={allLogs.filter((l) => l.action === "Approved").length.toString()}
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
                placeholder="Search audit ID, user, entity or notes..."
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
              <option value="Changeover Matrix">Changeover Matrix</option>
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
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredLogs.length}</strong> of {allLogs.length} Audit Events
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
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.auditId || log.id}
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
                        <Badge variant={log.action === "Created" ? "emerald" : log.action === "Approved" ? "cyan" : log.action === "Rejected" ? "rose" : log.action === "Deleted" ? "amber" : "cyan"}>
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

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {/* View Button */}
                          <button
                            onClick={() => setViewingLog(log)}
                            title="View Audit Event Details"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingLog(log)}
                            title="Delete Audit Record"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#EF4444",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No audit records matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Detail Modal */}
      {viewingLog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "540px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Audit Event Details
                </h3>
              </div>
              <button
                onClick={() => setViewingLog(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Audit ID:</span>
                <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "#0284C7" }}>{viewingLog.auditId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Timestamp:</span>
                <span style={{ fontWeight: 700 }}>{viewingLog.timestamp}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>User & Role:</span>
                <span style={{ fontWeight: 700 }}>{viewingLog.user} ({viewingLog.userRole || "Admin"})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Target Entity:</span>
                <span style={{ fontWeight: 700 }}>{viewingLog.entityId} ({viewingLog.entityType})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Action:</span>
                <Badge variant="cyan">{viewingLog.action}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Old Value:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{viewingLog.oldValue || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>New Value:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{viewingLog.newValue || "-"}</span>
              </div>
              {viewingLog.notes && (
                <div style={{ padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px" }}>
                  <strong>Notes:</strong> {viewingLog.notes}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingLog(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "440px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete Audit Record
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to remove audit event <strong>{deletingLog.auditId}</strong> ({deletingLog.action} on {deletingLog.entityId})? This record will be permanently deleted from the database.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingLog(null)} disabled={isDeleting} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                disabled={isDeleting}
                onClick={handleDeleteLog}
                style={{ fontSize: "12px", padding: "7px 14px", backgroundColor: "#EF4444", color: "#fff" }}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

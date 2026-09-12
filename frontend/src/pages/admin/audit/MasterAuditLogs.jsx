import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Search, Download, Filter, Eye, Trash2, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function MasterAuditLogs() {
  const { auditLogs, fetchAuditLogs, deleteAuditLog } = useMasterAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [viewingLog, setViewingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useApp();

  React.useEffect(() => {
    fetchAuditLogs?.();
  }, [fetchAuditLogs]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.target?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = eventFilter === "All" || log.event === eventFilter;
    return matchesSearch && matchesEvent;
  });

  // Dynamically extract unique events for the filter dropdown
  const uniqueEvents = ["All", ...new Set(auditLogs.map(log => log.event))].sort();

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      addToast("No logs to export", "warning");
      return;
    }
    
    // Create CSV content
    const headers = ["Log ID", "Date/Time", "User", "Event", "Target", "IP Address"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => `"${log.id}","${log.date}","${log.user}","${log.event}","${log.target}","${log.ip}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Audit logs exported as CSV", "success");
  };

  const handleConfirmDelete = async () => {
    if (!deletingLog) return;
    try {
      setIsDeleting(true);
      await deleteAuditLog(deletingLog.id);
      addToast(`Audit log ${deletingLog.id} deleted from database!`, "success");
      setDeletingLog(null);
    } catch (err) {
      console.error(err);
      addToast(`Failed to delete log: ${err.message}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
            Activity & Audit Logs
          </h1>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExport} style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 600 }}>
          Export Logs
        </Button>
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "260px", minWidth: "180px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by user, event, target or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ width: "180px", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, outline: "none", cursor: "pointer" }}
            >
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Audit Log Cards */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredLogs.map(log => (
            <div 
              key={log.id} 
              style={{ 
                padding: "12px", 
                backgroundColor: "var(--bg-card-subtle)", 
                borderRadius: "10px", 
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "8px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)", fontWeight: 700 }}>{log.id}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#2563EB", backgroundColor: "rgba(37, 99, 235, 0.1)", padding: "2px 6px", borderRadius: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.event}
                  </span>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12.5px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    👤 {log.user}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🎯 {log.target}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)", fontSize: "10px", color: "var(--text-muted)" }}>
                <span>{log.date}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button 
                    onClick={() => setViewingLog(log)}
                    style={{ padding: "4px 6px", borderRadius: "4px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", cursor: "pointer", color: "var(--text-primary)" }}
                    title="View Details"
                  >
                    <Eye size={12} />
                  </button>
                  <button 
                    onClick={() => setDeletingLog(log)}
                    style={{ padding: "4px 6px", borderRadius: "4px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#DC2626" }}
                    title="Delete Log"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No audit logs found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Log ID</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Date / Time</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>User</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Event</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Target</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>IP Address</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)" }} className="hover-row">
                  <td style={{ padding: "16px 20px", fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{log.id}</td>
                  <td style={{ padding: "16px 20px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{log.date}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{log.user}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500, color: "#2563EB", whiteSpace: "nowrap" }}>{log.event}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{log.target}</td>
                  <td style={{ padding: "16px 20px", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{log.ip}</td>
                  <td style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        onClick={() => setViewingLog(log)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-subtle)",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="View Log Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingLog(log)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-subtle)",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#DC2626",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="Delete Log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No audit logs found matching criteria.
            </div>
          )}
        </div>
      </Card>

      {/* VIEW DETAILS MODAL */}
      {viewingLog && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
          onClick={() => setViewingLog(null)}
        >
          <div 
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#2563EB" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Audit Record Details
                </h3>
              </div>
              <button onClick={() => setViewingLog(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Log ID</div>
                  <div style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--text-primary)", marginTop: "4px" }}>{viewingLog.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date & Time</div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px" }}>{viewingLog.date}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Actor User</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingLog.user}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Event Type</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#2563EB", marginTop: "4px" }}>{viewingLog.event}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Entity</div>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                  {viewingLog.target}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>IP Address</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingLog.ip}</div>
              </div>
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setViewingLog(null)} style={{ fontSize: "12px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLog && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
          onClick={() => setDeletingLog(null)}
        >
          <div 
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Delete Audit Record
                </h3>
              </div>
              <button onClick={() => setDeletingLog(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete audit record <strong style={{ color: "var(--text-primary)" }}>{deletingLog.id}</strong> ({deletingLog.event})?
              </p>
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", fontSize: "12px", color: "#DC2626" }}>
                Warning: This action will permanently remove the record from the database.
              </div>
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingLog(null)} style={{ fontSize: "12px" }}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirmDelete} 
                disabled={isDeleting}
                style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF", fontSize: "12px" }}
              >
                {isDeleting ? "Deleting..." : "Delete Record"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

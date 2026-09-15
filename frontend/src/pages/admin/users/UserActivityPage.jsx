import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  Pencil,
  AlertTriangle,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function UserActivityPage() {
  const {
    activityLogs = [],
    setActivityLogs,
    fetchActivityLogs,
    deleteActivityLog,
    createActivityLog,
    updateActivityLog,
  } = useAdmin() || {};
  const { addToast } = useApp ? useApp() : { addToast: () => {} };

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLogData, setNewLogData] = useState({
    action: "",
    category: "Security",
    details: "",
  });

  const [editLogData, setEditLogData] = useState({
    action: "",
    category: "Security",
  });

  useEffect(() => {
    if (fetchActivityLogs) {
      fetchActivityLogs(searchQuery);
    }
  }, [searchQuery]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (fetchActivityLogs) {
        await fetchActivityLogs(searchQuery);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLog) return;
    try {
      setIsSubmitting(true);
      const targetId = deletingLog.dbId || deletingLog.id;
      if (deleteActivityLog) {
        await deleteActivityLog(targetId);
      } else {
        await adminService.deleteActivityLog(targetId);
      }
      if (setActivityLogs) {
        setActivityLogs((prev) => prev.filter((l) => l.id !== deletingLog.id && l.dbId !== deletingLog.dbId));
      }
      addToast(`Activity log event ${deletingLog.id} successfully deleted from database!`, "success");
      setDeletingLog(null);
    } catch (err) {
      addToast("Failed to delete log: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLogSubmit = async (e) => {
    e.preventDefault();
    if (!newLogData.action.trim()) {
      addToast("Please provide action description.", "warning");
      return;
    }
    try {
      setIsSubmitting(true);
      if (createActivityLog) {
        await createActivityLog(newLogData);
      } else {
        await adminService.createActivityLog(newLogData);
      }
      if (fetchActivityLogs) fetchActivityLogs(searchQuery);
      addToast("Audit log event recorded in database!", "success");
      setIsAddModalOpen(false);
      setNewLogData({ action: "", category: "Security", details: "" });
    } catch (err) {
      addToast("Failed to create audit log: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (log) => {
    setEditingLog(log);
    setEditLogData({
      action: log.action || "",
      category: log.category || "Security",
    });
  };

  const handleEditLogSubmit = async (e) => {
    e.preventDefault();
    if (!editingLog) return;
    try {
      setIsSubmitting(true);
      const targetId = editingLog.dbId || editingLog.id;
      if (updateActivityLog) {
        await updateActivityLog(targetId, editLogData);
      } else {
        await adminService.updateActivityLog(targetId, editLogData);
      }
      if (fetchActivityLogs) fetchActivityLogs(searchQuery);
      addToast(`Audit log event ${editingLog.id} updated in database!`, "success");
      setEditingLog(null);
    } catch (err) {
      addToast("Failed to update audit log: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = activityLogs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.ip && l.ip.includes(q))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              User Live Activity Stream & Audit Log
            </h1>
            <Badge variant="emerald" dot>
              STREAMING LIVE
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add Audit Note
          </Button>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Stream"}
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
          title="Events Streamed"
          value={activityLogs.length.toString()}
          unit="Real-time"
          trend={{ value: "Immutable audit ledger", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Security Anomalies"
          value="0"
          unit="Incidents"
          trend={{ value: "Zero rogue login attempts", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="21 CFR Part 11"
          value="100%"
          unit="Compliant"
          trend={{ value: "Digital signatures tracked", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Latency"
          value="14ms"
          unit="Telemetry"
          trend={{ value: "Sub-second event capture", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Activity Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search user, action keyword, IP, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>User Account</th>
                <th>Action & Mutation Description</th>
                <th>Category</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px" }}>
                    <Activity size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                      No Live Activity Recorded Yet
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto" }}>
                      User sign-ins, master data modifications, and governance events performed in this organization will stream here in real-time.
                    </div>
                  </td>
<<<<<<< HEAD
=======
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{l.user}</strong>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "340px" }}>
                    {l.action}
                  </td>
                  <td>
                    <Badge variant={l.category === "Security" ? "cyan" : "amber"}>{l.category}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                    {l.ip}
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{l.timestamp}</td>
                  <td>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => setViewingLog(l)}
                        title="View Activity Details"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(14, 165, 233, 0.1)",
                          color: "#0284C7",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(l)}
                        title="Edit Audit Note"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(234, 179, 8, 0.1)",
                          color: "#CA8A04",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingLog(l)}
                        title="Delete Audit Log from Database"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                          color: "#DC2626",
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
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{l.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{l.user}</strong>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "340px" }}>
                      {l.action}
                    </td>
                    <td>
                      <Badge variant="cyan">{l.category}</Badge>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                      {l.ip}
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{l.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW ACTIVITY LOG DETAILS MODAL */}
      {viewingLog && (
        <div className="modal-backdrop" onClick={() => setViewingLog(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Audit Event & Activity Details
                </h2>
              </div>
              <button onClick={() => setViewingLog(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Event ID</span>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{viewingLog.id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Category</span>
                  <Badge variant="cyan">{viewingLog.category}</Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>User Account</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingLog.user}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Origin IP</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)" }}>{viewingLog.ip}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Action & Operation</span>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                  {viewingLog.action}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Recorded Timestamp</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{viewingLog.timestamp}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setViewingLog(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLog && (
        <div className="modal-backdrop" onClick={() => setDeletingLog(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Delete Audit Log Entry
                </h2>
              </div>
              <button onClick={() => setDeletingLog(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me <strong>{deletingLog.id}</strong> ({deletingLog.action}) ko database me se delete karna chahte hain?
              </p>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                Ye record PostgreSQL ke <code>audit_logs</code> table me se permanently remove ho jayega.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingLog(null)}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {isSubmitting ? "Deleting..." : "Yes, Delete Log"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD AUDIT LOG MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="var(--brand-primary, #0284C7)" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Create Manual Audit Entry
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLogSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Action / Mutation Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANUAL AUDIT CHECK on System Policy"
                  value={newLogData.action}
                  onChange={(e) => setNewLogData({ ...newLogData, action: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Category
                </label>
                <select
                  value={newLogData.category}
                  onChange={(e) => setNewLogData({ ...newLogData, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                >
                  <option value="Security">Security</option>
                  <option value="Configuration">Configuration</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT AUDIT LOG MODAL */}
      {editingLog && (
        <div className="modal-backdrop" onClick={() => setEditingLog(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} color="#CA8A04" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Update Audit Entry ({editingLog.id})
                </h2>
              </div>
              <button onClick={() => setEditingLog(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditLogSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Action / Mutation Description *
                </label>
                <input
                  type="text"
                  required
                  value={editLogData.action}
                  onChange={(e) => setEditLogData({ ...editLogData, action: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Category
                </label>
                <select
                  value={editLogData.category}
                  onChange={(e) => setEditLogData({ ...editLogData, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                >
                  <option value="Security">Security</option>
                  <option value="Configuration">Configuration</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingLog(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

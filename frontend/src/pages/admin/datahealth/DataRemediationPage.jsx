import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Wrench,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  History,
  Eye,
  Trash2,
  Edit2,
  Plus,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function DataRemediationPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [isFixing, setIsFixing] = useState(false);
  const [remediationLog, setRemediationLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const [newItem, setNewItem] = useState({
    rule: "Missing Unit Cost Heuristic Default",
    affectedTable: "Item Master",
    recordsHealed: 1,
    status: "Auto-Healed",
    details: "Automated standard cost calculation applied"
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRemediationLog();
      if (Array.isArray(data)) {
        setRemediationLog(data);
      }
    } catch (err) {
      console.warn("Error loading remediation logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRunRemediation = async () => {
    try {
      setIsFixing(true);
      await adminService.executeRemediationEngine();
      await fetchLogs();
      addToast("Automated Data Remediation Complete: Master anomalies resolved & recorded in database!", "success");
    } catch (err) {
      console.error(err);
      addToast(`Remediation execution error: ${err.message}`, "error");
    } finally {
      setIsFixing(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.rule.trim() || !newItem.affectedTable.trim()) {
      addToast("Please provide rule and affected table.", "warning");
      return;
    }
    try {
      setIsActioning(true);
      await adminService.createRemediationLog({
        ...newItem,
        recordsHealed: Number(newItem.recordsHealed) || 1
      });
      addToast("Remediation execution log saved into database!", "success");
      setIsAddModalOpen(false);
      setNewItem({
        rule: "Missing Unit Cost Heuristic Default",
        affectedTable: "Item Master",
        recordsHealed: 1,
        status: "Auto-Healed",
        details: "Automated standard cost calculation applied"
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
      addToast(`Error adding remediation log: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setIsActioning(true);
      await adminService.updateRemediationLog(editingItem.id, {
        ...editingItem,
        recordsHealed: Number(editingItem.recordsHealed) || 1
      });
      addToast(`Remediation record ${editingItem.id} updated in database!`, "success");
      setEditingItem(null);
      await fetchLogs();
    } catch (err) {
      console.error(err);
      addToast(`Error updating remediation log: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsActioning(true);
      await adminService.deleteRemediationLog(deletingItem.id);
      addToast(`Remediation record ${deletingItem.id} permanently deleted from database!`, "success");
      setDeletingItem(null);
      await fetchLogs();
    } catch (err) {
      console.error(err);
      addToast(`Error deleting remediation log: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Automated Data Remediation & Self-Healing
            </h1>
            <Badge variant="emerald">
              HEALTH SCORE: {dataHealthStats.completeness || 98.4}%
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add Log Entry
          </Button>
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={handleRunRemediation}
            disabled={isFixing}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isFixing ? "Remediating Graph..." : "Execute Remediation Engine"}
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
          title="Overall Health Score"
          value={`${dataHealthStats.completeness || 98.4}%`}
          unit="Quality Index"
          trend={{ value: "Master Data certified", isPositive: true, text: "" }}
          icon={HeartPulse}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Remediation Rules"
          value="14 Rules"
          unit="Self-Healing"
          trend={{ value: "Continuous background engine", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Healed Records"
          value={remediationLog.reduce((acc, curr) => acc + (Number(curr.recordsHealed) || 1), 0).toString()}
          unit="Logged in DB"
          trend={{ value: "Zero manual intervention", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Engine Readiness"
          value="100%"
          unit="Operational"
          trend={{ value: "Auto-trigger enabled", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Self-Healing Log Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          padding: "20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <History size={18} color="#C89547" />
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Recent Self-Healing Execution Log
            </h2>
          </div>
          <Badge variant="cyan">{remediationLog.length} AUTOMATED ACTIONS</Badge>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Remediation ID</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Heuristic Rule Applied</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Table</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Records Healed</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Execution Timestamp</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    Loading remediation execution log from database...
                  </td>
                </tr>
              ) : remediationLog.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No remediation executions logged in database.
                  </td>
                </tr>
              ) : (
                remediationLog.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {r.id}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                      {r.rule}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{r.affectedTable}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                      {r.recordsHealed} record{Number(r.recordsHealed) > 1 ? "s" : ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {r.timestamp}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{r.status}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {/* View Button */}
                        <button
                          onClick={() => setViewingItem(r)}
                          title="View Remediation Details"
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

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingItem({ ...r })}
                          title="Edit Remediation Log"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#3B82F6",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button (Active and Connected to Database!) */}
                        <button
                          onClick={() => setDeletingItem(r)}
                          title="Delete Remediation Log"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Log Modal */}
      {isAddModalOpen && (
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
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Remediation Execution Log
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Heuristic Rule Applied *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.rule}
                  onChange={(e) => setNewItem({ ...newItem, rule: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Target Master Table *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.affectedTable}
                  onChange={(e) => setNewItem({ ...newItem, affectedTable: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Records Healed
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.recordsHealed}
                  onChange={(e) => setNewItem({ ...newItem, recordsHealed: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Auto-Healed">Auto-Healed</option>
                  <option value="Remediated">Remediated</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Execution Details / Action Notes
                </label>
                <textarea
                  rows={3}
                  value={newItem.details}
                  onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Log Modal */}
      {editingItem && (
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
          onClick={() => setEditingItem(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#3B82F6" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Remediation Log ({editingItem.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Heuristic Rule Applied *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.rule}
                  onChange={(e) => setEditingItem({ ...editingItem, rule: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Target Master Table *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.affectedTable}
                  onChange={(e) => setEditingItem({ ...editingItem, affectedTable: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Records Healed
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingItem.recordsHealed}
                  onChange={(e) => setEditingItem({ ...editingItem, recordsHealed: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Auto-Healed">Auto-Healed</option>
                  <option value="Remediated">Remediated</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Execution Details / Action Notes
                </label>
                <textarea
                  rows={3}
                  value={editingItem.details || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingItem(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Updating..." : "Update in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingItem && (
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
          onClick={() => setViewingItem(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Remediation Execution Details
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Remediation ID:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{viewingItem.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Rule Applied:</span>
                <span style={{ fontWeight: 700 }}>{viewingItem.rule}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Target Master Table:</span>
                <Badge variant="cyan">{viewingItem.affectedTable}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Records Healed:</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>{viewingItem.recordsHealed} record{Number(viewingItem.recordsHealed) > 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Execution Timestamp:</span>
                <span>{viewingItem.timestamp}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                <Badge variant="emerald">{viewingItem.status}</Badge>
              </div>
              {viewingItem.details && (
                <div style={{ padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px", fontStyle: "italic" }}>
                  {typeof viewingItem.details === "object" ? JSON.stringify(viewingItem.details, null, 2) : viewingItem.details}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingItem(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
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
          onClick={() => setDeletingItem(null)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete Remediation Log
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to permanently delete <strong>{deletingItem.id}</strong> ({deletingItem.rule})? This deletion will be immediately applied to the database.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingItem(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                disabled={isActioning}
                onClick={handleConfirmDelete}
                style={{ fontSize: "12px", padding: "7px 14px", backgroundColor: "#EF4444", color: "#fff" }}
              >
                {isActioning ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

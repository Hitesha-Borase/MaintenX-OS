import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit2,
  FileCheck,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Eye,
  Trash2,
  X,
  Plus,
  Pencil
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function ApprovalPermissionsPage() {
  const { addToast } = useApp();
  const isTenant = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_tenant_name") || localStorage.getItem("maintenx_tenant_id")));

  const [approvalRules, setApprovalRules] = useState(() => {
    return isTenant ? [] : [
      { id: "APR-01", event: "Finished Goods QA Batch Release (CoA)", tier: "Dual Sign-off", authorizedRoles: "QA Manager + Plant Manager", compliance: "FDA 21 CFR Part 11" },
      { id: "APR-02", event: "Master BOM & Recipe Revision Approval", tier: "2-Tier Approval", authorizedRoles: "QA Manager + System Admin", compliance: "ISO 22000" },
      { id: "APR-03", event: "Capital Asset Decommissioning / Scrap", tier: "Executive Sign-off", authorizedRoles: "Plant Manager + Corporate Ops", compliance: "GAAP Fixed Assets" },
      { id: "APR-04", event: "Emergency Schedule Override & Overtime", tier: "1-Tier Instant", authorizedRoles: "Plant Manager", compliance: "Internal Ops Policy" }
    ];
  });
  const [viewingRule, setViewingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    event: "",
    tier: "Dual Sign-off",
    authorizedRoles: "",
    compliance: "FDA 21 CFR Part 11",
    description: "",
  });

  const fetchRules = async () => {
    try {
      const rules = await adminService.getApprovalRules();
      if (Array.isArray(rules) && rules.length > 0) {
        setApprovalRules(rules);
      }
    } catch (err) {
      console.warn("Failed to fetch approval rules:", err.message);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormData({
      event: "",
      tier: "Dual Sign-off",
      authorizedRoles: "",
      compliance: "FDA 21 CFR Part 11",
      description: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      event: rule.event || "",
      tier: rule.tier || "Dual Sign-off",
      authorizedRoles: rule.authorizedRoles || "",
      compliance: rule.compliance || "",
      description: rule.description || "",
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.event.trim() || !formData.authorizedRoles.trim()) {
      addToast("Please provide both Event Trigger and Authorized Roles.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRule) {
        await adminService.updateApprovalRule(editingRule.id, formData);
        addToast(`Approval Gate "${editingRule.id}" updated successfully.`, "success");
      } else {
        await adminService.createApprovalRule(formData);
        addToast("New Approval Gate created successfully.", "success");
      }
      setIsFormModalOpen(false);
      setEditingRule(null);
      await fetchRules();
    } catch (err) {
      addToast(`Failed to save approval gate: ${err.message || "Error"}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!deletingRule) return;
    try {
      await adminService.deleteApprovalRule(deletingRule.id);
      addToast(`Approval Gate "${deletingRule.id}" deleted successfully.`, "success");
      setApprovalRules((prev) => prev.filter((r) => r.id !== deletingRule.id));
      await fetchRules();
    } catch (err) {
      addToast(`Failed to delete approval gate: ${err.message || "Error"}`, "error");
    } finally {
      setDeletingRule(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              High-Value Electronic Approval Governance
            </h1>
            <Badge variant="emerald">{approvalRules.length} E-SIGNATURE RULES</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage and configure regulatory multi-tier sign-offs and approval gates stored in PostgreSQL.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} />
          Add Approval Gate
        </Button>
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
          title="Approval Gates"
          value={approvalRules.length.toString()}
          unit="Active Gates"
          icon={FileCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Regulatory Standard"
          value="21 CFR Part 11"
          unit="Compliant"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Dual Sign-offs"
          value={approvalRules.filter((r) => r.tier?.toLowerCase().includes("dual") || r.tier?.toLowerCase().includes("2-tier")).length.toString()}
          unit="High-Value Rules"
          icon={Lock}
          colorVariant="amber"
        />
        <StatCard
          title="Enforcement Rate"
          value={approvalRules.length > 0 ? "100%" : "0%"}
          unit="Strict"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Rules Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Approval Event Trigger</th>
                <th>Authorization Tier</th>
                <th>Authorized Roles</th>
                <th>Regulatory Standard</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvalRules.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No electronic approval governance rules configured for this company yet. Click &quot;Add Approval Gate&quot; to create one.
                  </td>
                </tr>
              ) : (
                approvalRules.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{a.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{a.event}</strong>
                    </td>
                    <td>
                      <Badge variant="amber">{a.tier}</Badge>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{a.authorizedRoles}</td>
                    <td>
                      <span style={{ fontSize: "11px", backgroundColor: "rgba(5, 150, 105, 0.1)", color: "#059669", padding: "4px 8px", borderRadius: "4px", fontWeight: 700 }}>
                        {a.compliance}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setViewingRule(a)}
                          title="View Rule Details"
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
                          onClick={() => handleOpenEditModal(a)}
                          title="Edit Approval Gate"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(234, 179, 8, 0.12)",
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
                          onClick={() => setDeletingRule(a)}
                          title="Delete Approval Gate"
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT RULE MODAL */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {editingRule ? <Edit2 size={18} color="#CA8A04" /> : <Plus size={18} color="#059669" />}
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {editingRule ? `Edit Approval Gate (${editingRule.id})` : "Add New Approval Gate"}
                </h2>
              </div>
              <button onClick={() => setIsFormModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Approval Event Trigger *
                </label>
                <input
                  type="text"
                  required
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  placeholder="e.g. Finished Goods QA Batch Release (CoA)"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    Authorization Tier *
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Dual Sign-off">Dual Sign-off</option>
                    <option value="2-Tier Approval">2-Tier Approval</option>
                    <option value="Executive Sign-off">Executive Sign-off</option>
                    <option value="1-Tier Instant">1-Tier Instant</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    Regulatory Standard
                  </label>
                  <input
                    type="text"
                    value={formData.compliance}
                    onChange={(e) => setFormData({ ...formData, compliance: e.target.value })}
                    placeholder="e.g. FDA 21 CFR Part 11"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Authorized Roles *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorizedRoles}
                  onChange={(e) => setFormData({ ...formData, authorizedRoles: e.target.value })}
                  placeholder="e.g. QA Manager + Plant Manager"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Description / Purpose
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about when this gate triggers..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingRule ? "Save Changes" : "Create Gate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RULE MODAL */}
      {viewingRule && (
        <div className="modal-backdrop" onClick={() => setViewingRule(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Approval Gate Details
                </h2>
              </div>
              <button onClick={() => setViewingRule(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Gate ID</span>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{viewingRule.id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Authorization Tier</span>
                  <Badge variant="amber">{viewingRule.tier}</Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Regulatory Standard</span>
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>{viewingRule.compliance}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Sign-off Roles</span>
                  <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{viewingRule.authorizedRoles}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Event Trigger</span>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                  {viewingRule.event}
                </div>
              </div>

              {viewingRule.description && (
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description</span>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    {viewingRule.description}
                  </div>
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setViewingRule(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE RULE MODAL */}
      {deletingRule && (
        <div className="modal-backdrop" onClick={() => setDeletingRule(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Delete Gate
                </h2>
              </div>
              <button onClick={() => setDeletingRule(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me approval rule <strong>{deletingRule.id}</strong> ({deletingRule.event}) ko database se delete karna chahte hain?
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingRule(null)}>
                  Cancel
                </Button>
                <button
                  onClick={handleDeleteRule}
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
                  Yes, Delete Gate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

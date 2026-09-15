import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Plus,
  X,
  Lock,
  Unlock,
  Layers,
  CheckCircle2,
  Settings,
  ArrowRight,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../../services/adminService";

export function RolesPage() {
  const { roles = [], setRoles, addRole, updateRole, deleteRole } = useAdmin() || {};
  const { addToast } = (useApp ? useApp() : null) || { addToast: () => {} };
  const navigate = useNavigate();

  // Trigger live GET /api/v1/admin/roles on mount
  React.useEffect(() => {
    adminService.getRoles()
      .then((data) => {
        if (Array.isArray(data) && setRoles) {
          setRoles(data);
        }
      })
      .catch((err) => console.warn("Live roles fetch:", err.message));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    isSystem: false
  });

  const handleStartEdit = (r) => {
    setEditingRole(r);
    setEditFormData({
      name: r.name || "",
      description: r.description || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      addToast("Please provide a role title.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      if (updateRole) {
        await updateRole(editingRole.dbId || editingRole.id || editingRole.code, editFormData);
      }
      addToast(`Role "${editFormData.name}" updated successfully!`, "success");
      setEditingRole(null);
    } catch (err) {
      addToast("Failed to update role: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    try {
      setIsSubmitting(true);
      if (deleteRole) {
        await deleteRole(deletingRole.dbId || deletingRole.id || deletingRole.code);
      }
      addToast(`Role "${deletingRole.name}" deleted successfully.`, "success");
      setDeletingRole(null);
    } catch (err) {
      addToast("Failed to delete role: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) {
      addToast("Please provide a role title.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      if (addRole) {
        await addRole(newRole);
      }
      addToast(`Role "${newRole.name}" registered successfully!`, "success");
      setIsModalOpen(false);
      setNewRole({ name: "", description: "", isSystem: false });
    } catch (err) {
      addToast("Failed to create role: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  const totalUsers = roles.reduce((sum, r) => sum + (r.userCount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Role-Based Access Control (RBAC) Roles
            </h1>
            <Badge variant="emerald">{roles.length} DEFINED ROLES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/roles/permissions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Permissions Matrix
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Create Custom Role
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
          title="Active Roles"
          value={roles.length.toString()}
          unit="Profiles"
          trend={{ value: "100% RBAC coverage", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Assigned Users"
          value={totalUsers.toString()}
          unit="Accounts"
          trend={{ value: "Principle of Least Privilege", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="System Roles"
          value={roles.filter(r => r.isSystem).length.toString()}
          unit="Built-in"
          trend={{ value: "Protected core profiles", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="amber"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "Zero unmapped permissions", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", width: "100%", minWidth: 0 }}>
        {roles.map((r) => (
          <Card key={r.id} style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#059669" />
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{r.name}</h3>
              </div>
              <Badge variant={r.isSystem ? "cyan" : "amber"}>
                {r.isSystem ? "System Built-in" : "Custom"}
              </Badge>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", minHeight: "36px", lineHeight: 1.4 }}>
              {r.description}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Users size={14} /> <strong style={{ color: "var(--text-primary)" }}>{r.userCount}</strong> assigned users
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => setViewingRole(r)}
                  title="View Role Details"
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
                  onClick={() => handleStartEdit(r)}
                  title="Edit Role"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(217, 119, 6, 0.1)",
                    color: "#D97706",
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
                  onClick={() => navigate("/roles/permissions")}
                  title="Edit Granular Permissions"
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-card-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span>Permissions</span>
                  <ArrowRight size={11} />
                </button>
                <button
                  onClick={() => setDeletingRole(r)}
                  title="Delete Role"
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
            </div>
          </Card>
        ))}
      </div>

      {/* EDIT ROLE MODAL */}
      {editingRole && (
        <div className="modal-backdrop" onClick={() => setEditingRole(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} color="#D97706" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Edit RBAC Role Profile
                </h2>
              </div>
              <button onClick={() => setEditingRole(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Role Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Role Scope / Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRole(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ROLE DETAILS MODAL */}
      {viewingRole && (
        <div className="modal-backdrop" onClick={() => setViewingRole(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Role Profile Details
                </h2>
              </div>
              <button onClick={() => setViewingRole(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Role Title</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>{viewingRole.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Classification</span>
                  <Badge variant={viewingRole.isSystem ? "cyan" : "amber"}>
                    {viewingRole.isSystem ? "System Core" : "Custom Role"}
                  </Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Role Code</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#8C5B23", fontSize: "12px" }}>{viewingRole.code || viewingRole.id}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Assigned Users</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingRole.userCount || 0} Accounts</strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description & Scope</span>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)", lineHeight: 1.4 }}>
                  {viewingRole.description || "Enterprise operational profile."}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <Button variant="secondary" onClick={() => setViewingRole(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={ArrowRight}
                  onClick={() => {
                    setViewingRole(null);
                    navigate("/roles/permissions");
                  }}
                >
                  Inspect Matrix
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ROLE MODAL */}
      {deletingRole && (
        <div className="modal-backdrop" onClick={() => setDeletingRole(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Delete Role
                </h2>
              </div>
              <button onClick={() => setDeletingRole(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me role <strong>{deletingRole.name}</strong> ko delete karna chahte hain?
              </p>
              {deletingRole.isSystem && (
                <div style={{ fontSize: "12px", color: "#DC2626", backgroundColor: "rgba(220, 38, 38, 0.08)", padding: "10px 12px", borderRadius: "6px", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                  Warning: Yeh ek System Built-in role hai. Ise delete karne se related users ka role unassigned ho sakta hai.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingRole(null)}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmDelete}
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
                  Yes, Delete Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Custom RBAC Role
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanitation Shift Lead"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Role Scope / Description</label>
                <textarea
                  rows={3}
                  placeholder="Define the primary operational scope for this profile..."
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

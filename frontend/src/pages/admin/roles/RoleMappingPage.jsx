import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  Building2,
  CheckCircle2,
  Lock,
  Layers,
  Eye,
  Pencil,
  Trash2,
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

export function RoleMappingPage() {
  const { users = [], setUsers, updateUserRole, editUser, deleteUser, roles = [], setRoles } = useAdmin() || {};
  const { addToast } = (useApp ? useApp() : null) || { addToast: () => {} };

  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", role: "", department: "", plant: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    adminService.getRoles()
      .then((data) => {
        if (Array.isArray(data) && setRoles) setRoles(data);
      })
      .catch((err) => console.warn("Roles load:", err.message));

    adminService.getUsers()
      .then((data) => {
        if (Array.isArray(data) && setUsers) setUsers(data);
      })
      .catch((err) => console.warn("Users load:", err.message));
  }, [setRoles, setUsers]);

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      if (updateUserRole) {
        await updateUserRole(userId, newRole);
      }
      addToast(`Role for ${userName || userId} updated to ${newRole} in database.`, "success");
    } catch (err) {
      addToast("Failed to update role: " + err.message, "error");
    }
  };

  const handleStartEdit = (u) => {
    setEditingUser(u);
    setEditFormData({
      name: u.name || "",
      role: u.role || (roles[0]?.name || "Line Operator"),
      department: u.department || "Operations",
      plant: u.plant || "Indore Plant"
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      if (editUser) {
        await editUser(editingUser.id, editFormData);
      } else if (updateUserRole) {
        await updateUserRole(editingUser.id, editFormData.role);
      }
      addToast(`Mapping for "${editFormData.name || editingUser.name}" updated successfully!`, "success");
      setEditingUser(null);
    } catch (err) {
      addToast("Failed to update mapping: " + err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsProcessing(true);
      if (deleteUser) {
        await deleteUser(deletingUser.id);
      }
      addToast(`User ${deletingUser.name || deletingUser.email} deleted from database.`, "success");
      setDeletingUser(null);
    } catch (err) {
      addToast("Failed to delete user: " + err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              User-to-Role Mapping Registry
            </h1>
            <Badge variant="emerald">LIVE RBAC ASSIGNMENTS</Badge>
          </div>
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
          title="Mapped Accounts"
          value={users.length.toString()}
          unit="Users"
          trend={{ value: "100% RBAC mapped", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="Available Profiles"
          value={roles.length.toString()}
          unit="Profiles"
          trend={{ value: "Granular access tiers", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Multi-Plant Users"
          value={users.filter(u => u.plant?.includes("All")).length.toString()}
          unit="Enterprise"
          trend={{ value: "Global oversight scope", isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="amber"
        />
        <StatCard
          title="RBAC Compliance"
          value="100%"
          unit="Least Privilege"
          trend={{ value: "Zero orphaned rights", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Mapping Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>User Account</th>
                <th>Current Role Assignment</th>
                <th>Department</th>
                <th>Plant Scope</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                  </td>
                  <td>
                    <Badge variant="cyan">{u.role}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{u.department}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{u.plant}</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ height: "34px", fontSize: "12px", minWidth: "160px", backgroundColor: "#FFFFFF" }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value, u.name)}
                    >
                      {roles.length > 0 ? (
                        roles.map((r) => (
                          <option key={r.id || r.code || r.name} value={r.name}>{r.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="System Administrator">System Administrator</option>
                          <option value="Plant Manager">Plant Manager</option>
                          <option value="QA Manager">QA Manager</option>
                          <option value="Maintenance Lead">Maintenance Lead</option>
                          <option value="Production Supervisor">Production Supervisor</option>
                          <option value="Operator / Line Tech">Operator / Line Tech</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setViewingUser(u)}
                        title="View Mapping Details"
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
                        onClick={() => handleStartEdit(u)}
                        title="Edit User Mapping"
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
                        onClick={() => setDeletingUser(u)}
                        title="Delete User from Database"
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EDIT MAPPING MODAL */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} color="#D97706" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Edit User Role & Mapping
                </h2>
              </div>
              <button onClick={() => setEditingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">User Full Name</label>
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
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-select"
                  style={{ backgroundColor: "#FFFFFF" }}
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r.id || r.code} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Plant Scope</label>
                  <input
                    type="text"
                    value={editFormData.plant}
                    onChange={(e) => setEditFormData({ ...editFormData, plant: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isProcessing}>
                  {isProcessing ? "Saving..." : "Save Mapping"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MAPPING DETAILS MODAL */}
      {viewingUser && (
        <div className="modal-backdrop" onClick={() => setViewingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  User Role Mapping Details
                </h2>
              </div>
              <button onClick={() => setViewingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>User Account</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingUser.name}</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{viewingUser.email}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Current Role</span>
                  <Badge variant="cyan">{viewingUser.role}</Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Department</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingUser.department || "Operations"}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Plant Facility Scope</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingUser.plant || "Indore Plant"}</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setViewingUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {deletingUser && (
        <div className="modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Delete User
                </h2>
              </div>
              <button onClick={() => setDeletingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me user <strong>{deletingUser.name}</strong> ({deletingUser.email}) ko database se permanent delete karna chahte hain?
              </p>
              <div style={{ fontSize: "12px", color: "#DC2626", backgroundColor: "rgba(220, 38, 38, 0.08)", padding: "10px 12px", borderRadius: "6px", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                Warning: Yeh action user ko PostgreSQL database table aur role mappings se completely remove kar dega.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingUser(null)}>
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
                  Yes, Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


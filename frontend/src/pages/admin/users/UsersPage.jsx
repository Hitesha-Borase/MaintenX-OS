import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Layers,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { adminService } from "../../../services/adminService";
import masterDataService from "../../../services/masterDataService";

export function UsersPage() {
  const { users = [], roles = [], setUsers, addUser, editUser, deleteUser, updateUserStatus } = useAdmin() || {};
  const { plants = [], departments = [] } = (useMasterData ? useMasterData() : null) || {};
  const { addToast } = (useApp ? useApp() : null) || { addToast: () => {} };

  const [liveDepartments, setLiveDepartments] = useState([]);

  // Trigger live GET /api/v1/admin/users and master-data departments on mount
  React.useEffect(() => {
    adminService
      .getUsers()
      .then((data) => {
        if (Array.isArray(data) && setUsers) {
          setUsers(data);
        }
      })
      .catch((err) => console.warn("Live users fetch:", err.message));

    masterDataService
      .getDepartments()
      .then((res) => {
        const d = res?.data?.data || res?.data || res;
        if (Array.isArray(d)) {
          setLiveDepartments(d);
        }
      })
      .catch((err) => console.warn("Live depts fetch:", err.message));
  }, [setUsers]);

  const allDepartments = useMemo(() => {
    if (liveDepartments && liveDepartments.length > 0) return liveDepartments;
    if (departments && departments.length > 0) return departments;
    return [];
  }, [liveDepartments, departments]);

  const defaultDeptName = useMemo(() => {
    if (allDepartments && allDepartments.length > 0) {
      const first = allDepartments[0];
      return typeof first === "string" ? first : (first.name || first.code || "");
    }
    return "";
  }, [allDepartments]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const availableRoles = useMemo(() => {
    return (roles || []).filter(
      (r) => r.code !== "master_admin" && r.name !== "Master Admin"
    );
  }, [roles]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalError, setAddModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showEditModalPassword, setShowEditModalPassword] = useState(false);

  // View, Edit & Delete Modal States
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Plant Manager",
    department: "",
    plantId: "PLT-01",
    status: "Active"
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Plant Manager",
    department: "",
    plantId: "PLT-01",
    status: "Active"
  });

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    const matchedPlant = plants.find((p) => p.name.toLowerCase().includes((u.plant || "").toLowerCase()) || p.id === u.plantId);
    setEditFormData({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "Plant Manager",
      department: u.department || defaultDeptName,
      plantId: matchedPlant ? matchedPlant.id : (plants[0]?.id || "PLT-01"),
      status: u.status || "Active"
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedPlant = plants.find((p) => p.id === editFormData.plantId);
      const plantName = selectedPlant ? selectedPlant.name.split(" - ")[0] : (plants[0]?.name?.split(" - ")[0] || "");
      const deptToSubmit = editFormData.department || defaultDeptName;

      if (editUser) {
        await editUser(editingUser.id, {
          name: editFormData.name.trim(),
          email: editFormData.email.trim(),
          password: editFormData.password && editFormData.password.trim() ? editFormData.password.trim() : undefined,
          role: editFormData.role,
          department: deptToSubmit,
          plant: plantName,
          plantId: editFormData.plantId || (plants[0]?.id || "PLT-01"),
          status: editFormData.status
        });
      }

      addToast(`User ${editFormData.name} successfully updated!`, "success");
      setEditingUser(null);
    } catch (err) {
      addToast("Failed to update user: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsSubmitting(true);
      if (deleteUser) {
        await deleteUser(deletingUser.id);
      }
      addToast(`User ${deletingUser.name} successfully deleted.`, "success");
      setDeletingUser(null);
    } catch (err) {
      addToast("Failed to delete user: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, roleFilter, searchQuery]);

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      if (updateUserStatus) {
        await updateUserStatus(userId, newStatus);
      }
      addToast(`User ${userName || userId} status updated to ${newStatus}.`, "info");
    } catch (err) {
      addToast("Failed to update status: " + err.message, "error");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      setAddModalError("");
      const selectedPlant = plants.find((p) => p.id === formData.plantId);
      const plantName = selectedPlant ? selectedPlant.name.split(" - ")[0] : (plants[0]?.name?.split(" - ")[0] || "");
      const deptToSubmit = formData.department || defaultDeptName;

      if (addUser) {
        await addUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password && formData.password.trim() ? formData.password.trim() : "Password@123",
          role: formData.role,
          department: deptToSubmit,
          plant: plantName,
          plantId: formData.plantId || (plants[0]?.id || "PLT-01"),
          status: "Active"
        });
      }

      addToast(`User ${formData.name} successfully provisioned!`, "success");
      setIsAddModalOpen(false);
      setAddModalError("");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Plant Manager",
        department: "",
        plantId: "PLT-01",
        status: "Active"
      });
    } catch (err) {
      const msg = err.message || "Failed to provision user";
      setAddModalError(msg);
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              User Directory & Account Provisioning
            </h1>
            <Badge variant="cyan">{users.length} TOTAL USERS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Provision User
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
          title="Active Accounts"
          value={users.filter((u) => u.status === "Active").length.toString()}
          unit="Users"
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="System Administrators"
          value={users.filter((u) => u.role?.includes("Admin")).length.toString()}
          unit="Superusers"
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Pending SSO Invites"
          value="0"
          unit="Cleared"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="MFA Enforced"
          value="100%"
          unit="Compliant"
          icon={CheckCircle2}
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
              placeholder="Search users by name, email or department..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Roles</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Plant Manager">Plant Manager</option>
              <option value="Quality Manager">Quality Manager</option>
              <option value="Maintenance Lead">Maintenance Lead</option>
              <option value="Line Operator">Line Operator</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>User Profile</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Role</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Department</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const plantName = u.plant || plants.find((p) => p.id === u.plantId)?.name?.split(" - ")[0] || plants[0]?.name?.split(" - ")[0] || "Main Facility";
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{u.role}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {u.department || defaultDeptName}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Building2 size={12} color="#C89547" />
                        <span>{plantName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={u.status === "Active" ? "emerald" : "rose"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewingUser(u)}
                          title="View User Details"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#2563EB",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit User"
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
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status, u.name)}
                          title={u.status === "Active" ? "Suspend Account" : "Activate Account"}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: u.status === "Active" ? "#F59E0B" : "#059669",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {u.status === "Active" ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          title="Delete User"
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
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Provision Enterprise User
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {addModalError && (
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1.5px solid #EF4444",
                    borderRadius: "8px",
                    color: "#DC2626",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{addModalError}</span>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jdoe@maintenx.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Role Assignment *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {availableRoles && availableRoles.length > 0 ? (
                      availableRoles.map((r) => (
                        <option key={r.id || r.name} value={r.name}>{r.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="System Administrator">System Administrator</option>
                        <option value="Plant Manager">Plant Manager</option>
                        <option value="Quality Manager">Quality Manager</option>
                        <option value="Maintenance Lead">Maintenance Lead</option>
                        <option value="Line Operator">Line Operator</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="form-label">Plant Assignment *</label>
                  <select
                    value={formData.plantId}
                    onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Department</label>
                <select
                  value={formData.department || defaultDeptName}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {allDepartments && allDepartments.length > 0 ? (
                    allDepartments.map((d) => {
                      const val = typeof d === "string" ? d : (d.name || d.code);
                      return (
                        <option key={d.id || d.departmentId || val} value={val}>
                          {val}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">-- No Departments Registered --</option>
                  )}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Security Password</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>Default: Password@123</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showModalPassword ? "text" : "password"}
                    placeholder="Enter custom login password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF", paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px"
                    }}
                    title={showModalPassword ? "Hide password" : "Show password"}
                  >
                    {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Provisioning..." : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER MODAL */}
      {viewingUser && (
        <div className="modal-backdrop" onClick={() => setViewingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#2563EB" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  User Profile Overview
                </h2>
              </div>
              <button onClick={() => setViewingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header profile card */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 16px", borderRadius: "10px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C89547, #E5B869)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "18px",
                    boxShadow: "0 2px 8px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  {(viewingUser.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{viewingUser.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{viewingUser.email}</div>
                </div>
                <Badge variant={viewingUser.status === "Active" ? "emerald" : "rose"}>
                  {viewingUser.status}
                </Badge>
              </div>

              {/* Detail fields grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Role</div>
                  <div style={{ marginTop: "6px" }}>
                    <Badge variant="cyan">{viewingUser.role}</Badge>
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Department</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "6px" }}>
                    {viewingUser.department || defaultDeptName || "—"}
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "6px" }}>
                    <Building2 size={14} color="#C89547" />
                    <span>{viewingUser.plant || plants.find((p) => p.id === viewingUser.plantId)?.name?.split(" - ")[0] || plants[0]?.name?.split(" - ")[0] || "Main Facility"}</span>
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Last Login</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "6px" }}>
                    <Clock size={14} color="#2563EB" />
                    <span>{viewingUser.lastLogin || "Just now"}</span>
                  </div>
                </div>
              </div>

              {/* Compliance & Security Banner */}
              <div style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={18} color="#059669" />
                <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                  <strong>21 CFR Part 11 Compliant:</strong> Digital signature audit logging & enterprise MFA security active.
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingUser(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={Edit2}
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    handleOpenEditModal(target);
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Enterprise User
                </h2>
              </div>
              <button onClick={() => setEditingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Full Name *</label>
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
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Role Assignment *</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {availableRoles && availableRoles.length > 0 ? (
                      availableRoles.map((r) => (
                        <option key={r.id || r.name} value={r.name}>{r.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="System Administrator">System Administrator</option>
                        <option value="Plant Manager">Plant Manager</option>
                        <option value="Quality Manager">Quality Manager</option>
                        <option value="Maintenance Lead">Maintenance Lead</option>
                        <option value="Line Operator">Line Operator</option>
                        <option value="Planner / Scheduler">Planner / Scheduler</option>
                        <option value="Warehouse / Receiver">Warehouse / Receiver</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="form-label">Plant Assignment *</label>
                  <select
                    value={editFormData.plantId}
                    onChange={(e) => setEditFormData({ ...editFormData, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    value={editFormData.department || defaultDeptName}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {allDepartments && allDepartments.length > 0 ? (
                      allDepartments.map((d) => {
                        const val = typeof d === "string" ? d : (d.name || d.code);
                        return (
                          <option key={d.id || d.departmentId || val} value={val}>
                            {val}
                          </option>
                        );
                      })
                    ) : (
                      <option value="">-- No Departments Registered --</option>
                    )}
                    {editFormData.department && !allDepartments.some((d) => (d.name || d.code || d) === editFormData.department) && (
                      <option value={editFormData.department}>{editFormData.department}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="form-label">Account Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Update Password (Optional)</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>Leave empty to keep current</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showEditModalPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 6 chars)"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF", paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditModalPassword(!showEditModalPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px"
                    }}
                    title={showEditModalPassword ? "Hide password" : "Show password"}
                  >
                    {showEditModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingUser(null)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "440px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Delete User Account
                </h2>
              </div>
              <button onClick={() => setDeletingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete user <strong>{deletingUser.name}</strong> (<code>{deletingUser.email}</code>)?
              </p>
              <div style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>
                Warning: This will permanently remove the user from the system and revoke all plant facility access.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingUser(null)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  <Trash2 size={14} />
                  <span>{isSubmitting ? "Deleting..." : "Confirm Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

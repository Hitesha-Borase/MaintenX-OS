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
  Trash2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function UsersPage() {
  const { users = [], addUser, updateUserStatus, plants = [], departments = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Plant Manager",
    department: "Operations / Production",
    plantId: "PLT-01",
    status: "Active"
  });

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

  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    if (updateUserStatus) {
      updateUserStatus(userId, newStatus);
    }
    addToast(`User ${userId} status updated to ${newStatus}.`, "info");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    if (addUser) {
      addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        plantId: formData.plantId,
        status: "Active"
      });
    }

    addToast(`User ${formData.name} successfully provisioned!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "Plant Manager",
      department: "Operations / Production",
      plantId: "PLT-01",
      status: "Active"
    });
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
                const plantName = plants.find((p) => p.id === u.plantId)?.name?.split(" - ")[0] || "Indore Plant 1";
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
                      {u.department}
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
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        title={u.status === "Active" ? "Suspend Account" : "Activate Account"}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: u.status === "Active" ? "#EF4444" : "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {u.status === "Active" ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
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
                    <option value="System Administrator">System Administrator</option>
                    <option value="Plant Manager">Plant Manager</option>
                    <option value="Quality Manager">Quality Manager</option>
                    <option value="Maintenance Lead">Maintenance Lead</option>
                    <option value="Line Operator">Line Operator</option>
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
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Operations / Production">Operations / Production</option>
                  <option value="Maintenance & Reliability">Maintenance & Reliability</option>
                  <option value="Quality Assurance & Lab">Quality Assurance & Lab</option>
                  <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

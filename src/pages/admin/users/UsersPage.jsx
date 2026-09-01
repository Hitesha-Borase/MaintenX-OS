import React, { useState } from "react";
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
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function UsersPage() {
  const { users = [], addUser, updateUserStatus } = useAdmin();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Maintenance Lead",
    department: "Maintenance",
    plant: "Plant 1 (Austin)",
    status: "Active"
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
        plant: formData.plant,
        status: "Active"
      });
    }

    addToast(`User ${formData.name} successfully created!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "Maintenance Lead",
      department: "Maintenance",
      plant: "Plant 1 (Austin)",
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
            + Provision New User
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
          title="Active User Accounts"
          value={users.filter((u) => u.status === "Active").length.toString()}
          unit="Enabled"
          trend={{ value: "All credentials verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Suspended Accounts"
          value={users.filter((u) => u.status === "Suspended").length.toString()}
          unit="Locked"
          trend={{ value: "Access revoked", isPositive: false, text: "" }}
          icon={XCircle}
          colorVariant="rose"
        />
        <StatCard
          title="Administrative Users"
          value={users.filter((u) => u.role?.includes("Admin") || u.role?.includes("Manager")).length.toString()}
          unit="Privileged"
          trend={{ value: "MFA Enforced", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="RBAC Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "Least privilege enforced", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="emerald"
        />
      </div>

      {/* Users Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search user name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Role:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Plant Manager">Plant Manager</option>
              <option value="QA Manager">QA Manager</option>
              <option value="Maintenance Lead">Maintenance Lead</option>
              <option value="Operator / Line Tech">Operator / Line Tech</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Plant Scope</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isActive = u.status === "Active";

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{u.role}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.department}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{u.plant}</span>
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.lastLogin || "Today"}</td>
                    <td>
                      <Badge variant={isActive ? "emerald" : "rose"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: isActive ? "var(--bg-card-subtle)" : "rgba(16, 185, 129, 0.1)",
                          color: isActive ? "#DC2626" : "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer"
                        }}
                      >
                        {isActive ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PROVISION USER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Provision New User Account
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
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
                  <label className="form-label">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john.doe@flowstate.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">System Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="System Administrator">System Administrator</option>
                    <option value="Plant Manager">Plant Manager</option>
                    <option value="QA Manager">QA Manager</option>
                    <option value="Maintenance Lead">Maintenance Lead</option>
                    <option value="Operator / Line Tech">Operator / Line Tech</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Operations">Operations</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Warehouse / Logistics">Warehouse</option>
                    <option value="IT & Digital Ops">IT & Digital Ops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Plant Assignment Scope</label>
                <select
                  className="form-select"
                  value={formData.plant}
                  onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                  <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                  <option value="All Plants">All Plants (Enterprise Global)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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

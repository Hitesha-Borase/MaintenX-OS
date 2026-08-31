import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Mail,
  Download,
  X,
  Edit2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function UsersPage() {
  const { users, addUser, updateUserStatus } = useAdmin();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Operator / Line Tech",
    department: "Operations",
    plant: "Plant 1 (Austin)",
    status: "Active"
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast("Please provide name and email", "warning");
      return;
    }
    const created = addUser(formData);
    addToast(`User ${created.name} (${created.email}) provisioned successfully!`, "success");
    setIsAddModalOpen(false);
    setFormData({ name: "", email: "", role: "Operator / Line Tech", department: "Operations", plant: "Plant 1 (Austin)", status: "Active" });
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    updateUserStatus(userId, nextStatus);
    addToast(`User status updated to ${nextStatus}`, "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              User Directory & Account Provisioning
            </h1>
            <Badge variant="cyan">{users.length} Total Users</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Enterprise user management, role assignments, department associations, and account lifecycle controls.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Provision New User
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
          value={users.filter((u) => u.role.includes("Admin") || u.role.includes("Manager")).length.toString()}
          unit="Privileged"
          trend={{ value: "MFA Enforced", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="blue"
        />
      </div>

      {/* Users Table */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search user name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Role:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "160px", fontSize: "12px" }}
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

        <div className="data-table-container">
          <table className="data-table">
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
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{u.role}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.department}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{u.plant}</span>
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.lastLogin}</td>
                    <td>
                      <Badge variant={isActive ? "emerald" : "rose"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant={isActive ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleToggleStatus(u.id, u.status)}
                      >
                        {isActive ? "Suspend" : "Activate"}
                      </Button>
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Provision New User Account
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">System Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                >
                  <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                  <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                  <option value="All Plants">All Plants (Enterprise Global)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

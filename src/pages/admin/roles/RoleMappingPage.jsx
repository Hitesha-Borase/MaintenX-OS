import React, { useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  Save,
  ArrowRight
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function RoleMappingPage() {
  const { users, roles, setUsers } = useAdmin();
  const { addToast } = useApp();

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addToast(`Role updated to ${newRole} for user!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              User-to-Role Mapping Registry
            </h1>
            <Badge variant="emerald">Live RBAC Assignments</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Fast re-assignment of user access tiers, department bindings, and operational privileges.
          </p>
        </div>
      </div>

      {/* Mapping Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Current Role Assignment</th>
                <th>Department</th>
                <th>Plant Scope</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
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
                  <td>
                    <select
                      className="form-select"
                      style={{ fontSize: "12px", height: "34px", minWidth: "180px" }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  Building2,
  CheckCircle2,
  Lock,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function RoleMappingPage() {
  const { users = [], setUsers, roles = [] } = useAdmin();
  const { addToast } = useApp();

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addToast(`Role for user ${userId} updated to ${newRole}.`, "success");
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
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="System Administrator">System Administrator</option>
                      <option value="Plant Manager">Plant Manager</option>
                      <option value="QA Manager">QA Manager</option>
                      <option value="Maintenance Lead">Maintenance Lead</option>
                      <option value="Production Supervisor">Production Supervisor</option>
                      <option value="Operator / Line Tech">Operator / Line Tech</option>
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

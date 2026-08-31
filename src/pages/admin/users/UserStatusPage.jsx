import React, { useState } from "react";
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  ShieldAlert
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function UserStatusPage() {
  const { users, updateUserStatus } = useAdmin();
  const { addToast } = useApp();

  const [filterState, setFilterState] = useState("ALL");

  const filteredUsers = users.filter((u) => {
    if (filterState === "ALL") return true;
    return u.status === filterState;
  });

  const handleBulkAction = (action) => {
    users.forEach((u) => {
      if (u.role !== "System Administrator") {
        updateUserStatus(u.id, action);
      }
    });
    addToast(`All standard users set to ${action}.`, "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              User Account Lifecycle & Lockout Status
            </h1>
            <Badge variant="emerald">Authentication Status</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Active, suspended, or deactivated account oversight with instant access revocation controls.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => handleBulkAction("Active")}>
            Activate All
          </Button>
          <Button variant="danger" onClick={() => handleBulkAction("Suspended")}>
            Emergency Lock All Non-Admins
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px" }}>
        {["ALL", "Active", "Suspended"].map((tab) => (
          <button
            key={tab}
            className={`btn ${filterState === tab ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterState(tab)}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            {tab} Users ({tab === "ALL" ? users.length : users.filter((u) => u.status === tab).length})
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name & Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isActive = u.status === "Active";

                return (
                  <tr key={u.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{u.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{u.role}</Badge>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.lastLogin}</td>
                    <td>
                      <Badge variant={isActive ? "emerald" : "rose"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant={isActive ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => {
                          const next = isActive ? "Suspended" : "Active";
                          updateUserStatus(u.id, next);
                          addToast(`${u.name} status updated to ${next}`, "info");
                        }}
                      >
                        {isActive ? "Lockout" : "Re-Enable"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

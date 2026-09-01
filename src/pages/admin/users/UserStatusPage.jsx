import React, { useState } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function UserStatusPage() {
  const { users = [], updateUserStatus } = useAdmin();
  const { addToast } = useApp();

  const [filterState, setFilterState] = useState("ALL");

  const filteredUsers = users.filter((u) => {
    if (filterState === "ALL") return true;
    return u.status === filterState;
  });

  const handleBulkAction = (targetStatus) => {
    users.forEach((u) => {
      if (u.role !== "System Administrator") {
        updateUserStatus(u.id, targetStatus);
      }
    });
    addToast(`Bulk action executed: All standard accounts set to ${targetStatus}.`, "warning");
  };

  const activeCount = users.filter((u) => u.status === "Active").length;
  const lockedCount = users.filter((u) => u.status === "Suspended").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              User Account Lifecycle & Lockout Status
            </h1>
            <Badge variant="emerald">AUTHENTICATION STATUS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => handleBulkAction("Active")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Activate All
          </Button>
          <Button variant="danger" onClick={() => handleBulkAction("Suspended")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Emergency Lock All
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
          title="Active Accounts"
          value={activeCount.toString()}
          unit="Active"
          trend={{ value: "All credentials nominal", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Suspended Accounts"
          value={lockedCount.toString()}
          unit="Locked"
          trend={{ value: "Access revoked", isPositive: false, text: "" }}
          icon={XCircle}
          colorVariant="rose"
        />
        <StatCard
          title="Security Enforcement"
          value="100%"
          unit="MFA Active"
          trend={{ value: "Strict password policy", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="cyan"
        />
        <StatCard
          title="Session Health"
          value="100%"
          unit="Secure"
          trend={{ value: "Zero rogue tokens", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["ALL", "Active", "Suspended"].map((tab) => (
          <button
            key={tab}
            className={`btn ${filterState === tab ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterState(tab)}
            style={{ padding: "6px 14px", fontSize: "12px", borderRadius: "6px", fontWeight: 700 }}
          >
            {tab} Users ({tab === "ALL" ? users.length : users.filter((u) => u.status === tab).length})
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "640px" }}>
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
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{u.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{u.role}</Badge>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.lastLogin || "Today"}</td>
                    <td>
                      <Badge variant={isActive ? "emerald" : "rose"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          const next = isActive ? "Suspended" : "Active";
                          updateUserStatus(u.id, next);
                          addToast(`${u.name} status updated to ${next}`, "info");
                        }}
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
                        {isActive ? "Lockout" : "Re-Enable"}
                      </button>
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

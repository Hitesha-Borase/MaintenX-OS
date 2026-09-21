import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Eye,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function UserStatusPage() {
  const { users = [], setUsers, updateUserStatus, deleteUser, bulkUpdateStatus } = useAdmin() || {};
  const { addToast } = useApp ? useApp() : { addToast: () => {} };

  useEffect(() => {
    adminService
      .getUsers()
      .then((data) => {
        if (Array.isArray(data) && setUsers) {
          setUsers(data);
        }
      })
      .catch((err) => console.warn("Users load:", err.message));
  }, [setUsers]);

  const [filterState, setFilterState] = useState("ALL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const filteredUsers = users.filter((u) => {
    if (filterState === "ALL") return true;
    return u.status === filterState;
  });

  const handleBulkAction = async (targetStatus) => {
    try {
      setIsProcessing(true);
      const action = targetStatus === "Active" ? "ACTIVATE_ALL" : "EMERGENCY_LOCK_ALL";
      if (bulkUpdateStatus) {
        await bulkUpdateStatus(action);
      }
      addToast(
        targetStatus === "Active"
          ? "All standard accounts successfully activated."
          : "Emergency Lockout: All standard accounts suspended.",
        targetStatus === "Active" ? "success" : "warning"
      );
    } catch (err) {
      addToast("Failed to execute bulk action: " + err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRowStatusChange = async (userId, currentStatus, userName) => {
    const next = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      if (updateUserStatus) {
        await updateUserStatus(userId, next);
      }
      addToast(`${userName || userId} status updated to ${next}`, "info");
    } catch (err) {
      addToast("Failed to update status: " + err.message, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsProcessing(true);
      if (deleteUser) {
        await deleteUser(deletingUser.id);
      }
      addToast(`User ${deletingUser.name || deletingUser.email} successfully deleted.`, "success");
      setDeletingUser(null);
    } catch (err) {
      addToast("Failed to delete user: " + err.message, "error");
    } finally {
      setIsProcessing(false);
    }
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
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setViewingUser(u)}
                          title="View User Status & Profile"
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
                          onClick={() => handleRowStatusChange(u.id, u.status, u.name)}
                          title={isActive ? "Lockout User Account" : "Re-Enable User Account"}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: isActive ? "var(--bg-card-subtle)" : "rgba(16, 185, 129, 0.1)",
                            color: isActive ? "#DC2626" : "#059669",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer"
                          }}
                        >
                          {isActive ? "Lockout" : "Enable"}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW USER DETAILS MODAL */}
      {viewingUser && (
        <div className="modal-backdrop" onClick={() => setViewingUser(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  User Account & Status Details
                </h2>
              </div>
              <button onClick={() => setViewingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>User ID</span>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{viewingUser.id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Status</span>
                  <Badge variant={viewingUser.status === "Active" ? "emerald" : "rose"}>
                    {viewingUser.status}
                  </Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Full Name</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingUser.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Email</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "12px" }}>{viewingUser.email}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Assigned Role</span>
                  <Badge variant="cyan">{viewingUser.role}</Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Department</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingUser.department || "Operations"}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Plant Facility</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingUser.plant || "Plant 1 - Meat Processing & Smokehouse Facility"}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Last Login</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{viewingUser.lastLogin || "Today"}</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <Button variant="secondary" onClick={() => setViewingUser(null)}>
                  Close
                </Button>
                <Button
                  variant={viewingUser.status === "Active" ? "danger" : "primary"}
                  onClick={() => {
                    handleRowStatusChange(viewingUser.id, viewingUser.status, viewingUser.name);
                    setViewingUser(null);
                  }}
                >
                  {viewingUser.status === "Active" ? "Lockout User" : "Activate User"}
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
                Are you sure you want to permanently delete user <strong>{deletingUser.name}</strong> ({deletingUser.email}) from the database?
              </p>
              <div style={{ fontSize: "12px", color: "#DC2626", backgroundColor: "rgba(220, 38, 38, 0.08)", padding: "10px 12px", borderRadius: "6px", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                Warning: This action will permanently remove the user record from the database.
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

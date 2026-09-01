import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Check,
  CheckCheck,
  CheckCircle2,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const { addToast } = useApp();

  const [filterTab, setFilterTab] = useState("all"); // "all", "unread", "read"
  const [deletingNotification, setDeletingNotification] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "CAPA Overdue — CA-301",
      msg: "Corrective action CA-301 (Viton diaphragm replacement) is past its due date. Responsible: Pedro Alves.",
      time: "1 hr ago",
      type: "Overdue",
      severity: "critical",
      read: false
    },
    {
      id: 2,
      title: "CI Project Action Milestone — CI-001",
      msg: "Filler nozzle dynamic laser flow rate calibration (ACT-01) due in 2 days.",
      time: "4 hrs ago",
      type: "Milestone",
      severity: "warning",
      read: false
    },
    {
      id: 3,
      title: "Benefits Verification Required — CI-003",
      msg: "60-day trial window for Label Application Defect Elimination concluded. Ready for finance sign-off.",
      time: "1 day ago",
      type: "Audit",
      severity: "info",
      read: false
    }
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    addToast("Notification marked as read.", "success");
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast("All notifications marked as read.", "success");
  };

  const handleConfirmClearAll = () => {
    setNotifications([]);
    addToast("All notifications cleared.", "info");
    setIsClearAllModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingNotification) return;
    setNotifications((prev) => prev.filter((n) => n.id !== deletingNotification.id));
    addToast("Notification removed.", "info");
    setDeletingNotification(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filterTab === "unread") return !n.read;
    if (filterTab === "read") return n.read;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI / Engineering Notifications
            </h1>
            {unreadCount > 0 ? (
              <Badge variant="rose">{unreadCount} UNREAD</Badge>
            ) : (
              <Badge variant="emerald">ALL READ</Badge>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={handleMarkAllAsRead}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="secondary"
              icon={Trash2}
              onClick={() => setIsClearAllModalOpen(true)}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterTab("all")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            backgroundColor: filterTab === "all" ? "var(--color-primary)" : "var(--bg-card-subtle)",
            color: filterTab === "all" ? "#FFFFFF" : "var(--text-secondary)"
          }}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilterTab("unread")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            backgroundColor: filterTab === "unread" ? "var(--color-primary)" : "var(--bg-card-subtle)",
            color: filterTab === "unread" ? "#FFFFFF" : "var(--text-secondary)"
          }}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilterTab("read")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            backgroundColor: filterTab === "read" ? "var(--color-primary)" : "var(--bg-card-subtle)",
            color: filterTab === "read" ? "#FFFFFF" : "var(--text-secondary)"
          }}
        >
          Read ({readCount})
        </button>
      </div>

      {/* Notifications Feed */}
      {filteredNotifs.length === 0 ? (
        <Card style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={32} color="#059669" />
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            {filterTab === "unread" ? "No unread notifications" : "No notifications found"}
          </h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            All your CI alerts and engineering updates are up to date.
          </span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          {filteredNotifs.map((n) => {
            const isOverdue = n.type === "Overdue";
            const isUnread = !n.read;

            return (
              <Card
                key={n.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  padding: "14px 16px",
                  borderLeft: isUnread
                    ? `4px solid ${isOverdue ? "#DC2626" : "#D97706"}`
                    : "4px solid var(--border-subtle)",
                  backgroundColor: isUnread ? "var(--bg-card)" : "var(--bg-card-subtle)",
                  opacity: isUnread ? 1 : 0.85,
                  boxSizing: "border-box",
                  minWidth: 0,
                  width: "100%",
                  borderRadius: "8px"
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", minWidth: "220px", flex: 1 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: isUnread
                        ? isOverdue
                          ? "rgba(220, 38, 38, 0.12)"
                          : "rgba(217, 119, 6, 0.12)"
                        : "var(--bg-card-subtle)",
                      color: isUnread ? (isOverdue ? "#DC2626" : "#D97706") : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {isOverdue ? <AlertTriangle size={16} /> : <Bell size={16} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {isUnread && (
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "#DC2626",
                            display: "inline-block"
                          }}
                          title="Unread"
                        />
                      )}
                      <h4
                        style={{
                          fontSize: "13px",
                          fontWeight: isUnread ? 800 : 600,
                          color: isUnread ? "var(--text-primary)" : "var(--text-secondary)"
                        }}
                      >
                        {n.title}
                      </h4>
                      <Badge variant={isOverdue ? "rose" : "amber"}>{n.type}</Badge>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                        {n.time}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: isUnread ? "var(--text-secondary)" : "var(--text-muted)",
                        marginTop: "4px",
                        lineHeight: 1.4
                      }}
                    >
                      {n.msg}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {isUnread ? (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as Read"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Check size={12} color="#059669" />
                      Mark as Read
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        padding: "4px 8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Check size={12} color="#059669" /> Read
                    </span>
                  )}

                  <button
                    onClick={() => setDeletingNotification(n)}
                    title="Delete Notification"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      background: "transparent",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CONFIRM DELETE INDIVIDUAL NOTIFICATION MODAL */}
      {deletingNotification && (
        <div className="modal-backdrop" onClick={() => setDeletingNotification(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Delete
                </h2>
              </div>
              <button onClick={() => setDeletingNotification(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me is notification (<strong>{deletingNotification.title}</strong>) ko delete karna chahte hain?
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingNotification(null)}>
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
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL MODAL */}
      {isClearAllModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsClearAllModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Clear All
                </h2>
              </div>
              <button onClick={() => setIsClearAllModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me <strong>sabhi {notifications.length} notifications</strong> ko delete / clear karna chahte hain?
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsClearAllModalOpen(false)}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmClearAll}
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
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, X, Eye, Info, ShieldCheck, Wrench, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import executiveService from "../../services/executiveService";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getNotifications();
      const data = res.data || res;
      if (data && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      addToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await executiveService.markNotificationRead({ id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      addToast("Notification marked as read.", "success");
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await executiveService.deleteNotification({ id });
      setNotifications(prev => prev.filter((n) => n.id !== id));
      addToast("Notification deleted.", "info");
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await executiveService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast("All notifications marked as read.", "success");
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await executiveService.clearAllNotifications();
      setNotifications([]);
      addToast("All notifications cleared.", "info");
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "read") return n.read;
    return true;
  });

  const getStyleProps = (type) => {
    switch (type) {
      case "system":
        return { border: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444", badge: "SLA WARNING", badgeVariant: "red" };
      case "finance":
        return { border: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", badge: "COST EXCURSION", badgeVariant: "orange" };
      default:
        return { border: "#64748B", bg: "rgba(100, 116, 139, 0.1)", color: "#64748B", badge: "INFO", badgeVariant: "secondary" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Executive Notifications
          </h1>
          {unreadCount > 0 && <Badge variant="red">{unreadCount} UNREAD</Badge>}
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" icon={CheckCircle2} onClick={handleMarkAllAsRead} style={{ fontSize: "12px", height: "32px" }}>Mark All as Read</Button>
          <Button variant="secondary" icon={Trash2} onClick={handleClearAll} style={{ fontSize: "12px", height: "32px" }}>Clear All</Button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px", overflowX: "auto" }}>
        <span onClick={() => setActiveTab("all")} style={{ fontSize: "13px", fontWeight: activeTab === "all" ? 700 : 600, color: activeTab === "all" ? "var(--text-primary)" : "var(--text-muted)", borderBottom: activeTab === "all" ? "2px solid var(--text-primary)" : "none", paddingBottom: "12px", marginBottom: "-13px", cursor: "pointer", whiteSpace: "nowrap" }}>All ({notifications.length})</span>
        <span onClick={() => setActiveTab("unread")} style={{ fontSize: "13px", fontWeight: activeTab === "unread" ? 700 : 600, color: activeTab === "unread" ? "var(--text-primary)" : "var(--text-muted)", borderBottom: activeTab === "unread" ? "2px solid var(--text-primary)" : "none", paddingBottom: "12px", marginBottom: "-13px", cursor: "pointer", whiteSpace: "nowrap" }}>Unread ({unreadCount})</span>
        <span onClick={() => setActiveTab("read")} style={{ fontSize: "13px", fontWeight: activeTab === "read" ? 700 : 600, color: activeTab === "read" ? "var(--text-primary)" : "var(--text-muted)", borderBottom: activeTab === "read" ? "2px solid var(--text-primary)" : "none", paddingBottom: "12px", marginBottom: "-13px", cursor: "pointer", whiteSpace: "nowrap" }}>Read ({readCount})</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <Bell size={32} color="var(--text-muted)" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>No active notifications to display.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((n) => {
            const IconComponent = AlertTriangle;
            const s = getStyleProps(n.type);

            return (
              <Card
                key={n.id}
                style={{
                  padding: 0,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `4px solid ${s.border}`,
                  boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
                  overflow: "hidden"
                }}
              >
                <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", padding: "16px" }}>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", minWidth: 0 }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: s.color,
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={16} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        {!n.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }}></div>}
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                          {n.title}
                        </h4>
                        <Badge variant={s.badgeVariant}>{s.badge}</Badge>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {n.time}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, paddingLeft: !n.read ? "14px" : "0", lineHeight: 1.5 }}>
                        {n.msg}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0, alignSelf: "flex-start" }}>
                    {!n.read && (
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={CheckCircle2}
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={Trash2}
                      onClick={() => handleDelete(n.id)}
                    />
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

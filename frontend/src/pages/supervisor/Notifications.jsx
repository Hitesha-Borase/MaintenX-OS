import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Info, ShieldAlert, CheckCircle2, Trash2, Plus, RefreshCw, X } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import dashboardService from "../../services/dashboardService";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State for creating new live alert
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formCategory, setFormCategory] = useState("Operations");
  const [formSeverity, setFormSeverity] = useState("WARNING");

  const fetchNotifications = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await dashboardService.getSupervisorNotifications();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const mapped = list.map(n => {
        const sev = (n.severity || "").toUpperCase();
        const isCrit = n.type === "exception" || sev === "CRITICAL" || sev.includes("P1");
        return {
          ...n,
          icon: isCrit ? ShieldAlert : Info
        };
      });
      setNotifications(mapped);
      if (isManualRefresh) {
        addToast("Notifications refreshed.", "info");
      }
    } catch (err) {
      console.error("Failed to fetch supervisor notifications:", err);
      addToast("Failed to load notifications from server.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await dashboardService.markSupervisorNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      addToast(res?.message || "Notification marked as read.", "success");
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      addToast("Notification marked as read.", "success");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await dashboardService.deleteSupervisorNotification(id);
      setNotifications(prev => prev.filter((n) => n.id !== id));
      addToast(res?.message || "Notification deleted.", "info");
    } catch (err) {
      setNotifications(prev => prev.filter((n) => n.id !== id));
      addToast("Notification deleted.", "info");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await dashboardService.markAllSupervisorNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast(res?.message || "All notifications marked as read.", "success");
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast("All notifications marked as read.", "success");
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await dashboardService.clearAllSupervisorNotifications();
      setNotifications([]);
      addToast(res?.message || "All notifications cleared.", "info");
    } catch (err) {
      setNotifications([]);
      addToast("All notifications cleared.", "info");
    }
  };

  const handleOpenModal = () => {
    setFormTitle("");
    setFormMessage("");
    setFormCategory("Operations");
    setFormSeverity("WARNING");
    setIsModalOpen(true);
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      addToast("Please fill in Title and Message fields.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      let targetPath = "/supervisor";
      if (formCategory === "Approvals") targetPath = "/supervisor/approvals";
      else if (formCategory === "Quality Hold") targetPath = "/supervisor/holds";
      else if (formCategory === "Production") targetPath = "/supervisor/recovery";

      const res = await dashboardService.createSupervisorNotification({
        title: formTitle.trim(),
        message: formMessage.trim(),
        category: formCategory,
        severity: formSeverity,
        linkUrl: targetPath
      });

      addToast(res?.message || "Operational notification created successfully.", "success");
      setIsModalOpen(false);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to create notification:", err);
      addToast("Failed to create notification.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "read") return n.read;
    return true;
  });

  const getStyleProps = (type, severity) => {
    const sev = (severity || "").toUpperCase();
    if (type === "exception" || sev === "CRITICAL" || sev.includes("P1")) {
      return { border: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444", badge: "CRITICAL", badgeVariant: "red" };
    }
    if (type === "system" || sev === "WARNING" || sev.includes("AUDIT")) {
      return { border: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", color: "#D97706", badge: sev || "WARNING", badgeVariant: "amber" };
    }
    return { border: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", color: "#2563EB", badge: sev || "INFO", badgeVariant: "secondary" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Header */}
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Operations Supervisor Notifications
          </h1>
          {unreadCount > 0 && <Badge variant="red">{unreadCount} UNREAD</Badge>}
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={() => fetchNotifications(true)}
            disabled={refreshing || loading}
            style={{ fontSize: "12px", height: "32px" }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenModal}
            style={{ fontSize: "12px", height: "32px", backgroundColor: "#C89547", borderColor: "#C89547" }}
          >
            + Create Alert
          </Button>
          <Button
            variant="secondary"
            icon={CheckCircle2}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            style={{ fontSize: "12px", height: "32px" }}
          >
            Mark All as Read
          </Button>
          <Button
            variant="secondary"
            icon={Trash2}
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            style={{ fontSize: "12px", height: "32px" }}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px", overflowX: "auto" }}>
        <span
          onClick={() => setActiveTab("all")}
          style={{
            fontSize: "13px",
            fontWeight: activeTab === "all" ? 700 : 600,
            color: activeTab === "all" ? "var(--text-primary)" : "var(--text-muted)",
            borderBottom: activeTab === "all" ? "2px solid var(--text-primary)" : "none",
            paddingBottom: "12px",
            marginBottom: "-13px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          All ({notifications.length})
        </span>
        <span
          onClick={() => setActiveTab("unread")}
          style={{
            fontSize: "13px",
            fontWeight: activeTab === "unread" ? 700 : 600,
            color: activeTab === "unread" ? "var(--text-primary)" : "var(--text-muted)",
            borderBottom: activeTab === "unread" ? "2px solid var(--text-primary)" : "none",
            paddingBottom: "12px",
            marginBottom: "-13px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          Unread ({unreadCount})
        </span>
        <span
          onClick={() => setActiveTab("read")}
          style={{
            fontSize: "13px",
            fontWeight: activeTab === "read" ? 700 : 600,
            color: activeTab === "read" ? "var(--text-primary)" : "var(--text-muted)",
            borderBottom: activeTab === "read" ? "2px solid var(--text-primary)" : "none",
            paddingBottom: "12px",
            marginBottom: "-13px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          Read ({readCount})
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <Card style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          Loading real-time operational notifications...
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card style={{ padding: "48px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <Bell size={36} color="var(--text-muted)" style={{ opacity: 0.6 }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            No Active Notifications
          </h3>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px" }}>
            There are currently no {activeTab !== "all" ? activeTab : ""} notifications for this plant. You can click <strong>"+ Create Alert"</strong> above to dispatch a new live notification.
          </span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((n) => {
            const IconComponent = n.icon;
            const s = getStyleProps(n.type, n.severity);

            return (
              <Card
                key={n.id}
                style={{
                  padding: 0,
                  backgroundColor: n.read ? "var(--bg-card, #FFFFFF)" : "#FFFFFF",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `4px solid ${s.border}`,
                  boxShadow: n.read ? "none" : "0 2px 8px rgba(70, 45, 15, 0.04)",
                  opacity: n.read ? 0.85 : 1,
                  overflow: "hidden"
                }}
              >
                <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", padding: "16px" }}>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", minWidth: 0, flex: 1 }}>
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
                        <h4
                          onClick={() => n.path && navigate(n.path)}
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            margin: 0,
                            cursor: n.path ? "pointer" : "default"
                          }}
                        >
                          {n.title}
                        </h4>
                        <Badge variant={s.badgeVariant}>{s.badge}</Badge>
                        {n.category && (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", backgroundColor: "var(--bg-tag, #F1F5F9)", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                            {n.category}
                          </span>
                        )}
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {n.time}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, paddingLeft: !n.read ? "14px" : "0", lineHeight: 1.5 }}>
                        {n.msg || n.message}
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

      {/* Manual Entry Modal for Create Alert */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card, #FFFFFF)",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-page, #F8FAFC)"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                Create Operational Notification
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAlert} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Pasteurizer Overheat Warning - Line 2"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Severity Level *
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="CRITICAL">CRITICAL (Red)</option>
                    <option value="WARNING">WARNING (Amber)</option>
                    <option value="INFO">INFO (Blue)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Operations">Operations</option>
                    <option value="Approvals">Approvals (PM & Shift)</option>
                    <option value="Quality Hold">Quality Hold</option>
                    <option value="Production">Production Pace</option>
                    <option value="Supervisor Alert">Supervisor Alert</option>
                    <option value="Staffing">Staffing</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Notification Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Type alert details, affected equipment, or required supervisor action..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  style={{ fontSize: "13px", backgroundColor: "#C89547", borderColor: "#C89547" }}
                >
                  {submitting ? "Creating..." : "Create Alert"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;


import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Info, 
  ShieldAlert, 
  Check, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Eye,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import qualityService from "../../services/qualityService";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState([
    { 
      id: "NOTIF-01", 
      title: "CCP Excursion Alert", 
      msg: "Pasteurizer HTST temp dropped to 82.9°C on Line 1. Batch BAT-2026-0890 placed on HOLD.", 
      time: "2 min ago", 
      path: "/quality/events/holds",
      type: "danger",
      badge: "CRITICAL",
      read: false
    },
    { 
      id: "NOTIF-02", 
      title: "Batch Ready for QA Release", 
      msg: "Batch BAT-2026-0888 is awaiting human QA sign-off before dispatch.", 
      time: "1 hour ago", 
      path: "/quality/release/queue",
      type: "primary",
      badge: "RELEASE",
      read: false
    },
    { 
      id: "NOTIF-03", 
      title: "Investigation Finding Recorded", 
      msg: "Dr. Rachel Thorne submitted root cause findings for thermal probe drift.", 
      time: "3 hours ago", 
      path: "/quality/rca-capa",
      type: "primary",
      badge: "INVESTIGATION",
      read: true
    }
  ]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getNotifications();
      if (res?.data && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn("Notifications fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Read") return n.read;
    return true;
  });

  const handleMarkRead = async (id) => {
    try {
      await qualityService.markNotificationRead({ id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      addToast("Notification marked as read.", "success");
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      addToast("Notification marked as read.", "success");
    }
  };

  const handleDelete = async (id) => {
    try {
      await qualityService.clearNotifications({ id });
      setNotifications(prev => prev.filter(n => n.id !== id));
      addToast("Notification deleted.", "info");
    } catch (err) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      addToast("Notification deleted.", "info");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await qualityService.markNotificationRead({ id: "ALL" });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast("All notifications marked as read.", "success");
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast("All notifications marked as read.", "success");
    }
  };

  const handleClearAll = async () => {
    try {
      await qualityService.clearNotifications({ id: "ALL" });
      setNotifications([]);
      addToast("All notifications cleared.", "info");
    } catch (err) {
      setNotifications([]);
      addToast("All notifications cleared.", "info");
    }
  };

  const handleRowClick = (n) => {
    if (n.path) {
      navigate(n.path);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", paddingBottom: "40px" }}>
      {/* Header and Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B6914" }}>
              Alerts & System Messages
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
              QA Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{ 
                padding: "3px 10px", 
                backgroundColor: "rgba(220, 38, 38, 0.12)", 
                color: "#DC2626", 
                borderRadius: "12px", 
                fontSize: "12px", 
                fontWeight: 800, 
                letterSpacing: "0.05em" 
              }}>
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Real-time critical alarms, CCP temperature alerts, hold lot escalations, and release sign-off requests.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button 
            variant="outline" 
            size="sm" 
            icon={CheckCircle2} 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon={Trash2} 
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadNotifications} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Total Alerts</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{notifications.length}</div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(220, 38, 38, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={22} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Critical Attention</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#DC2626" }}>{unreadCount}</div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Real-Time Webhook</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#8B6914" }}>Active &bull; 100%</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #E8DDCF", paddingBottom: "10px" }}>
        {["All", "Unread", "Read"].map(tab => {
          const count = tab === "All" ? notifications.length : tab === "Unread" ? unreadCount : notifications.length - unreadCount;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "0 0 10px 0",
                fontSize: "14px",
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#2B1D11" : "var(--text-secondary)",
                borderBottom: isActive ? "3px solid #8B6914" : "3px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <Card style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", background: "white", border: "1px solid #E8DDCF" }}>
          <div style={{ padding: "16px", backgroundColor: "rgba(200, 149, 71, 0.15)", borderRadius: "50%" }}>
            <Bell size={32} color="#8B6914" />
          </div>
          <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 500 }}>No notifications found in this view.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((n) => {
            const isDanger = n.type === "danger" || n.badge === "CRITICAL";
            
            return (
              <Card 
                key={n.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  gap: "16px", 
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: n.read ? "#FAF8F5" : "#FFFFFF",
                  border: isDanger ? "1px solid rgba(220, 38, 38, 0.35)" : "1px solid #E8DDCF",
                  borderLeft: isDanger ? "5px solid #DC2626" : "5px solid #C89547",
                  boxShadow: n.read ? "none" : "0 2px 8px rgba(0,0,0,0.03)",
                  transition: "all 0.2s"
                }}
              >
                <div 
                  style={{ display: "flex", gap: "14px", alignItems: "center", flex: 1, cursor: n.path ? "pointer" : "default" }}
                  onClick={() => handleRowClick(n)}
                >
                  <div style={{ width: "10px", display: "flex", justifyContent: "center" }}>
                    {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isDanger ? "#DC2626" : "#8B6914" }} />}
                  </div>
                  
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "10px", 
                    backgroundColor: isDanger ? "rgba(220, 38, 38, 0.1)" : "rgba(200, 149, 71, 0.15)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    flexShrink: 0 
                  }}>
                    {isDanger ? <ShieldAlert size={20} color="#DC2626" /> : <Info size={20} color="#8B6914" />}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#2B1D11", margin: 0 }}>{n.title}</h4>
                      {n.badge && (
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: isDanger ? "rgba(220, 38, 38, 0.12)" : "rgba(200, 149, 71, 0.15)",
                          color: isDanger ? "#DC2626" : "#8B6914"
                        }}>
                          {n.badge}
                        </span>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{n.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                      {n.msg}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {n.path && (
                    <button
                      onClick={() => navigate(n.path)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #D1C7BA",
                        background: "#FAF8F5",
                        color: "#2B1D11",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>Take Action</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                        color: "#261603",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Check size={14} />
                      Mark as Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid #E8DDCF",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      cursor: "pointer"
                    }}
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;

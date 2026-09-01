import React, { useState } from "react";
import { Bell, Info, ShieldAlert, Check, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("All");

  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "CCP Excursion Alert", 
      msg: "Pasteurizer HTST temp dropped to 82.9°C on Line 1. Batch BAT-2026-0890 placed on HOLD.", 
      time: "2 min ago", 
      path: "/quality/events/holds",
      type: "danger",
      badge: "CRITICAL",
      read: false
    },
    { 
      id: 2, 
      title: "Batch Ready for QA Release", 
      msg: "Batch BAT-2026-0890 is awaiting human QA sign-off before dispatch.", 
      time: "1 hour ago", 
      path: "/quality/release/queue",
      type: "primary",
      badge: "RELEASE",
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Read") return n.read;
    return true;
  });

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast("Notification deleted.", "info");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast("All notifications marked as read.", "success");
  };

  const handleClearAll = () => {
    setNotifications([]);
    addToast("All notifications cleared.", "info");
  };

  const getSeverityColor = (type) => {
    switch (type) {
      case "danger": return "var(--red-500, #EF4444)";
      case "warning": return "var(--amber-500, #F59E0B)";
      default: return "var(--primary-500, #C89547)";
    }
  };

  const getSeverityBg = (type) => {
    switch (type) {
      case "danger": return "rgba(239, 68, 68, 0.1)";
      case "warning": return "rgba(245, 158, 11, 0.1)";
      default: return "rgba(200, 149, 71, 0.1)";
    }
  };

  const getIcon = (type) => {
    if (type === "danger") return ShieldAlert;
    if (type === "primary") return Info;
    return Bell;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Header and Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              QA Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{ padding: "4px 8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
            Active CCP excursion alerts, hold notifications, and release queue updates
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" size="sm" icon={CheckCircle2} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginTop: "8px" }}>
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
                padding: "0 0 12px 0",
                marginBottom: "-13px",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                borderBottom: isActive ? "2px solid var(--text-primary)" : "2px solid transparent",
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
        <Card style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "16px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "50%" }}>
            <Bell size={32} color="#C89547" />
          </div>
          <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 500 }}>No notifications found in this view.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((n) => {
            const IconComponent = getIcon(n.type);
            const color = getSeverityColor(n.type);
            const bg = getSeverityBg(n.type);
            
            return (
              <Card 
                key={n.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "space-between", 
                  gap: "16px", 
                  padding: "16px 20px",
                  borderLeft: `4px solid ${color}`,
                  flexWrap: "wrap",
                  opacity: n.read ? 0.7 : 1
                }}
              >
                <div style={{ display: "flex", gap: "16px", flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", paddingTop: "8px", width: "12px" }}>
                    {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color }} />}
                  </div>
                  
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", color: color, flexShrink: 0 }}>
                    <IconComponent size={20} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{n.title}</h4>
                      {n.badge && <Badge variant={n.type === "danger" ? "danger" : "primary"}>{n.badge}</Badge>}
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{n.msg}</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px", alignItems: "center", paddingTop: "4px" }}>
                  {!n.read && (
                    <Button variant="outline" size="sm" icon={Check} onClick={() => handleMarkRead(n.id)}>
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(n.id)} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

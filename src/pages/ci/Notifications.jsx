import React, { useState } from "react";
import { Bell, AlertTriangle, Check, CheckCheck, CheckCircle2, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("All");
  const [filterTab, setFilterTab] = useState("all"); // "all", "unread", "read"
  const [deletingNotification, setDeletingNotification] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "CAPA Overdue — CA-301", 
      msg: "Corrective action CA-301 (Viton diaphragm replacement) is past its due date. Responsible: Pedro Alves.", 
      time: "1 hr ago", 
      path: "/ci/capa/corrective",
      type: "danger",
      badge: "OVERDUE",
      read: false
    },
    { 
      id: 2, 
      title: "CI Project Action Milestone — CI-001", 
      msg: "Filler nozzle dynamic laser flow rate calibration (ACT-01) due in 2 days.", 
      time: "4 hrs ago", 
      path: "/ci/projects/actions",
      type: "warning",
      badge: "MILESTONE",
      read: false
    },
    { 
      id: 3, 
      title: "Benefits Verification Required — CI-003", 
      msg: "90-day trial window for Label Application Defect Elimination concluded. Ready for finance sign-off.", 
      time: "1 day ago", 
      path: "/ci/benefits/verify",
      type: "warning",
      badge: "AUDIT",
      read: true
    },
    { 
      id: 4, 
      title: "New RCA Submitted — Line 4 Jam", 
      msg: "A new Root Cause Analysis has been drafted for the recurring accumulation table jam on Line 4.", 
      time: "2 days ago", 
      path: "/ci/5why/rca",
      type: "info",
      badge: "RCA",
      read: true
    }
  ]);

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
    if (type === "danger") return AlertTriangle;
    return Bell;
  };
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Header and Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              CI / Engineering Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{ padding: "4px 8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
            CAPA overdue alerts, RCA phase updates, and CI project action reminders
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" size="sm" icon={CheckCircle2} onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setIsClearAllModalOpen(true)}>
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
      {filteredNotifs.length === 0 ? (
        <Card style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "16px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "50%" }}>
            <Bell size={32} color="#C89547" />
          </div>
          <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 500 }}>No notifications found in this view.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifs.map((n) => {
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
                      {n.badge && <Badge variant={n.type === "danger" ? "danger" : "warning"}>{n.badge}</Badge>}
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{n.msg}</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px", alignItems: "center", paddingTop: "4px" }}>
                  {!n.read && (
                    <Button variant="outline" size="sm" icon={Check} onClick={() => handleMarkAsRead(n.id)}>
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingNotification(n)} />
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

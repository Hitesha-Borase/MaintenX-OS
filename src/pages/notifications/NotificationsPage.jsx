import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Trash2,
  Check,
  Sliders,
  ExternalLink,
  X,
  Filter
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function NotificationsPage() {
  const {
    notifications,
    unreadNotifCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    userProfile,
    updateUserProfile
  } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  const filteredNotifs = notifications.filter((n) => {
    if (typeFilter === "ALL") return true;
    if (typeFilter === "UNREAD") return !n.read;
    return n.type === typeFilter;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "critical":
        return <AlertOctagon size={18} color="#EF4444" />;
      case "warning":
        return <AlertTriangle size={18} color="#F59E0B" />;
      default:
        return <Info size={18} color="#38BDF8" />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Notifications & Maintenance Alerts
            </h1>
            {unreadNotifCount > 0 ? (
              <Badge variant="rose" dot>
                {unreadNotifCount} Unread Alerts
              </Badge>
            ) : (
              <Badge variant="emerald">All Clear</Badge>
            )}
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time equipment telemetry threshold alarms, overdue PM alerts, work order dispatches, and spare parts notifications.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {unreadNotifCount > 0 && (
            <Button
              variant="secondary"
              icon={Check}
              onClick={() => {
                markAllNotificationsAsRead();
                addToast("All notifications marked as read.", "success");
              }}
            >
              Mark All Read
            </Button>
          )}

          <Button variant="secondary" icon={Sliders} onClick={() => setIsPrefModalOpen(true)}>
            Alert Settings
          </Button>

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                clearAllNotifications();
                addToast("Notification tray cleared.", "info");
              }}
            >
              Clear Tray
            </Button>
          )}
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Unread Alerts"
          value={unreadNotifCount.toString()}
          unit="Active"
          trend={{ value: unreadNotifCount > 0 ? "Requires technician review" : "Inbox zero", isPositive: unreadNotifCount === 0, text: "" }}
          icon={Bell}
          colorVariant={unreadNotifCount > 0 ? "amber" : "emerald"}
          onClick={() => setTypeFilter("UNREAD")}
        />
        <StatCard
          title="Critical P1 Alarms"
          value={notifications.filter((n) => n.type === "critical").length.toString()}
          unit="Immediate"
          trend={{ value: "Direct line stoppages", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
          onClick={() => setTypeFilter("critical")}
        />
        <StatCard
          title="Warning Notifications"
          value={notifications.filter((n) => n.type === "warning").length.toString()}
          unit="Upcoming"
          trend={{ value: "PM & calibration thresholds", isPositive: true, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
          onClick={() => setTypeFilter("warning")}
        />
      </div>

      {/* Filter Row and Notification Feed */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button
              variant={typeFilter === "ALL" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTypeFilter("ALL")}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={typeFilter === "UNREAD" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTypeFilter("UNREAD")}
            >
              Unread ({unreadNotifCount})
            </Button>
            <Button
              variant={typeFilter === "critical" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTypeFilter("critical")}
            >
              Critical
            </Button>
            <Button
              variant={typeFilter === "warning" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTypeFilter("warning")}
            >
              Warnings
            </Button>
            <Button
              variant={typeFilter === "info" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTypeFilter("info")}
            >
              Info
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              No notifications matching the selected filter.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                style={{
                  backgroundColor: n.read ? "var(--bg-card-subtle)" : "rgba(56, 189, 248, 0.08)",
                  border: n.read ? "1px solid var(--border-subtle)" : "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "260px" }}>
                  <div style={{ marginTop: "2px" }}>{getNotifIcon(n.type)}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: n.read ? "var(--text-primary)" : "#FFFFFF" }}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#38BDF8" }} />
                      )}
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", lineHeight: 1.4 }}>
                      {n.message}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Category: <strong style={{ color: "var(--text-primary)" }}>{n.category}</strong></span>
                      <span>•</span>
                      <span>{n.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        addToast("Notification marked as read.", "info");
                      }}
                    >
                      Mark Read
                    </Button>
                  )}

                  {n.link && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ExternalLink}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        navigate(n.link);
                      }}
                    >
                      {n.actionText || "View Detail"}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ALERT SETTINGS MODAL */}
      {isPrefModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Notification & Alert Preferences
              </h2>
              <button onClick={() => setIsPrefModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <div>
                  <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Critical P1 Breakdown SMS Alerts</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Receive immediate SMS for line down events</div>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile?.preferences?.smsUrgentAlerts ?? true}
                  onChange={(e) => {
                    updateUserProfile({
                      preferences: { ...userProfile?.preferences, smsUrgentAlerts: e.target.checked }
                    });
                    addToast("SMS alert preference updated.", "info");
                  }}
                  style={{ width: "18px", height: "18px", accentColor: "#38BDF8", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <div>
                  <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>PM Due & Overdue Email Digests</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Daily 06:00 shift dispatch summaries</div>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile?.preferences?.emailAlerts ?? true}
                  onChange={(e) => {
                    updateUserProfile({
                      preferences: { ...userProfile?.preferences, emailAlerts: e.target.checked }
                    });
                    addToast("Email alert preference updated.", "info");
                  }}
                  style={{ width: "18px", height: "18px", accentColor: "#38BDF8", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <div>
                  <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>IoT Anomaly Audio Alert</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sound audible alarm when vibration exceeds 3.5 mm/s</div>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile?.preferences?.soundNotifications ?? true}
                  onChange={(e) => {
                    updateUserProfile({
                      preferences: { ...userProfile?.preferences, soundNotifications: e.target.checked }
                    });
                    addToast("Audio alert preference updated.", "info");
                  }}
                  style={{ width: "18px", height: "18px", accentColor: "#38BDF8", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <Button variant="primary" onClick={() => setIsPrefModalOpen(false)}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

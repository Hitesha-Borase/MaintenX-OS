import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Info, ShieldAlert, X, Eye } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [notifications, setNotifications] = useState([
    { id: 1, icon: ShieldAlert, title: "CCP Excursion Alert", msg: "Pasteurizer HTST temp dropped to 82.9°C on Line 1. Batch BAT-2026-0890 placed on HOLD.", time: "2 min ago", path: "/quality/events/holds" },
    { id: 2, icon: Info, title: "Batch Ready for QA Release", msg: "Batch BAT-2026-0890 is awaiting human QA sign-off before dispatch.", time: "1 hour ago", path: "/quality/release/queue" }
  ]);

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast("Notification cleared.", "info");
  };

  const handleView = (path) => navigate(path);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Alerts & Notifications
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Active CCP excursion alerts, hold notifications, and release queue updates
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Bell size={32} color="var(--text-muted)" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>No active alerts.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((n) => {
            const IconComponent = n.icon;
            return (
              <Card key={n.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", padding: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", flexShrink: 0 }}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{n.title}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{n.msg}</p>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "6px" }}>{n.time}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button variant="secondary" size="xs" icon={Eye} onClick={() => handleView(n.path)}>View</Button>
                  <Button variant="ghost" size="xs" icon={X} onClick={() => handleDismiss(n.id)}>Dismiss</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

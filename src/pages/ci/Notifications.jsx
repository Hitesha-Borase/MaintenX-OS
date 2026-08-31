import React, { useState } from "react";
import { Bell, AlertTriangle, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [notifications, setNotifications] = useState([
    { id: 1, title: "CAPA Overdue — CA-301", msg: "Corrective action CA-301 is past its due date. Action: Replace HTST probe.", time: "1 hr ago", path: "/ci/capa/corrective" },
    { id: 2, title: "CI Project Update — CI-001", msg: "Filler nozzle kaizen event action ACT-01 due in 2 days.", time: "4 hrs ago", path: "/ci/projects/actions" }
  ]);

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast("Notification cleared.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>CI / Engineering Notifications</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>CAPA overdue alerts, RCA phase updates, and CI project action reminders</p>
      </div>

      {notifications.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Bell size={32} color="var(--text-muted)" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>No active alerts.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((n) => (
            <Card key={n.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", padding: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", flexShrink: 0 }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{n.title}</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{n.msg}</p>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "6px" }}>{n.time}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Button variant="secondary" size="xs" icon={Eye} onClick={() => navigate(n.path)}>View</Button>
                <Button variant="ghost" size="xs" icon={X} onClick={() => handleDismiss(n.id)}>Dismiss</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

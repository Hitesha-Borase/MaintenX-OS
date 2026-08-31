import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Info, ShieldAlert, Wrench, X, Eye } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [notifications, setNotifications] = useState([
    { id: 1, type: "system", icon: Info, title: "Pending PM Audit", msg: "Sanitation check signed off by operator. Requires supervisor sign-off.", time: "10 min ago", path: "/supervisor/approvals" },
    { id: 2, type: "exception", icon: ShieldAlert, title: "P1 Exception Escalated", msg: "Line 2 Formulation HTST temperature loop sensor failed.", time: "30 min ago", path: "/supervisor/exceptions" }
  ]);

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter((n) => n.id !== id));
    addToast("Notification cleared.", "info");
  };

  const handleView = (path) => {
    navigate(path);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supervisor Dispatch Alerts
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations center alerts, PM approvals, and line alarm logs
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
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(2, 132, 199, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7", flexShrink: 0 }}>
                    <IconComponent size={18} style={{ margin: "auto" }} />
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Info, ShieldCheck, Wrench, X, Eye } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [notifications, setNotifications] = useState([
    { id: 1, type: "system", icon: Info, title: "Allergen Cleared Line 1", msg: "Sanitation check signed off by Quality QA.", time: "15 min ago", path: "/linelead/quality-events" },
    { id: 2, type: "wo", icon: Wrench, title: "Maintenance dispatched", msg: "Technician David Kim assigned to work order WO-0888.", time: "45 min ago", path: "/linelead/maintenance-issues" },
    { id: 3, type: "material", icon: Bell, title: "Low Stock Warning - Orange Caps", msg: "WMS inventory stock below safety limit threshold.", time: "2 hours ago", path: "/linelead/material-status" }
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
          Line Lead Notifications
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Active shift dispatch alerts and logistics notifications
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Bell size={32} color="var(--text-muted)" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>No active notifications.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((n) => {
            const IconComponent = n.icon;
            return (
              <Card key={n.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", padding: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(2, 132, 199, 0.1)", display: "flex", alignItems: "center", justifyBox: "center", color: "#0284C7", flexShrink: 0 }}>
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

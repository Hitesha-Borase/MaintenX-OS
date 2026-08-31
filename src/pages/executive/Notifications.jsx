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
    { id: 1, title: "SLA Warning — Walmart Order Backlog", msg: "Order cycle time nearing SLA limit. Action required to prevent penalty exposure.", time: "1 hr ago", path: "/executive/business/service-level" },
    { id: 2, title: "Cost Variance Excursion — Raw Materials", msg: "Raw materials price variance up +$5,200 due to concentrate drift.", time: "3 hrs ago", path: "/executive/finance/variance" }
  ]);

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast("Notification dismissed.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Executive Notifications
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          SLA warnings, material costing variance excursions, and critical supply chain updates
        </p>
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
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", flexShrink: 0 }}>
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

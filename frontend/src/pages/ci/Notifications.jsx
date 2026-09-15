import React, { useState, useMemo, useEffect } from "react";
import { Bell, AlertTriangle, Check, CheckCircle2, Trash2, X, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { useCI } from "../../context/CIContext";
import ciService from "../../services/ciService";

export function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    capaActions = [],
    investigations = [],
    ciProjects = [],
    standards = [],
    reliabilityRecords = []
  } = useCI();

  useEffect(() => {
    ciService.getDashboardSummary().catch((err) => console.warn("Notifications sync:", err.message));
  }, []);

  const [activeTab, setActiveTab] = useState("All");
  const [readIds, setReadIds] = useState(new Set());
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [deletingNotification, setDeletingNotification] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Derive real-time notification alerts from database state
  const notifications = useMemo(() => {
    const list = [];
    const now = new Date();

    // 1. Overdue CAPA
    capaActions.forEach((ca) => {
      const isOverdue = ca.dueDate && new Date(ca.dueDate) < now && ca.status !== "Completed" && ca.status !== "Verified";
      if (isOverdue) {
        list.push({
          id: `notif-capa-od-${ca.id}`,
          title: `CAPA Overdue — ${ca.id}`,
          msg: `Action "${ca.description}" is past its target due date (${ca.dueDate}). Responsible: ${ca.assignedTo}.`,
          time: "Immediate SLA Violation",
          path: "/ci/capa/corrective",
          type: "danger",
          badge: "OVERDUE"
        });
      } else if (ca.status === "Pending") {
        list.push({
          id: `notif-capa-pend-${ca.id}`,
          title: `CAPA Pending — ${ca.id}`,
          msg: `Action "${ca.description}" requires implementation. Assigned to: ${ca.assignedTo}.`,
          time: `Target: ${ca.dueDate}`,
          path: "/ci/capa/corrective",
          type: "warning",
          badge: "CAPA"
        });
      }
    });

    // 2. Open Investigations
    investigations.forEach((inv) => {
      if (inv.status !== "Closed") {
        list.push({
          id: `notif-rca-${inv.id}`,
          title: `RCA Investigation Active — ${inv.id}`,
          msg: `${inv.title} on ${inv.assetName || inv.assetId} is currently in 8D phase "${inv.currentPhase}". Lead: ${inv.lead}.`,
          time: `Priority: ${inv.priority}`,
          path: "/ci/rca/investigations",
          type: inv.priority === "Critical" ? "danger" : "warning",
          badge: inv.currentPhase || "RCA"
        });
      }
    });

    // 3. Bad Actor Assets
    reliabilityRecords.forEach((rec) => {
      if (rec.isBadActor) {
        list.push({
          id: `notif-rel-${rec.assetId}`,
          title: `Bad Actor Asset Flagged — ${rec.assetName}`,
          msg: `${rec.assetId} on ${rec.lineName} reached ${rec.failuresCount} failures with ${rec.totalDowntimeMin} min downtime. Systematic RCA recommended.`,
          time: "Reliability Alert",
          path: "/ci/reliability",
          type: "danger",
          badge: "BAD ACTOR"
        });
      }
    });

    // 4. CI Projects
    ciProjects.forEach((proj) => {
      if (proj.status === "Active" || proj.status === "Planning") {
        list.push({
          id: `notif-proj-${proj.id}`,
          title: `Kaizen Project Milestone — ${proj.name}`,
          msg: `Project ${proj.id} targeting $${Number(proj.annualizedTargetSavings || 0).toLocaleString()} annualized savings. Project Lead: ${proj.lead}.`,
          time: `Status: ${proj.status}`,
          path: "/ci/projects/list",
          type: "info",
          badge: "KAIZEN"
        });
      }
    });

    // 5. Standards in Review or Draft
    standards.forEach((std) => {
      if (std.status === "Review" || std.status === "Draft") {
        list.push({
          id: `notif-std-${std.id}`,
          title: `Controlled Standard — ${std.title}`,
          msg: `Document ${std.id} (${std.type}) is currently under "${std.status}". Owner: ${std.owner}.`,
          time: `Revision: ${std.version}`,
          path: "/ci/standards",
          type: "warning",
          badge: "STANDARD"
        });
      }
    });

    return list
      .filter((n) => !dismissedIds.has(n.id))
      .map((n) => ({
        ...n,
        read: readIds.has(n.id)
      }));
  }, [capaActions, investigations, reliabilityRecords, ciProjects, standards, readIds, dismissedIds]);

  const handleMarkAsRead = (id) => {
    setReadIds((prev) => new Set([...prev, id]));
    addToast("Notification marked as read.", "success");
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => new Set([...prev, ...allIds]));
    addToast("All notifications marked as read.", "success");
  };

  const handleConfirmClearAll = () => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds((prev) => new Set([...prev, ...allIds]));
    addToast("All notifications dismissed.", "info");
    setIsClearAllModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingNotification) return;
    setDismissedIds((prev) => new Set([...prev, deletingNotification.id]));
    addToast("Notification dismissed.", "info");
    setDeletingNotification(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Read") return n.read;
    return true;
  });

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
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
            Live alerts derived from overdue CAPAs, active RCA investigations, bad actor telemetry, and project milestones
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" size="sm" icon={CheckCircle2} onClick={handleMarkAllAsRead} disabled={notifications.length === 0}>
            Mark All as Read
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setIsClearAllModalOpen(true)} disabled={notifications.length === 0}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginTop: "8px" }}>
        {["All", "Unread", "Read"].map((tab) => {
          const count = tab === "All" ? notifications.length : tab === "Unread" ? unreadCount : readCount;
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
          <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 600 }}>
            No notifications found in this view.
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "440px" }}>
            All continuous improvement investigations, CAPAs, reliability monitoring records, and standard operating procedures are up to date.
          </span>
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
                  opacity: n.read ? 0.7 : 1,
                  cursor: n.path ? "pointer" : "default"
                }}
                onClick={() => n.path && navigate(n.path)}
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

                <div style={{ display: "flex", gap: "8px", alignItems: "center", paddingTop: "4px" }} onClick={(e) => e.stopPropagation()}>
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
                  Dismiss Notification
                </h2>
              </div>
              <button onClick={() => setDeletingNotification(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to dismiss this notification: <strong>{deletingNotification.title}</strong>?
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
                  Yes, Dismiss
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
                  Dismiss All Notifications
                </h2>
              </div>
              <button onClick={() => setIsClearAllModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to dismiss all <strong>{notifications.length} active notification(s)</strong>?
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


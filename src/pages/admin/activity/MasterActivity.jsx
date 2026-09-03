import React from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Activity } from "lucide-react";

export function MasterActivity() {
  const { activityLogs } = useMasterAdmin();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Activity Feed</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Real-time updates of platform activities</p>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {activityLogs.map((log, index) => (
            <div key={log.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start", position: "relative" }}>
              {index < activityLogs.length - 1 && (
                <div style={{ position: "absolute", left: "19px", top: "40px", bottom: "-20px", width: "2px", backgroundColor: "var(--border-subtle)" }} />
              )}
              <div style={{ padding: "12px", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563EB", borderRadius: "50%", zIndex: 1 }}>
                <Activity size={16} />
              </div>
              <div style={{ paddingBottom: index < activityLogs.length - 1 ? "16px" : "0" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{log.action}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>{log.details}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>{log.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

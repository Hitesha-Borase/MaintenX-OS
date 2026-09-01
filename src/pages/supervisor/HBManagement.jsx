import React, { useState } from "react";
import { Clock, ShieldAlert, Award, CheckCircle2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function HBManagement() {
  const { addToast } = useApp();

  const [logs, setLogs] = useState([
    { id: "L1-H4", line: "Line 1", hour: "09:00 - 10:00", target: 3000, actual: 1200, variance: -1800, lossDriver: "Mechanical Failure", status: "Open Escalation" },
    { id: "L2-H4", line: "Line 2", hour: "09:00 - 10:00", target: 500, actual: 480, variance: -20, lossDriver: "None", status: "Reconciled" }
  ]);

  const handleReconcile = (id) => {
    setLogs(prev =>
      prev.map(l => l.id === id ? { ...l, status: "Reconciled" } : l)
    );
    addToast(`Downtime hourly variance for ${id} has been reconciled.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental H/B Reconciliations
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {logs.map((log) => (
          <Card
            key={log.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "14px",
              padding: "18px 20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
              borderLeft: log.status === "Open Escalation" ? "4px solid #EF4444" : "4px solid #10B981",
              overflow: "hidden"
            }}
          >
            {/* Reconciliation Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 220px" }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {log.line} • {log.hour}
                </span>
                <Badge variant={log.status === "Open Escalation" ? "danger" : "emerald"}>
                  {log.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Target: <strong style={{ color: "var(--text-primary)" }}>{log.target}</strong> | Actual: <strong style={{ color: "var(--text-primary)" }}>{log.actual}</strong> | Variance:{" "}
                <strong style={{ color: log.variance < 0 ? "#DC2626" : "#059669", fontFamily: "var(--font-mono)" }}>{log.variance}</strong>
              </div>
              {log.lossDriver !== "None" && (
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", marginTop: "2px" }}>
                  Loss Driver: {log.lossDriver}
                </div>
              )}
            </div>

            {/* Reconcile Action Button */}
            {log.status === "Open Escalation" && (
              <Button
                variant="warning"
                size="sm"
                icon={Award}
                onClick={() => handleReconcile(log.id)}
                style={{ padding: "6px 14px", fontSize: "11px", height: "32px", fontWeight: 700, alignSelf: "flex-start", flexShrink: 0 }}
              >
                Sign Off & Reconcile
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

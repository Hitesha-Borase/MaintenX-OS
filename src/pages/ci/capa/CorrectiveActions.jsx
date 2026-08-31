import React, { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function CorrectiveActions() {
  const { addToast } = useApp();

  const [actions, setActions] = useState([
    { id: "CA-301", inv: "INV-802", action: "Replace HTST temperature probe with calibrated spare", owner: "Pedro Alves (Maintenance)", due: "2026-09-02", status: "Open" }
  ]);

  const handleClose = (id) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: "Closed" } : a));
    addToast(`Corrective action ${id} closed as complete.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          CAPA — Corrective Actions
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track immediate corrective actions assigned to resolve confirmed root causes
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {actions.map((a) => (
          <Card key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: a.status === "Closed" ? "4px solid #10B981" : "4px solid #F59E0B" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={16} color={a.status === "Closed" ? "#10B981" : "#F59E0B"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{a.id}</span>
                <Badge variant={a.status === "Closed" ? "emerald" : "warning"}>{a.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{a.action}</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Owner: {a.owner} | Due: {a.due}</span>
            </div>
            {a.status === "Open" && (
              <Button variant="success" size="sm" onClick={() => handleClose(a.id)}>Mark Complete</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { CheckSquare } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ProjectActions() {
  const { addToast } = useApp();

  const [actions, setActions] = useState([
    { id: "ACT-01", project: "CI-001", description: "Kaizen event — filler nozzle flow rate calibration", due: "2026-09-07", status: "Open" },
    { id: "ACT-02", project: "CI-002", description: "Reduce CIP pre-rinse cycle from 8 to 5 min", due: "2026-09-10", status: "Open" }
  ]);

  const handleClose = (id) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: "Complete" } : a));
    addToast(`Action ${id} marked complete.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>CI Project Actions</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Action register for all active CI project work items</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {actions.map((a) => (
          <Card key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <CheckSquare size={16} color="#38BDF8" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{a.id} ({a.project})</span>
                <Badge variant={a.status === "Complete" ? "emerald" : "warning"}>{a.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{a.description}</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Due: {a.due}</span>
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

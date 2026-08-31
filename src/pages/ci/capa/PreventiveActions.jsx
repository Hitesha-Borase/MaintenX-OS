import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function PreventiveActions() {
  const { addToast } = useApp();

  const [actions, setActions] = useState([
    { id: "PA-101", inv: "INV-802", action: "Implement monthly temperature sensor calibration schedule for all HTST probes", owner: "Engineering Team", due: "2026-09-15", status: "Open" }
  ]);

  const handleClose = (id) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: "Implemented" } : a));
    addToast(`Preventive action ${id} marked as implemented.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          CAPA — Preventive Actions
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Long-term systemic changes to prevent recurrence of confirmed failure modes
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {actions.map((a) => (
          <Card key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: a.status === "Implemented" ? "4px solid #10B981" : "4px solid #38BDF8" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color={a.status === "Implemented" ? "#10B981" : "#38BDF8"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{a.id}</span>
                <Badge variant={a.status === "Implemented" ? "emerald" : "cyan"}>{a.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{a.action}</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Owner: {a.owner} | Due: {a.due}</span>
            </div>
            {a.status === "Open" && (
              <Button variant="success" size="sm" onClick={() => handleClose(a.id)}>Mark Implemented</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

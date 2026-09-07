import React, { useState } from "react";
import { Layers, Play, Square } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Agents() {
  const { addToast } = useApp();

  const [agents, setAgents] = useState([
    { name: "Supply Chain Routing Agent", role: "Optimizes base ingredients and raw materials routing", status: "Active", iterations: "1,202 runs" },
    { name: "Scrap & Yield Minimization Agent", role: "Monitors nozzle calibration variances and rejects", status: "Active", iterations: "812 runs" },
    { name: "PM Cost Scheduling Agent", role: "Aligns maintenance events to low-demand windows", status: "Idle", iterations: "411 runs" }
  ]);

  const handleToggle = (name) => {
    setAgents(prev => prev.map(a => {
      if (a.name === name) {
        const nextStatus = a.status === "Active" ? "Idle" : "Active";
        addToast(`${name} is now ${nextStatus}.`, "info");
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          AI Agents Dashboard
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {agents.map((a, idx) => (
          <Card key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            padding: "16px 20px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)"
          }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, minWidth: "200px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: a.status === "Active" ? "rgba(5, 150, 105, 0.1)" : "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: a.status === "Active" ? "#059669" : "#D97706", flexShrink: 0 }}>
                <Layers size={18} />
              </div>
              <div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{a.name}</span>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{a.role}</p>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Execution history: {a.iterations}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
              <Badge variant={a.status === "Active" ? "emerald" : "warning"}>{a.status}</Badge>
              <Button variant="secondary" size="xs" onClick={() => handleToggle(a.name)}>
                {a.status === "Active" ? "Pause Agent" : "Start Agent"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

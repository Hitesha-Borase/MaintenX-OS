import React, { useState } from "react";
import { TrendingUp, CheckCircle, Zap, Clock, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function RecoveryManagement() {
  const { addToast } = useApp();

  const [countermeasures, setCountermeasures] = useState([
    { id: 1, name: "Line Speed Optimization (600 BPM)", type: "Speed Increase", expectedRecovery: "+2,500 units", active: false },
    { id: 2, name: "Shift Extension Overtime (30 mins)", type: "Labor", expectedRecovery: "+3,000 units", active: false },
    { id: 3, name: "Auxiliary Packer Operator Reallocation", type: "Crew", expectedRecovery: "+1,500 units", active: false }
  ]);

  const [activatedLogs, setActivatedLogs] = useState([
    { time: "11:15", countermeasure: "Nitrogen Flush Pressure Tune", status: "Active" }
  ]);

  const handleActivate = (id, name) => {
    setCountermeasures(prev =>
      prev.map(c => c.id === id ? { ...c, active: true } : c)
    );

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivatedLogs(prev => [
      { time: timeString, countermeasure: name, status: "Active" },
      ...prev
    ]);

    addToast(`Recovery countermeasure activated: ${name}`, "success");
  };

  const handleSubmitProposal = () => {
    addToast("Recovery plan package submitted to Supervisor's /supervisor/recovery approval queue.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Schedule Recovery Management
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Formulate yield recovery actions and submit pace proposals for Supervisor authorization
          </p>
        </div>

        <Button variant="primary" icon={Send} onClick={handleSubmitProposal}>
          Submit Proposal to Supervisor
        </Button>
      </div>

      {/* Target Deficit Status */}
      <Card style={{ borderLeft: "4px solid #EF4444", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444", display: "flex", alignItems: "center", gap: "6px" }}>
          <TrendingUp size={16} /> Pace Shortage Warning
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
          Line 1 is currently projected to miss the shift target by <strong style={{ color: "var(--text-primary)" }}>1,800 Bottles</strong> due to the plate heat exchanger breakdown downtime earlier.
        </p>
      </Card>

      {/* Countermeasures Options */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Available Recovery Countermeasures
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {countermeasures.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                  Type: {c.type} • Expected Yield Recovery: <strong style={{ color: "#059669" }}>{c.expectedRecovery}</strong>
                </span>
              </div>

              {!c.active ? (
                <Button variant="primary" size="sm" icon={Zap} onClick={() => handleActivate(c.id, c.name)}>
                  Activate
                </Button>
              ) : (
                <Badge variant="emerald">Active</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Countermeasure Logs */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Countermeasure Execution Logs
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activatedLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                fontSize: "12px"
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>{log.time}</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.countermeasure}</span>
              <Badge variant="emerald">{log.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

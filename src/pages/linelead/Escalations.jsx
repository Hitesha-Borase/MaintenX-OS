import React, { useState } from "react";
import { AlertOctagon, Send, ShieldAlert, Users } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";

export function Escalations() {
  const { exceptions, addException } = useExceptions();
  const { addToast } = useApp();

  const activeEscalations = exceptions ? exceptions.filter((e) => e.location?.includes("Line 1") || e.severity === "P1") : [];

  const [targetRole, setTargetRole] = useState("Plant Manager");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addException({
      severity: "P1",
      category: "Downtime",
      title: `Escalation to ${targetRole}: ${subject}`,
      location: "Line 1 - Aseptic Bottling",
      details: details,
      owner: targetRole,
      escalationLevel: "Immediate Dispatch"
    });

    addToast(`Critical Escalation dispatched to ${targetRole}.`, "danger");
    setSubject("");
    setDetails("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Escalation Console
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Active Escalations */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Active Escalation Records
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeEscalations.map((ex) => (
              <div
                key={ex.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{ex.id}</span>
                  <Badge variant="danger">{ex.severity}</Badge>
                </div>
                <div style={{ fontWeight: 600, color: "#F87171" }}>{ex.title}</div>
                <div style={{ color: "var(--text-secondary)" }}>Escalated To: {ex.owner}</div>
                <div style={{ fontStyle: "italic", color: "var(--text-muted)", marginTop: "4px" }}>"{ex.details || ex.impactDescription}"</div>
              </div>
            ))}
          </div>
        </Card>

        {/* New Escalation Form */}
        <form onSubmit={handleSubmit}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Dispatch Escalation
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Escalate Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="Plant Manager">Plant Manager</option>
                  <option value="Maintenance Lead / Planner">Maintenance Lead / Planner</option>
                  <option value="Warehouse & Logistics Lead">Warehouse & Logistics Lead</option>
                  <option value="Quality QA Manager">Quality QA Manager</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Escalation Subject
                </label>
                <input
                  type="text"
                  placeholder="E.g. Safety hazard near filler..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Details & Justification
                </label>
                <textarea
                  placeholder="Provide details for why this is escalated..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="input-field"
                  style={{ width: "100%", height: "38px", minHeight: "38px", resize: "vertical" }}
                  required
                />
              </div>

              <div>
                <Button type="submit" variant="danger" icon={Send} style={{ width: "100%", height: "38px" }}>
                  Dispatch Escalation
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

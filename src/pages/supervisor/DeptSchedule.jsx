import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Check, Pause, Play, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function DeptSchedule() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [schedules, setSchedules] = useState([
    { id: "SCH-1", line: "Line 1 (Aseptic Bottling)", order: "ORD-904", target: "24,000 Bottles", shift: "Shift A (Day)", status: "Running" },
    { id: "SCH-2", line: "Line 2 (Formulation & Blending)", order: "ORD-905", target: "5,000 Liters", shift: "Shift A (Day)", status: "Paused" },
    { id: "SCH-3", line: "Line 3 (Bulk Filling)", order: "ORD-906", target: "10,000 Liters", shift: "Shift B (Evening)", status: "Scheduled" }
  ]);

  const handleAuthorize = (id) => {
    setSchedules(prev =>
      prev.map(s => s.id === id ? { ...s, status: "Authorized" } : s)
    );
    addToast(`Schedule run ${id} authorized for execution.`, "success");
  };

  const handlePause = (id) => {
    setSchedules(prev =>
      prev.map(s => s.id === id ? { ...s, status: "Paused" } : s)
    );
    addToast(`Schedule run ${id} paused by Supervisor.`, "warning");
  };

  const handleResume = (id) => {
    setSchedules(prev =>
      prev.map(s => s.id === id ? { ...s, status: "Running" } : s)
    );
    addToast(`Schedule run ${id} resumed to active running state.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Department Run Schedule
          </h1>
        </div>

        <Button variant="secondary" icon={RefreshCw} onClick={() => navigate("/planner/aps/scheduler")}>
          Request APS Re-sequence
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {schedules.map((sch) => (
          <Card key={sch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", borderLeft: sch.status === "Running" ? "4px solid #10B981" : sch.status === "Paused" ? "4px solid #F59E0B" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{sch.line}</span>
                <Badge variant={sch.status === "Running" ? "emerald" : sch.status === "Authorized" ? "cyan" : sch.status === "Paused" ? "amber" : "slate"}>
                  {sch.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Active Order: <strong style={{ color: "#0284C7" }}>{sch.order}</strong> • Shift: {sch.shift} • Target: {sch.target}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {sch.status === "Scheduled" && (
                <Button variant="success" size="sm" icon={Check} onClick={() => handleAuthorize(sch.id)}>
                  Authorize Run
                </Button>
              )}
              {sch.status === "Running" && (
                <Button variant="warning" size="sm" icon={Pause} onClick={() => handlePause(sch.id)}>
                  Pause Run
                </Button>
              )}
              {sch.status === "Paused" && (
                <Button variant="primary" size="sm" icon={Play} onClick={() => handleResume(sch.id)}>
                  Resume Run
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Calendar, Clock, Plus, Check } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function DeptSchedule() {
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
    addToast(`Schedule run ${id} authorized.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Department Run Schedule
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Authorize and oversee active shift line schedules across the plant
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {schedules.map((sch) => (
          <Card key={sch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: sch.status === "Running" ? "4px solid #10B981" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{sch.line}</span>
                <Badge variant={sch.status === "Running" ? "emerald" : sch.status === "Authorized" ? "cyan" : "amber"}>
                  {sch.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Active Order: <strong style={{ color: "#38BDF8" }}>{sch.order}</strong> • Shift: {sch.shift} • Target: {sch.target}
              </div>
            </div>

            {sch.status === "Scheduled" && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handleAuthorize(sch.id)}>
                Authorize Run
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

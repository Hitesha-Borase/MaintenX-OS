import React from "react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Users } from "lucide-react";

export function Workforce() {
  const employees = [
    { name: "Elena Rostova", role: "Lead Operator", shift: "Shift A", line: "Line 1" },
    { name: "Carlos Mendez", role: "Packer Operator", shift: "Shift A", line: "Line 1" },
    { name: "Sarah Jenkins", role: "Sanitation Specialist", shift: "Shift A", line: "Line 1" },
    { name: "David Kim", role: "Maintenance Technician", shift: "Shift A", line: "Line 1" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental Workforce
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          General employee roster and line shift assignments
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {employees.map((emp, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{emp.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {emp.role} • {emp.line}
                </span>
              </div>
            </div>
            <Badge variant="cyan">{emp.shift}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

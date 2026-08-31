import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function StaffingPage() {
  const { employees } = useCMMS();
  const { addToast } = useApp();

  const [staffingLines, setStaffingLines] = useState([
    { line: "Line 1 — Aseptic Bottling", required: 10, assigned: 10, supervisor: "Marcus Vance", status: "Full Coverage" },
    { line: "Line 2 — Formulation & CIP", required: 6, assigned: 6, supervisor: "Elena Rostova", status: "Full Coverage" },
    { line: "Line 3 — Canning & Seaming", required: 8, assigned: 8, supervisor: "David Kim", status: "Full Coverage" },
    { line: "Quality & In-Line Testing Lab", required: 4, assigned: 4, supervisor: "Sarah Jenkins", status: "Full Coverage" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Shift Labour Staffing & Line Allocations
            </h1>
            <Badge variant="emerald">100% Shift Attendance</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Headcount planning, active shift staffing, operator-to-line allocation, and supervisor coverage.
          </p>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Total Plant Staffing"
          value="28 / 28"
          unit="Operators Present"
          trend={{ value: "0 Absenteeism / Callouts", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="Line Staffing Health"
          value="100%"
          unit="Manned"
          trend={{ value: "All 4 critical lines covered", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Supervisor Coverage"
          value="4 / 4"
          unit="Leads On-Site"
          trend={{ value: "Shift A Lead coverage active", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Staffing Allocation Table */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Line-by-Line Operator Allocation Matrix (Shift A)
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Production Area / Line</th>
                <th>Required Headcount</th>
                <th>Assigned Operators</th>
                <th>Area Supervisor</th>
                <th>Coverage Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffingLines.map((s, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{s.line}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{s.required} Operators</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    {s.assigned} Assigned
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>{s.supervisor}</span>
                  </td>
                  <td>
                    <Badge variant="emerald" dot>
                      {s.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addToast(`Reassigned operator verified for ${s.line}`, "info")}
                    >
                      Reallocate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

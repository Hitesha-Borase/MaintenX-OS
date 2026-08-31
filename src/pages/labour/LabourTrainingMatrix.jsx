import React, { useState } from "react";
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { INITIAL_EMPLOYEES, SKILLS_MATRIX } from "../../data/mockLabour";
import { useApp } from "../../context/AppContext";

export function LabourTrainingMatrix() {
  const { addToast } = useApp();
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  const columns = [
    {
      header: "Employee & ID",
      accessor: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#0284C7", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px" }}>
            {row.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.id} • {row.department}</div>
          </div>
        </div>
      )
    },
    {
      header: "Role / Specialty",
      accessor: "role",
      render: (val) => <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>{val}</span>
    },
    {
      header: "Active Shift",
      accessor: "shift",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Qualifications & Skills",
      accessor: "skills",
      render: (val) => (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "260px" }}>
          {val.map((s, i) => (
            <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#1E293B", color: "#94A3B8" }}>
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      header: "Productivity",
      accessor: "productivityScore",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
          {val}%
        </span>
      )
    },
    {
      header: "Hours (Month)",
      accessor: "hoursWorkedMonth",
      render: (val) => <span style={{ fontFamily: "var(--font-mono)" }}>{val}h</span>
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Labour, Skills Matrix & Certification Hub
            </h1>
            <Badge variant="cyan">{employees.length} Active Operators</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Autonomous machine operator qualifications, HACCP/OSHA certifications, and shift competency allocation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => addToast("Add Employee / Training Record modal opened.")}>
            + Add Training Record
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Active Shift Headcount"
          value={employees.length.toString()}
          unit="rostered"
          trend={{ value: "100% Filled", isPositive: true, text: "Shift A" }}
          icon={Users}
          colorVariant="blue"
        />
        <StatCard
          title="Labour Productivity"
          value="97.4%"
          unit=""
          trend={{ value: "+2.4%", isPositive: true, text: "vs standard takt" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Certified Level-4 Operators"
          value="6"
          unit="leads"
          trend={{ value: "Rotary Fillers", isPositive: true, text: "fully qualified" }}
          icon={Award}
          colorVariant="cyan"
        />
        <StatCard
          title="Refresher Training Due"
          value="3"
          unit="operators"
          trend={{ value: "Within 30 Days", isPositive: false, text: "Capper Chuck" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Machine Competency Matrix */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Machine Competency & Qualification Matrix
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Certified operator readiness per critical machine asset
            </p>
          </div>
          <Badge variant="emerald">HACCP Certified</Badge>
        </div>

        <div className="grid-4">
          {SKILLS_MATRIX.map((m, i) => (
            <div
              key={i}
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {m.machine}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>Qualified Staff: <strong style={{ color: "#38BDF8" }}>{m.qualifiedCount}</strong></span>
                {m.refresherDue > 0 ? (
                  <span style={{ color: "#F59E0B" }}>{m.refresherDue} Refresher Due</span>
                ) : (
                  <span style={{ color: "#34D399" }}>All Current</span>
                )}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Lead: {m.expertLead}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Roster Table */}
      <Card>
        <DataTable
          title="Workforce & Operator Registry"
          columns={columns}
          data={employees}
          searchPlaceholder="Search employee, role, department, certifications..."
          exportFilename="flowstate_labour_registry.csv"
        />
      </Card>
    </div>
  );
}

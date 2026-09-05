import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Download,
  Filter,
  BarChart2,
  ShieldCheck,
  Clock,
  Target,
  ArrowUpRight,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";
import { PRODUCTIVITY_METRICS, INITIAL_EMPLOYEES } from "../../data/mockLabour";

export function LabourPerformancePage() {
  const { addToast } = useApp();

  const [metrics, setMetrics] = useState(PRODUCTIVITY_METRICS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedShift, setSelectedShift] = useState("All");

  const filteredEmployees = employees.filter((e) => {
    if (selectedShift === "All") return true;
    return e.shift.includes(selectedShift);
  });

  const chartData = metrics.byLine.map((l) => ({
    label: l.line.split("—")[0].trim(),
    value: l.unitsPerHr
  }));

  const handleExportCSV = () => {
    const headers = "Employee,Role,Department,Shift,Productivity Score,Units Per Hour,Hours Worked,Monthly Output\n";
    const rows = employees
      .map(
        (e) =>
          `"${e.name}","${e.role}","${e.department}","${e.shift}",${e.productivityScore}%,${e.unitsPerHour},${e.hoursWorkedMonth},${(e.unitsPerHour * e.hoursWorkedMonth).toLocaleString()}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Productivity_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Workforce productivity benchmark exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Workforce Labour Productivity
            </h1>
            <Badge variant="emerald">{metrics.overallUnitsPerHour} Units / Labor Hour</Badge>
            <Badge variant="cyan">{metrics.averageProductivity} Overall Efficiency</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Operator and technician productivity metrics, direct labor utilization, shift efficiency, and output targets.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Productivity Report
          </Button>
        </div>
      </div>

      {/* Primary KPI Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        {/* Labour Utilization */}
        <StatCard
          title="Labour Utilization"
          value={metrics.labourUtilization}
          unit="Efficiency"
          trend={{ value: "Target: > 92%", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="indigo"
        />

        {/* Target vs Actual */}
        <StatCard
          title="Target vs Actual Pacing"
          value={`${metrics.overallUnitsPerHour} / ${metrics.targetUnitsPerHour}`}
          unit="Units / Labor Hr"
          trend={{ value: "+6.2% above engineering rate", isPositive: true, text: "" }}
          icon={Target}
          colorVariant="emerald"
        />

        {/* Total Hours Worked */}
        <StatCard
          title="Hours Worked (MTD)"
          value={metrics.totalHoursWorked.toLocaleString()}
          unit="Labor Hours"
          trend={{ value: "96.8% nominal shift attendance", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="blue"
        />

        {/* Output */}
        <StatCard
          title="Gross Factory Output"
          value={metrics.totalOutputUnits.toLocaleString()}
          unit="Finished Units"
          trend={{ value: "On pace for monthly target", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
      </div>

      {/* Grid 1: Productivity by Line & Productivity by Shift */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "20px" }}>
        {/* Productivity by Line */}
        <Card style={{ padding: "20px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Productivity by Line (Units / Labor Hour)
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Output efficiency rates across manufacturing lines.
              </span>
            </div>
            <Badge variant="cyan">Target: {metrics.targetUnitsPerHour}</Badge>
          </div>

          <BarChart
            data={chartData}
            height={220}
            color="#10B981"
            unit=" u/hr"
          />

          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {metrics.byLine.map((line, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{line.line}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", fontSize: "13px" }}>
                    {line.unitsPerHr} u/hr
                  </span>
                  <Badge variant="emerald">{line.variance}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Productivity by Shift */}
        <Card style={{ padding: "20px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Productivity by Shift
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Efficiency comparison between Day, Evening, and Night shifts.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {metrics.byShift.map((shift, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {shift.shift}
                  </h4>
                  <Badge variant={idx === 0 ? "emerald" : "cyan"}>{shift.efficiency} Efficiency</Badge>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "4px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Output Units</span>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {shift.output.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Hours Worked</span>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {shift.hoursWorked}h
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Pacing vs Target</span>
                    <strong style={{ fontSize: "14px", color: "#059669", fontFamily: "var(--font-mono)" }}>
                      {shift.targetVsActual}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Productivity Trend Table */}
          <div style={{ marginTop: "16px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              5-Week Productivity Trend
            </h4>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", overflowX: "auto" }}>
              {metrics.trend.map((t, idx) => (
                <div key={idx} style={{ padding: "8px 10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", textAlign: "center", flex: 1, minWidth: "70px" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>{t.week}</span>
                  <strong style={{ fontSize: "13px", color: "#0284C7", fontFamily: "var(--font-mono)" }}>{t.unitsPerHour}</strong>
                  <span style={{ fontSize: "10px", color: "#10B981", display: "block" }}>{t.utilization}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Grid 2: Employee Productivity Table */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Employee Productivity & Individual Output Leaderboard ({filteredEmployees.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Individual operator pacing, monthly hours, and yield contribution.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Shift:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "6px 10px", height: "34px" }}
            >
              <option value="All">All Shifts</option>
              <option value="Shift A">Shift A (Day)</option>
              <option value="Shift B">Shift B (Evening)</option>
              <option value="Shift C">Shift C (Night)</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>EMPLOYEE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>ROLE & DEPT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PRODUCTIVITY SCORE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>UNITS / HOUR</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>HOURS WORKED</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>MONTHLY OUTPUT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right", whiteSpace: "nowrap" }}>EFFICIENCY</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--border-subtle)", height: "46px" }}>
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          backgroundColor: "#0284C7",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "11px"
                        }}
                      >
                        {emp.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{emp.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.id}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{emp.role}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{emp.department}</div>
                  </td>

                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="cyan">{emp.shift}</Badge>
                  </td>

                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", fontSize: "13px" }}>
                      {emp.productivityScore}%
                    </span>
                  </td>

                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0284C7", fontSize: "13px" }}>
                      {emp.unitsPerHour} u/hr
                    </span>
                  </td>

                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {emp.hoursWorkedMonth} hrs
                  </td>

                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {(emp.unitsPerHour * emp.hoursWorkedMonth).toLocaleString()} units
                  </td>

                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <Badge variant={parseFloat(emp.efficiency) >= 95 ? "emerald" : "amber"}>
                      {emp.efficiency}
                    </Badge>
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

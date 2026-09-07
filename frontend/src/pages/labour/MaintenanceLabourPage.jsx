import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  Download,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function MaintenanceLabourPage() {
  const { employees, skillsMatrix, logLabourHours, workOrders } = useCMMS();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("ALL");

  // Log Hours Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [hoursToLog, setHoursToLog] = useState(4);
  const [taskNote, setTaskNote] = useState("Overhaul of Rotary Filler Lower Spindle");

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesShift = shiftFilter === "ALL" || emp.shift.includes(shiftFilter);
    return matchesSearch && matchesShift;
  });

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    logLabourHours(selectedEmp.id, Number(hoursToLog), taskNote);
    addToast(`${hoursToLog} labor hours logged for ${selectedEmp.name}!`, "success");
    setIsLogModalOpen(false);
    setSelectedEmp(null);
  };

  const handleExportCSV = () => {
    const headers = "Employee ID,Name,Role,Department,Shift,Productivity Score,Hours Worked Month\n";
    const rows = filteredEmployees
      .map((e) => `"${e.id}","${e.name}","${e.role}","${e.department}","${e.shift}",${e.productivityScore}%,${e.hoursWorkedMonth}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Maintenance_Labour_Roster_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Maintenance labour roster exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Maintenance Labour & Technician Skill Matrix
            </h1>
            <Badge variant="cyan">{employees.length} Active Specialists</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Technician skill proficiencies, professional certifications, shift assignments, and labor hours logging.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Roster
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Total Maintenance Staff"
          value={employees.length.toString()}
          unit="Technicians"
          trend={{ value: "Shift A & Shift B covered", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="Team Productivity Score"
          value="97.2%"
          unit=""
          trend={{ value: "+1.4% vs last month", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Monthly Labor Hours"
          value={`${employees.reduce((s, e) => s + (e.hoursWorkedMonth || 0), 0)} hrs`}
          unit="Allocated"
          trend={{ value: "98% on-time execution", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="blue"
        />
        <StatCard
          title="Certified Specialists"
          value="100%"
          unit="CMRP / LOTO"
          trend={{ value: "All safety certs current", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
      </div>

      {/* Skills Matrix Summary */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
          Critical Machine Qualification & Training Matrix
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Machine Asset</th>
                <th>Qualified Technicians</th>
                <th>Subject Matter Expert Lead</th>
                <th>Refresher Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {skillsMatrix.map((sm, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{sm.machine}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>
                      {sm.qualifiedCount} Qualified
                    </span>
                  </td>
                  <td>
                    <span style={{ color: "var(--text-primary)" }}>{sm.expertLead}</span>
                  </td>
                  <td>
                    {sm.refresherDue > 0 ? (
                      <span style={{ color: "#F59E0B", fontWeight: 700 }}>{sm.refresherDue} upcoming</span>
                    ) : (
                      <span style={{ color: "#10B981" }}>0 Due</span>
                    )}
                  </td>
                  <td>
                    <Badge variant={sm.refresherDue > 0 ? "amber" : "emerald"}>
                      {sm.refresherDue > 0 ? "Refresher Pending" : "Full Coverage"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Technician Roster Table */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Shift:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px" }}
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
            >
              <option value="ALL">All Shifts</option>
              <option value="Shift A">Shift A (Day)</option>
              <option value="Shift B">Shift B (Evening)</option>
            </select>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Technician Name</th>
                <th>Role & Department</th>
                <th>Shift Allocation</th>
                <th>Key Skills</th>
                <th>Certifications</th>
                <th>Monthly Hours</th>
                <th>Productivity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "#FFFFFF" }}>
                        {emp.avatar || emp.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{emp.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{emp.role}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.department}</div>
                  </td>
                  <td>
                    <Badge variant="cyan">{emp.shift}</Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "200px" }}>
                      {emp.skills?.slice(0, 2).map((s, idx) => (
                        <span key={idx} style={{ fontSize: "10px", backgroundColor: "var(--bg-surface)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-secondary)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "180px" }}>
                      {emp.certifications?.slice(0, 2).map((c, idx) => (
                        <Badge key={idx} variant="emerald" style={{ fontSize: "10px" }}>
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#FFFFFF" }}>
                      {emp.hoursWorkedMonth} hrs
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                      {emp.productivityScore}%
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedEmp(emp);
                        setIsLogModalOpen(true);
                      }}
                    >
                      Log Hours
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOG HOURS MODAL */}
      {isLogModalOpen && selectedEmp && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log Labor Hours for {selectedEmp.name}
              </h2>
              <button onClick={() => setIsLogModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Labor Hours Spent *</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={hoursToLog}
                  onChange={(e) => setHoursToLog(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Task Description / Work Order Reference</label>
                <input
                  type="text"
                  required
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsLogModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Hours Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

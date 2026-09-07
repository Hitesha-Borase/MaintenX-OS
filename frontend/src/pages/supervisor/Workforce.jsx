import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Users,
  Search,
  Eye,
  Edit2,
  Award,
  BookOpen,
  LineChart,
  Calendar,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  MoreHorizontal,
  ChevronDown,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { INITIAL_EMPLOYEES } from "../../data/mockLabour";

export function Workforce() {
  const { addToast } = useApp();

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedShift, setSelectedShift] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Dropdown menu state
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals state
  const [viewEmployee, setViewEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [assignSkillModal, setAssignSkillModal] = useState(null);
  const [assignTrainingModal, setAssignTrainingModal] = useState(null);
  const [viewProductivityModal, setViewProductivityModal] = useState(null);
  const [viewShiftModal, setViewShiftModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    id: `EMP-${100 + employees.length + 1}`,
    name: "",
    role: "Operator",
    department: "Packaging",
    shift: "Shift A (Day)",
    skills: "HMI Diagnostics",
    skillLevel: "Intermediate",
    trainingStatus: "Up to Date",
    qualificationStatus: "In Qualification",
    status: "Active"
  });

  const [skillForm, setSkillForm] = useState({
    skillName: "High-Speed Bottling Automation",
    skillCategory: "Machine Operation",
    skillLevel: "Advanced"
  });

  const [trainingForm, setTrainingForm] = useState({
    trainingProgram: "Annual HACCP & Critical Control Point Refresh",
    trainingType: "Mandatory Safety",
    trainer: "Sarah Jenkins",
    targetDate: "2026-10-15"
  });

  // Filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === "All" || emp.department === selectedDept;
      const matchesShift = selectedShift === "All" || emp.shift.includes(selectedShift);
      const matchesStatus = selectedStatus === "All" || emp.status === selectedStatus;
      return matchesSearch && matchesDept && matchesShift && matchesStatus;
    });
  }, [employees, searchQuery, selectedDept, selectedShift, selectedStatus]);

  // Handlers
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === editEmployee.id ? { ...emp, ...editEmployee } : emp))
    );
    addToast(`Employee ${editEmployee.name} updated successfully.`, "success");
    setEditEmployee(null);
  };

  const handleAssignSkill = (e) => {
    e.preventDefault();
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === assignSkillModal.id) {
          const updatedSkills = [...new Set([...emp.skills, skillForm.skillName])];
          return {
            ...emp,
            skills: updatedSkills,
            skillLevel: skillForm.skillLevel
          };
        }
        return emp;
      })
    );
    addToast(`Skill "${skillForm.skillName}" (${skillForm.skillLevel}) assigned to ${assignSkillModal.name}.`, "success");
    setAssignSkillModal(null);
  };

  const handleAssignTraining = (e) => {
    e.preventDefault();
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === assignTrainingModal.id) {
          return { ...emp, trainingStatus: "In Progress" };
        }
        return emp;
      })
    );
    addToast(`Enrolled ${assignTrainingModal.name} in "${trainingForm.trainingProgram}". Target: ${trainingForm.targetDate}.`, "success");
    setAssignTrainingModal(null);
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmployee.name) return;
    const added = {
      ...newEmployee,
      skills: typeof newEmployee.skills === "string" ? [newEmployee.skills] : newEmployee.skills,
      productivityScore: 95.0,
      unitsPerHour: 150,
      efficiency: "96.0%",
      hoursWorkedMonth: 160,
      activeStation: `${newEmployee.department} Station`,
      shiftTiming: newEmployee.shift.includes("Day") ? "06:00 - 14:30" : "14:30 - 22:30",
      avatar: newEmployee.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    };
    setEmployees((prev) => [...prev, added]);
    addToast(`Employee ${newEmployee.name} registered into factory workforce.`, "success");
    setIsAddModalOpen(false);
    setNewEmployee({
      id: `EMP-${100 + employees.length + 2}`,
      name: "",
      role: "Operator",
      department: "Packaging",
      shift: "Shift A (Day)",
      skills: "HMI Diagnostics",
      skillLevel: "Intermediate",
      trainingStatus: "Up to Date",
      qualificationStatus: "In Qualification",
      status: "Active"
    });
  };

  const handleExportCSV = () => {
    const headers = "Employee ID,Name,Role,Department,Shift,Skill Level,Training Status,Qualification Status,Status\n";
    const rows = employees
      .map(
        (e) =>
          `"${e.id}","${e.name}","${e.role}","${e.department}","${e.shift}","${e.skillLevel || 'Qualified'}","${e.trainingStatus}","${e.qualificationStatus}","${e.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Workforce_List_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Workforce employee list exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Employee / Operator List
            </h1>
            <Badge variant="cyan">{employees.length} Total Headcount</Badge>
            <Badge variant="emerald">{employees.filter((e) => e.status === "On Shift").length} On Shift Now</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Comprehensive directory of shopfloor technicians, certified machine operators, and shift specialists.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Roster
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Employee
          </Button>
        </div>
      </div>

      {/* KPI Overview Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", width: "100%" }}>
        <StatCard
          title="Active On Shift"
          value={employees.filter((e) => e.status === "On Shift").length}
          unit="Operators"
          trend={{ value: "100% Shift A Attendance", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="Training Compliance"
          value="96.2%"
          unit="Up to Date"
          trend={{ value: "1 Due for Re-test", isPositive: false, text: "" }}
          icon={BookOpen}
          colorVariant="cyan"
        />
        <StatCard
          title="Fully Qualified"
          value={employees.filter((e) => e.qualificationStatus === "Fully Qualified").length}
          unit="Level 3 / Expert"
          trend={{ value: "+2 Certified this month", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="indigo"
        />
        <StatCard
          title="Avg Plant Productivity"
          value="96.8%"
          unit="Efficiency"
          trend={{ value: "+3.4% above benchmark", isPositive: true, text: "" }}
          icon={LineChart}
          colorVariant="emerald"
        />
      </div>

      {/* Clean Responsive Filter Toolbar */}
      <Card style={{ padding: "14px 18px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "center",
            width: "100%"
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: 0, gridColumn: "span 1" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search employee, ID, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "32px", width: "100%", height: "36px", fontSize: "12px", boxSizing: "border-box" }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ minWidth: 0 }}>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", height: "36px", width: "100%", padding: "6px 10px", boxSizing: "border-box" }}
            >
              <option value="All">All Departments</option>
              <option value="Packaging">Packaging</option>
              <option value="Processing">Processing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Production">Production</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div style={{ minWidth: 0 }}>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", height: "36px", width: "100%", padding: "6px 10px", boxSizing: "border-box" }}
            >
              <option value="All">All Shifts</option>
              <option value="Shift A">Shift A (Day)</option>
              <option value="Shift B">Shift B (Evening)</option>
              <option value="Shift C">Shift C (Night)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: 0 }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", height: "36px", width: "100%", padding: "6px 10px", boxSizing: "border-box" }}
            >
              <option value="All">All Statuses</option>
              <option value="On Shift">On Shift</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Employee Table Card */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Workforce Roster ({filteredEmployees.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Registered operators with machine qualifications and quick actions.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "960px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>EMPLOYEE & ID</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>ROLE & DEPT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SKILLS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>TRAINING STATUS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>QUALIFICATION</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>CURRENT STATUS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", textAlign: "right", minWidth: "150px" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--border-subtle)", height: "48px" }}>
                  {/* Employee Name & ID */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                          fontSize: "11px",
                          flexShrink: 0
                        }}
                      >
                        {emp.avatar || emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.2 }}>{emp.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{emp.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role & Dept */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{emp.role}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{emp.department}</div>
                  </td>

                  {/* Shift */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={emp.shift.includes("Day") ? "cyan" : emp.shift.includes("Evening") ? "amber" : "indigo"}>
                      {emp.shift}
                    </Badge>
                  </td>

                  {/* Skills */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {(emp.skills || []).slice(0, 1).map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(2, 132, 199, 0.08)",
                            color: "#0284C7",
                            fontWeight: 600,
                            maxWidth: "130px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block"
                          }}
                          title={s}
                        >
                          {s}
                        </span>
                      ))}
                      {(emp.skills || []).length > 1 && (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                          +{emp.skills.length - 1} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Training Status */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge
                      variant={
                        emp.trainingStatus === "Up to Date"
                          ? "emerald"
                          : emp.trainingStatus === "In Progress"
                          ? "cyan"
                          : "amber"
                      }
                      dot
                    >
                      {emp.trainingStatus}
                    </Badge>
                  </td>

                  {/* Qualification Status */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color:
                          emp.qualificationStatus === "Fully Qualified"
                            ? "#059669"
                            : emp.qualificationStatus === "Certified"
                            ? "#0284C7"
                            : "#D97706"
                      }}
                    >
                      {emp.qualificationStatus}
                    </span>
                  </td>

                  {/* Current Status */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge
                      variant={
                        emp.status === "On Shift"
                          ? "emerald"
                          : emp.status === "Active"
                          ? "cyan"
                          : "slate"
                      }
                    >
                      {emp.status}
                    </Badge>
                  </td>

                  {/* Clean Streamlined Actions (View, Edit + Actions Dropdown) */}
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", position: "relative" }} ref={activeDropdownId === emp.id ? dropdownRef : null}>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Eye}
                        onClick={() => setViewEmployee(emp)}
                        title="View Full Profile"
                        style={{ padding: "4px 7px", fontSize: "11px", height: "28px" }}
                      >
                        View
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Edit2}
                        onClick={() => setEditEmployee(emp)}
                        title="Edit Employee"
                        style={{ padding: "4px 7px", fontSize: "11px", height: "28px" }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="secondary"
                        size="xs"
                        icon={ChevronDown}
                        onClick={() => setActiveDropdownId(activeDropdownId === emp.id ? null : emp.id)}
                        title="More Actions (Skill, Training, Productivity, Shift)"
                        style={{ padding: "4px 8px", fontSize: "11px", height: "28px", fontWeight: 700 }}
                      >
                        Actions
                      </Button>

                      {/* Floating Dropdown Menu for Secondary Actions */}
                      {activeDropdownId === emp.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            zIndex: 100,
                            backgroundColor: "#FFFFFF",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "8px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                            minWidth: "170px",
                            display: "flex",
                            flexDirection: "column",
                            padding: "6px",
                            gap: "2px",
                            textAlign: "left"
                          }}
                        >
                          <button
                            onClick={() => {
                              setAssignSkillModal(emp);
                              setActiveDropdownId(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              textAlign: "left",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Award size={14} color="#D97706" />
                            <span>Assign Skill</span>
                          </button>

                          <button
                            onClick={() => {
                              setAssignTrainingModal(emp);
                              setActiveDropdownId(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              textAlign: "left",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <BookOpen size={14} color="#0284C7" />
                            <span>Assign Training</span>
                          </button>

                          <button
                            onClick={() => {
                              setViewProductivityModal(emp);
                              setActiveDropdownId(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              textAlign: "left",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <LineChart size={14} color="#10B981" />
                            <span>View Productivity</span>
                          </button>

                          <button
                            onClick={() => {
                              setViewShiftModal(emp);
                              setActiveDropdownId(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              textAlign: "left",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Calendar size={14} color="#6366F1" />
                            <span>View Shift</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1. VIEW EMPLOYEE MODAL */}
      <Modal
        isOpen={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        title={`Employee Profile — ${viewEmployee?.name}`}
        subtitle={`ID: ${viewEmployee?.id} • Department: ${viewEmployee?.department}`}
        maxWidth="600px"
        footer={
          <Button variant="secondary" onClick={() => setViewEmployee(null)}>
            Close
          </Button>
        }
      >
        {viewEmployee && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#0284C7",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px"
                }}
              >
                {viewEmployee.avatar}
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{viewEmployee.name}</h3>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {viewEmployee.role} • {viewEmployee.department}
                </span>
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  <Badge variant="cyan">{viewEmployee.shift}</Badge>
                  <Badge variant="emerald">{viewEmployee.status}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "12px", border: "1px solid var(--border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Qualification Status</span>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
                  {viewEmployee.qualificationStatus}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Level: {viewEmployee.skillLevel || 'Expert'}</div>
              </div>
              <div style={{ padding: "12px", border: "1px solid var(--border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Training Compliance</span>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0284C7", marginTop: "4px" }}>
                  {viewEmployee.trainingStatus}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Facility: {viewEmployee.plant}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Assigned Machine Competencies</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(viewEmployee.skills || []).map((s, i) => (
                  <Badge key={i} variant="slate">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Certifications & Audits</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(viewEmployee.certifications || ["OSHA 30", "HACCP Safety"]).map((c, i) => (
                  <Badge key={i} variant="cyan">{c}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={!!editEmployee}
        onClose={() => setEditEmployee(null)}
        title="Edit Employee Information"
        subtitle={`Updating record for ${editEmployee?.name} (${editEmployee?.id})`}
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditEmployee(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        {editEmployee && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Employee Full Name
              </label>
              <input
                type="text"
                value={editEmployee.name}
                onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Role / Title
                </label>
                <input
                  type="text"
                  value={editEmployee.role}
                  onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Department
                </label>
                <select
                  value={editEmployee.department}
                  onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                  className="input-field"
                >
                  <option value="Packaging">Packaging</option>
                  <option value="Processing">Processing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Production">Production</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Assigned Shift
                </label>
                <select
                  value={editEmployee.shift}
                  onChange={(e) => setEditEmployee({ ...editEmployee, shift: e.target.value })}
                  className="input-field"
                >
                  <option value="Shift A (Day)">Shift A (Day)</option>
                  <option value="Shift B (Evening)">Shift B (Evening)</option>
                  <option value="Shift C (Night)">Shift C (Night)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Current Status
                </label>
                <select
                  value={editEmployee.status}
                  onChange={(e) => setEditEmployee({ ...editEmployee, status: e.target.value })}
                  className="input-field"
                >
                  <option value="On Shift">On Shift</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* 3. ASSIGN SKILL MODAL */}
      <Modal
        isOpen={!!assignSkillModal}
        onClose={() => setAssignSkillModal(null)}
        title="Assign Machine & Operational Skill"
        subtitle={`Employee: ${assignSkillModal?.name} (${assignSkillModal?.id})`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignSkillModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Award} onClick={handleAssignSkill}>
              Assign Skill
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignSkill} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Skill Name
            </label>
            <input
              type="text"
              value={skillForm.skillName}
              onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Skill Category
              </label>
              <select
                value={skillForm.skillCategory}
                onChange={(e) => setSkillForm({ ...skillForm, skillCategory: e.target.value })}
                className="input-field"
              >
                <option value="Machine Operation">Machine Operation</option>
                <option value="Packaging">Packaging</option>
                <option value="Processing">Processing</option>
                <option value="Quality / Sanitation">Quality / Sanitation</option>
                <option value="Maintenance Safety">Maintenance Safety</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Skill Level
              </label>
              <select
                value={skillForm.skillLevel}
                onChange={(e) => setSkillForm({ ...skillForm, skillLevel: e.target.value })}
                className="input-field"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. ASSIGN TRAINING MODAL */}
      <Modal
        isOpen={!!assignTrainingModal}
        onClose={() => setAssignTrainingModal(null)}
        title="Assign Training Program"
        subtitle={`Employee: ${assignTrainingModal?.name} • Department: ${assignTrainingModal?.department}`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignTrainingModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={BookOpen} onClick={handleAssignTraining}>
              Enroll in Training
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignTraining} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Training Program
            </label>
            <input
              type="text"
              value={trainingForm.trainingProgram}
              onChange={(e) => setTrainingForm({ ...trainingForm, trainingProgram: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Training Type
              </label>
              <select
                value={trainingForm.trainingType}
                onChange={(e) => setTrainingForm({ ...trainingForm, trainingType: e.target.value })}
                className="input-field"
              >
                <option value="Mandatory Safety">Mandatory Safety</option>
                <option value="Technical Qualification">Technical Qualification</option>
                <option value="SOP Refresh">SOP Refresh</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Assigned Trainer
              </label>
              <input
                type="text"
                value={trainingForm.trainer}
                onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Target Completion Date
            </label>
            <input
              type="date"
              value={trainingForm.targetDate}
              onChange={(e) => setTrainingForm({ ...trainingForm, targetDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>

      {/* 5. VIEW PRODUCTIVITY MODAL */}
      <Modal
        isOpen={!!viewProductivityModal}
        onClose={() => setViewProductivityModal(null)}
        title={`Individual Productivity — ${viewProductivityModal?.name}`}
        subtitle={`Role: ${viewProductivityModal?.role} • Line Assignment: ${viewProductivityModal?.activeStation}`}
        maxWidth="540px"
        footer={
          <Button variant="secondary" onClick={() => setViewProductivityModal(null)}>
            Close
          </Button>
        }
      >
        {viewProductivityModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Productivity Score</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>
                  {viewProductivityModal.productivityScore || 96.5}%
                </div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Pacing Rate</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#0284C7", marginTop: "4px" }}>
                  {viewProductivityModal.unitsPerHour || 154}
                </div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Units / Hour</span>
              </div>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Monthly Hours</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {viewProductivityModal.hoursWorkedMonth || 168}h
                </div>
              </div>
            </div>

            <div style={{ padding: "14px", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Operational Efficiency Benchmark</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                Operator is currently operating at <strong>{viewProductivityModal.efficiency || '98.0%'}</strong> line yield standard with 0 quality holds and minimal micro-stoppage variance.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. VIEW SHIFT MODAL */}
      <Modal
        isOpen={!!viewShiftModal}
        onClose={() => setViewShiftModal(null)}
        title={`Shift Roster Assignment — ${viewShiftModal?.name}`}
        subtitle={`Shift: ${viewShiftModal?.shift} • Timing: ${viewShiftModal?.shiftTiming || '06:00 - 14:30'}`}
        maxWidth="500px"
        footer={
          <Button variant="secondary" onClick={() => setViewShiftModal(null)}>
            Close
          </Button>
        }
      >
        {viewShiftModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{viewShiftModal.shift}</span>
                <Badge variant="emerald">{viewShiftModal.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Scheduled Timing: <strong>{viewShiftModal.shiftTiming || '06:00 - 14:30'}</strong>
              </div>
            </div>

            <div style={{ padding: "14px", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Primary Station Assignment</span>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0284C7", marginTop: "4px" }}>
                {viewShiftModal.activeStation || 'Line 1 Main Packaging Cell'}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Department: {viewShiftModal.department} • Facility: {viewShiftModal.plant}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. ADD EMPLOYEE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Factory Employee"
        subtitle="MaintenX OS Workforce Directory"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleAddEmployee}>
              Register Employee
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Employee ID
              </label>
              <input
                type="text"
                value={newEmployee.id}
                onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="e.g. Rachel Adams"
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Role
              </label>
              <input
                type="text"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Department
              </label>
              <select
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                className="input-field"
              >
                <option value="Packaging">Packaging</option>
                <option value="Processing">Processing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Production">Production</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Assigned Shift
              </label>
              <select
                value={newEmployee.shift}
                onChange={(e) => setNewEmployee({ ...newEmployee, shift: e.target.value })}
                className="input-field"
              >
                <option value="Shift A (Day)">Shift A (Day)</option>
                <option value="Shift B (Evening)">Shift B (Evening)</option>
                <option value="Shift C (Night)">Shift C (Night)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Primary Skill
              </label>
              <input
                type="text"
                value={newEmployee.skills}
                onChange={(e) => setNewEmployee({ ...newEmployee, skills: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Award,
  GraduationCap,
  ShieldCheck,
  Eye,
  Star,
  Building2,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function SkillsMasterPage() {
  const { employees = [], addEmployee, updateEmployee, lines = [], plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [skillLevelFilter, setSkillLevelFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [viewingEmp, setViewingEmp] = useState(null);

  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    department: "Maintenance & Reliability",
    role: "Maintenance Technician",
    plantId: "PLT-01",
    skillLevel: "Level 3 (Senior Technician)",
    skills: ["Precision Shaft Alignment", "Vibration Analysis"],
    certifications: ["OSHA 30-Hour Safety"],
    assignedLineIds: ["LIN-01"]
  });

  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesDept = deptFilter === "ALL" || e.department?.includes(deptFilter);
      const matchesLevel = skillLevelFilter === "ALL" || e.skillLevel?.includes(skillLevelFilter);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q) ||
        e.role?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.skills?.some((s) => s.toLowerCase().includes(q));

      return matchesDept && matchesLevel && matchesSearch;
    });
  }, [employees, deptFilter, skillLevelFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEmp.name.trim()) {
      addToast("Please provide Employee Name.", "warning");
      return;
    }
    const created = addEmployee(newEmp);
    addToast(`Employee ${created.employeeId} (${created.name}) onboarded with certified skills!`, "success");
    setIsAddModalOpen(false);
    setNewEmp({
      name: "",
      email: "",
      department: "Maintenance & Reliability",
      role: "Maintenance Technician",
      plantId: "PLT-01",
      skillLevel: "Level 3 (Senior Technician)",
      skills: ["Precision Shaft Alignment", "Vibration Analysis"],
      certifications: ["OSHA 30-Hour Safety"],
      assignedLineIds: ["LIN-01"]
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingEmp.name.trim()) return;
    updateEmployee(editingEmp.employeeId, editingEmp);
    addToast(`Employee ${editingEmp.employeeId} skills & profile updated!`, "success");
    setEditingEmp(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Employee & Skill Qualification Matrix
            </h1>
            <Badge variant="cyan">{employees.length} CERTIFIED WORKFORCE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Onboard Employee & Skills
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Cards */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Master Level 4 Trainers"
          value={employees.filter((e) => e.skillLevel?.includes("Level 4")).length.toString()}
          unit="Certified SME"
          trend={{ value: "Cross-functional leads", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
        <StatCard
          title="Autonomous Operators (L2-L3)"
          value={employees.filter((e) => e.skillLevel?.includes("Level 2") || e.skillLevel?.includes("Level 3")).length.toString()}
          unit="Certified"
          trend={{ value: "Shopfloor autonomous TPM", isPositive: true, text: "" }}
          icon={GraduationCap}
          colorVariant="cyan"
        />
        <StatCard
          title="Certified Skill Competencies"
          value="48"
          unit="Skills"
          trend={{ value: "LOTO, 5-Why, HACCP, Alignment", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="amber"
        />
        <StatCard
          title="Compliance Audit Readiness"
          value="100%"
          unit="OSHA / ISO"
          trend={{ value: "Valid training records", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "180px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Departments</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Production">Production</option>
              <option value="Quality">Quality Assurance</option>
              <option value="IT">IT & CI</option>
            </select>

            <select
              value={skillLevelFilter}
              onChange={(e) => setSkillLevelFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Skill Levels</option>
              <option value="Level 4">Level 4 (Master)</option>
              <option value="Level 3">Level 3 (Senior)</option>
              <option value="Level 2">Level 2 (Operator)</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredEmployees.length}</strong> of {employees.length} Certified Staff
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Employee ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Employee Name & Role</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Department</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Plant Facility</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Skill Qualification Level</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Key Certified Skills</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  return (
                    <tr
                      key={emp.employeeId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {emp.employeeId}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {emp.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {emp.role}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {emp.department}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {emp.plantName || "Indore Plant"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={emp.skillLevel?.includes("Level 4") ? "emerald" : emp.skillLevel?.includes("Level 3") ? "cyan" : "amber"}>
                          {emp.skillLevel}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "260px" }}>
                          {emp.skills?.slice(0, 2).map((s, idx) => (
                            <span key={idx} style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                              {s}
                            </span>
                          ))}
                          {(emp.skills?.length || 0) > 2 && (
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "2px 4px" }}>
                              +{emp.skills.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={emp.status === "Active" ? "emerald" : "rose"}>
                          {emp.status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => setViewingEmp(emp)}
                            style={{ padding: "6px 8px" }}
                            title="View Skill Matrix & Certifications"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingEmp(emp)}
                            style={{ padding: "6px 8px" }}
                            title="Edit Employee Qualifications"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No employee records match the department or skill level filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ONBOARD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Onboard Employee & Skill Qualifications
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clara Oswald"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Maintenance & Reliability">Maintenance & Reliability</option>
                    <option value="Plant Operations">Plant Operations</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Maintenance Technician"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Skill Qualification Level</label>
                  <select
                    value={newEmp.skillLevel}
                    onChange={(e) => setNewEmp({ ...newEmp, skillLevel: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Level 4 (Master / Trainer)">Level 4 (Master / Trainer)</option>
                    <option value="Level 3 (Senior Technician)">Level 3 (Senior Technician)</option>
                    <option value="Level 2 (Autonomous Operator)">Level 2 (Autonomous Operator)</option>
                    <option value="Level 1 (Apprentice / In Training)">Level 1 (Apprentice / In Training)</option>
                  </select>
                </div>
              </div>

              {/* Skills Tag Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Certified Competencies</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    placeholder="e.g. HACCP CCP-1, LOTO Protocol, 5-Why RCA"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", flex: 1 }}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      if (skillInput.trim()) {
                        setNewEmp({ ...newEmp, skills: [...newEmp.skills, skillInput.trim()] });
                        setSkillInput("");
                      }
                    }}
                    style={{ fontSize: "12px" }}
                  >
                    Add Skill
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {newEmp.skills.map((s, idx) => (
                    <span key={idx} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "6px" }}>
                      {s}
                      <X size={12} cursor="pointer" onClick={() => setNewEmp({ ...newEmp, skills: newEmp.skills.filter((_, i) => i !== idx) })} />
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save & Certify Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EMPLOYEE MODAL */}
      {viewingEmp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "680px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Users size={20} color="#B27E33" />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {viewingEmp.name}
                  </h3>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    ID: {viewingEmp.employeeId} • {viewingEmp.role} ({viewingEmp.department})
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingEmp(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Qualification Level</div>
                  <Badge variant="emerald" style={{ marginTop: "4px" }}>{viewingEmp.skillLevel}</Badge>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Assigned Facility</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingEmp.plantName || "Indore Plant"}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Certified Skills ({viewingEmp.skills?.length || 0})</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {viewingEmp.skills?.map((s, idx) => (
                    <span key={idx} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.3)", color: "#8C5B23", fontWeight: 700 }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Accreditations & Professional Certifications</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {viewingEmp.certifications?.map((c, idx) => (
                    <Badge key={idx} variant="cyan">📜 {c}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setViewingEmp(null)} style={{ fontSize: "12px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

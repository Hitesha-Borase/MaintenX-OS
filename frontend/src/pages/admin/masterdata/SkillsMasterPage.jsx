import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Trash2,
  RefreshCw,
  Building2,
  Layers,
  AlertCircle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function SkillsMasterPage() {
  const { employees = [], setEmployees, lines = [], plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [liveEmployees, setLiveEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [skillLevelFilter, setSkillLevelFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [viewingEmp, setViewingEmp] = useState(null);

  const initialNewEmpState = {
    name: "",
    email: "",
    department: "Maintenance & Reliability",
    role: "",
    plantId: plants[0]?.id || "",
    plantName: plants[0]?.name || "Indore Plant",
    skillLevel: "Level 2 (Autonomous Operator)",
    skills: [],
    certifications: [],
    status: "Active"
  };

  const [newEmp, setNewEmp] = useState(initialNewEmpState);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  const [editSkillInput, setEditSkillInput] = useState("");
  const [editCertInput, setEditCertInput] = useState("");

  // Live Staff Fetch directly from PostgreSQL DB via API
  const fetchLiveStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await masterDataService.getStaff();
      let raw = [];
      if (Array.isArray(res)) {
        raw = res;
      } else if (Array.isArray(res?.data)) {
        raw = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        raw = res.data.data;
      }
      setLiveEmployees(raw);
      if (typeof setEmployees === "function") {
        setEmployees(raw);
      }
    } catch (err) {
      console.warn("Failed to fetch live staff from DB:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setEmployees]);

  useEffect(() => {
    fetchLiveStaff();
  }, [fetchLiveStaff]);

  // The single source of truth is the live database records
  const displayEmployees = liveEmployees;

  // Dynamic KPI 1: Level 4 Master Trainers
  const level4Count = useMemo(() => {
    return displayEmployees.filter((e) => (e.skillLevel || "").toLowerCase().includes("level 4")).length;
  }, [displayEmployees]);

  // Dynamic KPI 2: Autonomous Operators (Level 2 & 3)
  const l2l3Count = useMemo(() => {
    return displayEmployees.filter((e) => {
      const lvl = (e.skillLevel || "").toLowerCase();
      return lvl.includes("level 2") || lvl.includes("level 3");
    }).length;
  }, [displayEmployees]);

  // Dynamic KPI 3: Unique Certified Skill Competencies
  const uniqueSkillsList = useMemo(() => {
    const set = new Set();
    displayEmployees.forEach((e) => {
      if (Array.isArray(e.skills)) {
        e.skills.forEach((s) => {
          if (s && String(s).trim()) set.add(String(s).trim());
        });
      }
    });
    return Array.from(set);
  }, [displayEmployees]);

  // Dynamic KPI 4: Compliance Readiness %
  const complianceStats = useMemo(() => {
    if (displayEmployees.length === 0) return { pct: 0, compliant: 0, total: 0 };
    const compliant = displayEmployees.filter((e) => {
      const hasSkills = Array.isArray(e.skills) && e.skills.length > 0;
      const hasCerts = Array.isArray(e.certifications) && e.certifications.length > 0;
      const isActive = (e.status || "Active").toLowerCase() === "active";
      return isActive && (hasSkills || hasCerts);
    }).length;
    const pct = Math.round((compliant / displayEmployees.length) * 100);
    return { pct, compliant, total: displayEmployees.length };
  }, [displayEmployees]);

  // Table Filter
  const filteredEmployees = useMemo(() => {
    return displayEmployees.filter((e) => {
      const matchesDept = deptFilter === "ALL" || (e.department || "").toLowerCase().includes(deptFilter.toLowerCase());
      const matchesLevel = skillLevelFilter === "ALL" || (e.skillLevel || "").toLowerCase().includes(skillLevelFilter.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (e.name || "").toLowerCase().includes(q) ||
        (e.employeeId || "").toLowerCase().includes(q) ||
        (e.role || "").toLowerCase().includes(q) ||
        (e.department || "").toLowerCase().includes(q) ||
        (Array.isArray(e.skills) && e.skills.some((s) => String(s).toLowerCase().includes(q))) ||
        (Array.isArray(e.certifications) && e.certifications.some((c) => String(c).toLowerCase().includes(q)));

      return matchesDept && matchesLevel && matchesSearch;
    });
  }, [displayEmployees, deptFilter, skillLevelFilter, searchQuery]);

  // Handlers for Add Form Tags
  const handleAddSkillTag = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !newEmp.skills.includes(trimmed)) {
      setNewEmp({ ...newEmp, skills: [...newEmp.skills, trimmed] });
      setSkillInput("");
    }
  };

  const handleRemoveSkillTag = (indexToRemove) => {
    setNewEmp({
      ...newEmp,
      skills: newEmp.skills.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleAddCertTag = () => {
    const trimmed = certInput.trim();
    if (trimmed && !newEmp.certifications.includes(trimmed)) {
      setNewEmp({ ...newEmp, certifications: [...newEmp.certifications, trimmed] });
      setCertInput("");
    }
  };

  const handleRemoveCertTag = (indexToRemove) => {
    setNewEmp({
      ...newEmp,
      certifications: newEmp.certifications.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Handlers for Edit Form Tags
  const handleAddEditSkillTag = () => {
    if (!editingEmp) return;
    const trimmed = editSkillInput.trim();
    const currentSkills = Array.isArray(editingEmp.skills) ? editingEmp.skills : [];
    if (trimmed && !currentSkills.includes(trimmed)) {
      setEditingEmp({ ...editingEmp, skills: [...currentSkills, trimmed] });
      setEditSkillInput("");
    }
  };

  const handleRemoveEditSkillTag = (indexToRemove) => {
    if (!editingEmp) return;
    const currentSkills = Array.isArray(editingEmp.skills) ? editingEmp.skills : [];
    setEditingEmp({
      ...editingEmp,
      skills: currentSkills.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleAddEditCertTag = () => {
    if (!editingEmp) return;
    const trimmed = editCertInput.trim();
    const currentCerts = Array.isArray(editingEmp.certifications) ? editingEmp.certifications : [];
    if (trimmed && !currentCerts.includes(trimmed)) {
      setEditingEmp({ ...editingEmp, certifications: [...currentCerts, trimmed] });
      setEditCertInput("");
    }
  };

  const handleRemoveEditCertTag = (indexToRemove) => {
    if (!editingEmp) return;
    const currentCerts = Array.isArray(editingEmp.certifications) ? editingEmp.certifications : [];
    setEditingEmp({
      ...editingEmp,
      certifications: currentCerts.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Create Staff in PostgreSQL DB via API
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newEmp.name.trim()) {
      addToast("Please provide Employee Name.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await masterDataService.createStaff(newEmp);
      const created = res?.data?.data || res?.data || res;
      addToast(`Employee ${created.employeeId || created.name} onboarded successfully!`, "success");
      setIsAddModalOpen(false);
      setNewEmp(initialNewEmpState);
      setSkillInput("");
      setCertInput("");
      await fetchLiveStaff();
    } catch (err) {
      console.error("Create staff error:", err);
      addToast(err?.response?.data?.message || err?.message || "Failed to onboard employee", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Staff in PostgreSQL DB via API
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmp || !editingEmp.name.trim()) {
      addToast("Employee name is required.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const targetId = editingEmp.id || editingEmp.employeeId;
      await masterDataService.updateStaff(targetId, editingEmp);
      addToast(`Employee ${editingEmp.employeeId || editingEmp.name} qualifications & profile updated!`, "success");
      setEditingEmp(null);
      await fetchLiveStaff();
    } catch (err) {
      console.error("Update staff error:", err);
      addToast(err?.response?.data?.message || err?.message || "Failed to update employee", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Staff from PostgreSQL DB via API
  const handleDeleteEmployee = async (emp) => {
    const label = emp.employeeId ? `${emp.employeeId} (${emp.name})` : emp.name;
    if (!window.confirm(`Are you sure you want to delete ${label}? This cannot be undone.`)) {
      return;
    }

    try {
      const targetId = emp.id || emp.employeeId;
      await masterDataService.deleteStaff(targetId);
      addToast(`Employee ${emp.employeeId || emp.name} deleted successfully from database.`, "success");
      await fetchLiveStaff();
    } catch (err) {
      console.error("Delete staff error:", err);
      addToast(err?.response?.data?.message || err?.message || "Failed to delete employee", "error");
    }
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
            <Badge variant="cyan">{displayEmployees.length} CERTIFIED WORKFORCE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchLiveStaff}
            disabled={isLoading}
            style={{ fontSize: "12px", padding: "7px 12px" }}
            title="Reload live records from database"
          >
            {isLoading ? "Syncing..." : "Sync DB"}
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Onboard Employee & Skills
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Dynamic Cards */}
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
          value={level4Count.toString()}
          unit="Certified SME"
          trend={{
            value: level4Count > 0 ? `${level4Count} Active SMEs` : "0 cross-functional leads",
            isPositive: level4Count > 0,
            text: ""
          }}
          icon={Award}
          colorVariant="emerald"
        />
        <StatCard
          title="Autonomous Operators (L2-L3)"
          value={l2l3Count.toString()}
          unit="Certified"
          trend={{
            value: l2l3Count > 0 ? `${l2l3Count} Shopfloor operators` : "0 shopfloor operators",
            isPositive: l2l3Count > 0,
            text: ""
          }}
          icon={GraduationCap}
          colorVariant="cyan"
        />
        <StatCard
          title="Certified Skill Competencies"
          value={uniqueSkillsList.length.toString()}
          unit="Skills"
          trend={{
            value: uniqueSkillsList.length > 0 ? `${uniqueSkillsList.length} distinct skills` : "0 skills registered",
            isPositive: uniqueSkillsList.length > 0,
            text: ""
          }}
          icon={ShieldCheck}
          colorVariant="amber"
        />
        <StatCard
          title="Compliance Audit Readiness"
          value={`${complianceStats.pct}%`}
          unit="OSHA / ISO"
          trend={{
            value: complianceStats.total > 0 ? `${complianceStats.compliant} of ${complianceStats.total} fully certified` : "No staff onboarded",
            isPositive: complianceStats.pct >= 80,
            text: ""
          }}
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
                placeholder="Search staff by name, ID, role, or skills..."
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
              <option value="Maintenance">Maintenance & Reliability</option>
              <option value="Production">Production</option>
              <option value="Quality">Quality Assurance</option>
              <option value="Plant Operations">Plant Operations</option>
            </select>

            <select
              value={skillLevelFilter}
              onChange={(e) => setSkillLevelFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Skill Levels</option>
              <option value="Level 4">Level 4 (Master / Trainer)</option>
              <option value="Level 3">Level 3 (Senior)</option>
              <option value="Level 2">Level 2 (Autonomous)</option>
              <option value="Level 1">Level 1 (Apprentice)</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredEmployees.length}</strong> of {displayEmployees.length} Certified Staff
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
                  const empKey = emp.id || emp.employeeId || emp.employeeCode;
                  const empIdDisplay = emp.employeeId || emp.employeeCode || `EMP-${String(emp.id).substring(0, 4)}`;
                  const skillLvl = emp.skillLevel || "Level 2 (Autonomous Operator)";

                  return (
                    <tr
                      key={empKey}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {empIdDisplay}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {emp.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {emp.role || emp.designation || "Staff Member"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {emp.department || "Production"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {emp.plantName || "Indore Plant"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={skillLvl.includes("Level 4") ? "emerald" : skillLvl.includes("Level 3") ? "cyan" : skillLvl.includes("Level 2") ? "amber" : "neutral"}>
                          {skillLvl}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "260px" }}>
                          {Array.isArray(emp.skills) && emp.skills.length > 0 ? (
                            <>
                              {emp.skills.slice(0, 2).map((s, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "11px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    backgroundColor: "var(--bg-card-subtle)",
                                    border: "1px solid var(--border-subtle)"
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                              {emp.skills.length > 2 && (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "2px 4px" }}>
                                  +{emp.skills.length - 2} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                              No certified skills
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={(emp.status || "Active").toLowerCase() === "active" ? "emerald" : "rose"}>
                          {emp.status || "Active"}
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
                            onClick={() => {
                              setEditingEmp({
                                ...emp,
                                employeeId: empIdDisplay,
                                skills: Array.isArray(emp.skills) ? [...emp.skills] : [],
                                certifications: Array.isArray(emp.certifications) ? [...emp.certifications] : []
                              });
                              setEditSkillInput("");
                              setEditCertInput("");
                            }}
                            style={{ padding: "6px 8px" }}
                            title="Edit Employee Qualifications"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteEmployee(emp)}
                            style={{ padding: "6px 8px", color: "#DC2626", borderColor: "rgba(220, 38, 38, 0.25)" }}
                            title="Delete Employee from DB"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                      <AlertCircle size={28} color="var(--text-muted)" />
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>No employee records found</div>
                      <div style={{ fontSize: "12px" }}>
                        {searchQuery || deptFilter !== "ALL" || skillLevelFilter !== "ALL"
                          ? "No records match your active search filters."
                          : "No staff records found in database. Click '+ Onboard Employee & Skills' to add staff."}
                      </div>
                    </div>
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
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
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
                    placeholder="e.g. Rahul Sharma"
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
                    <option value="Production Operations">Production Operations</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Plant Operations">Plant Operations</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Role / Designation *</label>
                  <input
                    type="text"
                    required
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. r.sharma@factory.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                  <select
                    value={newEmp.status}
                    onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Certified Skills Tag Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Certified Competencies (Skills)
                </label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    placeholder="e.g. Vibration Analysis, LOTO Protocol, Shaft Alignment"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkillTag();
                      }
                    }}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", flex: 1 }}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleAddSkillTag}
                    style={{ fontSize: "12px" }}
                  >
                    Add Skill
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {newEmp.skills.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {s}
                      <X size={12} cursor="pointer" onClick={() => handleRemoveSkillTag(idx)} />
                    </span>
                  ))}
                  {newEmp.skills.length === 0 && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No skills added yet. Type a skill and click "Add Skill".
                    </span>
                  )}
                </div>
              </div>

              {/* Accreditations / Certifications Tag Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Accreditations & Certifications
                </label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    placeholder="e.g. OSHA 30-Hour, ISO 22000, Six Sigma Green Belt"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCertTag();
                      }
                    }}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", flex: 1 }}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleAddCertTag}
                    style={{ fontSize: "12px" }}
                  >
                    Add Cert
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {newEmp.certifications.map((c, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(2, 132, 199, 0.08)",
                        border: "1px solid rgba(2, 132, 199, 0.25)",
                        color: "#0284C7",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      📜 {c}
                      <X size={12} cursor="pointer" onClick={() => handleRemoveCertTag(idx)} />
                    </span>
                  ))}
                  {newEmp.certifications.length === 0 && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No certifications added yet. Type a cert and click "Add Cert".
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting} style={{ fontSize: "12px" }}>
                  {isSubmitting ? "Saving..." : "Save & Certify Employee"}
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
                    ID: {viewingEmp.employeeId || viewingEmp.employeeCode} • {viewingEmp.role || viewingEmp.designation} ({viewingEmp.department})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingEmp(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Qualification Level</div>
                  <Badge variant="emerald" style={{ marginTop: "4px" }}>{viewingEmp.skillLevel || "Level 2 (Autonomous Operator)"}</Badge>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Assigned Facility</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingEmp.plantName || "Indore Plant"}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Certified Skills ({viewingEmp.skills?.length || 0})
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Array.isArray(viewingEmp.skills) && viewingEmp.skills.length > 0 ? (
                    viewingEmp.skills.map((s, idx) => (
                      <span key={idx} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.3)", color: "#8C5B23", fontWeight: 700 }}>
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>None logged</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Accreditations & Professional Certifications ({viewingEmp.certifications?.length || 0})
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Array.isArray(viewingEmp.certifications) && viewingEmp.certifications.length > 0 ? (
                    viewingEmp.certifications.map((c, idx) => (
                      <Badge key={idx} variant="cyan">📜 {c}</Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>None logged</span>
                  )}
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

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmp && (
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
                <Edit2 size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Qualifications — {editingEmp.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.name || ""}
                    onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Employee ID</label>
                  <input
                    type="text"
                    disabled
                    value={editingEmp.employeeId || editingEmp.employeeCode || ""}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px", backgroundColor: "var(--bg-card-subtle)", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Department</label>
                  <select
                    value={editingEmp.department || "Maintenance & Reliability"}
                    onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Maintenance & Reliability">Maintenance & Reliability</option>
                    <option value="Production Operations">Production Operations</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Plant Operations">Plant Operations</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Skill Qualification Level</label>
                  <select
                    value={editingEmp.skillLevel || "Level 2 (Autonomous Operator)"}
                    onChange={(e) => setEditingEmp({ ...editingEmp, skillLevel: e.target.value })}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Role / Designation</label>
                  <input
                    type="text"
                    value={editingEmp.role || editingEmp.designation || ""}
                    onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value, designation: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                  <select
                    value={editingEmp.status || "Active"}
                    onChange={(e) => setEditingEmp({ ...editingEmp, status: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Edit Skills Tag Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Certified Competencies</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    placeholder="Add skill..."
                    value={editSkillInput}
                    onChange={(e) => setEditSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEditSkillTag();
                      }
                    }}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", flex: 1 }}
                  />
                  <Button variant="secondary" type="button" onClick={handleAddEditSkillTag} style={{ fontSize: "12px" }}>
                    Add
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {(editingEmp.skills || []).map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {s}
                      <X size={12} cursor="pointer" onClick={() => handleRemoveEditSkillTag(idx)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit Certifications Tag Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Accreditations & Certifications</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="text"
                    placeholder="Add certification..."
                    value={editCertInput}
                    onChange={(e) => setEditCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEditCertTag();
                      }
                    }}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", flex: 1 }}
                  />
                  <Button variant="secondary" type="button" onClick={handleAddEditCertTag} style={{ fontSize: "12px" }}>
                    Add
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {(editingEmp.certifications || []).map((c, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(2, 132, 199, 0.08)",
                        border: "1px solid rgba(2, 132, 199, 0.25)",
                        color: "#0284C7",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      📜 {c}
                      <X size={12} cursor="pointer" onClick={() => handleRemoveEditCertTag(idx)} />
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingEmp(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting} style={{ fontSize: "12px" }}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillsMasterPage;

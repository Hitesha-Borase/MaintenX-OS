import React, { useState, useMemo } from "react";
import {
  Award,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Edit2,
  Users,
  Send
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { SKILLS_LIST } from "../../data/mockLabour";

export function SkillsTraining() {
  const { addToast } = useApp();

  const [skills, setSkills] = useState(SKILLS_LIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Modals
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [editSkill, setEditSkill] = useState(null);

  const [newSkill, setNewSkill] = useState({
    skillName: "",
    skillCategory: "Machine Operation",
    employee: "Elena Rostova",
    employeeId: "EMP-101",
    skillLevel: "Intermediate",
    certification: "HACCP Safety L2",
    expiry: "2027-09-30",
    status: "Active"
  });

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch =
        s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.certification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || s.skillCategory === selectedCategory;
      const matchesLevel = selectedLevel === "All" || s.skillLevel === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [skills, searchQuery, selectedCategory, selectedLevel]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.skillName) return;
    const added = {
      id: `SKL-0${skills.length + 1}`,
      ...newSkill
    };
    setSkills((prev) => [added, ...prev]);
    addToast(`Skill "${newSkill.skillName}" (${newSkill.skillLevel}) added for ${newSkill.employee}.`, "success");
    setIsAddSkillModalOpen(false);
    setNewSkill({
      skillName: "",
      skillCategory: "Machine Operation",
      employee: "Elena Rostova",
      employeeId: "EMP-101",
      skillLevel: "Intermediate",
      certification: "HACCP Safety L2",
      expiry: "2027-09-30",
      status: "Active"
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setSkills((prev) =>
      prev.map((s) => (s.id === editSkill.id ? { ...s, ...editSkill } : s))
    );
    addToast(`Skill competency level for ${editSkill.employee} updated to ${editSkill.skillLevel}.`, "success");
    setEditSkill(null);
  };

  const handleExportCSV = () => {
    const headers = "Skill ID,Skill Name,Skill Category,Employee,Skill Level,Certification,Expiry,Status\n";
    const rows = skills
      .map(
        (s) =>
          `"${s.id}","${s.skillName}","${s.skillCategory}","${s.employee}","${s.skillLevel}","${s.certification}","${s.expiry}","${s.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Skills_Matrix_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Skills matrix exported to CSV.", "info");
  };

  const getLevelBadgeVariant = (level) => {
    switch (level) {
      case "Expert":
        return "emerald";
      case "Advanced":
        return "cyan";
      case "Intermediate":
        return "indigo";
      case "Beginner":
      default:
        return "amber";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Skills & Qualification Matrix
            </h1>
            <Badge variant="cyan">{skills.length} Certified Skills</Badge>
            <Badge variant="emerald">100% Core Machine Coverage</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Machine qualification levels (Beginner, Intermediate, Advanced, Expert) and operational compliance records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Skills
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddSkillModalOpen(true)}>
            + Add Skill Record
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        <StatCard
          title="Expert Qualifications"
          value={skills.filter((s) => s.skillLevel === "Expert").length}
          unit="Master Operators"
          trend={{ value: "Eligible for shift trainer leads", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
        <StatCard
          title="Advanced Competencies"
          value={skills.filter((s) => s.skillLevel === "Advanced").length}
          unit="Independent Techs"
          trend={{ value: "Autonomous line operation", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Intermediate Operators"
          value={skills.filter((s) => s.skillLevel === "Intermediate").length}
          unit="Certified"
          trend={{ value: "Standard operating level", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="indigo"
        />
        <StatCard
          title="Beginner / In-Training"
          value={skills.filter((s) => s.skillLevel === "Beginner").length}
          unit="Trainees"
          trend={{ value: "Supervised shift buddy model", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="amber"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card style={{ padding: "14px 18px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: "1 1 300px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search skill name, employee, or certification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", width: "100%", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "6px 10px", height: "36px" }}
            >
              <option value="All">All Categories</option>
              <option value="Machine Operation">Machine Operation</option>
              <option value="Packaging">Packaging</option>
              <option value="Processing">Processing</option>
              <option value="Quality / Sanitation">Quality / Sanitation</option>
              <option value="Maintenance Safety">Maintenance Safety</option>
            </select>

            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginLeft: "4px" }}>Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "6px 10px", height: "36px" }}
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Skills Table */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Shopfloor Competency Roster ({filteredSkills.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Detailed operator machine certifications, levels, and audit expiration dates.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "920px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SKILL NAME</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SKILL CATEGORY</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>EMPLOYEE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SKILL LEVEL</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>CERTIFICATION</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>EXPIRY DATE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>STATUS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)", height: "46px" }}>
                  {/* Skill Name */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{s.skillName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.id}</div>
                  </td>

                  {/* Skill Category */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="slate">{s.skillCategory}</Badge>
                  </td>

                  {/* Employee */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>{s.employee}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.employeeId}</div>
                  </td>

                  {/* Skill Level (Beginner, Intermediate, Advanced, Expert) */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={getLevelBadgeVariant(s.skillLevel)} dot>
                      {s.skillLevel}
                    </Badge>
                  </td>

                  {/* Certification */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", color: "#0284C7", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {s.certification}
                  </td>

                  {/* Expiry */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {s.expiry}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={s.status === "Active" ? "emerald" : "amber"}>
                      {s.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Edit2}
                      onClick={() => setEditSkill(s)}
                      style={{ padding: "4px 8px", fontSize: "11px", height: "28px" }}
                    >
                      Update Level
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1. ADD SKILL MODAL */}
      <Modal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        title="Add Employee Skill & Qualification"
        subtitle="Operational Competency Registration"
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleAddSkill}>
              Save Skill
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSkill} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Skill Name
            </label>
            <input
              type="text"
              value={newSkill.skillName}
              onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
              placeholder="e.g. Automated High-Speed Capper Operation"
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
                value={newSkill.skillCategory}
                onChange={(e) => setNewSkill({ ...newSkill, skillCategory: e.target.value })}
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
                value={newSkill.skillLevel}
                onChange={(e) => setNewSkill({ ...newSkill, skillLevel: e.target.value })}
                className="input-field"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Employee
              </label>
              <input
                type="text"
                value={newSkill.employee}
                onChange={(e) => setNewSkill({ ...newSkill, employee: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Certification
              </label>
              <input
                type="text"
                value={newSkill.certification}
                onChange={(e) => setNewSkill({ ...newSkill, certification: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Expiry Date
            </label>
            <input
              type="date"
              value={newSkill.expiry}
              onChange={(e) => setNewSkill({ ...newSkill, expiry: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>

      {/* 2. EDIT SKILL LEVEL MODAL */}
      <Modal
        isOpen={!!editSkill}
        onClose={() => setEditSkill(null)}
        title="Update Machine Qualification Level"
        subtitle={`Skill: ${editSkill?.skillName} • Operator: ${editSkill?.employee}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditSkill(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveEdit}>
              Update Level
            </Button>
          </>
        }
      >
        {editSkill && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Skill Level
              </label>
              <select
                value={editSkill.skillLevel}
                onChange={(e) => setEditSkill({ ...editSkill, skillLevel: e.target.value })}
                className="input-field"
              >
                <option value="Beginner">Beginner (Under Supervision)</option>
                <option value="Intermediate">Intermediate (Certified Operator)</option>
                <option value="Advanced">Advanced (Autonomous / Setup)</option>
                <option value="Expert">Expert (Lead / Trainer)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Certification Renewal Expiry
              </label>
              <input
                type="date"
                value={editSkill.expiry}
                onChange={(e) => setEditSkill({ ...editSkill, expiry: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

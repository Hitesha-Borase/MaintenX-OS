import React, { useState } from "react";
import {
  Award,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Users,
  ShieldCheck,
  Calendar,
  GraduationCap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function SkillsMasterPage() {
  const { addToast } = useApp();

  const [skills, setSkills] = useState([
    { id: "SKL-01", name: "Isobaric Filler Operation & CIP Sanitization", tier: "Level 3 - Expert", certValidity: "12 Months", certifiedCount: 14, department: "Operations", status: "Active" },
    { id: "SKL-02", name: "High-Speed Can Seamer Mechanical Timing", tier: "Level 4 - Master", certValidity: "24 Months", certifiedCount: 6, department: "Maintenance", status: "Active" },
    { id: "SKL-03", name: "Laboratory Refractometry & Microbiological Swabs", tier: "Level 3 - Expert", certValidity: "12 Months", certifiedCount: 10, department: "Quality", status: "Active" },
    { id: "SKL-04", name: "Automated Laser Guided Vehicle (AGV) Dispatch", tier: "Level 2 - Operator", certValidity: "12 Months", certifiedCount: 18, department: "Warehouse", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: "",
    tier: "Level 3 - Expert",
    certValidity: "12 Months",
    certifiedCount: 5,
    department: "Operations"
  });

  const totalCertified = skills.reduce((sum, s) => sum + (s.certifiedCount || 0), 0);

  const filteredSkills = skills.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) {
      addToast("Please provide skill description.", "warning");
      return;
    }

    const created = {
      id: `SKL-0${skills.length + 1}`,
      name: newSkill.name,
      tier: newSkill.tier,
      certValidity: newSkill.certValidity || "12 Months",
      certifiedCount: Number(newSkill.certifiedCount) || 1,
      department: newSkill.department,
      status: "Active"
    };

    setSkills([...skills, created]);
    addToast(`Skill "${created.id}" created for ${created.department}!`, "success");
    setIsModalOpen(false);
    setNewSkill({ name: "", tier: "Level 3 - Expert", certValidity: "12 Months", certifiedCount: 5, department: "Operations" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Skills & Operator Qualifications
            </h1>
            <Badge variant="emerald">{skills.length} CERTIFIED SKILLS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Certified Skill
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Skill Profiles"
          value={skills.length.toString()}
          unit="Certified Tracks"
          trend={{ value: "Core machinery competencies", isPositive: true, text: "" }}
          icon={GraduationCap}
          colorVariant="emerald"
        />
        <StatCard
          title="Certified Personnel"
          value={`${totalCertified} Staff`}
          unit="Active Badges"
          trend={{ value: "Cross-trained coverage", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="Master Level 4"
          value="6 Techs"
          unit="Maintenance"
          trend={{ value: "Seamer timing masters", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="amber"
        />
        <StatCard
          title="Compliance Rate"
          value="100%"
          unit="Audit Ready"
          trend={{ value: "Zero expired certifications", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search skill, department, tier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Skill Code</th>
                <th>Skill Description</th>
                <th>Competency Tier</th>
                <th>Certification Validity</th>
                <th>Certified Count</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{s.name}</strong>
                  </td>
                  <td>
                    <Badge variant={s.tier.includes("Master") ? "amber" : "cyan"}>{s.tier}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{s.certValidity}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{s.certifiedCount} Staff</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{s.department}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened training matrix for ${s.name}`, "info")}
                      title="Edit Skill"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SKILL MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Operator Qualification Track
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Skill Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nitrogen Dosing Calibration & Safety"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Competency Tier</label>
                  <select
                    className="form-select"
                    value={newSkill.tier}
                    onChange={(e) => setNewSkill({ ...newSkill, tier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Level 1 - Trainee">Level 1 - Trainee</option>
                    <option value="Level 2 - Operator">Level 2 - Operator</option>
                    <option value="Level 3 - Expert">Level 3 - Expert</option>
                    <option value="Level 4 - Master">Level 4 - Master</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={newSkill.department}
                    onChange={(e) => setNewSkill({ ...newSkill, department: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Operations">Operations</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Quality">Quality</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Certification Validity</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Months"
                    value={newSkill.certValidity}
                    onChange={(e) => setNewSkill({ ...newSkill, certValidity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Certified Staff Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newSkill.certifiedCount}
                    onChange={(e) => setNewSkill({ ...newSkill, certifiedCount: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Skill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

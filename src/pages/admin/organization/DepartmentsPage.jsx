import React, { useState } from "react";
import {
  Building2,
  Users,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  X,
  Edit2,
  Layers,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function DepartmentsPage() {
  const { addToast } = useApp();

  const [departments, setDepartments] = useState([
    { id: "DEP-01", name: "Operations / Shop Floor", code: "OPS", head: "Robert Thorne", membersCount: 48, plant: "Plant 1 (Austin)", status: "Active" },
    { id: "DEP-02", name: "Maintenance & Reliability", code: "MAINT", head: "Marcus Vance", membersCount: 14, plant: "Plant 1 (Austin)", status: "Active" },
    { id: "DEP-03", name: "Quality Assurance & Lab", code: "QA", head: "Sarah Jenkins", membersCount: 12, plant: "Plant 1 (Austin)", status: "Active" },
    { id: "DEP-04", name: "Warehouse & Logistics", code: "WHSE", head: "Elena Rostova", membersCount: 16, plant: "Plant 1 (Austin)", status: "Active" },
    { id: "DEP-05", name: "IT & Digital Automation", code: "IT", head: "Alexander Vance", membersCount: 6, plant: "All Plants", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [newDept, setNewDept] = useState({
    name: "",
    code: "",
    head: "",
    membersCount: 5,
    plant: "Plant 1 (Austin)"
  });

  const totalPersonnel = departments.reduce((sum, d) => sum + (d.membersCount || 0), 0);

  const filteredDepts = departments.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.head.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDept.name.trim() || !newDept.code.trim()) {
      addToast("Please provide department name and code.", "warning");
      return;
    }

    const created = {
      id: `DEP-0${departments.length + 1}`,
      name: newDept.name,
      code: newDept.code.toUpperCase(),
      head: newDept.head || "Unassigned",
      membersCount: Number(newDept.membersCount) || 1,
      plant: newDept.plant,
      status: "Active"
    };

    setDepartments([...departments, created]);
    addToast(`Department "${created.name}" created successfully!`, "success");
    setIsModalOpen(false);
    setNewDept({ name: "", code: "", head: "", membersCount: 5, plant: "Plant 1 (Austin)" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingDept.name.trim() || !editingDept.code.trim()) {
      addToast("Please provide department name and code.", "warning");
      return;
    }

    setDepartments((prev) =>
      prev.map((d) => (d.id === editingDept.id ? editingDept : d))
    );
    addToast(`Department "${editingDept.name}" updated successfully!`, "success");
    setEditingDept(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Enterprise Department Hierarchy
            </h1>
            <Badge variant="cyan">{departments.length} DEPARTMENTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Department
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
          title="Total Departments"
          value={departments.length.toString()}
          unit="Active Units"
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Staff Headcount"
          value={totalPersonnel.toString()}
          unit="Personnel"
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="Department Leads"
          value={departments.length.toString()}
          unit="Designated"
          icon={Briefcase}
          colorVariant="amber"
        />
        <StatCard
          title="Cost Center Audit"
          value="100%"
          unit="Validated"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Departments Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search department name, code, lead..."
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
                <th>Dept Code</th>
                <th>Department Name</th>
                <th>Department Lead</th>
                <th>Staff Headcount</th>
                <th>Plant Scope</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{d.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{d.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{d.head}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{d.membersCount} Staff</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.plant}</span>
                  </td>
                  <td>
                    <Badge variant="emerald">{d.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingDept({ ...d })}
                      title="Edit Department"
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

      {/* ADD DEPARTMENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New Department
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Headcount</label>
                  <input
                    type="number"
                    min="1"
                    value={newDept.membersCount}
                    onChange={(e) => setNewDept({ ...newDept, membersCount: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Process Engineering"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Department Lead</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={newDept.head}
                  onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Plant Facility Scope</label>
                <select
                  className="form-select"
                  value={newDept.plant}
                  onChange={(e) => setNewDept({ ...newDept, plant: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                  <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                  <option value="All Plants">All Plants (Enterprise Global)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEPARTMENT MODAL */}
      {editingDept && (
        <div className="modal-backdrop" onClick={() => setEditingDept(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit Department — {editingDept.code}
              </h2>
              <button onClick={() => setEditingDept(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={editingDept.code}
                    onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Headcount</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDept.membersCount}
                    onChange={(e) => setEditingDept({ ...editingDept, membersCount: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Department Lead</label>
                <input
                  type="text"
                  value={editingDept.head}
                  onChange={(e) => setEditingDept({ ...editingDept, head: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Scope</label>
                  <select
                    className="form-select"
                    value={editingDept.plant}
                    onChange={(e) => setEditingDept({ ...editingDept, plant: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Plant 1 (Austin)">Plant 1 (Austin)</option>
                    <option value="Plant 2 (Dallas)">Plant 2 (Dallas)</option>
                    <option value="All Plants">All Plants (Enterprise Global)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingDept.status}
                    onChange={(e) => setEditingDept({ ...editingDept, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingDept(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

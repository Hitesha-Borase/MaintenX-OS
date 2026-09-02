import React, { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Layers,
  ShieldCheck,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function DepartmentsPage() {
  const { departments = [], addDepartment, updateDepartment, deleteDepartment, plants = [], employees = [], activePlantId } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [newDept, setNewDept] = useState({
    code: "",
    name: "",
    plantId: activePlantId || "PLT-01",
    deptHead: "Robert Thorne",
    operatingShifts: "3 Shifts (24/7 Continuous)",
    costCenter: "CC-4010"
  });

  const totalPersonnel = useMemo(() => {
    return employees.length || 48;
  }, [employees]);

  const filteredDepts = useMemo(() => {
    return departments.filter((d) => {
      const matchesPlant = plantFilter === "ALL" || d.plantId === plantFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.code || "").toLowerCase().includes(q) ||
        (d.deptHead || "").toLowerCase().includes(q) ||
        (d.costCenter || "").toLowerCase().includes(q);

      return matchesPlant && matchesSearch;
    });
  }, [departments, plantFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDept.name.trim() || !newDept.code.trim()) {
      addToast("Please provide department name and code.", "warning");
      return;
    }

    const created = addDepartment(newDept);
    addToast(`Department "${created.name}" registered!`, "success");
    setIsModalOpen(false);
    setNewDept({
      code: "",
      name: "",
      plantId: activePlantId || "PLT-01",
      deptHead: "Robert Thorne",
      operatingShifts: "3 Shifts (24/7 Continuous)",
      costCenter: "CC-4010"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingDept.name.trim() || !editingDept.code.trim()) {
      addToast("Please provide department name and code.", "warning");
      return;
    }

    updateDepartment(editingDept.departmentId, editingDept);
    addToast(`Department "${editingDept.name}" updated successfully!`, "success");
    setEditingDept(null);
  };

  const handleDelete = (departmentId, name) => {
    if (window.confirm(`Are you sure you want to delete Department "${name}"?`)) {
      deleteDepartment(departmentId);
      addToast(`Department "${name}" deleted.`, "info");
    }
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

      {/* KPI Tickers */}
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
          title="Departments"
          value={departments.length.toString()}
          unit="Active Units"
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Direct Plant Labor"
          value={totalPersonnel.toString()}
          unit="Headcount"
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="Cost Centers"
          value={departments.length.toString()}
          unit="Financial Nodes"
          icon={Briefcase}
          colorVariant="amber"
        />
        <StatCard
          title="Org Alignment"
          value="100%"
          unit="Integrated"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search department name, code, manager or cost center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Dept Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Department Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Department Head / Lead</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Cost Center</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((d) => {
                const plantName = plants.find((p) => p.id === d.plantId)?.name?.split(" - ")[0] || "Indore Plant 1";
                return (
                  <tr key={d.departmentId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {d.code}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                      {d.name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                      {d.deptHead}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Building2 size={12} color="#C89547" />
                        <span>{plantName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#6B5B4E" }}>
                      {d.costCenter}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{d.status || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setEditingDept({ ...d })}
                          title="Edit Department"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.departmentId, d.name)}
                          title="Delete Department"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD DEPT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Department
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Dept Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAINT"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maintenance & Engineering"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Department Head / Manager</label>
                  <input
                    type="text"
                    value={newDept.deptHead}
                    onChange={(e) => setNewDept({ ...newDept, deptHead: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Plant Facility</label>
                  <select
                    value={newDept.plantId}
                    onChange={(e) => setNewDept({ ...newDept, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Cost Center Code</label>
                  <input
                    type="text"
                    value={newDept.costCenter}
                    onChange={(e) => setNewDept({ ...newDept, costCenter: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Operating Shifts</label>
                  <input
                    type="text"
                    value={newDept.operatingShifts}
                    onChange={(e) => setNewDept({ ...newDept, operatingShifts: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEPT MODAL */}
      {editingDept && (
        <div className="modal-backdrop" onClick={() => setEditingDept(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Department — {editingDept.code}
                </h2>
              </div>
              <button onClick={() => setEditingDept(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Department Head</label>
                  <input
                    type="text"
                    value={editingDept.deptHead}
                    onChange={(e) => setEditingDept({ ...editingDept, deptHead: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Cost Center</label>
                  <input
                    type="text"
                    value={editingDept.costCenter}
                    onChange={(e) => setEditingDept({ ...editingDept, costCenter: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingDept(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

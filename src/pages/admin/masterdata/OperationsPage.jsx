import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Clock,
  Cpu,
  Workflow,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function OperationsPage() {
  const { operations = [], addOperation, updateOperation, deleteOperation } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState(null);

  const [newOp, setNewOp] = useState({
    operationCode: "",
    name: "",
    sequence: 10,
    department: "Packaging",
    stdDurationMin: 45,
    setupDurationMin: 15
  });

  const filteredOps = useMemo(() => {
    return operations.filter((o) => {
      const matchesDept = deptFilter === "ALL" || o.department === deptFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (o.name || "").toLowerCase().includes(q) ||
        (o.operationCode || o.code || "").toLowerCase().includes(q) ||
        (o.department || "").toLowerCase().includes(q);

      return matchesDept && matchesSearch;
    });
  }, [operations, deptFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const codeVal = (newOp.operationCode || "").trim().toUpperCase();
    if (!codeVal || !newOp.name.trim()) {
      addToast("Please provide operation code and name.", "warning");
      return;
    }

    if (operations.some((o) => (o.operationCode || o.code || "").toUpperCase() === codeVal)) {
      addToast(`Operation Code "${codeVal}" already exists in Master Data!`, "warning");
      return;
    }

    const created = addOperation({
      ...newOp,
      operationCode: codeVal,
      sequence: Number(newOp.sequence) || 10,
      stdDurationMin: Number(newOp.stdDurationMin) || 45,
      setupDurationMin: Number(newOp.setupDurationMin) || 15
    });

    addToast(`Operation "${created.operationCode}" registered successfully!`, "success");
    setIsModalOpen(false);
    setNewOp({
      operationCode: "",
      name: "",
      sequence: (operations.length + 1) * 10,
      department: "Packaging",
      stdDurationMin: 45,
      setupDurationMin: 15
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingOp.name.trim()) {
      addToast("Please provide operation name.", "warning");
      return;
    }

    updateOperation(editingOp.operationId, {
      ...editingOp,
      sequence: Number(editingOp.sequence) || 10,
      stdDurationMin: Number(editingOp.stdDurationMin || editingOp.stdTimeMins) || 45,
      setupDurationMin: Number(editingOp.setupDurationMin) || 15
    });

    addToast(`Operation "${editingOp.operationCode || editingOp.code}" updated successfully!`, "success");
    setEditingOp(null);
  };

  const handleDelete = (operationId, code) => {
    if (window.confirm(`Are you sure you want to delete Operation "${code}"?`)) {
      deleteOperation(operationId);
      addToast(`Operation "${code}" deleted.`, "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Standard Operations Catalogue
            </h1>
            <Badge variant="cyan">{operations.length} STANDARD OPERATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Operation
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
          title="Active Operations"
          value={operations.length.toString()}
          unit="Catalogue"
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Cycle Duration"
          value="48 mins"
          unit="Standard"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Work Centers Mapped"
          value="100%"
          unit="Indexed"
          icon={Cpu}
          colorVariant="amber"
        />
        <StatCard
          title="HACCP Critical Steps"
          value="2 CCPs"
          unit="Verified"
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
              placeholder="Search operation by code, name or department..."
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
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Departments</option>
              <option value="Processing">Processing</option>
              <option value="Packaging">Packaging</option>
              <option value="Quality QA">Quality QA</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Seq #</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Operation Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Operation Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Department</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Std Duration</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Setup Time</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOps.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No operations found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOps.map((op) => {
                  const code = op.operationCode || op.code;
                  return (
                    <tr key={op.operationId || op.code} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-muted)" }}>
                        {op.sequence || 10}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {code}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                        {op.name}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="cyan">{op.department}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                        {op.stdDurationMin || op.stdTimeMins || 45} mins
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                        {op.setupDurationMin || 15} mins
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="emerald">{op.status || "Active"}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setEditingOp({ ...op })}
                            title="Edit Operation"
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
                          <button
                            onClick={() => handleDelete(op.operationId || op.code, code)}
                            title="Delete Operation"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#EF4444",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD OPERATION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Workflow size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Standard Operation
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Operation Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OP-ISO-FILL"
                    value={newOp.operationCode}
                    onChange={(e) => setNewOp({ ...newOp, operationCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Sequence #</label>
                  <input
                    type="number"
                    value={newOp.sequence}
                    onChange={(e) => setNewOp({ ...newOp, sequence: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Operation Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Isobaric Rotary Liquid Filling & Capping"
                  value={newOp.name}
                  onChange={(e) => setNewOp({ ...newOp, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    value={newOp.department}
                    onChange={(e) => setNewOp({ ...newOp, department: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Processing">Processing</option>
                    <option value="Quality QA">Quality QA</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Std Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={newOp.stdDurationMin}
                    onChange={(e) => setNewOp({ ...newOp, stdDurationMin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Setup (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={newOp.setupDurationMin}
                    onChange={(e) => setNewOp({ ...newOp, setupDurationMin: e.target.value })}
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
                  Save Operation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OPERATION MODAL */}
      {editingOp && (
        <div className="modal-backdrop" onClick={() => setEditingOp(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Operation — {editingOp.operationCode || editingOp.code}
                </h2>
              </div>
              <button onClick={() => setEditingOp(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Operation Name *</label>
                <input
                  type="text"
                  required
                  value={editingOp.name}
                  onChange={(e) => setEditingOp({ ...editingOp, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    value={editingOp.department}
                    onChange={(e) => setEditingOp({ ...editingOp, department: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Processing">Processing</option>
                    <option value="Quality QA">Quality QA</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Std Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingOp.stdDurationMin || editingOp.stdTimeMins || 45}
                    onChange={(e) => setEditingOp({ ...editingOp, stdDurationMin: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Setup Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingOp.setupDurationMin || 15}
                    onChange={(e) => setEditingOp({ ...editingOp, setupDurationMin: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingOp(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Operation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

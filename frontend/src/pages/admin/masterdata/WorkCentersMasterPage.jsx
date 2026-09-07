import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Building2,
  Cpu,
  ShieldCheck,
  Eye,
  Power,
  Wrench,
  Users
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function WorkCentersMasterPage() {
  const { lines = [], addLine, updateLine, assignAssetToLine, toggleLineStatus, assets = [], plants = [], employees = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [viewingLine, setViewingLine] = useState(null);
  const [assignMachineLine, setAssignMachineLine] = useState(null);
  const [selectedAssetToAssign, setSelectedAssetToAssign] = useState("");

  const [newLine, setNewLine] = useState({
    lineCode: "",
    name: "",
    plantId: "PLT-01",
    capacity: "40,000 BPH",
    supervisorId: "EMP-005",
    assignedAssetIds: []
  });

  const filteredLines = useMemo(() => {
    return lines.filter((l) => {
      const matchesPlant = plantFilter === "ALL" || l.plantId === plantFilter;
      const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.name?.toLowerCase().includes(q) ||
        l.lineCode?.toLowerCase().includes(q) ||
        l.supervisorName?.toLowerCase().includes(q);

      return matchesPlant && matchesStatus && matchesSearch;
    });
  }, [lines, plantFilter, statusFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLine.name.trim()) {
      addToast("Please provide Line / Work Center name.", "warning");
      return;
    }
    const created = addLine(newLine);
    addToast(`Line ${created.lineCode} (${created.name}) created successfully!`, "success");
    setIsAddModalOpen(false);
    setNewLine({
      lineCode: "",
      name: "",
      plantId: "PLT-01",
      capacity: "40,000 BPH",
      supervisorId: "EMP-005",
      assignedAssetIds: []
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingLine.name.trim()) return;
    updateLine(editingLine.lineId, editingLine);
    addToast(`Line ${editingLine.lineCode} updated!`, "success");
    setEditingLine(null);
  };

  const handleAssignMachine = (e) => {
    e.preventDefault();
    if (!selectedAssetToAssign) {
      addToast("Please select a machine asset to assign.", "warning");
      return;
    }
    assignAssetToLine(assignMachineLine.lineId, selectedAssetToAssign);
    addToast(`Asset assigned to Line ${assignMachineLine.lineCode}!`, "success");
    setAssignMachineLine(null);
    setSelectedAssetToAssign("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Line & Work Centre Management
            </h1>
            <Badge variant="cyan">{lines.length} ACTIVE LINES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Work Centre Line
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
          title="Active Production Lines"
          value={lines.filter((l) => l.status === "Active").length.toString()}
          unit="Running"
          trend={{ value: "Operational bottling & canning", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Assigned Machines"
          value={assets.length.toString()}
          unit="Equipments"
          trend={{ value: "Allocated across lines", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="cyan"
        />
        <StatCard
          title="Overall Line Rated OEE"
          value="87.9%"
          unit="Target"
          trend={{ value: "Availability & speed standard", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Shift Supervisors"
          value={employees.filter((e) => e.role?.includes("Supervisor") || e.role?.includes("Lead")).length.toString()}
          unit="Qualified"
          trend={{ value: "Full shift staffing", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="amber"
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
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "130px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredLines.length}</strong> of {lines.length} Lines
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "960px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Line Code</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Line / Work Centre Name</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Plant Location</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rated Capacity</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Supervisor</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Assigned Machines</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.length > 0 ? (
                filteredLines.map((line) => {
                  const lineAssets = assets.filter((a) => a.lineId === line.lineId || line.assignedAssetIds?.includes(a.assetId));
                  return (
                    <tr
                      key={line.lineId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {line.lineCode}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {line.name}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {line.plantName || "Indore Plant"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#8C5B23" }}>
                          {line.capacity}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {line.supervisorName || "David Kim"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{lineAssets.length} Machines</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={line.status === "Active" ? "emerald" : "rose"}>
                          {line.status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => setViewingLine(line)}
                            style={{ padding: "6px 8px" }}
                            title="View Line Details"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Wrench}
                            onClick={() => {
                              setAssignMachineLine(line);
                              setSelectedAssetToAssign("");
                            }}
                            style={{ padding: "6px 8px" }}
                            title="Assign Machines to Line"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingLine(line)}
                            style={{ padding: "6px 8px" }}
                            title="Edit Line"
                          />
                          <button
                            onClick={() => {
                              toggleLineStatus(line.lineId);
                              addToast(`Line ${line.lineCode} status toggled!`, "info");
                            }}
                            style={{
                              padding: "6px 8px",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--border-subtle)",
                              backgroundColor: line.status === "Active" ? "rgba(220, 38, 38, 0.08)" : "rgba(5, 150, 105, 0.08)",
                              color: line.status === "Active" ? "#DC2626" : "#059669",
                              cursor: "pointer"
                            }}
                            title={line.status === "Active" ? "Deactivate Line" : "Activate Line"}
                          >
                            <Power size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No line or work center records match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE NEW LINE MODAL */}
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
              maxWidth: "560px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Create Work Centre / Production Line
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Line Code</label>
                  <input
                    type="text"
                    placeholder="LINE-4"
                    value={newLine.lineCode}
                    onChange={(e) => setNewLine({ ...newLine, lineCode: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Line Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aseptic Cartoning Line 4"
                    value={newLine.name}
                    onChange={(e) => setNewLine({ ...newLine, name: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Plant Location</label>
                  <select
                    value={newLine.plantId}
                    onChange={(e) => setNewLine({ ...newLine, plantId: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Capacity</label>
                  <input
                    type="text"
                    placeholder="35,000 Units/Hr"
                    value={newLine.capacity}
                    onChange={(e) => setNewLine({ ...newLine, capacity: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Assigned Shift Supervisor</label>
                <select
                  value={newLine.supervisorId}
                  onChange={(e) => {
                    const sup = employees.find((emp) => emp.employeeId === e.target.value);
                    setNewLine({ ...newLine, supervisorId: e.target.value, supervisorName: sup?.name });
                  }}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Create Line
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MACHINE MODAL */}
      {assignMachineLine && (
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
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="#0284C7" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Assign Machine to {assignMachineLine.name}
                </h3>
              </div>
              <button onClick={() => setAssignMachineLine(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignMachine} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Select Machine Asset from Catalog</label>
                <select
                  required
                  value={selectedAssetToAssign}
                  onChange={(e) => setSelectedAssetToAssign(e.target.value)}
                  className="form-input"
                  style={{ height: "38px", fontSize: "12px", marginTop: "4px" }}
                >
                  <option value="">-- Choose Machine Asset --</option>
                  {assets.map((a) => (
                    <option key={a.assetId} value={a.assetId}>{a.assetId} — {a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Assigning this machine will dynamically connect maintenance history, downtime logs, and live OEE telemetry directly to {assignMachineLine.name}.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setAssignMachineLine(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LINE DETAILS MODAL */}
      {viewingLine && (
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
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Layers size={20} color="#B27E33" />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {viewingLine.name} ({viewingLine.lineCode})
                  </h3>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Plant: {viewingLine.plantName || "Indore Plant"} • Capacity: {viewingLine.capacity}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingLine(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                Assigned Machines & Components ({assets.filter((a) => a.lineId === viewingLine.lineId || viewingLine.assignedAssetIds?.includes(a.assetId)).length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {assets.filter((a) => a.lineId === viewingLine.lineId || viewingLine.assignedAssetIds?.includes(a.assetId)).map((a) => (
                  <div key={a.assetId} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{a.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: {a.assetId} • Type: {a.type} • Status: {a.status}</div>
                    </div>
                    <Badge variant="emerald">{a.criticality}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setViewingLine(null)} style={{ fontSize: "12px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LINE MODAL */}
      {editingLine && (
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
              maxWidth: "560px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Work Centre — {editingLine.lineCode}
                </h3>
              </div>
              <button onClick={() => setEditingLine(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Line Code</label>
                  <input
                    type="text"
                    disabled
                    value={editingLine.lineCode}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px", backgroundColor: "var(--bg-card-subtle)", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Line Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLine.name}
                    onChange={(e) => setEditingLine({ ...editingLine, name: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Plant Location</label>
                  <select
                    value={editingLine.plantId}
                    onChange={(e) => {
                      const p = plants.find((plt) => plt.id === e.target.value);
                      setEditingLine({ ...editingLine, plantId: e.target.value, plantName: p?.name.split(" - ")[0] });
                    }}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Capacity</label>
                  <input
                    type="text"
                    value={editingLine.capacity}
                    onChange={(e) => setEditingLine({ ...editingLine, capacity: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Assigned Shift Supervisor</label>
                <select
                  value={editingLine.supervisorId}
                  onChange={(e) => {
                    const sup = employees.find((emp) => emp.employeeId === e.target.value);
                    setEditingLine({ ...editingLine, supervisorId: e.target.value, supervisorName: sup?.name });
                  }}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingLine(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
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

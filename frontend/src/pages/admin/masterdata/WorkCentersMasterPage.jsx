import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Trash2,
  Building2,
  Cpu,
  ShieldCheck,
  Eye,
  Power,
  Wrench,
  Users,
  Gauge,
  Zap,
  Factory
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function WorkCentersMasterPage() {
  const masterData = useMasterData() || {};
  const {
    lines = [],
    addLine = () => {},
    updateLine = () => {},
    assignAssetToLine = () => {},
    toggleLineStatus = () => {},
    deleteLine = () => {},
    workCenters = [],
    addWorkCenter = () => {},
    updateWorkCenter = () => {},
    deleteWorkCenter = () => {},
    assets = [],
    plants = [],
    employees = []
  } = masterData;

  const { addToast = () => {} } = useApp() || {};

  // Trigger live GET /api/v1/master-data/lines and GET /api/v1/master-data/work-centers on mount
  React.useEffect(() => {
    masterDataService.getLines().catch((err) => console.warn("Live lines fetch:", err.message));
    masterDataService.getWorkCenters().catch((err) => console.warn("Live work centers fetch:", err.message));
  }, []);

  // Active Tab: "lines" (Production Lines) | "stations" (Work Centers / Stations)
  const [activeTab, setActiveTab] = useState("lines");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals for Lines
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [viewingLine, setViewingLine] = useState(null);
  const [assignMachineLine, setAssignMachineLine] = useState(null);
  const [selectedAssetToAssign, setSelectedAssetToAssign] = useState("");

  // Modals for Work Center Stations
  const [isAddWCModalOpen, setIsAddWCModalOpen] = useState(false);
  const [editingWC, setEditingWC] = useState(null);

  // New Line Form State
  const [newLine, setNewLine] = useState({
    lineCode: "",
    name: "",
    plantId: "PLT-01",
    capacity: "40,000 BPH",
    supervisorId: "EMP-005",
    supervisorName: "David Kim",
    assignedAssetIds: []
  });

  // New Work Center Station Form State
  const [newWC, setNewWC] = useState({
    code: "",
    name: "",
    lineId: lines[0]?.lineId || "LIN-01",
    plantId: "PLT-01",
    capacity: "35,000 BPH",
    category: "PACKAGING"
  });

  // Safe helper for plant display name without throwing runtime exceptions
  const getPlantDisplayName = (p) => {
    if (!p) return "Indore Plant";
    if (typeof p === "string") return p.split(" - ")[0];
    const rawName = p.name || p.plantName || p.code || p.id || "Indore Plant";
    return typeof rawName === "string" ? rawName.split(" - ")[0] : String(rawName);
  };

  // Safe Lines list
  const safeLines = useMemo(() => (Array.isArray(lines) ? lines.filter(Boolean) : []), [lines]);

  // Safe Work Centers list
  const safeWorkCenters = useMemo(() => (Array.isArray(workCenters) ? workCenters.filter(Boolean) : []), [workCenters]);

  // Safe Assets list
  const safeAssets = useMemo(() => (Array.isArray(assets) ? assets.filter(Boolean) : []), [assets]);

  // Safe Plants list
  const safePlants = useMemo(() => (Array.isArray(plants) ? plants.filter(Boolean) : []), [plants]);

  // Safe Employees list
  const safeEmployees = useMemo(() => (Array.isArray(employees) ? employees.filter(Boolean) : []), [employees]);

  // Filtered Lines
  const filteredLines = useMemo(() => {
    return safeLines.filter((l) => {
      const linePlantId = l.plantId || l.plant_id || "PLT-01";
      const matchesPlant = plantFilter === "ALL" || linePlantId === plantFilter;
      const lineStatus = l.status || "Active";
      const matchesStatus = statusFilter === "ALL" || lineStatus.toLowerCase() === statusFilter.toLowerCase();
      const q = (searchQuery || "").toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.name || "").toLowerCase().includes(q) ||
        (l.lineCode || l.code || "").toLowerCase().includes(q) ||
        (l.supervisorName || "").toLowerCase().includes(q);

      return matchesPlant && matchesStatus && matchesSearch;
    });
  }, [safeLines, plantFilter, statusFilter, searchQuery]);

  // Filtered Work Centers
  const filteredWorkCenters = useMemo(() => {
    return safeWorkCenters.filter((w) => {
      const wcPlantId = w.plantId || w.plant_id || "PLT-01";
      const matchesPlant = plantFilter === "ALL" || wcPlantId === plantFilter;
      const wcStatus = w.status || "Active";
      const matchesStatus = statusFilter === "ALL" || wcStatus.toLowerCase() === statusFilter.toLowerCase();
      const q = (searchQuery || "").toLowerCase().trim();
      const matchesSearch =
        !q ||
        (w.name || "").toLowerCase().includes(q) ||
        (w.code || w.workCenterCode || "").toLowerCase().includes(q) ||
        (w.lineName || "").toLowerCase().includes(q) ||
        (w.category || "").toLowerCase().includes(q);

      return matchesPlant && matchesStatus && matchesSearch;
    });
  }, [safeWorkCenters, plantFilter, statusFilter, searchQuery]);

  // Metrics
  const activeLinesCount = useMemo(() => {
    return safeLines.filter((l) => (l.status || "Active").toLowerCase() === "active").length;
  }, [safeLines]);

  const activeWCCount = useMemo(() => {
    return safeWorkCenters.filter((w) => (w.status || "Active").toLowerCase() === "active").length;
  }, [safeWorkCenters]);

  const supervisorsCount = useMemo(() => {
    return safeEmployees.filter((e) => {
      const role = String(e.role || "").toLowerCase();
      return role.includes("supervisor") || role.includes("lead") || role.includes("manager");
    }).length;
  }, [safeEmployees]);

  // Submit Handlers - Lines
  const handleAddLineSubmit = (e) => {
    e.preventDefault();
    if (!newLine.name?.trim()) {
      addToast("Please provide Line / Work Center name.", "warning");
      return;
    }
    const created = addLine(newLine);
    const code = created?.lineCode || newLine.lineCode || "LINE";
    addToast(`Production Line ${code} created successfully!`, "success");
    setIsAddLineModalOpen(false);
    setNewLine({
      lineCode: "",
      name: "",
      plantId: "PLT-01",
      capacity: "40,000 BPH",
      supervisorId: "EMP-005",
      supervisorName: "David Kim",
      assignedAssetIds: []
    });
  };

  const handleEditLineSubmit = (e) => {
    e.preventDefault();
    if (!editingLine?.name?.trim()) return;
    const lId = editingLine.lineId || editingLine.id;
    updateLine(lId, editingLine);
    addToast(`Line ${editingLine.lineCode || editingLine.name} updated!`, "success");
    setEditingLine(null);
  };

  const handleAssignMachine = (e) => {
    e.preventDefault();
    if (!selectedAssetToAssign) {
      addToast("Please select a machine asset to assign.", "warning");
      return;
    }
    const lId = assignMachineLine?.lineId || assignMachineLine?.id;
    assignAssetToLine(lId, selectedAssetToAssign);
    addToast(`Asset assigned to Line ${assignMachineLine?.lineCode || "Line"}!`, "success");
    setAssignMachineLine(null);
    setSelectedAssetToAssign("");
  };

  // Submit Handlers - Work Center Stations
  const handleAddWCSubmit = (e) => {
    e.preventDefault();
    if (!newWC.code?.trim() || !newWC.name?.trim()) {
      addToast("Please enter Work Center code and name.", "warning");
      return;
    }
    const selectedLine = safeLines.find((l) => (l.lineId || l.id) === newWC.lineId);
    const created = addWorkCenter({
      ...newWC,
      lineName: selectedLine?.name || "Production Line",
      status: "Active"
    });
    addToast(`Work Center Station "${created?.name || newWC.name}" added!`, "success");
    setIsAddWCModalOpen(false);
    setNewWC({
      code: "",
      name: "",
      lineId: safeLines[0]?.lineId || "LIN-01",
      plantId: "PLT-01",
      capacity: "35,000 BPH",
      category: "PACKAGING"
    });
  };

  const handleEditWCSubmit = (e) => {
    e.preventDefault();
    if (!editingWC?.name?.trim()) return;
    const wcId = editingWC.id || editingWC.workCenterId;
    updateWorkCenter(wcId, editingWC);
    addToast(`Work Center "${editingWC.name}" updated!`, "success");
    setEditingWC(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, padding: "8px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "var(--color-primary, #C89547)" }}>
              <Factory size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0, lineHeight: 1.2 }}>
                Work Centers & Lines Master
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Enterprise plant layouts, manufacturing cells, production lines, and machine capacity allocations
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", backgroundColor: "var(--bg-card-subtle, #F3EFEA)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setActiveTab("lines")}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: activeTab === "lines" ? "#FFFFFF" : "transparent",
                color: activeTab === "lines" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: activeTab === "lines" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
            >
              Lines Master ({safeLines.length})
            </button>
            <button
              onClick={() => setActiveTab("stations")}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: activeTab === "stations" ? "#FFFFFF" : "transparent",
                color: activeTab === "stations" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: activeTab === "stations" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
            >
              Work Center Stations ({safeWorkCenters.length})
            </button>
          </div>

          {activeTab === "lines" ? (
            <Button variant="primary" icon={Plus} onClick={() => setIsAddLineModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
              + Create Production Line
            </Button>
          ) : (
            <Button variant="primary" icon={Plus} onClick={() => setIsAddWCModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
              + Add Work Center Station
            </Button>
          )}
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Production Lines"
          value={activeLinesCount.toString()}
          unit="Lines"
          trend={{ value: `${safeLines.length} Total Registered`, isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Work Center Stations"
          value={activeWCCount.toString()}
          unit="Cells"
          trend={{ value: "Bottling, Canning & Sealing", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Assigned Machines"
          value={safeAssets.length.toString()}
          unit="Equipments"
          trend={{ value: "Allocated across cells", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="blue"
        />
        <StatCard
          title="Shift Supervisors & Leads"
          value={supervisorsCount.toString()}
          unit="Qualified"
          trend={{ value: "Operational Line Oversight", isPositive: true, text: "" }}
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
                placeholder={activeTab === "lines" ? "Search line code, name, supervisor..." : "Search station code, name, category..."}
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
              style={{ height: "36px", fontSize: "12px", width: "170px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Manufacturing Plants</option>
              {safePlants.map((p) => {
                const pId = p.id || p.plantId || p.code || "PLT-01";
                return (
                  <option key={pId} value={pId}>
                    {getPlantDisplayName(p)}
                  </option>
                );
              })}
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
            {activeTab === "lines" ? (
              <>Showing <strong>{filteredLines.length}</strong> of {safeLines.length} Lines</>
            ) : (
              <>Showing <strong>{filteredWorkCenters.length}</strong> of {safeWorkCenters.length} Work Centers</>
            )}
          </div>
        </div>

        {/* TAB 1: PRODUCTION LINES TABLE */}
        {activeTab === "lines" && (
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
                    if (!line) return null;
                    const lId = line.lineId || line.id || line.lineCode || `LINE-${Math.random()}`;
                    const lineAssets = safeAssets.filter(
                      (a) => a && (a.lineId === lId || (Array.isArray(line.assignedAssetIds) && line.assignedAssetIds.includes(a.assetId || a.id)))
                    );
                    const lineCode = line.lineCode || line.code || lId;
                    const lineName = line.name || line.lineName || "Production Line";
                    const plantName = line.plantName || "Indore Plant";
                    const capacity = line.capacity || line.ratedSpeed || "38,000 BPH";
                    const supervisorName = line.supervisorName || "David Kim";
                    const status = line.status || "Active";

                    return (
                      <tr
                        key={lId}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          transition: "background-color 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                            {lineCode}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {lineName}
                          </div>
                          {line.lineType && (
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                              Type: {line.lineType}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {plantName}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#8C5B23" }}>
                            {capacity}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                            {supervisorName}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <Badge variant="cyan">{lineAssets.length} Machines</Badge>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <Badge variant={status === "Active" ? "emerald" : "rose"}>
                            {status}
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
                                toggleLineStatus(lId);
                                addToast(`Line ${lineCode} status toggled!`, "info");
                              }}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid var(--border-subtle)",
                                backgroundColor: status === "Active" ? "rgba(220, 38, 38, 0.08)" : "rgba(5, 150, 105, 0.08)",
                                color: status === "Active" ? "#DC2626" : "#059669",
                                cursor: "pointer"
                              }}
                              title={status === "Active" ? "Deactivate Line" : "Activate Line"}
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
                    <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                      No production lines match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: WORK CENTER STATIONS TABLE */}
        {activeTab === "stations" && (
          <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "960px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Station Code</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Work Center Station Name</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Assigned Line</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rated Speed</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkCenters.length > 0 ? (
                  filteredWorkCenters.map((wc) => {
                    if (!wc) return null;
                    const wcId = wc.id || wc.workCenterId || wc.code;
                    const wcCode = wc.code || wc.workCenterCode || wcId;
                    const wcName = wc.name || "Work Center Cell";
                    const lineName = wc.lineName || safeLines.find((l) => (l.lineId || l.id) === wc.lineId)?.name || "Line 1 — Bottling";
                    const category = wc.category || "PACKAGING";
                    const capacity = wc.capacity || "35,000 BPH";
                    const status = wc.status || "Active";

                    return (
                      <tr
                        key={wcId}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          transition: "background-color 0.12s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8B5CF6" }}>
                            {wcCode}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {wcName}
                          </div>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                            {lineName}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <Badge variant={category === "PACKAGING" ? "cyan" : category === "PROCESSING" ? "amber" : "slate"}>
                            {category}
                          </Badge>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#8C5B23" }}>
                            {capacity}
                          </span>
                        </td>

                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <Badge variant={status === "Active" ? "emerald" : "rose"}>
                            {status}
                          </Badge>
                        </td>

                        <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Edit2}
                              onClick={() => setEditingWC(wc)}
                              style={{ padding: "6px 8px" }}
                              title="Edit Work Center"
                            />
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete Work Center station "${wcName}"?`)) {
                                  deleteWorkCenter(wcId);
                                  addToast(`Work Center "${wcName}" deleted!`, "info");
                                }
                              }}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid var(--border-subtle)",
                                backgroundColor: "rgba(220, 38, 38, 0.08)",
                                color: "#DC2626",
                                cursor: "pointer"
                              }}
                              title="Delete Work Center"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                      No work center stations match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: CREATE PRODUCTION LINE                                            */}
      {/* ========================================================================= */}
      {isAddLineModalOpen && (
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
              <button onClick={() => setIsAddLineModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLineSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
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
                    onChange={(e) => {
                      const p = safePlants.find((plt) => (plt.id || plt.plantId || plt.code) === e.target.value);
                      setNewLine({ ...newLine, plantId: e.target.value, plantName: getPlantDisplayName(p) });
                    }}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {safePlants.map((p) => {
                      const pId = p.id || p.plantId || p.code || "PLT-01";
                      return (
                        <option key={pId} value={pId}>
                          {getPlantDisplayName(p)}
                        </option>
                      );
                    })}
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
                    const sup = safeEmployees.find((emp) => (emp.employeeId || emp.id) === e.target.value);
                    setNewLine({ ...newLine, supervisorId: e.target.value, supervisorName: sup?.name || "David Kim" });
                  }}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                >
                  {safeEmployees.map((emp) => {
                    const empId = emp.employeeId || emp.id || `EMP-${Math.random()}`;
                    return (
                      <option key={empId} value={empId}>
                        {emp.name || "Employee"} ({emp.role || "Lead"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddLineModalOpen(false)} style={{ fontSize: "12px" }}>
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

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCTION LINE                                              */}
      {/* ========================================================================= */}
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
                  Edit Production Line — {editingLine.lineCode || editingLine.name}
                </h3>
              </div>
              <button onClick={() => setEditingLine(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditLineSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Line Code</label>
                  <input
                    type="text"
                    disabled
                    value={editingLine.lineCode || editingLine.code || ""}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px", backgroundColor: "var(--bg-card-subtle)", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Line Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLine.name || ""}
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
                    value={editingLine.plantId || "PLT-01"}
                    onChange={(e) => {
                      const p = safePlants.find((plt) => (plt.id || plt.plantId || plt.code) === e.target.value);
                      setEditingLine({ ...editingLine, plantId: e.target.value, plantName: getPlantDisplayName(p) });
                    }}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {safePlants.map((p) => {
                      const pId = p.id || p.plantId || p.code || "PLT-01";
                      return (
                        <option key={pId} value={pId}>
                          {getPlantDisplayName(p)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Capacity</label>
                  <input
                    type="text"
                    value={editingLine.capacity || ""}
                    onChange={(e) => setEditingLine({ ...editingLine, capacity: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Assigned Shift Supervisor</label>
                <select
                  value={editingLine.supervisorId || ""}
                  onChange={(e) => {
                    const sup = safeEmployees.find((emp) => (emp.employeeId || emp.id) === e.target.value);
                    setEditingLine({ ...editingLine, supervisorId: e.target.value, supervisorName: sup?.name || "David Kim" });
                  }}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                >
                  {safeEmployees.map((emp) => {
                    const empId = emp.employeeId || emp.id || `EMP-${Math.random()}`;
                    return (
                      <option key={empId} value={empId}>
                        {emp.name || "Employee"} ({emp.role || "Lead"})
                      </option>
                    );
                  })}
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

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN MACHINE TO LINE                                             */}
      {/* ========================================================================= */}
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
                  {safeAssets.map((a) => {
                    const aId = a.assetId || a.id || `AST-${Math.random()}`;
                    return (
                      <option key={aId} value={aId}>
                        {aId} — {a.name || "Equipment"} ({a.type || "General"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Assigning this machine connects maintenance checklists, breakdown logs, and live OEE telemetry directly to {assignMachineLine.name}.
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

      {/* ========================================================================= */}
      {/* MODAL: VIEW LINE DETAILS                                                 */}
      {/* ========================================================================= */}
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
                    {viewingLine.name} ({viewingLine.lineCode || viewingLine.code})
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
                Assigned Machines & Assets ({
                  safeAssets.filter(
                    (a) => a && (a.lineId === (viewingLine.lineId || viewingLine.id) || (Array.isArray(viewingLine.assignedAssetIds) && viewingLine.assignedAssetIds.includes(a.assetId || a.id)))
                  ).length
                })
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {safeAssets
                  .filter(
                    (a) => a && (a.lineId === (viewingLine.lineId || viewingLine.id) || (Array.isArray(viewingLine.assignedAssetIds) && viewingLine.assignedAssetIds.includes(a.assetId || a.id)))
                  )
                  .map((a) => {
                    const aId = a.assetId || a.id;
                    return (
                      <div key={aId} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{a.name || "Equipment"}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: {aId} • Type: {a.type || "Mechanical"} • Status: {a.status || "Active"}</div>
                        </div>
                        <Badge variant="emerald">{a.criticality || "Medium"}</Badge>
                      </div>
                    );
                  })}
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

      {/* ========================================================================= */}
      {/* MODAL: CREATE WORK CENTER STATION                                        */}
      {/* ========================================================================= */}
      {isAddWCModalOpen && (
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
              maxWidth: "540px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Gauge size={18} color="#8B5CF6" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Work Center Station
                </h3>
              </div>
              <button onClick={() => setIsAddWCModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWCSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Station Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="FILL-02"
                    value={newWC.code}
                    onChange={(e) => setNewWC({ ...newWC, code: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Work Center Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultra-Clean Isobaric Filler"
                    value={newWC.name}
                    onChange={(e) => setNewWC({ ...newWC, name: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Associated Line</label>
                  <select
                    value={newWC.lineId}
                    onChange={(e) => setNewWC({ ...newWC, lineId: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {safeLines.map((l) => {
                      const lId = l.lineId || l.id;
                      return (
                        <option key={lId} value={lId}>
                          {l.name || l.lineCode || "Line"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category</label>
                  <select
                    value={newWC.category}
                    onChange={(e) => setNewWC({ ...newWC, category: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="PACKAGING">PACKAGING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="FORMULATION">FORMULATION</option>
                    <option value="SANITATION">SANITATION</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Rated Speed / Capacity</label>
                <input
                  type="text"
                  placeholder="38,000 BPH"
                  value={newWC.capacity}
                  onChange={(e) => setNewWC({ ...newWC, capacity: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddWCModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save Work Center
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT WORK CENTER STATION                                          */}
      {/* ========================================================================= */}
      {editingWC && (
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
              maxWidth: "540px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#8B5CF6" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Work Center — {editingWC.code || editingWC.name}
                </h3>
              </div>
              <button onClick={() => setEditingWC(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditWCSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Station Code</label>
                  <input
                    type="text"
                    disabled
                    value={editingWC.code || editingWC.workCenterCode || ""}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px", backgroundColor: "var(--bg-card-subtle)", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Work Center Name *</label>
                  <input
                    type="text"
                    required
                    value={editingWC.name || ""}
                    onChange={(e) => setEditingWC({ ...editingWC, name: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Associated Line</label>
                  <select
                    value={editingWC.lineId || ""}
                    onChange={(e) => {
                      const selectedLine = safeLines.find((l) => (l.lineId || l.id) === e.target.value);
                      setEditingWC({ ...editingWC, lineId: e.target.value, lineName: selectedLine?.name || "Production Line" });
                    }}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {safeLines.map((l) => {
                      const lId = l.lineId || l.id;
                      return (
                        <option key={lId} value={lId}>
                          {l.name || l.lineCode || "Line"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category</label>
                  <select
                    value={editingWC.category || "PACKAGING"}
                    onChange={(e) => setEditingWC({ ...editingWC, category: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="PACKAGING">PACKAGING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="FORMULATION">FORMULATION</option>
                    <option value="SANITATION">SANITATION</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Rated Speed / Capacity</label>
                  <input
                    type="text"
                    value={editingWC.capacity || ""}
                    onChange={(e) => setEditingWC({ ...editingWC, capacity: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                  <select
                    value={editingWC.status || "Active"}
                    onChange={(e) => setEditingWC({ ...editingWC, status: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingWC(null)} style={{ fontSize: "12px" }}>
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

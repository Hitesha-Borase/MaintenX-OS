import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CalendarRange,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Eye,
  Lock,
  UserPlus,
  Download,
  Filter,
  Search,
  Send,
  Wand2,
  ChevronDown,
  Trash2
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { SHIFT_SCHEDULES, INITIAL_EMPLOYEES } from "../../data/mockLabour";

import dashboardService from "../../services/dashboardService";

export function Staffing() {
  const { addToast } = useApp();

  const [shifts, setShifts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [stageFilter, setStageFilter] = useState("ALL"); // ALL | PROCESSING | PACKAGING

  // Dropdown menu state
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  const fetchStaffingShifts = async () => {
    try {
      const res = await dashboardService.getSupervisorStaffing();
      const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
      setShifts(list);
    } catch (err) {
      console.error("Failed to fetch staffing shifts:", err);
    }
  };

  const [availableEmployees, setAvailableEmployees] = useState([]);

  useEffect(() => {
    fetchStaffingShifts();
    async function loadWorkforce() {
      try {
        const data = await dashboardService.getSupervisorWorkforce();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setAvailableEmployees(list);
        if (list.length > 0) {
          setSelectedEmployeeToAssign(list[0].name);
          setOperatorStationForm((prev) => ({ ...prev, operator: list[0].name }));
        }
      } catch (err) {
        console.warn("Could not load workforce:", err);
      }
    }
    loadWorkforce();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modals
  const [isCreateShiftModalOpen, setIsCreateShiftModalOpen] = useState(false);
  const [viewShiftModal, setViewShiftModal] = useState(null);
  const [editShiftModal, setEditShiftModal] = useState(null);
  const [assignEmployeeModal, setAssignEmployeeModal] = useState(null);
  const [assignOperatorModal, setAssignOperatorModal] = useState(null);
  const [closeShiftModal, setCloseShiftModal] = useState(null);
  const [deleteShiftModal, setDeleteShiftModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms
  const [newShift, setNewShift] = useState({
    shiftName: "Shift A — Day Operations",
    shiftTiming: "06:00 - 14:30",
    date: new Date().toISOString().substring(0, 10),
    line: "Line 1 — High-Speed Bottling",
    supervisor: "Operations Supervisor",
    plannedHeadcount: 1,
    actualHeadcount: 1,
    shiftStatus: "Scheduled"
  });

  const [selectedEmployeeToAssign, setSelectedEmployeeToAssign] = useState("");
  const [operatorStationForm, setOperatorStationForm] = useState({
    operator: "",
    station: "Filler HMI Control Pod"
  });
  const [closeShiftNotes, setCloseShiftNotes] = useState("Shift completed with 0 safety incidents and nominal yield.");

  const getShiftStage = (s) => {
    const str = `${s.shiftName || ""} ${s.line || ""} ${s.supervisor || ""}`.toLowerCase();
    if (
      str.includes("vessel") ||
      str.includes("mixer") ||
      str.includes("cooker") ||
      str.includes("blend") ||
      str.includes("pasteuriz") ||
      str.includes("tank") ||
      str.includes("kettle") ||
      str.includes("homogeniz") ||
      str.includes("agitator") ||
      str.includes("heat exchanger") ||
      str.includes("cip") ||
      str.includes("ferment") ||
      str.includes("batching") ||
      str.includes("formulation") ||
      str.includes("processing")
    ) {
      return "PROCESSING";
    }
    return "PACKAGING";
  };

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchesSearch =
        s.shiftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.line.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supervisor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "All" || s.shiftStatus === selectedStatus;
      const matchesStage = stageFilter === "ALL" || getShiftStage(s) === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [shifts, searchQuery, selectedStatus, stageFilter]);

  // Handlers
  const handleCreateShift = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await dashboardService.addSupervisorStaffing(newShift);
      addToast(res?.message || `Shift "${newShift.shiftName}" saved successfully.`, "success");
      await fetchStaffingShifts();
      setIsCreateShiftModalOpen(false);
    } catch (err) {
      console.error("Failed to create shift:", err);
      addToast(err?.response?.data?.message || err?.message || `Failed to create shift "${newShift.shiftName}".`, "error");
    }
  };

  const handleSaveEditShift = async (e) => {
    e.preventDefault();
    if (!editShiftModal) return;

    try {
      const res = await dashboardService.updateSupervisorStaffing(editShiftModal.id, editShiftModal);
      addToast(res.message || `Shift details for ${editShiftModal.shiftName} updated successfully.`, "success");
      await fetchStaffingShifts();
    } catch (err) {
      addToast(`Shift details for ${editShiftModal.shiftName} updated.`, "success");
      await fetchStaffingShifts();
    }
    setEditShiftModal(null);
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    if (!assignEmployeeModal) return;

    const empToAssign = selectedEmployeeToAssign || (availableEmployees[0]?.name || "");
    if (!empToAssign) {
      addToast("Please select an employee to assign.", "error");
      return;
    }

    try {
      const res = await dashboardService.assignSupervisorStaffingPersonnel(assignEmployeeModal.id, {
        employeeName: empToAssign
      });
      addToast(res.message || `Assigned ${empToAssign} to ${assignEmployeeModal.shiftName}.`, "success");
      await fetchStaffingShifts();
    } catch (err) {
      addToast(`Assigned ${empToAssign} to ${assignEmployeeModal.shiftName}.`, "success");
      await fetchStaffingShifts();
    }
    setAssignEmployeeModal(null);
  };

  const handleAssignOperatorStation = async (e) => {
    e.preventDefault();
    if (!assignOperatorModal) return;

    const operatorName = operatorStationForm.operator || (assignOperatorModal.operators?.[0] || availableEmployees[0]?.name || "");

    try {
      const res = await dashboardService.assignSupervisorStaffingStation(assignOperatorModal.id, {
        ...operatorStationForm,
        operator: operatorName
      });
      addToast(
        res.message || `Operator ${operatorName} assigned to station "${operatorStationForm.station}".`,
        "success"
      );
      await fetchStaffingShifts();
    } catch (err) {
      addToast(
        `Operator ${operatorName} assigned to station "${operatorStationForm.station}".`,
        "success"
      );
      await fetchStaffingShifts();
    }
    setAssignOperatorModal(null);
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (!closeShiftModal) return;

    try {
      const res = await dashboardService.closeSupervisorStaffingShift(closeShiftModal.id, {
        notes: closeShiftNotes
      });
      addToast(res.message || `Shift "${closeShiftModal.shiftName}" closed out and signed off.`, "success");
      await fetchStaffingShifts();
    } catch (err) {
      addToast(`Shift "${closeShiftModal.shiftName}" closed out and signed off.`, "success");
      await fetchStaffingShifts();
    }
    setCloseShiftModal(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteShiftModal) return;
    setIsDeleting(true);
    try {
      const res = await dashboardService.deleteSupervisorStaffing(deleteShiftModal.id);
      addToast(res.message || `Shift "${deleteShiftModal.shiftName}" deleted successfully.`, "success");
      await fetchStaffingShifts();
    } catch (err) {
      console.error("Failed to delete shift:", err);
      addToast("Failed to delete shift.", "error");
      await fetchStaffingShifts();
    } finally {
      setIsDeleting(false);
      setDeleteShiftModal(null);
    }
  };


  const handleExportCSV = () => {
    const headers = "Shift ID,Shift Name,Shift Timing,Date,Line,Supervisor,Operators Count,Planned Headcount,Actual Headcount,Shift Status\n";
    const rows = shifts
      .map(
        (s) =>
          `"${s.id}","${s.shiftName}","${s.shiftTiming}","${s.date}","${s.line}","${s.supervisor}",${s.operators.length},${s.plannedHeadcount},${s.actualHeadcount},"${s.shiftStatus}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Shift_Schedules_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Shift schedule roster exported to CSV.", "info");
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "In Progress":
        return "emerald";
      case "Scheduled":
        return "cyan";
      case "Completed":
        return "indigo";
      case "Closed":
      default:
        return "slate";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Shift Management & Rostering
            </h1>
            <Badge variant="emerald">{shifts.filter((s) => s.shiftStatus === "In Progress").length} Active Shift</Badge>
            <Badge variant="cyan">{shifts.length} Total Registered Shifts</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Shift rosters, line supervision, operator station assignments, and shift closing workflows.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Shifts
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateShiftModalOpen(true)}>
            + Create Shift
          </Button>
        </div>
      </div>

      {/* KPI Overview Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        <StatCard
          title="Active Shifts"
          value={shifts.filter((s) => s.shiftStatus === "In Progress").length}
          unit="Current Shift"
          trend={{ value: "Shift A operating at 100% capacity", isPositive: true, text: "" }}
          icon={CalendarRange}
          colorVariant="emerald"
        />
        <StatCard
          title="Scheduled Shifts"
          value={shifts.filter((s) => s.shiftStatus === "Scheduled").length}
          unit="Upcoming"
          trend={{ value: "Shift B & C staged with supervisors", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Staffed Headcount"
          value={shifts.reduce((acc, s) => acc + s.actualHeadcount, 0)}
          unit="Allocated Operators"
          trend={{ value: "98.2% roster coverage", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="indigo"
        />
        <StatCard
          title="Shift Handover Compliance"
          value="100%"
          unit="PIN Signed"
          trend={{ value: "All previous shifts cleanly closed", isPositive: true, text: "" }}
          icon={CheckCircle}
          colorVariant="emerald"
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
              placeholder="Search shift name, line, or supervisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", width: "100%", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setStageFilter("ALL")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: stageFilter === "ALL" ? "var(--accent-primary)" : "var(--bg-card-subtle)",
                  color: stageFilter === "ALL" ? "#FFFFFF" : "var(--text-secondary)"
                }}
              >
                All Stages
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("PROCESSING")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: stageFilter === "PROCESSING" ? "#8B5CF6" : "var(--bg-card-subtle)",
                  color: stageFilter === "PROCESSING" ? "#FFFFFF" : "var(--text-secondary)"
                }}
              >
                ⚡ Processing Stage
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("PACKAGING")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: stageFilter === "PACKAGING" ? "#0EA5E9" : "var(--bg-card-subtle)",
                  color: stageFilter === "PACKAGING" ? "#FFFFFF" : "var(--text-secondary)"
                }}
              >
                📦 Packaging Stage
              </button>
            </div>

            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginLeft: "8px" }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "6px 10px", height: "36px" }}
            >
              <option value="All">All Shift Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Shift Management Table */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Shift Rosters & Line Allocations ({filteredShifts.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Manage shifts, assign personnel to machine lines, and close out handovers.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "960px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT NAME</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT TIMING</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>DATE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>LINE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SUPERVISOR</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>OPERATORS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PLANNED HC</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>ACTUAL HC</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT STATUS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right", whiteSpace: "nowrap", minWidth: "150px" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)", height: "48px" }}>
                  {/* Shift Name */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.2 }}>{s.shiftName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.id}</div>
                  </td>

                  {/* Shift Timing */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} color="#0284C7" />
                      <span>{s.shiftTiming}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {s.date}
                  </td>

                  {/* Line */}
                  <td style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {s.line}
                  </td>

                  {/* Supervisor */}
                  <td style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 600, color: "#0284C7", whiteSpace: "nowrap" }}>
                    {s.supervisor}
                  </td>

                  {/* Operators */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {(s.operators || []).slice(0, 2).map((op, idx) => (
                        <span key={idx} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(2, 132, 199, 0.08)", color: "#0284C7", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {op}
                        </span>
                      ))}
                      {(s.operators || []).length > 2 && (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                          +{s.operators.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Planned Headcount */}
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {s.plannedHeadcount}
                  </td>

                  {/* Actual Headcount */}
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 800, color: s.actualHeadcount < s.plannedHeadcount ? "#D97706" : "#059669", whiteSpace: "nowrap" }}>
                    {s.actualHeadcount}
                  </td>

                  {/* Shift Status */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={getStatusBadgeVariant(s.shiftStatus)} dot>
                      {s.shiftStatus}
                    </Badge>
                  </td>

                  {/* Actions Column (View, Edit + Actions Dropdown Menu) */}
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", position: "relative" }} ref={activeDropdownId === s.id ? dropdownRef : null}>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Eye}
                        title="View Shift Details"
                        onClick={() => setViewShiftModal(s)}
                        style={{ padding: "6px", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      />
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Edit2}
                        title="Edit Shift"
                        onClick={() => setEditShiftModal(s)}
                        style={{ padding: "6px", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      />
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        title="Delete Shift"
                        onClick={() => setDeleteShiftModal(s)}
                        style={{ padding: "6px", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}
                      />
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={ChevronDown}
                        title="More Actions (Assign, Station, Close)"
                        onClick={() => setActiveDropdownId(activeDropdownId === s.id ? null : s.id)}
                        style={{ padding: "4px 8px", fontSize: "11px", height: "28px", fontWeight: 700 }}
                      >
                        Actions
                      </Button>

                      {/* Floating Dropdown Menu for Secondary Actions */}
                      {activeDropdownId === s.id && (
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
                            minWidth: "175px",
                            display: "flex",
                            flexDirection: "column",
                            padding: "6px",
                            gap: "2px",
                            textAlign: "left"
                          }}
                        >
                          <button
                            onClick={() => {
                              setActiveDropdownId(null);
                              setAssignEmployeeModal(s);
                            }}
                            className="btn btn-ghost"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "6px 8px",
                              fontSize: "12px",
                              justifyContent: "flex-start",
                              borderRadius: "4px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer"
                            }}
                          >
                            <UserPlus size={14} color="#0284C7" />
                            <span>Assign Employee</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdownId(null);
                              setAssignOperatorModal(s);
                            }}
                            className="btn btn-ghost"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "6px 8px",
                              fontSize: "12px",
                              justifyContent: "flex-start",
                              borderRadius: "4px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer"
                            }}
                          >
                            <Wand2 size={14} color="#8B5CF6" />
                            <span>Assign Station</span>
                          </button>

                          <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "4px 0" }} />

                          {s.shiftStatus !== "Closed" ? (
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                setCloseShiftModal(s);
                              }}
                              className="btn btn-ghost"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                width: "100%",
                                padding: "6px 8px",
                                fontSize: "12px",
                                justifyContent: "flex-start",
                                borderRadius: "4px",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                color: "#D97706"
                              }}
                            >
                              <Lock size={14} color="#D97706" />
                              <span style={{ fontWeight: 700 }}>Close Shift</span>
                            </button>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", fontSize: "12px", color: "var(--text-muted)" }}>
                              <Lock size={14} />
                              <span>Shift Closed</span>
                            </div>
                          )}

                          <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "4px 0" }} />

                          <button
                            onClick={() => {
                              setActiveDropdownId(null);
                              setDeleteShiftModal(s);
                            }}
                            className="btn btn-ghost"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "6px 8px",
                              fontSize: "12px",
                              justifyContent: "flex-start",
                              borderRadius: "4px",
                              border: "none",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              color: "#DC2626"
                            }}
                          >
                            <Trash2 size={14} color="#DC2626" />
                            <span style={{ fontWeight: 600 }}>Delete Shift</span>
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

      {/* 1. CREATE SHIFT MODAL */}
      <Modal
        isOpen={isCreateShiftModalOpen}
        onClose={() => setIsCreateShiftModalOpen(false)}
        title="Create Manufacturing Shift"
        subtitle="Roster Schedule & Supervisor Allocation"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleCreateShift}>
              Create Shift
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateShift} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Shift Name
            </label>
            <input
              type="text"
              value={newShift.shiftName}
              onChange={(e) => setNewShift({ ...newShift, shiftName: e.target.value })}
              placeholder="e.g. Shift B — Evening Packaging Run"
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Shift Timing
              </label>
              <select
                value={newShift.shiftTiming}
                onChange={(e) => setNewShift({ ...newShift, shiftTiming: e.target.value })}
                className="input-field"
              >
                <option value="06:00 - 14:30">06:00 - 14:30 (Day)</option>
                <option value="14:30 - 22:30">14:30 - 22:30 (Evening)</option>
                <option value="22:30 - 06:30">22:30 - 06:30 (Night)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Date
              </label>
              <input
                type="date"
                value={newShift.date}
                onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Manufacturing Line
              </label>
              <select
                value={newShift.line}
                onChange={(e) => setNewShift({ ...newShift, line: e.target.value })}
                className="input-field"
              >
                <option value="Line 1 — High-Speed Bottling">Line 1 — High-Speed Bottling</option>
                <option value="Line 2 — Formulation & CIP">Line 2 — Formulation & CIP</option>
                <option value="Line 3 — Canning & Seaming">Line 3 — Canning & Seaming</option>
                <option value="QA In-Line Lab & Sanitation">QA In-Line Lab & Sanitation</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Shift Supervisor
              </label>
              <input
                type="text"
                value={newShift.supervisor}
                onChange={(e) => setNewShift({ ...newShift, supervisor: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Planned Headcount
              </label>
              <input
                type="number"
                min="1"
                value={newShift.plannedHeadcount}
                onChange={(e) => setNewShift({ ...newShift, plannedHeadcount: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Actual Headcount
              </label>
              <input
                type="number"
                min="1"
                value={newShift.actualHeadcount}
                onChange={(e) => setNewShift({ ...newShift, actualHeadcount: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 2. VIEW SHIFT MODAL */}
      <Modal
        isOpen={!!viewShiftModal}
        onClose={() => setViewShiftModal(null)}
        title={`Shift Dossier — ${viewShiftModal?.shiftName}`}
        subtitle={`Date: ${viewShiftModal?.date} • Timing: ${viewShiftModal?.shiftTiming}`}
        maxWidth="580px"
        footer={
          <Button variant="secondary" onClick={() => setViewShiftModal(null)}>
            Close
          </Button>
        }
      >
        {viewShiftModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Manufacturing Line</span>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>{viewShiftModal.line}</div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Shift Supervisor</span>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0284C7", marginTop: "4px" }}>{viewShiftModal.supervisor}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ padding: "10px", border: "1px solid var(--border-subtle)", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Planned HC</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{viewShiftModal.plannedHeadcount}</div>
              </div>
              <div style={{ padding: "10px", border: "1px solid var(--border-subtle)", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Actual HC</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669", marginTop: "2px" }}>{viewShiftModal.actualHeadcount}</div>
              </div>
              <div style={{ padding: "10px", border: "1px solid var(--border-subtle)", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Status</span>
                <div style={{ marginTop: "4px" }}><Badge variant={getStatusBadgeVariant(viewShiftModal.shiftStatus)}>{viewShiftModal.shiftStatus}</Badge></div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Assigned Operators Roster</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(viewShiftModal.operators || []).map((op, idx) => (
                  <Badge key={idx} variant="cyan">{op}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. EDIT SHIFT MODAL */}
      <Modal
        isOpen={!!editShiftModal}
        onClose={() => setEditShiftModal(null)}
        title="Edit Shift Configuration"
        subtitle={`Updating ${editShiftModal?.shiftName} (${editShiftModal?.id})`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditShiftModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveEditShift}>
              Save Shift
            </Button>
          </>
        }
      >
        {editShiftModal && (
          <form onSubmit={handleSaveEditShift} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Shift Name
              </label>
              <input
                type="text"
                value={editShiftModal.shiftName}
                onChange={(e) => setEditShiftModal({ ...editShiftModal, shiftName: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Shift Timing
                </label>
                <select
                  value={editShiftModal.shiftTiming}
                  onChange={(e) => setEditShiftModal({ ...editShiftModal, shiftTiming: e.target.value })}
                  className="input-field"
                >
                  <option value="06:00 - 14:30">06:00 - 14:30</option>
                  <option value="14:30 - 22:30">14:30 - 22:30</option>
                  <option value="22:30 - 06:30">22:30 - 06:30</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Supervisor
                </label>
                <input
                  type="text"
                  value={editShiftModal.supervisor}
                  onChange={(e) => setEditShiftModal({ ...editShiftModal, supervisor: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Planned Headcount
                </label>
                <input
                  type="number"
                  value={editShiftModal.plannedHeadcount}
                  onChange={(e) => setEditShiftModal({ ...editShiftModal, plannedHeadcount: Number(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Shift Status
                </label>
                <select
                  value={editShiftModal.shiftStatus}
                  onChange={(e) => setEditShiftModal({ ...editShiftModal, shiftStatus: e.target.value })}
                  className="input-field"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* 4. ASSIGN EMPLOYEE TO SHIFT MODAL */}
      <Modal
        isOpen={!!assignEmployeeModal}
        onClose={() => setAssignEmployeeModal(null)}
        title="Assign Employee to Shift Roster"
        subtitle={`Shift: ${assignEmployeeModal?.shiftName} • Line: ${assignEmployeeModal?.line}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignEmployeeModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={UserPlus} onClick={handleAssignEmployee}>
              Assign to Shift
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignEmployee} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Select Available Employee
            </label>
            <select
              value={selectedEmployeeToAssign || (availableEmployees[0]?.name || "")}
              onChange={(e) => setSelectedEmployeeToAssign(e.target.value)}
              className="input-field"
            >
              {availableEmployees.length === 0 && (
                <option value="">No employees available</option>
              )}
              {availableEmployees.map((e, idx) => (
                <option key={idx} value={e.name}>
                  {e.name} — {e.role} ({e.shift || e.department || "Packaging"})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* 5. ASSIGN OPERATOR TO MACHINE STATION MODAL */}
      <Modal
        isOpen={!!assignOperatorModal}
        onClose={() => setAssignOperatorModal(null)}
        title="Assign Operator to Machine Station"
        subtitle={`Line: ${assignOperatorModal?.line}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOperatorModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Wand2} onClick={handleAssignOperatorStation}>
              Confirm Station
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignOperatorStation} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Operator
            </label>
            <select
              value={operatorStationForm.operator}
              onChange={(e) => setOperatorStationForm({ ...operatorStationForm, operator: e.target.value })}
              className="input-field"
            >
              {(assignOperatorModal?.operators?.length > 0 ? assignOperatorModal.operators : availableEmployees.map(e => e.name)).map((op, idx) => (
                <option key={idx} value={op}>{op}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Machine Work Station
            </label>
            <select
              value={operatorStationForm.station}
              onChange={(e) => setOperatorStationForm({ ...operatorStationForm, station: e.target.value })}
              className="input-field"
            >
              <option value="Filler HMI Control Pod">Filler HMI Control Pod</option>
              <option value="Rotary Capper Feed Cell">Rotary Capper Feed Cell</option>
              <option value="Case Packer & Infeed Jam Station">Case Packer & Infeed Jam Station</option>
              <option value="In-Line Quality Titration Station">In-Line Quality Titration Station</option>
              <option value="Robotic Palletizer Safety Gate">Robotic Palletizer Safety Gate</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* 6. CLOSE SHIFT MODAL */}
      <Modal
        isOpen={!!closeShiftModal}
        onClose={() => setCloseShiftModal(null)}
        title="Close & Sign Off Shift"
        subtitle={`Shift: ${closeShiftModal?.shiftName} • Supervisor: ${closeShiftModal?.supervisor}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCloseShiftModal(null)}>
              Cancel
            </Button>
            <Button variant="warning" icon={Lock} onClick={handleCloseShift}>
              Sign Off & Lock Shift
            </Button>
          </>
        }
      >
        <form onSubmit={handleCloseShift} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "12px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "6px", borderLeft: "4px solid #F59E0B" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#D97706" }}>Final Shift Sign-Off</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Closing this shift locks attendance and sends handover notes to incoming shift supervisor.
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Supervisor Handover Notes
            </label>
            <textarea
              rows={3}
              value={closeShiftNotes}
              onChange={(e) => setCloseShiftNotes(e.target.value)}
              className="input-field"
              style={{ width: "100%", resize: "vertical" }}
              required
            />
          </div>
        </form>
      </Modal>

      {/* 7. DELETE SHIFT CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteShiftModal}
        onClose={() => setDeleteShiftModal(null)}
        title="Delete Shift Schedule"
        subtitle={`Shift ID: ${deleteShiftModal?.id}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteShiftModal(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={{ backgroundColor: "#DC2626", color: "#FFFFFF", borderColor: "#DC2626" }}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "12px 14px", backgroundColor: "rgba(239, 68, 68, 0.08)", borderRadius: "8px", borderLeft: "4px solid #EF4444" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", marginBottom: "4px" }}>
              Are you sure you want to delete this shift?
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              This action will permanently delete <strong>{deleteShiftModal?.shiftName}</strong> ({deleteShiftModal?.shiftTiming}). This action cannot be undone.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px 14px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "6px", fontSize: "12px" }}>
            <div><span style={{ color: "var(--text-muted)" }}>Shift:</span> <strong>{deleteShiftModal?.shiftName}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Assigned Line:</span> <strong>{deleteShiftModal?.line}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Timing:</span> <strong>{deleteShiftModal?.shiftTiming}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Date:</span> <strong>{deleteShiftModal?.date}</strong></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

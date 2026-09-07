import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarRange,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Layers,
  Wrench,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Calendar as CalendarIcon,
  Filter,
  ShieldAlert,
  Cpu,
  User,
  CheckSquare,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Flame
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

// Rich catalog of realistic industrial PM schedule templates for calendar mapping
const MASTER_PM_LIBRARY = [
  {
    templateId: "PM-LUB-01",
    title: "Aseptic Filler Spindle Bearing Lubrication",
    assetName: "Rotary Bottling Filler (Aseptic)",
    assetId: "ASSET-001",
    frequency: "Weekly",
    priority: "P1 - Critical",
    duration: "45m",
    assignedTo: "Marcus Vance (Senior Tech)",
    status: "Due Today",
    checklistId: "CHK-FM-WEEKLY",
    spareParts: "Food-Grade H1 Synthetic Grease (150ml)",
    lotoRequired: true,
    dayOffset: 1 // Mondays
  },
  {
    templateId: "PM-SEAL-02",
    title: "RF Sealing Coil Thermal Profile & Air Gap Test",
    assetName: "Induction Cap Sealer",
    assetId: "ASSET-002",
    frequency: "Bi-Weekly",
    priority: "P2 - High",
    duration: "30m",
    assignedTo: "Elena Rostova",
    status: "Upcoming",
    checklistId: "CHK-CP-QTR",
    spareParts: "Thermal Sensor Pad #CP-08",
    lotoRequired: true,
    dayOffset: 3 // Wednesdays
  },
  {
    templateId: "PM-CIP-03",
    title: "Monthly Thermal Pasteurizer Gasket & Pressure Check",
    assetName: "HTST Flash Pasteurizer",
    assetId: "ASSET-003",
    frequency: "Monthly",
    priority: "P1 - Critical",
    duration: "120m",
    assignedTo: "David Kim (Process Lead)",
    status: "Overdue",
    checklistId: "CHK-HT-MONTHLY",
    spareParts: "EPDM Food-Grade Gasket Kit Set-A",
    lotoRequired: true,
    dayOffset: 15 // Mid-month
  },
  {
    templateId: "PM-CUT-04",
    title: "Rotary Vacuum Drum & Labeler Blade Sharpening",
    assetName: "Sleeve Rotary Labeler",
    assetId: "ASSET-004",
    frequency: "Weekly",
    priority: "P2 - High",
    duration: "35m",
    assignedTo: "Carlos Mendez",
    status: "Upcoming",
    checklistId: "CHK-LBL-01",
    spareParts: "Carbide Rotary Blade Tip (1x)",
    lotoRequired: false,
    dayOffset: 4 // Thursdays
  },
  {
    templateId: "PM-PNEUM-05",
    title: "Pneumatic Cylinder Seal Rebuild & Pressure Drop Test",
    assetName: "Case Packer (High-Speed)",
    assetId: "ASSET-005",
    frequency: "Monthly",
    priority: "P2 - High",
    duration: "60m",
    assignedTo: "Marcus Vance",
    status: "Completed",
    checklistId: "CHK-CPK-02",
    spareParts: "Festo Pneumatic Seal Kit PK-4",
    lotoRequired: true,
    dayOffset: 22 // 4th week
  },
  {
    templateId: "PM-MET-06",
    title: "Metal Detector Multi-Frequency Sensitivity Calibration",
    assetName: "End-of-Line Checkweigher & Metal Detector",
    assetId: "ASSET-006",
    frequency: "Weekly",
    priority: "P1 - Critical",
    duration: "25m",
    assignedTo: "QA Specialist (Dave Miller)",
    status: "Upcoming",
    checklistId: "CHK-MD-WEEKLY",
    spareParts: "Certified Test Wands (Fe, Non-Fe, SS)",
    lotoRequired: false,
    dayOffset: 5 // Fridays
  },
  {
    templateId: "PM-LASER-07",
    title: "Conveyor Drive Chain Laser Alignment & Tensioning",
    assetName: "Main Infeed Bottling Conveyor",
    assetId: "ASSET-007",
    frequency: "Bi-Weekly",
    priority: "P3 - Standard",
    duration: "40m",
    assignedTo: "Carlos Mendez",
    status: "Upcoming",
    checklistId: "CHK-CNV-03",
    spareParts: "Roller Chain Links #50SS (2x)",
    lotoRequired: true,
    dayOffset: 2 // Tuesdays
  }
];

export function PMScheduleList({ initialViewMode }) {
  const navigate = useNavigate();
  const { pmSchedules, addPMSchedule, addWorkOrder, updatePMScheduleStatus } = useCMMS();
  const { addToast } = useApp();

  // View Mode: 'calendar' | 'list'
  const [viewMode, setViewMode] = useState(initialViewMode || "list");

  React.useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  // Calendar Month State (Defaults to September 2026)
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 8, 1));
  const [selectedPmForModal, setSelectedPmForModal] = useState(null);

  // Filter for Calendar: 'ALL' | 'CRITICAL' | 'WEEKLY' | 'COMPLETED'
  const [calendarFilter, setCalendarFilter] = useState("ALL");
  const [showDailyChecks, setShowDailyChecks] = useState(false);

  // Modal Create Plan
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    assetName: "Rotary Bottling Filler (Aseptic)",
    assetId: "ASSET-001",
    frequency: "Weekly",
    assignedTo: "Marcus Vance (Senior Tech)",
    dueDate: "2026-09-05",
    templateId: "CHK-001"
  });

  const dueTodayCount = pmSchedules.filter((s) => s.status.includes("Due Today")).length;
  const overdueCount = pmSchedules.filter((s) => s.status.includes("Overdue")).length;
  const upcomingCount = pmSchedules.filter((s) => s.status.includes("Upcoming")).length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSchedule.title.trim()) {
      addToast("Please provide schedule title.", "warning");
      return;
    }
    if (addPMSchedule) {
      addPMSchedule(newSchedule);
    }
    addToast(`PM Plan "${newSchedule.title}" created successfully!`, "success");
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Overdue":
        return <Badge variant="rose" dot>{status}</Badge>;
      case "Due Today":
        return <Badge variant="amber" dot>{status}</Badge>;
      case "Upcoming":
        return <Badge variant="cyan">{status}</Badge>;
      case "Completed":
        return <Badge variant="emerald">{status}</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  // Calendar Calculation Utilities
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  // Days in Previous Month (to fill leading cells seamlessly)
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    setCalendarDate(new Date(2026, 8, 1));
  };

  // Rich, non-repetitive schedule mapping per day
  const pmsByDay = useMemo(() => {
    const map = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = [];
      const dayOfWeek = (firstDayOfWeek + day - 1) % 7; // 0 = Mon, 6 = Sun

      // 1. Match from context pmSchedules if dueDate falls on this day
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      pmSchedules.forEach((pm) => {
        if (pm.dueDate === dateStr) {
          dayTasks.push({
            id: pm.id,
            title: pm.title,
            assetName: pm.assetName,
            assetId: pm.assetId,
            frequency: pm.frequency,
            priority: pm.status.includes("Overdue") ? "P1 - Critical" : "P2 - High",
            duration: "45m",
            assignedTo: pm.assignedTo,
            status: pm.status,
            checklistId: pm.templateId || "CHK-001",
            spareParts: "OEM Specified Service Parts",
            lotoRequired: true
          });
        }
      });

      // 2. Realistic diverse distribution across the calendar
      MASTER_PM_LIBRARY.forEach((item, idx) => {
        let shouldInclude = false;

        // Scheduled based on recurring days
        if (item.frequency === "Weekly" && dayOfWeek === item.dayOffset) {
          shouldInclude = true;
        } else if (item.frequency === "Bi-Weekly" && dayOfWeek === item.dayOffset && (Math.floor(day / 7) % 2 === 0)) {
          shouldInclude = true;
        } else if (item.frequency === "Monthly" && day === item.dayOffset) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          let dynamicStatus = item.status;
          // Contextualize for current date: 5 Sep 2026
          if (year === 2026 && month === 8) {
            if (day < 5) dynamicStatus = "Completed";
            else if (day === 5) dynamicStatus = "Due Today";
            else if (day === 8 && idx === 2) dynamicStatus = "Overdue";
            else dynamicStatus = "Upcoming";
          }

          dayTasks.push({
            id: `PM-CAL-${day}-${idx}`,
            title: item.title,
            assetName: item.assetName,
            assetId: item.assetId,
            frequency: item.frequency,
            priority: item.priority,
            duration: item.duration,
            assignedTo: item.assignedTo,
            status: dynamicStatus,
            checklistId: item.checklistId,
            spareParts: item.spareParts,
            lotoRequired: item.lotoRequired
          });
        }
      });

      // Filter by selected category pill
      let filtered = dayTasks;
      if (calendarFilter === "CRITICAL") {
        filtered = dayTasks.filter((t) => t.status === "Overdue" || t.status === "Due Today" || t.priority.includes("P1"));
      } else if (calendarFilter === "WEEKLY") {
        filtered = dayTasks.filter((t) => t.frequency === "Weekly" || t.frequency === "Bi-Weekly");
      } else if (calendarFilter === "COMPLETED") {
        filtered = dayTasks.filter((t) => t.status === "Completed");
      }

      map[day] = filtered;
    }
    return map;
  }, [pmSchedules, year, month, daysInMonth, firstDayOfWeek, calendarFilter]);

  // Overall Calendar Metrics
  const totalMonthTasks = Object.values(pmsByDay).reduce((sum, list) => sum + list.length, 0);
  const totalMonthHours = (totalMonthTasks * 0.9).toFixed(1);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Table Columns for List View
  const listColumns = [
    {
      header: "PM Title & Scope",
      accessor: "title",
      headerStyle: { minWidth: "260px", paddingLeft: "20px" },
      cellStyle: { minWidth: "260px", paddingLeft: "20px" },
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23", flexShrink: 0 }}>
            <CalendarRange size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{row.title}</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              ID: {row.id} • Template: {row.templateId || "CHK-001"}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Asset / Machine",
      accessor: "assetName",
      headerStyle: { minWidth: "190px" },
      cellStyle: { minWidth: "190px" },
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--text-primary)" }}>{row.assetName}</strong>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetId}</div>
        </div>
      )
    },
    {
      header: "Recurrence",
      accessor: "frequency",
      headerStyle: { minWidth: "120px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "120px", whiteSpace: "nowrap" },
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Assigned Tech",
      accessor: "assignedTo",
      headerStyle: { minWidth: "160px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "160px", whiteSpace: "nowrap" },
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{val}</span>
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      headerStyle: { minWidth: "120px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "120px", whiteSpace: "nowrap" },
      render: (val) => (
        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>
          {val}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      headerStyle: { minWidth: "120px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "120px", whiteSpace: "nowrap" },
      render: (val) => getStatusBadge(val)
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      headerStyle: { minWidth: "130px", textAlign: "right", paddingRight: "20px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "130px", textAlign: "right", paddingRight: "20px", whiteSpace: "nowrap" },
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={() => navigate(`/maintenance/pm-checklists/execute/${row.templateId || "CHK-001"}?asset=${row.assetId}`)}
        >
          Start PM
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Top Banner & Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
              Preventive Maintenance (PM) Scheduling
            </h1>
            <Badge variant="emerald">ISO-55001 Runtime Master</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Interactive production line maintenance scheduling, automated runtime thresholds, and technician work order dispatch.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* List vs Calendar Toggle */}
          <div
            style={{
              display: "inline-flex",
              padding: "4px",
              backgroundColor: "var(--bg-card-subtle)",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <button
              onClick={() => setViewMode("calendar")}
              style={{
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: viewMode === "calendar" ? "#8C5B23" : "transparent",
                color: viewMode === "calendar" ? "#FFFFFF" : "var(--text-secondary)",
                boxShadow: viewMode === "calendar" ? "0 2px 6px rgba(140, 91, 35, 0.3)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <CalendarRange size={15} /> Calendar View
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: viewMode === "list" ? "#8C5B23" : "transparent",
                color: viewMode === "list" ? "#FFFFFF" : "var(--text-secondary)",
                boxShadow: viewMode === "list" ? "0 2px 6px rgba(140, 91, 35, 0.3)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <Layers size={15} /> Table View
            </button>
          </div>

          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("PM schedule synchronized with SCADA line runtime hours.", "info")}
            style={{ fontSize: "12px", padding: "8px 14px", borderRadius: "8px" }}
          >
            Sync Telemetry
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "8px" }}
          >
            Create PM Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          width: "100%"
        }}
      >
        <StatCard
          title="Due Today"
          value={dueTodayCount.toString()}
          unit="Active Tasks"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Overdue PMs"
          value={overdueCount.toString()}
          unit="Critical"
          icon={Clock}
          colorVariant="rose"
        />
        <StatCard
          title="Month PM Workload"
          value={`${totalMonthHours} hrs`}
          unit={`${totalMonthTasks} Tasks`}
          icon={CalendarRange}
          colorVariant="cyan"
        />
        <StatCard
          title="PM Compliance"
          value="98.2%"
          unit="On-Time Rate"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <Card style={{ padding: "clamp(12px, 3vw, 24px)", width: "100%", boxSizing: "border-box", borderRadius: "14px" }}>
          {/* Month Navigation & Controls Bar */}
          <div
            className="calendar-header-strip"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              paddingBottom: "18px",
              borderBottom: "1px solid var(--border-subtle)",
              width: "100%"
            }}
          >
            {/* Left: Month Title + Subtitle */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(200, 149, 71, 0.15)",
                  color: "#8C5B23",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(200, 149, 71, 0.15)",
                  flexShrink: 0
                }}
              >
                <CalendarIcon size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "clamp(17px, 3.5vw, 20px)", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
                    {monthName} {year}
                  </h2>
                  <Badge variant="cyan">{totalMonthTasks} PM Events</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Scheduled Preventive Checklists, Bearing Replacements & Calibration Cycles
                </div>
              </div>
            </div>

            {/* Center / Right: Filter Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", width: "100%", maxWidth: "100%", justifyContent: "space-between" }}>
              <div
                className="calendar-filter-bar"
                style={{
                  display: "inline-flex",
                  backgroundColor: "var(--bg-card-subtle)",
                  padding: "3px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  overflowX: "auto",
                  maxWidth: "100%"
                }}
              >
                {[
                  { id: "ALL", label: "All PMs" },
                  { id: "CRITICAL", label: "Critical & Overdue" },
                  { id: "WEEKLY", label: "Weekly & Major" },
                  { id: "COMPLETED", label: "Completed" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCalendarFilter(f.id)}
                    style={{
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: calendarFilter === f.id ? "#8C5B23" : "transparent",
                      color: calendarFilter === f.id ? "#FFFFFF" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="calendar-nav-controls" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  onClick={handleResetToToday}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "#8C5B23",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 700
                  }}
                >
                  Current (Sept 2026)
                </button>
                <button
                  onClick={handleNextMonth}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Legend & Summary Strip */}
          <div
            className="calendar-legend-strip"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "10px 14px",
              backgroundColor: "var(--bg-card-subtle)",
              borderRadius: "8px",
              margin: "16px 0",
              fontSize: "11px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Legend:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Overdue (Immediate Action)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Due Today</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284C7" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Scheduled PM</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Completed & Verified</span>
              </div>
            </div>

            <div style={{ color: "var(--text-muted)" }}>
              Tip: Click on any PM card to view SOP checklist, spare parts, and trigger direct execution.
            </div>
          </div>

          {/* 7-COLUMN UNIFORM CALENDAR GRID WITH TOUCH HORIZONTAL SCROLL */}
          <div
            className="calendar-scroll-container"
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "8px"
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(115px, 1fr))",
                gap: "8px",
                width: "100%",
                minWidth: "800px",
                boxSizing: "border-box"
              }}
            >
              {/* Days of Week Header */}
              {daysOfWeek.map((dayName, dIdx) => (
                <div
                  key={dayName}
                  style={{
                    textAlign: "center",
                    padding: "10px 4px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: dIdx >= 5 ? "var(--text-muted)" : "var(--text-primary)",
                    backgroundColor: "var(--bg-card-subtle)",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {dayName}
                </div>
              ))}

            {/* PREVIOUS MONTH TRAILING DAYS (Clean, dimmed, NO broken blank holes!) */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const prevDateNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  style={{
                    minHeight: "115px",
                    backgroundColor: "rgba(0, 0, 0, 0.015)",
                    borderRadius: "8px",
                    border: "1px dashed var(--border-subtle)",
                    padding: "8px",
                    opacity: 0.45,
                    boxSizing: "border-box"
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    {prevDateNum}
                  </span>
                </div>
              );
            })}

            {/* CURRENT MONTH ACTUAL DAYS */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayTasks = pmsByDay[day] || [];
              const isToday = day === 5 && month === 8 && year === 2026; // 5 Sep 2026 is Today
              const hasOverdue = dayTasks.some((t) => t.status === "Overdue");
              const hasDueToday = dayTasks.some((t) => t.status === "Due Today");

              let borderColor = "var(--border-subtle)";
              let cellBg = "var(--bg-card)";
              if (isToday) {
                borderColor = "#8C5B23";
                cellBg = "rgba(200, 149, 71, 0.05)";
              } else if (hasOverdue) {
                borderColor = "rgba(239, 68, 68, 0.35)";
              }

              return (
                <div
                  key={`day-${day}`}
                  style={{
                    minHeight: "120px",
                    backgroundColor: cellBg,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    boxSizing: "border-box",
                    transition: "all 0.15s ease",
                    boxShadow: isToday ? "0 0 0 2px rgba(200, 149, 71, 0.2)" : "none"
                  }}
                >
                  {/* Day Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: isToday ? 800 : 700,
                        color: isToday ? "#FFFFFF" : "var(--text-primary)",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        backgroundColor: isToday ? "#8C5B23" : "transparent"
                      }}
                    >
                      {day}
                    </span>

                    {dayTasks.length > 0 && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: hasOverdue
                            ? "rgba(239, 68, 68, 0.15)"
                            : hasDueToday
                            ? "rgba(245, 158, 11, 0.15)"
                            : "var(--bg-card-subtle)",
                          color: hasOverdue ? "#DC2626" : hasDueToday ? "#D97706" : "var(--text-muted)"
                        }}
                      >
                        {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                      </span>
                    )}
                  </div>

                  {/* Task Cards Stack */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
                    {dayTasks.slice(0, 2).map((task) => {
                      let accentColor = "#0284C7";
                      let cardBg = "rgba(2, 132, 199, 0.08)";
                      if (task.status === "Overdue") {
                        accentColor = "#EF4444";
                        cardBg = "rgba(239, 68, 68, 0.08)";
                      } else if (task.status === "Due Today") {
                        accentColor = "#F59E0B";
                        cardBg = "rgba(245, 158, 11, 0.08)";
                      } else if (task.status === "Completed") {
                        accentColor = "#10B981";
                        cardBg = "rgba(16, 185, 129, 0.08)";
                      }

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedPmForModal(task)}
                          style={{
                            padding: "5px 7px",
                            borderRadius: "6px",
                            backgroundColor: cardBg,
                            borderLeft: `3px solid ${accentColor}`,
                            borderTop: "1px solid var(--border-subtle)",
                            borderRight: "1px solid var(--border-subtle)",
                            borderBottom: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "9px", fontWeight: 800, color: accentColor, fontFamily: "var(--font-mono)" }}>
                              {task.assetId}
                            </span>
                            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>
                              {task.duration}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.2
                            }}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <div
                        onClick={() => setSelectedPmForModal(dayTasks[0])}
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#8C5B23",
                          textAlign: "center",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(200, 149, 71, 0.1)",
                          cursor: "pointer",
                          marginTop: "auto"
                        }}
                      >
                        +{dayTasks.length - 2} more tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* NEXT MONTH LEADING DAYS (Fills remaining grid to maintain symmetry) */}
            {Array.from({
              length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7
            }).map((_, idx) => (
              <div
                key={`next-${idx}`}
                style={{
                  minHeight: "115px",
                  backgroundColor: "rgba(0, 0, 0, 0.015)",
                  borderRadius: "8px",
                  border: "1px dashed var(--border-subtle)",
                  padding: "8px",
                  opacity: 0.45,
                  boxSizing: "border-box"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                  {idx + 1}
                </span>
              </div>
            ))}
            </div>
          </div>
        </Card>
      )}

      {/* LIST / TABLE VIEW */}
      {viewMode === "list" && (
        <Card style={{ padding: "16px 20px", width: "100%", boxSizing: "border-box", borderRadius: "14px" }}>
          <DataTable
            title="Active Preventive Maintenance Schedules"
            columns={listColumns}
            data={pmSchedules}
            searchPlaceholder=""
            exportFilename="flowstate_pm_schedules.csv"
          />
        </Card>
      )}

      {/* DETAIL MODAL ON CLICKING A PM TASK */}
      {selectedPmForModal && (
        <div className="modal-backdrop" onClick={() => setSelectedPmForModal(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: "600px", margin: "16px", borderRadius: "14px", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Scheduled Maintenance Execution Dossier
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Schedule ID: {selectedPmForModal.id} • SOP: {selectedPmForModal.checklistId}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPmForModal(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {selectedPmForModal.title}
                  </h3>
                  {getStatusBadge(selectedPmForModal.status)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Frequency: <strong>{selectedPmForModal.frequency}</strong> • Estimated Line Downtime: <strong>{selectedPmForModal.duration}</strong>
                </div>
              </div>

              {/* Machine & Task Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "14px",
                  padding: "16px",
                  backgroundColor: "var(--bg-card-subtle)",
                  borderRadius: "10px",
                  fontSize: "12px"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>Target Machine:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedPmForModal.assetName}</strong>
                  <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    Tag: {selectedPmForModal.assetId}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>Assigned Lead:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedPmForModal.assignedTo}</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Level-3 Certified Specialist</div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>Required Service Parts:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedPmForModal.spareParts}</strong>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>Checklist Protocol:</span>
                  <strong style={{ color: "#0284C7", fontFamily: "var(--font-mono)" }}>{selectedPmForModal.checklistId}</strong>
                </div>
              </div>

              {/* Safety & LOTO Warning Banner */}
              {selectedPmForModal.lotoRequired && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    borderLeft: "4px solid #EF4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "12px"
                  }}
                >
                  <ShieldAlert size={20} color="#EF4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#EF4444", display: "block" }}>LOTO (Lockout / Tagout) Mandatory:</strong>
                    <span style={{ color: "var(--text-secondary)" }}>
                      De-energize main electrical isolator and bleed pneumatic air pressure before beginning mechanical service.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "16px",
                  marginTop: "8px"
                }}
              >
                <Button variant="secondary" onClick={() => setSelectedPmForModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  icon={Plus}
                  onClick={() => {
                    if (addWorkOrder) {
                      const newWo = addWorkOrder({
                        title: `Preventive Maintenance: ${selectedPmForModal.title}`,
                        assetId: selectedPmForModal.assetId,
                        assetName: selectedPmForModal.assetName,
                        type: "Preventive",
                        priority: selectedPmForModal.priority || "P2 - High",
                        status: "Open",
                        department: "Maintenance",
                        assignedTechnician: selectedPmForModal.assignedTo,
                        description: `Auto-dispatched PM Work Order for ${selectedPmForModal.checklistId}. Required parts: ${selectedPmForModal.spareParts}.`
                      });
                      addToast(`PM Work Order ${newWo.id} Generated Successfully!`, "success");
                    }
                    setSelectedPmForModal(null);
                  }}
                >
                  Generate Work Order
                </Button>
                <Button
                  variant="primary"
                  icon={Play}
                  onClick={() => {
                    navigate(`/maintenance/pm-checklists/execute/${selectedPmForModal.checklistId || "CHK-001"}?asset=${selectedPmForModal.assetId}`);
                  }}
                >
                  Start PM Checklist
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PM PLAN MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Create Preventive Maintenance Plan
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label">PM Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Capper Spindle Lubrication & Torque Audit"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset</label>
                  <select
                    className="form-select"
                    value={newSchedule.assetName}
                    onChange={(e) => setNewSchedule({ ...newSchedule, assetName: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Rotary Bottling Filler (Aseptic)">Rotary Bottling Filler (Aseptic)</option>
                    <option value="Induction Cap Sealer">Induction Cap Sealer</option>
                    <option value="HTST Flash Pasteurizer">HTST Flash Pasteurizer</option>
                    <option value="Sleeve Rotary Labeler">Sleeve Rotary Labeler</option>
                    <option value="Case Packer (High-Speed)">Case Packer (High-Speed)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Recurrence Frequency</label>
                  <select
                    className="form-select"
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Technician</label>
                  <input
                    type="text"
                    value={newSchedule.assignedTo}
                    onChange={(e) => setNewSchedule({ ...newSchedule, assignedTo: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Initial Due Date</label>
                  <input
                    type="date"
                    value={newSchedule.dueDate}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dueDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save PM Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

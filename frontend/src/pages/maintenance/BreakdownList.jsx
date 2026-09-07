import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  AlertTriangle,
  Plus,
  Clock,
  Wrench,
  CheckCircle2,
  DollarSign,
  Search,
  RotateCcw,
  ExternalLink,
  Edit,
  Eye,
  UserCheck,
  FileText,
  History,
  CheckSquare,
  SearchCode,
  ShieldAlert,
  ArrowRight,
  User,
  Filter,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function BreakdownList() {
  const {
    breakdowns = [],
    reportBreakdown,
    updateBreakdown,
    updateBreakdownStatus,
    resolveBreakdown,
    addWorkOrder,
    assets = []
  } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Filters State
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateWOModalOpen, setIsCreateWOModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  // New Breakdown Form State
  const [newForm, setNewForm] = useState({
    assetId: assets[0]?.id || "FM-001",
    symptom: "",
    failureCategory: "Mechanical",
    failureCode: "MEC-004",
    severity: "Critical",
    reportedBy: "Operator John Smith",
    technician: "Marcus Vance",
    productionLossUnits: 3000,
    downtimeCostUSD: 4500
  });

  // Edit Breakdown Form State
  const [editForm, setEditForm] = useState({
    symptom: "",
    failureCategory: "Mechanical",
    failureCode: "MEC-004",
    severity: "Critical",
    status: "Open",
    technician: "Marcus Vance",
    reportedBy: "Operator"
  });

  // Assign Tech Form State
  const [assignTech, setAssignTech] = useState("Marcus Vance");

  // Create WO Form State
  const [woForm, setWoForm] = useState({
    title: "",
    priority: "P1 - Critical",
    type: "Emergency",
    technician: "Marcus Vance"
  });

  // Resolve Form State
  const [resolveForm, setResolveForm] = useState({
    resolutionNotes: "",
    rootCause: "",
    partsReplaced: "",
    downtimeMinutes: 45
  });

  // Active Count & Metrics
  const activeCount = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed").length;
  const totalDowntimeMin = breakdowns.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
  const totalCostUSD = breakdowns.reduce((sum, b) => sum + (b.impact?.downtimeCostUSD || 0), 0);

  // Helper for Severity normalization
  const getSeverity = (b) => b.severity || (b.impact?.safetyRisk === "Critical" ? "Critical" : "High");
  const getReportedBy = (b) => b.reportedBy || "Shift Line Operator";
  const getRelatedWO = (b) => b.linkedWorkOrder || b.relatedWorkOrder || "-";
  const getResolution = (b) => b.resolution || b.repairAction || (b.status === "Resolved" ? "Repaired and test run passed" : "Under investigation");

  // Filtered Breakdowns
  const filteredBreakdowns = useMemo(() => {
    return breakdowns.filter((b) => {
      const currentStatus = b.status || "Open";
      const currentSeverity = getSeverity(b);
      const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter;
      const matchesSeverity = severityFilter === "ALL" || currentSeverity === severityFilter;
      const matchesSearch =
        searchQuery === "" ||
        b.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.assetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.symptom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.technician?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.failureCode?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [breakdowns, statusFilter, severityFilter, searchQuery]);

  // Handlers
  const handleOpenReportModal = () => {
    setNewForm({
      assetId: assets[0]?.id || "FM-001",
      symptom: "",
      failureCategory: "Mechanical",
      failureCode: "MEC-004",
      severity: "Critical",
      reportedBy: "Operator John Smith",
      technician: "Marcus Vance",
      productionLossUnits: 3000,
      downtimeCostUSD: 4500
    });
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!newForm.symptom.trim()) {
      addToast("Please describe the breakdown symptom", "error");
      return;
    }
    const asset = assets.find((a) => a.id === newForm.assetId);
    const newBD = reportBreakdown({
      assetId: newForm.assetId,
      assetName: asset?.name || newForm.assetId,
      plant: asset?.plant || "Plant 1 - North Facility",
      department: asset?.department || "Packaging",
      line: asset?.line || "Line 1",
      failureCode: newForm.failureCode,
      failureCategory: newForm.failureCategory,
      symptom: newForm.symptom,
      severity: newForm.severity,
      status: "Open",
      reportedBy: newForm.reportedBy,
      technician: newForm.technician,
      impact: {
        productionLossUnits: parseInt(newForm.productionLossUnits) || 2500,
        downtimeCostUSD: parseInt(newForm.downtimeCostUSD) || 3500,
        safetyRisk: newForm.severity,
        scrapRatePercent: 2.5
      }
    });

    addToast(`Breakdown ${newBD.id} reported on ${asset?.line || "Line 1"}. Line halted!`, "warning");
    setIsReportModalOpen(false);
  };

  const handleOpenView = (bd) => {
    setSelectedBreakdown(bd);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (bd) => {
    setSelectedBreakdown(bd);
    setEditForm({
      symptom: bd.symptom || "",
      failureCategory: bd.failureCategory || "Mechanical",
      failureCode: bd.failureCode || "MEC-004",
      severity: getSeverity(bd),
      status: bd.status || "Open",
      technician: bd.technician || "Marcus Vance",
      reportedBy: getReportedBy(bd)
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedBreakdown) return;
    updateBreakdown(selectedBreakdown.id, editForm);
    addToast(`Breakdown ${selectedBreakdown.id} updated successfully.`, "success");
    setIsEditModalOpen(false);
  };

  const handleOpenAssign = (bd) => {
    setSelectedBreakdown(bd);
    setAssignTech(bd.technician || "Marcus Vance");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!selectedBreakdown) return;
    updateBreakdown(selectedBreakdown.id, {
      technician: assignTech,
      status: selectedBreakdown.status === "Open" ? "Assigned" : selectedBreakdown.status
    });
    addToast(`Technician ${assignTech} dispatched to ${selectedBreakdown.id}.`, "success");
    setIsAssignModalOpen(false);
  };

  const handleOpenCreateWO = (bd) => {
    setSelectedBreakdown(bd);
    setWoForm({
      title: `Emergency Repair: ${bd.symptom || bd.assetName}`,
      priority: getSeverity(bd) === "Critical" ? "P1 - Critical" : "P2 - High",
      type: "Emergency",
      technician: bd.technician || "Marcus Vance"
    });
    setIsCreateWOModalOpen(true);
  };

  const handleConfirmCreateWO = (e) => {
    e.preventDefault();
    if (!selectedBreakdown) return;
    const createdWO = addWorkOrder({
      title: woForm.title,
      assetId: selectedBreakdown.assetId,
      assetName: selectedBreakdown.assetName,
      type: woForm.type,
      priority: woForm.priority,
      status: "In Progress",
      assignedTechnician: woForm.technician,
      description: `Generated from Breakdown ${selectedBreakdown.id}. Symptom: ${selectedBreakdown.symptom}`
    });

    updateBreakdown(selectedBreakdown.id, {
      linkedWorkOrder: createdWO.id,
      status: "In Progress"
    });

    addToast(`Work Order ${createdWO.id} created and linked to ${selectedBreakdown.id}!`, "success");
    setIsCreateWOModalOpen(false);
  };

  const handleStartInvestigation = (bd) => {
    updateBreakdownStatus(bd.id, "Investigating", "Root cause investigation initiated.");
    addToast(`Investigation started for ${bd.id}. Status changed to 'Investigating'.`, "info");
  };

  const handleOpenResolve = (bd) => {
    setSelectedBreakdown(bd);
    setResolveForm({
      resolutionNotes: bd.repairAction || "Replaced worn component, recalibrated and ran test cycle.",
      rootCause: bd.rootCause || "Mechanical wear under continuous high-speed operating cycle.",
      partsReplaced: "Viton Seal #45, Ceramic Bearing #6208",
      downtimeMinutes: bd.durationMinutes || 45
    });
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!selectedBreakdown) return;
    resolveBreakdown(selectedBreakdown.id, {
      resolution: resolveForm.resolutionNotes,
      repairAction: resolveForm.resolutionNotes,
      rootCause: resolveForm.rootCause,
      durationMinutes: parseInt(resolveForm.downtimeMinutes) || 45,
      status: "Resolved"
    });
    addToast(`Breakdown ${selectedBreakdown.id} resolved! Machine returned to Operational state.`, "success");
    setIsResolveModalOpen(false);
  };

  const handleCloseBreakdown = (bd) => {
    updateBreakdownStatus(bd.id, "Closed", "Verified and closed by shift supervisor.");
    addToast(`Breakdown ${bd.id} verified and closed.`, "success");
  };

  // Severity Badge Helper
  const renderSeverityBadge = (sev) => {
    switch (sev) {
      case "Critical":
        return <Badge variant="rose">Critical</Badge>;
      case "High":
        return <Badge variant="amber">High</Badge>;
      case "Medium":
        return <Badge variant="cyan">Medium</Badge>;
      default:
        return <Badge variant="slate">{sev || "Standard"}</Badge>;
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (st) => {
    switch (st) {
      case "Open":
        return <Badge variant="amber" dot>Open</Badge>;
      case "Investigating":
        return <Badge variant="cyan" dot>Investigating</Badge>;
      case "Assigned":
        return <Badge variant="blue">Assigned</Badge>;
      case "In Progress":
        return <Badge variant="cyan" dot>In Progress</Badge>;
      case "Resolved":
        return <Badge variant="emerald">Resolved</Badge>;
      case "Closed":
        return <Badge variant="slate">Closed</Badge>;
      default:
        return <Badge variant="slate">{st || "Open"}</Badge>;
    }
  };

  // Table Columns
  const columns = [
    {
      header: "Breakdown ID",
      accessor: "id",
      headerStyle: {
        width: "185px",
        minWidth: "185px",
        paddingLeft: "20px",
        whiteSpace: "nowrap"
      },
      cellStyle: {
        width: "185px",
        minWidth: "185px",
        paddingLeft: "20px",
        whiteSpace: "nowrap"
      },
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#DC2626", flexShrink: 0 }}>
            <AlertOctagon size={16} />
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{row.id}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{row.startTime}</div>
          </div>
        </div>
      )
    },
    {
      header: "Asset & Line",
      accessor: "assetName",
      headerStyle: { minWidth: "170px" },
      cellStyle: { minWidth: "170px" },
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8" }}>
            {row.assetId} — {row.assetName}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {row.line || "Line 1"} • {row.department || "Packaging"}
          </div>
        </div>
      )
    },
    {
      header: "Failure Mode",
      accessor: "failureCategory",
      headerStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      render: (val, row) => (
        <div>
          <Badge variant="rose">{row.failureCode || "MEC-004"}</Badge>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
            {val || "Mechanical"}
          </div>
        </div>
      )
    },
    {
      header: "Severity",
      accessor: "severity",
      headerStyle: { minWidth: "110px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "110px", whiteSpace: "nowrap" },
      render: (_, row) => renderSeverityBadge(getSeverity(row))
    },
    {
      header: "Status",
      accessor: "status",
      headerStyle: { minWidth: "130px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "130px", whiteSpace: "nowrap" },
      render: (val) => renderStatusBadge(val || "Open")
    },
    {
      header: "Downtime",
      accessor: "durationMinutes",
      headerStyle: { minWidth: "110px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "110px", whiteSpace: "nowrap" },
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "#EF4444" }}>
          {val || 0} mins
        </span>
      )
    },
    {
      header: "Assigned Tech",
      accessor: "technician",
      headerStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      render: (val) => (
        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
          {val || "Unassigned"}
        </span>
      )
    },
    {
      header: "Related WO",
      accessor: "linkedWorkOrder",
      headerStyle: { minWidth: "130px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "130px", whiteSpace: "nowrap" },
      render: (_, row) => {
        const wo = getRelatedWO(row);
        return wo !== "-" ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/maintenance/work-orders/${wo}`);
            }}
            style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", cursor: "pointer", textDecoration: "underline" }}
          >
            {wo}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>-</span>
        );
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      headerStyle: {
        width: "280px",
        minWidth: "280px",
        textAlign: "right",
        whiteSpace: "nowrap",
        paddingRight: "20px"
      },
      cellStyle: {
        width: "280px",
        minWidth: "280px",
        textAlign: "right",
        whiteSpace: "nowrap",
        paddingRight: "20px"
      },
      render: (_, row) => {
        const status = row.status || "Open";
        const isClosed = status === "Closed";
        const isResolved = status === "Resolved";
        const isInvestigatingOrInProgress = status === "Investigating" || status === "In Progress";
        const isUnassigned = !row.technician || row.technician === "Unassigned";

        return (
          <div className="table-actions-strip" onClick={(e) => e.stopPropagation()}>
            {/* View */}
            <button
              type="button"
              className="table-btn table-btn-view"
              onClick={() => handleOpenView(row)}
              title="View Breakdown Dossier"
            >
              <Eye size={13} color="#C89547" />
              <span>View</span>
            </button>

            {/* Edit (if not closed) */}
            {!isClosed && (
              <button
                type="button"
                className="table-btn table-btn-edit"
                onClick={() => handleOpenEdit(row)}
                title="Edit Breakdown Details"
              >
                <Edit size={13} color="#8C5B23" />
                <span>Edit</span>
              </button>
            )}

            {/* Contextual: Assign (if open & unassigned) */}
            {status === "Open" && isUnassigned && (
              <button
                type="button"
                className="table-btn table-btn-assign"
                onClick={() => handleOpenAssign(row)}
                title="Assign Technician"
              >
                <UserCheck size={13} />
                <span>Assign</span>
              </button>
            )}

            {/* Contextual: + WO (if no linked work order & not closed) */}
            {!row.linkedWorkOrder && !isClosed && (
              <button
                type="button"
                className="table-btn table-btn-wo"
                onClick={() => handleOpenCreateWO(row)}
                title="Generate Work Order"
              >
                <Plus size={12} />
                <span>+ WO</span>
              </button>
            )}

            {/* Contextual: Investigate (if open & assigned) */}
            {status === "Open" && !isUnassigned && (
              <button
                type="button"
                className="table-btn table-btn-investigate"
                onClick={() => handleStartInvestigation(row)}
                title="Start Diagnostic Investigation"
              >
                <SearchCode size={13} />
                <span>Investigate</span>
              </button>
            )}

            {/* Contextual: Resolve (if Investigating or In Progress) */}
            {isInvestigatingOrInProgress && (
              <button
                type="button"
                className="table-btn table-btn-resolve"
                onClick={() => handleOpenResolve(row)}
                title="Resolve Breakdown"
              >
                <CheckCircle2 size={13} />
                <span>Resolve</span>
              </button>
            )}

            {/* Contextual: Close (if Resolved) */}
            {isResolved && (
              <button
                type="button"
                className="table-btn table-btn-close"
                onClick={() => handleCloseBreakdown(row)}
                title="Verify & Close Breakdown"
              >
                <CheckSquare size={13} color="#6B5B4E" />
                <span>Close</span>
              </button>
            )}

            {/* Closed Tag */}
            {isClosed && (
              <span className="badge badge-slate" style={{ fontSize: "10px", padding: "2px 7px" }}>
                Closed
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header & Report Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Breakdown Management
            </h1>
            <Badge variant="rose">{activeCount} Active Stoppages</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Industrial unplanned stoppage logging, technician triage, and emergency response workflows
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="danger" icon={AlertOctagon} onClick={handleOpenReportModal} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Report Breakdown
          </Button>
        </div>
      </div>

      {/* KPI Tickers Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%"
        }}
      >
        <StatCard
          title="Active Breakdowns"
          value={activeCount.toString()}
          unit="machines"
          trend={{ value: activeCount > 0 ? "Action Required" : "Zero Stoppage", isPositive: activeCount === 0, text: "current line state" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
        <StatCard
          title="Total Downtime"
          value={`${totalDowntimeMin}`}
          unit="mins"
          trend={{ value: `${(totalDowntimeMin / 60).toFixed(1)} hrs lost`, isPositive: false, text: "cumulative shift" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Financial Loss"
          value={`$${totalCostUSD.toLocaleString()}`}
          unit="USD"
          trend={{ value: "Production Loss", isPositive: false, text: "estimated cost" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="Avg Restoration (MTTR)"
          value="1.3"
          unit="hrs"
          trend={{ value: "Within 1.5h SLA", isPositive: true, text: "target SLA" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
      </div>

      {/* Filter Toolbar */}
      <Card style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
              <input
                type="text"
                placeholder="Search breakdown ID, asset, symptom, failure code, tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ fontSize: "12px", paddingLeft: "32px", height: "36px" }}
              />
              <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>STATUS:</span>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: "12px", height: "36px", width: "auto" }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>SEVERITY:</span>
              <select
                className="form-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ fontSize: "12px", height: "36px", width: "auto" }}
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {(statusFilter !== "ALL" || severityFilter !== "ALL" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setStatusFilter("ALL");
                setSeverityFilter("ALL");
                setSearchQuery("");
              }}
              style={{ fontSize: "12px" }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Main DataTable */}
      <Card style={{ padding: "16px 20px" }}>
        <DataTable
          title="Breakdown Log & Response Register"
          columns={columns}
          data={filteredBreakdowns}
          searchPlaceholder="Search breakdown ID, asset, failure code, technician..."
          onRowClick={(row) => handleOpenView(row)}
          exportFilename="maintenx_breakdown_register.csv"
        />
      </Card>

      {/* 1. Report Breakdown Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Unplanned Breakdown"
        subtitle="Halt machine operations and immediately dispatch maintenance team"
      >
        <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Asset / Machine Experiencing Failure *</label>
            <select
              className="form-select"
              value={newForm.assetId}
              onChange={(e) => setNewForm({ ...newForm, assetId: e.target.value })}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name} ({a.line})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Failure Type / Category</label>
              <select
                className="form-select"
                value={newForm.failureCategory}
                onChange={(e) => setNewForm({ ...newForm, failureCategory: e.target.value })}
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Pneumatic">Pneumatic</option>
                <option value="Hydraulic">Hydraulic</option>
                <option value="Software / Automation">Software / Automation</option>
                <option value="Thermal">Thermal</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Failure Code</label>
              <select
                className="form-select"
                value={newForm.failureCode}
                onChange={(e) => setNewForm({ ...newForm, failureCode: e.target.value })}
              >
                <option value="MEC-004">MEC-004: Bearing Fatigue & Jam</option>
                <option value="HYD-002">HYD-002: Hydraulic Pressure Drop</option>
                <option value="ELE-008">ELE-008: Optical Sensor Drift</option>
                <option value="PNE-003">PNE-003: Pneumatic Valve Stall</option>
                <option value="AUT-001">AUT-001: PLC Communication Timeout</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select
                className="form-select"
                value={newForm.severity}
                onChange={(e) => setNewForm({ ...newForm, severity: e.target.value })}
              >
                <option value="Critical">Critical (Immediate Line Halt)</option>
                <option value="High">High (Subsystem Degraded)</option>
                <option value="Medium">Medium (Minor Loss)</option>
                <option value="Low">Low (Non-urgent)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reported By</label>
              <input
                type="text"
                className="form-input"
                value={newForm.reportedBy}
                onChange={(e) => setNewForm({ ...newForm, reportedBy: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observed Symptom / Error Alarm *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Infeed star-wheel jammed at 600 BPM; audible alarm and torque overload sensor tripped."
              value={newForm.symptom}
              onChange={(e) => setNewForm({ ...newForm, symptom: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Technician</label>
            <select
              className="form-select"
              value={newForm.technician}
              onChange={(e) => setNewForm({ ...newForm, technician: e.target.value })}
            >
              <option value="Marcus Vance">Marcus Vance (Senior Reliability Tech)</option>
              <option value="David Kim">David Kim (Hydraulic & Thermal Tech)</option>
              <option value="Elena Rostova">Elena Rostova (Electrical Specialist)</option>
              <option value="Carlos Mendez">Carlos Mendez (Mechanical Lead)</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="secondary" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" icon={AlertOctagon}>
              Report Breakdown & Halt Line
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. View Breakdown Details Modal */}
      {selectedBreakdown && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Breakdown Record: ${selectedBreakdown.id}`}
          subtitle={`${selectedBreakdown.assetName} (${selectedBreakdown.assetId})`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {renderStatusBadge(selectedBreakdown.status || "Open")}
                {renderSeverityBadge(getSeverity(selectedBreakdown))}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Reported: {selectedBreakdown.startTime}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Asset / Machine:</span>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedBreakdown.assetName}
                </div>
                <div style={{ fontSize: "11px", color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                  ID: {selectedBreakdown.assetId}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Line & Department:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedBreakdown.line || "Line 1"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {selectedBreakdown.department || "Packaging"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Failure Classification:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedBreakdown.failureCategory || "Mechanical"}
                </div>
                <div style={{ fontSize: "11px", color: "#EF4444", fontFamily: "var(--font-mono)" }}>
                  Code: {selectedBreakdown.failureCode || "MEC-004"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Reported By:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {getReportedBy(selectedBreakdown)}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Assigned Technician:</span>
                <div style={{ fontWeight: 600, color: "#38BDF8", marginTop: "2px" }}>
                  {selectedBreakdown.technician || "Unassigned"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Downtime Duration:</span>
                <div style={{ fontWeight: 700, color: "#EF4444", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                  {selectedBreakdown.durationMinutes || 0} minutes
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Related Work Order:</span>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                  {getRelatedWO(selectedBreakdown)}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Production Impact:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedBreakdown.impact?.downtimeCostUSD ? `$${selectedBreakdown.impact.downtimeCostUSD.toLocaleString()} USD` : "$3,500 USD"}
                </div>
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Observed Symptom:</span>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.4 }}>
                {selectedBreakdown.symptom}
              </p>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Resolution / Repair Action:</span>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.4 }}>
                {getResolution(selectedBreakdown)}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    navigate(`/maintenance/assets/${selectedBreakdown.assetId}`);
                  }}
                >
                  View Asset Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    navigate("/maintenance/history");
                  }}
                >
                  View History
                </Button>
              </div>

              <Button variant="primary" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Edit Breakdown Modal */}
      {selectedBreakdown && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Breakdown: ${selectedBreakdown.id}`}
          subtitle="Modify incident parameters and failure details"
        >
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Failure Classification</label>
                <select
                  className="form-select"
                  value={editForm.failureCategory}
                  onChange={(e) => setEditForm({ ...editForm, failureCategory: e.target.value })}
                >
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Pneumatic">Pneumatic</option>
                  <option value="Hydraulic">Hydraulic</option>
                  <option value="Software / Automation">Software / Automation</option>
                  <option value="Thermal">Thermal</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Failure Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.failureCode}
                  onChange={(e) => setEditForm({ ...editForm, failureCode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select
                  className="form-select"
                  value={editForm.severity}
                  onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Reported By</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.reportedBy}
                  onChange={(e) => setEditForm({ ...editForm, reportedBy: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Technician</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.technician}
                  onChange={(e) => setEditForm({ ...editForm, technician: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Symptom Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editForm.symptom}
                onChange={(e) => setEditForm({ ...editForm, symptom: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. Assign Technician Modal */}
      {selectedBreakdown && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Technician: ${selectedBreakdown.id}`}
          subtitle={`Dispatch specialist to resolve stoppage on ${selectedBreakdown.assetName}`}
        >
          <form onSubmit={handleConfirmAssign} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Select Specialist *</label>
              <select
                className="form-select"
                value={assignTech}
                onChange={(e) => setAssignTech(e.target.value)}
              >
                <option value="Marcus Vance">Marcus Vance (Senior Reliability Tech)</option>
                <option value="David Kim">David Kim (Hydraulic & Thermal Tech)</option>
                <option value="Elena Rostova">Elena Rostova (Electrical Specialist)</option>
                <option value="Carlos Mendez">Carlos Mendez (Mechanical Lead)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Quality Tech)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={UserCheck}>
                Confirm Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. Create Work Order Modal */}
      {selectedBreakdown && (
        <Modal
          isOpen={isCreateWOModalOpen}
          onClose={() => setIsCreateWOModalOpen(false)}
          title={`Create Work Order from ${selectedBreakdown.id}`}
          subtitle={`Auto-links work order to ${selectedBreakdown.assetName}`}
        >
          <form onSubmit={handleConfirmCreateWO} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Work Order Title</label>
              <input
                type="text"
                className="form-input"
                value={woForm.title}
                onChange={(e) => setWoForm({ ...woForm, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={woForm.priority}
                  onChange={(e) => setWoForm({ ...woForm, priority: e.target.value })}
                >
                  <option value="P1 - Critical">P1 - Critical (Emergency)</option>
                  <option value="P2 - High">P2 - High</option>
                  <option value="P3 - Medium">P3 - Medium</option>
                  <option value="P4 - Low">P4 - Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Order Type</label>
                <select
                  className="form-select"
                  value={woForm.type}
                  onChange={(e) => setWoForm({ ...woForm, type: e.target.value })}
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Overhaul">Overhaul</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Technician</label>
              <input
                type="text"
                className="form-input"
                value={woForm.technician}
                onChange={(e) => setWoForm({ ...woForm, technician: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="secondary" onClick={() => setIsCreateWOModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={Plus}>
                Create & Link Work Order
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Resolve Breakdown Modal */}
      {selectedBreakdown && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title={`Resolve Breakdown: ${selectedBreakdown.id}`}
          subtitle={`Log repair notes and restore ${selectedBreakdown.assetName} to Operational state`}
        >
          <form onSubmit={handleConfirmResolve} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Root Cause Identified</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Caustic CIP degradation of Viton seal causing bearing friction..."
                value={resolveForm.rootCause}
                onChange={(e) => setResolveForm({ ...resolveForm, rootCause: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Resolution Procedure / Action Taken *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe actions taken to restore machine to normal operating condition..."
                value={resolveForm.resolutionNotes}
                onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Parts Replaced</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BRG-6208, Viton Seal"
                  value={resolveForm.partsReplaced}
                  onChange={(e) => setResolveForm({ ...resolveForm, partsReplaced: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Actual Downtime (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={resolveForm.downtimeMinutes}
                  onChange={(e) => setResolveForm({ ...resolveForm, downtimeMinutes: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={CheckCircle2}>
                Confirm Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

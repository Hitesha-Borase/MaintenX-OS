import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Plus,
  Filter,
  Search,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ExternalLink,
  RotateCcw,
  Edit,
  Eye,
  UserCheck,
  Play,
  CheckSquare,
  Package,
  Calendar,
  Layers,
  FileText
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function WorkOrderList() {
  const {
    workOrders = [],
    addWorkOrder,
    updateWorkOrderStatus,
    startWorkOrder,
    completeWorkOrder,
    assets = []
  } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Filters State
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);

  // Forms State
  const [createForm, setCreateForm] = useState({
    title: "",
    assetId: assets[0]?.id || "AST-001",
    issue: "",
    priority: "P2 - High",
    type: "Corrective",
    technician: "Marcus Vance",
    dueDate: "2026-09-12"
  });

  const [editForm, setEditForm] = useState({
    title: "",
    issue: "",
    priority: "P2 - High",
    status: "Open",
    technician: "Marcus Vance",
    dueDate: "2026-09-12"
  });

  const [assignTech, setAssignTech] = useState("Marcus Vance");

  const [resolveForm, setResolveForm] = useState({
    resolution: "",
    repairAction: "",
    actualHours: 2.5
  });

  // KPI Calculations
  const openCount = workOrders.filter((w) => w.status === "Open" || w.status === "Assigned").length;
  const inProgressCount = workOrders.filter((w) => w.status === "In Progress").length;
  const criticalCount = workOrders.filter((w) => w.priority?.includes("P1")).length;
  const completedCount = workOrders.filter((w) => w.status === "Completed" || w.status === "Verified" || w.status === "Closed").length;

  // Filtered List
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesStatus = statusFilter === "ALL" || wo.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || wo.priority?.includes(priorityFilter);
      const matchesSearch =
        searchQuery === "" ||
        wo.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.assetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.assignedTechnician?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [workOrders, statusFilter, priorityFilter, searchQuery]);

  // Actions Handlers
  const handleOpenCreate = () => {
    setCreateForm({
      title: "",
      assetId: assets[0]?.id || "AST-001",
      issue: "",
      priority: "P2 - High",
      type: "Corrective",
      technician: "Marcus Vance",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10)
    });
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      addToast("Please provide work order title", "error");
      return;
    }
    const asset = assets.find((a) => a.id === createForm.assetId);
    const newWO = addWorkOrder({
      title: createForm.title,
      assetId: createForm.assetId,
      assetName: asset?.name || createForm.assetId,
      description: createForm.issue || createForm.title,
      type: createForm.type,
      priority: createForm.priority,
      assignedTechnician: createForm.technician,
      dueDate: createForm.dueDate,
      status: "Open"
    });
    addToast(`Work Order ${newWO.id} created successfully!`, "success");
    setIsCreateModalOpen(false);
  };

  const handleOpenView = (wo) => {
    setSelectedWO(wo);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (wo) => {
    setSelectedWO(wo);
    setEditForm({
      title: wo.title || "",
      issue: wo.description || wo.symptom || "",
      priority: wo.priority || "P2 - High",
      status: wo.status || "Open",
      technician: wo.assignedTechnician || "Marcus Vance",
      dueDate: wo.dueDate || "2026-09-12"
    });
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = (e) => {
    e.preventDefault();
    if (!selectedWO) return;
    updateWorkOrderStatus(selectedWO.id, editForm.status, `Updated parameters: ${editForm.title}`);
    selectedWO.title = editForm.title;
    selectedWO.description = editForm.issue;
    selectedWO.priority = editForm.priority;
    selectedWO.assignedTechnician = editForm.technician;
    selectedWO.dueDate = editForm.dueDate;
    addToast(`Work Order ${selectedWO.id} updated successfully.`, "success");
    setIsEditModalOpen(false);
  };

  const handleOpenAssign = (wo) => {
    setSelectedWO(wo);
    setAssignTech(wo.assignedTechnician || "Marcus Vance");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!selectedWO) return;
    selectedWO.assignedTechnician = assignTech;
    if (selectedWO.status === "Open") {
      updateWorkOrderStatus(selectedWO.id, "Assigned", `Dispatched technician ${assignTech}`);
    } else {
      addToast(`Reassigned ${selectedWO.id} to ${assignTech}`);
    }
    setIsAssignModalOpen(false);
  };

  const handleStartWO = (wo) => {
    startWorkOrder(wo.id);
    addToast(`Work order ${wo.id} started. Timer active.`, "info");
  };

  const handleOpenResolve = (wo) => {
    setSelectedWO(wo);
    setResolveForm({
      resolution: wo.resolution || "Replaced worn components, executed sensor calibration, and confirmed operating clearance.",
      repairAction: wo.repairAction || "Corrective overhaul completed according to OEM specification.",
      actualHours: wo.actualHours || 2.5
    });
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!selectedWO) return;
    completeWorkOrder(selectedWO.id, {
      resolution: resolveForm.resolution,
      repairAction: resolveForm.repairAction,
      actualHours: parseFloat(resolveForm.actualHours) || 2.5,
      status: "Completed"
    });
    addToast(`Work Order ${selectedWO.id} resolved and marked Completed!`, "success");
    setIsResolveModalOpen(false);
  };

  const handleOpenClose = (wo) => {
    setSelectedWO(wo);
    setIsCloseModalOpen(true);
  };

  const handleConfirmClose = (e) => {
    e.preventDefault();
    if (!selectedWO) return;
    updateWorkOrderStatus(selectedWO.id, "Closed", "Supervisor inspection verified and signed off.");
    addToast(`Work Order ${selectedWO.id} verified and Closed.`, "success");
    setIsCloseModalOpen(false);
  };

  // Badge Helpers
  const renderPriorityBadge = (priority) => {
    const isP1 = priority?.includes("P1");
    const isP2 = priority?.includes("P2");
    return <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>{priority}</Badge>;
  };

  const renderStatusBadge = (status) => {
    const variant =
      status === "In Progress"
        ? "cyan"
        : status === "Completed" || status === "Verified"
        ? "emerald"
        : status === "Waiting for Parts"
        ? "amber"
        : status === "Closed"
        ? "slate"
        : "blue";
    return <Badge variant={variant} dot={status === "In Progress"}>{status}</Badge>;
  };

  // Table Columns
  const columns = [
    {
      header: "WO ID",
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
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "var(--accent-amber)", flexShrink: 0 }}>
            <Wrench size={16} />
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{row.id}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{row.type || "Corrective"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Asset",
      accessor: "assetName",
      headerStyle: { minWidth: "150px" },
      cellStyle: { minWidth: "150px" },
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8" }}>{row.assetId}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetName}</div>
        </div>
      )
    },
    {
      header: "Issue / Title",
      accessor: "title",
      headerStyle: { minWidth: "220px" },
      cellStyle: { minWidth: "220px" },
      render: (val, row) => (
        <div style={{ maxWidth: "260px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.description || row.symptom || val}
          </div>
        </div>
      )
    },
    {
      header: "Priority",
      accessor: "priority",
      headerStyle: { minWidth: "110px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "110px", whiteSpace: "nowrap" },
      render: (val) => renderPriorityBadge(val)
    },
    {
      header: "Technician",
      accessor: "assignedTechnician",
      headerStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      render: (val) => (
        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
          {val || "Unassigned"}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      headerStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      render: (val) => renderStatusBadge(val)
    },
    {
      header: "Dates (Created / Due)",
      accessor: "dueDate",
      headerStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "140px", whiteSpace: "nowrap" },
      render: (val, row) => (
        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
          <div style={{ color: "var(--text-muted)" }}>{row.createdDate || "2026-09-01"}</div>
          <div style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Due: {val || "2026-09-10"}</div>
        </div>
      )
    },
    {
      header: "Resolution / Completion",
      accessor: "resolution",
      headerStyle: { minWidth: "160px", whiteSpace: "nowrap" },
      cellStyle: { minWidth: "160px", whiteSpace: "nowrap" },
      render: (_, row) => {
        const isDone = row.status === "Completed" || row.status === "Verified" || row.status === "Closed";
        return (
          <div style={{ fontSize: "11px" }}>
            <span style={{ color: isDone ? "#10B981" : "var(--text-muted)", fontWeight: isDone ? 600 : 400 }}>
              {isDone ? (row.resolution || "Resolved & Verified") : "Pending Work"}
            </span>
            {row.actualHours && (
              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {row.actualHours} hrs logged
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      headerStyle: {
        width: "270px",
        minWidth: "270px",
        textAlign: "right",
        whiteSpace: "nowrap",
        paddingRight: "20px"
      },
      cellStyle: {
        width: "270px",
        minWidth: "270px",
        textAlign: "right",
        whiteSpace: "nowrap",
        paddingRight: "20px"
      },
      render: (_, row) => {
        const isClosed = row.status === "Closed";
        const isCompleted = row.status === "Completed" || row.status === "Verified";
        const isInProgress = row.status === "In Progress";
        const isOpen = row.status === "Open" || row.status === "Assigned";
        const isUnassigned = !row.assignedTechnician || row.assignedTechnician === "Unassigned";

        return (
          <div className="table-actions-strip" onClick={(e) => e.stopPropagation()}>
            {/* View Button */}
            <button
              type="button"
              className="table-btn table-btn-view"
              onClick={() => handleOpenView(row)}
              title="View Work Order Dossier"
            >
              <Eye size={13} color="#C89547" />
              <span>View</span>
            </button>

            {/* Edit Button (if not closed) */}
            {!isClosed && (
              <button
                type="button"
                className="table-btn table-btn-edit"
                onClick={() => handleOpenEdit(row)}
                title="Edit Work Order"
              >
                <Edit size={13} color="#8C5B23" />
                <span>Edit</span>
              </button>
            )}

            {/* Contextual Action: Assign (if open & unassigned) */}
            {isOpen && isUnassigned && (
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

            {/* Contextual Action: Start (if open & assigned) */}
            {isOpen && !isUnassigned && (
              <button
                type="button"
                className="table-btn table-btn-start"
                onClick={() => handleStartWO(row)}
                title="Start Work Order Timer"
              >
                <Play size={11} fill="#261603" />
                <span>Start</span>
              </button>
            )}

            {/* Contextual Action: Resolve (if In Progress) */}
            {isInProgress && (
              <button
                type="button"
                className="table-btn table-btn-resolve"
                onClick={() => handleOpenResolve(row)}
                title="Resolve Work Order"
              >
                <CheckCircle2 size={13} />
                <span>Resolve</span>
              </button>
            )}

            {/* Contextual Action: Close (if Completed & unclosed) */}
            {isCompleted && !isClosed && (
              <button
                type="button"
                className="table-btn table-btn-close"
                onClick={() => handleOpenClose(row)}
                title="Close Work Order"
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
      {/* Header & Create Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Work Orders
            </h1>
            <Badge variant="cyan">{workOrders.length} Total Orders</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Manage scheduled, corrective and emergency maintenance tasks across all factory cells
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%"
        }}
      >
        <StatCard
          title="Open / Assigned"
          value={`${openCount}`}
          unit="orders"
          trend={{ value: `${openCount} tasks pending`, isPositive: openCount === 0, text: "scheduled" }}
          icon={Wrench}
          colorVariant="amber"
          onClick={() => setStatusFilter("Open")}
        />
        <StatCard
          title="In Progress"
          value={`${inProgressCount}`}
          unit="active"
          trend={{ value: "Work underway", isPositive: true, text: "shop floor" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => setStatusFilter("In Progress")}
        />
        <StatCard
          title="P1 Critical Tasks"
          value={`${criticalCount}`}
          unit="urgent"
          trend={{ value: criticalCount > 0 ? "Immediate Priority" : "Zero Critical", isPositive: criticalCount === 0, text: "safety & downtime" }}
          icon={AlertOctagon}
          colorVariant={criticalCount > 0 ? "rose" : "emerald"}
          onClick={() => setPriorityFilter("P1")}
        />
        <StatCard
          title="Completed & Closed"
          value={`${completedCount}`}
          unit="verified"
          trend={{ value: "98.2% On-time SLA", isPositive: true, text: "maintenance SLA" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => setStatusFilter("Completed")}
        />
      </div>

      {/* Filters Toolbar */}
      <Card style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
              <input
                type="text"
                placeholder="Search WO ID, asset, issue, technician..."
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
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>PRIORITY:</span>
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ fontSize: "12px", height: "36px", width: "auto" }}
              >
                <option value="ALL">All Priorities</option>
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>
          </div>

          {(statusFilter !== "ALL" || priorityFilter !== "ALL" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
                setSearchQuery("");
              }}
              style={{ fontSize: "12px" }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table */}
      <Card style={{ padding: "16px 20px" }}>
        <DataTable
          title="Work Order Registry"
          columns={columns}
          data={filteredWorkOrders}
          searchPlaceholder="Search order ID, asset, technician, issue..."
          onRowClick={(row) => handleOpenView(row)}
          exportFilename="maintenx_work_orders.csv"
        />
      </Card>

      {/* 1. Create Work Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Maintenance Work Order"
        subtitle="Schedule servicing, corrective repair, or emergency restoration"
      >
        <form onSubmit={handleConfirmCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Work Order Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Overhaul lower spindle bearing and replace shaft seal"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Target Asset *</label>
              <select
                className="form-select"
                value={createForm.assetId}
                onChange={(e) => setCreateForm({ ...createForm, assetId: e.target.value })}
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Order Type</label>
              <select
                className="form-select"
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              >
                <option value="Corrective">Corrective Repair</option>
                <option value="Preventive">Preventive Maintenance</option>
                <option value="Emergency">Emergency Stoppage</option>
                <option value="Inspection">Inspection & Calibration</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select"
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
              >
                <option value="P1 - Critical">P1 - Critical (Immediate)</option>
                <option value="P2 - High">P2 - High</option>
                <option value="P3 - Medium">P3 - Medium</option>
                <option value="P4 - Low">P4 - Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Specialist</label>
            <select
              className="form-select"
              value={createForm.technician}
              onChange={(e) => setCreateForm({ ...createForm, technician: e.target.value })}
            >
              <option value="Marcus Vance">Marcus Vance (Senior Reliability Tech)</option>
              <option value="David Kim">David Kim (Hydraulic & Thermal Tech)</option>
              <option value="Elena Rostova">Elena Rostova (Electrical Specialist)</option>
              <option value="Carlos Mendez">Carlos Mendez (Mechanical Lead)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Details & Instructions</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide technical guidance, safety precautions, or required spares..."
              value={createForm.issue}
              onChange={(e) => setCreateForm({ ...createForm, issue: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus}>
              Create Work Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. View Work Order Modal */}
      {selectedWO && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Work Order: ${selectedWO.id}`}
          subtitle={`${selectedWO.assetName} (${selectedWO.assetId})`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {renderStatusBadge(selectedWO.status || "Open")}
                {renderPriorityBadge(selectedWO.priority || "P2 - High")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Created: {selectedWO.createdDate || "2026-09-01"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Work Order Title:</span>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedWO.title}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Target Machine:</span>
                <div style={{ fontWeight: 600, color: "#38BDF8", marginTop: "2px" }}>
                  {selectedWO.assetId} — {selectedWO.assetName}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Assigned Technician:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedWO.assignedTechnician || "Unassigned"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Due Date:</span>
                <div style={{ fontWeight: 600, color: "#F59E0B", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                  {selectedWO.dueDate || "2026-09-12"}
                </div>
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Issue / Description:</span>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.4 }}>
                {selectedWO.description || selectedWO.symptom || selectedWO.title}
              </p>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Resolution / Completion Notes:</span>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.4 }}>
                {selectedWO.resolution || selectedWO.repairAction || "Pending completion"}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", flexWrap: "wrap", gap: "8px" }}>
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                onClick={() => {
                  setIsViewModalOpen(false);
                  navigate(`/maintenance/work-orders/${selectedWO.id}`);
                }}
              >
                Open Full WO Page
              </Button>

              <Button variant="primary" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Edit Work Order Modal */}
      {selectedWO && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Work Order: ${selectedWO.id}`}
          subtitle="Update parameters, priority, or due date"
        >
          <form onSubmit={handleConfirmEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                >
                  <option value="P1 - Critical">P1 - Critical</option>
                  <option value="P2 - High">P2 - High</option>
                  <option value="P3 - Medium">P3 - Medium</option>
                  <option value="P4 - Low">P4 - Low</option>
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
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Parts">Waiting for Parts</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Assigned Technician</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.technician}
                  onChange={(e) => setEditForm({ ...editForm, technician: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Details</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editForm.issue}
                onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })}
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
      {selectedWO && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Technician: ${selectedWO.id}`}
          subtitle={`Allocate specialist to ${selectedWO.title}`}
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
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={UserCheck}>
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. Resolve Work Order Modal */}
      {selectedWO && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title={`Resolve Work Order: ${selectedWO.id}`}
          subtitle={`Log repair action and mark ${selectedWO.title} completed`}
        >
          <form onSubmit={handleConfirmResolve} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Resolution Summary *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe specific repair or servicing steps executed..."
                value={resolveForm.resolution}
                onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Actual Labour Hours</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={resolveForm.actualHours}
                onChange={(e) => setResolveForm({ ...resolveForm, actualHours: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={CheckCircle2}>
                Resolve Work Order
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Close Work Order Modal */}
      {selectedWO && (
        <Modal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          title={`Close & Verify Work Order: ${selectedWO.id}`}
          subtitle="Supervisor sign-off and completion confirmation"
        >
          <form onSubmit={handleConfirmClose} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#10B981" }}>
                Ready to Close
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                All repairs for {selectedWO.id} have been completed. Closing locks the work order and records it to historical audit logs.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button variant="secondary" onClick={() => setIsCloseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={CheckSquare}>
                Confirm & Close
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

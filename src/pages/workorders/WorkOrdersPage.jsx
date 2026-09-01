import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  X,
  MessageSquare,
  Send,
  Eye,
  Calendar,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function WorkOrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewIdParam = searchParams.get("view");

  const { workOrders = [], addWorkOrder, updateWorkOrderStatus, addWorkOrderComment, assets = [], failureCodes = [] } = useCMMS();
  const { addToast } = useApp();

  // Determine active tab based on route
  const getInitialTab = () => {
    if (location.pathname.includes("/corrective")) return "corrective";
    if (location.pathname.includes("/preventive")) return "preventive";
    if (location.pathname.includes("/completed")) return "completed";
    return "open"; // default to open
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Synchronize tab with route change
  useEffect(() => {
    if (location.pathname.includes("/corrective")) setActiveTab("corrective");
    else if (location.pathname.includes("/preventive")) setActiveTab("preventive");
    else if (location.pathname.includes("/completed")) setActiveTab("completed");
    else setActiveTab("open");
  }, [location.pathname]);

  // Selected Work Order for Detail Modal
  const [selectedWO, setSelectedWO] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Sync param view
  useEffect(() => {
    if (viewIdParam) {
      const found = workOrders.find((w) => w.id === viewIdParam);
      if (found) setSelectedWO(found);
    }
  }, [viewIdParam, workOrders]);

  // Create Work Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    assetId: "FM-001",
    type: "Corrective",
    priority: "P2 - High",
    department: "Packaging",
    assignedTechnician: "Marcus Vance (Senior Tech)",
    failureCode: "MEC-004",
    symptom: "",
    description: "",
    estimatedHours: 2.0
  });

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/work-orders/${tabKey}`);
  };

  // Filter logic
  const filteredWorkOrders = workOrders.filter((wo) => {
    // Tab filter
    if (activeTab === "open") {
      if (wo.status === "Completed" || wo.status === "Closed") return false;
    } else if (activeTab === "corrective") {
      if (wo.type !== "Corrective" && wo.type !== "Emergency Breakdown") return false;
    } else if (activeTab === "preventive") {
      if (wo.type !== "Preventive" && wo.type !== "Inspection") return false;
    } else if (activeTab === "completed") {
      if (wo.status !== "Completed" && wo.status !== "Closed" && wo.status !== "Verified") return false;
    }

    const matchesSearch =
      wo.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedTechnician?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || wo.priority?.includes(priorityFilter);
    const matchesDept = deptFilter === "ALL" || wo.department === deptFilter;

    return matchesSearch && matchesPriority && matchesDept;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createFormData.title) {
      addToast("Please provide a work order title.", "warning");
      return;
    }

    const targetAsset = assets.find((a) => a.id === createFormData.assetId);
    const newWO = addWorkOrder({
      ...createFormData,
      assetName: targetAsset?.name || createFormData.assetId
    });

    addToast(`Work Order ${newWO?.id || "NEW"} created successfully!`, "success");
    setIsCreateModalOpen(false);
    setCreateFormData({
      title: "",
      assetId: "FM-001",
      type: "Corrective",
      priority: "P2 - High",
      department: "Packaging",
      assignedTechnician: "Marcus Vance (Senior Tech)",
      failureCode: "MEC-004",
      symptom: "",
      description: "",
      estimatedHours: 2.0
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedWO) return;
    addWorkOrderComment(selectedWO.id, newCommentText);
    setNewCommentText("");
    addToast("Comment posted.", "info");
    // Update local selected
    setSelectedWO((prev) => ({
      ...prev,
      comments: [
        ...(prev.comments || []),
        {
          user: "Marcus Vance",
          time: new Date().toISOString().replace("T", " ").substring(0, 16),
          text: newCommentText
        }
      ]
    }));
  };

  const handleExportCSV = () => {
    const headers = "WO Number,Title,Asset ID,Asset Name,Type,Priority,Status,Assigned Tech,Created Date\n";
    const rows = filteredWorkOrders
      .map(
        (w) =>
          `"${w.id}","${w.title}","${w.assetId}","${w.assetName}","${w.type}","${w.priority}","${w.status}","${w.assignedTechnician}","${w.createdDate}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Work_Orders_${activeTab}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Work Orders exported to CSV.", "info");
  };

  // KPI counters
  const openCount = workOrders.filter((w) => w.status !== "Closed" && w.status !== "Completed").length;
  const correctiveCount = workOrders.filter((w) => (w.type === "Corrective" || w.type === "Emergency Breakdown") && w.status !== "Closed").length;
  const preventiveCount = workOrders.filter((w) => w.type === "Preventive").length;
  const completedCount = workOrders.filter((w) => w.status === "Completed" || w.status === "Closed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Work Orders Hub
            </h1>
            <Badge variant="amber">{openCount} ACTIVE WOS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + New Work Order
          </Button>
        </div>
      </div>

      {/* KPI Ticker Summary - 2x2 grid on mobile, 4 on desktop */}
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
          title="Open Work Orders"
          value={openCount.toString()}
          unit="Active"
          trend={{ value: `${workOrders.filter((w) => w.priority?.includes("P1") && w.status !== "Closed").length} Critical (P1)`, isPositive: false, text: "" }}
          icon={ClipboardList}
          colorVariant="blue"
          onClick={() => handleTabChange("open")}
        />
        <StatCard
          title="Corrective Actions"
          value={correctiveCount.toString()}
          unit="Unplanned"
          trend={{ value: "Breakdown & triage repairs", isPositive: false, text: "" }}
          icon={Wrench}
          colorVariant="amber"
          onClick={() => handleTabChange("corrective")}
        />
        <StatCard
          title="Preventive Maintenance"
          value={preventiveCount.toString()}
          unit="Scheduled"
          trend={{ value: "Checklists & routines", isPositive: true, text: "" }}
          icon={Calendar}
          colorVariant="emerald"
          onClick={() => handleTabChange("preventive")}
        />
        <StatCard
          title="Completed & Closed"
          value={completedCount.toString()}
          unit="Signed off"
          trend={{ value: "100% QA verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => handleTabChange("completed")}
        />
      </div>

      {/* Main Tabs Navigation Card */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", gap: "8px", marginBottom: "16px", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "4px" }}>
          <button
            onClick={() => handleTabChange("open")}
            style={{
              padding: "8px 14px",
              background: activeTab === "open" ? "rgba(200, 149, 71, 0.12)" : "transparent",
              border: "none",
              borderBottom: activeTab === "open" ? "2px solid #C89547" : "2px solid transparent",
              borderRadius: "6px 6px 0 0",
              color: activeTab === "open" ? "#8C5B23" : "var(--text-secondary)",
              fontWeight: activeTab === "open" ? 800 : 500,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            <ClipboardList size={14} />
            <span>Open Work Orders</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(200, 149, 71, 0.2)", color: "#8C5B23", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {openCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("corrective")}
            style={{
              padding: "8px 14px",
              background: activeTab === "corrective" ? "rgba(200, 149, 71, 0.12)" : "transparent",
              border: "none",
              borderBottom: activeTab === "corrective" ? "2px solid #C89547" : "2px solid transparent",
              borderRadius: "6px 6px 0 0",
              color: activeTab === "corrective" ? "#8C5B23" : "var(--text-secondary)",
              fontWeight: activeTab === "corrective" ? 800 : 500,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            <Wrench size={14} />
            <span>Corrective</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#D97706", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {correctiveCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("preventive")}
            style={{
              padding: "8px 14px",
              background: activeTab === "preventive" ? "rgba(200, 149, 71, 0.12)" : "transparent",
              border: "none",
              borderBottom: activeTab === "preventive" ? "2px solid #C89547" : "2px solid transparent",
              borderRadius: "6px 6px 0 0",
              color: activeTab === "preventive" ? "#8C5B23" : "var(--text-secondary)",
              fontWeight: activeTab === "preventive" ? 800 : 500,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            <Calendar size={14} />
            <span>Preventive</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#059669", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {preventiveCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("completed")}
            style={{
              padding: "8px 14px",
              background: activeTab === "completed" ? "rgba(200, 149, 71, 0.12)" : "transparent",
              border: "none",
              borderBottom: activeTab === "completed" ? "2px solid #C89547" : "2px solid transparent",
              borderRadius: "6px 6px 0 0",
              color: activeTab === "completed" ? "#8C5B23" : "var(--text-secondary)",
              fontWeight: activeTab === "completed" ? 800 : 500,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            <CheckCircle2 size={14} />
            <span>Completed</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(52, 211, 153, 0.2)", color: "#059669", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between", width: "100%" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "10px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Priority:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "110px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Dept:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "115px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Depts</option>
                <option value="Packaging">Packaging</option>
                <option value="Processing">Processing</option>
                <option value="Facilities & Utilities">Facilities & Utilities</option>
                <option value="Warehouse & Shipping">Warehouse & Shipping</option>
              </select>
            </div>

            {(searchQuery || priorityFilter !== "ALL" || deptFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPriorityFilter("ALL");
                  setDeptFilter("ALL");
                }}
                style={{
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Work Orders Data Table Container with Horizontal Slide */}
        <div
          className="data-table-container"
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            display: "block",
            boxSizing: "border-box"
          }}
        >
          <table className="data-table" style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "110px" }}>WO Number</th>
                <th style={{ minWidth: "160px" }}>Title / Description</th>
                <th style={{ minWidth: "120px" }}>Asset / Location</th>
                <th style={{ minWidth: "90px" }}>Type</th>
                <th style={{ minWidth: "80px" }}>Priority</th>
                <th style={{ minWidth: "100px" }}>Status</th>
                <th style={{ minWidth: "120px" }}>Assigned Tech</th>
                <th style={{ minWidth: "110px" }}>Status Action</th>
                <th style={{ minWidth: "70px", textAlign: "right" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No work orders matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredWorkOrders.map((wo) => {
                  const isP1 = wo.priority?.includes("P1");
                  const isP2 = wo.priority?.includes("P2");
                  const isCompleted = wo.status === "Completed" || wo.status === "Closed";

                  return (
                    <tr key={wo.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{wo.id}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{wo.createdDate?.substring(0, 10)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>{wo.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {wo.symptom || wo.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#0284C7", fontSize: "12px" }}>{wo.assetId}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{wo.line}</div>
                      </td>
                      <td>
                        <Badge variant="slate">{wo.type}</Badge>
                      </td>
                      <td>
                        <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>
                          {wo.priority?.split(" - ")[0]}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={isCompleted ? "emerald" : wo.status === "In Progress" ? "cyan" : "amber"}>
                          {wo.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {wo.assignedTechnician}
                      </td>
                      <td>
                        {/* Status Advancement Quick Buttons */}
                        {wo.status === "Open" && (
                          <button
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "In Progress", "Technician dispatched to asset.");
                              addToast(`WO ${wo.id} set to In Progress`, "info");
                            }}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "var(--bg-card-subtle)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-primary)",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Start Work
                          </button>
                        )}
                        {wo.status === "In Progress" && (
                          <button
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "Completed", "Repair completed and verified.");
                              addToast(`WO ${wo.id} marked as Completed!`, "success");
                            }}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                              color: "#261603",
                              border: "1px solid #E8C182",
                              boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Complete
                          </button>
                        )}
                        {wo.status === "Waiting for Parts" && (
                          <button
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "In Progress", "Parts arrived. Resuming work.");
                              addToast(`WO ${wo.id} resumed!`, "info");
                            }}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "var(--bg-card-subtle)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-primary)",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Resume Work
                          </button>
                        )}
                        {wo.status === "Completed" && (
                          <button
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "Closed", "Administrative close-out.");
                              addToast(`WO ${wo.id} officially Closed.`, "success");
                            }}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "transparent",
                              border: "1px solid #10B981",
                              color: "#059669",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Close WO
                          </button>
                        )}
                        {wo.status === "Closed" && (
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 800 }}>● Closed</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => {
                            setSelectedWO(wo);
                            setSearchParams({ view: wo.id });
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL MODAL / DRAWER */}
      {selectedWO && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelectedWO(null);
            setSearchParams({});
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: "660px", maxHeight: "90vh", overflowY: "auto", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#0284C7", fontWeight: 800 }}>{selectedWO.id}</span>
                  <Badge variant={selectedWO.priority?.includes("P1") ? "rose" : "amber"}>{selectedWO.priority}</Badge>
                  <Badge variant={selectedWO.status === "Completed" ? "emerald" : "cyan"}>{selectedWO.status}</Badge>
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {selectedWO.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedWO(null);
                  setSearchParams({});
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Asset & Tech Banner */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Asset:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedWO.assetName} ({selectedWO.assetId})</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Assigned Technician:</span>
                  <div style={{ fontWeight: 700, color: "#0284C7" }}>{selectedWO.assignedTechnician}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Failure Code:</span>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedWO.failureCode || "N/A"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Created Date:</span>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedWO.createdDate}</div>
                </div>
              </div>

              {/* Symptom & Description */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Symptom & Investigation Findings
                </h4>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, backgroundColor: "var(--bg-card-subtle)", padding: "10px", borderRadius: "6px" }}>
                  {selectedWO.symptom || selectedWO.description || "Routine maintenance inspection task."}
                </div>
              </div>

              {/* Parts Required / Used */}
              {selectedWO.partsRequired && selectedWO.partsRequired.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Parts Requisitioned ({selectedWO.partsRequired.length})
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedWO.partsRequired.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "var(--bg-card-subtle)",
                          borderRadius: "6px",
                          fontSize: "12px"
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>{p.partNo}</strong> — {p.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span>Qty: {p.qty}</span>
                          <Badge variant="cyan">{p.status || "Allocated"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Log / Comments */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Technician Activity Log & Notes
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", marginBottom: "10px" }}>
                  {selectedWO.comments && selectedWO.comments.length > 0 ? (
                    selectedWO.comments.map((c, i) => (
                      <div key={i} style={{ padding: "8px 10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", fontSize: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "10px", marginBottom: "3px" }}>
                          <strong>{c.user}</strong>
                          <span>{c.time}</span>
                        </div>
                        <div style={{ color: "var(--text-primary)" }}>{c.text}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", padding: "6px 0" }}>
                      No comments logged yet.
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Add maintenance note or observation..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, backgroundColor: "#FFFFFF" }}
                  />
                  <Button variant="primary" type="submit" icon={Send} size="sm">
                    Post
                  </Button>
                </form>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedWO(null);
                    setSearchParams({});
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Create Maintenance Work Order
                </h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Work Order Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Excessive Vibration on Main Drive Inverter"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset *</label>
                  <select
                    className="form-select"
                    value={createFormData.assetId}
                    onChange={(e) => setCreateFormData({ ...createFormData, assetId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Work Order Type</label>
                  <select
                    className="form-select"
                    value={createFormData.type}
                    onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Corrective">Corrective</option>
                    <option value="Emergency Breakdown">Emergency Breakdown</option>
                    <option value="Preventive">Preventive</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={createFormData.priority}
                    onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="P1 - Critical">P1 - Critical (Stoppage)</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Assigned Technician</label>
                  <input
                    type="text"
                    value={createFormData.assignedTechnician}
                    onChange={(e) => setCreateFormData({ ...createFormData, assignedTechnician: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={createFormData.department}
                    onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Processing">Processing</option>
                    <option value="Facilities & Utilities">Facilities & Utilities</option>
                    <option value="Warehouse & Shipping">Warehouse & Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Estimated Labor Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={createFormData.estimatedHours}
                    onChange={(e) => setCreateFormData({ ...createFormData, estimatedHours: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Symptom & Failure Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe abnormal noise, error codes on HMI, or physical damage observed..."
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Generate Work Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

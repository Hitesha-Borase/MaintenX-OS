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

  const { workOrders, addWorkOrder, updateWorkOrderStatus, addWorkOrderComment, assets, failureCodes } = useCMMS();
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
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedTechnician?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || wo.priority.includes(priorityFilter);
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

    addToast(`Work Order ${newWO.id} created successfully!`, "success");
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Work Orders Hub
            </h1>
            <Badge variant="amber">{openCount} Active WOs</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage dispatch triage, corrective interventions, scheduled PM tasks, and historical completion sign-offs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            + New Work Order
          </Button>
        </div>
      </div>

      {/* KPI Ticker Summary */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Open Work Orders"
          value={openCount.toString()}
          unit="Active"
          trend={{ value: `${workOrders.filter((w) => w.priority.includes("P1") && w.status !== "Closed").length} Critical (P1)`, isPositive: false, text: "" }}
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

      {/* Main Tabs Navigation */}
      <Card>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", gap: "10px", marginBottom: "16px", overflowX: "auto" }}>
          <button
            onClick={() => handleTabChange("open")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "open" ? "2px solid #38BDF8" : "2px solid transparent",
              color: activeTab === "open" ? "#38BDF8" : "var(--text-secondary)",
              fontWeight: activeTab === "open" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <ClipboardList size={15} />
            <span>Open Work Orders</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(56, 189, 248, 0.2)", color: "#38BDF8", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {openCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("corrective")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "corrective" ? "2px solid #F59E0B" : "2px solid transparent",
              color: activeTab === "corrective" ? "#F59E0B" : "var(--text-secondary)",
              fontWeight: activeTab === "corrective" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Wrench size={15} />
            <span>Corrective</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {correctiveCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("preventive")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "preventive" ? "2px solid #10B981" : "2px solid transparent",
              color: activeTab === "preventive" ? "#10B981" : "var(--text-secondary)",
              fontWeight: activeTab === "preventive" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Calendar size={15} />
            <span>Preventive</span>
          </button>

          <button
            onClick={() => handleTabChange("completed")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "completed" ? "2px solid #34D399" : "2px solid transparent",
              color: activeTab === "completed" ? "#34D399" : "var(--text-secondary)",
              fontWeight: activeTab === "completed" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <CheckCircle2 size={15} />
            <span>Completed</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(52, 211, 153, 0.2)", color: "#34D399", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by WO ID, Title, Equipment, Technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Priority:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "120px", fontSize: "12px" }}
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Department:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "130px", fontSize: "12px" }}
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
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("ALL");
                setDeptFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Work Orders Data Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>WO Number</th>
                <th>Title / Description</th>
                <th>Asset / Location</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Tech</th>
                <th>Status Action</th>
                <th>Details</th>
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
                  const isP1 = wo.priority.includes("P1");
                  const isP2 = wo.priority.includes("P2");
                  const isCompleted = wo.status === "Completed" || wo.status === "Closed";

                  return (
                    <tr key={wo.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{wo.id}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{wo.createdDate?.substring(0, 10)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{wo.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {wo.symptom || wo.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#38BDF8" }}>{wo.assetId}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{wo.line}</div>
                      </td>
                      <td>
                        <Badge variant="slate">{wo.type}</Badge>
                      </td>
                      <td>
                        <Badge variant={isP1 ? "rose" : isP2 ? "amber" : "cyan"}>
                          {wo.priority.split(" - ")[0]}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={isCompleted ? "emerald" : wo.status === "In Progress" ? "cyan" : "amber"}>
                          {wo.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                        {wo.assignedTechnician}
                      </td>
                      <td>
                        {/* Status Advancement Quick Buttons */}
                        {wo.status === "Open" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "In Progress", "Technician dispatched to asset.");
                              addToast(`WO ${wo.id} set to In Progress`, "info");
                            }}
                          >
                            Start Work
                          </Button>
                        )}
                        {wo.status === "In Progress" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "Completed", "Repair completed and verified.");
                              addToast(`WO ${wo.id} marked as Completed!`, "success");
                            }}
                          >
                            Complete
                          </Button>
                        )}
                        {wo.status === "Waiting for Parts" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "In Progress", "Parts arrived. Resuming work.");
                              addToast(`WO ${wo.id} resumed!`, "info");
                            }}
                          >
                            Resume Work
                          </Button>
                        )}
                        {wo.status === "Completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              updateWorkOrderStatus(wo.id, "Closed", "Administrative close-out.");
                              addToast(`WO ${wo.id} officially Closed.`, "success");
                            }}
                          >
                            Close WO
                          </Button>
                        )}
                        {wo.status === "Closed" && (
                          <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Closed</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            setSelectedWO(wo);
                            setSearchParams({ view: wo.id });
                          }}
                        >
                          View
                        </Button>
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#38BDF8", fontWeight: 700 }}>{selectedWO.id}</span>
                  <Badge variant={selectedWO.priority.includes("P1") ? "rose" : "amber"}>{selectedWO.priority}</Badge>
                  <Badge variant={selectedWO.status === "Completed" ? "emerald" : "cyan"}>{selectedWO.status}</Badge>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
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
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Asset & Tech Banner */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Asset:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedWO.assetName} ({selectedWO.assetId})</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Assigned Technician:</span>
                  <div style={{ fontWeight: 700, color: "#38BDF8" }}>{selectedWO.assignedTechnician}</div>
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
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, backgroundColor: "var(--bg-card-subtle)", padding: "10px", borderRadius: "6px" }}>
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
                          <strong style={{ color: "#FFFFFF" }}>{p.partNo}</strong> — {p.name}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", marginBottom: "10px" }}>
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
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px" }}>No comments logged yet.</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Add work order note or repair finding..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, height: "36px" }}
                  />
                  <Button variant="secondary" size="sm" icon={Send} type="submit">
                    Post Note
                  </Button>
                </form>
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {selectedWO.status !== "Completed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        updateWorkOrderStatus(selectedWO.id, "Completed", "Signed off by technician.");
                        addToast(`WO ${selectedWO.id} completed!`, "success");
                        setSelectedWO((prev) => ({ ...prev, status: "Completed" }));
                      }}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {selectedWO.status === "In Progress" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateWorkOrderStatus(selectedWO.id, "Waiting for Parts", "Waiting on warehouse delivery.");
                        addToast(`WO ${selectedWO.id} put on hold for parts.`, "warning");
                        setSelectedWO((prev) => ({ ...prev, status: "Waiting for Parts" }));
                      }}
                    >
                      Hold for Parts
                    </Button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedWO(null);
                    setSearchParams({});
                  }}
                >
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create New Work Order
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Work Order Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect drive bearing rattle and replace Viton seal"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset *</label>
                  <select
                    className="form-select"
                    value={createFormData.assetId}
                    onChange={(e) => setCreateFormData({ ...createFormData, assetId: e.target.value })}
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
                  >
                    <option value="Corrective">Corrective</option>
                    <option value="Preventive">Preventive</option>
                    <option value="Emergency Breakdown">Emergency Breakdown</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Calibration">Calibration</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-select"
                    value={createFormData.priority}
                    onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value })}
                  >
                    <option value="P1 - Critical">P1 - Critical (Immediate Stoppage)</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Failure Code</label>
                  <select
                    className="form-select"
                    value={createFormData.failureCode}
                    onChange={(e) => setCreateFormData({ ...createFormData, failureCode: e.target.value })}
                  >
                    {failureCodes.map((fc) => (
                      <option key={fc.code} value={fc.code}>
                        {fc.code} — {fc.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Assigned Technician</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance (Senior Tech)"
                  value={createFormData.assignedTechnician}
                  onChange={(e) => setCreateFormData({ ...createFormData, assignedTechnician: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Symptom / Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe failure symptoms, observed abnormal noise, pressure drop, etc."
                  value={createFormData.symptom}
                  onChange={(e) => setCreateFormData({ ...createFormData, symptom: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Dispatch Work Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

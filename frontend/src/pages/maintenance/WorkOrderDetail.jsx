import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Package,
  FileCheck,
  Send,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { maintenanceService } from "../../services/maintenanceService";

export function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useRole();
  const isPlantManager = currentRole?.id === "plant_manager";
  const managerName = currentRole?.user?.name
    ? `${currentRole.user.name} (${currentRole.label || "Plant Manager"})`
    : "Arthur Sterling (Plant Manager)";

  const {
    workOrders,
    updateWorkOrder,
    refreshWorkOrders,
    updateWorkOrderStatus,
    startWorkOrder,
    completeWorkOrder,
    addVerifiedSolution,
    issueSparePart,
    spareParts
  } = useCMMS();
  const { addToast } = useApp();

  const wo = workOrders.find((w) => w.id === id || w.woNumber === id || w.dbId === id) || workOrders[0];

  const [commentText, setCommentText] = useState("");
  const [repairActionText, setRepairActionText] = useState(wo?.repairAction || "");
  const [testResultText, setTestResultText] = useState(wo?.testResult || "");
  const [actualHoursInput, setActualHoursInput] = useState(
    wo?.actualHours != null && wo.actualHours !== "" ? String(wo.actualHours) : "0"
  );
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [supervisorName, setSupervisorName] = useState(managerName || "Thomas Sterling (Plant Operations)");
  const [actualHoursLog, setActualHoursLog] = useState(
    wo?.actualHours != null && wo.actualHours !== "" ? String(wo.actualHours) : "0"
  );
  const [isIssuePartModalOpen, setIsIssuePartModalOpen] = useState(false);
  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [issueQty, setIssueQty] = useState(1);

  React.useEffect(() => {
    if (wo) {
      if (wo.repairAction) setRepairActionText(wo.repairAction);
      if (wo.testResult) setTestResultText(wo.testResult);
      if (wo.actualHours != null) {
        setActualHoursInput(String(wo.actualHours));
        setActualHoursLog(String(wo.actualHours));
      }
    }
  }, [wo?.id, wo?.actualHours]);

  const statuses = [
    "Draft",
    "Open",
    "Assigned",
    "In Progress",
    "Waiting for Parts",
    "Completed",
    "Verified",
    "Closed"
  ];

  const handleStatusTransition = async (newStatus) => {
    try {
      await maintenanceService.updateWorkOrderStatus(wo.id, newStatus);
    } catch (err) {
      console.warn("Update status notice:", err);
    }

    if (newStatus === "In Progress") {
        startWorkOrder(wo.id);
        addToast(`Work Order ${wo.id} started. Timer active.`);
    } else if (newStatus === "Completed") {
        completeWorkOrder(wo.id, { repairAction: repairActionText, testResult: testResultText, actualHours: parseFloat(actualHoursInput) || 0 });
        addToast(`Work Order ${wo.id} marked as completed. Duration calculated.`);
    } else {
        updateWorkOrderStatus(wo.id, newStatus, `Transitioned to ${newStatus}`);
        addToast(`Work Order ${wo.id} updated to ${newStatus}`);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const author = isPlantManager ? managerName : (currentRole?.user?.name || "Marcus Vance (Senior Tech)");
    try {
      await maintenanceService.addWorkOrderComment(wo.id, {
        text: commentText,
        user: author
      });
    } catch (err) {
      console.warn("Add comment notice:", err);
    }
    updateWorkOrderStatus(wo.id, wo.status, `[${author}]: ${commentText}`);
    setCommentText("");
    addToast("Directive logged to Work Order activity trail.", "success");
  };

  const handleSaveRepairNotes = async () => {
    const hoursNum = parseFloat(actualHoursInput) || 0;
    try {
      await maintenanceService.saveExecutionRecord(wo.id, {
        repairAction: repairActionText,
        testResult: testResultText,
        actualHours: hoursNum
      });
      if (updateWorkOrder) {
        await updateWorkOrder(wo.dbId || wo.id, {
          actualHours: hoursNum,
          description: repairActionText ? `${wo.description || ''}\n[Execution Note]: ${repairActionText}` : wo.description
        });
      }
    } catch (err) {
      console.warn("Save execution record notice:", err);
    }
    completeWorkOrder(wo.id, { repairAction: repairActionText, testResult: testResultText, actualHours: hoursNum });
    if (refreshWorkOrders) {
      await refreshWorkOrders();
    }
    addToast(`Repair actions & ${hoursNum}h labour hours saved to database!`, "success");
  };

  const handleSupervisorSignOff = async (e) => {
    e.preventDefault();
    const hoursNum = parseFloat(actualHoursLog) || 0;
    try {
      await maintenanceService.signOffWorkOrder(wo.id, {
        supervisorName,
        actualHours: hoursNum
      });
      if (updateWorkOrder) {
        await updateWorkOrder(wo.dbId || wo.id, {
          actualHours: hoursNum,
          status: "Verified"
        });
      }
    } catch (err) {
      console.warn("Sign off notice:", err);
    }
    const signOffNote = isPlantManager
      ? `Managerial sign-off & operational clearance authorized by ${supervisorName}. Labour: ${hoursNum} hrs.`
      : `Supervisor sign-off completed by ${supervisorName}. Labour: ${hoursNum} hrs.`;
    updateWorkOrderStatus(wo.id, "Verified", signOffNote);
    completeWorkOrder(wo.id, { actualHours: hoursNum, status: "Verified" });
    if (refreshWorkOrders) {
      await refreshWorkOrders();
    }
    setIsSignOffModalOpen(false);
    addToast(
      isPlantManager
        ? `Work order ${wo.id} verified and signed off by Management!`
        : `Work order ${wo.id} verified and ${hoursNum} labour hrs signed off!`,
      "success"
    );
  };

  const handleIssuePart = async (e) => {
    e.preventDefault();
    if (!selectedPartNo) return;
    try {
      await maintenanceService.issueSparePart(wo.id, {
        partNo: selectedPartNo,
        qty: parseInt(issueQty),
        workOrderId: wo.id
      });
    } catch (err) {
      console.warn("Issue spare part notice:", err);
    }
    issueSparePart(selectedPartNo, parseInt(issueQty), wo.id);
    addToast(`Issued ${issueQty} unit(s) of ${selectedPartNo} to Work Order ${wo.id}.`);
    setIsIssuePartModalOpen(false);
    setSelectedPartNo("");
    setIssueQty(1);
  };

  const handleConvertToSolution = () => {
    const newSol = addVerifiedSolution({
      problemSymptom: wo.title,
      assetType: "Packaging & Bottling",
      applicableMachines: [wo.assetId],
      failureCode: wo.failureCode?.split(" ")[0] || "MEC-004",
      failureCategory: "Mechanical",
      rootCause: wo.description,
      diagnosticSteps: ["1. Inspect bearing vibration velocity", "2. Check thermal hotspot with IR scanner"],
      repairProcedure: [repairActionText || "Standard overhaul and seal replacement."],
      partsRequired: wo.partsRequired,
      toolsRequired: wo.toolsRequired,
      testAndVerification: testResultText || "30-min trial run at full line speed.",
      tags: ["work order", wo.assetId?.toLowerCase() || "asset"]
    });
    addToast(`Converted to Verified Solution ${newSol.id} in Knowledge Base!`);
    navigate("/maintenance/verified-solutions");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <button
            onClick={() => navigate("/maintenance/work-orders")}
            className="btn btn-ghost"
            style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={14} /> Back to Work Orders
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
              {wo.id}: {wo.title}
            </h1>
            <Badge variant={wo.priority.includes("P1") ? "rose" : "amber"}>{wo.priority}</Badge>
            <Badge variant="cyan">{wo.type}</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {wo.status !== "Verified" && wo.status !== "Closed" && (
            <Button variant="success" icon={ShieldCheck} onClick={() => setIsSignOffModalOpen(true)}>
              {isPlantManager ? "Managerial Sign-Off & Verification" : "Supervisor Sign-Off"}
            </Button>
          )}
          <Button variant="secondary" icon={Sparkles} onClick={handleConvertToSolution}>
            Save as Verified Solution
          </Button>
        </div>
      </div>

      {/* Lifecycle Status Stepper */}
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Lifecycle Progression
          </span>
          <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>
            Current State: {wo.status}
          </span>
        </div>

        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px" }}>
          {statuses.map((st, i) => {
            const currentIdx = statuses.indexOf(wo.status);
            const isCompleted = i < currentIdx;
            const isCurrent = i === currentIdx;

            return (
              <button
                key={st}
                onClick={() => handleStatusTransition(st)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: isCurrent ? 700 : 500,
                  backgroundColor: isCurrent
                    ? "#0284C7"
                    : isCompleted
                    ? "rgba(16, 185, 129, 0.15)"
                    : "var(--bg-card-subtle)",
                  color: isCurrent ? "#FFFFFF" : isCompleted ? "#34D399" : "var(--text-muted)",
                  border: isCurrent ? "1px solid #38BDF8" : isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Grid: WO Details & Action Panels */}
      <div className="grid-2">
        {/* Left Column: Scope & Technical Information */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              Technical Details & Scope
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Observed Symptom</span>
                <p style={{ color: "var(--text-primary)", marginTop: "4px" }}>{wo.symptom || "No symptom recorded."}</p>
              </div>

              <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Work Order Instructions</span>
                <p style={{ color: "var(--text-primary)", marginTop: "4px" }}>{wo.description}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Assigned Technician:</span>
                <span style={{ fontWeight: 600, color: "#38BDF8" }}>{wo.assignedTechnician}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Failure Code:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{wo.failureCode || "MEC-004"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Safety & LOTO Protocol:</span>
                <span style={{ fontWeight: 600, color: "#EF4444" }}>{wo.safetyNotes || "Standard LOTO Level 4 Required"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "var(--text-muted)" }}>Labour Hours:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {wo.actualHours != null && wo.actualHours !== "" ? `${wo.actualHours}h actual` : "0.0h actual"} / {wo.estimatedHours || 2.0}h est.
                </span>
              </div>
            </div>
          </Card>

          {/* Parts & Tools Required */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Parts & Tools Consumed
                </h3>
                <Badge variant="cyan">{wo.partsRequired?.length || 0} Parts</Badge>
              </div>
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsIssuePartModalOpen(true)}>
                Issue Part
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {wo.partsRequired?.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{p.partNo}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{p.name} • Qty: {p.qty}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant={p.status === "Issued" || p.status === "Used" ? "emerald" : "amber"}>
                      {p.status || "Issued"}
                    </Badge>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                <strong>Required Special Tools:</strong> {wo.toolsRequired?.join(", ") || "Laser Aligner, Torque Wrench"}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Execution, Verification & Activity Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Repair Action & Post-Test Verification Notes */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Execution & Verification Results
              </h3>
              <Badge variant="cyan">Tech Scope: {wo.assignedTechnician || "Marcus Vance"}</Badge>
            </div>

            {isPlantManager && (
              <div style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "rgba(200, 149, 71, 0.08)", border: "1px solid rgba(200, 149, 71, 0.25)", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.5 }}>
                <strong style={{ color: "#B27E33" }}>Plant Manager Scope:</strong> Physical repair execution is performed on the shop-floor by the technician ({wo.assignedTechnician}). Your managerial actions are <strong>Managerial Sign-Off & Verification</strong> (top green button) and <strong>Audit Directives</strong> (audit notes below).
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Repair Action Performed *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Details of mechanical overhaul, bearing replacement, or electrical rewiring..."
                  value={repairActionText}
                  onChange={(e) => setRepairActionText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Verification & Post-Repair Test Results</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Record post-repair vibration RMS, dry cycle run results, or thermal scan reading..."
                  value={testResultText}
                  onChange={(e) => setTestResultText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Actual Labour Hours Logged (hrs) *</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Directly updates DB & Asset 360° MTTR</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 2.5"
                    value={actualHoursInput}
                    onChange={(e) => setActualHoursInput(e.target.value)}
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 600, paddingLeft: "36px" }}
                  />
                  <Clock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="primary" size="sm" icon={FileCheck} onClick={handleSaveRepairNotes}>
                  Save Execution Record
                </Button>
              </div>
            </div>
          </Card>

          {/* Activity / Comments Feed */}
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
              Work Order Audit & Notes Trail
            </h3>

            <div
              style={{
                height: "180px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "10px",
                backgroundColor: "var(--bg-card-subtle)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)"
              }}
            >
              {wo.comments?.length > 0 ? (
                wo.comments.map((c, i) => (
                  <div key={i} style={{ fontSize: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "11px" }}>
                      <strong style={{ color: "#38BDF8" }}>{c.user}</strong>
                      <span>{c.time}</span>
                    </div>
                    <p style={{ color: "var(--text-primary)", marginTop: "2px" }}>{c.text}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px", padding: "20px 0" }}>
                  No comments logged yet.
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add technician comment or shift update..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button variant="secondary" size="sm" type="submit" icon={Send}>
                Post
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Supervisor / Manager Sign-Off Modal */}
      <Modal
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        title={isPlantManager ? "Managerial Work Order Sign-Off & Authorization" : "Supervisor Work Order Sign-Off"}
        subtitle={`Authorize completion and verification for ${wo.id}`}
      >
        <form onSubmit={handleSupervisorSignOff} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">{isPlantManager ? "Signing Director / Manager" : "Signing Supervisor"}</label>
            <input
              type="text"
              className="form-input"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Actual Labour Hours</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="form-input"
              value={actualHoursLog}
              onChange={(e) => setActualHoursLog(e.target.value)}
              placeholder="e.g. 2.5"
              required
            />
          </div>

          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "12px", color: "#34D399" }}>
            By signing off, you verify that machine safety guards are remounted, LOTO is cleared, and test cycles are within operational tolerance limits.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsSignOffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" icon={CheckCircle2}>
              Authorize & Sign Off
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Part Modal */}
      <Modal
        isOpen={isIssuePartModalOpen}
        onClose={() => setIsIssuePartModalOpen(false)}
        title="Issue Spare Part"
        subtitle={`Deduct part from inventory and link to Work Order ${wo.id}`}
      >
        <form onSubmit={handleIssuePart} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Select Spare Part</label>
            <select
              className="form-input"
              value={selectedPartNo}
              onChange={(e) => setSelectedPartNo(e.target.value)}
              required
            >
              <option value="">-- Select Part in Stock --</option>
              {spareParts.filter(p => p.stock > 0).map(p => (
                <option key={p.partNo} value={p.partNo}>
                  {p.partNo} - {p.name} ({p.stock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={issueQty}
              onChange={(e) => setIssueQty(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsIssuePartModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Package}>
              Confirm Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


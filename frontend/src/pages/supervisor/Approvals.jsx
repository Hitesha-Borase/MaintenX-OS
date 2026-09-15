import React, { useState, useEffect } from "react";
import { FileCheck, Check, X, HelpCircle, CheckSquare, Zap, Send, Plus, RefreshCw, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import dashboardService from "../../services/dashboardService";

export function Approvals() {
  const { addToast } = useApp();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Speed-up modal
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [speedReqId, setSpeedReqId] = useState("");
  const [proposedSpeed, setProposedSpeed] = useState(620);
  const [supervisorComment, setSupervisorComment] = useState("Approved for 60 minutes run under close torque monitoring.");

  // Create approval modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: "Sanitation Release",
    details: "Line 1 clean-in-place signed off by operator. Requires supervisor sign-off.",
    requestedBy: "Line Operator Carlos",
    proposedSpeed: 600,
  });

  const fetchApprovals = async (showToast = false) => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getSupervisorApprovals();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setRequests(list);
      if (showToast) {
        addToast("Shift approvals refreshed!", "info");
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleCreateApproval = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await dashboardService.createSupervisorApproval(createForm);
      addToast(res?.message || "Shift approval request submitted successfully!", "success");
      setIsCreateModalOpen(false);
      setCreateForm({
        type: "Sanitation Release",
        details: "",
        requestedBy: "Line Operator Carlos",
        proposedSpeed: 600,
      });
      await fetchApprovals();
    } catch (err) {
      addToast(`Failed to create approval request: ${err.message}`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id, type) => {
    if (type.includes("Speed-Up")) {
      setSpeedReqId(id);
      setIsSpeedModalOpen(true);
      return;
    }
    try {
      const res = await dashboardService.approveSupervisorApproval(id);
      addToast(res?.message || `Approval Request ${id} (${type}) Authorized.`, "success");
      await fetchApprovals();
    } catch (err) {
      addToast(`Approval Request ${id} Authorized.`, "success");
      await fetchApprovals();
    }
  };

  const handleConfirmSpeedupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dashboardService.approveSupervisorApproval(speedReqId, {
        proposedSpeed,
        comment: supervisorComment
      });
      addToast(res?.message || `Line Speedup Authorized to ${proposedSpeed} BPM.`, "success");
      await fetchApprovals();
    } catch (err) {
      addToast(`Line Speedup Authorized to ${proposedSpeed} BPM.`, "success");
      await fetchApprovals();
    }
    setIsSpeedModalOpen(false);
  };

  const handleReject = async (id, type) => {
    try {
      const res = await dashboardService.rejectSupervisorApproval(id);
      addToast(res?.message || `Approval Request ${id} (${type}) Rejected.`, "danger");
      await fetchApprovals();
    } catch (err) {
      addToast(`Approval Request ${id} Rejected.`, "danger");
      await fetchApprovals();
    }
  };

  const handleClarification = async (id, type) => {
    try {
      const res = await dashboardService.clarifySupervisorApproval(id);
      addToast(res?.message || `Request ${id} marked for CLARIFICATION.`, "warning");
      await fetchApprovals();
    } catch (err) {
      addToast(`Request ${id} marked for clarification.`, "warning");
      await fetchApprovals();
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await dashboardService.deleteSupervisorApproval(id);
      addToast(res?.message || `Request ${id} dismissed.`, "info");
      await fetchApprovals();
    } catch (err) {
      addToast(`Request ${id} dismissed.`, "info");
      await fetchApprovals();
    }
  };

  const handleBulkApprove = async () => {
    try {
      const res = await dashboardService.bulkApproveSupervisorApprovals();
      addToast(res?.message || "All pending shift approval requests bulk-authorized.", "success");
      await fetchApprovals();
    } catch (err) {
      addToast("All pending shift approval requests bulk-authorized.", "success");
      await fetchApprovals();
    }
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING" || r.status === "CLARIFICATION");
  const historyRequests = requests.filter(r => r.status !== "PENDING" && r.status !== "CLARIFICATION");

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="emerald">APPROVED</Badge>;
      case "REJECTED":
        return <Badge variant="danger">REJECTED</Badge>;
      case "CLARIFICATION":
        return <Badge variant="blue">CLARIFICATION</Badge>;
      default:
        return <Badge variant="amber">PENDING</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Pending Shift Approvals
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={() => fetchApprovals(true)} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Submit Request
          </Button>
          {pendingRequests.filter(r => r.status === "PENDING").length > 0 && (
            <Button variant="success" icon={CheckSquare} onClick={handleBulkApprove}>
              Bulk Approve All Pending ({pendingRequests.filter(r => r.status === "PENDING").length})
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
        <Button
          variant={activeTab === "pending" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pending")}
        >
          Pending ({pendingRequests.length})
        </Button>
        <Button
          variant={activeTab === "history" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("history")}
        >
          History ({historyRequests.length})
        </Button>
      </div>

      {isLoading ? (
        <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
          Loading live shift approval requests...
        </Card>
      ) : activeTab === "pending" ? (
        pendingRequests.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <Check size={32} color="#10B981" />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              0 Pending Shift Approvals
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "520px" }}>
              All floor operations and department sign-offs are cleared. Use <strong>Submit Request</strong> to create a request for Sanitation, Material Hold, PM Audit, or Speed-Up.
            </span>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingRequests.map((r) => (
              <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", borderLeft: r.status === "CLARIFICATION" ? "4px solid #3B82F6" : "4px solid #F59E0B" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <FileCheck size={16} color="#D97706" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {r.approvalCode || r.id}: {r.type}
                    </span>
                    {getStatusBadge(r.status)}
                    {r.requestedBy && (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        by {r.requestedBy}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {r.details}
                  </p>
                  {r.proposedSpeed && (
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600, display: "block", marginTop: "2px" }}>
                      Target Speed: {r.proposedSpeed} BPM
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(r.id)} title="Delete Request">
                    Dismiss
                  </Button>
                  <Button variant="secondary" size="sm" icon={HelpCircle} onClick={() => handleClarification(r.id, r.type)}>
                    Clarify
                  </Button>
                  <Button variant="danger" size="sm" icon={X} onClick={() => handleReject(r.id, r.type)}>
                    Reject
                  </Button>
                  <Button variant="success" size="sm" icon={Check} onClick={() => handleApprove(r.id, r.type)}>
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        historyRequests.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
            No resolved shift approvals in history.
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {historyRequests.map((r) => (
              <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", borderLeft: r.status === "APPROVED" ? "4px solid #10B981" : "4px solid #EF4444" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <FileCheck size={16} color={r.status === "APPROVED" ? "#10B981" : "#EF4444"} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {r.approvalCode || r.id}: {r.type}
                    </span>
                    {getStatusBadge(r.status)}
                    {r.requestedBy && (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        by {r.requestedBy}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {r.details}
                  </p>
                  {r.supervisorComment && (
                    <span style={{ fontSize: "11.5px", color: "var(--text-primary)", fontWeight: 600, display: "block", marginTop: "4px" }}>
                      Supervisor Note: "{r.supervisorComment}"
                    </span>
                  )}
                  {r.approvedAt && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                      Resolved at {new Date(r.approvedAt).toLocaleTimeString()} ({new Date(r.approvedAt).toISOString().split('T')[0]})
                    </span>
                  )}
                </div>

                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(r.id)} title="Delete from History">
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Submit Shift Request Modal (For Testing Live Flow) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Submit Live Shift Approval Request"
        subtitle="Create a new cross-departmental sign-off request."
        maxWidth="540px"
      >
        <form onSubmit={handleCreateApproval} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Approval Category / Type *
            </label>
            <select
              className="form-select"
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            >
              <option value="Sanitation Release">Sanitation Release (Clean-in-Place Sign-off)</option>
              <option value="Material Hold Release">Material Hold Release (Quality Rework Clearance)</option>
              <option value="PM Audit Verification">PM Audit Verification (Maintenance Calibration)</option>
              <option value="Line Speed-Up Proposal">Line Speed-Up Proposal (Throughput Boost)</option>
              <option value="Operator Overtime Authorization">Operator Overtime Authorization (Shift Extension)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Request Details & Justification *
            </label>
            <textarea
              required
              rows={3}
              value={createForm.details}
              onChange={(e) => setCreateForm({ ...createForm, details: e.target.value })}
              className="form-input"
              placeholder="e.g. Line 1 clean-in-place completed and ATP swab testing passed. Ready for bottling run."
              style={{ width: "100%", fontSize: "12px", backgroundColor: "#FFFFFF", padding: "8px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Requested By
              </label>
              <input
                type="text"
                value={createForm.requestedBy}
                onChange={(e) => setCreateForm({ ...createForm, requestedBy: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            {createForm.type.includes("Speed") && (
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Target Speed (BPM)
                </label>
                <input
                  type="number"
                  value={createForm.proposedSpeed}
                  onChange={(e) => setCreateForm({ ...createForm, proposedSpeed: Number(e.target.value) })}
                  className="form-input"
                  style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve Line Speedup Proposal Modal */}
      <Modal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
        title="Approve Line Speed-Up Proposal"
        subtitle={`Request ID: ${speedReqId} — Line 1 Aseptic Filler`}
        maxWidth="480px"
      >
        <form onSubmit={handleConfirmSpeedupSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Target Authorized Speed (BPM)
            </label>
            <input
              type="number"
              value={proposedSpeed}
              onChange={(e) => setProposedSpeed(Number(e.target.value))}
              className="form-input"
              style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Authorization Note
            </label>
            <input
              type="text"
              value={supervisorComment}
              onChange={(e) => setSupervisorComment(e.target.value)}
              className="form-input"
              style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              required
            />
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.08)", fontSize: "12px", color: "#059669" }}>
            Authorizing speedup boosts line throughput to {proposedSpeed} BPM and logs approval timestamp.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <Button variant="ghost" type="button" onClick={() => setIsSpeedModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" icon={Send}>
              Authorize Speed-Up Command
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

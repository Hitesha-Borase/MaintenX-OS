import React, { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Search,
  ChevronRight,
  ExternalLink,
  Plus
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Drawer } from "../../components/common/Drawer";
import { Modal } from "../../components/common/Modal";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { useNavigate } from "react-router-dom";

function formatExceptionTime(exc) {
  if (exc.status === "Resolved") {
    if (exc.resolvedAt) {
      try {
        const d = new Date(exc.resolvedAt);
        const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
        const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `Closed: ${dateStr}, ${timeStr}`;
      } catch (e) {
        return "Closed";
      }
    }
    return "Closed";
  }

  if (exc.createdAt) {
    try {
      const created = new Date(exc.createdAt).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - created);
      const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
      if (diffMinutes < 60) {
        return `Open: ${diffMinutes}m`;
      }
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      if (hours < 24) {
        return `Open: ${hours}h ${mins}m`;
      }
      const days = Math.floor(hours / 24);
      return `Open: ${days}d ${hours % 24}h`;
    } catch (e) {
      return "Open";
    }
  }
  return "Open";
}

export function ExceptionControlTower() {
  const { exceptions, addException, updateExceptionStatus, assignException } = useExceptions();
  const { addToast } = useApp();
  const { currentRole } = useRole();
  const navigate = useNavigate();

  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer / Modal states
  const [activeDrawerException, setActiveDrawerException] = useState(null);
  const [assignModalException, setAssignModalException] = useState(null);
  const [newOwner, setNewOwner] = useState("");
  const [newEscalation, setNewEscalation] = useState("Level 1 (Shift Supervisor)");

  const [resolveModalException, setResolveModalException] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolverName, setResolverName] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("P2");
  const [newCat, setNewCat] = useState("Production At Risk");
  const [newStage, setNewStage] = useState("PROCESSING");
  const [newAssetOrOrder, setNewAssetOrOrder] = useState("");
  const [newImpact, setNewImpact] = useState("");

  const availableOwners = Array.from(
    new Set(
      exceptions
        .map((e) => e.owner)
        .filter((o) => o && o !== "Unassigned")
    )
  );

  const openAssignModal = (exc) => {
    setAssignModalException(exc);
    setNewOwner(exc.owner && exc.owner !== "Unassigned" ? exc.owner : "");
    setNewEscalation(exc.escalationLevel || "Level 1 (Shift Supervisor)");
  };

  const openResolveModal = (exc) => {
    setResolveModalException(exc);
    const existingCleanNotes = exc.resolutionNotes?.replace(/^\[Resolved by [^\]]+\]:\s*/, "") || "";
    setResolutionNotes(existingCleanNotes);
    const defaultSigner = currentRole?.user?.name 
      ? `${currentRole.user.name} (${currentRole.label || "Plant Manager"})` 
      : "Stefan Crawford (Plant Manager)";
    setResolverName(defaultSigner);
  };

  const filteredExceptions = exceptions.filter((exc) => {
    if (selectedSeverity !== "ALL" && exc.severity !== selectedSeverity) return false;
    if (selectedCategory !== "ALL" && exc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        exc.title?.toLowerCase().includes(q) ||
        exc.assetOrOrder?.toLowerCase().includes(q) ||
        exc.owner?.toLowerCase().includes(q) ||
        exc.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const p1Count = exceptions.filter((e) => e.severity === "P1" && e.status !== "Resolved").length;
  const p2Count = exceptions.filter((e) => e.severity === "P2" && e.status !== "Resolved").length;
  const p3Count = exceptions.filter((e) => e.severity === "P3" && e.status !== "Resolved").length;
  const resolvedCount = exceptions.filter((e) => e.status === "Resolved").length;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!assignModalException) return;
    assignException(assignModalException.id, newOwner, newEscalation);
    addToast(`Exception ${assignModalException.id} assigned to ${newOwner} (${newEscalation})`);
    setAssignModalException(null);
    if (activeDrawerException?.id === assignModalException.id) {
      setActiveDrawerException((prev) => ({ ...prev, owner: newOwner, escalationLevel: newEscalation, status: "Active - In Repair" }));
    }
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!resolveModalException) return;
    const author = resolverName.trim() || currentRole?.user?.name || "Stefan Crawford";
    const fullNotes = `[Resolved by ${author}]: ${resolutionNotes.trim()}`;
    const nowIso = new Date().toISOString();
    updateExceptionStatus(resolveModalException.id, "Resolved", fullNotes);
    addToast(`Exception ${resolveModalException.id} marked as Resolved by ${author}!`);
    setResolveModalException(null);
    setResolutionNotes("");
    if (activeDrawerException?.id === resolveModalException.id) {
      setActiveDrawerException((prev) => ({ 
        ...prev, 
        status: "Resolved", 
        resolutionNotes: fullNotes,
        resolvedAt: nowIso
      }));
    }
  };

  const handleCreateException = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const newE = await addException({
        severity: newSeverity,
        category: newCat,
        stage: newStage,
        title: newTitle,
        assetOrOrder: newAssetOrOrder || "N/A",
        impactDescription: newImpact || "Escalated for immediate triage by shift command.",
        owner: "Unassigned",
        escalationLevel: newSeverity === "P1" ? "Level 3 (VP Operations)" : "Level 1 (Shift Supervisor)"
      });
      addToast(`Exception ${newE.id} logged in Control Tower!`);
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewImpact("");
      setNewAssetOrOrder("");
    } catch (err) {
      addToast(`Error logging exception: ${err.message}`, "error");
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "P1":
        return <Badge variant="rose">P1 - CRITICAL</Badge>;
      case "P2":
        return <Badge variant="amber">P2 - HIGH</Badge>;
      case "P3":
        return <Badge variant="cyan">P3 - MEDIUM</Badge>;
      case "P4":
        return <Badge variant="slate">P4 - LOW</Badge>;
      default:
        return <Badge variant="slate">{sev}</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Exception & Control Tower
            </h1>
            <Badge variant={p1Count > 0 ? "rose" : "emerald"} dot>
              {p1Count > 0 ? `${p1Count} P1 Outages Active` : "All Clear"}
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Cross-facility unified triage, automated escalation, and incident resolution center.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Log New Exception
          </Button>
        </div>
      </div>

      {/* Severity Ticker Cards */}
      <div className="grid-4">
        <StatCard
          title="P1 - Critical Alerts"
          value={p1Count.toString()}
          unit="active"
          trend={{ value: p1Count > 0 ? "Line Halt" : "Nominal", isPositive: p1Count === 0, text: "immediate triage" }}
          icon={AlertOctagon}
          colorVariant="rose"
          onClick={() => setSelectedSeverity("P1")}
        />
        <StatCard
          title="P2 - High Risk"
          value={p2Count.toString()}
          unit="active"
          trend={{ value: "4h SLA", isPositive: false, text: "action required" }}
          icon={AlertTriangle}
          colorVariant="amber"
          onClick={() => setSelectedSeverity("P2")}
        />
        <StatCard
          title="P3 - Medium Warnings"
          value={p3Count.toString()}
          unit="active"
          trend={{ value: "24h SLA", isPositive: true, text: "monitoring" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => setSelectedSeverity("P3")}
        />
        <StatCard
          title="Resolved Exceptions"
          value={resolvedCount.toString()}
          unit="closed"
          trend={{ value: "100% Verified", isPositive: true, text: "this shift" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => setSelectedSeverity("ALL")}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "32px", height: "34px", fontSize: "12px" }}
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ height: "34px", padding: "4px 10px", fontSize: "12px", width: "auto" }}
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>

          <select
            className="form-select"
            style={{ height: "34px", padding: "4px 10px", fontSize: "12px", width: "auto" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Production At Risk">Production At Risk</option>
            <option value="Quality / Food Safety">Quality / Food Safety</option>
            <option value="Maintenance / Breakdown">Maintenance / Breakdown</option>
            <option value="Material / Inventory">Material / Inventory</option>
            <option value="Labour">Labour</option>
            <option value="Customer / Shipment">Customer / Shipment</option>
          </select>
        </div>
      </Card>

      {/* Exception Queue List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredExceptions.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "48px 24px" }}>
            <CheckCircle2 size={40} style={{ color: "#10B981", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
              No Exceptions Found in Database
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              All systems are normal. Use the "+ Log New Exception" button to manually log an incident to PostgreSQL.
            </p>
          </Card>
        ) : (
          filteredExceptions.map((exc) => {
            const isResolved = exc.status === "Resolved";

            return (
              <Card
                key={exc.id}
                interactive
                onClick={() => setActiveDrawerException(exc)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderLeft: `4px solid ${exc.severity === "P1" ? "#EF4444" : exc.severity === "P2" ? "#F59E0B" : "#38BDF8"}`,
                  opacity: isResolved ? 0.7 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {getSeverityBadge(exc.severity)}
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {exc.id}
                    </span>
                    {exc.stage && (
                      <Badge variant={exc.stage === "PROCESSING" ? "amber" : "cyan"}>
                        {exc.stage}
                      </Badge>
                    )}
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                      • {exc.category}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant={isResolved ? "emerald" : exc.status === "In Review" || exc.status === "Active - In Repair" ? "amber" : "rose"}>
                      {exc.status}
                    </Badge>
                    <span style={{ fontSize: "11px", color: isResolved ? "#10B981" : "var(--text-muted)", fontWeight: isResolved ? 600 : 400 }}>
                      {formatExceptionTime(exc)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {exc.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {exc.impactDescription || exc.impact || exc.description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-muted)" }}>
                    <span>Target: <strong style={{ color: "var(--text-primary)" }}>{exc.assetOrOrder}</strong></span>
                    <span>Owner: <strong style={{ color: "#38BDF8" }}>{exc.owner}</strong></span>
                    <span>Escalation: <strong style={{ color: "var(--text-secondary)" }}>{exc.escalationLevel}</strong></span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {!isResolved && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={UserCheck}
                          onClick={(e) => {
                            e.stopPropagation();
                            openAssignModal(exc);
                          }}
                        >
                          {exc.owner && exc.owner !== "Unassigned" ? "Reassign" : "Assign Owner"}
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={(e) => {
                            e.stopPropagation();
                            openResolveModal(exc);
                          }}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" icon={ChevronRight}>
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!activeDrawerException}
        onClose={() => setActiveDrawerException(null)}
        title={`Exception Details: ${activeDrawerException?.id}`}
        subtitle={activeDrawerException?.category}
        width="540px"
        footer={
          activeDrawerException ? (
            activeDrawerException.status !== "Resolved" ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="secondary"
                  icon={UserCheck}
                  onClick={() => openAssignModal(activeDrawerException)}
                >
                  {activeDrawerException.owner && activeDrawerException.owner !== "Unassigned" ? "Reassign" : "Assign Owner"}
                </Button>
                <Button
                  variant="success"
                  icon={CheckCircle2}
                  onClick={() => openResolveModal(activeDrawerException)}
                >
                  Mark Resolved
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setActiveDrawerException(null)}>
                Close
              </Button>
            )
          ) : null
        }
      >
        {activeDrawerException && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {getSeverityBadge(activeDrawerException.severity)}
              <Badge variant={activeDrawerException.status === "Resolved" ? "emerald" : "amber"}>
                {activeDrawerException.status}
              </Badge>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{activeDrawerException.title}</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.6 }}>
                {activeDrawerException.impactDescription}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Target Asset / Batch:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{activeDrawerException.assetOrOrder}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Manufacturing Stage:</span>
                <span style={{ fontWeight: 600, color: activeDrawerException.stage === "PROCESSING" ? "#F59E0B" : "#38BDF8" }}>
                  {activeDrawerException.stage || "PACKAGING"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Assigned Incident Owner:</span>
                <span style={{ fontWeight: 600, color: "#38BDF8" }}>{activeDrawerException.owner}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Escalation Tier:</span>
                <span style={{ fontWeight: 600, color: "#F59E0B" }}>{activeDrawerException.escalationLevel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Reported / Logged At:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {activeDrawerException.createdAt ? new Date(activeDrawerException.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recently"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "var(--text-muted)" }}>
                  {activeDrawerException.status === "Resolved" ? "Resolved At:" : "Duration Active:"}
                </span>
                <span style={{ fontWeight: 600, color: activeDrawerException.status === "Resolved" ? "#10B981" : "var(--text-primary)" }}>
                  {activeDrawerException.status === "Resolved"
                    ? (activeDrawerException.resolvedAt ? new Date(activeDrawerException.resolvedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Verified Closed")
                    : formatExceptionTime(activeDrawerException).replace("Open: ", "")}
                </span>
              </div>
            </div>

            {/* Resolution Verification & Audit Sign-off Box */}
            {activeDrawerException.status === "Resolved" && (
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontWeight: 700, fontSize: "13px" }}>
                  <CheckCircle2 size={16} />
                  <span>Resolution Sign-off & Audit Notes</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-primary)", marginTop: "8px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {activeDrawerException.resolutionNotes || "Corrective actions verified and equipment returned to operational clearance."}
                </p>
              </div>
            )}

            {activeDrawerException.linkedRoute && (
              <Button
                variant="primary"
                icon={ExternalLink}
                style={{ width: "100%", marginTop: "10px" }}
                onClick={() => {
                  navigate(activeDrawerException.linkedRoute);
                  setActiveDrawerException(null);
                }}
              >
                {activeDrawerException.actionButtonLabel || "Go to Target Module"}
              </Button>
            )}
          </div>
        )}
      </Drawer>

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignModalException}
        onClose={() => setAssignModalException(null)}
        title={assignModalException?.owner && assignModalException?.owner !== "Unassigned" ? "Reassign / Escalate Exception" : "Assign Incident Owner"}
        subtitle={`Update owner or management escalation tier for ${assignModalException?.id}`}
      >
        <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Assign Incident Owner</label>
            <input
              type="text"
              className="form-input"
              list="registered-owners-list"
              placeholder="Type owner name or select existing..."
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              required
            />
            {availableOwners.length > 0 && (
              <datalist id="registered-owners-list">
                {availableOwners.map((staff) => (
                  <option key={staff} value={staff} />
                ))}
              </datalist>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Escalation Tier</label>
            <select className="form-select" value={newEscalation} onChange={(e) => setNewEscalation(e.target.value)}>
              <option value="Level 1 (Shift Supervisor)">Level 1 (Shift Supervisor - Response in 30m)</option>
              <option value="Level 2 (Plant Ops Manager)">Level 2 (Plant Ops Manager - Response in 15m)</option>
              <option value="Level 3 (VP Operations & Safety)">Level 3 (VP Operations & Safety - Immediate Paging)</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setAssignModalException(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={UserCheck}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={!!resolveModalException}
        onClose={() => setResolveModalException(null)}
        title="Resolve & Close Exception"
        subtitle={`Verify corrective action outcome for ${resolveModalException?.id}`}
      >
        <form onSubmit={handleResolve} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Resolved By (Signing Authority)</label>
            <input
              type="text"
              className="form-input"
              value={resolverName}
              onChange={(e) => setResolverName(e.target.value)}
              placeholder="e.g. Stefan Crawford (Plant Manager)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Summary & Corrective Notes *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the root cause fix, parts replaced, or QA clearance verification..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setResolveModalException(null)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" icon={CheckCircle2}>
              Mark Resolved
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create New Exception Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log Manufacturing Exception"
        subtitle="Submit a critical operational discrepancy to the Control Tower"
      >
        <form onSubmit={handleCreateException} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <select className="form-select" value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)}>
              <option value="P1">P1 - Critical (Immediate Production Halt Risk)</option>
              <option value="P2">P2 - High (Degraded Speed / 4h Window)</option>
              <option value="P3">P3 - Medium (Operational Warning / 24h Window)</option>
              <option value="P4">P4 - Low (Informational Discrepancy)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={newCat} onChange={(e) => setNewCat(e.target.value)}>
              <option value="Production At Risk">Production At Risk</option>
              <option value="Quality / Food Safety">Quality / Food Safety</option>
              <option value="Maintenance / Breakdown">Maintenance / Breakdown</option>
              <option value="Material / Inventory">Material / Inventory</option>
              <option value="Labour">Labour</option>
              <option value="Customer / Shipment">Customer / Shipment</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Manufacturing Stage</label>
            <select className="form-select" value={newStage} onChange={(e) => setNewStage(e.target.value)}>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKAGING">PACKAGING</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Exception Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Capper Chuck #4 Torque Micro-Slip"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Asset / Order</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. FM-001 / PO-2026-904"
              value={newAssetOrOrder}
              onChange={(e) => setNewAssetOrOrder(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Impact Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Explain the operational consequence and immediate risk..."
              value={newImpact}
              onChange={(e) => setNewImpact(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus}>
              Submit to Control Tower
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

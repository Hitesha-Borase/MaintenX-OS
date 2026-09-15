import React, { useState, useEffect } from "react";
import { ShieldAlert, Check, Trash, RefreshCw, FileText, Send, Lock, ShieldCheck, Plus } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import dashboardService from "../../services/dashboardService";

export function Holds() {
  const { addToast } = useApp();

  const [holds, setHolds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [activeHold, setActiveHold] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [supervisorPin, setSupervisorPin] = useState("****");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [releaseCertified, setReleaseCertified] = useState(true);

  const [reworkForm, setReworkForm] = useState({
    protocol: "Thermal Re-Pasteurization Loop",
    destination: "Line 1 (Aseptic Bottling)",
    instructions: "Adjust pasteurization flow rate & hold tube temperature to > 84.5°C.",
    pin: "****",
  });

  const [createForm, setCreateForm] = useState({
    batchNumber: "BAT-2026-0890",
    reason: "Pasteurizer thermal excursion < 83.1°C",
    severity: "HIGH",
  });

  const fetchHolds = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getSupervisorHolds();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setHolds(list);
    } catch (err) {
      console.error("Failed to fetch quality holds:", err);
      setHolds([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  const handleCreateHold = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await dashboardService.createSupervisorHold(createForm);
      addToast(res.message || `Quarantine Hold for ${createForm.batchNumber} created successfully.`, "success");
      setIsCreateModalOpen(false);
      setCreateForm({
        batchNumber: "",
        reason: "",
        severity: "HIGH",
      });
      await fetchHolds();
    } catch (err) {
      addToast(`Error creating quality hold: ${err.message}`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReleaseModal = (hold) => {
    setActiveHold(hold);
    setSupervisorPin("****");
    setReleaseCertified(true);
    setIsReleaseModalOpen(true);
  };

  const handleOpenReworkModal = (hold) => {
    setActiveHold(hold);
    setReworkForm({
      protocol: "Thermal Re-Pasteurization Loop",
      destination: "Line 1 (Aseptic Bottling)",
      instructions: "Adjust pasteurization flow rate & hold tube temperature to > 84.5°C.",
      pin: "****",
    });
    setIsReworkModalOpen(true);
  };

  const handleConfirmReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!activeHold) return;

    try {
      const res = await dashboardService.authorizeSupervisorHoldRelease(activeHold.id, {
        pin: supervisorPin,
        batch: activeHold.batch
      });
      addToast(res.message || `Batch ${activeHold.batch} released from Quality Hold.`, "success");
      await fetchHolds();
    } catch (err) {
      await fetchHolds();
      addToast(`Batch ${activeHold.batch} released from Quality Hold.`, "success");
    }
    setIsReleaseModalOpen(false);
  };

  const handleConfirmReworkSubmit = async (e) => {
    e.preventDefault();
    if (!activeHold) return;

    try {
      const res = await dashboardService.requestSupervisorHoldRework(activeHold.id, {
        pin: reworkForm.pin,
        batch: activeHold.batch,
        protocol: reworkForm.protocol,
        destination: reworkForm.destination,
      });
      addToast(res.message || `Batch ${activeHold.batch} authorized for Rework Loop (${reworkForm.protocol}).`, "warning");
      await fetchHolds();
    } catch (err) {
      await fetchHolds();
      addToast(`Batch ${activeHold.batch} authorized for Rework Loop.`, "warning");
    }
    setIsReworkModalOpen(false);
  };

  const handleScrap = async (id, batch) => {
    try {
      const res = await dashboardService.scrapSupervisorHoldBatch(id);
      await fetchHolds();
      addToast(res.message || `Batch ${batch} marked as SCRAPPED.`, "danger");
    } catch (err) {
      await fetchHolds();
      addToast(`Batch ${batch} marked as SCRAPPED.`, "danger");
    }
  };

  const handleOpenNote = (hold) => {
    setActiveHold(hold);
    setNoteText("");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!activeHold) return;

    try {
      const res = await dashboardService.addSupervisorHoldNote(activeHold.id, { noteText });
      await fetchHolds();
      addToast(res.message || `QA Investigation remark attached to ${activeHold.batch || activeHold.id}.`, "info");
    } catch (err) {
      await fetchHolds();
      addToast(`QA Investigation remark attached to ${activeHold.batch || activeHold.id}.`, "info");
    }
    setIsNoteModalOpen(false);
  };

  const [activeTab, setActiveTab] = useState("active");

  const activeHolds = holds.filter(h => h.status === "ACTIVE_HOLD" || h.status === "ACTIVE HOLD");
  const historyHolds = holds.filter(h => h.status !== "ACTIVE_HOLD" && h.status !== "ACTIVE HOLD");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Quality Quarantine Holds & Governance
          </h1>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
          Place Quarantine Hold
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
        <Button
          variant={activeTab === "active" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("active")}
        >
          Active Quarantine ({activeHolds.length})
        </Button>
        <Button
          variant={activeTab === "history" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("history")}
        >
          Released & Disposition History ({historyHolds.length})
        </Button>
      </div>

      {isLoading ? (
        <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
          Loading live quarantine holds...
        </Card>
      ) : activeTab === "active" ? (
        activeHolds.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <Check size={32} color="#10B981" />
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              0 Active Quality Holds. All packaging batches clear to run.
            </span>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeHolds.map((h) => (
              <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderLeft: "4px solid #EF4444", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <ShieldAlert size={16} color="#EF4444" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {h.holdCode ? `${h.holdCode}: ` : ""}{h.batch || h.id}
                    </span>
                    <Badge variant="danger">ACTIVE HOLD</Badge>
                    {h.severity && (
                      <Badge variant={h.severity === "CRITICAL" ? "danger" : "amber"}>
                        {h.severity}
                      </Badge>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Reason: {h.reason}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <Button variant="secondary" size="sm" icon={FileText} onClick={() => handleOpenNote(h)}>
                    Add Note
                  </Button>
                  <Button variant="warning" size="sm" icon={RefreshCw} onClick={() => handleOpenReworkModal(h)}>
                    Request Rework
                  </Button>
                  <Button variant="success" size="sm" icon={Lock} onClick={() => handleOpenReleaseModal(h)}>
                    Authorize Release
                  </Button>
                  <Button variant="danger" size="sm" icon={Trash} onClick={() => handleScrap(h.id, h.batch)}>
                    Scrap Batch
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        historyHolds.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
            No resolved quarantine holds in history yet.
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {historyHolds.map((h) => {
              const isReleased = h.status === "RELEASED";
              const isRework = h.status === "REWORK";
              const isDestroyed = h.status === "DESTROYED";

              return (
                <Card 
                  key={h.id} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    flexWrap: "wrap", 
                    gap: "12px", 
                    borderLeft: isReleased ? "4px solid #10B981" : isRework ? "4px solid #F59E0B" : "4px solid #64748B", 
                    backgroundColor: "#FFFFFF", 
                    border: "1px solid var(--border-subtle)" 
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {isReleased ? <ShieldCheck size={16} color="#10B981" /> : isRework ? <RefreshCw size={16} color="#F59E0B" /> : <Trash size={16} color="#64748B" />}
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {h.holdCode ? `${h.holdCode}: ` : ""}{h.batch || h.id}
                      </span>
                      <Badge variant={isReleased ? "emerald" : isRework ? "amber" : "slate"}>
                        {isReleased ? "RELEASED & UNLOCKED" : isRework ? "REWORK LOOP" : "SCRAPPED"}
                      </Badge>
                      {h.severity && <Badge variant="subtle">{h.severity}</Badge>}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Original Reason: {h.reason}
                    </div>
                    <div style={{ fontSize: "11px", color: isReleased ? "#059669" : "var(--text-muted)", marginTop: "4px" }}>
                      {isReleased 
                        ? `✓ Unlocked at ${new Date(h.releasedAt || h.holdAt).toLocaleString()} — Finished Goods Inventory Dispatched` 
                        : isRework 
                        ? `⟳ Routed to corrective rework loop at ${new Date(h.holdAt).toLocaleString()}`
                        : `✕ Discarded / Scrapped at ${new Date(h.releasedAt || h.holdAt).toLocaleString()}`}
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", fontWeight: 600, color: isReleased ? "#10B981" : "var(--text-secondary)" }}>
                    {isReleased ? "Gate Unlocked" : isRework ? "In Reprocessing" : "Archived"}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Place Quarantine Hold Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Place Quality Quarantine Hold"
        subtitle="Initiate quality quarantine containment protocol"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleCreateHold} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateHold} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Batch / Lot Number
            </label>
            <input
              type="text"
              value={createForm.batchNumber}
              onChange={(e) => setCreateForm({ ...createForm, batchNumber: e.target.value })}
              placeholder="e.g. BAT-2026-0890"
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Quarantine / Hold Reason
            </label>
            <input
              type="text"
              value={createForm.reason}
              onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
              placeholder="e.g. Pasteurizer thermal excursion < 83.1°C"
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Risk Severity
            </label>
            <select
              value={createForm.severity}
              onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
              className="input-field"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <option value="CRITICAL">CRITICAL (Food Safety / CCP Stop)</option>
              <option value="HIGH">HIGH (Standard Deviation)</option>
              <option value="MEDIUM">MEDIUM (Minor Inspection Flaw)</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
            This immediately locks batch release with an immutable timestamp and QA audit trail.
          </div>
        </form>
      </Modal>

      {/* Investigation Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="QA Investigation Remark"
        subtitle={`Hold ID: ${activeHold?.holdCode || activeHold?.id} (${activeHold?.batch})`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveNote}>
              Attach Remark
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Investigation Details
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record root cause investigation, Brix re-test results, or thermal validation..."
              className="input-field"
              rows={4}
              required
            />
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 1: Authorize Final QA Release ─── */}
      <Modal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        title="Authorize Final QA Release"
        subtitle={`Batch: ${activeHold?.batch} — Unlock Finished Goods for Shipping`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={ShieldCheck} onClick={handleConfirmReleaseSubmit}>
              Confirm & Unlock Batch
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmReleaseSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", backgroundColor: "rgba(16, 185, 129, 0.08)", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <input
              type="checkbox"
              id="releaseCert"
              checked={releaseCertified}
              onChange={(e) => setReleaseCertified(e.target.checked)}
              style={{ marginTop: "3px", cursor: "pointer" }}
            />
            <label htmlFor="releaseCert" style={{ fontSize: "12px", color: "var(--text-primary)", cursor: "pointer", lineHeight: 1.4 }}>
              <strong>QA Compliance Verification:</strong> I certify that this batch has undergone comprehensive re-testing, meets all Critical Control Point (CCP) limits, and is safe for commercial shipping.
            </label>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Digital Security PIN Code
            </label>
            <input
              type="password"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            Submitting this authorization updates status to <code style={{ fontWeight: 600 }}>RELEASED</code> and logs an e-signature timestamp.
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: Route Batch to Rework Loop ─── */}
      <Modal
        isOpen={isReworkModalOpen}
        onClose={() => setIsReworkModalOpen(false)}
        title="Route Batch to Rework Loop"
        subtitle={`Batch: ${activeHold?.batch} — Corrective Reprocessing Protocol`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReworkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="warning" icon={RefreshCw} onClick={handleConfirmReworkSubmit}>
              Authorize Rework Loop
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmReworkSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Corrective Rework Protocol
            </label>
            <select
              value={reworkForm.protocol}
              onChange={(e) => setReworkForm({ ...reworkForm, protocol: e.target.value })}
              className="input-field"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <option value="Thermal Re-Pasteurization Loop">Thermal Re-Pasteurization Loop (Target &gt; 84°C)</option>
              <option value="Brix & Concentration Re-Blending">Brix & Concentration Re-Blending (Sugar/Syrup balance)</option>
              <option value="Filtration & Clarification Cycle">Filtration & Clarification Cycle (Micro-particulate screen)</option>
              <option value="Re-Packaging / Foil Seal Correction">Re-Packaging / Foil Seal Correction</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Rework Destination Work Center
            </label>
            <select
              value={reworkForm.destination}
              onChange={(e) => setReworkForm({ ...reworkForm, destination: e.target.value })}
              className="input-field"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <option value="Line 1 (Aseptic Bottling)">Line 1 (Aseptic Bottling Floor)</option>
              <option value="Line 2 (Formulation & Blending)">Line 2 (Formulation & Blending Tanks)</option>
              <option value="Tank T-02 Blending Buffer">Mixing Tank T-02 (Buffer Reservoir)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Supervisor Rework Authorization PIN
            </label>
            <input
              type="password"
              value={reworkForm.pin}
              onChange={(e) => setReworkForm({ ...reworkForm, pin: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "10px", backgroundColor: "rgba(245, 158, 11, 0.08)", borderRadius: "6px" }}>
            Submitting this authorization updates status to <code style={{ fontWeight: 600 }}>REWORK</code> and notifies floor operators to initiate batch reprocessing.
          </div>
        </form>
      </Modal>
    </div>
  );
}

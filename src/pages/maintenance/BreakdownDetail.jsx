import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowLeft,
  SearchCode,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function BreakdownDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { breakdowns, resolveBreakdown, addVerifiedSolution } = useCMMS();
  const { addToast } = useApp();

  const bd = breakdowns.find((b) => b.id === id) || breakdowns[0];

  const [repairNotes, setRepairNotes] = useState(bd.repairAction || "");
  const [rootCauseText, setRootCauseText] = useState(bd.rootCause || "");
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const handleResolve = (e) => {
    e.preventDefault();
    resolveBreakdown(bd.id, {
      rootCause: rootCauseText || "Degraded gasket seal caused by thermal cycling.",
      repairAction: repairNotes || "Replaced damaged gaskets and completed 10 bar pressure check."
    });
    addToast(`Breakdown ${bd.id} resolved! Asset restored to Operational state.`);
    setIsResolveModalOpen(false);
  };

  const handleStartRCA = () => {
    addToast(`RCA Investigation launched for Breakdown ${bd.id}!`);
    navigate("/rca-capa");
  };

  const handleCreateVerifiedSolution = () => {
    const newSol = addVerifiedSolution({
      problemSymptom: bd.symptom,
      assetType: "Packaging & Processing",
      applicableMachines: [bd.assetId],
      failureCode: bd.failureCode,
      failureCategory: bd.failureCategory,
      rootCause: bd.rootCause || rootCauseText,
      diagnosticSteps: ["1. Perform visual inspection", "2. Check loop pressure transmitter"],
      repairProcedure: [bd.repairAction || repairNotes || "Replace worn seals and hydro-test to 10 bar."],
      partsRequired: [{ partNo: "GSK-EPDM-HT105", name: "EPDM Gasket Pack", qty: 1 }],
      toolsRequired: ["Torque Wrench 300Nm", "Pressure Tester"],
      testAndVerification: "Run 20-min CIP circulation without pressure drop.",
      tags: ["breakdown", bd.assetId.toLowerCase()]
    });
    addToast(`Breakdown repair converted to Verified Solution ${newSol.id}!`);
    navigate("/maintenance/verified-solutions");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/maintenance/breakdowns")}
          className="btn btn-ghost"
          style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={14} /> Back to Breakdowns
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
                {bd.id}: {bd.assetName}
              </h1>
              <Badge variant={bd.status === "Resolved" ? "emerald" : "rose"} dot={bd.status !== "Resolved"}>
                {bd.status}
              </Badge>
              <Badge variant="rose">{bd.failureCode}</Badge>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Started: {bd.startTime} • Plant: {bd.plant} • Line: {bd.line} • Lead Tech: <strong style={{ color: "#38BDF8" }}>{bd.technician}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button variant="secondary" icon={SearchCode} onClick={handleStartRCA}>
              Start RCA / 5-Why
            </Button>
            {bd.status !== "Resolved" ? (
              <Button variant="success" icon={CheckCircle2} onClick={() => setIsResolveModalOpen(true)}>
                Complete Repair & Resolve
              </Button>
            ) : (
              <Button variant="primary" icon={Sparkles} onClick={handleCreateVerifiedSolution}>
                Convert to Verified Solution
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Incident Impact Cards */}
      <div className="grid-4">
        <Card style={{ borderLeft: "3px solid #EF4444" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Downtime Duration
          </span>
          <div className="stat-value" style={{ color: "#EF4444", margin: "8px 0" }}>
            {bd.durationMinutes} mins
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {bd.endTime ? `Closed at ${bd.endTime}` : "Active line clock running"}
          </span>
        </Card>

        <Card style={{ borderLeft: "3px solid #F59E0B" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Production Units Lost
          </span>
          <div className="stat-value" style={{ color: "#F59E0B", margin: "8px 0" }}>
            {bd.impact?.productionLossUnits?.toLocaleString() || "4,200"}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Units of scheduled SKU</span>
        </Card>

        <Card style={{ borderLeft: "3px solid #EF4444" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Financial Loss Impact
          </span>
          <div className="stat-value" style={{ color: "#EF4444", margin: "8px 0" }}>
            ${bd.impact?.downtimeCostUSD?.toLocaleString() || "12,600"}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Absorbed plant cost</span>
        </Card>

        <Card style={{ borderLeft: "3px solid #38BDF8" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Scrap Rate Impact
          </span>
          <div className="stat-value" style={{ color: "#38BDF8", margin: "8px 0" }}>
            {bd.impact?.scrapRatePercent || "4.8"}%
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Material variance</span>
        </Card>
      </div>

      {/* Breakdown Scope & Causal Analysis Grid */}
      <div className="grid-2">
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
            Incident Breakdown Scope & Symptom
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Observed Symptom</span>
              <p style={{ color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.5 }}>{bd.symptom}</p>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Root Cause Finding</span>
              <p style={{ color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.5 }}>
                {bd.rootCause || rootCauseText || "Investigation underway by thermal technician."}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Target Asset Tag:</span>
              <span style={{ fontWeight: 600, color: "#38BDF8" }}>{bd.assetId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Linked Work Order:</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{bd.linkedWorkOrder || "WO-2026-0888"}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
            Repair Execution & Verification
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Repair Procedure Carried Out</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Details of physical repair, gasket torquing, sensor re-teaching..."
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => addToast("Repair procedure notes saved to Breakdown Incident Log.")}
              >
                Save Progress
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Resolve Breakdown Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Breakdown & Restore Line"
        subtitle={`Mark incident ${bd.id} as resolved and restore ${bd.assetId} to Operational status`}
      >
        <form onSubmit={handleResolve} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Confirmed Root Cause *</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Caustic CIP chemical degradation on EPDM gasket..."
              value={rootCauseText}
              onChange={(e) => setRootCauseText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Final Repair Verification Notes *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Hydro-test passed at 10.0 bar for 15 mins. Clean-in-Place complete..."
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" icon={CheckCircle2}>
              Confirm Resolution & Start Line
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

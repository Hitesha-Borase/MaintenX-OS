import React, { useState, useMemo } from "react";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { Wrench, AlertOctagon, CheckCircle2, Play, FilePlus2, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useRole } from "../../context/RoleContext";
import { useException } from "../../context/ExceptionContext";

export function QuickActionDrawer() {
  const { isQuickActionOpen, setIsQuickActionOpen, addToast, quickActionForm, setQuickActionForm } = useApp();
  const { assets: cmmsAssets, addWorkOrder, reportBreakdown, failureCodes: cmmsFailureCodes } = useCMMS();
  const { assets: masterAssets, employees: masterEmployees } = useMasterData();
  const { currentRole } = useRole();
  const { addException } = useException();
  const navigate = useNavigate();

  const [activeForm, setActiveForm] = useState(null); // 'work_order' | 'breakdown' | 'exception'
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isQuickActionOpen && quickActionForm) {
      setActiveForm(quickActionForm);
    } else if (!isQuickActionOpen) {
      setActiveForm(null);
      if (setQuickActionForm) setQuickActionForm(null);
    }
  }, [isQuickActionOpen, quickActionForm, setQuickActionForm]);

  // ─── ASSET SOURCE: Live PostgreSQL DB (MasterDataContext) with fallback ───
  const assets = useMemo(() => {
    if (masterAssets && masterAssets.length > 0) {
      return masterAssets.map((a) => ({
        id: a.dbId || a.id || a.assetCode || a.assetId,
        code: a.assetCode || a.assetId || a.id,
        name: a.name,
        department: a.department || a.lineName || a.type || "Packaging",
        line: a.lineName || a.line || a.department || "Line 1",
        plant: a.plantId || a.plant || "Plant 1",
        status: a.status || "Operational",
        type: a.type || "",
        _raw: a,
      }));
    }
    return (cmmsAssets || []).map((a) => ({
      id: a.id,
      code: a.id,
      name: a.name,
      department: a.department || "General",
      line: a.line || "Line 1",
      plant: a.plant || "Plant 1",
      status: a.status || "Operational",
      type: a.type || "",
    }));
  }, [masterAssets, cmmsAssets]);

  // ─── TECHNICIAN SOURCE: Live PostgreSQL DB staff/employees ───
  const technicians = useMemo(() => {
    if (masterEmployees && masterEmployees.length > 0) {
      return masterEmployees
        .filter((e) => e.name)
        .map((e) => ({
          id: e.id || e.employeeId,
          name: e.name,
          label: `${e.name}${e.role || e.designation ? ` (${e.role || e.designation})` : ""}`,
        }));
    }
    return [
      { id: "TECH-01", name: "Maintenance Technician", label: "Maintenance Technician (Duty)" },
    ];
  }, [masterEmployees]);

  // Current logged-in user name for "Reported By" / "Created By"
  const currentUserName = currentRole?.user?.name || "Stefan Crawford (Plant Manager)";

  // ─── WORK ORDER FORM STATES ───
  const [woAssetId, setWoAssetId] = useState("");
  const [woTitle, setWoTitle] = useState("");
  const [woPriority, setWoPriority] = useState("P2 - High");
  const [woType, setWoType] = useState("Corrective");
  const [woTechnicianId, setWoTechnicianId] = useState("");
  const [woDescription, setWoDescription] = useState("");

  // ─── BREAKDOWN FORM STATES ───
  const [bdAssetId, setBdAssetId] = useState("");
  const [bdCategory, setBdCategory] = useState("Mechanical");
  const [bdFailureCode, setBdFailureCode] = useState("MEC-001");
  const [bdSeverity, setBdSeverity] = useState("Critical");
  const [bdTechnicianId, setBdTechnicianId] = useState("");
  const [bdSymptom, setBdSymptom] = useState("");

  // ─── EXCEPTION FORM STATES ───
  const [excTitle, setExcTitle] = useState("");
  const [excStage, setExcStage] = useState("Filling & Packaging");
  const [excSeverity, setExcSeverity] = useState("HIGH");
  const [excOwner, setExcOwner] = useState("");
  const [excDescription, setExcDescription] = useState("");

  // Failure Codes list
  const failureCodesList = useMemo(() => {
    if (cmmsFailureCodes && cmmsFailureCodes.length > 0) {
      return cmmsFailureCodes.map((fc) => ({
        code: fc.code || fc.id,
        name: fc.name || fc.description || fc.code,
      }));
    }
    return [
      { code: "MEC-001", name: "Bearing Seizure / Mechanical Fault" },
      { code: "ELE-002", name: "Drive Inverter Trip / Power Loss" },
      { code: "PNE-003", name: "Pressure Regulator Drop / Leak" },
      { code: "SEN-004", name: "Photoelectric Sensor Drift" },
      { code: "JAM-005", name: "Infeed Conveyor Jam" },
      { code: "PRC-006", name: "Thermal Pasteurization Out of Spec" },
    ];
  }, [cmmsFailureCodes]);

  // Sync default IDs when lists load
  React.useEffect(() => {
    if (assets?.length > 0) {
      setWoAssetId((prev) => (assets.some((a) => a.id === prev) ? prev : assets[0].id));
      setBdAssetId((prev) => (assets.some((a) => a.id === prev) ? prev : assets[0].id));
    }
  }, [assets]);

  React.useEffect(() => {
    if (technicians?.length > 0) {
      setWoTechnicianId((prev) => (technicians.some((t) => t.id === prev) ? prev : technicians[0].id));
      setBdTechnicianId((prev) => (technicians.some((t) => t.id === prev) ? prev : technicians[0].id));
      setExcOwner((prev) => (technicians.some((t) => t.name === prev) ? prev : technicians[0].name));
    }
  }, [technicians]);

  // ─── 1. DISPATCH WORK ORDER TO BACKEND ───
  const handleCreateWO = async (e) => {
    e.preventDefault();
    if (!woTitle.trim()) {
      addToast("Please enter a Work Order title", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const asset = assets.find((a) => a.id === woAssetId);
      const technician = technicians.find((t) => t.id === woTechnicianId);
      const technicianLabel = technician?.label || technician?.name || "Unassigned";

      const woPayload = {
        title: woTitle.trim(),
        assetId: asset?.id || woAssetId,
        assetName: asset?.name || woAssetId,
        type: woType,
        priority: woPriority,
        department: asset?.department || "General",
        assignedTechnician: technician?.name || technicianLabel,
        assignedTo: technician?.id,
        technician: technician?.name || technicianLabel,
        createdBy: currentUserName,
        description: woDescription.trim() || `${woType} maintenance work order dispatched by ${currentUserName}.`,
      };

      const newWO = await addWorkOrder(woPayload);
      const displayId = newWO?.woNumber || newWO?.id || "New";

      addToast(`✅ Work Order ${displayId} created & dispatched to ${technicianLabel}!`, "success");
      setIsQuickActionOpen(false);
      setActiveForm(null);
      setWoTitle("");
      setWoDescription("");
    } catch (err) {
      console.error("Fast Action Dispatch WO error:", err);
      addToast(`Failed to dispatch work order: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 2. REPORT BREAKDOWN TO BACKEND ───
  const handleReportBD = async (e) => {
    e.preventDefault();
    if (!bdSymptom.trim()) {
      addToast("Please enter the observed breakdown symptom", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const asset = assets.find((a) => a.id === bdAssetId);
      const technician = technicians.find((t) => t.id === bdTechnicianId);
      const technicianName = technician?.name || "Unassigned";

      const bdPayload = {
        assetId: asset?.id || bdAssetId,
        assetName: asset?.name || bdAssetId,
        plant: asset?.plant || "Plant 1",
        department: asset?.department || "General",
        line: asset?.line || "Line 1",
        failureCode: bdFailureCode,
        failureCategory: bdCategory,
        severity: bdSeverity,
        symptom: bdSymptom.trim(),
        technician: technicianName,
        reportedBy: currentUserName,
        impact: {
          productionLossUnits: bdSeverity === "Critical" ? 5000 : 1500,
          downtimeCostUSD: bdSeverity === "Critical" ? 3500 : 800,
          safetyRisk: bdSeverity === "Critical" ? "High" : "Medium",
          scrapRatePercent: 2.5,
        },
      };

      const newBD = await reportBreakdown(bdPayload);
      const displayId = newBD?.id || newBD?.dbId || "Logged";

      addToast(`🚨 Breakdown ${displayId} logged! ${technicianName} dispatched.`, "error");
      setIsQuickActionOpen(false);
      setActiveForm(null);
      setBdSymptom("");
      navigate(`/breakdowns/log`);
    } catch (err) {
      console.error("Fast Action Dispatch Breakdown error:", err);
      addToast(`Failed to log breakdown: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 3. LOG OPERATIONAL EXCEPTION TO POSTGRESQL ───
  const handleCreateException = async (e) => {
    e.preventDefault();
    if (!excTitle.trim()) {
      addToast("Please enter exception headline", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await addException({
        title: excTitle.trim(),
        stage: excStage,
        severity: excSeverity,
        owner: excOwner || currentUserName,
        assetOrOrder: assets[0]?.name || "Line 1 Packaging",
        impactDescription: excDescription.trim() || `Flagged via Fast Action Dispatch by ${currentUserName}`,
        status: "OPEN",
      });

      addToast(`⚡ Operational Exception logged to Stage-Wise Feed & Risk Radar!`, "success");
      setIsQuickActionOpen(false);
      setActiveForm(null);
      setExcTitle("");
      setExcDescription("");
    } catch (err) {
      console.error("Fast Action Dispatch Exception error:", err);
      addToast(`Failed to log exception: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isQuickActionOpen}
      onClose={() => {
        setIsQuickActionOpen(false);
        setActiveForm(null);
        if (setQuickActionForm) setQuickActionForm(null);
      }}
      title="Fast Action Dispatch"
      subtitle="Single-click emergency commands, live CMMS dispatch & shop-floor escalations"
      width="490px"
    >
      {!activeForm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Action 1: Create Work Order */}
          <div
            className="flow-card flow-card-interactive"
            onClick={() => setActiveForm("work_order")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              cursor: "pointer",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card-subtle)",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
              <Wrench size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Create &amp; Dispatch Work Order
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", margin: 0 }}>
                Dispatch corrective, preventive, or emergency maintenance ticket to on-duty technician
              </p>
            </div>
          </div>

          {/* Action 2: Report Breakdown */}
          <div
            className="flow-card flow-card-interactive"
            onClick={() => setActiveForm("breakdown")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              cursor: "pointer",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card-subtle)",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
              <AlertOctagon size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Report Unplanned Breakdown &amp; Halt
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", margin: 0 }}>
                Start downtime timer, trigger first-responder technician paging &amp; halt line
              </p>
            </div>
          </div>

          {/* Action 3: Fast Operational Exception */}
          <div
            className="flow-card flow-card-interactive"
            onClick={() => setActiveForm("exception")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              cursor: "pointer",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card-subtle)",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Log Operational Exception / Hazard
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", margin: 0 }}>
                Post instant risk alert to Command Center Stage-Wise Feed &amp; Risk Radar
              </p>
            </div>
          </div>

          {/* Action 4: Guided Troubleshooting */}
          <div
            className="flow-card flow-card-interactive"
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate("/troubleshooting");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              cursor: "pointer",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card-subtle)",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
              <Play size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Guided Troubleshooting Wizard
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", margin: 0 }}>
                Diagnostic decision tree, SOP manuals &amp; verified fault solutions
              </p>
            </div>
          </div>

          {/* Action 5: Execute PM Checklist */}
          <div
            className="flow-card flow-card-interactive"
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate("/preventive-maintenance/execution");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              cursor: "pointer",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card-subtle)",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#A855F7" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Execute PM Inspection Checklist
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", margin: 0 }}>
                Digital PM checklist, sensor calibration &amp; condition monitoring run
              </p>
            </div>
          </div>
        </div>

      ) : activeForm === "work_order" ? (
        /* ========================================================================= */
        /* FORM: CREATE WORK ORDER */
        /* ========================================================================= */
        <form onSubmit={handleCreateWO} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent-blue)", margin: 0 }}>
              New Work Order Dispatch
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>Back</Button>
          </div>

          <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            📋 <strong style={{ color: "var(--text-primary)" }}>Dispatched By:</strong> {currentUserName}
          </div>

          {/* Target Asset */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Target Asset *
            </label>
            <select
              className="form-select"
              value={woAssetId}
              onChange={(e) => setWoAssetId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
            >
              {assets.length === 0 ? (
                <option value="">No registered assets found</option>
              ) : (
                assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code || a.id} — {a.name} ({a.department || a.line || "Line 1"})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* WO Type & Priority Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Type
              </label>
              <select
                className="form-select"
                value={woType}
                onChange={(e) => setWoType(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
                <option value="Emergency">Emergency</option>
                <option value="Calibration">Calibration</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Priority
              </label>
              <select
                className="form-select"
                value={woPriority}
                onChange={(e) => setWoPriority(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                <option value="P1 - Critical">P1 - Critical (Immediate)</option>
                <option value="P2 - High">P2 - High (&lt; 4 hrs)</option>
                <option value="P3 - Medium">P3 - Medium (&lt; 24 hrs)</option>
                <option value="P4 - Low">P4 - Low (Scheduled)</option>
              </select>
            </div>
          </div>

          {/* Work Order Title */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Work Order Title *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Replace drive belt on Infeed Conveyor"
              value={woTitle}
              onChange={(e) => setWoTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", boxSizing: "border-box" }}
            />
          </div>

          {/* Assign Technician */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Assign Technician
            </label>
            <select
              className="form-select"
              value={woTechnicianId}
              onChange={(e) => setWoTechnicianId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Instructions &amp; Special Safety Notes
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detailed instructions for technician, PPE requirements, lockout tags..."
              value={woDescription}
              onChange={(e) => setWoDescription(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button variant="secondary" type="button" onClick={() => setActiveForm(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={isSubmitting ? Loader2 : FilePlus2} disabled={isSubmitting}>
              {isSubmitting ? "Dispatching..." : "Create & Dispatch WO"}
            </Button>
          </div>
        </form>

      ) : activeForm === "breakdown" ? (
        /* ========================================================================= */
        /* FORM: REPORT BREAKDOWN */
        /* ========================================================================= */
        <form onSubmit={handleReportBD} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent-rose)", margin: 0 }}>
              Log Unplanned Breakdown &amp; Emergency Halt
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>Back</Button>
          </div>

          <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "rgba(239,68,68,0.06)", fontSize: "12px", color: "var(--text-secondary)", border: "1px solid rgba(239,68,68,0.2)" }}>
            🚨 <strong style={{ color: "#EF4444" }}>Emergency Stoppage Logged By:</strong> {currentUserName}
          </div>

          {/* Asset */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Asset with Breakdown *
            </label>
            <select
              className="form-select"
              value={bdAssetId}
              onChange={(e) => setBdAssetId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
            >
              {assets.length === 0 ? (
                <option value="">No registered assets found</option>
              ) : (
                assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code || a.id} — {a.name} ({a.line || a.department})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Category & Failure Code Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Failure Category
              </label>
              <select
                className="form-select"
                value={bdCategory}
                onChange={(e) => setBdCategory(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Pneumatic">Pneumatic</option>
                <option value="Instrumentation">Instrumentation</option>
                <option value="Process">Process</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Failure Code
              </label>
              <select
                className="form-select"
                value={bdFailureCode}
                onChange={(e) => setBdFailureCode(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                {failureCodesList.map((fc) => (
                  <option key={fc.code} value={fc.code}>
                    {fc.code} — {fc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Severity & First Responder */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Severity
              </label>
              <select
                className="form-select"
                value={bdSeverity}
                onChange={(e) => setBdSeverity(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                <option value="Critical">P1 - Critical (Line Halted)</option>
                <option value="High">P2 - High (Speed Reduced)</option>
                <option value="Medium">P3 - Medium (Intermittent)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                First Responder
              </label>
              <select
                className="form-select"
                value={bdTechnicianId}
                onChange={(e) => setBdTechnicianId(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Observed Symptom */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Observed Symptom / Alarm Message *
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Drive motor overheated, continuous trip on breaker, pneumatic line ruptured..."
              value={bdSymptom}
              onChange={(e) => setBdSymptom(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button variant="secondary" type="button" onClick={() => setActiveForm(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" icon={isSubmitting ? Loader2 : AlertOctagon} disabled={isSubmitting}>
              {isSubmitting ? "Halting Line & Logging..." : "Halt Line & Dispatch"}
            </Button>
          </div>
        </form>

      ) : (
        /* ========================================================================= */
        /* FORM: LOG OPERATIONAL EXCEPTION (POSTGRESQL pm_exceptions) */
        /* ========================================================================= */
        <form onSubmit={handleCreateException} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#D97706", margin: 0 }}>
              Raise Operational Exception / Hazard
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>Back</Button>
          </div>

          <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "rgba(245,158,11,0.08)", fontSize: "12px", color: "var(--text-secondary)", border: "1px solid rgba(245,158,11,0.2)" }}>
            ⚡ <strong style={{ color: "#D97706" }}>Logged To:</strong> PostgreSQL `pm_exceptions` &amp; Live Radar Feed
          </div>

          {/* Exception Title */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Exception Title / Deviation Headline *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Pasteurizer Holding Temp Dropped below 85°C"
              value={excTitle}
              onChange={(e) => setExcTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", boxSizing: "border-box" }}
            />
          </div>

          {/* Stage & Severity Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Manufacturing Stage
              </label>
              <select
                className="form-select"
                value={excStage}
                onChange={(e) => setExcStage(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                <option value="Formulation & Mixing">1. Formulation &amp; Mixing</option>
                <option value="Thermal & Pasteurization">2. Thermal &amp; Pasteurization</option>
                <option value="Filling & Packaging">3. Filling &amp; Packaging</option>
                <option value="Quality / CCP Lab">4. Quality / CCP Lab</option>
                <option value="Utilities & CIP">5. Utilities &amp; CIP</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
                Severity
              </label>
              <select
                className="form-select"
                value={excSeverity}
                onChange={(e) => setExcSeverity(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
              >
                <option value="CRITICAL">CRITICAL (Immediate Action)</option>
                <option value="HIGH">HIGH (Escalated)</option>
                <option value="MEDIUM">MEDIUM (Warning)</option>
              </select>
            </div>
          </div>

          {/* Assigned Owner */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Assigned Action Owner
            </label>
            <input
              type="text"
              className="form-input"
              list="drawer-owners"
              value={excOwner}
              onChange={(e) => setExcOwner(e.target.value)}
              placeholder="e.g. Stefan Crawford, Duty Supervisor..."
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", boxSizing: "border-box" }}
            />
            <datalist id="drawer-owners">
              {technicians.map((t) => (
                <option key={t.id} value={t.name} />
              ))}
              <option value="Stefan Crawford" />
              <option value="Ronald Robinson" />
            </datalist>
          </div>

          {/* Impact Description */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px", display: "block" }}>
              Root Cause Hypothesis &amp; Floor Impact
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe deviation context, hold requirements, and immediate containment instructions..."
              value={excDescription}
              onChange={(e) => setExcDescription(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button variant="secondary" type="button" onClick={() => setActiveForm(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={isSubmitting ? Loader2 : AlertTriangle}
              disabled={isSubmitting}
              style={{ backgroundColor: "#D97706", borderColor: "#B45309" }}
            >
              {isSubmitting ? "Logging Exception..." : "Log Exception to Radar"}
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
}

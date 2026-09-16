import React, { useState, useMemo } from "react";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { Wrench, AlertOctagon, CheckCircle2, Play, FilePlus2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useRole } from "../../context/RoleContext";
import maintenanceService from "../../services/maintenanceService";

export function QuickActionDrawer() {
  const { isQuickActionOpen, setIsQuickActionOpen, addToast, quickActionForm, setQuickActionForm } = useApp();
  const { assets: cmmsAssets, addWorkOrder, reportBreakdown } = useCMMS();
  const { assets: masterAssets, employees: masterEmployees } = useMasterData();
  const { currentRole } = useRole();
  const navigate = useNavigate();

  const [activeForm, setActiveForm] = useState(null); // 'work_order' | 'breakdown'

  React.useEffect(() => {
    if (isQuickActionOpen && quickActionForm) {
      setActiveForm(quickActionForm);
    } else if (!isQuickActionOpen) {
      setActiveForm(null);
      if (setQuickActionForm) setQuickActionForm(null);
    }
  }, [isQuickActionOpen, quickActionForm, setQuickActionForm]);

  // ─── ASSET SOURCE: Real DB (MasterDataContext) → fallback to CMMSContext mock ───
  // MasterDataContext loads from PostgreSQL via GET /api/v1/master-data/assets
  // CMMSContext loads from mockAssets.js (hardcoded fallback)
  const assets = useMemo(() => {
    if (masterAssets && masterAssets.length > 0) {
      // Normalize DB asset shape → consistent { id, name, department, line }
      return masterAssets.map((a) => ({
        id: a.assetId || a.assetCode || a.id,
        name: a.name,
        department: a.department || a.lineName || a.type || "General",
        line: a.lineName || a.line || a.department || "",
        plant: a.plantId || a.plant || "",
        status: a.status || "Operational",
        type: a.type || "",
        _raw: a,
      }));
    }
    // Fallback to CMMSContext mock assets
    return (cmmsAssets || []);
  }, [masterAssets, cmmsAssets]);

  // ─── TECHNICIAN SOURCE: Real DB staff/employees ───
  const technicians = useMemo(() => {
    if (masterEmployees && masterEmployees.length > 0) {
      return masterEmployees
        .filter((e) => e.name) // only those with names
        .map((e) => ({
          id: e.employeeId || e.id,
          name: e.name,
          label: `${e.name}${e.designation ? ` (${e.designation})` : ""}`,
        }));
    }
    // Fallback: use logged-in user or generic list
    return [
      { id: "TECH-01", name: "Maintenance Technician", label: "Maintenance Technician" },
    ];
  }, [masterEmployees]);

  // Current logged-in user name for "Reported By" / "Created By"
  const currentUserName = currentRole?.user?.name || "Plant Manager";

  // ─── FORM STATES ───
  const [woAssetId, setWoAssetId] = useState("");
  const [woTitle, setWoTitle] = useState("");
  const [woPriority, setWoPriority] = useState("P2 - High");
  const [woType, setWoType] = useState("Corrective");
  const [woTechnicianId, setWoTechnicianId] = useState("");
  const [woDescription, setWoDescription] = useState("");

  const [bdAssetId, setBdAssetId] = useState("");
  const [bdSymptom, setBdSymptom] = useState("");
  const [bdTechnicianId, setBdTechnicianId] = useState("");
  const [bdCategory, setBdCategory] = useState("Mechanical");

  // Sync default IDs when lists load
  React.useEffect(() => {
    if (assets?.length > 0) {
      setWoAssetId((prev) => {
        const isValid = assets.some((a) => a.id === prev);
        return isValid ? prev : assets[0].id;
      });
      setBdAssetId((prev) => {
        const isValid = assets.some((a) => a.id === prev);
        return isValid ? prev : assets[0].id;
      });
    }
  }, [assets]);

  React.useEffect(() => {
    if (technicians?.length > 0) {
      setWoTechnicianId((prev) => {
        const isValid = technicians.some((t) => t.id === prev);
        return isValid ? prev : technicians[0].id;
      });
      setBdTechnicianId((prev) => {
        const isValid = technicians.some((t) => t.id === prev);
        return isValid ? prev : technicians[0].id;
      });
    }
  }, [technicians]);

  const handleCreateWO = async (e) => {
    e.preventDefault();
    if (!woTitle.trim()) {
      addToast("Please enter a Work Order title", "warning");
      return;
    }

    const asset = assets.find((a) => a.id === woAssetId);
    const technician = technicians.find((t) => t.id === woTechnicianId);
    const technicianLabel = technician?.label || technician?.name || "Unassigned";

    const woPayload = {
      title: woTitle,
      assetId: woAssetId,
      assetName: asset?.name || woAssetId,
      type: woType,
      priority: woPriority,
      department: asset?.department || "General",
      assignedTechnician: technicianLabel,
      createdBy: currentUserName,
      description: woDescription || `${woType} maintenance work order dispatched by ${currentUserName}.`,
    };

    const newWO = addWorkOrder(woPayload);

    addToast(`✅ Work Order ${newWO.id} created & dispatched to ${technicianLabel}!`, "success");
    setIsQuickActionOpen(false);
    setActiveForm(null);
    setWoTitle("");
    setWoDescription("");
  };

  const handleReportBD = (e) => {
    e.preventDefault();
    if (!bdSymptom.trim()) {
      addToast("Please enter the breakdown symptom", "warning");
      return;
    }

    const asset = assets.find((a) => a.id === bdAssetId);
    const technician = technicians.find((t) => t.id === bdTechnicianId);
    const technicianName = technician?.name || "Unassigned";

    const newBD = reportBreakdown({
      assetId: bdAssetId,
      assetName: asset?.name || bdAssetId,
      plant: asset?.plant || "Plant 1",
      department: asset?.department || "General",
      line: asset?.line || "Line 1",
      failureCode: "MEC-004",
      failureCategory: bdCategory,
      symptom: bdSymptom,
      technician: technicianName,
      reportedBy: currentUserName,
      impact: { productionLossUnits: 0, downtimeCostUSD: 0, safetyRisk: "Medium", scrapRatePercent: 0 },
    });

    addToast(`🚨 Breakdown ${newBD.id} logged! ${technicianName} has been notified.`);
    setIsQuickActionOpen(false);
    setActiveForm(null);
    setBdSymptom("");
    navigate(`/breakdowns/log`);
  };

  return (
    <Drawer
      isOpen={isQuickActionOpen}
      onClose={() => {
        setIsQuickActionOpen(false);
        setActiveForm(null);
        if (setQuickActionForm) setQuickActionForm(null);
      }}
      title="Maintenance Fast Actions"
      subtitle="Shop-floor fast dispatch, breakdown logs & diagnostic tools"
      width="480px"
    >
      {!activeForm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            className="flow-card flow-card-interactive"
            onClick={() => setActiveForm("work_order")}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", cursor: "pointer" }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
              <Wrench size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Create Work Order</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Dispatch corrective, preventive, or emergency maintenance tasks
              </p>
            </div>
          </div>

          <div
            className="flow-card flow-card-interactive"
            onClick={() => setActiveForm("breakdown")}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", cursor: "pointer" }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
              <AlertOctagon size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Report Unplanned Breakdown</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Halt line timer, trigger technician paging & auto-log downtime
              </p>
            </div>
          </div>

          <div
            className="flow-card flow-card-interactive"
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate("/troubleshooting");
            }}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", cursor: "pointer" }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
              <Play size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Guided Troubleshooting Wizard</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Diagnostic decision tree and verified solutions
              </p>
            </div>
          </div>

          <div
            className="flow-card flow-card-interactive"
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate("/preventive-maintenance/execution");
            }}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", cursor: "pointer" }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Execute PM Checklist</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Digital PM inspection checklist & condition verification
              </p>
            </div>
          </div>
        </div>

      ) : activeForm === "work_order" ? (
        <form onSubmit={handleCreateWO} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-blue)" }}>New Work Order</h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>Back</Button>
          </div>

          {/* Created By — auto-filled from logged-in user */}
          <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            📋 <strong style={{ color: "var(--text-primary)" }}>Created By:</strong> {currentUserName}
          </div>

          {/* Target Asset — from PostgreSQL DB */}
          <div className="form-group">
            <label className="form-label">Target Asset *</label>
            <select className="form-select" value={woAssetId} onChange={(e) => setWoAssetId(e.target.value)}>
              {assets.length === 0 ? (
                <option value="">No assets registered — add in Master Data</option>
              ) : (
                assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name} ({a.department || a.type || "General"})
                  </option>
                ))
              )}
            </select>
            {assets.length === 0 && (
              <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px" }}>
                ⚠️ Add assets first at: Master Data → Assets Master
              </p>
            )}
          </div>

          {/* WO Type */}
          <div className="form-group">
            <label className="form-label">Work Order Type</label>
            <select className="form-select" value={woType} onChange={(e) => setWoType(e.target.value)}>
              <option value="Corrective">Corrective (Fix a fault)</option>
              <option value="Preventive">Preventive (Scheduled PM)</option>
              <option value="Emergency">Emergency (Immediate halt)</option>
              <option value="Inspection">Inspection / Condition Check</option>
            </select>
          </div>

          {/* Work Order Title */}
          <div className="form-group">
            <label className="form-label">Work Order Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Replace Worn Drive Belt / Fix Sensor Drift"
              value={woTitle}
              onChange={(e) => setWoTitle(e.target.value)}
              required
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={woPriority} onChange={(e) => setWoPriority(e.target.value)}>
              <option value="P1 - Critical">P1 - Critical (Immediate Production Halt)</option>
              <option value="P2 - High">P2 - High (Action within 4 hours)</option>
              <option value="P3 - Medium">P3 - Medium (Action within 24 hours)</option>
              <option value="P4 - Low">P4 - Low (Routine / Next Scheduled Window)</option>
            </select>
          </div>

          {/* Assign Technician — from PostgreSQL staff table */}
          <div className="form-group">
            <label className="form-label">Assign Technician</label>
            <select className="form-select" value={woTechnicianId} onChange={(e) => setWoTechnicianId(e.target.value)}>
              {technicians.length === 0 ? (
                <option value="">No staff registered — add in Master Data</option>
              ) : (
                technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))
              )}
            </select>
            {technicians.length <= 1 && masterEmployees?.length === 0 && (
              <p style={{ fontSize: "11px", color: "#F59E0B", marginTop: "4px" }}>
                ⚠️ Add staff at: Master Data → Staff &amp; Skills
              </p>
            )}
          </div>

          {/* Issue Details */}
          <div className="form-group">
            <label className="form-label">Issue Details &amp; Instructions</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe symptoms, required parts, or special safety notes..."
              value={woDescription}
              onChange={(e) => setWoDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "4px" }}>
            <Button variant="secondary" onClick={() => setActiveForm(null)}>Cancel</Button>
            <Button variant="primary" type="submit" icon={FilePlus2}>
              Create &amp; Dispatch WO
            </Button>
          </div>
        </form>

      ) : (
        <form onSubmit={handleReportBD} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-rose)" }}>Report Breakdown</h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>Back</Button>
          </div>

          {/* Reported By — auto-filled */}
          <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "rgba(239,68,68,0.06)", fontSize: "12px", color: "var(--text-secondary)", border: "1px solid rgba(239,68,68,0.2)" }}>
            🚨 <strong style={{ color: "#EF4444" }}>Reported By:</strong> {currentUserName}
          </div>

          {/* Asset with Breakdown — from PostgreSQL DB */}
          <div className="form-group">
            <label className="form-label">Asset with Breakdown *</label>
            <select className="form-select" value={bdAssetId} onChange={(e) => setBdAssetId(e.target.value)}>
              {assets.length === 0 ? (
                <option value="">No assets registered</option>
              ) : (
                assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name} ({a.line || a.department})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Failure Category */}
          <div className="form-group">
            <label className="form-label">Failure Category</label>
            <select className="form-select" value={bdCategory} onChange={(e) => setBdCategory(e.target.value)}>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Pneumatic">Pneumatic / Hydraulic</option>
              <option value="Instrumentation">Instrumentation / Sensor</option>
              <option value="Process">Process / Quality Deviation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Assign First Responder Technician — from PostgreSQL staff */}
          <div className="form-group">
            <label className="form-label">Assign First Responder</label>
            <select className="form-select" value={bdTechnicianId} onChange={(e) => setBdTechnicianId(e.target.value)}>
              {technicians.length === 0 ? (
                <option value="">No staff available</option>
              ) : (
                technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))
              )}
            </select>
          </div>

          {/* Observed Symptom */}
          <div className="form-group">
            <label className="form-label">Observed Symptom / Error Alarm *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe what occurred (e.g. Motor tripped on over-torque, seal leak at 8 bar)..."
              value={bdSymptom}
              onChange={(e) => setBdSymptom(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "4px" }}>
            <Button variant="secondary" onClick={() => setActiveForm(null)}>Cancel</Button>
            <Button variant="danger" type="submit" icon={AlertOctagon}>
              Log Breakdown &amp; Halt Line
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
}

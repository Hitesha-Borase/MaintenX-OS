import React, { useState } from "react";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { PlusCircle, Wrench, AlertOctagon, CheckCircle2, Play, FilePlus2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useProduction } from "../../context/ProductionContext";

export function QuickActionDrawer() {
  const { isQuickActionOpen, setIsQuickActionOpen, addToast } = useApp();
  const { assets, addWorkOrder, reportBreakdown } = useCMMS();
  const { productionOrders } = useProduction();
  const navigate = useNavigate();

  const [activeForm, setActiveForm] = useState(null); // 'work_order' | 'breakdown' | 'batch'

  // Form states
  const [woAssetId, setWoAssetId] = useState("FM-001");
  const [woTitle, setWoTitle] = useState("");
  const [woPriority, setWoPriority] = useState("P2 - High");
  const [woDescription, setWoDescription] = useState("");

  const [bdAssetId, setBdAssetId] = useState("FM-001");
  const [bdSymptom, setBdSymptom] = useState("");

  const handleCreateWO = (e) => {
    e.preventDefault();
    if (!woTitle.trim()) {
      addToast("Please enter a Work Order title", "warning");
      return;
    }
    const asset = assets.find((a) => a.id === woAssetId);
    const newWO = addWorkOrder({
      title: woTitle,
      assetId: woAssetId,
      assetName: asset?.name || woAssetId,
      type: "Corrective",
      priority: woPriority,
      department: asset?.department || "Packaging",
      assignedTechnician: "Marcus Vance (Senior Tech)",
      description: woDescription || "Quick maintenance dispatch generated from global action hub."
    });

    addToast(`Work Order ${newWO.id} created successfully!`);
    setIsQuickActionOpen(false);
    setActiveForm(null);
    setWoTitle("");
    setWoDescription("");
    navigate(`/maintenance/work-orders/${newWO.id}`);
  };

  const handleReportBD = (e) => {
    e.preventDefault();
    if (!bdSymptom.trim()) {
      addToast("Please enter the breakdown symptom", "warning");
      return;
    }
    const asset = assets.find((a) => a.id === bdAssetId);
    const newBD = reportBreakdown({
      assetId: bdAssetId,
      assetName: asset?.name || bdAssetId,
      plant: asset?.plant || "Plant 1",
      department: asset?.department || "Packaging",
      line: asset?.line || "Line 1",
      failureCode: "MEC-004",
      failureCategory: "Mechanical",
      symptom: bdSymptom,
      technician: "Marcus Vance",
      impact: { productionLossUnits: 2500, downtimeCostUSD: 4500, safetyRisk: "Medium", scrapRatePercent: 2.0 }
    });

    addToast(`Breakdown ${newBD.id} logged! Asset placed in Breakdown status.`);
    setIsQuickActionOpen(false);
    setActiveForm(null);
    setBdSymptom("");
    navigate(`/maintenance/breakdowns/${newBD.id}`);
  };

  return (
    <Drawer
      isOpen={isQuickActionOpen}
      onClose={() => {
        setIsQuickActionOpen(false);
        setActiveForm(null);
      }}
      title="Manufacturing Fast Actions"
      subtitle="Shop-floor fast dispatch, breakdown logs & batch controls"
      width="480px"
    >
      {!activeForm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            className="flow-card flow-card-interactive"
            onClick={() => setActiveForm("work_order")}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px" }}
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
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px" }}
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
              navigate("/maintenance/troubleshooting");
            }}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px" }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
              <Play size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Guided Troubleshooting Wizard</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                7-step symptom-to-solution diagnostic workflow
              </p>
            </div>
          </div>

          <div
            className="flow-card flow-card-interactive"
            onClick={() => {
              setIsQuickActionOpen(false);
              navigate("/quality");
            }}
            style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px" }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Log Quality / CCP Inspection</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Record Brix, seal pressure, temperature & micro swab results
              </p>
            </div>
          </div>
        </div>
      ) : activeForm === "work_order" ? (
        <form onSubmit={handleCreateWO} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-blue)" }}>New Work Order</h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>
              Back
            </Button>
          </div>

          <div className="form-group">
            <label className="form-label">Target Asset *</label>
            <select className="form-select" value={woAssetId} onChange={(e) => setWoAssetId(e.target.value)}>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.department})
                </option>
              ))}
            </select>
          </div>

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

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={woPriority} onChange={(e) => setWoPriority(e.target.value)}>
              <option value="P1 - Critical">P1 - Critical (Immediate Production Halt)</option>
              <option value="P2 - High">P2 - High (Action within 4 hours)</option>
              <option value="P3 - Medium">P3 - Medium (Action within 24 hours)</option>
              <option value="P4 - Low">P4 - Low (Routine / Next Scheduled Window)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Details & Instructions</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Detailed description of symptoms, required parts or special safety notes..."
              value={woDescription}
              onChange={(e) => setWoDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setActiveForm(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={FilePlus2}>
              Create & Dispatch WO
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReportBD} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-rose)" }}>Report Breakdown</h4>
            <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)}>
              Back
            </Button>
          </div>

          <div className="form-group">
            <label className="form-label">Asset with Breakdown *</label>
            <select className="form-select" value={bdAssetId} onChange={(e) => setBdAssetId(e.target.value)}>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.line})
                </option>
              ))}
            </select>
          </div>

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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setActiveForm(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" icon={AlertOctagon}>
              Log Breakdown & Halt Line
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Plus, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function CreateWorkOrder() {
  const navigate = useNavigate();
  const { assets, addWorkOrder, failureCodes, spareParts } = useCMMS();
  const { addToast } = useApp();

  const [assetId, setAssetId] = useState(assets[0]?.id || "FM-001");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Corrective");
  const [priority, setPriority] = useState("P2 - High");
  const [technician, setTechnician] = useState("Marcus Vance (Senior Tech)");
  const [failureCode, setFailureCode] = useState(failureCodes[0]?.code || "MEC-004");
  const [dueDate, setDueDate] = useState("2026-09-01 16:00");
  const [symptom, setSymptom] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPartNo, setSelectedPartNo] = useState(spareParts[0]?.partNo || "BRG-6208-2RS");
  const [selectedPartQty, setSelectedPartQty] = useState(1);

  const selectedAsset = assets.find((a) => a.id === assetId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast("Please provide a Work Order title", "warning");
      return;
    }

    const partObj = spareParts.find((p) => p.partNo === selectedPartNo);
    const newWO = addWorkOrder({
      title,
      assetId,
      assetName: selectedAsset?.name || assetId,
      type,
      priority,
      department: selectedAsset?.department || "Packaging",
      assignedTechnician: technician,
      dueDate,
      failureCode: `${failureCode} (${failureCodes.find(f => f.code === failureCode)?.name || ""})`,
      symptom,
      description,
      partsRequired: [
        {
          partNo: partObj?.partNo || selectedPartNo,
          name: partObj?.name || "Replacement Component",
          qty: selectedPartQty,
          unitCost: partObj?.unitCost || 45.0,
          status: "Issued"
        }
      ]
    });

    addToast(`Work Order ${newWO.id} created and dispatched!`);
    navigate(`/maintenance/work-orders/${newWO.id}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/maintenance/work-orders")}
          className="btn btn-ghost"
          style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={14} /> Back to Work Orders
        </button>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Create Maintenance Work Order
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Dispatch maintenance work orders with parts reservation, safety LOTO requirements, and technician assignment.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Machine & Classification Card */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            1. Equipment & Work Classification
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Target Asset *</label>
              <select className="form-select" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.name} ({a.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Work Order Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Corrective">Corrective Repair</option>
                <option value="Preventive">Preventive Maintenance (PM)</option>
                <option value="Emergency Breakdown">Emergency Breakdown</option>
                <option value="Calibration">Calibration & Metrology</option>
                <option value="Inspection">Inspection & Condition Scan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="P1 - Critical">P1 - Critical (Immediate Production Halt Risk)</option>
                <option value="P2 - High">P2 - High (Action within 4 hours)</option>
                <option value="P3 - Medium">P3 - Medium (Action within 24 hours)</option>
                <option value="P4 - Low">P4 - Low (Next planned shutdown)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Technician</label>
              <select className="form-select" value={technician} onChange={(e) => setTechnician(e.target.value)}>
                <option value="Marcus Vance (Senior Tech)">Marcus Vance (Senior Tech)</option>
                <option value="David Kim (Thermal Tech)">David Kim (Thermal Tech)</option>
                <option value="Sarah Jenkins (Lead Tech)">Sarah Jenkins (Lead Tech)</option>
                <option value="Elena Rostova (Operator)">Elena Rostova (Autonomous Care)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Issue & Instructions Card */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            2. Problem Symptom & Scope
          </h3>

          <div className="form-group">
            <label className="form-label">Work Order Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Replace Lower Spindle Bearing Cartridge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observed Symptom / Anomaly</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Vibration amplitude increased to 4.8 mm/s on lower bearing accelerometer..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Work Instructions & LOTO Precautions</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Step-by-step disassembly procedure, laser alignment tolerances, safety isolation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>

        {/* Spare Parts Reservation */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            3. Spare Parts Reservation
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Select Spare Part</label>
              <select className="form-select" value={selectedPartNo} onChange={(e) => setSelectedPartNo(e.target.value)}>
                {spareParts.map((p) => (
                  <option key={p.partNo} value={p.partNo}>
                    {p.partNo} - {p.name} ({p.stock} in stock • ${p.unitCost})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={selectedPartQty}
                onChange={(e) => setSelectedPartQty(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <Button variant="secondary" onClick={() => navigate("/maintenance/work-orders")}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={Save}>
            Create & Dispatch Work Order
          </Button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { AlertOctagon, Send, FileWarning, ShieldAlert, AlertTriangle, PhoneCall } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useExceptions } from "../../context/ExceptionContext";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function ReportIssue() {
  const { addException } = useExceptions();
  const { assets } = useCMMS();
  const { addToast } = useApp();

  const [issueType, setIssueType] = useState("Mechanical breakdown");
  const [assetId, setAssetId] = useState("FM-001");
  const [severity, setSeverity] = useState("P1");
  const [description, setDescription] = useState("");

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [hazardType, setHazardType] = useState("Major Pneumatic Leak / High Pressure Hazard");

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedAsset = assets.find((a) => a.id === assetId) || assets[0];

    const newException = {
      severity,
      category: issueType === "Mechanical breakdown" ? "Downtime" : "Quality Hold",
      title: `${issueType}: ${selectedAsset.name}`,
      location: `${selectedAsset.line || "Line 1"} - ${selectedAsset.department || "Bottling"}`,
      details: description,
      owner: "Unassigned",
      escalationLevel: severity === "P1" ? "Immediate Dispatch" : "Monitor Only",
      workOrder: null
    };

    addException(newException);
    addToast(`Critical ${severity} Exception Ticket logged for ${selectedAsset.name}.`, "danger");
    setDescription("");
  };

  const handleTriggerEmergencyCall = (e) => {
    e.preventDefault();
    addToast(`EMERGENCY ALERT: Pager broadcast dispatched to Maintenance Tech Lead & Safety Officer for "${hazardType}".`, "danger");
    setIsEmergencyModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Report Operational Issue & Safety Exception
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Log safety hazards, machine defects, and trigger immediate maintenance dispatch
          </p>
        </div>

        <Button variant="danger" icon={PhoneCall} onClick={() => setIsEmergencyModalOpen(true)}>
          Trigger Emergency Maintenance Call
        </Button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
              <ShieldAlert size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Log Incident or Exception Ticket
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Notify Line Leads, Maintenance dispatchers, and Plant Supervisors immediately
              </span>
            </div>
          </div>

          {/* Grid for selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {/* Issue Type */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Issue Classification
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="input-field"
              >
                <option value="Mechanical breakdown">Mechanical breakdown</option>
                <option value="Safety risk / Near miss">Safety risk / Near miss</option>
                <option value="Allergen / Sanitation defect">Allergen / Sanitation defect</option>
                <option value="Raw material stockout">Raw material stockout</option>
                <option value="Quality CCP Deviation">Quality CCP Deviation</option>
              </select>
            </div>

            {/* Select Asset */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Affected Station / Equipment
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="input-field"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Incident Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="input-field"
              >
                <option value="P1">P1 - Immediate Stop & Dispatch Required</option>
                <option value="P2">P2 - High Urgency (Production Bottleneck)</option>
                <option value="P3">P3 - Medium (Log & Watch)</option>
                <option value="P4">P4 - Low / Informational</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Issue Description & Symptoms
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ minHeight: "84px" }}
              placeholder="Provide exact details of what occurred..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="danger" icon={Send} style={{ width: "fit-content", padding: "10px 28px", alignSelf: "center" }}>
          Log Issue Ticket
        </Button>
      </form>

      {/* Emergency Maintenance Call Modal */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Emergency Maintenance & Safety Alert Broadcast"
        subtitle="Broadcast Priority P1 Alarm to On-Duty Maintenance Team"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEmergencyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={PhoneCall} onClick={handleTriggerEmergencyCall}>
              Dispatch Immediate Broadcast
            </Button>
          </>
        }
      >
        <form onSubmit={handleTriggerEmergencyCall} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Emergency Hazard Category
            </label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              className="input-field"
            >
              <option value="Major Pneumatic Leak / High Pressure Hazard">Major Pneumatic Leak / High Pressure Hazard</option>
              <option value="Electrical Short / Smoke Anomaly">Electrical Short / Smoke Anomaly</option>
              <option value="Structural Guard Slip / Interlock Failure">Structural Guard Slip / Interlock Failure</option>
              <option value="Chemical / CIP Spray Leak Emergency">Chemical / CIP Spray Leak Emergency</option>
            </select>
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFF5F5", border: "1px solid #FED7D7", fontSize: "12px", color: "#C53030" }}>
            Triggering an emergency call immediately alerts On-Call Maintenance Engineers and logs a P1 Critical Incident ticket.
          </div>
        </form>
      </Modal>
    </div>
  );
}

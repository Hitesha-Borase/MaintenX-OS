import React, { useState } from "react";
import { AlertOctagon, Send, FileWarning, ShieldAlert } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedAsset = assets.find((a) => a.id === assetId) || assets[0];

    const newException = {
      severity, // P1, P2, P3, P4
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Report Operational Issue
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log P1 critical failures directly to the Exception Control Tower
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Issue Type */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Issue Classification
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
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
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Affected Station / Equipment
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
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
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Incident Severity (Control Tower Priority)
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="P1">P1 - Immediate Stop & Dispatch Required</option>
              <option value="P2">P2 - High Urgency (Production Bottleneck)</option>
              <option value="P3">P3 - Medium (Log & Watch)</option>
              <option value="P4">P4 - Low / Informational</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Issue Description & Symptoms
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "100px" }}
              placeholder="Provide exact details of what occurred..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="danger" icon={Send}>
          Log Issue Ticket
        </Button>
      </form>
    </div>
  );
}

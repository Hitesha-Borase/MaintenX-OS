import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  AlertTriangle,
  Clock,
  Wrench,
  Camera,
  Save,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PMChecklistExecute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { checklistTemplates, handleFailedPMCheck, assets, updateAssetStatus } = useCMMS();
  const { addToast } = useApp();

  const template = checklistTemplates.find((t) => t.id === id) || checklistTemplates[0];

  // Editable sections and item states
  const [sections, setSections] = useState(template.sections);
  const [failedCheckModalData, setFailedCheckModalData] = useState(null); // When a check fails
  const [technicianNotes, setTechnicianNotes] = useState("");
  const [supervisorName, setSupervisorName] = useState("Thomas Sterling (Shift Operations)");

  // Handle PASS / FAIL / N/A state toggle
  const handleItemStatusChange = (sectionId, itemId, newStatus) => {
    let triggeredFailure = null;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map((item) => {
              if (item.id === itemId) {
                const updated = { ...item, status: newStatus };
                if (newStatus === "FAIL") {
                  triggeredFailure = {
                    assetId: template.assetId,
                    assetName: template.assetName,
                    checklistName: template.name,
                    checkItemLabel: item.label,
                    actualValue: item.actualValue,
                    unit: item.unit,
                    limitText: item.limitText || item.limit || "< Tolerable Spec",
                    severity: item.criticality || "Critical"
                  };
                }
                return updated;
              }
              return item;
            })
          };
        }
        return sec;
      })
    );

    if (newStatus === "FAIL" && triggeredFailure) {
      setFailedCheckModalData(triggeredFailure);
    }
  };

  // Handle Numeric value change
  const handleItemValueChange = (sectionId, itemId, val) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map((item) => {
              if (item.id === itemId) {
                const numVal = parseFloat(val) || val;
                let status = item.status;
                // Auto evaluate if min/max limits exist
                if (item.maxLimit !== undefined && typeof numVal === "number") {
                  status = numVal > item.maxLimit ? "FAIL" : "PASS";
                }
                return { ...item, actualValue: numVal, status };
              }
              return item;
            })
          };
        }
        return sec;
      })
    );
  };

  // Failed check action: Auto-create corrective work order
  const handleCreateCorrectiveWO = () => {
    if (!failedCheckModalData) return;
    const wo = handleFailedPMCheck(failedCheckModalData);
    addToast(`Corrective Work Order ${wo.id} auto-created with priority P1!`);
    setFailedCheckModalData(null);
    navigate(`/maintenance/work-orders/${wo.id}`);
  };

  // Failed check action: Mark asset out of service
  const handleMarkOutOfService = () => {
    if (!failedCheckModalData) return;
    updateAssetStatus(failedCheckModalData.assetId, "Out of Service", -30);
    addToast(`Asset ${failedCheckModalData.assetId} tagged OUT OF SERVICE!`, "warning");
    setFailedCheckModalData(null);
  };

  const handleSaveDraft = () => {
    addToast("Checklist progress saved as Local Draft.");
  };

  const handleSubmitChecklist = () => {
    const hasFailures = sections.some((s) => s.items.some((i) => i.status === "FAIL"));
    if (hasFailures) {
      addToast("PM Checklist submitted with Non-Conformances. Corrective Work Orders generated.", "warning");
    } else {
      addToast("PM Checklist successfully submitted & 100% Passed!");
    }
    navigate("/maintenance/pm-checklists");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/maintenance/pm-checklists")}
          className="btn btn-ghost"
          style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={14} /> Back to PM Checklists
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
                {template.name}
              </h1>
              <Badge variant="cyan">{template.version}</Badge>
              <Badge variant="emerald">{template.frequency}</Badge>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Target Asset: <strong style={{ color: "#38BDF8" }}>{template.assetId} - {template.assetName}</strong> • Est. Duration: {template.estimatedMinutes} mins
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="secondary" icon={Save} onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="primary" icon={FileCheck} onClick={handleSubmitChecklist}>
              Submit Checklist
            </Button>
          </div>
        </div>
      </div>

      {/* Sections and Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sections.map((section) => (
          <Card key={section.id} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {section.title}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {section.items.map((item) => {
                const isPass = item.status === "PASS";
                const isFail = item.status === "FAIL";
                const isNA = item.status === "N/A";

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      backgroundColor: isFail ? "rgba(239, 68, 68, 0.08)" : "var(--bg-card-subtle)",
                      border: `1px solid ${isFail ? "rgba(239, 68, 68, 0.4)" : "var(--border-subtle)"}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    {/* Item Header & Instruction */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {item.label}
                          </span>
                          {item.required && <Badge variant="rose">Required</Badge>}
                          {item.limitText && <Badge variant="slate">{item.limitText}</Badge>}
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.5 }}>
                          {item.instruction}
                        </p>
                      </div>

                      {/* PASS / FAIL / N/A Button Group */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(section.id, item.id, "PASS")}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            backgroundColor: isPass ? "rgba(16, 185, 129, 0.25)" : "var(--bg-card)",
                            color: isPass ? "#34D399" : "var(--text-muted)",
                            border: isPass ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          PASS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(section.id, item.id, "FAIL")}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            backgroundColor: isFail ? "rgba(239, 68, 68, 0.25)" : "var(--bg-card)",
                            color: isFail ? "#F87171" : "var(--text-muted)",
                            border: isFail ? "1px solid #EF4444" : "1px solid var(--border-subtle)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          FAIL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(section.id, item.id, "N/A")}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor: isNA ? "rgba(100, 116, 139, 0.25)" : "var(--bg-card)",
                            color: isNA ? "#CBD5E1" : "var(--text-muted)",
                            border: isNA ? "1px solid #64748B" : "1px solid var(--border-subtle)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          N/A
                        </button>
                      </div>
                    </div>

                    {/* Numeric Measurement Input (If applicable) */}
                    {item.type === "NUMERIC_LIMIT" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-main)" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                          Actual Measurement:
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="number"
                            step="0.1"
                            className="form-input"
                            style={{ width: "100px", height: "32px", fontFamily: "var(--font-mono)", fontWeight: 700 }}
                            value={item.actualValue}
                            onChange={(e) => handleItemValueChange(section.id, item.id, e.target.value)}
                          />
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {item.unit}
                          </span>
                        </div>
                        {item.maxLimit && (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Acceptable Range: {item.minLimit || 0} - {item.maxLimit} {item.unit}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Failure Warning Card */}
                    {isFail && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#FCA5A5", fontSize: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <AlertOctagon size={16} color="#EF4444" />
                          <span>Check Failed! Value {item.actualValue} {item.unit} violates limit {item.limitText}.</span>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setFailedCheckModalData({
                              assetId: template.assetId,
                              assetName: template.assetName,
                              checklistName: template.name,
                              checkItemLabel: item.label,
                              actualValue: item.actualValue,
                              unit: item.unit,
                              limitText: item.limitText,
                              severity: item.criticality || "Critical"
                            })
                          }
                        >
                          Resolve Non-Conformance
                        </Button>
                      </div>
                    )}

                    {/* Comment Field */}
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add inspection comment, bearing noise observation, or instrument serial..."
                        style={{ height: "34px", fontSize: "12px" }}
                        defaultValue={item.comment || ""}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Supervisor Sign-Off Card */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Supervisor PM Sign-Off & Change Log
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Reviewing Supervisor</label>
            <input
              type="text"
              className="form-input"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technician Closing Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. All checks passed. Rotary filler returned to Line 1 production."
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* FAILED PM CHECK WORKFLOW CONFIRMATION MODAL (Requirements #18 & #19) */}
      <Modal
        isOpen={!!failedCheckModalData}
        onClose={() => setFailedCheckModalData(null)}
        title="⚠️ NON-CONFORMANCE: PM CHECK FAILED"
        subtitle="Automated Failure Resolution Workflow"
        maxWidth="580px"
      >
        {failedCheckModalData && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                Asset: {failedCheckModalData.assetId} ({failedCheckModalData.assetName})
              </div>
              <div style={{ fontSize: "13px", color: "#FCA5A5", marginTop: "4px" }}>
                Failed Item: <strong>{failedCheckModalData.checkItemLabel}</strong>
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                <span>Actual Value: <strong style={{ color: "#EF4444" }}>{failedCheckModalData.actualValue} {failedCheckModalData.unit}</strong></span>
                <span>Tolerance Limit: <strong style={{ color: "#34D399" }}>{failedCheckModalData.limitText}</strong></span>
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              A critical PM parameter has failed specification. Select an immediate corrective action to dispatch maintenance technicians or isolate the machinery:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Button
                variant="primary"
                icon={Wrench}
                style={{ justifyContent: "flex-start", padding: "12px 16px" }}
                onClick={handleCreateCorrectiveWO}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700 }}>1. Create Corrective Work Order (P1 Critical)</div>
                  <div style={{ fontSize: "11px", opacity: 0.8 }}>Auto-generate dispatch ticket & notify senior reliability technician</div>
                </div>
              </Button>

              <Button
                variant="danger"
                icon={AlertOctagon}
                style={{ justifyContent: "flex-start", padding: "12px 16px" }}
                onClick={handleMarkOutOfService}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700 }}>2. Tag Asset OUT OF SERVICE</div>
                  <div style={{ fontSize: "11px", opacity: 0.8 }}>Halt production line & apply safety lockout protocol</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                style={{ justifyContent: "flex-start", padding: "12px 16px" }}
                onClick={() => {
                  setFailedCheckModalData(null);
                  navigate("/maintenance/troubleshooting");
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700 }}>3. Launch Guided Troubleshooting Wizard</div>
                  <div style={{ fontSize: "11px", opacity: 0.8 }}>Execute 7-step diagnostic checks to isolate root cause</div>
                </div>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

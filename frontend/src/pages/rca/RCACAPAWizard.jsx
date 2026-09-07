import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Save,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
  Plus
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Stepper } from "../../components/common/Stepper";
import { useApp } from "../../context/AppContext";

export function RCACAPAWizard() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [currentStep, setCurrentStep] = useState(0);

  // RCA form state
  const [eventName, setEventName] = useState("Pasteurizer HTST-300 Loop Gasket Rupture & Thermal Excursion");
  const [assetId, setAssetId] = useState("HT-105");
  const [occurrenceCause, setOccurrenceCause] = useState("Standard EPDM gasket material degraded due to high-temperature nitric acid CIP rinse cycles exceeding 75°C.");
  const [escapeCause, setEscapeCause] = useState("In-line diversion valve latency of 420ms allowed 18 Liters of sub-pasteurized product into the buffer manifold before auto-diversion engaged.");
  const [why1, setWhy1] = useState("Why did product temperature drop? → Gasket ruptured causing loop steam pressure drop.");
  const [why2, setWhy2] = useState("Why did the gasket rupture? → Elastomer lost tensile elasticity and cracked under 8 bar.");
  const [why3, setWhy3] = useState("Why did the elastomer crack? → Exposed to 85°C caustic CIP solution for 30 cycles.");
  const [why4, setWhy4] = useState("Why was standard EPDM used? → BOM specification had not been upgraded to high-temp Viton.");
  const [why5, setWhy5] = useState("Why was BOM not upgraded? → PM revision change management loop was not triggered after last recipe temperature increase.");
  const [capaAction, setCapaAction] = useState("1. Convert all Section 3 gaskets to fluoroelastomer Viton.\n2. Install automated ramped temperature cooldown valve curve.\n3. Recalibrate diversion valve solenoid response to < 100ms.");
  const [owner, setOwner] = useState("Sarah Jenkins (Lead Quality & Reliability)");
  const [verificationDate, setVerificationDate] = useState("2026-09-30");

  const steps = [
    { title: "1. Incident Event", subtitle: "Problem statement" },
    { title: "2. Evidence & 5-Why", subtitle: "Root cause tree" },
    { title: "3. Occurrence & Escape", subtitle: "Causal mechanisms" },
    { title: "4. Corrective Actions", subtitle: "CAPA execution" },
    { title: "5. Verification", subtitle: "Effectiveness audit" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinishRCA = () => {
    addToast("Root Cause Analysis (RCA-2026-019) published with approved CAPA actions!");
    navigate("/maintenance/repeat-failures");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/maintenance")}
          className="btn btn-ghost"
          style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={14} /> Back to Maintenance
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Root Cause Analysis (RCA) & CAPA Portal
          </h1>
          <Badge variant="rose">Investigation Active</Badge>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          5-Why analysis, Fishbone methodology, Occurrence vs Escape causal determination, and CAPA effectiveness verification.
        </p>
      </div>

      {/* Stepper Header */}
      <Card style={{ padding: "16px 20px" }}>
        <Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
      </Card>

      {/* Step Content */}
      <Card style={{ padding: "24px" }}>
        {currentStep === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 1: Incident Event & Problem Statement
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Clearly articulate what failed, when the anomaly occurred, and the initial containment action taken.
            </p>

            <div className="form-group">
              <label className="form-label">Incident Title & Equipment *</label>
              <input
                type="text"
                className="form-input"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Asset Tag</label>
              <input
                type="text"
                className="form-input"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 2: 5-Why Problem Breakdown
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Drill down through consecutive causal inquiries to uncover the systemic root defect.
            </p>

            <div className="form-group">
              <label className="form-label">Why 1 (Immediate Symptom):</label>
              <input type="text" className="form-input" value={why1} onChange={(e) => setWhy1(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Why 2 (Physical Mechanism):</label>
              <input type="text" className="form-input" value={why2} onChange={(e) => setWhy2(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Why 3 (Process Condition):</label>
              <input type="text" className="form-input" value={why3} onChange={(e) => setWhy3(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Why 4 (Specification / Material):</label>
              <input type="text" className="form-input" value={why4} onChange={(e) => setWhy4(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Why 5 (Systemic / Management Root Cause):</label>
              <input type="text" className="form-input" value={why5} onChange={(e) => setWhy5(e.target.value)} />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 3: Occurrence Cause vs. Escape Cause
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Distinguish why the failure physically happened versus why the quality barrier failed to prevent the escape.
            </p>

            <div className="form-group">
              <label className="form-label" style={{ color: "#EF4444" }}>1. Occurrence Cause (Why did the defect occur?)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={occurrenceCause}
                onChange={(e) => setOccurrenceCause(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#F59E0B" }}>2. Escape Cause (Why did inspection/monitoring fail to contain it?)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={escapeCause}
                onChange={(e) => setEscapeCause(e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 4: Corrective & Preventive Actions (CAPA)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Define permanent countermeasures to address both occurrence and escape mechanisms.
            </p>

            <div className="form-group">
              <label className="form-label">Approved CAPA Action Plan</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={capaAction}
                onChange={(e) => setCapaAction(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">CAPA Owner</label>
                <input type="text" className="form-input" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Completion Date</label>
                <input type="date" className="form-input" value={verificationDate} onChange={(e) => setVerificationDate(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 5: Effectiveness Verification Protocol
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Audit 30-day post-implementation performance to ensure zero recurrence of the failure mode.
            </p>

            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "12px" }}>
              <CheckCircle2 size={24} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>RCA & CAPA Ready for Sign-Off</h4>
                <p style={{ fontSize: "12px", color: "#6EE7B7", marginTop: "2px" }}>
                  Assigned to {owner} • Scheduled for 30-day effectiveness audit on {verificationDate}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <Button
            variant="secondary"
            icon={ArrowLeft}
            disabled={currentStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          <div style={{ display: "flex", gap: "10px" }}>
            {currentStep < steps.length - 1 ? (
              <Button variant="primary" iconRight={ArrowRight} onClick={handleNext}>
                Next Step
              </Button>
            ) : (
              <Button variant="success" icon={CheckCircle2} onClick={handleFinishRCA}>
                Publish & Approve CAPA
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

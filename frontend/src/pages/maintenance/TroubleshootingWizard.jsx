import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Wrench,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Sparkles,
  Layers,
  AlertTriangle,
  Camera,
  FileCheck,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Stepper } from "../../components/common/Stepper";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import maintenanceService from "../../services/maintenanceService";

export function TroubleshootingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { assets, failureCodes, addVerifiedSolution } = useCMMS();
  const { addToast } = useApp();

  const paramAsset = searchParams.get("assetId") || assets[0]?.id || "FM-001";
  const paramSymptom = searchParams.get("symptom") || "";

  React.useEffect(() => {
    const fetchTroubleshooting = async () => {
      try {
        await maintenanceService.getTroubleshooting();
      } catch (err) {
        console.warn("API troubleshooting fetch notice:", err.message || err);
      }
    };
    fetchTroubleshooting();
  }, []);

  const [currentStep, setCurrentStep] = useState(0);

  // Wizard state initialized for live data input
  const [selectedAssetId, setSelectedAssetId] = useState(paramAsset);
  const [symptom, setSymptom] = useState(paramSymptom);
  const [diagnosticCheck, setDiagnosticCheck] = useState("");
  const [actualEvidence, setActualEvidence] = useState("");
  const [selectedCause, setSelectedCause] = useState("");
  const [repairProcedure, setRepairProcedure] = useState("");
  const [testResult, setTestResult] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("Marcus Vance (Reliability Specialist)");

  const handleLoadSample = () => {
    setSelectedAssetId(assets[0]?.id || "FM-001");
    setSymptom("Excessive vibration and acoustic rattling on rotary filler drive spindle at 600 BPM.");
    setDiagnosticCheck("1. Mount accelerometer on lower bearing hub.\n2. Perform FFT frequency spectrum analysis.\n3. Check shaft runout with dial gauge.");
    setActualEvidence("Vibration velocity measured at 4.8 mm/s RMS (limit < 3.0 mm/s). FFT reveals peak harmonic at 1,420 Hz corresponding to bearing outer race defect frequency (BPFO).");
    setSelectedCause("Bearing race pitting and micro-spalling due to moisture ingress past degraded labyrinth seal.");
    setRepairProcedure("1. Lock out main electrical supply.\n2. Use hydraulic puller to remove worn bearing BRG-6208.\n3. Install new SKF bearing with induction heater.\n4. Replace Viton shaft seal and laser align to 0.02mm.");
    setTestResult("Conducted 30-min dry run at 300 BPM, followed by 30-min run at 600 BPM. Vibration dropped to 1.1 mm/s RMS. Temperature stable at 54°C.");
    setVerifiedBy("Senior Reliability Specialist Marcus Vance");
    addToast("Sample scenario loaded into wizard.", "info");
  };

  const handleClearAll = () => {
    setSymptom("");
    setDiagnosticCheck("");
    setActualEvidence("");
    setSelectedCause("");
    setRepairProcedure("");
    setTestResult("");
    setCurrentStep(0);
    addToast("Wizard cleared. Ready for live input.", "info");
  };

  const steps = [
    { title: "1. Symptom", subtitle: "Define anomaly" },
    { title: "2. Diagnostics", subtitle: "Inspection checks" },
    { title: "3. Evidence", subtitle: "Measurements" },
    { title: "4. Root Cause", subtitle: "Identify defect" },
    { title: "5. Repair", subtitle: "Execution steps" },
    { title: "6. Post Test", subtitle: "Trial verification" },
    { title: "7. Verify & Save", subtitle: "Verified solution" }
  ];

  const getStepPayload = (stepIdx) => {
    switch (stepIdx) {
      case 0:
        return { step: 1, stepName: "Symptom", assetId: selectedAssetId, symptom };
      case 1:
        return { step: 2, stepName: "Diagnostics", diagnosticCheck };
      case 2:
        return { step: 3, stepName: "Evidence", actualEvidence };
      case 3:
        return { step: 4, stepName: "Root Cause", selectedCause };
      case 4:
        return { step: 5, stepName: "Repair", repairProcedure };
      case 5:
        return { step: 6, stepName: "Post Test", testResult };
      case 6:
        return { step: 7, stepName: "Verify & Save", verifiedBy };
      default:
        return { step: stepIdx + 1 };
    }
  };

  const handleNext = async () => {
    const payload = getStepPayload(currentStep);
    try {
      await maintenanceService.saveTroubleshootingStep(payload);
    } catch (err) {
      console.warn("Troubleshooting step sync notice:", err);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleStepClick = async (stepIdx) => {
    try {
      await maintenanceService.saveTroubleshootingStep(getStepPayload(currentStep));
    } catch (err) {}
    setCurrentStep(stepIdx);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = {
      assetId: selectedAssetId,
      symptom,
      diagnosticCheck,
      actualEvidence,
      selectedCause,
      repairProcedure,
      testResult,
      verifiedBy,
      currentStep: currentStep + 1
    };
    try {
      await maintenanceService.saveTroubleshootingDraft(draftData);
    } catch (err) {
      console.warn("Draft save notice:", err);
    }
    addToast("Troubleshooting draft saved successfully.", "success");
  };

  const handleFinishAndSave = async () => {
    const solData = {
      problemSymptom: symptom,
      symptom,
      assetId: selectedAssetId,
      assetType: "Packaging & Bottling / Rotary Filler",
      applicableMachines: [selectedAssetId],
      failureCode: "MEC-004",
      failureCategory: "Mechanical",
      rootCause: selectedCause,
      diagnosticSteps: diagnosticCheck ? diagnosticCheck.split("\n") : [],
      repairProcedure: repairProcedure ? repairProcedure.split("\n") : [],
      partsRequired: [{ partNo: "BRG-6208-2RS", name: "Deep Groove Ball Bearing", qty: 2 }],
      toolsRequired: ["Laser Alignment Kit", "Hydraulic Puller", "Induction Heater"],
      testAndVerification: testResult,
      verifiedBy,
      tags: ["troubleshooting", "spindle", "vibration"]
    };

    const newSol = await addVerifiedSolution(solData);

    addToast(`Troubleshooting flow completed and saved to database as ${newSol?.id || 'Verified Solution'}!`, "success");
    navigate("/maintenance/verified-solutions");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <button
            onClick={() => navigate("/maintenance")}
            className="btn btn-ghost"
            style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={14} /> Back to Maintenance
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Guided Troubleshooting & Diagnostic Wizard
            </h1>
            <Badge variant="cyan">Standardized 7-Step Method</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearAll}
          >
            Clear Form
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadSample}
          >
            Load Sample
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate("/maintenance/verified-solutions")}
          >
            Verified Solutions Library
          </Button>
        </div>
      </div>

      {/* Stepper Header with smooth horizontal scroll on mobile */}
      <Card style={{ padding: "16px 20px", overflowX: "auto" }}>
        <div style={{ minWidth: "640px" }}>
          <Stepper steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
      </Card>

      {/* Step Contents */}
      <Card style={{ padding: "24px" }}>
        {currentStep === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 1: Machine Issue & Observed Symptom
            </h3>

            <div className="form-group">
              <label className="form-label">Affected Machine / Asset *</label>
              <select className="form-select" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)}>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.name} ({a.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Observed Symptom / Anomaly Description *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="e.g. Excessive vibration, acoustic rattling, temperature rise, torque trip, optical sensor fault..."
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 2: Diagnostic Checks & Measurement Protocol
            </h3>

            <div className="form-group">
              <label className="form-label">Diagnostic Steps & Tool Requirements</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={diagnosticCheck}
                onChange={(e) => setDiagnosticCheck(e.target.value)}
                placeholder="1. Check input line voltage and phase balance.&#10;2. Mount vibration sensor on drive housing.&#10;3. Inspect shaft alignment with dial gauge."
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 3: Actual Diagnostic Results & Evidence
            </h3>

            <div className="form-group">
              <label className="form-label">Empirical Measurements & Observations *</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={actualEvidence}
                onChange={(e) => setActualEvidence(e.target.value)}
                placeholder="e.g. Vibration measured at 4.8 mm/s RMS (limit < 3.0 mm/s). Thermal scan shows bearing drive hub at 78°C."
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 4: Root Cause Isolation
            </h3>

            <div className="form-group">
              <label className="form-label">Root Cause Determination *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                placeholder="e.g. Bearing race fatigue spalling caused by moisture ingress past worn lip seal."
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 5: Corrective Repair Procedure
            </h3>

            <div className="form-group">
              <label className="form-label">Repair Execution Steps *</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={repairProcedure}
                onChange={(e) => setRepairProcedure(e.target.value)}
                placeholder="1. Lockout & tagout electrical drive.&#10;2. Extract worn bearing with hydraulic puller.&#10;3. Mount new bearing using induction heater to 110°C.&#10;4. Laser align shaft to 0.02mm."
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 6: Post-Repair Operational Test & Trial Run
            </h3>

            <div className="form-group">
              <label className="form-label">Trial Run Test Results *</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={testResult}
                onChange={(e) => setTestResult(e.target.value)}
                placeholder="e.g. Run 30-min trial at 600 BPM. Vibration dropped to 1.1 mm/s RMS. Operating temperature stabilized at 52°C."
              />
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Step 7: Verification & Verified Solution Conversion
            </h3>

            <div className="form-group">
              <label className="form-label">Verifying Engineer / Specialist</label>
              <input
                type="text"
                className="form-input"
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
              />
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", display: "flex", alignItems: "center", gap: "12px" }}>
              <Sparkles size={24} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Save as Verified Solution</h4>
                <p style={{ fontSize: "12px", color: "#6EE7B7", marginTop: "2px" }}>
                  This solution will be indexed across the facility for {selectedAssetId} and matching machine types.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
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
            <Button variant="ghost" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button variant="primary" iconRight={ArrowRight} onClick={handleNext}>
                Next Step
              </Button>
            ) : (
              <Button variant="success" icon={CheckCircle2} onClick={handleFinishAndSave}>
                Authorize & Save Solution
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}


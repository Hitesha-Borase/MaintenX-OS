import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Search,
  Plus,
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Wrench,
  X,
  HelpCircle,
  Sparkles,
  Layers,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function TroubleshootingPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const navigate = useNavigate();

  const { solutions = [], addVerifiedSolution, rateSolution, failureCodes = [], assets = [] } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [activeMode, setActiveMode] = useState("wizard"); // wizard, solutions

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState("FM-001");
  const [selectedSymptom, setSelectedSymptom] = useState("Vibration / Noise");
  const [wizardDiagnosis, setWizardDiagnosis] = useState(null);

  // Add Solution Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    symptom: "",
    failureCode: "MEC-004",
    assetType: "Packaging & Bottling",
    rootCause: "",
    solutionSteps: "",
    partsRequired: "Bearing 6208-2RS",
    estimatedFixMinutes: 45
  });

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
      setActiveMode("solutions");
    }
  }, [searchParam]);

  const filteredSolutions = solutions.filter((s) => {
    return (
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symptom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.failureCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rootCause?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartDiagnosis = () => {
    if (selectedSymptom === "Vibration / Noise") {
      setWizardDiagnosis({
        title: "Lower Main Spindle Bearing Race Micro-Pitting",
        failureCode: "MEC-004",
        recommendedAction: "1. Lockout machine under LOTO Level 4.\n2. Remove bottom bearing cartridge.\n3. Inspect race for indentation.\n4. Replace with SKF 6208-2RS and install fresh Viton seal.\n5. Laser-align drive coupling.",
        partsNeeded: ["BRG-6208-2RS", "SL-VTON-45"],
        confidenceScore: "96% AI Match based on 14 similar past work orders"
      });
    } else if (selectedSymptom === "Pressure Drop / Leak") {
      setWizardDiagnosis({
        title: "Elastomer Gasket Degradation under Thermal CIP",
        failureCode: "HYD-002",
        recommendedAction: "1. Depressurize loop and allow to cool below 40°C.\n2. Loosen tie bolts on plate pack Section 3.\n3. Replace perished gaskets with high-temp EPDM/Viton set.\n4. Hydro-test at 10.0 bar for 15 mins.",
        partsNeeded: ["GSK-EPDM-HT105"],
        confidenceScore: "98% AI Match based on Pasteurizer historical failure logs"
      });
    } else {
      setWizardDiagnosis({
        title: "Optical Amplifier Glare / Dust Attenuation",
        failureCode: "ELE-008",
        recommendedAction: "1. Clean optical fiber lenses with isopropyl wipes.\n2. Check alignment angle.\n3. Re-teach background suppression baseline on Keyence FS-N41N.",
        partsNeeded: ["SEN-KEY-FSN"],
        confidenceScore: "92% Diagnostic Confidence"
      });
    }
    setWizardStep(2);
    addToast("Diagnostic engine generated root-cause verdict.", "success");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.solutionSteps) {
      addToast("Please provide solution title and repair steps.", "warning");
      return;
    }

    addVerifiedSolution({
      ...formData,
      toolsRequired: ["Standard Toolset", "Digital Multimeter"]
    });

    addToast("Verified Solution added to knowledge base!", "success");
    setIsAddModalOpen(false);
    setFormData({
      title: "",
      symptom: "",
      failureCode: "MEC-004",
      assetType: "Packaging & Bottling",
      rootCause: "",
      solutionSteps: "",
      partsRequired: "Bearing 6208-2RS",
      estimatedFixMinutes: 45
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Troubleshooting Wizard & Verified Solutions
            </h1>
            <Badge variant="cyan">AI-ASSISTED DIAGNOSTICS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant={activeMode === "wizard" ? "primary" : "secondary"}
            icon={Sparkles}
            onClick={() => {
              setActiveMode("wizard");
              setWizardStep(1);
            }}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Diagnostic Wizard
          </Button>
          <Button
            variant={activeMode === "solutions" ? "primary" : "secondary"}
            icon={CheckCircle2}
            onClick={() => setActiveMode("solutions")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Knowledge Base ({solutions.length})
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Share Solution
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 3 on desktop */}
      <div
        className="kpi-grid-responsive grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Verified Solutions"
          value={solutions.length.toString()}
          unit="Solutions"
          trend={{ value: "Peer-reviewed & QA verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => setActiveMode("solutions")}
        />
        <StatCard
          title="Diagnostic Accuracy"
          value="94.8%"
          unit=""
          trend={{ value: "Based on 340+ triage cases", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="cyan"
        />
        <StatCard
          title="MTTR Reduction"
          value="-35 mins"
          unit="Avg saving"
          trend={{ value: "Faster root cause discovery", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="emerald"
        />
      </div>

      {/* MODE 1: INTERACTIVE GUIDED WIZARD */}
      {activeMode === "wizard" && (
        <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="#B27E33" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step-by-Step Diagnostic Decision Tree
              </h3>
            </div>
            <Badge variant="cyan">Step {wizardStep} of 2</Badge>
          </div>

          {wizardStep === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                    1. Select Target Machine Under Triage
                  </label>
                  <select
                    className="form-select"
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name} ({a.line})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                    2. Observed Stoppage / Symptom Pattern
                  </label>
                  <select
                    className="form-select"
                    value={selectedSymptom}
                    onChange={(e) => setSelectedSymptom(e.target.value)}
                    style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                  >
                    <option value="Vibration / Noise">Acoustic rattling, grinding, or excessive vibration spike</option>
                    <option value="Pressure Drop / Leak">Sudden hydraulic / pneumatic pressure drop or liquid leakage</option>
                    <option value="Optical Drift / Reject">Vision reject loop, photo-eye blinding, or optical drift</option>
                    <option value="Overheating">Motor / bearing thermal alarm tripped (&gt; 75°C)</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 800, fontSize: "12px", color: "#8C5B23", marginBottom: "6px" }}>
                  Active Symptom Verification Questions:
                </div>
                <ul style={{ fontSize: "12px", color: "var(--text-secondary)", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px", lineHeight: 1.4 }}>
                  <li>Did the failure occur abruptly during high-speed production or during cold start?</li>
                  <li>Are upstream feed pressures and lubricant reservoirs within nominal operating thresholds?</li>
                  <li>Is there any thermal discoloration or micro-shavings visible in the drain catchment?</li>
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="primary" icon={ArrowRight} onClick={handleStartDiagnosis} style={{ padding: "8px 16px" }}>
                  Run Diagnostic Engine
                </Button>
              </div>
            </div>
          ) : (
            wizardDiagnosis && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "14px", backgroundColor: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.25)", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", textTransform: "uppercase", fontWeight: 800 }}>
                        Diagnosis Verdict
                      </div>
                      <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                        {wizardDiagnosis.title}
                      </h2>
                    </div>
                    <Badge variant="cyan">{wizardDiagnosis.failureCode}</Badge>
                  </div>

                  <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginTop: "6px" }}>
                    ✓ {wizardDiagnosis.confidenceScore}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Step-by-Step Verified Repair Action:
                  </h4>
                  <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "12px 14px", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-line", border: "1px solid var(--border-subtle)" }}>
                    {wizardDiagnosis.recommendedAction}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Required Replacement Parts:
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {wizardDiagnosis.partsNeeded.map((p, i) => (
                      <Badge key={i} variant="amber" style={{ fontSize: "11px", padding: "4px 8px" }}>
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <Button variant="secondary" icon={RotateCcw} onClick={() => setWizardStep(1)}>
                    Restart Diagnosis
                  </Button>
                  <Button variant="primary" icon={Wrench} onClick={() => setIsQuickActionOpen(true)}>
                    Convert to Work Order
                  </Button>
                </div>
              </div>
            )
          )}
        </Card>
      )}

      {/* MODE 2: VERIFIED SOLUTIONS KNOWLEDGE BASE */}
      {activeMode === "solutions" && (
        <Card style={{ padding: "16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between", width: "100%" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search solutions by symptom, code (e.g. MEC-004), root cause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "36px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "10px" }}
              />
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={13} /> Clear Search
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredSolutions.length > 0 ? (
              filteredSolutions.map((sol) => (
                <div
                  key={sol.id}
                  style={{
                    backgroundColor: "var(--bg-card-subtle)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#0284C7", fontWeight: 800 }}>
                          {sol.id}
                        </span>
                        <Badge variant="cyan">{sol.failureCode || "General"}</Badge>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Verified: {sol.verificationDate || "Aug 2026"}</span>
                      </div>
                      <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                        {sol.title}
                      </h3>
                    </div>

                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ThumbsUp}
                        onClick={() => {
                          if (rateSolution) rateSolution(sol.id);
                          addToast("Helpful vote registered!", "success");
                        }}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                      >
                        Helpful ({sol.successfulUsesCount || 1})
                      </Button>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    <strong>Symptom:</strong> <span style={{ color: "var(--text-primary)" }}>{sol.symptom}</span>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    <strong>Root Cause:</strong> <span style={{ color: "#D97706", fontWeight: 600 }}>{sol.rootCause}</span>
                  </div>

                  <div style={{ backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.5, border: "1px solid var(--border-subtle)" }}>
                    <strong style={{ color: "#8C5B23" }}>Verified Repair Procedure:</strong>
                    <p style={{ marginTop: "4px" }}>{sol.solutionSteps || sol.action}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No solutions found matching "{searchQuery}".
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ADD SOLUTION MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LifeBuoy size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Share Verified Troubleshooting Solution
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Solution Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rotary Filler Vacuum Gripper Sticking Fix"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Failure Code</label>
                  <select
                    className="form-select"
                    value={formData.failureCode}
                    onChange={(e) => setFormData({ ...formData, failureCode: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {failureCodes.map((fc) => (
                      <option key={fc.code} value={fc.code}>
                        {fc.code} ({fc.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Asset Category</label>
                  <select
                    className="form-select"
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging & Bottling">Packaging & Bottling</option>
                    <option value="Thermal Processing">Thermal Processing</option>
                    <option value="Conveying">Conveying</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Observed Symptom</label>
                <input
                  type="text"
                  placeholder="e.g. 180ms delay during gripper retraction cycle"
                  value={formData.symptom}
                  onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Confirmed Root Cause</label>
                <input
                  type="text"
                  placeholder="e.g. Dust clogging exhaust silencer causing backpressure"
                  value={formData.rootCause}
                  onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Detailed Step-by-Step Fix *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="List exact steps, tools used, and torque/calibration settings..."
                  value={formData.solutionSteps}
                  onChange={(e) => setFormData({ ...formData, solutionSteps: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Publish Verified Solution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

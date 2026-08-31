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
  Layers
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

  const { solutions, addVerifiedSolution, rateSolution, failureCodes, assets } = useCMMS();
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
        recommendedAction: "1. Lockout machine under LOTO Level 4. 2. Remove bottom bearing cartridge. 3. Inspect race for indentation. 4. Replace with SKF 6208-2RS and install fresh Viton seal. 5. Laser-align drive coupling.",
        partsNeeded: ["BRG-6208-2RS", "SL-VTON-45"],
        confidenceScore: "96% AI Match based on 14 similar past work orders"
      });
    } else if (selectedSymptom === "Pressure Drop / Leak") {
      setWizardDiagnosis({
        title: "Elastomer Gasket Degradation under Thermal CIP",
        failureCode: "HYD-002",
        recommendedAction: "1. Depressurize loop and allow to cool below 40°C. 2. Loosen tie bolts on plate pack Section 3. 3. Replace perished gaskets with high-temp EPDM/Viton set. 4. Hydro-test at 10.0 bar for 15 mins.",
        partsNeeded: ["GSK-EPDM-HT105"],
        confidenceScore: "98% AI Match based on Pasteurizer historical failure logs"
      });
    } else {
      setWizardDiagnosis({
        title: "Optical Amplifier Glare / Dust Attenuation",
        failureCode: "ELE-008",
        recommendedAction: "1. Clean optical fiber lenses with isopropyl wipes. 2. Check alignment angle. 3. Re-teach background suppression baseline on Keyence FS-N41N.",
        partsNeeded: ["SEN-KEY-FSN"],
        confidenceScore: "92% Diagnostic Confidence"
      });
    }
    setWizardStep(2);
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
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Troubleshooting Wizard & Verified Solutions
            </h1>
            <Badge variant="cyan">AI-Assisted Diagnostics</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Guided diagnostic decision tree, symptom-to-cause matching, and verified crowdsourced technician solutions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant={activeMode === "wizard" ? "primary" : "secondary"}
            icon={Sparkles}
            onClick={() => {
              setActiveMode("wizard");
              setWizardStep(1);
            }}
          >
            Diagnostic Wizard
          </Button>
          <Button
            variant={activeMode === "solutions" ? "primary" : "secondary"}
            icon={CheckCircle2}
            onClick={() => setActiveMode("solutions")}
          >
            Knowledge Base ({solutions.length})
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Share Solution
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Verified Solutions"
          value={solutions.length.toString()}
          unit="Solutions"
          trend={{ value: "Peer-reviewed & QA verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
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
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="#38BDF8" />
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step-by-Step Diagnostic Decision Tree
              </h3>
            </div>
            <Badge variant="cyan">Step {wizardStep} of 2</Badge>
          </div>

          {wizardStep === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div>
                  <label className="form-label">1. Select Target Machine Under Triage</label>
                  <select
                    className="form-select"
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name} ({a.line})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">2. Observed Stoppage / Symptom Pattern</label>
                  <select
                    className="form-select"
                    value={selectedSymptom}
                    onChange={(e) => setSelectedSymptom(e.target.value)}
                  >
                    <option value="Vibration / Noise">Acoustic rattling, grinding, or excessive vibration spike</option>
                    <option value="Pressure Drop / Leak">Sudden hydraulic / pneumatic pressure drop or liquid leakage</option>
                    <option value="Optical Drift / Reject">Vision reject loop, photo-eye blinding, or optical drift</option>
                    <option value="Overheating">Motor / bearing thermal alarm tripped (&gt; 75°C)</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: "16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#38BDF8", marginBottom: "4px" }}>
                  Active Symptom Verification Questions:
                </div>
                <ul style={{ fontSize: "12px", color: "var(--text-secondary)", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li>Did the failure occur abruptly during high-speed production or during cold start?</li>
                  <li>Are upstream feed pressures and lubricant reservoirs within nominal operating thresholds?</li>
                  <li>Is there any thermal discoloration or micro-shavings visible in the drain catchment?</li>
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="primary" icon={ArrowRight} onClick={handleStartDiagnosis}>
                  Run Diagnostic Engine
                </Button>
              </div>
            </div>
          ) : (
            wizardDiagnosis && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "16px", backgroundColor: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#38BDF8", textTransform: "uppercase", fontWeight: 700 }}>
                        Diagnosis Verdict
                      </div>
                      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                        {wizardDiagnosis.title}
                      </h2>
                    </div>
                    <Badge variant="cyan">{wizardDiagnosis.failureCode}</Badge>
                  </div>

                  <div style={{ fontSize: "12px", color: "#34D399", fontWeight: 600, marginTop: "6px" }}>
                    ✓ {wizardDiagnosis.confidenceScore}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Step-by-Step Verified Repair Action:
                  </h4>
                  <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "8px", fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {wizardDiagnosis.recommendedAction}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Required Replacement Parts:
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {wizardDiagnosis.partsNeeded.map((p, i) => (
                      <Badge key={i} variant="amber" style={{ fontSize: "12px", padding: "4px 10px" }}>
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  <Button variant="secondary" onClick={() => setWizardStep(1)}>
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
        <Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
            <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search solutions by symptom, code (e.g. MEC-004), root cause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
              />
            </div>

            {searchQuery && (
              <Button variant="ghost" size="sm" icon={X} onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredSolutions.map((sol) => (
              <div
                key={sol.id}
                style={{
                  backgroundColor: "var(--bg-card-subtle)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#38BDF8", fontWeight: 700 }}>
                        {sol.id}
                      </span>
                      <Badge variant="cyan">{sol.failureCode || "General"}</Badge>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Verified: {sol.verificationDate}</span>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
                      {sol.title}
                    </h3>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ThumbsUp}
                      onClick={() => {
                        rateSolution(sol.id);
                        addToast("Helpful vote registered!", "success");
                      }}
                    >
                      Helpful ({sol.successfulUsesCount || 1})
                    </Button>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  <strong>Symptom:</strong> <span style={{ color: "var(--text-primary)" }}>{sol.symptom}</span>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  <strong>Root Cause:</strong> <span style={{ color: "#F59E0B" }}>{sol.rootCause}</span>
                </div>

                <div style={{ backgroundColor: "var(--bg-surface)", padding: "12px", borderRadius: "6px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <strong style={{ color: "#FFFFFF" }}>Verified Repair Procedure:</strong>
                  <p style={{ marginTop: "4px" }}>{sol.solutionSteps || sol.action}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ADD SOLUTION MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Share Verified Troubleshooting Solution
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Solution Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rotary Filler Vacuum Gripper Sticking Fix"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Failure Code</label>
                  <select
                    className="form-select"
                    value={formData.failureCode}
                    onChange={(e) => setFormData({ ...formData, failureCode: e.target.value })}
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
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

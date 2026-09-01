import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  Sparkles,
  CheckCircle2,
  Filter,
  Wrench,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function VerifiedSolutions() {
  const { solutions = [], addVerifiedSolution, assets = [] } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New solution state
  const [symptom, setSymptom] = useState("");
  const [assetType, setAssetType] = useState("Packaging & Bottling / Rotary Filler");
  const [rootCause, setRootCause] = useState("");
  const [repairNotes, setRepairNotes] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("Senior Reliability Engineer");

  const filteredSolutions = (solutions || []).filter((sol) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sol.problemSymptom && sol.problemSymptom.toLowerCase().includes(q)) ||
      (sol.rootCause && sol.rootCause.toLowerCase().includes(q)) ||
      (sol.failureCode && sol.failureCode.toLowerCase().includes(q)) ||
      (sol.tags && sol.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!symptom.trim() || !rootCause.trim()) return;
    const newSol = addVerifiedSolution({
      problemSymptom: symptom,
      assetType,
      applicableMachines: ["FM-001", "CP-102"],
      failureCode: "MEC-004",
      failureCategory: "Mechanical",
      rootCause,
      diagnosticSteps: ["1. Mount vibration sensor", "2. Check laser alignment offset"],
      repairProcedure: repairNotes.split("\n"),
      partsRequired: [],
      toolsRequired: ["Laser Aligner", "Torque Wrench"],
      testAndVerification: "30-min trial run at full BPM line speed.",
      verifiedBy,
      tags: ["verified", "preventive", "solution"]
    });

    addToast(`Verified Solution ${newSol?.id || 'VS-101'} published to Knowledge Library!`, "success");
    setIsAddModalOpen(false);
    setSymptom("");
    setRootCause("");
    setRepairNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Verified Solutions Library
            </h1>
            <Badge variant="emerald">ENGINEERING STANDARD</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Wrench} onClick={() => navigate("/troubleshooting")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Troubleshooting Wizard
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Verified Solution
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Verified Fixes"
          value={solutions.length.toString()}
          unit="Solutions"
          trend={{ value: "Peer-reviewed SOPs", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Repeat Prevention"
          value="100%"
          unit="Success"
          trend={{ value: "Zero recurrent outages", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg MTTR Reduction"
          value="45 min"
          unit="Saved"
          trend={{ value: "Fast triage playbook", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="amber"
        />
        <StatCard
          title="Knowledge Coverage"
          value="92.4%"
          unit="Covered"
          trend={{ value: "All failure modes mapped", isPositive: true, text: "" }}
          icon={BookOpen}
          colorVariant="emerald"
        />
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "16px 20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px", height: "42px", fontSize: "13px", backgroundColor: "#FFFFFF" }}
            placeholder="Search verified solutions by symptom (e.g. 'vibration', 'pressure drop', 'sensor glare')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Solutions Cards Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
        {filteredSolutions.map((sol) => (
          <Card
            key={sol.id}
            interactive
            onClick={() => setSelectedSolution(sol)}
            style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid #059669", padding: "18px", boxSizing: "border-box" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(5, 150, 105, 0.1)", color: "#059669" }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {sol.problemSymptom}
                    </h3>
                    <Badge variant="cyan">{sol.failureCode}</Badge>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {sol.id} • Applicable: {sol.applicableMachines?.join(", ") || "Rotary Equipment"}
                  </span>
                </div>
              </div>

              <Badge variant="emerald">
                {sol.successfulUsesCount || 12} Verified Fixes
              </Badge>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Root Cause:</strong> {sol.rootCause}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
              <div>
                Verified by: <strong style={{ color: "var(--text-primary)" }}>{sol.verifiedBy}</strong> on {sol.verificationDate || '2026-08-15'}
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {sol.tags?.map((t, i) => (
                  <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--bg-card-subtle)", color: "#8C5B23", border: "1px solid var(--border-subtle)", fontWeight: 600 }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Solution Detail Modal */}
      {selectedSolution && (
        <div className="modal-backdrop" onClick={() => setSelectedSolution(null)}>
          <div className="modal-content" style={{ maxWidth: "680px", margin: "16px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Verified Solution: {selectedSolution.id}
                </h2>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {selectedSolution.problemSymptom}
                </div>
              </div>
              <button onClick={() => setSelectedSolution(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.25)" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>Confirmed Root Cause</div>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", fontWeight: 600 }}>{selectedSolution.rootCause}</p>
              </div>

              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>1. Diagnostic Steps</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {selectedSolution.diagnosticSteps?.map((step, idx) => (
                    <div key={idx} style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>{step}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>2. Standard Repair Procedure</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {selectedSolution.repairProcedure?.map((step, idx) => (
                    <div key={idx} style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>{step}</div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                <strong>Test & Verification Standard:</strong> {selectedSolution.testAndVerification || '30-min trial run at nominal line speed.'}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedSolution(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Verified Solution Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add to Verified Solutions Library
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Problem / Symptom *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Excessive Vibration on Main Spindle Drive"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  required
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Root Cause Analysis *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Explain the causal defect mechanism discovered..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  required
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Repair Procedure Steps *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Enter step-by-step instructions (one per line)..."
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  required
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={CheckCircle2}>
                  Publish Solution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

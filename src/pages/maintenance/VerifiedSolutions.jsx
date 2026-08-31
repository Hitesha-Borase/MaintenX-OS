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
  Archive,
  BookOpen
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function VerifiedSolutions() {
  const { solutions, addVerifiedSolution, assets } = useCMMS();
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

  const filteredSolutions = solutions.filter((sol) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sol.problemSymptom.toLowerCase().includes(q) ||
      sol.rootCause.toLowerCase().includes(q) ||
      sol.failureCode.toLowerCase().includes(q) ||
      sol.tags.some((t) => t.toLowerCase().includes(q))
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

    addToast(`Verified Solution ${newSol.id} published to Knowledge Library!`);
    setIsAddModalOpen(false);
    setSymptom("");
    setRootCause("");
    setRepairNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Verified Solutions Library
            </h1>
            <Badge variant="emerald">Engineering Standard</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Central repository of validated root-cause diagnostic procedures and proven repairs to eliminate repeat breakdowns.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={Wrench} onClick={() => navigate("/maintenance/troubleshooting")}>
            Troubleshooting Wizard
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Verified Solution
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px", height: "46px", fontSize: "14px" }}
            placeholder="Search verified solutions by symptom (e.g. 'high vibration', 'pressure drop', 'optical drift')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Solutions Cards Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredSolutions.map((sol) => (
          <Card
            key={sol.id}
            interactive
            onClick={() => setSelectedSolution(sol)}
            style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid #10B981" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
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
                {sol.successfulUsesCount} Verified Fixes
              </Badge>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
              <strong>Root Cause:</strong> {sol.rootCause}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
              <div>
                Verified by: <strong style={{ color: "var(--text-primary)" }}>{sol.verifiedBy}</strong> on {sol.verificationDate}
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {sol.tags.map((t, i) => (
                  <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#1E293B", color: "#94A3B8" }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Solution Detail Modal */}
      <Modal
        isOpen={!!selectedSolution}
        onClose={() => setSelectedSolution(null)}
        title={`Verified Solution: ${selectedSolution?.id}`}
        subtitle={selectedSolution?.problemSymptom}
        maxWidth="720px"
      >
        {selectedSolution && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#34D399", textTransform: "uppercase" }}>Confirmed Root Cause</div>
              <p style={{ fontSize: "13px", color: "#FFFFFF", marginTop: "4px" }}>{selectedSolution.rootCause}</p>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>1. Diagnostic Steps</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                {selectedSolution.diagnosticSteps?.map((step, idx) => (
                  <div key={idx} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)" }}>{step}</div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>2. Standard Repair Procedure</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                {selectedSolution.repairProcedure?.map((step, idx) => (
                  <div key={idx} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)" }}>{step}</div>
                ))}
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-main)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
              <strong>Test & Verification Standard:</strong> {selectedSolution.testAndVerification}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Verified Solution Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add to Verified Solutions Library"
        subtitle="Publish a proven maintenance repair procedure to prevent repeat failures"
      >
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Problem / Symptom *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Excessive Vibration on Main Spindle Drive"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Root Cause Analysis *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Explain the causal defect mechanism discovered..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Repair Procedure Steps *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Enter step-by-step instructions (one per line)..."
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Publish Solution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

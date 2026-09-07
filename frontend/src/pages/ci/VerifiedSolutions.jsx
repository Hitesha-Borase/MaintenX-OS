import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Download,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  Clock,
  Plus,
  X,
  Filter,
  Wrench,
  Layers,
  Sparkles,
  BookOpen
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useCI } from "../../context/CIContext";
import { useApp } from "../../context/AppContext";

export function VerifiedSolutions() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    verifiedSolutions = [],
    createVerifiedSolution,
    investigations = []
  } = useCI();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newSolution, setNewSolution] = useState({
    assetId: "AST-002",
    assetName: "HTST Flash Pasteurizer",
    failureMode: "",
    symptom: "",
    rootCause: "",
    solutionSteps: "",
    partsUsed: "",
    sourceRcaId: investigations[0]?.id || ""
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSolution.failureMode.trim() || !newSolution.solutionSteps.trim()) {
      addToast("Please provide failure mode and solution steps.", "warning");
      return;
    }

    createVerifiedSolution(newSolution);
    setNewSolution({
      assetId: "AST-002",
      assetName: "HTST Flash Pasteurizer",
      failureMode: "",
      symptom: "",
      rootCause: "",
      solutionSteps: "",
      partsUsed: "",
      sourceRcaId: investigations[0]?.id || ""
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Solution ID,Asset Name,Failure Mode,Symptom,Root Cause,Solution Steps,Parts Used,Source RCA,Verified By,Date,Status\n";
    const rows = filteredSolutions
      .map((s) => `"${s.id}","${s.assetName}","${s.failureMode}","${s.symptom}","${s.rootCause}","${s.solutionSteps}","${s.partsUsed || "-"}","${s.sourceRcaId || "-"}","${s.verifiedBy}","${s.verifiedDate}","${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Verified_Troubleshooting_Solutions_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Verified solutions library exported to CSV.", "info");
  };

  const filteredSolutions = useMemo(() => {
    return verifiedSolutions.filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      return (
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.assetName?.toLowerCase().includes(q) ||
        s.failureMode.toLowerCase().includes(q) ||
        s.symptom.toLowerCase().includes(q) ||
        s.rootCause.toLowerCase().includes(q) ||
        s.solutionSteps.toLowerCase().includes(q)
      );
    });
  }, [verifiedSolutions, searchTerm]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Verified Troubleshooting Solutions
            </h1>
            <Badge variant="cyan">{verifiedSolutions.length} STANDARDIZED REMEDIES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Library CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Controlled Standards
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Publish Verified Solution
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
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
          title="Published Solutions"
          value={verifiedSolutions.length.toString()}
          unit="Proven Fixes"
          icon={FileCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="First-Time-Fix Rate"
          value="98.2%"
          unit="Remediation Quality"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Mean Time To Diagnose"
          value="8 min"
          unit="Standardized Flow"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Knowledge Sharing"
          value="Active"
          unit="Fleet Synchronized"
          icon={BookOpen}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search by equipment, symptom, root cause or failure mode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Equipment & Failure Mode</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Symptom & Root Cause</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Standardized Fix Steps</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Spare Parts Required</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Verified By</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolutions.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{s.failureMode}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {s.id} • {s.assetName}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div><strong>Symptom:</strong> {s.symptom}</div>
                    <div style={{ color: "#D97706", marginTop: "2px" }}><strong>Cause:</strong> {s.rootCause}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                    {s.solutionSteps}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {s.partsUsed || "Standard tooling"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div>{s.verifiedBy}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.verifiedDate}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="emerald">PUBLISHED</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PUBLISH SOLUTION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Publish Verified Solution
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset</label>
                  <select
                    value={newSolution.assetId}
                    onChange={(e) => {
                      const name = e.target.value === "AST-002" ? "HTST Flash Pasteurizer" : "Rotary Isobaric Bottle Filler";
                      setNewSolution({ ...newSolution, assetId: e.target.value, assetName: name });
                    }}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="AST-002">AST-002 — HTST Flash Pasteurizer</option>
                    <option value="AST-001">AST-001 — Rotary Isobaric Bottle Filler</option>
                    <option value="AST-004">AST-004 — Sleeve Rotary Labeler</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Source RCA Investigation</label>
                  <select
                    value={newSolution.sourceRcaId}
                    onChange={(e) => setNewSolution({ ...newSolution, sourceRcaId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">Direct Verification</option>
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Failure Mode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pneumatic Actuator Slow Divert on Temperature Plunge"
                  value={newSolution.failureMode}
                  onChange={(e) => setNewSolution({ ...newSolution, failureMode: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Observed Symptom</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Divert valve chatter, CCP warning"
                    value={newSolution.symptom}
                    onChange={(e) => setNewSolution({ ...newSolution, symptom: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Validated Root Cause</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Particulate fouling in pilot regulator"
                    value={newSolution.rootCause}
                    onChange={(e) => setNewSolution({ ...newSolution, rootCause: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Standardized Solution Steps *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="1. Isolate air line. 2. Clean regulator screen in ultrasonic bath. 3. Replace pilot seal ring..."
                  value={newSolution.solutionSteps}
                  onChange={(e) => setNewSolution({ ...newSolution, solutionSteps: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Parts / Consumables Used</label>
                <input
                  type="text"
                  placeholder="e.g. Pneumatic Seal Kit SKU-SP-4402, Loctite 243"
                  value={newSolution.partsUsed}
                  onChange={(e) => setNewSolution({ ...newSolution, partsUsed: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Publish to Knowledge Base
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

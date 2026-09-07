import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchCode,
  ChevronRight,
  Plus,
  Download,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Eye,
  FileText,
  X,
  Wrench
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function Investigations() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    investigations = [],
    openRcaCount,
    advanceRcaPhase,
    initiateRCA
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRcaDetail, setSelectedRcaDetail] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newAssetId, setNewAssetId] = useState("AST-002");

  const phases = ["Event", "Evidence", "Hypothesis & Tests", "Occurrence Cause", "Escape Cause", "CAPA", "Verification"];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast("Please enter an investigation title.", "warning");
      return;
    }

    initiateRCA(newAssetId, null, newTitle.trim());
    setNewTitle("");
    setIsCreateModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Investigation ID,Title,Asset ID,Asset Name,Line,Plant,Phase,Status,Severity,Lead Investigator,Days Active\n";
    const rows = filteredInvestigations
      .map((inv) => `"${inv.id}","${inv.title}","${inv.assetId}","${inv.assetName}","${inv.lineName}","${inv.plantId}","${inv.currentPhase}","${inv.status}","${inv.severity}","${inv.leadInvestigator}",${inv.daysActive}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Investigations_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("RCA investigations exported to CSV.", "info");
  };

  const getPhaseRoute = (phase) => {
    switch (phase) {
      case "Evidence":
        return "/ci/rca/evidence";
      case "Hypothesis & Tests":
        return "/ci/rca/hypothesis";
      case "Occurrence Cause":
        return "/ci/rca/occurrence";
      case "Escape Cause":
        return "/ci/rca/escape";
      case "CAPA":
        return "/ci/capa/corrective";
      default:
        return "/ci/rca/investigations";
    }
  };

  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      const matchesSeverity = severityFilter === "ALL" || inv.severity === severityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.title?.toLowerCase().includes(q) ||
        inv.id?.toLowerCase().includes(q) ||
        inv.assetName?.toLowerCase().includes(q) ||
        inv.leadInvestigator?.toLowerCase().includes(q);

      return matchesSeverity && matchesSearch;
    });
  }, [investigations, searchQuery, severityFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              RCA 2.0 — Investigations Hub
            </h1>
            <Badge variant="cyan">{investigations.length} ACTIVE INVESTIGATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/evidence")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Evidence Locker
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Create Investigation
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
          title="Active Investigations"
          value={openRcaCount.toString()}
          unit="In Flight"
          icon={SearchCode}
          colorVariant="rose"
        />
        <StatCard
          title="Root Causes Validated"
          value={investigations.filter((i) => i.status.includes("Validated")).length.toString()}
          unit="Confirmed"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Methodology"
          value="5-Why + 8D"
          unit="Framework"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Mean Time To Contain"
          value="3.2 hrs"
          unit="D3 Speed"
          icon={Clock}
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
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
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
              placeholder="Search RCA title, ID, asset or investigator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>RCA Details</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked Asset & Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Source Breakdown</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Current 8D Phase</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Investigation Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestigations.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{inv.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {inv.id} • Lead: {inv.leadInvestigator}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{inv.assetName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{inv.lineName}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                    {inv.sourceBreakdownId || "Direct Trigger"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      onClick={() => navigate(getPhaseRoute(inv.currentPhase))}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#8C5B23"
                      }}
                    >
                      <span>{inv.currentPhase}</span>
                      <ExternalLink size={11} />
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={inv.status.includes("Validated") ? "emerald" : inv.severity === "Critical" ? "rose" : "amber"}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setSelectedRcaDetail(inv)}
                        title="View 5-Why & 8D Dossier"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => {
                          const currIdx = phases.indexOf(inv.currentPhase);
                          const nextPhase = phases[Math.min(currIdx + 1, phases.length - 1)];
                          advanceRcaPhase(inv.id, nextPhase);
                        }}
                        title="Advance Investigation Phase"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE RCA MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SearchCode size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Initiate RCA 2.0 Investigation
                </h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Problem Statement / Failure Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Pasteurizer Divert Valve Seal Failure"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Source Asset</label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="AST-002">AST-002 — HTST Flash Pasteurizer (Line 2)</option>
                  <option value="AST-001">AST-001 — Rotary Isobaric Bottle Filler (Line 1)</option>
                  <option value="AST-004">AST-004 — Sleeve Rotary Labeler (Line 1)</option>
                  <option value="AST-005">AST-005 — Automated Case Packer (Line 1)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Launch Investigation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5-WHY & 8D DETAIL MODAL */}
      {selectedRcaDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedRcaDetail(null)}>
          <div className="modal-content" style={{ maxWidth: "700px", margin: "16px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  {selectedRcaDetail.id} — 5-Why & 8D Dossier
                </h2>
              </div>
              <button onClick={() => setSelectedRcaDetail(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Problem Definition</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{selectedRcaDetail.problemStatement}</div>
              </div>

              {/* 5-Why Tree */}
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                  5-Why Causal Tree
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedRcaDetail.whyTree?.map((w, idx) => (
                    <div key={w.id} style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: idx === 4 ? "rgba(5, 150, 105, 0.08)" : "var(--bg-card-subtle)", border: idx === 4 ? "1px solid rgba(5, 150, 105, 0.3)" : "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: idx === 4 ? "#059669" : "#8C5B23" }}>
                        Why #{idx + 1}: {w.question}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", marginTop: "2px" }}>
                        <strong>Answer:</strong> {w.answer || "Investigation in progress"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8D Summary */}
              {selectedRcaDetail.eightD && (
                <div>
                  <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                    8D Containment & Permanent Action Summary
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                    <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                      <strong style={{ color: "#8C5B23" }}>D3 Containment:</strong>
                      <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>{selectedRcaDetail.eightD.d3Containment}</div>
                    </div>
                    <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                      <strong style={{ color: "#059669" }}>D5 Corrective Action:</strong>
                      <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>{selectedRcaDetail.eightD.d5CorrectiveAction}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedRcaDetail(null)}>
                  Close Dossier
                </Button>
                <Button variant="primary" onClick={() => { setSelectedRcaDetail(null); navigate("/ci/capa/corrective"); }}>
                  View CAPA Actions
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

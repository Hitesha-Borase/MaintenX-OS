import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Save,
  CheckCircle2,
  Download,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  GitBranch,
  Layers,
  Sparkles,
  Lock,
  Plus,
  Trash2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";
import ciService from "../../../services/ciService";

export function OccurrenceCause() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { investigations = [], updateRCA, advanceRcaPhase } = useCI();

  const [activeCase, setActiveCase] = useState(() => investigations[0]?.id || "RCA-2026-001");

  useEffect(() => {
    ciService.getInvestigations().catch((err) => console.warn("Investigations load:", err.message));
  }, []);

  useEffect(() => {
    if (investigations.length > 0 && !investigations.some((i) => i.id === activeCase)) {
      setActiveCase(investigations[0].id);
    }
  }, [investigations, activeCase]);

  const currentInv = useMemo(() => {
    return investigations.find((i) => i.id === activeCase) || investigations[0] || {
      id: "RCA-2026-001",
      title: "Active Investigation",
      whyTree: [],
      eightD: {},
      problemStatement: ""
    };
  }, [investigations, activeCase]);

  // Local editable state for current investigation's 5-Why and root cause statement
  const [whyTree, setWhyTree] = useState([]);
  const [causeStatement, setCauseStatement] = useState("");

  useEffect(() => {
    if (currentInv) {
      const defaultTree = currentInv.whyTree && currentInv.whyTree.length > 0 ? currentInv.whyTree : [
        { id: "W1", question: "Why did the equipment fail during operation?", answer: "" },
        { id: "W2", question: "Why did the sub-component experience premature wear?", answer: "" },
        { id: "W3", question: "Why was the condition not detected during routine PM?", answer: "" },
        { id: "W4", question: "Why did the existing sensor/alarm fail to trigger?", answer: "" },
        { id: "W5", question: "Why was the standard maintenance procedure not followed?", answer: "" }
      ];
      setWhyTree(defaultTree);
      setCauseStatement(currentInv.eightD?.d4RootCause || currentInv.problemStatement || "");
    }
  }, [currentInv]);

  const handleWhyChange = (index, field, val) => {
    setWhyTree((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!causeStatement.trim()) {
      addToast("Please provide a root occurrence cause statement.", "warning");
      return;
    }

    await updateRCA(activeCase, {
      whyTree,
      status: "Root Cause Validated",
      eightD: {
        ...(currentInv.eightD || {}),
        d4RootCause: causeStatement.trim()
      }
    });

    addToast(`Occurrence cause for ${activeCase} confirmed and persisted to database!`, "success");
  };

  const handleAdvance = async () => {
    await advanceRcaPhase(activeCase, "Escape Cause");
    navigate("/ci/rca/escape");
  };

  const handleExportCSV = () => {
    const headers = "Investigation,Case Title,Why Level,Question,Answer\n";
    const rows = whyTree
      .map((w, idx) => `"${activeCase}","${currentInv.title}","Why ${idx + 1}","${w.question}","${w.answer}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Occurrence_Cause_${activeCase}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Occurrence Cause 5-Why analysis exported to CSV.", "info");
  };

  const isConfirmed = currentInv.status === "Root Cause Validated" || currentInv.currentPhase === "Occurrence Cause";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Occurrence Cause Validation
            </h1>
            <Badge variant="cyan">D4 ROOT CAUSE STAGE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export 5-Why
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/hypothesis")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Hypothesis Tests
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={handleAdvance} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Escape Cause (D5)
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
          title="Occurrence Confidence"
          value={isConfirmed ? "100%" : "85%"}
          unit={isConfirmed ? "Validated" : "Under Review"}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Asset"
          value={currentInv.assetName ? currentInv.assetName.substring(0, 14) + "..." : "Primary Asset"}
          unit={currentInv.assetId || "AST-001"}
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="5-Why Tree Depth"
          value={`${whyTree.length} Levels`}
          unit="Formulated"
          icon={GitBranch}
          colorVariant="cyan"
        />
        <StatCard
          title="Investigation Status"
          value={currentInv.status || "Open"}
          unit={currentInv.currentPhase || "Event"}
          icon={Sparkles}
          colorVariant="emerald"
        />
      </div>

      {/* Case Switcher Tab Bar */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Select Investigation Case:</span>
            {investigations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setActiveCase(inv.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: activeCase === inv.id ? 800 : 600,
                  backgroundColor: activeCase === inv.id ? "#C89547" : "var(--bg-card-subtle)",
                  color: activeCase === inv.id ? "#261603" : "var(--text-secondary)",
                  border: activeCase === inv.id ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  cursor: "pointer"
                }}
              >
                {inv.id}: {inv.title.substring(0, 24)}...
              </button>
            ))}
          </div>

          <Badge variant={isConfirmed ? "emerald" : "amber"}>
            {isConfirmed ? "CAUSE CONFIRMED" : "IN REVIEW"}
          </Badge>
        </div>
      </Card>

      {/* 5-Why Drill-Down Interactive Tree */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GitBranch size={18} color="#B27E33" />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              5-Why Root Cause Drill-Down Tree ({activeCase})
            </h3>
          </div>
          <Badge variant="cyan">{currentInv.severity || "High"} Severity</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {whyTree.map((item, idx) => {
            const isRoot = idx === whyTree.length - 1;

            return (
              <div
                key={idx}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: isRoot ? "rgba(200, 149, 71, 0.12)" : "var(--bg-card-subtle)",
                  border: isRoot ? "1px solid #C89547" : "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: isRoot ? "#8C5B23" : "#0284C7",
                      fontFamily: "var(--font-mono)",
                      backgroundColor: isRoot ? "rgba(200, 149, 71, 0.2)" : "rgba(2, 132, 199, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    Why {idx + 1} {isRoot ? "(Root Occurrence Cause)" : ""}
                  </span>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => handleWhyChange(idx, "question", e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px dashed var(--border-subtle)",
                      outline: "none",
                      padding: "2px 4px"
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: isRoot ? "#8C5B23" : "var(--text-muted)", fontWeight: 700 }}>↳ Finding:</span>
                  <input
                    type="text"
                    value={item.answer}
                    placeholder="Enter observation or finding..."
                    onChange={(e) => handleWhyChange(idx, "answer", e.target.value)}
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      color: isRoot ? "#8C5B23" : "var(--text-primary)",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px dashed var(--border-subtle)",
                      outline: "none",
                      padding: "2px 4px",
                      fontWeight: isRoot ? 700 : 500
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Validated Occurrence Cause Statement Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Validated Occurrence Cause Statement ({activeCase})
        </div>

        <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
              Confirmed Physical Mechanism & Direct Root Cause *
            </label>
            <textarea
              value={causeStatement}
              onChange={(e) => setCauseStatement(e.target.value)}
              className="form-textarea"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)",
                color: "var(--text-primary)",
                fontSize: "13px",
                lineHeight: 1.5,
                resize: "vertical"
              }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
            <Button
              variant="primary"
              type="submit"
              icon={CheckCircle2}
            >
              Confirm & Save to 8D Dossier
            </Button>

            <Button variant="secondary" icon={ArrowRight} onClick={handleAdvance}>
              Advance to Escape Cause (D5)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

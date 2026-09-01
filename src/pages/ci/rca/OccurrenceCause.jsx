import React, { useState } from "react";
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
  Lock
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function OccurrenceCause() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [activeCase, setActiveCase] = useState("INV-802");

  const [casesData, setCasesData] = useState({
    "INV-802": {
      title: "HTST Pasteurizer CCP Temp Excursion",
      causeStatement: "Steam modulating valve pneumatic actuator diaphragm suffered thermal fatigue perforation (EPDM material degraded under 98°C CIP sanitization cycles exceeding OEM spec limit).",
      whyTree: [
        { level: "Why 1", question: "Why did pasteurizer temperature dip below critical 83.5°C limit?", answer: "Steam heat exchanger thermal transfer dropped abruptly by 28% for 45 seconds." },
        { level: "Why 2", question: "Why did thermal transfer drop abruptly?", answer: "Pneumatic modulating steam control valve closed uncommanded during steady run." },
        { level: "Why 3", question: "Why did the modulating valve close unexpectedly?", answer: "Actuator pilot air pressure collapsed from 4.2 bar down to 0.8 bar." },
        { level: "Why 4", question: "Why did pilot air pressure collapse?", answer: "Actuator internal rubber rolling diaphragm ruptured along its perimeter seam." },
        { level: "Why 5 (Root Occurrence Cause)", question: "Why did the diaphragm rupture prematurely?", answer: "Standard EPDM rubber was installed instead of High-Temp Fluoroelastomer (Viton) during last overhaul, perishing under 98°C steam CIP." }
      ],
      failureCategory: "Material Incompatibility under Thermal CIP",
      confirmed: true
    },
    "INV-803": {
      title: "Orange Cap Thread Dimension Out-of-Spec",
      causeStatement: "Capping chuck spindle #4 dynamic torque clutch spring fatigue caused 1.8 Nm torque reduction at high-speed 600 BPM rotational speed.",
      whyTree: [
        { level: "Why 1", question: "Why did finished bottles fail torque seal audit?", answer: "Caps on spindle #4 were applied with only 1.2 Nm instead of required 3.0 Nm." },
        { level: "Why 2", question: "Why was spindle #4 applying lower torque?", answer: "Magnetic hysteresis clutch was slipping prematurely during tightening stroke." },
        { level: "Why 3", question: "Why was the hysteresis clutch slipping?", answer: "Internal disc compression spring had lost tension due to cyclic fatigue (> 2.4M cycles)." },
        { level: "Why 4", question: "Why was spring fatigue not detected beforehand?", answer: "Dynamic torque check was only scheduled semi-annually rather than monthly." },
        { level: "Why 5 (Root Occurrence Cause)", question: "Why was the interval inadequate?", answer: "PM plan frequency was never updated after line speed was uprated from 400 to 600 BPM." }
      ],
      failureCategory: "Cyclic Mechanical Spring Fatigue",
      confirmed: false
    }
  });

  const currentCase = casesData[activeCase];

  const handleConfirm = (e) => {
    e.preventDefault();
    setCasesData((prev) => ({
      ...prev,
      [activeCase]: { ...prev[activeCase], confirmed: true }
    }));
    addToast(`Occurrence cause for ${activeCase} confirmed and locked into 8D dossier!`, "success");
  };

  const handleExportCSV = () => {
    const headers = "Investigation,Case Title,Level,Question,Answer\n";
    const rows = currentCase.whyTree
      .map((w) => `"${activeCase}","${currentCase.title}","${w.level}","${w.question}","${w.answer}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Occurrence_Cause_${activeCase}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Occurrence Cause 5-Why analysis exported to CSV.", "info");
  };

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
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/rca/escape")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Escape Cause (D5)
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
          title="Occurrence Confidence"
          value="99.4%"
          unit="Verified"
          trend={{ value: "5-Why depth level 5 proven", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Primary Failure Mode"
          value="Material Spec"
          unit="Degradation"
          trend={{ value: "Thermal CIP fatigue", isPositive: false, text: "" }}
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="5-Why Tree Depth"
          value="5 Levels"
          unit="Complete"
          trend={{ value: "Root physical mechanism proven", isPositive: true, text: "" }}
          icon={GitBranch}
          colorVariant="cyan"
        />
        <StatCard
          title="CAPA Direct Link"
          value="PA-101"
          unit="Triggered"
          trend={{ value: "Material upgrade to Viton", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
      </div>

      {/* Case Switcher Tab Bar */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Select Investigation Case:</span>
            {["INV-802", "INV-803"].map((caseId) => (
              <button
                key={caseId}
                onClick={() => setActiveCase(caseId)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: activeCase === caseId ? 800 : 600,
                  backgroundColor: activeCase === caseId ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  color: activeCase === caseId ? "#261603" : "var(--text-secondary)",
                  border: activeCase === caseId ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  background: activeCase === caseId ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  cursor: "pointer"
                }}
              >
                {caseId}: {casesData[caseId].title}
              </button>
            ))}
          </div>

          <Badge variant={currentCase.confirmed ? "emerald" : "amber"}>
            {currentCase.confirmed ? "CAUSE CONFIRMED" : "IN REVIEW"}
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
          <Badge variant="cyan">{currentCase.failureCategory}</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentCase.whyTree.map((item, idx) => {
            const isRoot = idx === currentCase.whyTree.length - 1;

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
                  gap: "4px"
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
                    {item.level}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.question}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: isRoot ? "#8C5B23" : "var(--text-secondary)", paddingLeft: "4px", marginTop: "2px", lineHeight: 1.4, fontWeight: isRoot ? 700 : 500 }}>
                  ↳ <strong>Finding:</strong> {item.answer}
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
            <label className="form-label">Confirmed Physical Mechanism & Direct Root Cause *</label>
            <textarea
              value={currentCase.causeStatement}
              onChange={(e) =>
                setCasesData((prev) => ({
                  ...prev,
                  [activeCase]: { ...prev[activeCase], causeStatement: e.target.value }
                }))
              }
              className="form-textarea"
              rows={3}
              style={{ backgroundColor: "#FFFFFF", fontSize: "13px", lineHeight: 1.5 }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Cause Classification:</span>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px", marginTop: "2px" }}>Material Incompatibility / Fatigue</div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Triggered CAPA:</span>
              <div style={{ fontWeight: 700, color: "#059669", fontSize: "12px", marginTop: "2px" }}>PA-101 (High-Temp Viton Overhaul)</div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Escalation Status:</span>
              <div style={{ fontWeight: 700, color: "#8C5B23", fontSize: "12px", marginTop: "2px" }}>Ready for Escape Cause Validation (D5)</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="submit"
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                color: "#261603",
                border: "1px solid #E8C182",
                boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <CheckCircle2 size={14} /> Confirm & Lock Occurrence Cause
            </button>

            <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/rca/escape")}>
              Advance to Escape Cause (D5)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

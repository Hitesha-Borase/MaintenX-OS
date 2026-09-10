import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Sparkles,
  Lock,
  Search,
  Check,
  Layers,
  FileText
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";
import ciService from "../../../services/ciService";

export function EscapeCause() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { investigations = [], updateRCA, advanceRcaPhase } = useCI();

  const [activeCase, setActiveCase] = useState(() => investigations[0]?.id || "RCA-2026-001");

  useEffect(() => {
    ciService.getInvestigations().catch((err) => console.warn("Escape investigations load:", err.message));
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
      eightD: {}
    };
  }, [investigations, activeCase]);

  const [escapeStatement, setEscapeStatement] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");

  useEffect(() => {
    if (currentInv) {
      setEscapeStatement(
        currentInv.eightD?.d7Prevention ||
        "Pre-shift calibration checks were not codified in SOP, allowing actuator degradation to remain undetected prior to critical event."
      );
      setPreventiveAction(
        currentInv.eightD?.d5CorrectiveAction ||
        "Codify mandatory 3-point metrology audit and install redundant smart valve positioner"
      );
    }
  }, [currentInv]);

  const barriers = useMemo(() => {
    return [
      {
        id: "B1",
        name: "Automation SCADA Interlocks",
        type: "System Control",
        status: "Failed",
        description: `PLC monitored temperature without predictive sensor feedback for ${currentInv.assetName || "the equipment"}.`
      },
      {
        id: "B2",
        name: "Autonomous Operator Inspection",
        type: "Visual Spot-Check",
        status: "Failed",
        description: "Pressure gauge was obstructed behind thermal lagging hood, preventing operator detection."
      },
      {
        id: "B3",
        name: "Routine PM & Metrology Standard",
        type: "SOP Quality Gate",
        status: "Root Escape Cause",
        description: "Pre-shift checklist lacked mandatory differential calibration procedure prior to batch feed."
      }
    ];
  }, [currentInv]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!escapeStatement.trim()) {
      addToast("Please specify the escape cause statement.", "warning");
      return;
    }

    await updateRCA(activeCase, {
      eightD: {
        ...(currentInv.eightD || {}),
        d7Prevention: escapeStatement.trim(),
        d5CorrectiveAction: preventiveAction.trim()
      }
    });

    addToast(`Escape point analysis for ${activeCase} confirmed and saved!`, "success");
  };

  const handleTriggerCapa = async () => {
    await advanceRcaPhase(activeCase, "CAPA");
    navigate("/ci/capa/preventive");
  };

  const handleExportCSV = () => {
    const headers = "Investigation,Case Title,Barrier ID,Barrier Name,Category,Status,Failure Mode Description\n";
    const rows = barriers
      .map((b) => `"${activeCase}","${currentInv.title}","${b.id}","${b.name}","${b.type}","${b.status}","${b.description}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Escape_Cause_${activeCase}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Escape Cause barrier analysis exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Escape Cause Validation
            </h1>
            <Badge variant="cyan">D5 ESCAPE POINT STAGE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Escape Log
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/occurrence")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Occurrence Cause (D4)
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={handleTriggerCapa} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Trigger CAPA (D6)
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
          title="Escape Point Barrier"
          value="Inspection Gap"
          unit="Systemic"
          trend={{ value: "Failed detection gate identified", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
        <StatCard
          title="Defensive Barriers"
          value="3 Audited"
          unit="SCADA + QA"
          trend={{ value: "2 bypassed, 1 uncodified", isPositive: false, text: "" }}
          icon={EyeOff}
          colorVariant="amber"
        />
        <StatCard
          title="Systemic Vulnerability"
          value="SOP Metrology"
          unit="Unverified"
          trend={{ value: "No secondary cross-check in place", isPositive: false, text: "" }}
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="Preventive CAPA"
          value="Required"
          unit="Triggered"
          trend={{ value: "Mandatory mistake-proofing", isPositive: true, text: "" }}
          icon={ShieldCheck}
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

          <Badge variant="cyan">ESCAPE BARRIER AUDIT</Badge>
        </div>
      </Card>

      {/* Escape Barriers Breakdown */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertOctagon size={18} color="#EF4444" />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              Quality & Control Escape Barrier Breakdown ({activeCase})
            </h3>
          </div>
          <Badge variant="rose">3 Barriers Evaluated</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {barriers.map((b) => (
            <div
              key={b.id}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: b.status === "Root Escape Cause" ? "rgba(239, 68, 68, 0.08)" : "var(--bg-card-subtle)",
                border: b.status === "Root Escape Cause" ? "1px solid #EF4444" : "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="secondary">{b.type}</Badge>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {b.id}: {b.name}
                  </span>
                </div>
                <Badge variant={b.status === "Root Escape Cause" ? "rose" : "amber"}>
                  {b.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                {b.description}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Validated Escape Cause Statement Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Confirmed Escape Point Cause & Required Preventive Poka-Yoke ({activeCase})
        </div>

        <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
              Escape Point Statement (Why Was Fault Undetected Prior to Downstream Escape?) *
            </label>
            <textarea
              value={escapeStatement}
              onChange={(e) => setEscapeStatement(e.target.value)}
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

          <div>
            <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
              Mandatory Mistake-Proofing / Preventive Action *
            </label>
            <input
              type="text"
              value={preventiveAction}
              onChange={(e) => setPreventiveAction(e.target.value)}
              className="form-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)",
                color: "var(--text-primary)",
                fontSize: "13px"
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
              Confirm & Save Escape Cause
            </Button>

            <Button variant="secondary" icon={ArrowRight} onClick={handleTriggerCapa}>
              Trigger Preventive CAPA (D6)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

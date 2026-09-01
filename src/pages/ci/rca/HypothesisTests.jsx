import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Save,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowRight,
  Plus,
  RotateCcw,
  Sparkles,
  FlaskConical,
  XCircle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function HypothesisTests() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [hypotheses, setHypotheses] = useState([
    {
      id: 1,
      inv: "INV-802",
      category: "Sensor Drift & Instrumentation",
      statement: "Temperature sensor RTD PT100 probe drift caused a false temperature dip reading.",
      testMethod: "Calibrated probe against Fluke 9142 dry-well reference calibrator across 80°C - 95°C range.",
      result: "DISPROVEN: RTD reading accurate to ±0.04°C; true physical product thermal drop confirmed.",
      tested: true,
      verdict: "Disproven"
    },
    {
      id: 2,
      inv: "INV-802",
      category: "Hydraulic & Pressure Loss",
      statement: "Pneumatic modulating steam control valve diaphragm micro-leak caused sudden steam pressure collapse.",
      testMethod: "Acoustic ultrasonic leak audit and loop pressure hold test on Spirax Sarco steam manifold.",
      result: "CONFIRMED: Diaphragm perforated at 4.2 bar; steam mass flow dropped by 28% during event.",
      tested: true,
      verdict: "Confirmed"
    },
    {
      id: 3,
      inv: "INV-803",
      category: "Tooling & Mold Wear",
      statement: "Capping chuck spindle #4 torque clutch slipping under dynamic high-speed rotational load.",
      testMethod: "Rotational dynamic torque verification using wireless telemetry cap transducer at 600 BPM.",
      result: "Pending physical trial on next production changeover window.",
      tested: false,
      verdict: "Pending"
    }
  ]);

  const [selectedInvFilter, setSelectedInvFilter] = useState("ALL");
  const [selectedInv, setSelectedInv] = useState("INV-802");
  const [category, setCategory] = useState("Hydraulic & Pressure Loss");
  const [statement, setStatement] = useState("");
  const [testMethod, setTestMethod] = useState("");

  const filteredHypotheses = hypotheses.filter((h) => {
    return selectedInvFilter === "ALL" || h.inv === selectedInvFilter;
  });

  const handleTest = (id, verdict) => {
    setHypotheses((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              tested: true,
              verdict,
              result: verdict === "Confirmed" ? "CONFIRMED: Physical test validated causal link." : "DISPROVEN: Hypothesis ruled out by empirical test data."
            }
          : h
      )
    );
    addToast(`Hypothesis marked as "${verdict}". 8D cause verification updated!`, "success");
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!statement.trim()) {
      addToast("Please provide a hypothesis statement.", "warning");
      return;
    }

    const newItem = {
      id: Date.now(),
      inv: selectedInv,
      category,
      statement,
      testMethod: testMethod.trim() || "Empirical bench testing and SCADA telemetry validation.",
      result: "Pending physical testing by CI engineering team.",
      tested: false,
      verdict: "Pending"
    };

    setHypotheses((prev) => [newItem, ...prev]);
    addToast(`Hypothesis logged for ${selectedInv}!`, "success");
    setStatement("");
    setTestMethod("");
  };

  const handleExportCSV = () => {
    const headers = "ID,Investigation,Category,Hypothesis Statement,Test Method,Verdict,Tested\n";
    const rows = filteredHypotheses
      .map((h) => `"${h.id}","${h.inv}","${h.category}","${h.statement}","${h.testMethod}","${h.verdict}",${h.tested}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Hypotheses_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Hypotheses exported to CSV.", "info");
  };

  const testedCount = hypotheses.filter((h) => h.tested).length;
  const pendingCount = hypotheses.filter((h) => !h.tested).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Hypothesis & Physical Tests
            </h1>
            <Badge variant="cyan">{hypotheses.length} LOGGED HYPOTHESES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/evidence")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Evidence Locker
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/rca/occurrence")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Occurrence Cause
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
          title="Total Hypotheses"
          value={hypotheses.length.toString()}
          unit="Formulated"
          trend={{ value: "Root cause decision tree", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="cyan"
          onClick={() => setSelectedInvFilter("ALL")}
        />
        <StatCard
          title="Physically Tested"
          value={testedCount.toString()}
          unit="Validated"
          trend={{ value: "Lab & trial data completed", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Pending Trials"
          value={pendingCount.toString()}
          unit="In Queue"
          trend={{ value: "Requires production test", isPositive: pendingCount === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={pendingCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Root Cause Confidence"
          value="98.2%"
          unit="Empirical"
          trend={{ value: "Physical mechanism verified", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
      </div>

      {/* Case Filter Row */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Filter by Investigation:</span>
            {["ALL", "INV-802", "INV-803"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedInvFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: selectedInvFilter === f ? 800 : 600,
                  backgroundColor: selectedInvFilter === f ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  color: selectedInvFilter === f ? "#261603" : "var(--text-secondary)",
                  border: selectedInvFilter === f ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  background: selectedInvFilter === f ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  cursor: "pointer"
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Showing {filteredHypotheses.length} of {hypotheses.length} test records
          </div>
        </div>
      </Card>

      {/* Hypotheses List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {filteredHypotheses.map((h) => {
          const isConfirmed = h.verdict === "Confirmed";
          const isDisproven = h.verdict === "Disproven";
          const borderColor = isConfirmed ? "#059669" : isDisproven ? "#DC2626" : "#D97706";

          return (
            <Card
              key={h.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderLeft: `4px solid ${borderColor}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <Zap size={16} color={borderColor} />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {h.inv}
                    </span>
                    <Badge variant="cyan">{h.category}</Badge>
                    <Badge variant={isConfirmed ? "emerald" : isDisproven ? "rose" : "amber"}>
                      {h.verdict}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.4 }}>
                    {h.statement}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  {!h.tested ? (
                    <>
                      <button
                        onClick={() => handleTest(h.id, "Confirmed")}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Check size={13} /> Confirm Cause
                      </button>
                      <button
                        onClick={() => handleTest(h.id, "Disproven")}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#DC2626",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <XCircle size={13} /> Disprove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate("/ci/rca/occurrence")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                        color: "#261603",
                        border: "1px solid #E8C182",
                        boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>Occurrence Cause</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Test Protocol & Setup:</span>
                  <div style={{ color: "var(--text-primary)", marginTop: "2px", lineHeight: 1.4 }}>{h.testMethod}</div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Empirical Test Findings:</span>
                  <div style={{ color: isConfirmed ? "#059669" : isDisproven ? "#DC2626" : "var(--text-secondary)", fontWeight: 600, marginTop: "2px", lineHeight: 1.4 }}>
                    {h.result}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Hypothesis Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Formulate Potential Causal Hypothesis for Physical Testing
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Target RCA Investigation *</label>
              <select
                value={selectedInv}
                onChange={(e) => setSelectedInv(e.target.value)}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="INV-802">INV-802: HTST Pasteurizer CCP Temp Excursion</option>
                <option value="INV-803">INV-803: Orange Cap Thread Dimension Out-of-Spec</option>
                <option value="INV-804">INV-804: CIP Pump Seal Leakage Incident</option>
              </select>
            </div>

            <div>
              <label className="form-label">Failure Mechanism Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="Hydraulic & Pressure Loss">Hydraulic & Pressure Loss</option>
                <option value="Sensor Drift & Instrumentation">Sensor Drift & Instrumentation</option>
                <option value="Mechanical Fatigue & Alignment">Mechanical Fatigue & Alignment</option>
                <option value="Thermal / Heating Loop">Thermal / Heating Loop</option>
                <option value="Tooling & Mold Wear">Tooling & Mold Wear</option>
                <option value="Operator / Recipe Parameters">Operator / Recipe Parameters</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Hypothesis Statement *</label>
            <input
              type="text"
              placeholder="e.g. Steam modulating valve actuator diaphragm perished, causing backpressure loss under 95°C CIP..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="form-input"
              style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              required
            />
          </div>

          <div>
            <label className="form-label">Empirical Test Protocol / Simulation Plan</label>
            <textarea
              rows={2}
              placeholder="Describe physical test, pressure hold, electrical measurement, or bench simulation to prove/disprove..."
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value)}
              className="form-textarea"
              style={{ backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
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
              <Zap size={14} /> Log Hypothesis for Testing
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

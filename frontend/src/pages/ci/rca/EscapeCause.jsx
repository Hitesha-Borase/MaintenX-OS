import React, { useState } from "react";
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
import { useApp } from "../../../context/AppContext";

export function EscapeCause() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [activeCase, setActiveCase] = useState("INV-802");

  const [casesData, setCasesData] = useState({
    "INV-802": {
      title: "HTST Pasteurizer CCP Temp Excursion",
      escapeStatement: "Steam modulating valve lacked continuous pneumatic position feedback sensors, and pre-shift calibration cross-checks were not codified in SOP, allowing actuator degradation to remain undetected across 3 shifts prior to event.",
      barriers: [
        {
          id: "B1",
          name: "Automation SCADA Interlocks",
          type: "System Control",
          status: "Failed",
          description: "PLC monitored only temperature PV without predictive steam actuator valve travel feedback alarm."
        },
        {
          id: "B2",
          name: "Autonomous Operator Inspection",
          type: "Visual Check",
          status: "Failed",
          description: "Analog pilot air pressure gauge on steam manifold was positioned behind thermal lagging hood, preventing visual spot-checks."
        },
        {
          id: "B3",
          name: "Routine PM & Metrology Audit",
          type: "SOP Audit",
          status: "Root Escape Cause",
          description: "Start-of-shift SOP checklist did not require secondary temperature probe validation before feeding product into holding tube."
        }
      ],
      preventiveAction: "PA-102 (Codify 3-Point Pre-Shift Metrology Audit & Smart Valve Positioner)",
      owner: "Engineering & Metrology Lead",
      due: "2026-09-15",
      confirmed: true
    },
    "INV-803": {
      title: "Orange Cap Thread Dimension Out-of-Spec",
      escapeStatement: "Online vision inspection system photo-eye was calibrated for bottle cap presence rather than thread seating depth, letting under-torqued bottles escape to downstream packing.",
      barriers: [
        {
          id: "B1",
          name: "In-Line Vision System",
          type: "Vision QC",
          status: "Failed",
          description: "Cognex camera checked only cap color and gross presence, not micrometer thread pitch engagement."
        },
        {
          id: "B2",
          name: "QA Hourly Pull-Check",
          type: "Manual QC",
          status: "Failed",
          description: "Manual torque sampling was performed on only 1 bottle per lane every 2 hours, missing transient spindle #4 slip."
        },
        {
          id: "B3",
          name: "Dynamic Torque Feedback",
          type: "Telemetry Interlock",
          status: "Root Escape Cause",
          description: "No real-time electronic slip torque sensing was installed on individual rotary capping heads."
        }
      ],
      preventiveAction: "PA-103 (Install 100% In-Line Torque Sensing Transducers on All 12 Capping Spindles)",
      owner: "Automation & Controls Lead",
      due: "2026-09-20",
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
    addToast(`Escape Point Cause for ${activeCase} confirmed and linked to Preventive CAPA!`, "success");
  };

  const handleExportCSV = () => {
    const headers = "Investigation,Case Title,Barrier ID,Barrier Name,Category,Status,Failure Mode Description\n";
    const rows = currentCase.barriers
      .map((b) => `"${activeCase}","${currentCase.title}","${b.id}","${b.name}","${b.type}","${b.status}","${b.description}"`)
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
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/capa/corrective")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Trigger CAPA (D6)
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
          title="Escape Point Barrier"
          value="Inspection Gap"
          unit="Systemic"
          icon={EyeOff}
          colorVariant="rose"
        />
        <StatCard
          title="Detection Latency"
          value="3 Shifts"
          unit="Lag Time"
          icon={AlertOctagon}
          colorVariant="amber"
        />
        <StatCard
          title="Preventive CAPA Action"
          value="PA-102"
          unit="Generated"
          icon={Sparkles}
          colorVariant="cyan"
        />
        <StatCard
          title="Zero-Escape Safeguard"
          value="100%"
          unit="Poka-Yoke"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Active Case Selector Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Case:</span>
          {["INV-802", "INV-803"].map((caseId) => {
            const isActive = activeCase === caseId;
            return (
              <button
                key={caseId}
                onClick={() => setActiveCase(caseId)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: isActive ? "var(--color-primary)" : "var(--bg-card-subtle)",
                  color: isActive ? "#FFFFFF" : "var(--text-secondary)"
                }}
              >
                {caseId}: {casesData[caseId].title}
              </button>
            );
          })}
        </div>

        <Badge variant={currentCase.confirmed ? "emerald" : "amber"}>
          {currentCase.confirmed ? "ESCAPE CONFIRMED" : "IN REVIEW"}
        </Badge>
      </div>

      {/* Main Analysis Section: Quality & Process Barriers Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={17} color="#DC2626" />
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Why Did Quality & Process Barriers Fail to Detect the Defect? ({activeCase})
            </h3>
          </div>
          <Badge variant="rose">BARRIER ANALYSIS</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Barrier Node</th>
                <th>Category</th>
                <th>Failure Mode & Detection Mechanism</th>
                <th>Barrier Status</th>
              </tr>
            </thead>
            <tbody>
              {currentCase.barriers.map((b) => {
                const isRoot = b.status === "Root Escape Cause";
                return (
                  <tr
                    key={b.id}
                    style={{
                      backgroundColor: isRoot ? "rgba(200, 149, 71, 0.08)" : undefined
                    }}
                  >
                    <td>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>
                        {b.name}
                      </strong>
                    </td>
                    <td>
                      <Badge variant="cyan">{b.type}</Badge>
                    </td>
                    <td style={{ maxWidth: "400px" }}>
                      <span style={{ fontSize: "12px", color: isRoot ? "#8C5B23" : "var(--text-secondary)", fontWeight: isRoot ? 700 : 500, lineHeight: 1.4 }}>
                        {b.description}
                      </span>
                    </td>
                    <td>
                      <Badge variant={isRoot ? "amber" : "rose"}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Validated Escape Cause Statement Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <FileText size={17} color="#8C5B23" />
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
            Validated Escape Point Statement & Poka-Yoke Safeguards ({activeCase})
          </h3>
        </div>

        <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="form-label">Systemic Escape Cause Formulation *</label>
            <textarea
              value={currentCase.escapeStatement}
              onChange={(e) =>
                setCasesData((prev) => ({
                  ...prev,
                  [activeCase]: { ...prev[activeCase], escapeStatement: e.target.value }
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
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Triggered Preventive CAPA:</span>
              <div style={{ fontWeight: 700, color: "#059669", fontSize: "12px", marginTop: "2px" }}>{currentCase.preventiveAction}</div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Verification Due Date:</span>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px", marginTop: "2px" }}>{currentCase.due}</div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Assigned Owner:</span>
              <div style={{ fontWeight: 700, color: "#8C5B23", fontSize: "12px", marginTop: "2px" }}>{currentCase.owner}</div>
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
              <CheckCircle2 size={14} /> Confirm & Lock Escape Cause
            </button>

            <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/capa/corrective")}>
              Trigger CAPA Corrective Actions (D6)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Award,
  Check,
  Plus,
  BarChart3
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function EffectivenessVerification() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [verifications, setVerifications] = useState([
    {
      id: "CA-301",
      action: "Replace HTST temperature modulating valve actuator diaphragm with high-temp Viton kit",
      verificationCriteria: "Zero CCP temperature excursions or uncommanded valve dips across 30 consecutive production shifts post-overhaul.",
      auditEvidence: "SCADA telemetry logs from Aug 25 - Aug 31 confirm 100% thermal stability at 84.5°C ± 0.2°C.",
      period: "30-Day Sustained Window",
      auditor: "Quality Assurance Compliance Lead",
      status: "Pending"
    },
    {
      id: "PA-101",
      action: "Implement mandatory monthly temperature sensor dry-well calibration SOP",
      verificationCriteria: "100% on-time calibration compliance with as-found drift < 0.1°C across all 14 thermal loop sensors.",
      auditEvidence: "Metrology records certify 14/14 RTD probes verified within ±0.03°C tolerance.",
      period: "Quarterly Audit",
      auditor: "Metrology & Engineering Team",
      status: "Effective"
    },
    {
      id: "PA-103",
      action: "In-line wireless torque telemetry sensor installation with automatic reject interlock",
      verificationCriteria: "0% under-torqued bottles escaping to case packing; 100% catch rate on simulated 1.5 Nm challenge bottles.",
      auditEvidence: "Challenge testing validated 50/50 intentional defective caps successfully rejected by sensor.",
      period: "Challenge Trial",
      auditor: "Continuous Improvement Engineer",
      status: "Effective"
    }
  ]);

  const [newCriteria, setNewCriteria] = useState({
    id: "CA-302",
    action: "Replace capping spindle #4 torque clutch compression springs",
    verificationCriteria: "",
    auditEvidence: "Daily slip torque verification on 50 sample bottles per shift.",
    period: "14-Day Shift Window",
    auditor: "Elena Rostova (Tooling Tech)"
  });

  const handleVerify = (id) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Effective" } : v))
    );
    addToast(`CAPA ${id} formally verified as Effective! 8D Investigation signed off and closed.`, "success");
  };

  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (!newCriteria.verificationCriteria.trim()) {
      addToast("Please provide quantitative verification criteria.", "warning");
      return;
    }

    const created = {
      ...newCriteria,
      status: "Pending"
    };

    setVerifications((prev) => [created, ...prev]);
    addToast(`Verification protocol logged for ${newCriteria.id}!`, "success");
    setNewCriteria({
      id: "CA-303",
      action: "Codify 3-point pre-shift calibration cross-check",
      verificationCriteria: "",
      auditEvidence: "Signed start-of-shift checklist logs.",
      period: "30-Day Window",
      auditor: "QA Team"
    });
  };

  const handleExportCSV = () => {
    const headers = "CAPA ID,Action Scope,Verification Criteria,Audit Evidence,Audit Period,Auditor,Status\n";
    const rows = verifications
      .map((v) => `"${v.id}","${v.action}","${v.verificationCriteria}","${v.auditEvidence}","${v.period}","${v.auditor}","${v.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CAPA_Effectiveness_Audit_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Effectiveness audit dossier exported to CSV.", "info");
  };

  const effectiveCount = verifications.filter((v) => v.status === "Effective").length;
  const pendingCount = verifications.filter((v) => v.status === "Pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CAPA Effectiveness Verification
            </h1>
            <Badge variant="emerald">D8 CLOSURE & SIGN-OFF</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit Dossier
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/capa/owners")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Owners & Due Dates
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/loss/production")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Loss Analysis Hub
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
          title="Verified & Closed"
          value={effectiveCount.toString()}
          unit="D8 Signed"
          trend={{ value: "100% quantitative evidence", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Pending Trial Audits"
          value={pendingCount.toString()}
          unit="In Review"
          trend={{ value: "30-day trial monitoring", isPositive: pendingCount === 0, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Effectiveness Rate"
          value="100%"
          unit="Sustained"
          trend={{ value: "Zero recurrence post-closure", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Integrity"
          value="ISO 22000"
          unit="Certified"
          trend={{ value: "Fully compliant audit trail", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Verification Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {verifications.map((v) => {
          const isEffective = v.status === "Effective";

          return (
            <Card
              key={v.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderLeft: `4px solid ${isEffective ? "#059669" : "#D97706"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <FileCheck size={16} color={isEffective ? "#059669" : "#D97706"} />
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {v.id}
                    </span>
                    <Badge variant={isEffective ? "emerald" : "amber"}>{v.status}</Badge>
                    <Badge variant="cyan">{v.period}</Badge>
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.4 }}>
                    {v.action}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {!isEffective ? (
                    <button
                      onClick={() => handleVerify(v.id)}
                      style={{
                        padding: "6px 14px",
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
                        gap: "6px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Check size={14} /> Verify Effective & Close 8D
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700, fontSize: "12px" }}>
                      <CheckCircle2 size={16} /> 8D Dossier Closed & Signed Off
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Quantitative Success Criteria:</span>
                  <div style={{ color: "var(--text-primary)", marginTop: "2px", lineHeight: 1.4, fontWeight: 500 }}>
                    {v.verificationCriteria}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Empirical Audit Evidence:</span>
                  <div style={{ color: isEffective ? "#059669" : "var(--text-secondary)", fontWeight: 600, marginTop: "2px", lineHeight: 1.4 }}>
                    {v.auditEvidence}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span>Audited By: <strong style={{ color: "var(--text-secondary)" }}>{v.auditor}</strong></span>
                <span>Verification Method: <strong style={{ color: "var(--text-secondary)" }}>Telemetry + Trial Log</strong></span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Log Verification Criteria Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Log Quantitative Verification Criteria & Audit Window (D8)
        </div>

        <form onSubmit={handleAddCriteria} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Target CAPA ID *</label>
              <input
                type="text"
                value={newCriteria.id}
                onChange={(e) => setNewCriteria({ ...newCriteria, id: e.target.value })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Audit Window Period *</label>
              <select
                value={newCriteria.period}
                onChange={(e) => setNewCriteria({ ...newCriteria, period: e.target.value })}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="30-Day Sustained Window">30-Day Sustained Window</option>
                <option value="14-Day Shift Window">14-Day Shift Window</option>
                <option value="Quarterly Audit">Quarterly Audit</option>
                <option value="Challenge Trial">Challenge Trial</option>
              </select>
            </div>

            <div>
              <label className="form-label">Designated QA Auditor *</label>
              <input
                type="text"
                value={newCriteria.auditor}
                onChange={(e) => setNewCriteria({ ...newCriteria, auditor: e.target.value })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Quantitative Success Criteria (Zero Recurrence Target) *</label>
            <textarea
              rows={2}
              placeholder="e.g. Zero torque non-conformances on capping spindle #4 across 100,000 continuous bottles..."
              value={newCriteria.verificationCriteria}
              onChange={(e) => setNewCriteria({ ...newCriteria, verificationCriteria: e.target.value })}
              className="form-textarea"
              style={{ backgroundColor: "#FFFFFF" }}
              required
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
              <Plus size={14} /> Schedule Effectiveness Audit
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

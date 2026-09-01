import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Award,
  DollarSign,
  Clock,
  Check,
  TrendingUp
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function BenefitsVerification() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [verifications, setVerifications] = useState([
    {
      id: "CI-001",
      title: "OEE Improvement — Line 1 Filler Nozzle Calibration",
      savings: "$38,200",
      criteria: "OEE increase ≥ 2% sustained continuously over 30 production shifts post-calibration",
      evidence: "SCADA weekly runtime audit confirms 93.8% availability (was 90.4%).",
      status: "Pending"
    },
    {
      id: "CI-003",
      title: "Label Application Defect Elimination & Vision Cognex Upgrade",
      savings: "$11,200",
      criteria: "Label defect rate < 0.1% for 60 consecutive days",
      evidence: "QA pull check data certifies 0 defect alarms in 60-day audit cycle.",
      status: "Verified"
    }
  ]);

  const handleVerify = (id) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Verified" } : v))
    );
    addToast(`CI Project ${id} financial benefits formally verified and locked into ERP!`, "success");
  };

  const handleExportCSV = () => {
    const headers = "Project ID,Title,Validated Savings,Verification Criteria,Audit Evidence,Status\n";
    const rows = verifications
      .map((v) => `"${v.id}","${v.title}","${v.savings}","${v.criteria}","${v.evidence}","${v.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Benefits_Verification_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Benefits verification dossier exported to CSV.", "info");
  };

  const verifiedCount = verifications.filter((v) => v.status === "Verified").length;
  const pendingCount = verifications.filter((v) => v.status === "Pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Benefits Verification
            </h1>
            <Badge variant="emerald">FINANCIAL AUDIT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Engineering Standards
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
          title="Verified Benefits"
          value="$11,200"
          unit="Locked"
          trend={{ value: "Formally validated cash savings", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Pending Trial Audits"
          value={pendingCount.toString()}
          unit="In Review"
          trend={{ value: "30-day statistical trial run", isPositive: pendingCount === 0, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Sustained Run-Rate"
          value="100%"
          unit="Integrity"
          trend={{ value: "Zero benefit erosion post-lock", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Sign-Off SLA"
          value="ISO 50001"
          unit="Compliant"
          trend={{ value: "Continuous improvement standards", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Verifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {verifications.map((v) => {
          const isVerified = v.status === "Verified";

          return (
            <Card
              key={v.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderLeft: `4px solid ${isVerified ? "#059669" : "#D97706"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <FileCheck size={16} color={isVerified ? "#059669" : "#D97706"} />
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {v.id}
                    </span>
                    <Badge variant={isVerified ? "emerald" : "amber"}>{v.status}</Badge>
                    <Badge variant="cyan">{v.savings} SAVINGS</Badge>
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.4 }}>
                    {v.title}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {!isVerified ? (
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
                      <Check size={14} /> Verify & Lock Benefits
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700, fontSize: "12px" }}>
                      <CheckCircle2 size={16} /> Formally Validated & Signed
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Financial Validation Criteria:</span>
                  <div style={{ color: "var(--text-primary)", marginTop: "2px", lineHeight: 1.4, fontWeight: 500 }}>
                    {v.criteria}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Empirical Validation Evidence:</span>
                  <div style={{ color: isVerified ? "#059669" : "var(--text-secondary)", fontWeight: 600, marginTop: "2px", lineHeight: 1.4 }}>
                    {v.evidence}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

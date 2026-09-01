import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Download,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check,
  Percent,
  Layers,
  Award
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Savings() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [projects, setProjects] = useState([
    {
      id: "CI-001",
      title: "OEE Improvement — Line 1 Filler",
      projected: "$42,000",
      actual: "$38,200",
      progress: 91,
      verified: false
    },
    {
      id: "CI-002",
      title: "CIP Cycle Time Reduction",
      projected: "$18,000",
      actual: "$14,800",
      progress: 82,
      verified: false
    },
    {
      id: "CI-003",
      title: "Label Application Defect Elimination",
      projected: "$11,200",
      actual: "$11,200",
      progress: 100,
      verified: true
    }
  ]);

  const handleExportCSV = () => {
    const headers = "Project ID,Project Title,Projected Savings,Actual Realized,Realization %,Benefits Verified\n";
    const rows = projects
      .map((p) => `"${p.id}","${p.title}","${p.projected}","${p.actual}",${p.progress},"${p.verified ? 'Yes' : 'No'}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Savings_Audit_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CI Savings Audit exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI Project Savings Tracker
            </h1>
            <Badge variant="emerald">$64,200 REALIZED YTD</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Projects
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/projects/benefits")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Benefits Verification
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
          title="YTD Projected Savings"
          value="$71,200"
          unit="Target"
          trend={{ value: "Across 3 active Kaizen events", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="cyan"
        />
        <StatCard
          title="YTD Actual Realized"
          value="$64,200"
          unit="Cash Value"
          trend={{ value: "90.1% realization velocity", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Formally Verified"
          value="$11,200"
          unit="Locked"
          trend={{ value: "Finance & QA audit signed", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="amber"
        />
        <StatCard
          title="Return on Investment"
          value="4.8x"
          unit="ROI"
          trend={{ value: "Direct cost benefit ratio", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
      </div>

      {/* Savings Breakdown List Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Project Savings Realization Breakdown
          </h3>
          <Badge variant="cyan">{projects.length} PROJECTS AUDITED</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {p.id}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {p.title}
                  </span>
                  {p.verified && <Badge variant="emerald">✓ BENEFITS VERIFIED</Badge>}
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Projected Target: <strong style={{ color: "var(--text-primary)" }}>{p.projected}</strong></span>
                  <span>Realized Savings: <strong style={{ color: "#059669" }}>{p.actual}</strong></span>
                  <span>Capture Rate: <strong style={{ color: "#8C5B23" }}>{p.progress}%</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/ci/projects/benefits")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-card-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <span>Verify Benefits</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

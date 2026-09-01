import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Layers,
  FileText
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function Reports() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [printingId, setPrintingId] = useState(null);

  const reports = [
    {
      id: "REP-01",
      name: "Weekly OEE Loss Waterfall & Financial Impact Report",
      category: "Loss Analytics",
      date: "2026-08-31",
      cadence: "Weekly (Every Monday)",
      format: "PDF / CSV"
    },
    {
      id: "REP-02",
      name: "RCA 8D / CAPA Effectiveness Monthly Audit Summary",
      category: "Quality Compliance",
      date: "2026-08-31",
      cadence: "Monthly",
      format: "PDF / Audit Dossier"
    },
    {
      id: "REP-03",
      name: "CI Kaizen Project Realized Savings & ROI Ledger",
      category: "Continuous Improvement",
      date: "2026-08-31",
      cadence: "Quarterly",
      format: "Executive Ledger"
    },
    {
      id: "REP-04",
      name: "Plant Reliability — MTBF / MTTR & Chronic Failure Analysis",
      category: "Asset Health",
      date: "2026-08-31",
      cadence: "Weekly",
      format: "Telemetry Digest"
    }
  ];

  const handlePrint = (rep) => {
    addToast(`Preparing "${rep.name}" for print / PDF generation...`, "info");
    setPrintingId(rep.id);
    setTimeout(() => {
      window.print();
      setPrintingId(null);
    }, 100);
  };

  const handleExportCSV = () => {
    const headers = "Report ID,Report Title,Category,Last Generated,Cadence,Format\n";
    const rows = reports
      .map((r) => `"${r.id}","${r.name}","${r.category}","${r.date}","${r.cadence}","${r.format}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Engineering_Reports_Index_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Reports register exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI / Engineering Reports
            </h1>
            <Badge variant="cyan">{reports.length} EXECUTIVE DIGESTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Register
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/reliability")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Reliability
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/notifications")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Notifications
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
          title="Executive Reports"
          value={reports.length.toString()}
          unit="Active"
          trend={{ value: "Automated report pipelines", isPositive: true, text: "" }}
          icon={FileSpreadsheet}
          colorVariant="cyan"
        />
        <StatCard
          title="Data Freshness"
          value="Real-Time"
          unit="Live"
          trend={{ value: "Connected to plant telemetry", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          unit="Certified"
          trend={{ value: "ISO 22000 & 50001 compliant", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Scheduled Delivery"
          value="Weekly"
          unit="Mondays"
          trend={{ value: "Automatic email & print digest", isPositive: true, text: "" }}
          icon={Calendar}
          colorVariant="amber"
        />
      </div>

      {/* Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {reports.map((rep) => (
          <Card
            key={rep.id}
            className={printingId === rep.id ? "print-only" : ""}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px",
              borderLeft: "4px solid #C89547",
              boxSizing: "border-box",
              minWidth: 0,
              width: "100%"
            }}
          >
            <div style={{ minWidth: "220px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FileSpreadsheet size={16} color="#B27E33" />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {rep.id}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {rep.name}
                </span>
                <Badge variant="cyan">{rep.category}</Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <span>Cadence: <strong style={{ color: "var(--text-primary)" }}>{rep.cadence}</strong></span>
                <span>Format: <strong style={{ color: "#8C5B23" }}>{rep.format}</strong></span>
                <span>Date: <strong style={{ color: "var(--text-secondary)" }}>{rep.date}</strong></span>
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => handlePrint(rep)}
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
                  gap: "6px",
                  whiteSpace: "nowrap"
                }}
              >
                <Printer size={14} /> Print / Export PDF
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

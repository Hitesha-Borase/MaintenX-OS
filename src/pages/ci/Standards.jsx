import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Printer,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function Standards() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [docs, setDocs] = useState([
    {
      code: "SOP-CCP-001",
      title: "HTST Pasteurizer CCP Critical Control Point Operating Procedure",
      category: "Food Safety & HACCP",
      rev: "Rev 4",
      lastReviewed: "2026-08-20",
      status: "Current"
    },
    {
      code: "SOP-QA-002",
      title: "Allergen Clean-Out & ATP Swab Pre-Op Verification Standard",
      category: "Quality Assurance",
      rev: "Rev 2",
      lastReviewed: "2026-07-15",
      status: "Current"
    },
    {
      code: "ENG-001",
      title: "Rotary Filler Liquid Nozzle Dynamic Calibration Engineering Standard",
      category: "Engineering & Maintenance",
      rev: "Rev 1",
      lastReviewed: "2026-08-28",
      status: "Under Review"
    }
  ]);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const handlePrint = (code) => {
    addToast(`Document ${code} prepared for print / controlled export.`, "info");
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "Document Code,Title,Category,Revision,Last Reviewed,Status\n";
    const rows = filteredDocs
      .map((d) => `"${d.code}","${d.title}","${d.category}","${d.rev}","${d.lastReviewed}","${d.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Engineering_Standards_Register_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Standards register exported to CSV.", "info");
  };

  const filteredDocs = docs.filter((d) => {
    return selectedCategoryFilter === "ALL" || d.category.includes(selectedCategoryFilter);
  });

  const currentCount = docs.filter((d) => d.status === "Current").length;
  const reviewCount = docs.filter((d) => d.status === "Under Review").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Engineering Standards Library
            </h1>
            <Badge variant="cyan">{docs.length} CONTROLLED STANDARDS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Register
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            CI Projects
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/verified-solutions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Verified Solutions
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
          title="Current Active SOPs"
          value={currentCount.toString()}
          unit="Controlled"
          trend={{ value: "ISO 22000 compliant standards", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Standards in Review"
          value={reviewCount.toString()}
          unit="Engineering"
          trend={{ value: "Pending QA audit sign-off", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "Zero non-conforming SOPs", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Revision Cadence"
          value="Annually"
          unit="Scheduled"
          trend={{ value: "Continuous engineering review", isPositive: true, text: "" }}
          icon={BookOpen}
          colorVariant="emerald"
        />
      </div>

      {/* Filter Row */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Category:</span>
            {["ALL", "Food Safety", "Quality", "Engineering"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: selectedCategoryFilter === cat ? 800 : 600,
                  backgroundColor: selectedCategoryFilter === cat ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  color: selectedCategoryFilter === cat ? "#261603" : "var(--text-secondary)",
                  border: selectedCategoryFilter === cat ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  background: selectedCategoryFilter === cat ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  cursor: "pointer"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Showing {filteredDocs.length} of {docs.length} standards
          </div>
        </div>
      </Card>

      {/* Standards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {filteredDocs.map((d, idx) => {
          const isCurrent = d.status === "Current";

          return (
            <Card
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px",
                borderLeft: `4px solid ${isCurrent ? "#059669" : "#D97706"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <FileText size={16} color={isCurrent ? "#059669" : "#D97706"} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {d.code}
                  </span>
                  <Badge variant="cyan">{d.category}</Badge>
                  <Badge variant={isCurrent ? "emerald" : "amber"}>{d.status}</Badge>
                </div>

                <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.4 }}>
                  {d.title}
                </h3>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Revision: <strong style={{ color: "var(--text-primary)" }}>{d.rev}</strong></span>
                  <span>Last Reviewed: <strong style={{ color: "var(--text-secondary)" }}>{d.lastReviewed}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => handlePrint(d.code)}
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
                  <Printer size={14} /> Print / PDF
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

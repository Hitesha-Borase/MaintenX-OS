import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Printer,
  Eye,
  X,
  Layers,
  Search,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function ReportsPage() {
  const { assets, workOrders, breakdowns, pmSchedules, spareParts, calibrations } = useCMMS();
  const { addToast } = useApp();

  const [selectedDateRange, setSelectedDateRange] = useState("Month");
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [previewReport, setPreviewReport] = useState(null);

  const reportTemplates = [
    {
      id: "RPT-001",
      name: "Equipment MTBF & MTTR Reliability Summary",
      category: "Reliability Engineering",
      description: "Mean Time Between Failures (MTBF) and Mean Time to Repair (MTTR) by production line and functional asset group.",
      frequency: "Monthly",
      dataPoints: assets.length
    },
    {
      id: "RPT-002",
      name: "Preventive Maintenance (PM) Compliance & Overdue Audit",
      category: "Maintenance Compliance",
      description: "Audit trail of scheduled vs completed PM work orders, 10% rule compliance, and technician sign-offs.",
      frequency: "Weekly",
      dataPoints: pmSchedules.length
    },
    {
      id: "RPT-003",
      name: "Plant Breakdown Downtime & Production Loss Valuation",
      category: "Financial & Loss",
      description: "Financial quantification of unplanned outages, lost product output units, and emergency labor spend.",
      frequency: "Monthly",
      dataPoints: breakdowns.length
    },
    {
      id: "RPT-004",
      name: "Critical Spare Parts Stockout Risk & Consumption Ledger",
      category: "Inventory & Supply",
      description: "Fast-moving parts consumption, reorder trigger breaches, min/max thresholds, and lead time forecasting.",
      frequency: "Weekly",
      dataPoints: spareParts.length
    },
    {
      id: "RPT-005",
      name: "Calibration & Metrology Compliance Register",
      category: "Regulatory & ISO",
      description: "Calibration certificate validity, NIST traceable standard records, and due date forecasting.",
      frequency: "Quarterly",
      dataPoints: calibrations.length
    }
  ];

  const handleGenerateReport = (template, format = "CSV") => {
    let content = "";
    let filename = `${template.id}_${new Date().toISOString().substring(0, 10)}.${format.toLowerCase()}`;

    if (template.id === "RPT-001") {
      content = "Asset ID,Name,Criticality,Health Score,Status,Vibration (mm/s)\n" +
        assets.map(a => `"${a.id}","${a.name}","${a.criticality}",${a.health},"${a.status}",${a.vibration}`).join("\n");
    } else if (template.id === "RPT-002") {
      content = "PM Code,Title,Asset ID,Frequency,Status,Next Due\n" +
        pmSchedules.map(p => `"${p.id}","${p.title}","${p.assetId}","${p.frequency}","${p.status}","${p.nextDue}"`).join("\n");
    } else if (template.id === "RPT-003") {
      content = "Breakdown ID,Asset ID,Failure Code,Duration (mins),Production Loss ($)\n" +
        breakdowns.map(b => `"${b.id}","${b.assetId}","${b.failureCode}",${b.durationMinutes || 45},${b.impact?.downtimeCostUSD || 2500}`).join("\n");
    } else {
      content = "Record ID,Title,Category,Timestamp,Status\n" +
        workOrders.slice(0, 10).map(w => `"${w.id}","${w.title}","${w.type}","${w.createdAt}","${w.status}"`).join("\n");
    }

    if (format === "CSV") {
      const blob = new Blob([content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      addToast(`Generated & downloaded ${template.name} (${format})`, "success");
    } else {
      setPreviewReport({
        template,
        format,
        generatedDate: new Date().toLocaleString(),
        rawContent: content
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Maintenance Reports & Analytics Center
            </h1>
            <Badge variant="cyan">AUDIT READY</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>Range:</span>
            <select
              className="form-select"
              style={{ height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Week">Last 7 Days</option>
              <option value="Month">Current Month</option>
              <option value="Quarter">Last 90 Days</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>Format:</span>
            <select
              className="form-select"
              style={{ height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="CSV">CSV Spreadsheet</option>
              <option value="PDF">PDF Preview</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary - 2x2 on mobile, 4 on desktop */}
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
          title="Automated Templates"
          value={reportTemplates.length.toString()}
          unit="Reports"
          trend={{ value: "ISO & FDA Audit Ready", isPositive: true, text: "" }}
          icon={FileSpreadsheet}
          colorVariant="cyan"
        />
        <StatCard
          title="Last Audit Export"
          value="Today, 06:00"
          unit="Shift A"
          trend={{ value: "100% data integrity", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Regulatory Compliance"
          value="100%"
          unit="Passed"
          trend={{ value: "All signatures recorded", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="emerald"
        />
        <StatCard
          title="Data Integrity"
          value="99.9%"
          unit="Verified"
          trend={{ value: "Zero telemetry drops", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="amber"
        />
      </div>

      {/* Report Templates Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px", width: "100%" }}>
        {reportTemplates.map((rep) => (
          <Card key={rep.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px", padding: "18px", boxSizing: "border-box" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <Badge variant="cyan">{rep.category}</Badge>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{rep.id}</span>
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                {rep.name}
              </h3>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.4 }}>
                {rep.description}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Cadence: <strong>{rep.frequency}</strong>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleGenerateReport(rep, "PDF")}
                  style={{ fontSize: "11px", padding: "5px 10px" }}
                >
                  Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleGenerateReport(rep, "CSV")}
                  style={{ fontSize: "11px", padding: "5px 10px" }}
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* REPORT PREVIEW MODAL */}
      {previewReport && (
        <div className="modal-backdrop" onClick={() => setPreviewReport(null)}>
          <div className="modal-content" style={{ maxWidth: "680px", maxHeight: "85vh", overflowY: "auto", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div>
                <Badge variant="cyan">{previewReport.template.category} Report</Badge>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {previewReport.template.name}
                </h2>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Generated on {previewReport.generatedDate} | Format: {previewReport.format}
                </div>
              </div>
              <button onClick={() => setPreviewReport(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", overflowX: "auto", whiteSpace: "pre-wrap", maxHeight: "350px" }}>
                {previewReport.rawContent}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", padding: "14px 20px", backgroundColor: "var(--bg-card-subtle)", flexWrap: "wrap", gap: "10px" }}>
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => {
                  window.print();
                  addToast("Opening system print dialog...", "info");
                }}
              >
                Print Document
              </Button>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={() => {
                    handleGenerateReport(previewReport.template, "CSV");
                    setPreviewReport(null);
                  }}
                >
                  Download CSV
                </Button>
                <Button variant="ghost" onClick={() => setPreviewReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

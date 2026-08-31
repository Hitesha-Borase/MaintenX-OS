import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Eye,
  Filter,
  CheckCircle2,
  FileText,
  Printer,
  X,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function ReportsPage() {
  const { reportTemplates, workOrders, breakdowns, pmSchedules, spareParts, calibrations, assets } = useCMMS();
  const { addToast } = useApp();

  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [selectedDateRange, setSelectedDateRange] = useState("Month");
  const [previewReport, setPreviewReport] = useState(null);

  const handleGenerateReport = (template, format = "CSV") => {
    let content = "";
    let filename = `${template.id}_${new Date().toISOString().substring(0, 10)}.csv`;

    if (template.id.includes("MTBF") || template.id.includes("CMMS")) {
      content =
        "Asset ID,Asset Name,MTBF (hrs),MTTR (hrs),Health Index (%),Status\n" +
        assets.map((a) => `"${a.id}","${a.name}",${a.mtbf || 350},${a.mttr || 1.4},${a.health},"${a.status}"`).join("\n");
    } else if (template.id.includes("OEE") || template.id.includes("Downtime")) {
      content =
        "Incident ID,Asset,Failure Category,Downtime Minutes,Cost Loss ($),Status\n" +
        breakdowns.map((b) => `"${b.id}","${b.assetName}","${b.failureCategory}",${b.durationMinutes},${b.impact?.downtimeCostUSD || 0},"${b.status}"`).join("\n");
    } else {
      content =
        "Schedule ID,Task Title,Asset,Next Due Date,Frequency,Status\n" +
        pmSchedules.map((s) => `"${s.id}","${s.title}","${s.assetName}","${s.dueNext}","${s.frequency}","${s.status}"`).join("\n");
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Maintenance Reports & Analytics Center
            </h1>
            <Badge variant="cyan">Executive & Regulatory Exports</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Generate automated compliance audit reports, MTBF reliability growth curves, downtime losses, and parts utilization.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Time Range:</span>
            <select
              className="form-select"
              style={{ height: "36px", fontSize: "12px" }}
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              <option value="Today">Today (Active Shift)</option>
              <option value="Week">Last 7 Days</option>
              <option value="Month">Current Month (August 2026)</option>
              <option value="Quarter">Last 90 Days</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Format:</span>
            <select
              className="form-select"
              style={{ height: "36px", fontSize: "12px" }}
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="CSV">CSV Spreadsheet</option>
              <option value="PDF">PDF Preview</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Automated Templates"
          value={reportTemplates.length.toString()}
          unit="Standard Reports"
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
      </div>

      {/* Report Templates Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        {reportTemplates.map((rep) => (
          <Card key={rep.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <Badge variant="cyan">{rep.category}</Badge>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{rep.id}</span>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                {rep.name}
              </h3>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.4 }}>
                {rep.description}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Frequency: <strong>{rep.frequency}</strong>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleGenerateReport(rep, "PDF")}
                >
                  Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleGenerateReport(rep, "CSV")}
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "680px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <Badge variant="cyan">{previewReport.template.category} Report</Badge>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
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

            <div style={{ backgroundColor: "#0F172A", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#38BDF8", overflowX: "auto", whiteSpace: "pre-wrap", maxHeight: "350px" }}>
              {previewReport.rawContent}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "16px" }}>
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

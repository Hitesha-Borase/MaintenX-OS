import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileText,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import executiveService from "../../services/executiveService";

export function Reports() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  // Modal 1: Print / Export PDF Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfForm, setPdfForm] = useState({
    facilityScope: "Enterprise Fleet (Consolidated)",
    reportingPeriod: "Current Month-to-Date (MTD)",
    signatory: "Pete Vanslyke (Executive Director)",
    includeNarrative: true,
    includeLedger: true,
    includeComplianceStamp: true,
    executiveRemarks: ""
  });

  // Modal 2: Export Register Modal
  const [isExportRegisterModalOpen, setIsExportRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    format: "CSV",
    categoryFilter: "All Executive Digests",
    dateHorizon: "Current Fiscal Year (YTD)",
    includeAuditWatermark: true,
    fileName: `Executive_Reports_Register_${new Date().toISOString().substring(0, 10)}.csv`
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getReports();
      const data = res.data || res;
      if (data && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
      addToast("Failed to load executive reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenPdfModal = (rep) => {
    setSelectedReport(rep);
    setPdfForm({
      facilityScope: "Enterprise Fleet (Consolidated)",
      reportingPeriod: "Current Month-to-Date (MTD)",
      signatory: "Pete Vanslyke (Executive Director)",
      includeNarrative: true,
      includeLedger: true,
      includeComplianceStamp: true,
      executiveRemarks: `Executive certification for ${rep.name}. Certified for regulatory filing and board distribution.`
    });
    setIsPdfModalOpen(true);
  };

  const handleConfirmPrint = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      await executiveService.exportReport({
        reportId: selectedReport.id,
        facilityScope: pdfForm.facilityScope,
        reportingPeriod: pdfForm.reportingPeriod,
        signatory: pdfForm.signatory,
        executiveRemarks: pdfForm.executiveRemarks
      });

      const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      setReports(prev =>
        prev.map(r =>
          r.id === selectedReport.id
            ? { ...r, lastExported: todayStr, exportedBy: pdfForm.signatory.split(" ")[0] }
            : r
        )
      );

      addToast(`Prepared "${selectedReport.name}" for print / PDF generation.`, "success");
      setPrintingId(selectedReport.id);
      setIsPdfModalOpen(false);

      setTimeout(() => {
        window.print();
        setPrintingId(null);
      }, 400);
    } catch (err) {
      console.error("Error exporting report:", err);
      addToast("Failed to export PDF", "error");
      setPrintingId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenExportRegister = () => {
    setRegisterForm({
      format: "CSV",
      categoryFilter: "All Executive Digests",
      dateHorizon: "Current Fiscal Year (YTD)",
      includeAuditWatermark: true,
      fileName: `Executive_Reports_Register_${new Date().toISOString().substring(0, 10)}.csv`
    });
    setIsExportRegisterModalOpen(true);
  };

  const handleConfirmExportRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      setSubmitting(true);
      await executiveService.exportReport({
        reportId: "ALL_REPORTS_INDEX",
        format: registerForm.format,
        filter: registerForm.categoryFilter
      });

      let filtered = reports;
      if (registerForm.categoryFilter === "Finance & Costing Only") {
        filtered = reports.filter(r => r.category.includes("FINANCE") || r.category.includes("COST"));
      } else if (registerForm.categoryFilter === "Operations Only") {
        filtered = reports.filter(r => r.category.includes("OPERATIONS"));
      }

      const headers = "Report ID,Report Title,Category,Last Generated,Cadence,Format,Compliance\n";
      const rows = filtered
        .map((r) => `"${r.id}","${r.name}","${r.category}","${r.date}","${r.cadence}","${r.format}","ISO-Certified"`)
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = registerForm.fileName || `Executive_Reports_Register.csv`;
      a.click();

      addToast(`Reports register exported as ${registerForm.format} (${filtered.length} digests included).`, "success");
      setIsExportRegisterModalOpen(false);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      addToast("Failed to export reports register", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Executive Reports
            </h1>
            <Badge variant="cyan">{reports.length} EXECUTIVE DIGESTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleOpenExportRegister} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Register
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/executive/notifications")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Notifications
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
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
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
                  <FileText size={16} color="#B27E33" />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {rep.id}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {rep.name}
                  </span>
                  <Badge variant="cyan">{rep.category}</Badge>
                  {rep.lastExported && (
                    <Badge variant="emerald">
                      ✓ Exported {rep.lastExported}
                    </Badge>
                  )}
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Cadence: <strong style={{ color: "var(--text-primary)" }}>{rep.cadence}</strong></span>
                  <span>Format: <strong style={{ color: "#8C5B23" }}>{rep.format}</strong></span>
                  <span>Date: <strong style={{ color: "var(--text-secondary)" }}>{rep.date}</strong></span>
                </div>
              </div>

              <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => handleOpenPdfModal(rep)}
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
      )}

      {/* Print / Export PDF Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={`Configure Report Export & Print: ${selectedReport?.id || ""}`}
        subtitle={`${selectedReport?.name || ""}`}
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPdfModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" icon={Printer} onClick={handleConfirmPrint} disabled={submitting}>
              {submitting ? "Compiling PDF..." : "Generate & Print PDF"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmPrint} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Target Report:</span>
              <strong style={{ color: "var(--text-primary)" }}>{selectedReport?.name}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Classification:</span>
              <Badge variant="cyan">{selectedReport?.category}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery Cadence:</span>
              <strong>{selectedReport?.cadence} ({selectedReport?.format})</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Target Facility / Scope
              </label>
              <select
                className="input-field"
                value={pdfForm.facilityScope}
                onChange={(e) => setPdfForm(prev => ({ ...prev, facilityScope: e.target.value }))}
              >
                <option value="Enterprise Fleet (Consolidated)">Enterprise Fleet (Consolidated)</option>
                <option value="Plant 1 - Smokehouse & Processing">Plant 1 - Smokehouse & Processing</option>
                <option value="Plant 2 - Packaging & Cold Storage">Plant 2 - Packaging & Cold Storage</option>
                <option value="Regional Supply Chain Hub">Regional Supply Chain Hub</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Reporting Period
              </label>
              <select
                className="input-field"
                value={pdfForm.reportingPeriod}
                onChange={(e) => setPdfForm(prev => ({ ...prev, reportingPeriod: e.target.value }))}
              >
                <option value="Current Month-to-Date (MTD)">Current Month-to-Date (MTD)</option>
                <option value="Previous Month Close">Previous Month Close</option>
                <option value="Rolling 90-Day Audit Window">Rolling 90-Day Audit Window</option>
                <option value="Annual Fiscal YTD">Annual Fiscal YTD</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Authorized Signatory
            </label>
            <input
              type="text"
              className="input-field"
              value={pdfForm.signatory}
              onChange={(e) => setPdfForm(prev => ({ ...prev, signatory: e.target.value }))}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Report Inclusions & Formatting
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={pdfForm.includeNarrative}
                  onChange={(e) => setPdfForm(prev => ({ ...prev, includeNarrative: e.target.checked }))}
                />
                Include Executive Summary Narrative & Operational Context
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={pdfForm.includeLedger}
                  onChange={(e) => setPdfForm(prev => ({ ...prev, includeLedger: e.target.checked }))}
                />
                Include Granular Data Tables & Multi-Plant Variance Ledger
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={pdfForm.includeComplianceStamp}
                  onChange={(e) => setPdfForm(prev => ({ ...prev, includeComplianceStamp: e.target.checked }))}
                />
                Apply ISO 22000 & 50001 Certified Compliance Watermark
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Executive Remarks & Distribution Directives
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={pdfForm.executiveRemarks}
              onChange={(e) => setPdfForm(prev => ({ ...prev, executiveRemarks: e.target.value }))}
              placeholder="Add board of directors cover note or executive observations..."
            />
          </div>
        </form>
      </Modal>

      {/* Export Register Modal */}
      <Modal
        isOpen={isExportRegisterModalOpen}
        onClose={() => setIsExportRegisterModalOpen(false)}
        title="Export Executive Reports Register"
        subtitle="Download index of all automated executive reports and cadence schedules"
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsExportRegisterModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" icon={Download} onClick={handleConfirmExportRegister} disabled={submitting}>
              {submitting ? "Exporting..." : "Download Register File"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmExportRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Export File Format
              </label>
              <select
                className="input-field"
                value={registerForm.format}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, format: e.target.value }))}
              >
                <option value="CSV">CSV Spreadsheet (.csv)</option>
                <option value="Excel">Excel Workbook (.xlsx)</option>
                <option value="JSON">JSON Data Payload (.json)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Filter by Category
              </label>
              <select
                className="input-field"
                value={registerForm.categoryFilter}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, categoryFilter: e.target.value }))}
              >
                <option value="All Executive Digests">All Executive Digests</option>
                <option value="Finance & Costing Only">Finance & Costing Only</option>
                <option value="Operations Only">Operations Only</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Export File Name
            </label>
            <input
              type="text"
              className="input-field"
              value={registerForm.fileName}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, fileName: e.target.value }))}
              required
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer", marginTop: "4px" }}>
            <input
              type="checkbox"
              checked={registerForm.includeAuditWatermark}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, includeAuditWatermark: e.target.checked }))}
            />
            Include Audit Compliance Verification Headers
          </label>
        </form>
      </Modal>
    </div>
  );
}

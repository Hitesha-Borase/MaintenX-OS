import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileText,
  Plus,
  RefreshCw,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";
import dashboardService from "../../services/dashboardService";

export function Reports() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [printingId, setPrintingId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Manual Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formShift, setFormShift] = useState("Shift A");
  const [formCategory, setFormCategory] = useState("OPERATIONS");
  const [formCadence, setFormCadence] = useState("Daily (End of Shift)");
  const [formSummary, setFormSummary] = useState("");

  const fetchReports = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await dashboardService.getSupervisorReports();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setReports(list);
      if (isManualRefresh) {
        addToast("Supervisor reports refreshed.", "info");
      }
    } catch (err) {
      console.error("Failed to fetch supervisor reports:", err);
      if (isManualRefresh) {
        addToast("Failed to refresh reports.", "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenModal = () => {
    setFormTitle("");
    setFormShift("Shift A");
    setFormCategory("OPERATIONS");
    setFormCadence("Daily (End of Shift)");
    setFormSummary("");
    setIsModalOpen(true);
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast("Please enter a report title.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await dashboardService.createSupervisorReport({
        title: formTitle.trim(),
        category: formCategory,
        cadence: formCadence,
        summary: formSummary.trim(),
        shift: formShift
      });

      addToast(res.message || `Report "${formTitle}" generated successfully.`, "success");
      setIsModalOpen(false);
      await fetchReports();
    } catch (err) {
      console.error("Error generating supervisor report:", err);
      addToast(err?.response?.data?.message || "Failed to generate supervisor report.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = async (rep) => {
    addToast(`Preparing "${rep.name}" for print / PDF generation...`, "info");
    setPrintingId(rep.id);
    try {
      await dashboardService.printSupervisorReport(rep.id);
    } catch (err) {
      console.warn("[Reports] Failed to log print API:", err);
    }
    setTimeout(() => {
      window.print();
      setPrintingId(null);
    }, 100);
  };

  const handleExportCSV = () => {
    if (reports.length === 0) {
      addToast("No reports available to export.", "warning");
      return;
    }
    const headers = "Report ID,Report Title,Category,Last Generated,Cadence,Format,Status,Summary\n";
    const rows = reports
      .map((r) => `"${r.id}","${r.name}","${r.category}","${r.date}","${r.cadence}","${r.format}","${r.status || 'PUBLISHED'}","${(r.summary || '').replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Supervisor_Reports_Index_${new Date().toISOString().substring(0, 10)}.csv`;
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
              Supervisor Reports
            </h1>
            <Badge variant="cyan">{reports.length} SHIFT DIGESTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={() => fetchReports(true)}
            disabled={refreshing}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenModal}
            style={{ fontSize: "12px", padding: "7px 12px", backgroundColor: "#C89547", borderColor: "#C89547" }}
          >
            + Generate Shift Report
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportCSV}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Export Register
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
          title="Supervisor Reports"
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
          value="Daily"
          unit="Shift End"
          trend={{ value: "Automatic email & print digest", isPositive: true, text: "" }}
          icon={Calendar}
          colorVariant="amber"
        />
      </div>

      {/* Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {loading ? (
          <Card style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading supervisor compliance reports...
          </Card>
        ) : reports.length === 0 ? (
          <Card style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <FileSpreadsheet size={42} color="#C89547" style={{ opacity: 0.6 }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              No Shift Reports Generated Yet
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "480px", margin: 0 }}>
              No shift digests generated yet. Click <strong>"+ Generate Shift Report"</strong> above to compile a report from plant floor telemetry.
            </p>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenModal}
              style={{ marginTop: "8px", fontSize: "12px", padding: "7px 16px", backgroundColor: "#C89547", borderColor: "#C89547" }}
            >
              Generate Shift Report
            </Button>
          </Card>
        ) : (
          reports.map((rep) => (
            <Card
              key={rep.id || rep.dbId}
              className={printingId === rep.id ? "print-only" : ""}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                  {rep.status && (
                    <Badge variant="emerald" style={{ fontSize: "10px" }}>{rep.status}</Badge>
                  )}
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span>Cadence: <strong style={{ color: "var(--text-primary)" }}>{rep.cadence}</strong></span>
                  <span>Format: <strong style={{ color: "#8C5B23" }}>{rep.format}</strong></span>
                  <span>Date: <strong style={{ color: "var(--text-secondary)" }}>{rep.date}</strong></span>
                </div>

                {rep.summary && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-card-subtle)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      lineHeight: "1.4"
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#C89547" }}>Summary Notes: </span>
                    {rep.summary}
                  </div>
                )}
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
          ))
        )}
      </div>

      {/* Manual Report Creation Form Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-surface)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={18} color="#C89547" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Create Shift Compliance Report
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Real Manual Input Form */}
            <form onSubmit={handleGenerateReport} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Report Title (Text Input) */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Line 1 Daily Production & OEE Summary"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Active Shift Selector */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Shift *
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["Shift A", "Shift B", "Shift C"].map((shift) => (
                    <button
                      type="button"
                      key={shift}
                      onClick={() => setFormShift(shift)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: formShift === shift ? "2px solid #C89547" : "1px solid var(--border-subtle)",
                        backgroundColor: formShift === shift ? "rgba(200, 149, 71, 0.1)" : "var(--bg-card-subtle)",
                        color: formShift === shift ? "#C89547" : "var(--text-primary)"
                      }}
                    >
                      {shift}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category and Cadence Dropdowns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Department / Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="OPERATIONS">OPERATIONS</option>
                    <option value="SANITATION">SANITATION</option>
                    <option value="QUALITY COMPLIANCE">QUALITY COMPLIANCE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="GOVERNANCE & SAFETY">GOVERNANCE & SAFETY</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Cadence *
                  </label>
                  <select
                    value={formCadence}
                    onChange={(e) => setFormCadence(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Daily (End of Shift)">Daily (End of Shift)</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Shift Summary & Observations Notes (Textarea) */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Shift Summary & Operational Notes
                </label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Type handover notes, production output highlights, downtime root causes, or compliance sign-off remarks..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  style={{ fontSize: "13px", backgroundColor: "#C89547", borderColor: "#C89547" }}
                >
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Reports;

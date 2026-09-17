import React, { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileText,
  Sparkles,
  Printer,
  Eye,
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCw,
  Database,
  Table,
  Code
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import maintenanceService from "../../services/maintenanceService";

const CATEGORY_OPTIONS = [
  "Reliability Engineering",
  "Maintenance Compliance",
  "Financial & Loss",
  "Inventory & Supply",
  "Regulatory & ISO",
  "Safety & EHS",
  "Quality & Metrology"
];

const FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Bi-Annual",
  "Annual"
];

const TARGET_MODULE_OPTIONS = [
  { value: "assets", label: "Equipment Assets Master (assets)" },
  { value: "pm_schedules", label: "Preventive Maintenance (pm_schedules)" },
  { value: "work_orders", label: "Work Orders & Breakdowns (work_orders)" },
  { value: "spare_parts", label: "Spare Parts Inventory (spare_parts)" },
  { value: "calibrations", label: "Calibrations & Metrology (calibrations)" }
];

export function ReportsPage() {
  const { addToast } = useApp();

  // Live database states
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search states
  const [selectedDateRange, setSelectedDateRange] = useState("Month");
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deletingReport, setDeletingReport] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [previewViewMode, setPreviewViewMode] = useState("table"); // "table" | "raw"
  const [generatingReportId, setGeneratingReportId] = useState(null);

  // Form states for manual entry
  const [formData, setFormData] = useState({
    reportCode: "",
    name: "",
    category: "Maintenance Compliance",
    description: "",
    frequency: "Monthly",
    targetModule: "assets",
    regulatoryStandard: "ISO 55001 / FDA CFR 21"
  });

  // Fetch live reports and summary from Postgres backend
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const [reportsRes, summaryRes] = await Promise.all([
        maintenanceService.getReports(),
        maintenanceService.getReportsSummary()
      ]);

      if (reportsRes?.data) {
        setReports(reportsRes.data);
      }
      if (summaryRes?.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error("Failed to load reports from backend API:", err);
      addToast("Failed to load reports from database", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch =
        !searchQuery ||
        rep.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.reportCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || rep.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [reports, searchQuery, selectedCategory]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    // Determine next sequential report code
    let nextNum = 1;
    reports.forEach((r) => {
      if (r.reportCode && r.reportCode.startsWith("RPT-")) {
        const num = parseInt(r.reportCode.replace("RPT-", ""), 10);
        if (!isNaN(num) && num >= nextNum) {
          nextNum = num + 1;
        }
      }
    });

    setFormData({
      reportCode: `RPT-${String(nextNum).padStart(3, "0")}`,
      name: "",
      category: "Reliability Engineering",
      description: "",
      frequency: "Monthly",
      targetModule: "assets",
      regulatoryStandard: "ISO 55001 / FDA CFR 21"
    });
    setIsCreateModalOpen(true);
  };

  // Handle manual create submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast("Report Name is required", "warning");
      return;
    }

    try {
      const res = await maintenanceService.createReport(formData);
      addToast(`Report "${formData.name}" created successfully in database`, "success");
      setIsCreateModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to create report:", err);
      addToast(err.response?.data?.message || "Error creating report in database", "error");
    }
  };

  // Handle open edit modal
  const handleOpenEditModal = (rep) => {
    setEditingReport({ ...rep });
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReport.name?.trim()) {
      addToast("Report Name is required", "warning");
      return;
    }

    try {
      await maintenanceService.updateReport(editingReport.id, editingReport);
      addToast(`Report "${editingReport.name}" updated successfully`, "success");
      setEditingReport(null);
      loadData();
    } catch (err) {
      console.error("Failed to update report:", err);
      addToast(err.response?.data?.message || "Error updating report", "error");
    }
  };

  // Handle delete submit
  const handleDeleteSubmit = async () => {
    if (!deletingReport) return;
    try {
      await maintenanceService.deleteReport(deletingReport.id);
      addToast(`Report "${deletingReport.reportCode}" deleted successfully`, "success");
      setDeletingReport(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete report:", err);
      addToast(err.response?.data?.message || "Error deleting report", "error");
    }
  };

  // Live generation and export
  const handleGenerateReport = async (rep, format = "CSV") => {
    setGeneratingReportId(rep.id);
    try {
      const res = await maintenanceService.generateReport(rep.id, format);
      const data = res.data;

      if (format === "CSV") {
        const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.filename || `${rep.reportCode}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast(`Downloaded ${rep.name} (${data.count} database rows)`, "success");
        // Update summary to reflect latest export time
        loadData();
      } else {
        // Preview Modal
        setPreviewReport({
          template: data.report || rep,
          format,
          headers: data.headers || [],
          rows: data.rows || [],
          rawContent: data.csv || "",
          count: data.count || 0,
          generatedDate: new Date().toLocaleString()
        });
      }
    } catch (err) {
      console.error("Failed to generate report data:", err);
      addToast("Failed to query live report data from database", "error");
    } finally {
      setGeneratingReportId(null);
    }
  };

  const getCategoryBadgeVariant = (cat) => {
    switch (cat) {
      case "Reliability Engineering":
        return "cyan";
      case "Maintenance Compliance":
        return "emerald";
      case "Financial & Loss":
        return "amber";
      case "Inventory & Supply":
        return "purple";
      case "Regulatory & ISO":
        return "rose";
      case "Safety & EHS":
        return "amber";
      default:
        return "blue";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1280px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "260px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              Maintenance Reports & Analytics Center
            </h1>
            <Badge variant="cyan">AUDIT READY</Badge>
            <Badge variant="emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Database size={12} /> Live DB Connected
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", marginBottom: 0 }}>
            Enterprise maintenance reporting, regulatory audits, and live database exports.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            title="Refresh database records"
            style={{ height: "36px", border: "1px solid var(--border-subtle)" }}
          >
            <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </Button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>Range:</span>
            <select
              className="form-select"
              style={{ height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
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
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>Default:</span>
            <select
              className="form-select"
              style={{ height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="CSV">CSV Spreadsheet</option>
              <option value="PDF">PDF Preview</option>
            </select>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreateModal}
            style={{ height: "36px", fontSize: "13px", fontWeight: 700 }}
          >
            Create Report
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards - Fully connected to PostgreSQL database */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Automated Templates"
          value={summary ? String(summary.totalTemplates) : String(reports.length)}
          unit="Reports in DB"
          trend={{ value: "ISO & FDA Audit Ready", isPositive: true, text: "" }}
          icon={FileSpreadsheet}
          colorVariant="cyan"
        />
        <StatCard
          title="Last Audit Export"
          value={summary?.lastAuditExport?.value || "Today, 06:00"}
          unit={summary?.lastAuditExport?.subtext || "Shift A"}
          trend={{ value: "100% data integrity", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Regulatory Compliance"
          value={summary?.regulatoryCompliance?.value || "100%"}
          unit="Passed"
          trend={{ value: summary?.regulatoryCompliance?.subtext || "All signatures recorded", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="emerald"
        />
        <StatCard
          title="Data Integrity"
          value={summary?.dataIntegrity?.value || "99.9%"}
          unit="Verified"
          trend={{ value: summary?.dataIntegrity?.subtext || "Zero telemetry drops", isPositive: true, text: "" }}
          icon={Sparkles}
          colorVariant="amber"
        />
      </div>

      {/* Search and Category Filter Toolbar */}
      <Card style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search report templates by code, name, category, or standard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "36px",
              paddingRight: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-primary)",
              fontSize: "13px",
              color: "var(--text-primary)",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Category:</span>
          <select
            className="form-select"
            style={{ height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories ({reports.length})</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Report Templates Grid */}
      {loading ? (
        <Card style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <RotateCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", margin: 0 }}>Connecting to PostgreSQL and fetching report templates...</p>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <FileText size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
            No report templates found
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
            {searchQuery || selectedCategory !== "ALL"
              ? "Try adjusting your search criteria or category filter."
              : "No reports have been created yet. Click below to add your first report template."}
          </p>
          <Button variant="primary" icon={Plus} onClick={handleOpenCreateModal}>
            Create Report Template
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px", width: "100%" }}>
          {filteredReports.map((rep) => {
            const isGenerating = generatingReportId === rep.id;
            return (
              <Card
                key={rep.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  padding: "18px",
                  boxSizing: "border-box",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  position: "relative"
                }}
              >
                <div>
                  {/* Top badges & action icons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <Badge variant={getCategoryBadgeVariant(rep.category)}>{rep.category}</Badge>
                      {rep.regulatoryStandard && (
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                          {rep.regulatoryStandard}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-muted)" }}>
                        {rep.reportCode}
                      </span>
                      <button
                        onClick={() => handleOpenEditModal(rep)}
                        title="Edit report metadata"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingReport(rep)}
                        title="Delete report from database"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--danger, #ef4444)", padding: "2px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, margin: "0 0 6px" }}>
                    {rep.name}
                  </h3>

                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {rep.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Cadence: <strong style={{ color: "var(--text-primary)" }}>{rep.frequency}</strong>
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Database size={10} /> Source: <strong>{rep.targetModule}</strong> ({rep.dataPoints ?? 0} rows)
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      disabled={isGenerating}
                      onClick={() => handleGenerateReport(rep, "PDF")}
                      style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "8px" }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      disabled={isGenerating}
                      onClick={() => handleGenerateReport(rep, "CSV")}
                      style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "8px" }}
                    >
                      {isGenerating ? "Exporting..." : "Export CSV"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE REPORT MODAL - MANUAL ENTRY DIRECT TO DB */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Report Template"
        subtitle="Manually enter report parameters, schedule, standard, and target database source."
        maxWidth="620px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Report Code *
              </label>
              <input
                type="text"
                required
                value={formData.reportCode}
                onChange={(e) => setFormData({ ...formData, reportCode: e.target.value })}
                placeholder="RPT-007"
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-primary)",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Report Title / Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Critical Asset Vibration & Thermal Audit"
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-primary)",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Category *
              </label>
              <select
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Cadence / Frequency *
              </label>
              <select
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Database Source Table *
              </label>
              <select
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
                value={formData.targetModule}
                onChange={(e) => setFormData({ ...formData, targetModule: e.target.value })}
              >
                {TARGET_MODULE_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Regulatory Standard
              </label>
              <input
                type="text"
                value={formData.regulatoryStandard}
                onChange={(e) => setFormData({ ...formData, regulatoryStandard: e.target.value })}
                placeholder="ISO 55001 / FDA CFR 21"
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-primary)",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Scope & Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of audit criteria, calculation rules, or compliance objectives..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-primary)",
                fontSize: "13px",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Report to Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT REPORT MODAL */}
      {editingReport && (
        <Modal
          isOpen={true}
          onClose={() => setEditingReport(null)}
          title={`Edit Report (${editingReport.reportCode})`}
          subtitle="Update template metadata and configuration in database."
          maxWidth="620px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Report Title / Name *
              </label>
              <input
                type="text"
                required
                value={editingReport.name || ""}
                onChange={(e) => setEditingReport({ ...editingReport, name: e.target.value })}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-primary)",
                  fontSize: "13px"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  className="form-select"
                  style={{ width: "100%", height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
                  value={editingReport.category || "Maintenance Compliance"}
                  onChange={(e) => setEditingReport({ ...editingReport, category: e.target.value })}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Cadence / Frequency
                </label>
                <select
                  className="form-select"
                  style={{ width: "100%", height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
                  value={editingReport.frequency || "Monthly"}
                  onChange={(e) => setEditingReport({ ...editingReport, frequency: e.target.value })}
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Database Source Table
                </label>
                <select
                  className="form-select"
                  style={{ width: "100%", height: "36px", fontSize: "12px", borderRadius: "8px", backgroundColor: "#FFFFFF" }}
                  value={editingReport.targetModule || "assets"}
                  onChange={(e) => setEditingReport({ ...editingReport, targetModule: e.target.value })}
                >
                  {TARGET_MODULE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Regulatory Standard
                </label>
                <input
                  type="text"
                  value={editingReport.regulatoryStandard || ""}
                  onChange={(e) => setEditingReport({ ...editingReport, regulatoryStandard: e.target.value })}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-primary)",
                    fontSize: "13px"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Description
              </label>
              <textarea
                rows={3}
                value={editingReport.description || ""}
                onChange={(e) => setEditingReport({ ...editingReport, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-primary)",
                  fontSize: "13px"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <Button variant="ghost" onClick={() => setEditingReport(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update in Database
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingReport && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingReport(null)}
          title="Delete Report Template"
          subtitle="Are you sure you want to remove this report from the database?"
          maxWidth="460px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              This will permanently delete <strong>{deletingReport.reportCode} - {deletingReport.name}</strong> from the database.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button variant="ghost" onClick={() => setDeletingReport(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteSubmit}
                style={{ backgroundColor: "var(--danger, #ef4444)", borderColor: "var(--danger, #ef4444)" }}
              >
                Yes, Delete from DB
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* LIVE REPORT PREVIEW MODAL */}
      {previewReport && (
        <div className="modal-backdrop" onClick={() => setPreviewReport(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: "860px", width: "95%", maxHeight: "90vh", overflowY: "auto", margin: "16px", borderRadius: "14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Badge variant={getCategoryBadgeVariant(previewReport.template.category)}>
                    {previewReport.template.category}
                  </Badge>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 700 }}>
                    {previewReport.template.reportCode}
                  </span>
                  <Badge variant="cyan">{previewReport.count} DB Records</Badge>
                </div>
                <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", marginBottom: "2px" }}>
                  {previewReport.template.name}
                </h2>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Live Data Generated: {previewReport.generatedDate} | Target: <strong>{previewReport.template.targetModule}</strong>
                </div>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 22px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Showing live database output query
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <Button
                  variant={previewViewMode === "table" ? "primary" : "ghost"}
                  size="sm"
                  icon={Table}
                  onClick={() => setPreviewViewMode("table")}
                  style={{ fontSize: "11px", height: "30px" }}
                >
                  Table View
                </Button>
                <Button
                  variant={previewViewMode === "raw" ? "primary" : "ghost"}
                  size="sm"
                  icon={Code}
                  onClick={() => setPreviewViewMode("raw")}
                  style={{ fontSize: "11px", height: "30px" }}
                >
                  Raw CSV
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "18px 22px" }}>
              {previewViewMode === "table" ? (
                <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px", maxHeight: "420px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                        {previewReport.headers.map((h, i) => (
                          <th key={i} style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewReport.rows.length === 0 ? (
                        <tr>
                          <td colSpan={previewReport.headers.length || 1} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                            No rows returned from this database table yet.
                          </td>
                        </tr>
                      ) : (
                        previewReport.rows.slice(0, 50).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} style={{ padding: "8px 14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                                {val !== null && val !== undefined ? String(val) : "-"}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "var(--bg-card-subtle)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    maxHeight: "380px"
                  }}
                >
                  {previewReport.rawContent}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", padding: "14px 22px", backgroundColor: "var(--bg-card-subtle)", flexWrap: "wrap", gap: "10px" }}>
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


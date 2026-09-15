import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Server,
  Activity,
  CheckCircle2,
  Database,
  Users,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  FileText
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { AreaChart } from "../../../components/charts/AreaChart";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function SystemReportsPage() {
  const { addToast } = useApp();

  const [reports, setReports] = useState({
    uptime: "99.98%",
    uptimeStatus: "Availability",
    uptimeTarget: "Exceeds 99.9% target",
    dbStorage: "31 MB",
    dbStorageLimit: "50 GB",
    dbStorageUtilization: "0.1% capacity utilized",
    apiLatencyMs: 22,
    apiLatencyP99: "45 ms",
    seatLicensesUsed: 13,
    seatLicensesTotal: 100,
    seatLicensesAvailable: 87,
    tenantTier: "ENTERPRISE TIER ACTIVE",
    resourceUtilization: [
      { label: "Mar", value: 24 },
      { label: "Apr", value: 26 },
      { label: "May", value: 28 },
      { label: "Jun", value: 31 },
      { label: "Jul", value: 29 },
      { label: "Aug", value: 28.4 }
    ],
    edgeTelemetryHealth: "99.99% HEALTH",
    edgeLatency: "1.4 ms",
    pgStorageHealth: "HEALTHY",
    pgCapacityHeadroom: "78% Free",
    totalAuditEvents: 0,
    reports: []
  });

  const [savedReports, setSavedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const [viewingReport, setViewingReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [deletingReport, setDeletingReport] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newReport, setNewReport] = useState({
    title: "Quarterly Infrastructure Health & SLA Audit",
    uptime: "99.98%",
    dbStorage: "31 MB",
    apiLatency: "22 ms",
    licensesUsed: 13,
    licensesTotal: 100,
    tier: "ENTERPRISE TIER ACTIVE",
    edgeHealth: "99.99% HEALTH",
    status: "PUBLISHED"
  });

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getSystemReports();
      if (data && typeof data === "object") {
        setReports((prev) => ({ ...prev, ...data }));
        if (Array.isArray(data.reports)) {
          setSavedReports(data.reports);
        }
      }
    } catch (err) {
      console.warn("System reports DB load error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await adminService.exportSystemReport();
      const reportData = res?.data || reports;

      const csvContent = [
        ["Report Title", "System Governance & Infrastructure Executive Report"],
        ["Generated Timestamp", new Date().toISOString()],
        ["Platform Instance SLA", reportData.uptime],
        ["PostgreSQL Database Size", reportData.dbStorage],
        ["Database Storage Limit", reportData.dbStorageLimit],
        ["Storage Utilization", reportData.dbStorageUtilization],
        ["API Gateway Latency (Current)", `${reportData.apiLatencyMs} ms`],
        ["API Gateway Latency (P99)", reportData.apiLatencyP99],
        ["Active Seat Licenses", `${reportData.seatLicensesUsed} / ${reportData.seatLicensesTotal}`],
        ["Available Licenses", reportData.seatLicensesAvailable],
        ["Subscription Tier", reportData.tenantTier],
        ["Edge Telemetry Cluster Status", reportData.edgeTelemetryHealth],
        ["Edge Telemetry Buffer Latency", reportData.edgeLatency],
        ["PostgreSQL IOPS Headroom", reportData.pgCapacityHeadroom]
      ].map((row) => row.map((val) => `"${val}"`).join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `MaintenX_Executive_System_Report_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast("Comprehensive System Health & Compliance Report exported & recorded in DB!", "success");
      fetchReports();
    } catch (err) {
      console.error(err);
      addToast(`Report export error: ${err.message}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsActioning(true);
      await adminService.createSystemReport({
        ...newReport,
        uptime: reports.uptime || "99.98%",
        dbStorage: reports.dbStorage || "31 MB",
        apiLatency: `${reports.apiLatencyMs || 22} ms`,
        licensesUsed: reports.seatLicensesUsed || 13,
        licensesTotal: reports.seatLicensesTotal || 100
      });
      addToast("New Governance Report Snapshot created and saved to database!", "success");
      setIsAddModalOpen(false);
      setNewReport({
        title: "Monthly Infrastructure Health & SLA Audit",
        uptime: "99.98%",
        dbStorage: "31 MB",
        apiLatency: "22 ms",
        licensesUsed: 13,
        licensesTotal: 100,
        tier: "ENTERPRISE TIER ACTIVE",
        edgeHealth: "99.99% HEALTH",
        status: "PUBLISHED"
      });
      fetchReports();
    } catch (err) {
      console.error(err);
      addToast(`Create report error: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSaveEditReport = async (e) => {
    e.preventDefault();
    if (!editingReport) return;
    try {
      setIsActioning(true);
      await adminService.updateSystemReport(editingReport.id, editingReport);
      addToast(`Report ${editingReport.id} successfully updated in database!`, "success");
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      console.error(err);
      addToast(`Update report error: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReport) return;
    try {
      setIsActioning(true);
      await adminService.deleteSystemReport(deletingReport.id);
      addToast(`Report ${deletingReport.id} permanently deleted from database!`, "success");
      setDeletingReport(null);
      fetchReports();
    } catch (err) {
      console.error(err);
      addToast(`Delete report error: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              System Governance & Infrastructure Reports
            </h1>
            <Badge variant="emerald">{reports.tenantTier}</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            disabled={isLoading}
            onClick={fetchReports}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isLoading ? "Refreshing..." : "Refresh DB Metrics"}
          </Button>

          <Button
            variant="secondary"
            icon={Plus}
            disabled={isLoading}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Create Report Snapshot
          </Button>

          <Button
            variant="primary"
            icon={Download}
            disabled={isExporting}
            onClick={handleExport}
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            {isExporting ? "Exporting..." : "Export Executive Report"}
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 cards */}
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
          title="Platform Uptime (SLA)"
          value={reports.uptime}
          unit={reports.uptimeStatus}
          trend={{ value: reports.uptimeTarget, isPositive: true, text: "" }}
          icon={Server}
          colorVariant="emerald"
        />
        <StatCard
          title="Database Storage"
          value={reports.dbStorage}
          unit={`/ ${reports.dbStorageLimit}`}
          trend={{ value: reports.dbStorageUtilization, isPositive: true, text: "" }}
          icon={Database}
          colorVariant="amber"
        />
        <StatCard
          title="API Gateway Latency"
          value={`${reports.apiLatencyMs} ms`}
          unit={`p99: ${reports.apiLatencyP99}`}
          trend={{ value: "Sub-millisecond query speed", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Seat License Usage"
          value={`${reports.seatLicensesUsed} / ${reports.seatLicensesTotal}`}
          unit="Named Users"
          trend={{ value: `${reports.seatLicensesAvailable} licenses available`, isPositive: true, text: "" }}
          icon={Users}
          colorVariant="emerald"
        />
      </div>

      {/* Latency Curve */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Monthly Infrastructure Resource Utilization (%)
          </h3>
          <Badge variant="emerald">OPTIMAL LOAD</Badge>
        </div>

        <AreaChart
          data={reports.resourceUtilization}
          height={200}
          color="#8C5B23"
          unit="%"
        />
      </Card>

      {/* Subsystem Health Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", width: "100%" }}>
        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={16} color="#8C5B23" />
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Edge Telemetry Cluster</strong>
            </div>
            <Badge variant="emerald">{reports.edgeTelemetryHealth}</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
            <span>Buffer Ingest Latency</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{reports.edgeLatency}</span>
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Database size={16} color="#8C5B23" />
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>PostgreSQL Storage Engine</strong>
            </div>
            <Badge variant="emerald">{reports.pgStorageHealth}</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
            <span>IOPS Capacity Headroom</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{reports.pgCapacityHeadroom}</span>
          </div>
        </Card>
      </div>

      {/* Executive Governance Reports & Audit Ledger Table */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          padding: "20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} color="#C89547" />
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Executive Governance Reports & Audit Ledger (21 CFR Part 11)
            </h2>
          </div>
          <Badge variant="cyan">{savedReports.length} REPORTS IN DATABASE</Badge>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Report ID & Title</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Platform SLA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>DB Storage</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>API Latency</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Seat Usage</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No system reports found in database. Click "+ Create Report Snapshot" or "Export Executive Report" to log one.
                  </td>
                </tr>
              ) : (
                savedReports.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23", fontSize: "12px" }}>
                        {r.id}
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                        {r.title}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700, fontSize: "13px" }}>
                      {r.uptime}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: "13px" }}>
                      {r.dbStorage}
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      {r.apiLatency}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                      {r.licensesUsed} / {r.licensesTotal}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={r.status === "PUBLISHED" ? "emerald" : r.status === "AUDITED" ? "cyan" : "amber"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {/* View Button */}
                        <button
                          onClick={() => setViewingReport(r)}
                          title="View Report Details"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingReport({ ...r })}
                          title="Edit Report"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#D97706",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingReport(r)}
                          title="Delete Report"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#EF4444",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Report Modal */}
      {viewingReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Report Details: {viewingReport.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Title:</span>
                <span style={{ fontWeight: 700 }}>{viewingReport.title}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Platform SLA:</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>{viewingReport.uptime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>PostgreSQL DB Storage:</span>
                <span style={{ fontWeight: 700 }}>{viewingReport.dbStorage}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>API Gateway Latency:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{viewingReport.apiLatency}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Seat Licenses:</span>
                <span style={{ fontWeight: 700 }}>{viewingReport.licensesUsed} / {viewingReport.licensesTotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                <Badge variant={viewingReport.status === "PUBLISHED" ? "emerald" : "cyan"}>{viewingReport.status}</Badge>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingReport(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {editingReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit System Report ({editingReport.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Report Title
                </label>
                <input
                  type="text"
                  value={editingReport.title || ""}
                  onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Platform SLA
                  </label>
                  <input
                    type="text"
                    value={editingReport.uptime || ""}
                    onChange={(e) => setEditingReport({ ...editingReport, uptime: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                    DB Storage
                  </label>
                  <input
                    type="text"
                    value={editingReport.dbStorage || ""}
                    onChange={(e) => setEditingReport({ ...editingReport, dbStorage: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={editingReport.status || "PUBLISHED"}
                  onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="AUDITED">AUDITED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingReport(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Saving..." : "Save in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Create Governance Report Snapshot
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReportSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Report Title
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="e.g. Monthly Infrastructure Health & SLA Audit"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={newReport.status}
                  onChange={(e) => setNewReport({ ...newReport, status: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="AUDITED">AUDITED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Saving..." : "Save in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Report Confirmation Modal */}
      {deletingReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "440px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete System Report
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to permanently delete report <strong>{deletingReport.id}</strong> ({deletingReport.title}) from the database?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingReport(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                disabled={isActioning}
                onClick={handleConfirmDelete}
                style={{ fontSize: "12px", padding: "7px 14px", backgroundColor: "#EF4444", color: "#fff" }}
              >
                {isActioning ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

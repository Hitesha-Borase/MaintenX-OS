import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter
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

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

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

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.cadence?.toLowerCase().includes(q) ||
        r.format?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [reports, searchQuery, categoryFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
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

        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
        className="kpi-grid-responsive grid-4 no-print"
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

      {/* Structured Reports Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Toolbar */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "190px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Categories</option>
                <option value="Loss Analytics">Loss Analytics</option>
                <option value="Quality Compliance">Quality Compliance</option>
                <option value="Continuous Improvement">Continuous Improvement</option>
                <option value="Asset Health">Asset Health</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredReports.length}</strong> of {reports.length} Executive Digests
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Report ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Report Title & Scope</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Cadence</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Format</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Generated Date</th>
                <th className="no-print" style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((rep) => {
                  return (
                    <tr
                      key={rep.id}
                      className={printingId === rep.id ? "print-only" : ""}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {rep.id}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {rep.name}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{rep.category}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {rep.cadence}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                          {rep.format}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {rep.date}
                        </span>
                      </td>

                      <td className="no-print" style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Printer}
                          onClick={() => handlePrint(rep)}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Print / Export PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No executive reports match the selected category or search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

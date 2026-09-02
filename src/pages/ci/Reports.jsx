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
  Filter,
  FileText,
  DollarSign,
  Activity,
  Layers,
  Zap,
  Gauge
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useCI } from "../../context/CIContext";
import { useApp } from "../../context/AppContext";

export function Reports() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    reliabilityRecords = [],
    investigations = [],
    capaActions = [],
    ciProjects = [],
    lossRecords = [],
    capexProjects = [],
    fleetMTBF,
    fleetMTTR,
    realizedSavingsTotal,
    projectedSavingsTotal
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportCategory, setSelectedReportCategory] = useState("ALL");

  const reports = [
    {
      id: "REP-01",
      name: "Weekly Operational Loss Waterfall & Financial Impact Digest",
      category: "Loss Analytics",
      description: "Downtime, Speed, Quality, Scrap, and Yield loss distribution with dollar impacts.",
      dataExporter: () => {
        const headers = "Loss ID,Category,Line,Asset ID,Event Name,Hours Lost,Units Lost,Financial Impact USD,Date\n";
        const rows = lossRecords
          .map((l) => `"${l.id}","${l.category}","${l.lineId}","${l.assetId}","${l.eventName}",${l.hoursLost},${l.unitsLost},${l.financialImpactUSD},"${l.date}"`)
          .join("\n");
        return headers + rows;
      }
    },
    {
      id: "REP-02",
      name: "RCA 2.0 & 8D Investigation Root Cause Audit Dossier",
      category: "Quality Compliance",
      description: "Complete 5-Why trees, validated root causes, containment, and investigation stages.",
      dataExporter: () => {
        const headers = "Investigation ID,Title,Asset ID,Asset Name,Line,Plant,Phase,Status,Severity,Lead Investigator\n";
        const rows = investigations
          .map((i) => `"${i.id}","${i.title}","${i.assetId}","${i.assetName}","${i.lineName}","${i.plantId}","${i.currentPhase}","${i.status}","${i.severity}","${i.leadInvestigator}"`)
          .join("\n");
        return headers + rows;
      }
    },
    {
      id: "REP-03",
      name: "CAPA Execution & Effectiveness Verification Ledger",
      category: "Quality Compliance",
      description: "Corrective and preventive actions lifecycle, due dates, overdue statuses, and verifications.",
      dataExporter: () => {
        const headers = "CAPA ID,RCA ID,Project ID,Description,Type,Owner,Due Date,Priority,Status,Completion Date,Verified By\n";
        const rows = capaActions
          .map((c) => `"${c.id}","${c.rcaId || "-"}","${c.projectId || "-"}","${c.description}","${c.actionType}","${c.owner}","${c.dueDate}","${c.priority}","${c.status}","${c.completionDate || "-"}","${c.verifiedBy || "-"}"`)
          .join("\n");
        return headers + rows;
      }
    },
    {
      id: "REP-04",
      name: "CI Kaizen Projects Realized vs Projected Savings Report",
      category: "Continuous Improvement",
      description: "Separation of projected annual targets vs realized YTD financial savings with GM lock audit.",
      dataExporter: () => {
        const headers = "Project ID,Project Name,Type,Owner,Projected Savings,Realized Savings,Benefit Status,Locked By,Locked At\n";
        const rows = ciProjects
          .map((p) => `"${p.id}","${p.name}","${p.type}","${p.owner}",${p.projectedSavingsAnnual},${p.realizedSavingsYTD},"${p.benefitStatus}","${p.lockedBy || "-"}","${p.lockedAt || "-"}"`)
          .join("\n");
        return headers + rows;
      }
    },
    {
      id: "REP-05",
      name: "Fleet Reliability MTBF / MTTR & Bad Actor Analysis",
      category: "Asset Health",
      description: "Asset-level MTBF, MTTR, repeat failure count threshold (>= 2) bad actors, and downtime.",
      dataExporter: () => {
        const headers = "Asset ID,Asset Name,Line,Failures (30d),MTBF (hrs),MTTR (min),Downtime (min),Is Bad Actor,Reason\n";
        const rows = reliabilityRecords
          .map((r) => `"${r.assetId}","${r.assetName}","${r.lineName}",${r.failuresCount},${r.mtbfHrs},${r.mttrMin},${r.totalDowntimeMin},${r.isBadActor ? "YES" : "NO"},"${r.badActorReason}"`)
          .join("\n");
        return headers + rows;
      }
    },
    {
      id: "REP-06",
      name: "Engineering Capex & Permanent Machine Redesign Ledger",
      category: "Engineering",
      description: "Approved capital projects, engineering justifications, P&ID dossiers, and budget utilization.",
      dataExporter: () => {
        const headers = "Capex ID,Project Name,Budget,Actual Spent,Owner,Status,Dossier Ref\n";
        const rows = capexProjects
          .map((c) => `"${c.id}","${c.name}",${c.budget},${c.actualCost},"${c.owner}","${c.status}","${c.dossierRef}"`)
          .join("\n");
        return headers + rows;
      }
    }
  ];

  const handleDownloadReport = (rep) => {
    const csvContent = rep.dataExporter();
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rep.id}_${rep.name.replace(/\s+/g, "_")}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast(`Report "${rep.name}" downloaded as CSV!`, "success");
  };

  const handlePrint = (rep) => {
    addToast(`Preparing "${rep.name}" for print / PDF generation...`, "info");
    window.print();
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesCategory = selectedReportCategory === "ALL" || r.category === selectedReportCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [reports, selectedReportCategory, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI / Engineering Reports Hub
            </h1>
            <Badge variant="cyan">{reports.length} DYNAMIC AUDIT REPORTS</Badge>
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/ci/reliability")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Reliability Hub
          </Button>
          <Button variant="primary" onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
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
          title="Fleet MTBF / MTTR"
          value={`${fleetMTBF}h / ${fleetMTTR}m`}
          unit="Current Performance"
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="Realized YTD Savings"
          value={`$${realizedSavingsTotal.toLocaleString()}`}
          unit="Audited Financial Benefit"
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Active RCAs & CAPA"
          value={`${investigations.length} RCA / ${capaActions.length} CAPA`}
          unit="In Flight"
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Data Export Engines"
          value="Live CSV & PDF"
          unit="Real-time"
          icon={FileSpreadsheet}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search report title, ID or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={selectedReportCategory}
              onChange={(e) => setSelectedReportCategory(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Report Categories</option>
              <option value="Loss Analytics">Loss Analytics</option>
              <option value="Quality Compliance">Quality & CAPA Compliance</option>
              <option value="Continuous Improvement">Continuous Improvement</option>
              <option value="Asset Health">Asset Health & Reliability</option>
              <option value="Engineering">Engineering Capex</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Report Digest Title</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Domain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Scope & Description</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Format</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{r.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={r.category.includes("Loss") ? "amber" : r.category.includes("Quality") ? "cyan" : "emerald"}>
                      {r.category}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {r.description}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                    Live CSV / PDF
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => handleDownloadReport(r)}
                        title="Download CSV Dataset"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={() => handlePrint(r)}
                        title="Print / Generate PDF"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#8C5B23",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Printer size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

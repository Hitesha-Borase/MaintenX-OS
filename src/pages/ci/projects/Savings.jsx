import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Download,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Award,
  Search,
  Filter
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Savings() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [projects] = useState([
    {
      id: "CI-001",
      title: "OEE Improvement — Line 1 Filler",
      projected: "$42,000",
      actual: "$38,200",
      progress: 91,
      verified: false
    },
    {
      id: "CI-002",
      title: "CIP Cycle Time Reduction",
      projected: "$18,000",
      actual: "$14,800",
      progress: 82,
      verified: false
    },
    {
      id: "CI-003",
      title: "Label Application Defect Elimination",
      projected: "$11,200",
      actual: "$11,200",
      progress: 100,
      verified: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const handleExportCSV = () => {
    const headers = "Project ID,Project Title,Projected Savings,Actual Realized,Realization %,Benefits Verified\n";
    const rows = projects
      .map((p) => `"${p.id}","${p.title}","${p.projected}","${p.actual}",${p.progress},"${p.verified ? 'Yes' : 'No'}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Savings_Audit_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CI Savings Audit exported to CSV.", "info");
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesVerification =
        filterStatus === "ALL" ||
        (filterStatus === "VERIFIED" && p.verified) ||
        (filterStatus === "PENDING" && !p.verified);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.projected?.toLowerCase().includes(q) ||
        p.actual?.toLowerCase().includes(q);

      return matchesVerification && matchesSearch;
    });
  }, [projects, searchQuery, filterStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI Project Savings Tracker
            </h1>
            <Badge variant="emerald">$64,200 REALIZED YTD</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Projects
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/projects/benefits")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Benefits Verification
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
          title="YTD Projected Savings"
          value="$71,200"
          unit="Target"
          trend={{ value: "Across 3 active Kaizen events", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="cyan"
        />
        <StatCard
          title="YTD Actual Realized"
          value="$64,200"
          unit="Cash Value"
          trend={{ value: "90.1% realization velocity", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Formally Verified"
          value="$11,200"
          unit="Locked"
          trend={{ value: "Finance & QA audit signed", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="amber"
        />
        <StatCard
          title="Return on Investment"
          value="4.8x"
          unit="ROI"
          trend={{ value: "Direct cost benefit ratio", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
      </div>

      {/* Savings Breakdown Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "170px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Audit Statuses</option>
                <option value="VERIFIED">Verified Benefits</option>
                <option value="PENDING">Pending Audit</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredProjects.length}</strong> of {projects.length} Projects Audited
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project Title & Scope</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Projected Target</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Realized Savings</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", width: "170px" }}>Capture Rate</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Audit Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {p.id}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {p.title}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23" }}>
                          {p.projected}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>
                          {p.actual}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                            <div
                              style={{
                                width: `${p.progress}%`,
                                height: "100%",
                                background: p.verified
                                  ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                                  : "linear-gradient(90deg, #E2B670 0%, #C89547 100%)",
                                borderRadius: "3px"
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", minWidth: "32px" }}>
                            {p.progress}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        {p.verified ? (
                          <Badge variant="emerald">✓ BENEFITS VERIFIED</Badge>
                        ) : (
                          <Badge variant="amber">⏳ PENDING AUDIT</Badge>
                        )}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => navigate("/ci/projects/benefits")}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Verify Benefits
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No savings records match the search or filter criteria.
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

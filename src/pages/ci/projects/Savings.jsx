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
  Filter,
  ShieldCheck,
  Target,
  Clock,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function Savings() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    ciProjects = [],
    realizedSavingsTotal,
    projectedSavingsTotal
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const realizationRate = useMemo(() => {
    if (!projectedSavingsTotal) return 0;
    return Math.round((realizedSavingsTotal / projectedSavingsTotal) * 100);
  }, [realizedSavingsTotal, projectedSavingsTotal]);

  const handleExportCSV = () => {
    const headers = "Project ID,Project Name,Owner,Projected Annual Savings,Realized YTD Savings,Realization %,Benefit Status\n";
    const rows = filteredProjects
      .map((p) => `"${p.id}","${p.name}","${p.owner}",${p.projectedSavingsAnnual},${p.realizedSavingsYTD},"${Math.round(((p.realizedSavingsYTD || 0) / (p.projectedSavingsAnnual || 1)) * 100)}%","${p.benefitStatus}"`)
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
    return ciProjects.filter((p) => {
      const matchesVerification =
        filterStatus === "ALL" ||
        (filterStatus === "VERIFIED" && p.benefitStatus === "Verified & Locked") ||
        (filterStatus === "PENDING" && p.benefitStatus !== "Verified & Locked");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.owner?.toLowerCase().includes(q);

      return matchesVerification && matchesSearch;
    });
  }, [ciProjects, searchQuery, filterStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI Project Savings & Financial Benefits Tracker
            </h1>
            <Badge variant="emerald">${realizedSavingsTotal.toLocaleString()} REALIZED YTD</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Savings CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/benefits")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Benefits Verification
          </Button>
          <Button variant="primary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            View All Projects
          </Button>
        </div>
      </div>

      {/* KPI Tickers - Strict separation of Projected vs Realized */}
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
          title="Realized YTD Benefit"
          value={`$${realizedSavingsTotal.toLocaleString()}`}
          unit="Audited & Realized"
          trend={{ value: "Actual financial benefit", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Projected Annual Target"
          value={`$${projectedSavingsTotal.toLocaleString()}`}
          unit="Expected Commitment"
          trend={{ value: "Targeted full-year ROI", isPositive: true, text: "" }}
          icon={Target}
          colorVariant="cyan"
        />
        <StatCard
          title="Benefit Realization Rate"
          value={`${realizationRate}%`}
          unit="Pacing vs Target"
          trend={{ value: "On schedule", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Certified Locked Projects"
          value={ciProjects.filter((p) => p.benefitStatus === "Verified & Locked").length.toString()}
          unit="21 CFR Certified"
          trend={{ value: "Audit compliant", isPositive: true, text: "" }}
          icon={ShieldCheck}
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
              placeholder="Search project savings by title, owner or ID..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Savings Categories</option>
              <option value="VERIFIED">Verified & Locked Only</option>
              <option value="PENDING">Pending Verification Only</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CI Project Initiative</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Projected Annual Target</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Realized YTD Savings</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Realization %</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Benefits Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const pct = Math.round(((p.realizedSavingsYTD || 0) / (p.projectedSavingsAnnual || 1)) * 100);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.id} • {p.owner}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-secondary)", fontSize: "13px" }}>
                      ${p.projectedSavingsAnnual?.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", fontSize: "13px" }}>
                      ${p.realizedSavingsYTD?.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "6px", backgroundColor: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", backgroundColor: pct >= 80 ? "#059669" : "#D97706" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: pct >= 80 ? "#059669" : "#D97706" }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={p.benefitStatus === "Verified & Locked" ? "emerald" : p.benefitStatus === "Pending Verification" ? "amber" : "gray"}>
                        {p.benefitStatus}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => navigate("/ci/projects/benefits")}
                        title="View Benefits Verification Dossier"
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
                        <ShieldCheck size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

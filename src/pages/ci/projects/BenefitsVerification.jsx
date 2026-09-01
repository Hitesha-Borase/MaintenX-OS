import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Clock,
  Check,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function BenefitsVerification() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [verifications, setVerifications] = useState([
    {
      id: "CI-001",
      title: "OEE Improvement — Line 1 Filler Nozzle Calibration",
      savings: "$38,200",
      criteria: "OEE increase ≥ 2% sustained continuously over 30 production shifts post-calibration",
      evidence: "SCADA weekly runtime audit confirms 93.8% availability (was 90.4%).",
      status: "Pending"
    },
    {
      id: "CI-003",
      title: "Label Application Defect Elimination & Vision Cognex Upgrade",
      savings: "$11,200",
      criteria: "Label defect rate < 0.1% for 60 consecutive days",
      evidence: "QA pull check data certifies 0 defect alarms in 60-day audit cycle.",
      status: "Verified"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleVerify = (id) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Verified" } : v))
    );
    addToast(`CI Project ${id} financial benefits formally verified and locked into ERP!`, "success");
  };

  const handleExportCSV = () => {
    const headers = "Project ID,Title,Validated Savings,Verification Criteria,Audit Evidence,Status\n";
    const rows = verifications
      .map((v) => `"${v.id}","${v.title}","${v.savings}","${v.criteria}","${v.evidence}","${v.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Benefits_Verification_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Benefits verification dossier exported to CSV.", "info");
  };

  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.id?.toLowerCase().includes(q) ||
        v.title?.toLowerCase().includes(q) ||
        v.savings?.toLowerCase().includes(q) ||
        v.criteria?.toLowerCase().includes(q) ||
        v.evidence?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [verifications, searchQuery, statusFilter]);

  const verifiedCount = verifications.filter((v) => v.status === "Verified").length;
  const pendingCount = verifications.filter((v) => v.status === "Pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Benefits Verification
            </h1>
            <Badge variant="emerald">FINANCIAL AUDIT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Engineering Standards
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Verified Benefits"
          value="$11,200"
          unit="Locked"
          trend={{ value: "Formally validated cash savings", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Pending Trial Audits"
          value={pendingCount.toString()}
          unit="In Review"
          trend={{ value: "30-day statistical trial run", isPositive: pendingCount === 0, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Sustained Run-Rate"
          value="100%"
          unit="Integrity"
          trend={{ value: "Zero benefit erosion post-lock", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Sign-Off SLA"
          value="ISO 50001"
          unit="Compliant"
          trend={{ value: "Continuous improvement standards", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Structured Benefits Table Card */}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "150px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending Audit</option>
                <option value="Verified">Verified & Locked</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredVerifications.length}</strong> of {verifications.length} Audit Records
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Project Title & Scope</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Savings Amount</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Validation Criteria</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Empirical Audit Evidence</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVerifications.length > 0 ? (
                filteredVerifications.map((v) => {
                  const isVerified = v.status === "Verified";
                  return (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {v.id}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {v.title}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>
                          {v.savings}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                          {v.criteria}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "12px", color: isVerified ? "#059669" : "var(--text-primary)", fontWeight: isVerified ? 600 : 500, lineHeight: 1.4 }}>
                          {v.evidence}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Badge variant={isVerified ? "emerald" : "amber"}>{v.status}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        {!isVerified ? (
                          <button
                            onClick={() => handleVerify(v.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "7px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                              color: "#261603",
                              border: "1px solid #E8C182",
                              boxShadow: "0 2px 5px rgba(178, 126, 51, 0.22)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            <Check size={13} /> Verify & Lock
                          </button>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#059669", fontWeight: 700, fontSize: "12px" }}>
                            <CheckCircle2 size={15} /> Validated & Signed
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No benefit audit records match the selected filter.
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

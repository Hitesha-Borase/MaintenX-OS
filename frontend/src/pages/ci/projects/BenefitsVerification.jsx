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
  Filter,
  Lock,
  Unlock,
  DollarSign,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function BenefitsVerification() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    ciProjects = [],
    verifyAndLockBenefit,
    unlockBenefit,
    pendingBenefitsCount,
    realizedSavingsTotal
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [unlockingProjectId, setUnlockingProjectId] = useState(null);
  const [unlockReason, setUnlockReason] = useState("");

  const handleVerify = (id) => {
    verifyAndLockBenefit(id);
  };

  const handleConfirmUnlock = (e) => {
    e.preventDefault();
    if (!unlockReason.trim()) {
      addToast("Please provide an engineering justification reason.", "warning");
      return;
    }
    unlockBenefit(unlockingProjectId, unlockReason);
    setUnlockingProjectId(null);
    setUnlockReason("");
  };

  const handleExportCSV = () => {
    const headers = "Project ID,Project Name,Target Metric,Realized Savings YTD,Benefit Status,Locked By,Locked Timestamp\n";
    const rows = filteredProjects
      .map((p) => `"${p.id}","${p.name}","${p.targetMetric}",${p.realizedSavingsYTD},"${p.benefitStatus}","${p.lockedBy || "-"}","${p.lockedAt || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Benefits_Verification_Ledger_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Benefits verification dossier exported to CSV.", "info");
  };

  const filteredProjects = useMemo(() => {
    return ciProjects.filter((p) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "LOCKED" ? p.benefitStatus === "Verified & Locked" : p.benefitStatus !== "Verified & Locked");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.owner?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [ciProjects, statusFilter, searchQuery]);

  const verifiedCount = ciProjects.filter((p) => p.benefitStatus === "Verified & Locked").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Benefits Verification & GM Lock Ledger
            </h1>
            <Badge variant="emerald">21 CFR PART 11 FINANCIAL AUDIT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/savings")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Savings Tracker
          </Button>
          <Button variant="primary" onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Standards Library
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
          title="Verified & Locked"
          value={verifiedCount.toString()}
          unit="Certified Projects"
          icon={Lock}
          colorVariant="emerald"
        />
        <StatCard
          title="Pending GM Review"
          value={pendingBenefitsCount.toString()}
          unit="Awaiting Lock"
          icon={Clock}
          colorVariant={pendingBenefitsCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Locked Realized Benefit"
          value={`$${realizedSavingsTotal.toLocaleString()}`}
          unit="Verified YTD"
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Audit Trail Status"
          value="Certified"
          unit="Immutable"
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
              placeholder="Search project title, ID or owner..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Benefit Statuses</option>
              <option value="LOCKED">Verified & Locked Only</option>
              <option value="PENDING">Pending Verification Only</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CI Project</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Metric Criteria</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Realized Savings</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Verification Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Verifier & Timestamp</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const isLocked = p.benefitStatus === "Verified & Locked";
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.id} • {p.owner}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div>{p.targetMetric}</div>
                      <div style={{ fontSize: "11px", color: "#059669" }}>Current: {p.currentMetric}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669", fontSize: "13px" }}>
                      ${p.realizedSavingsYTD?.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={isLocked ? "emerald" : "amber"}>
                        {isLocked ? "LOCKED & VERIFIED" : p.benefitStatus?.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {isLocked ? (
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.lockedBy}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.lockedAt}</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Awaiting GM Signature</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {!isLocked ? (
                          <button
                            onClick={() => handleVerify(p.id)}
                            title="Verify & Immutably Lock Benefits"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "#059669",
                              color: "#FFFFFF",
                              border: "none",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Lock size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setUnlockingProjectId(p.id)}
                            title="Unlock Benefits (Requires Engineering Justification)"
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
                            <Unlock size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* UNLOCK JUSTIFICATION MODAL */}
      {unlockingProjectId && (
        <div className="modal-backdrop" onClick={() => setUnlockingProjectId(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Unlock size={18} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Unlock Project Benefits — {unlockingProjectId}
                </h2>
              </div>
              <button onClick={() => setUnlockingProjectId(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmUnlock} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Unlocking a verified benefit will remove its certified status and record a 21 CFR Part 11 Audit Trail event.
              </div>

              <div>
                <label className="form-label">Engineering / Financial Justification Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the reason for metric recalculation or audit adjustment..."
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setUnlockingProjectId(null)}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit">
                  Confirm Unlock & Log Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

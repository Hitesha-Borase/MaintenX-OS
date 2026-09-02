import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Award,
  Check,
  Plus,
  BarChart3,
  Search,
  Filter
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function EffectivenessVerification() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { capaActions = [], updateCapaStatus } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleVerify = (id) => {
    updateCapaStatus(id, "Verified", "Effectiveness verified under 30-day production run");
    addToast(`CAPA ${id} formally verified as Effective and Certified!`, "success");
  };

  const handleExportCSV = () => {
    const headers = "Action ID,Description,Owner,Due Date,Status,Effectiveness Result,Verified By,Verified Date\n";
    const rows = filteredActions
      .map((a) => `"${a.id}","${a.description}","${a.owner}","${a.dueDate}","${a.status}","${a.effectivenessResult || "-"}","${a.verifiedBy || "-"}","${a.verifiedAt || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CAPA_Effectiveness_Audit_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CAPA effectiveness records exported to CSV.", "info");
  };

  const filteredActions = useMemo(() => {
    return capaActions.filter((a) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "VERIFIED" ? (a.status === "Verified" || a.status === "Closed") : (a.status !== "Verified" && a.status !== "Closed"));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [capaActions, statusFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CAPA — Effectiveness Verification & Audit
            </h1>
            <Badge variant="cyan">SUSTAINED IMPROVEMENT AUDIT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit Ledger
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            CI Projects
          </Button>
          <Button variant="primary" onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Codify into Standard
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
          title="Verified Effective"
          value={capaActions.filter((a) => a.status === "Verified" || a.status === "Closed").length.toString()}
          unit="Actions"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Pending Verification"
          value={capaActions.filter((a) => a.status === "Completed" || a.status === "Effectiveness Pending").length.toString()}
          unit="Under Observation"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Verification Protocol"
          value="30-Day Window"
          unit="Standard"
          icon={FileCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Repeat Prevention"
          value="100%"
          unit="Zero Recurrence"
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
              placeholder="Search action description, ID or auditor..."
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
              <option value="ALL">All Verification Stages</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VERIFIED">Verified & Certified</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CAPA Identifier</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Action Scope</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Owner</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Observed Evidence / Result</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Verification Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                    {a.id}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                    {a.description}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {a.owner}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: a.status === "Verified" ? "#059669" : "var(--text-secondary)", fontWeight: 600 }}>
                    {a.effectivenessResult || a.evidenceNotes || "Awaiting sustained observation trial"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={a.status === "Verified" || a.status === "Closed" ? "emerald" : "amber"}>
                      {a.status === "Verified" || a.status === "Closed" ? "EFFECTIVE" : "OBSERVATION"}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {a.status !== "Verified" && a.status !== "Closed" ? (
                      <button
                        onClick={() => handleVerify(a.id)}
                        title="Certify & Verify Effectiveness"
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
                        <CheckCircle2 size={14} />
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>Certified</span>
                    )}
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

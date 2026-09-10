import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle,
  AlertOctagon,
  SearchCode,
  ClipboardCheck,
  Activity,
  Play,
  RefreshCw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import qualityService from "../../services/qualityService";

export function QualityDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    pendingChecks: 2,
    failedChecks: 0,
    activeHolds: 1,
    openDeviations: 1,
    pendingReleases: 1,
    openInvestigations: 1,
    lastCcpCheck: "14:00 (PASSED)",
    line1PreOp: "PASSED"
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getQualityDashboard();
      const data = res.data?.data || res.data;
      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.warn("Quality dashboard fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Quality Assurance Control Center
        </h1>
        <button
          onClick={fetchSummary}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "var(--bg-secondary, #f4f4f5)",
            border: "1px solid var(--border-color, #e4e4e7)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary, #52525b)",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI Stats - 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4">
        <div onClick={() => navigate("/quality/checks/product")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Pending Quality Checks"
            value={summary.pendingChecks}
            description={summary.failedChecks > 0 ? `${summary.failedChecks} Failed Checks` : "All clear"}
            icon={ClipboardCheck}
            color={summary.failedChecks > 0 ? "#EF4444" : "#C89547"}
          />
        </div>
        
        <div onClick={() => navigate("/quality/events/holds")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Active QA Holds"
            value={summary.activeHolds}
            description="Pending Disposition"
            icon={AlertOctagon}
            color={summary.activeHolds > 0 ? "#EF4444" : "#B27E33"}
          />
        </div>

        <div onClick={() => navigate("/quality/events/deviations")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Open Deviations"
            value={summary.openDeviations}
            description={`${summary.openInvestigations} active investigations`}
            icon={SearchCode}
            color={summary.openDeviations > 0 ? "#B27E33" : "#C89547"}
          />
        </div>

        <div onClick={() => navigate("/quality/release/queue")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Pending QA Release"
            value={summary.pendingReleases}
            description="Batches awaiting review"
            icon={ShieldCheck}
            color="#C89547"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Play} onClick={() => navigate("/quality/checks/product")}>
            Start Quality Check
          </Button>
          <Button variant="secondary" icon={Activity} onClick={() => navigate("/quality/checks/ccp")}>
            Record CCP Check
          </Button>
          <Button variant="secondary" icon={CheckCircle} onClick={() => navigate("/quality/sanitation/preop")}>
            Start Pre-Op
          </Button>
          <Button variant="outline" icon={AlertOctagon} onClick={() => navigate("/quality/events/holds")}>
            Create Quality Hold
          </Button>
          <Button variant="outline" icon={SearchCode} onClick={() => navigate("/quality/events/deviations")}>
            Report Deviation
          </Button>
          <Button variant="primary" icon={ShieldCheck} onClick={() => navigate("/quality/release/queue")}>
            Review QA Release
          </Button>
        </div>
      </div>

      {/* Operational Modules */}
      <div className="grid-3">
        {/* Pre-Op & Sanitation Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Pre-Op & Clean Readiness
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Line 1 Pre-Op:</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8B6914", backgroundColor: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
                {summary.line1PreOp}
              </span>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/sanitation/preop")}>
            Inspect Readiness
          </Button>
        </Card>

        {/* Quality Checks & CCP Status */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            CCP & Process Checks
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ color: "var(--text-secondary)" }}>Last check: <strong style={{ color: "var(--text-primary)" }}>{summary.lastCcpCheck}</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/checks/ccp")}>
            Inspect CCP Logs
          </Button>
        </Card>
      </div>
    </div>
  );
}



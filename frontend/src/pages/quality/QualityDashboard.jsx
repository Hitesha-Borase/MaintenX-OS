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
  RefreshCw,
  Package,
  Clock
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import qualityService from "../../services/qualityService";

export function QualityDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pendingBatches, setPendingBatches] = useState([]);
  const [summary, setSummary] = useState({
    pendingChecks: 0,
    failedChecks: 0,
    activeHolds: 0,
    openDeviations: 0,
    pendingReleases: 0,
    openInvestigations: 0,
    lastCcpCheck: "—",
    line1PreOp: "NOT STARTED"
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getQualityDashboard();
      const data = res?.data !== undefined ? (res.data?.data !== undefined ? res.data.data : res.data) : res;
      if (data && typeof data === "object") {
        setSummary(prev => ({ ...prev, ...data }));
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn("Quality dashboard fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReleaseQueue = async () => {
    try {
      const res = await qualityService.getReleaseQueue();
      const data = res?.data?.data ?? res?.data ?? res;
      if (Array.isArray(data)) {
        setPendingBatches(data.slice(0, 5));
      }
    } catch (err) {
      console.warn("Could not load release queue:", err.message);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchPendingReleaseQueue();
  }, []);

  const getPreOpBadgeStyle = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PASSED" || s === "READY")
      return { color: "#059669", backgroundColor: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)" };
    if (s === "FAILED" || s === "FAIL")
      return { color: "#DC2626", backgroundColor: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)" };
    return { color: "#8B6914", backgroundColor: "rgba(200,149,71,0.15)", border: "1px solid rgba(200,149,71,0.3)" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Quality Assurance Control Center
          </h1>
          {lastUpdated && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
              <Clock size={11} />
              Live data — Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          onClick={() => { fetchSummary(); fetchPendingReleaseQueue(); }}
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

      {/* KPI Stats — all live from DB */}
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
            description={summary.activeHolds > 0 ? "Pending Disposition" : "No active holds"}
            icon={AlertOctagon}
            color={summary.activeHolds > 0 ? "#EF4444" : "#B27E33"}
          />
        </div>

        <div onClick={() => navigate("/quality/events/deviations")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Open Deviations"
            value={summary.openDeviations}
            description={summary.openInvestigations > 0 ? `${summary.openInvestigations} active investigations` : "0 active investigations"}
            icon={SearchCode}
            color={summary.openDeviations > 0 ? "#B27E33" : "#C89547"}
          />
        </div>

        <div onClick={() => navigate("/quality/release/queue")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Pending QA Release"
            value={summary.pendingReleases}
            description={summary.pendingReleases > 0 ? "Batches awaiting review" : "All batches reviewed"}
            icon={ShieldCheck}
            color={summary.pendingReleases > 0 ? "#C89547" : "#059669"}
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
              <span style={{
                fontSize: "11px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "6px",
                ...getPreOpBadgeStyle(summary.line1PreOp)
              }}>
                {summary.line1PreOp || "NOT STARTED"}
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
            <div style={{ color: "var(--text-secondary)" }}>
              Last check: <strong style={{ color: "var(--text-primary)" }}>{summary.lastCcpCheck}</strong>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/checks/ccp")}>
            Inspect CCP Logs
          </Button>
        </Card>

        {/* Pending QA Release Queue — Live Batches */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Pending Release Queue
          </h3>
          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {pendingBatches.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No batches pending release
              </div>
            ) : (
              pendingBatches.map((b, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 8px", borderRadius: "6px", backgroundColor: "var(--bg-secondary)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Package size={12} color="#C89547" />
                    <span style={{ fontWeight: 700, fontFamily: "monospace" }}>
                      {b.batchNumber || b.batch || b.requestId}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "10px", fontWeight: 800, padding: "1px 6px",
                    borderRadius: "4px", color: "#8B6914",
                    backgroundColor: "rgba(200,149,71,0.15)"
                  }}>
                    {b.status || "AWAITING"}
                  </span>
                </div>
              ))
            )}
          </div>
          <Button variant="primary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/release/queue")}>
            Review Release Queue
          </Button>
        </Card>
      </div>
    </div>
  );
}



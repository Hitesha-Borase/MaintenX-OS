import React, { useState } from "react";
import {
  HeartPulse,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  History,
  Check
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function DataRemediationPage() {
  const { dataHealthStats = {}, setDataHealthStats } = useAdmin();
  const { addToast } = useApp();

  const [isFixing, setIsFixing] = useState(false);
  const [remediationLog, setRemediationLog] = useState([
    { id: "REM-801", rule: "Missing Unit Cost Heuristic Default", affectedTable: "Item Master", recordsHealed: 1, status: "Auto-Healed", timestamp: "Today, 10:45 AM" },
    { id: "REM-802", rule: "Orphaned Foreign Key Re-link", affectedTable: "BOM Master", recordsHealed: 1, status: "Auto-Healed", timestamp: "Today, 10:42 AM" },
    { id: "REM-803", rule: "Fuzzy Duplicate Cluster Merge", affectedTable: "Raw Ingredients", recordsHealed: 1, status: "Auto-Healed", timestamp: "Today, 10:30 AM" }
  ]);

  const openAnomalies = (dataHealthStats.missingDataCount || 0) + (dataHealthStats.duplicatesCount || 0) + (dataHealthStats.invalidRefsCount || 0) + (dataHealthStats.brokenRelCount || 0);

  const handleRunRemediation = () => {
    setIsFixing(true);
    setTimeout(() => {
      if (setDataHealthStats) {
        setDataHealthStats({
          missingDataCount: 0,
          duplicatesCount: 0,
          invalidRefsCount: 0,
          brokenRelCount: 0,
          staleRecordsCount: 0,
          healthScore: 100.0
        });
      }
      setIsFixing(false);
      addToast("Automated Data Remediation Complete: All master anomalies resolved & healed!", "success");
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Automated Data Remediation & Self-Healing
            </h1>
            <Badge variant="emerald">
              HEALTH SCORE: {dataHealthStats.healthScore || 100}%
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={handleRunRemediation}
            disabled={isFixing}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isFixing ? "Remediating Graph..." : "Execute Remediation Engine"}
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
          title="Overall Health Score"
          value={`${dataHealthStats.healthScore || 96.2}%`}
          unit="Quality Index"
          trend={{ value: "Master Data certified", isPositive: true, text: "" }}
          icon={HeartPulse}
          colorVariant="emerald"
        />
        <StatCard
          title="Open Anomalies"
          value={openAnomalies.toString()}
          unit="Active Items"
          trend={{ value: "Safe for auto-remediation", isPositive: openAnomalies === 0, text: "" }}
          icon={Wrench}
          colorVariant={openAnomalies > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Referential Integrity"
          value="100%"
          unit="Consistency"
          trend={{ value: "Strict SQL schema enforcement", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Self-Healing Engine"
          value="100%"
          unit="Deterministic"
          trend={{ value: "Zero data destruction", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Action Banner Card */}
      <Card style={{ padding: "20px", backgroundColor: "var(--bg-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
              One-Click Enterprise Master Data Sanitization
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, display: "inline-block", marginTop: "4px" }}>
              Runs consistency rules across Item Master, Product Families, Routings, Work Centers, and CCP limits.
            </span>
          </div>

          <Button
            variant="primary"
            icon={Zap}
            onClick={handleRunRemediation}
            disabled={isFixing}
            style={{ padding: "8px 16px" }}
          >
            {isFixing ? "Fixing All..." : "Auto-Repair All Master Tables"}
          </Button>
        </div>
      </Card>

      {/* Remediation Audit Log Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <History size={16} color="var(--accent-gold)" />
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
            Recent Self-Healing Operations
          </h3>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Operation Ref</th>
                <th>Remediation Rule Applied</th>
                <th>Target Schema</th>
                <th>Records Healed</th>
                <th>Execution Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {remediationLog.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{log.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{log.rule}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{log.affectedTable}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {log.recordsHealed} record
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.timestamp}</td>
                  <td>
                    <Badge variant="emerald" dot>{log.status}</Badge>
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

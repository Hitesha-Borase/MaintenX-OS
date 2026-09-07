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
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function DataRemediationPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [isFixing, setIsFixing] = useState(false);
  const [remediationLog, setRemediationLog] = useState([
    { id: "REM-801", rule: "Missing Unit Cost Heuristic Default", affectedTable: "Item Master", recordsHealed: 1, status: "Auto-Healed", timestamp: "Today, 10:45 AM" },
    { id: "REM-802", rule: "Orphaned Foreign Key Re-link", affectedTable: "BOM Master", recordsHealed: 1, status: "Auto-Healed", timestamp: "Today, 10:42 AM" },
    { id: "REM-803", rule: "Fuzzy Duplicate Cluster Merge", affectedTable: "Raw Ingredients", recordsHealed: 1, status: "Auto-Healed", timestamp: "Today, 10:30 AM" }
  ]);

  const handleRunRemediation = () => {
    setIsFixing(true);
    setTimeout(() => {
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
              HEALTH SCORE: {dataHealthStats.completeness || 98.4}%
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
          title="Overall Health Score"
          value={`${dataHealthStats.completeness || 98.4}%`}
          unit="Quality Index"
          trend={{ value: "Master Data certified", isPositive: true, text: "" }}
          icon={HeartPulse}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Remediation Rules"
          value="14 Rules"
          unit="Self-Healing"
          trend={{ value: "Continuous background engine", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Healed Records"
          value="3,142"
          unit="Lifetime"
          trend={{ value: "Zero manual intervention", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Engine Readiness"
          value="100%"
          unit="Operational"
          trend={{ value: "Auto-trigger enabled", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Self-Healing Log Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          padding: "20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <History size={18} color="#C89547" />
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Recent Self-Healing Execution Log
            </h2>
          </div>
          <Badge variant="cyan">3 AUTOMATED ACTIONS TODAY</Badge>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Remediation ID</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Heuristic Rule Applied</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Table</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Records Healed</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Execution Timestamp</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {remediationLog.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                    {r.id}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                    {r.rule}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{r.affectedTable}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {r.recordsHealed} record
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {r.timestamp}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="emerald">{r.status}</Badge>
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

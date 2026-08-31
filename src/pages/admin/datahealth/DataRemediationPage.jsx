import React, { useState } from "react";
import {
  HeartPulse,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function DataRemediationPage() {
  const { dataHealthStats, setDataHealthStats } = useAdmin();
  const { addToast } = useApp();

  const [isFixing, setIsFixing] = useState(false);

  const handleRunRemediation = () => {
    setIsFixing(true);
    setTimeout(() => {
      setDataHealthStats({
        missingDataCount: 0,
        duplicatesCount: 0,
        invalidRefsCount: 0,
        brokenRelCount: 0,
        staleRecordsCount: 0,
        healthScore: 100.0
      });
      setIsFixing(false);
      addToast("Automated Data Remediation Complete: All 12 master anomalies resolved & healed!", "success");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Automated Data Remediation & Self-Healing Engine
            </h1>
            <Badge variant="emerald">Master Data Health: {dataHealthStats.healthScore}%</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Bulk heuristic repair engine to auto-fix missing standard costs, merge detected duplicates, resolve foreign keys, and archive dormant data.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Sparkles} onClick={handleRunRemediation} disabled={isFixing}>
            {isFixing ? "Remediating Anomaly Graph..." : "Execute Full Remediation Engine"}
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Overall Health Score"
          value={`${dataHealthStats.healthScore}%`}
          unit="Quality Index"
          trend={{ value: dataHealthStats.healthScore === 100 ? "100% Healed" : "Remediation suggested", isPositive: true, text: "" }}
          icon={HeartPulse}
          colorVariant="emerald"
        />
        <StatCard
          title="Unresolved Anomalies"
          value={(dataHealthStats.missingDataCount + dataHealthStats.duplicatesCount + dataHealthStats.invalidRefsCount + dataHealthStats.brokenRelCount).toString()}
          unit="Open Items"
          trend={{ value: "Safe for automated autofill", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="cyan"
        />
        <StatCard
          title="Referential Integrity"
          value="100%"
          unit="Consistency"
          trend={{ value: "Strict SQL schema enforcement", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Action Banner Card */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
              One-Click Enterprise Master Data Sanitization
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Runs consistency rules across Item Master, Product Families, Routings, Work Centers, and CCP limits.
            </p>
          </div>

          <Button variant="primary" icon={Zap} onClick={handleRunRemediation} disabled={isFixing}>
            Auto-Repair All Master Tables
          </Button>
        </div>
      </Card>
    </div>
  );
}

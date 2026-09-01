import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  RotateCcw,
  SearchCode,
  ArrowRight,
  TrendingDown,
  Wrench,
  Clock,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function RepeatFailures() {
  const { repeatFailures = [] } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const getDowntime = (r) => r.totalDowntimeHours ?? r.cumulativeDowntimeHours ?? 0;
  const getCost = (r) => r.cumulativeCostUSD ?? r.totalFinancialLossUSD ?? 0;
  const getRootCause = (r) => r.rootCauseCandidate ?? r.suspectedRootCause ?? "Component mechanical wear";
  const getAction = (r) => r.actionRecommended ?? r.recommendedCountermeasure ?? "Preventive component upgrade";
  const getFailureMode = (r) => r.failureName ?? r.failureModeDescription ?? "Recurrent breakdown mode";

  const totalDowntime = repeatFailures.reduce((sum, r) => sum + getDowntime(r), 0);
  const totalCost = repeatFailures.reduce((sum, r) => sum + getCost(r), 0);

  const handleStartRCA = (assetId, failureCode) => {
    addToast(`Root Cause Analysis (RCA) initiated for repeat failure on ${assetId}!`, "success");
    navigate("/ci/rca/investigations");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Repeat Failure Tracking & Elimination
            </h1>
            <Badge variant="rose">{repeatFailures.length} RECURRING MODES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={SearchCode} onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Open RCA / 5-Why Portal
          </Button>
        </div>
      </div>

      {/* Repeat Failure Tickers Grid - 2x2 on mobile, 4 on desktop */}
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
          title="Repeat Breakdown Rate"
          value="14.8%"
          unit="of outages"
          trend={{ value: "3 Chronic Modes", isPositive: false, text: "action required" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Cumulative Downtime"
          value={`${totalDowntime > 0 ? totalDowntime.toFixed(1) : '30.5'} hrs`}
          unit="Lost Uptime"
          trend={{ value: "HT-105 & FM-001 highest loss", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Repeat Cost Impact"
          value={`$${(totalCost > 0 ? totalCost : 46800).toLocaleString()}`}
          unit="USD"
          trend={{ value: "Target: Q3 Elimination", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="CAPA Execution"
          value="85.7%"
          unit="Completed"
          trend={{ value: "6 Solutions verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Repeat Failure Alerts Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
          Identified Chronic Repeat Defect Patterns
        </h3>

        {repeatFailures.map((rep) => (
          <Card
            key={rep.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              borderLeft: "4px solid #DC2626",
              padding: "18px",
              boxSizing: "border-box"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#DC2626" }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                      {rep.assetName} ({rep.assetId})
                    </span>
                    <Badge variant="rose">{rep.failureCode}</Badge>
                    <span style={{ fontSize: "11px", color: "#DC2626", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                      {rep.occurrencesCount || 3} RECURRENCES (90 DAYS)
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {getFailureMode(rep)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartRCA(rep.assetId, rep.failureCode)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                  color: "#261603",
                  border: "1px solid #E8C182",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>Initiate 8D / 5-Why RCA</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
                padding: "12px",
                backgroundColor: "var(--bg-card-subtle)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px"
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted)" }}>Total Downtime: </span>
                <strong style={{ color: "#DC2626" }}>{getDowntime(rep)} hours</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Financial Loss: </span>
                <strong style={{ color: "#DC2626" }}>${getCost(rep).toLocaleString()} USD</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Suspected Root Cause: </span>
                <strong style={{ color: "var(--text-primary)" }}>{getRootCause(rep)}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Proposed Action: </span>
                <strong style={{ color: "#059669" }}>{getAction(rep)}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

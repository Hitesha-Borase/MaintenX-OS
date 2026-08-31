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
  ShieldAlert
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function RepeatFailures() {
  const { repeatFailures } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const handleStartRCA = (assetId, failureCode) => {
    addToast(`Root Cause Analysis (RCA) initiated for repeat failure on ${assetId}!`);
    navigate("/rca-capa");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Repeat Failure Tracking & Elimination
            </h1>
            <Badge variant="rose">Failure Recurrence Alert</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Identify persistent equipment defect patterns, repetitive breakdowns, and mandatory RCA triggers.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={SearchCode} onClick={() => navigate("/rca-capa")}>
            Open RCA / 5-Why Portal
          </Button>
        </div>
      </div>

      {/* Repeat Failure Tickers Grid */}
      <div className="grid-3">
        <StatCard
          title="Repeat Breakdown Rate"
          value="14.8%"
          unit="of outages"
          trend={{ value: "3 Chronic Modes", isPositive: false, text: "action required" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Cumulative Repeat Downtime"
          value="30.5"
          unit="hours"
          trend={{ value: "HT-105 & FM-001", isPositive: false, text: "highest loss" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Repeat Failure Cost Impact"
          value="$46,800"
          unit="USD"
          trend={{ value: "Elimination Target", isPositive: true, text: "Q3 CAPA" }}
          icon={DollarSign}
          colorVariant="rose"
        />
      </div>

      {/* Repeat Failure Alerts Cards (Requirement #23: FM-001 Bearing failure 4 occurrences -> [Start RCA]) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
          Identified Chronic Repeat Defect Patterns
        </h3>

        {repeatFailures.map((rep) => (
          <Card
            key={rep.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              borderLeft: "4px solid #EF4444",
              backgroundColor: "var(--bg-card)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {rep.assetId}: {rep.failureName}
                    </h4>
                    <Badge variant="rose">{rep.occurrencesCount} OCCURRENCES</Badge>
                    <Badge variant="cyan">{rep.failureCode}</Badge>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Asset: {rep.assetName} • Last Occurrence: {rep.lastOccurrence}
                  </p>
                </div>
              </div>

              <Button
                variant="danger"
                icon={SearchCode}
                onClick={() => handleStartRCA(rep.assetId, rep.failureCode)}
              >
                Start RCA
              </Button>
            </div>

            <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
              <div>
                <strong>Root Cause Candidate:</strong> <span style={{ color: "var(--text-secondary)" }}>{rep.rootCauseCandidate}</span>
              </div>
              <div>
                <strong>Engineering Action Recommended:</strong> <span style={{ color: "#38BDF8", fontWeight: 600 }}>{rep.actionRecommended}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <span>Total Downtime Lost: <strong style={{ color: "#EF4444" }}>{rep.totalDowntimeHours} hours</strong></span>
                <span>Cumulative Cost: <strong style={{ color: "#EF4444" }}>${rep.cumulativeCostUSD.toLocaleString()} USD</strong></span>
              </div>

              <Badge variant={rep.rcaStatus.includes("Completed") ? "emerald" : "amber"}>
                {rep.rcaStatus}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

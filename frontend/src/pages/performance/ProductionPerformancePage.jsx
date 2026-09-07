import React, { useState } from "react";
import {
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { AreaChart } from "../../components/charts/AreaChart";
import { useApp } from "../../context/AppContext";

export function ProductionPerformancePage() {
  const { addToast } = useApp();

  const changeoverData = [
    { sku: "500ml Sparkling Citrus -> 1L Tonic Water", targetMins: 30, actualMins: 24, delta: "-6m", status: "Optimal" },
    { sku: "330ml Can Energy -> 500ml PET Soda", targetMins: 45, actualMins: 42, delta: "-3m", status: "Optimal" },
    { sku: "Formulation Batch Change (Syrup Rinse)", targetMins: 20, actualMins: 18, delta: "-2m", status: "Optimal" }
  ];

  const microStops = [
    { reason: "Photoeye Dust Blinding", occurrences: 14, lostMins: 8.5 },
    { reason: "Cap Feed Jam in Chute", occurrences: 9, lostMins: 6.2 },
    { reason: "Label Web Splice Drift", occurrences: 6, lostMins: 4.1 },
    { reason: "Carton Magazine Refill Delay", occurrences: 4, lostMins: 2.8 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Production Run Speed & SMED Performance
            </h1>
            <Badge variant="cyan">Line Speed Optimization</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time speed throttling analysis, micro-stoppage frequency, and SMED changeover efficiency benchmarks.
          </p>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Nominal Speed Compliance"
          value="98.2%"
          unit="Rated Speed"
          trend={{ value: "4,200 / 4,250 BPH rated", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg SMED Changeover"
          value="24 mins"
          unit="Target: 30m"
          trend={{ value: "-6 mins ahead of benchmark", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Micro-Stops (< 5 min)"
          value="21.6 mins"
          unit="Total Shift Loss"
          trend={{ value: "33 minor occurrences", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Changeover & Micro-Stops Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* SMED Changeovers */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Recent SKU Changeovers & CIP Cleans (SMED)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Single-Minute Exchange of Die (SMED) execution times
              </p>
            </div>
            <Badge variant="emerald">100% On-Target</Badge>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Changeover Transition</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {changeoverData.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: "#FFFFFF", fontSize: "12px" }}>{c.sku}</strong>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{c.targetMins}m</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{c.actualMins}m</td>
                    <td>
                      <Badge variant="emerald">{c.delta}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Micro-Stop Root Causes */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Micro-Stoppage Frequency & Minor Losses
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Short pauses (&lt; 5 mins) automatically classified by PLC signals
              </p>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symptom / Stop Reason</th>
                  <th>Count</th>
                  <th>Total Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {microStops.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{m.reason}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#F59E0B", fontWeight: 700 }}>
                      {m.occurrences}x
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#EF4444", fontWeight: 700 }}>
                      {m.lostMins} mins
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addToast(`Triage ticket created for ${m.reason}`, "info")}
                      >
                        Triage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

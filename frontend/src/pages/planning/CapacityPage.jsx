import React, { useState } from "react";
import {
  Layers,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Gauge
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { useApp } from "../../context/AppContext";

export function CapacityPage() {
  const { addToast } = useApp();

  const linesCapacity = [
    { line: "Line 1 — Aseptic Bottling", availableHours: 120, plannedHours: 106, utilPercent: 88.3, status: "Healthy" },
    { line: "Line 2 — Formulation & Pasteurization", availableHours: 120, plannedHours: 89, utilPercent: 74.2, status: "Available" },
    { line: "Line 3 — Canning & Seamer Line", availableHours: 120, plannedHours: 110, utilPercent: 91.6, status: "Near Capacity" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Plant Line Capacity & Utilization
            </h1>
            <Badge variant="emerald">84.7% Aggregate Load</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Weekly rough-cut capacity planning (RCCP), available work hours, bottleneck workstation loading, and overtime forecasts.
          </p>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Overall Plant Capacity"
          value="84.7%"
          unit="Utilized"
          trend={{ value: "305 / 360 Available Hours", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="Highest Utilized Line"
          value="91.6%"
          unit="Line 3"
          trend={{ value: "Canning line near threshold", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Projected Overtime"
          value="4.5 hrs"
          unit="Weekend Shift"
          trend={{ value: "Sufficient buffer for planned volume", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="blue"
        />
      </div>

      {/* Capacity Breakdown Table */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Production Line Load vs Available Weekly Hours
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Production Line</th>
                <th>Available Hours</th>
                <th>Planned Hours</th>
                <th>Capacity Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {linesCapacity.map((l, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{l.line}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{l.availableHours} hrs</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{l.plannedHours} hrs</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "8px", backgroundColor: "var(--bg-surface)", borderRadius: "4px", overflow: "hidden", maxWidth: "120px" }}>
                        <div
                          style={{
                            width: `${l.utilPercent}%`,
                            height: "100%",
                            backgroundColor: l.utilPercent > 90 ? "#F59E0B" : "#10B981"
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px" }}>
                        {l.utilPercent}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={l.utilPercent > 90 ? "amber" : "emerald"}>
                      {l.status}
                    </Badge>
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

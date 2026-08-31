import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Download,
  Filter,
  BarChart2,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { BarChart } from "../../components/charts/BarChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function LabourPerformancePage() {
  const { skillsMatrix } = useCMMS();
  const { addToast } = useApp();

  const laborEfficiencyByLine = [
    { label: "Line 1 — Aseptic", value: 154 },
    { label: "Line 2 — Formulation", value: 142 },
    { label: "Line 3 — Canning", value: 168 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Labour Productivity & Skill Competency Matrix
            </h1>
            <Badge variant="emerald">154 Units / Labor Hour</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Labor productivity benchmarking, operator efficiency rates, and cross-functional machine qualification scores.
          </p>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Avg Units / Labor Hour"
          value="154"
          unit="Btl / Hr / Person"
          trend={{ value: "+4.2% vs target benchmark", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Overall Labor Efficiency"
          value="97.4%"
          unit="Productivity"
          trend={{ value: "Lean standard achieved", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Cross-Trained Operators"
          value="82%"
          unit="Multi-Skilled"
          trend={{ value: "Flexibility index high", isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
      </div>

      {/* Grid: Productivity Bar Chart & Training Matrix */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Labor Productivity Rate by Line (Units / Labor Hour)
            </h3>
            <Badge variant="cyan">Target: 145</Badge>
          </div>

          <BarChart
            data={laborEfficiencyByLine}
            height={220}
            color="#10B981"
            unit=" units/hr"
          />
        </Card>

        {/* Qualifications Matrix */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Cross-Skilling & Qualifications Matrix
            </h3>
            <Badge variant="emerald">100% Certified</Badge>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Machine Asset</th>
                  <th>Certified Operators</th>
                  <th>Lead Trainer</th>
                </tr>
              </thead>
              <tbody>
                {skillsMatrix.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: "#FFFFFF" }}>{s.machine}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", color: "#38BDF8", fontWeight: 700 }}>
                        {s.qualifiedCount} Qualified
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-secondary)" }}>{s.expertLead}</span>
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

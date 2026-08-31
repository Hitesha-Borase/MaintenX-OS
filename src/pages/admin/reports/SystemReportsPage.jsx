import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Server,
  Activity,
  CheckCircle2,
  Database,
  Users,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { AreaChart } from "../../../components/charts/AreaChart";
import { useApp } from "../../../context/AppContext";

export function SystemReportsPage() {
  const { addToast } = useApp();

  const handleExport = () => {
    addToast("Comprehensive System Health & Compliance Report generated!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              System Governance & Infrastructure Reports
            </h1>
            <Badge variant="emerald">Enterprise Tier Active</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Infrastructure availability benchmarks, database capacity growth, API telemetry, and user licensing utilization.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export Executive Report
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Platform Uptime (SLA)"
          value="99.98%"
          unit="Availability"
          trend={{ value: "Exceeds 99.9% target", isPositive: true, text: "" }}
          icon={Server}
          colorVariant="emerald"
        />
        <StatCard
          title="Database Storage"
          value="14.2 GB"
          unit="/ 50 GB"
          trend={{ value: "28.4% capacity utilized", isPositive: true, text: "" }}
          icon={Database}
          colorVariant="blue"
        />
        <StatCard
          title="API Gateway Latency"
          value="22 ms"
          unit="p99: 45ms"
          trend={{ value: "Sub-millisecond query speed", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Seat License Usage"
          value="54 / 100"
          unit="Named Users"
          trend={{ value: "46 licenses available", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="emerald"
        />
      </div>

      {/* Latency Curve */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Monthly Infrastructure Resource Utilization (%)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              CPU, RAM, and Database I/O load trajectory
            </p>
          </div>
          <Badge variant="emerald">Optimal Load</Badge>
        </div>

        <AreaChart
          data={[
            { label: "Mar", value: 24 },
            { label: "Apr", value: 26 },
            { label: "May", value: 28 },
            { label: "Jun", value: 31 },
            { label: "Jul", value: 29 },
            { label: "Aug", value: 28.4 }
          ]}
          height={200}
          color="#38BDF8"
          unit="%"
        />
      </Card>
    </div>
  );
}

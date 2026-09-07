import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Server,
  Activity,
  CheckCircle2,
  Database,
  Users,
  ShieldCheck,
  Zap,
  Layers,
  Cpu
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              System Governance & Infrastructure Reports
            </h1>
            <Badge variant="emerald">ENTERPRISE TIER ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExport} style={{ fontSize: "12px", padding: "7px 14px" }}>
            Export Executive Report
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
          colorVariant="amber"
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
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Monthly Infrastructure Resource Utilization (%)
          </h3>
          <Badge variant="emerald">OPTIMAL LOAD</Badge>
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
          color="#8C5B23"
          unit="%"
        />
      </Card>

      {/* Subsystem Health Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", width: "100%" }}>
        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={16} color="#8C5B23" />
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Edge Telemetry Cluster</strong>
            </div>
            <Badge variant="emerald">99.99% HEALTH</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
            <span>Buffer Ingest Latency</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>1.4 ms</span>
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Database size={16} color="#8C5B23" />
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>PostgreSQL Storage Engine</strong>
            </div>
            <Badge variant="emerald">HEALTHY</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
            <span>IOPS Capacity Headroom</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>78% Free</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  Sliders,
  Globe,
  Clock,
  Save,
  CheckCircle2,
  Bell,
  Layers,
  Cpu,
  Zap,
  ShieldCheck,
  Server
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function ConfigurationPage() {
  const { addToast } = useApp();

  const [config, setConfig] = useState({
    systemName: "MaintenX-OS Manufacturing Cloud",
    timezone: "America/Chicago (Central Time)",
    dateFormat: "YYYY-MM-DD",
    shiftAStart: "06:00",
    shiftBStart: "14:30",
    shiftCStart: "23:00",
    enableEdgeAIPredictions: true,
    telemetryPollSeconds: 2
  });

  const handleSave = () => {
    addToast("Global System Configuration updated and broadcast to all edge nodes!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Global System Parameters & Configuration
            </h1>
            <Badge variant="cyan">PLANT OPERATING CONSTANTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Save} onClick={handleSave} style={{ fontSize: "12px", padding: "7px 14px" }}>
            Save Global Config
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
          title="Platform Instance"
          value="Enterprise"
          unit="MaintenX-OS"
          trend={{ value: "Dedicated cloud tenant", isPositive: true, text: "" }}
          icon={Server}
          colorVariant="emerald"
        />
        <StatCard
          title="Operating Shifts"
          value="3 Shifts"
          unit="24/7 Model"
          trend={{ value: "Shift A, B & C active", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Telemetry Polling"
          value="2.0s"
          unit="Real-Time"
          trend={{ value: "Edge gateway cadence", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="amber"
        />
        <StatCard
          title="AI Edge Engine"
          value="Active"
          unit="Predictive"
          trend={{ value: "Deep learning models online", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="emerald"
        />
      </div>

      {/* Config Form */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <div>
              <label className="form-label">Platform Instance Name</label>
              <input
                type="text"
                value={config.systemName}
                onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div>
              <label className="form-label">System Timezone</label>
              <select
                className="form-select"
                value={config.timezone}
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <option value="America/Chicago (Central Time)">America/Chicago (Central Time)</option>
                <option value="America/New_York (Eastern Time)">America/New_York (Eastern Time)</option>
                <option value="America/Los_Angeles (Pacific Time)">America/Los_Angeles (Pacific Time)</option>
                <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "6px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#8C5B23", marginBottom: "10px" }}>
              Standard Shift Operating Times
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div>
                <label className="form-label">Shift A (Day) Start</label>
                <input
                  type="time"
                  value={config.shiftAStart}
                  onChange={(e) => setConfig({ ...config, shiftAStart: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Shift B (Evening) Start</label>
                <input
                  type="time"
                  value={config.shiftBStart}
                  onChange={(e) => setConfig({ ...config, shiftBStart: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Shift C (Night) Start</label>
                <input
                  type="time"
                  value={config.shiftCStart}
                  onChange={(e) => setConfig({ ...config, shiftCStart: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginTop: "8px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>Enable AI Edge Predictive Insights</strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Runs deep learning models on sensor telemetry streams</div>
            </div>
            <input
              type="checkbox"
              checked={config.enableEdgeAIPredictions}
              onChange={(e) => setConfig({ ...config, enableEdgeAIPredictions: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#8C5B23", cursor: "pointer" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

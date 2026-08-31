import React, { useState } from "react";
import {
  Sliders,
  Globe,
  Clock,
  Save,
  CheckCircle2,
  Bell,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Global System Parameters & Operational Configuration
            </h1>
            <Badge variant="cyan">Plant Operating Constants</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            System-wide environment variables, shift operating hours, timezone standards, and edge engine toggles.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Global Config
          </Button>
        </div>
      </div>

      {/* Config Form */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Platform Instance Name</label>
              <input
                type="text"
                value={config.systemName}
                onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">System Timezone</label>
              <select
                className="form-select"
                value={config.timezone}
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
              >
                <option value="America/Chicago (Central Time)">America/Chicago (Central Time)</option>
                <option value="America/New_York (Eastern Time)">America/New_York (Eastern Time)</option>
                <option value="America/Los_Angeles (Pacific Time)">America/Los_Angeles (Pacific Time)</option>
                <option value="UTC (Coordinated Universal Time)">UTC</option>
              </select>
            </div>
          </div>

          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8", marginTop: "10px" }}>Standard Shift Operating Times</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Shift A (Day) Start</label>
              <input
                type="time"
                value={config.shiftAStart}
                onChange={(e) => setConfig({ ...config, shiftAStart: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Shift B (Evening) Start</label>
              <input
                type="time"
                value={config.shiftBStart}
                onChange={(e) => setConfig({ ...config, shiftBStart: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Shift C (Night) Start</label>
              <input
                type="time"
                value={config.shiftCStart}
                onChange={(e) => setConfig({ ...config, shiftCStart: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", marginTop: "10px" }}>
            <div>
              <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Enable AI Edge Predictive Insights</strong>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Runs deep learning models on sensor telemetry streams</div>
            </div>
            <input
              type="checkbox"
              checked={config.enableEdgeAIPredictions}
              onChange={(e) => setConfig({ ...config, enableEdgeAIPredictions: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#38BDF8", cursor: "pointer" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

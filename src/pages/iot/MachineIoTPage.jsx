import React, { useState, useEffect } from "react";
import {
  Radio,
  Wifi,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Zap,
  Gauge,
  ExternalLink,
  Wrench
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function MachineIoTPage() {
  const { iotTelemetry, isLiveTelemetryStreaming, setIsLiveTelemetryStreaming, assets } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  const [selectedMachine, setSelectedMachine] = useState("FM-001");
  const [telemetryHistory, setTelemetryHistory] = useState([
    { label: "14:40:00", value: 2.0 },
    { label: "14:40:10", value: 2.1 },
    { label: "14:40:20", value: 2.3 },
    { label: "14:40:30", value: 2.2 },
    { label: "14:40:40", value: 2.1 },
    { label: "14:40:50", value: 2.4 },
    { label: "14:41:00", value: iotTelemetry.vibration || 2.1 }
  ]);

  // Push new point when telemetry updates
  useEffect(() => {
    if (isLiveTelemetryStreaming) {
      setTelemetryHistory((prev) => {
        const next = [...prev.slice(1), { label: new Date().toLocaleTimeString().substring(3, 8), value: iotTelemetry.vibration }];
        return next;
      });
    }
  }, [iotTelemetry, isLiveTelemetryStreaming]);

  const targetAsset = assets.find((a) => a.id === selectedMachine) || assets[0];

  const isVibAlert = iotTelemetry.vibration > 3.0;
  const isTempAlert = iotTelemetry.temperature > 72.0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Machine / IoT Real-Time Telemetry Hub
            </h1>
            <Badge variant={isLiveTelemetryStreaming ? "emerald" : "amber"} dot={isLiveTelemetryStreaming}>
              {isLiveTelemetryStreaming ? "Live MQTT Stream Connected" : "Stream Paused"}
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            High-frequency condition monitoring sensors, vibration spectrum, edge gateways, and automated threshold alerts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant={isLiveTelemetryStreaming ? "secondary" : "primary"}
            icon={isLiveTelemetryStreaming ? Pause : Play}
            onClick={() => {
              setIsLiveTelemetryStreaming(!isLiveTelemetryStreaming);
              addToast(isLiveTelemetryStreaming ? "Live IoT telemetry paused." : "Live IoT telemetry resumed.", "info");
            }}
          >
            {isLiveTelemetryStreaming ? "Pause Live Feed" : "Resume Live Feed"}
          </Button>

          <Button variant="primary" icon={Wrench} onClick={() => setIsQuickActionOpen(true)}>
            + Create IoT Work Order
          </Button>
        </div>
      </div>

      {/* Machine & Gateway Selector Bar */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Cpu size={20} color="#38BDF8" />
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Active Edge Node:</span>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#FFFFFF" }}>
                {targetAsset.name} ({targetAsset.id})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "240px", fontWeight: 700 }}
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
              <Wifi size={14} color="#10B981" />
              <span>Gateway: <strong style={{ color: "#FFFFFF" }}>192.168.4.101 (MQTT 1883)</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* 6 Real-Time Live Telemetry Gauges */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        
        {/* Vibration RMS */}
        <StatCard
          title="Vibration Velocity (RMS)"
          value={`${iotTelemetry.vibration} mm/s`}
          unit=""
          trend={{ value: isVibAlert ? "Threshold: 3.0 exceeded" : "Optimal (ISO Class II)", isPositive: !isVibAlert, text: "" }}
          icon={Activity}
          colorVariant={isVibAlert ? "rose" : "emerald"}
        />

        {/* Bearing Temperature */}
        <StatCard
          title="Bearing Temperature"
          value={`${iotTelemetry.temperature}°C`}
          unit=""
          trend={{ value: isTempAlert ? "Warning: > 70°C" : "Normal temperature", isPositive: !isTempAlert, text: "" }}
          icon={Gauge}
          colorVariant={isTempAlert ? "rose" : "cyan"}
        />

        {/* Hydraulic Line Pressure */}
        <StatCard
          title="Hydraulic / Air Pressure"
          value={`${iotTelemetry.pressure} bar`}
          unit=""
          trend={{ value: "Nominal setpoint 6.0 bar", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="amber"
        />

        {/* Motor Spindle RPM */}
        <StatCard
          title="Spindle Operating Speed"
          value={`${iotTelemetry.rpm} RPM`}
          unit=""
          trend={{ value: "98.8% speed stability", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="blue"
        />

        {/* Real-time Power Load */}
        <StatCard
          title="Instantaneous Power"
          value={`${iotTelemetry.powerKW} kW`}
          unit=""
          trend={{ value: "480V 3-Phase balanced", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="emerald"
        />

        {/* Mass Flow Rate */}
        <StatCard
          title="Coriolis Mass Flow"
          value={`${iotTelemetry.flowRate.toLocaleString()} kg/h`}
          unit=""
          trend={{ value: "Calibrated to ±0.1%", isPositive: true, text: "" }}
          icon={Sliders}
          colorVariant="cyan"
          onClick={() => navigate("/calibration/records")}
        />
      </div>

      {/* Live Waveform Stream Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: isLiveTelemetryStreaming ? "#10B981" : "#F59E0B",
                  boxShadow: isLiveTelemetryStreaming ? "0 0 10px #10B981" : "none"
                }}
              />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Continuous Vibration Telemetry Stream (High-Speed Sampling 100Hz)
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Live spectral acceleration buffer transmitted via MQTT broker to anomaly detection pipeline
            </p>
          </div>

          <Badge variant="cyan">Last Tick: {iotTelemetry.lastUpdated}</Badge>
        </div>

        <AreaChart
          data={telemetryHistory}
          height={220}
          color={isVibAlert ? "#EF4444" : "#38BDF8"}
          unit="mm/s"
        />
      </Card>

      {/* Threshold Alarms Config & Edge Device Topology */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Active Threshold Rules */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
            Sensor Alarm Limit Rules
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Vibration RMS Limit</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Warning: &gt; 3.0 mm/s | Critical: &gt; 4.0 mm/s</div>
              </div>
              <Badge variant={isVibAlert ? "rose" : "emerald"}>
                {isVibAlert ? "ALERT TRIGGERED" : "NORMAL"}
              </Badge>
            </div>

            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Bearing Thermal Threshold</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Warning: &gt; 70.0°C | Critical: &gt; 80.0°C</div>
              </div>
              <Badge variant={isTempAlert ? "rose" : "emerald"}>
                {isTempAlert ? "ALERT TRIGGERED" : "NORMAL"}
              </Badge>
            </div>

            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Hydraulic Pressure Lower Bound</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Warning: &lt; 4.5 bar | Critical: &lt; 3.5 bar</div>
              </div>
              <Badge variant="emerald">NORMAL</Badge>
            </div>
          </div>
        </Card>

        {/* Edge Node Specs */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
            Edge Gateway Hardware Status
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Edge Protocol:</span>
              <div style={{ fontWeight: 700, color: "#38BDF8" }}>MQTT / Sparkplug B</div>
            </div>
            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Packet Latency:</span>
              <div style={{ fontWeight: 700, color: "#10B981", fontFamily: "var(--font-mono)" }}>14 ms</div>
            </div>
            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Throughput:</span>
              <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>1,200 msg/sec</div>
            </div>
            <div style={{ padding: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Gateway Health:</span>
              <div style={{ fontWeight: 700, color: "#10B981" }}>100% Online</div>
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => addToast("Edge gateway ping: 14ms. Zero packet loss.", "success")}
            >
              Ping Gateway
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate(`/assets/360?id=${targetAsset.id}`)}
            >
              Asset 360
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

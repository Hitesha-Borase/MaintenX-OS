import React, { useState } from "react";
import {
  Cpu,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function IoTIntegrationPage() {
  const { addToast } = useApp();

  const [brokers] = useState([
    { id: "IOT-01", name: "Plant 1 OPC-UA Industrial Edge Server", protocol: "OPC-UA (TCP:4840)", connectedNodes: 142, telemetryRate: "100 Hz", status: "Connected" },
    { id: "IOT-02", name: "Plant 1 MQTT Sensor Broker", protocol: "MQTT (TLS:8883)", connectedNodes: 86, telemetryRate: "10 Hz", status: "Connected" },
    { id: "IOT-03", name: "Plant 2 Modbus-TCP Gateway", protocol: "Modbus TCP (Port 502)", connectedNodes: 64, telemetryRate: "1 Hz", status: "Connected" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Industrial IoT & Machine Telemetry Gateways
            </h1>
            <Badge variant="emerald" dot>
              292 SENSORS STREAMING
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            OPC-UA server connections, MQTT broker topics, PLC edge adapters, and high-frequency sensor streams.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Polled all 3 industrial edge brokers: 0 packet loss.", "info")}
          >
            Ping Gateways
          </Button>
        </div>
      </div>

      {/* Gateways Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gateway Ref</th>
                <th>Industrial Server Description</th>
                <th>Protocol & Port</th>
                <th>Active Nodes</th>
                <th>Sampling Pitch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{b.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{b.protocol}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {b.connectedNodes} PLC Tags
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#10B981" }}>{b.telemetryRate}</td>
                  <td>
                    <Badge variant="emerald" dot>
                      {b.status}
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

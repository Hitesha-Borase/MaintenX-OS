import React, { useState } from "react";
import {
  Cpu,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Plus,
  Search,
  X,
  Edit2,
  Wifi,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function IoTIntegrationPage() {
  const { addToast } = useApp();

  const [brokers, setBrokers] = useState([
    { id: "IOT-01", name: "Plant 1 OPC-UA Industrial Edge Server", protocol: "OPC-UA (TCP:4840)", connectedNodes: 142, telemetryRate: "100 Hz", status: "Connected" },
    { id: "IOT-02", name: "Plant 1 MQTT Sensor Broker", protocol: "MQTT (TLS:8883)", connectedNodes: 86, telemetryRate: "10 Hz", status: "Connected" },
    { id: "IOT-03", name: "Plant 2 Modbus-TCP Gateway", protocol: "Modbus TCP (Port 502)", connectedNodes: 64, telemetryRate: "1 Hz", status: "Connected" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  const [newBroker, setNewBroker] = useState({
    name: "",
    protocol: "OPC-UA (TCP:4840)",
    connectedNodes: 50,
    telemetryRate: "50 Hz"
  });

  const totalNodes = brokers.reduce((sum, b) => sum + (b.connectedNodes || 0), 0);

  const filteredBrokers = brokers.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.protocol.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBroker.name.trim()) {
      addToast("Please provide gateway server description.", "warning");
      return;
    }

    const created = {
      id: `IOT-0${brokers.length + 1}`,
      name: newBroker.name,
      protocol: newBroker.protocol,
      connectedNodes: Number(newBroker.connectedNodes) || 30,
      telemetryRate: newBroker.telemetryRate || "10 Hz",
      status: "Connected"
    };

    setBrokers([...brokers, created]);
    addToast(`IoT Gateway "${created.id}" connected!`, "success");
    setIsModalOpen(false);
    setNewBroker({ name: "", protocol: "OPC-UA (TCP:4840)", connectedNodes: 50, telemetryRate: "50 Hz" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingBroker.name.trim()) {
      addToast("Please provide gateway server description.", "warning");
      return;
    }

    setBrokers(brokers.map((b) => (b.id === editingBroker.id ? { ...editingBroker, connectedNodes: Number(editingBroker.connectedNodes) || 10 } : b)));
    addToast(`IoT Gateway ${editingBroker.id} updated successfully!`, "success");
    setEditingBroker(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Industrial IoT & Telemetry Gateways
            </h1>
            <Badge variant="emerald" dot>{totalNodes} SENSORS STREAMING</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Polled all industrial edge brokers: 0 packet loss (Latency 1.2ms).", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Ping Gateways
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add IoT Gateway
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
          title="Edge Gateways"
          value={brokers.length.toString()}
          unit="Active Brokers"
          trend={{ value: "OPC-UA, MQTT, Modbus", isPositive: true, text: "" }}
          icon={Radio}
          colorVariant="emerald"
        />
        <StatCard
          title="Streaming Sensors"
          value={totalNodes.toString()}
          unit="PLC Tags"
          trend={{ value: "High-frequency edge feeds", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Peak Sampling Pitch"
          value="100 Hz"
          unit="OPC-UA"
          trend={{ value: "Line 1 Filler telemetry", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="amber"
        />
        <StatCard
          title="Packet Loss Rate"
          value="0.00%"
          unit="Reliable"
          trend={{ value: "Industrial TLS & token auth", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search gateway, protocol, nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Gateway Ref</th>
                <th>Industrial Server Description</th>
                <th>Protocol & Port</th>
                <th>Active Nodes</th>
                <th>Sampling Pitch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrokers.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{b.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{b.protocol}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                    {b.connectedNodes} PLC Tags
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#059669", fontWeight: 700 }}>{b.telemetryRate}</td>
                  <td>
                    <Badge variant="emerald" dot>
                      {b.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingBroker({ ...b })}
                      title="Edit Gateway"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD GATEWAY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Industrial IoT Gateway
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Server Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Line 3 Seamer PLC OPC-UA Ingest"
                  value={newBroker.name}
                  onChange={(e) => setNewBroker({ ...newBroker, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Protocol & Port</label>
                  <select
                    className="form-select"
                    value={newBroker.protocol}
                    onChange={(e) => setNewBroker({ ...newBroker, protocol: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="OPC-UA (TCP:4840)">OPC-UA (TCP:4840)</option>
                    <option value="MQTT (TLS:8883)">MQTT (TLS:8883)</option>
                    <option value="Modbus TCP (Port 502)">Modbus TCP (Port 502)</option>
                    <option value="EtherNet/IP (TCP:44818)">EtherNet/IP (TCP:44818)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Active Nodes / PLC Tags</label>
                  <input
                    type="number"
                    min="1"
                    value={newBroker.connectedNodes}
                    onChange={(e) => setNewBroker({ ...newBroker, connectedNodes: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sampling Pitch Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. 50 Hz"
                  value={newBroker.telemetryRate}
                  onChange={(e) => setNewBroker({ ...newBroker, telemetryRate: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Connect Gateway
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GATEWAY MODAL */}
      {editingBroker && (
        <div className="modal-backdrop" onClick={() => setEditingBroker(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit IoT Gateway — {editingBroker.id}
                </h2>
              </div>
              <button onClick={() => setEditingBroker(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Server Description *</label>
                <input
                  type="text"
                  required
                  value={editingBroker.name}
                  onChange={(e) => setEditingBroker({ ...editingBroker, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Protocol & Port</label>
                  <select
                    className="form-select"
                    value={editingBroker.protocol}
                    onChange={(e) => setEditingBroker({ ...editingBroker, protocol: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="OPC-UA (TCP:4840)">OPC-UA (TCP:4840)</option>
                    <option value="MQTT (TLS:8883)">MQTT (TLS:8883)</option>
                    <option value="Modbus TCP (Port 502)">Modbus TCP (Port 502)</option>
                    <option value="EtherNet/IP (TCP:44818)">EtherNet/IP (TCP:44818)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Active Nodes / PLC Tags</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBroker.connectedNodes}
                    onChange={(e) => setEditingBroker({ ...editingBroker, connectedNodes: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sampling Pitch Frequency</label>
                <input
                  type="text"
                  value={editingBroker.telemetryRate}
                  onChange={(e) => setEditingBroker({ ...editingBroker, telemetryRate: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingBroker(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

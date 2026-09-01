import React, { useState } from "react";
import {
  Cpu,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Gauge,
  Sliders,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function MachineCapabilityPage() {
  const { addToast } = useApp();

  const [capabilities, setCapabilities] = useState([
    { id: "CAP-01", machine: "FM-001 Rotary Filler", maxRatedSpeed: "75 bpm (4,500 BPH)", fillTolerance: "± 2.0 ml", bottleHeightRange: "150mm - 320mm", neckFinish: "28mm PCO 1881 / 38mm", status: "Calibrated" },
    { id: "CAP-02", machine: "HT-105 Pasteurizer Skid", maxRatedSpeed: "6,000 L/hr", fillTolerance: "± 0.2°C", bottleHeightRange: "N/A", neckFinish: "Sanitary Tri-clamp", status: "Calibrated" },
    { id: "CAP-03", machine: "CN-301 Can Seamer", maxRatedSpeed: "110 cpm (6,600 CPH)", fillTolerance: "Seam Hook ± 0.05mm", bottleHeightRange: "330ml / 500ml", neckFinish: "202 End Can", status: "Calibrated" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCap, setNewCap] = useState({
    machine: "",
    maxRatedSpeed: "80 bpm",
    fillTolerance: "± 1.5 ml",
    bottleHeightRange: "100mm - 300mm",
    neckFinish: "28mm PCO"
  });

  const filteredCaps = capabilities.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.machine.toLowerCase().includes(q) ||
      c.neckFinish.toLowerCase().includes(q) ||
      c.maxRatedSpeed.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCap.machine.trim()) {
      addToast("Please provide machine asset name.", "warning");
      return;
    }

    const created = {
      id: `CAP-0${capabilities.length + 1}`,
      machine: newCap.machine,
      maxRatedSpeed: newCap.maxRatedSpeed || "60 bpm",
      fillTolerance: newCap.fillTolerance || "Standard Tolerance",
      bottleHeightRange: newCap.bottleHeightRange || "Universal",
      neckFinish: newCap.neckFinish || "Standard Tooling",
      status: "Calibrated"
    };

    setCapabilities([...capabilities, created]);
    addToast(`Machine capability envelope created for ${created.machine}!`, "success");
    setIsModalOpen(false);
    setNewCap({ machine: "", maxRatedSpeed: "80 bpm", fillTolerance: "± 1.5 ml", bottleHeightRange: "100mm - 300mm", neckFinish: "28mm PCO" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Machine Capabilities & Physical Envelope
            </h1>
            <Badge variant="cyan">{capabilities.length} ENVELOPES REGISTERED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Machine Envelope
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
          title="Machine Assets"
          value={capabilities.length.toString()}
          unit="Active Cells"
          trend={{ value: "Physical limits calibrated", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="emerald"
        />
        <StatCard
          title="Max Mechanical Pitch"
          value="110 cpm"
          unit="Can Seamer"
          trend={{ value: "High speed capability", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="cyan"
        />
        <StatCard
          title="Fill Precision"
          value="± 2.0 ml"
          unit="Tolerance"
          trend={{ value: "Legal for trade metrology", isPositive: true, text: "" }}
          icon={Sliders}
          colorVariant="amber"
        />
        <StatCard
          title="Calibration State"
          value="100%"
          unit="Valid"
          trend={{ value: "Annual NIST certified", isPositive: true, text: "" }}
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
              placeholder="Search machine asset, tooling, speed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Machine Asset</th>
                <th>Max Mechanical Speed</th>
                <th>Process Tolerance</th>
                <th>Container Height Range</th>
                <th>Neck / Closure Tooling</th>
                <th>Calibration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCaps.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{c.machine}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{c.maxRatedSpeed}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{c.fillTolerance}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{c.bottleHeightRange}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{c.neckFinish}</td>
                  <td>
                    <Badge variant="emerald">{c.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened machine envelope calibration for ${c.machine}`, "info")}
                      title="Edit Capability"
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

      {/* ADD CAPABILITY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Machine Physical Capability
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Machine Asset Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BX-202 Wrap-Around Case Packer"
                  value={newCap.machine}
                  onChange={(e) => setNewCap({ ...newCap, machine: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Max Mechanical Speed</label>
                  <input
                    type="text"
                    placeholder="e.g. 45 cases/min"
                    value={newCap.maxRatedSpeed}
                    onChange={(e) => setNewCap({ ...newCap, maxRatedSpeed: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Process Tolerance</label>
                  <input
                    type="text"
                    placeholder="e.g. ± 1.0mm placement"
                    value={newCap.fillTolerance}
                    onChange={(e) => setNewCap({ ...newCap, fillTolerance: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Height / Dimension Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 100mm - 400mm"
                    value={newCap.bottleHeightRange}
                    onChange={(e) => setNewCap({ ...newCap, bottleHeightRange: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Tooling / Finish Spec</label>
                  <input
                    type="text"
                    placeholder="e.g. 12/24 Pack Gripper"
                    value={newCap.neckFinish}
                    onChange={(e) => setNewCap({ ...newCap, neckFinish: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Capability
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

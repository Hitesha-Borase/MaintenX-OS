import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  DollarSign,
  Gauge,
  Cpu,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function WorkCentersMasterPage() {
  const { addToast } = useApp();

  const [workCenters, setWorkCenters] = useState([
    { id: "WC-01", name: "Filling & Capping Monoblock", line: "Line 1 (Aseptic)", costPerHour: "$120.00/hr", maxCapacity: "4,250 BPH", status: "Active" },
    { id: "WC-02", name: "Rotary Labeling Station", line: "Line 1 (Aseptic)", costPerHour: "$85.00/hr", maxCapacity: "4,500 BPH", status: "Active" },
    { id: "WC-03", name: "Thermal Pasteurization Skid", line: "Line 2 (Formulation)", costPerHour: "$160.00/hr", maxCapacity: "5,000 LPH", status: "Active" },
    { id: "WC-04", name: "Can Seamer Station", line: "Line 3 (Canning)", costPerHour: "$140.00/hr", maxCapacity: "6,000 CPH", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWC, setNewWC] = useState({
    id: "",
    name: "",
    line: "Line 1 (Aseptic)",
    costPerHour: "$110.00/hr",
    maxCapacity: "4,000 BPH"
  });

  const filteredWCs = workCenters.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q) ||
      w.line.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newWC.id.trim() || !newWC.name.trim()) {
      addToast("Please provide work center code and description.", "warning");
      return;
    }

    const created = {
      id: newWC.id.toUpperCase(),
      name: newWC.name,
      line: newWC.line,
      costPerHour: newWC.costPerHour || "$100.00/hr",
      maxCapacity: newWC.maxCapacity || "4,000 BPH",
      status: "Active"
    };

    setWorkCenters([...workCenters, created]);
    addToast(`Master Work Center "${created.id}" created!`, "success");
    setIsModalOpen(false);
    setNewWC({ id: "", name: "", line: "Line 1 (Aseptic)", costPerHour: "$110.00/hr", maxCapacity: "4,000 BPH" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Work Centers Master Registry
            </h1>
            <Badge variant="cyan">{workCenters.length} MASTER WORK CENTERS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Work Center
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
          title="Master Centers"
          value={workCenters.length.toString()}
          unit="Active Cells"
          trend={{ value: "Core machinery stations", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Hourly Rate"
          value="$126/hr"
          unit="Absorption"
          trend={{ value: "Direct standard cost", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="cyan"
        />
        <StatCard
          title="Peak Rated Speed"
          value="6,000"
          unit="CPH"
          trend={{ value: "Can Seamer Station", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="SAP GL Mapping"
          value="100%"
          unit="Audited"
          trend={{ value: "Cost centers synced", isPositive: true, text: "" }}
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
              placeholder="Search work center, code, line..."
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
                <th>WC Code</th>
                <th>Work Center Description</th>
                <th>Line Attachment</th>
                <th>Standard Absorption Rate</th>
                <th>Max Rated Throughput</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWCs.map((w) => (
                <tr key={w.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{w.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{w.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{w.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{w.costPerHour}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{w.maxCapacity}</td>
                  <td>
                    <Badge variant="emerald">{w.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened work center costing for ${w.id}`, "info")}
                      title="Edit Work Center"
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

      {/* ADD WORK CENTER MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Master Work Center
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">WC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WC-05"
                    value={newWC.id}
                    onChange={(e) => setNewWC({ ...newWC, id: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Line Attachment</label>
                  <select
                    className="form-select"
                    value={newWC.line}
                    onChange={(e) => setNewWC({ ...newWC, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Line 1 (Aseptic)">Line 1 (Aseptic)</option>
                    <option value="Line 2 (Formulation)">Line 2 (Formulation)</option>
                    <option value="Line 3 (Canning)">Line 3 (Canning)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Work Center Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Depalletizer & Infeed Rinsing"
                  value={newWC.name}
                  onChange={(e) => setNewWC({ ...newWC, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Absorption Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. $95.00/hr"
                    value={newWC.costPerHour}
                    onChange={(e) => setNewWC({ ...newWC, costPerHour: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Max Rated Throughput</label>
                  <input
                    type="text"
                    placeholder="e.g. 4,500 BPH"
                    value={newWC.maxCapacity}
                    onChange={(e) => setNewWC({ ...newWC, maxCapacity: e.target.value })}
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
                  Save Work Center
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

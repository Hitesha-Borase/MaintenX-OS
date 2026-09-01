import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Clock,
  Cpu,
  Workflow,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function OperationsPage() {
  const { addToast } = useApp();

  const [operations, setOperations] = useState([
    { code: "OP-10", name: "Bulk Ingredient Dispensing & Hydration", stdTimeMins: 45, workCenter: "Mix Tank Cell", type: "Manual/Semi-auto", status: "Active" },
    { code: "OP-20", name: "High-Temperature Flash Pasteurization", stdTimeMins: 30, workCenter: "Pasteurizer 02", type: "Continuous Flow", status: "Active" },
    { code: "OP-30", name: "Aseptic Rotary Liquid Filling", stdTimeMins: 60, workCenter: "Filler Monoblock", type: "Continuous Machine", status: "Active" },
    { code: "OP-40", name: "Induction Cap Sealing & Torque Check", stdTimeMins: 60, workCenter: "Capper Unit", type: "Continuous Machine", status: "Active" },
    { code: "OP-50", name: "Case Packing & Palletizing", stdTimeMins: 60, workCenter: "End-of-Line Cell", type: "Robotic Automated", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOp, setNewOp] = useState({
    code: "",
    name: "",
    stdTimeMins: 30,
    workCenter: "Filler Monoblock",
    type: "Continuous Machine"
  });

  const filteredOps = operations.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.code.toLowerCase().includes(q) ||
      o.workCenter.toLowerCase().includes(q) ||
      o.type.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newOp.code.trim() || !newOp.name.trim()) {
      addToast("Please provide operation code and name.", "warning");
      return;
    }

    const created = {
      code: newOp.code.toUpperCase(),
      name: newOp.name,
      stdTimeMins: Number(newOp.stdTimeMins) || 30,
      workCenter: newOp.workCenter,
      type: newOp.type,
      status: "Active"
    };

    setOperations([...operations, created]);
    addToast(`Operation "${created.code}" registered successfully!`, "success");
    setIsModalOpen(false);
    setNewOp({ code: "", name: "", stdTimeMins: 30, workCenter: "Filler Monoblock", type: "Continuous Machine" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Standard Operations Catalogue
            </h1>
            <Badge variant="cyan">{operations.length} STANDARD OPERATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Standard Operation
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
          title="Active Operations"
          value={operations.length.toString()}
          unit="Standard Steps"
          trend={{ value: "Discrete cycle taxonomy", isPositive: true, text: "" }}
          icon={Workflow}
          colorVariant="emerald"
        />
        <StatCard
          title="Continuous Machine"
          value="2 Stations"
          unit="Filler & Capper"
          trend={{ value: "Synchronized pitching", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Cycle Duration"
          value="255m"
          unit="Standard"
          trend={{ value: "Nominal lot transit span", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="SOP Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "Digital routing enforced", isPositive: true, text: "" }}
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
              placeholder="Search operation code, name, work center..."
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
                <th>Operation Code</th>
                <th>Operation Name</th>
                <th>Work Center</th>
                <th>Std Duration</th>
                <th>Execution Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOps.map((o) => (
                <tr key={o.code}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{o.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{o.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{o.workCenter}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{o.stdTimeMins} mins</td>
                  <td>
                    <Badge variant="cyan">{o.type}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened standard procedure for ${o.code}`, "info")}
                      title="Edit Operation"
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

      {/* ADD OPERATION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Standard Operation
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Operation Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OP-60"
                    value={newOp.code}
                    onChange={(e) => setNewOp({ ...newOp, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Std Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={newOp.stdTimeMins}
                    onChange={(e) => setNewOp({ ...newOp, stdTimeMins: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Operation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shrinkwrap Bundle & Corner Guard"
                  value={newOp.name}
                  onChange={(e) => setNewOp({ ...newOp, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Work Center</label>
                  <input
                    type="text"
                    placeholder="e.g. End-of-Line Cell"
                    value={newOp.workCenter}
                    onChange={(e) => setNewOp({ ...newOp, workCenter: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Execution Mode</label>
                  <select
                    className="form-select"
                    value={newOp.type}
                    onChange={(e) => setNewOp({ ...newOp, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Continuous Machine">Continuous Machine</option>
                    <option value="Continuous Flow">Continuous Flow</option>
                    <option value="Manual/Semi-auto">Manual/Semi-auto</option>
                    <option value="Robotic Automated">Robotic Automated</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Operation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

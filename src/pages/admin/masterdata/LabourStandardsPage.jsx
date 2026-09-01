import React, { useState } from "react";
import {
  Users,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Clock,
  DollarSign,
  Briefcase,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function LabourStandardsPage() {
  const { addToast } = useApp();

  const [standards, setStandards] = useState([
    { id: "LBR-01", line: "Line 1 — Aseptic Bottling", standardCrew: 10, stdLaborHoursPer1kUnits: 2.38, directCostPerHour: "$24.50", status: "Active" },
    { id: "LBR-02", line: "Line 2 — Formulation & Pasteurizer", standardCrew: 6, stdLaborHoursPer1kUnits: 1.85, directCostPerHour: "$28.00", status: "Active" },
    { id: "LBR-03", line: "Line 3 — Canning Line", standardCrew: 8, stdLaborHoursPer1kUnits: 2.15, directCostPerHour: "$24.50", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStandard, setNewStandard] = useState({
    line: "Line 1 — Aseptic Bottling",
    standardCrew: 8,
    stdLaborHoursPer1kUnits: 2.0,
    directCostPerHour: "$25.00"
  });

  const totalCrew = standards.reduce((sum, s) => sum + (s.standardCrew || 0), 0);

  const filteredStandards = standards.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.line.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `LBR-0${standards.length + 1}`,
      line: newStandard.line,
      standardCrew: Number(newStandard.standardCrew) || 8,
      stdLaborHoursPer1kUnits: Number(newStandard.stdLaborHoursPer1kUnits) || 2.0,
      directCostPerHour: newStandard.directCostPerHour || "$25.00",
      status: "Active"
    };

    setStandards([...standards, created]);
    addToast(`Labour standard created for ${created.line}!`, "success");
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Labour Standards & Crew Manning
            </h1>
            <Badge variant="cyan">{standards.length} CREW PROFILES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Labour Standard
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
          title="Total Shift Crew"
          value={`${totalCrew} Ops`}
          unit="Nominal"
          trend={{ value: "All lines fully manned", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Hours / 1k Units"
          value="2.13 hrs"
          unit="Efficiency"
          trend={{ value: "+4.1% productivity gain", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg Direct Wage"
          value="$25.66"
          unit="Per Hour"
          trend={{ value: "Standard cost absorption", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="amber"
        />
        <StatCard
          title="OSHA & Ergonomics"
          value="100%"
          unit="Compliant"
          trend={{ value: "Job rotation policy active", isPositive: true, text: "" }}
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
              placeholder="Search labour profile, line..."
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
                <th>Standard Ref</th>
                <th>Production Line</th>
                <th>Standard Crew Size</th>
                <th>Std Labor Hours / 1k Units</th>
                <th>Direct Wage Absorption</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandards.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{s.line}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{s.standardCrew} Operators</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#059669", fontWeight: 700 }}>{s.stdLaborHoursPer1kUnits} hrs</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{s.directCostPerHour}</td>
                  <td>
                    <Badge variant="emerald">{s.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened manning balance for ${s.line}`, "info")}
                      title="Edit Labour Standard"
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

      {/* ADD STANDARD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Labour Standard Profile
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Production Line *</label>
                <select
                  className="form-select"
                  value={newStandard.line}
                  onChange={(e) => setNewStandard({ ...newStandard, line: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Line 1 — Aseptic Bottling">Line 1 — Aseptic Bottling</option>
                  <option value="Line 2 — Formulation & Pasteurizer">Line 2 — Formulation & Pasteurizer</option>
                  <option value="Line 3 — Canning Line">Line 3 — Canning Line</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Standard Crew Size (Ops)</label>
                  <input
                    type="number"
                    min="1"
                    value={newStandard.standardCrew}
                    onChange={(e) => setNewStandard({ ...newStandard, standardCrew: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Labor Hours / 1k Units</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStandard.stdLaborHoursPer1kUnits}
                    onChange={(e) => setNewStandard({ ...newStandard, stdLaborHoursPer1kUnits: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Direct Wage Rate</label>
                <input
                  type="text"
                  placeholder="e.g. $26.00"
                  value={newStandard.directCostPerHour}
                  onChange={(e) => setNewStandard({ ...newStandard, directCostPerHour: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

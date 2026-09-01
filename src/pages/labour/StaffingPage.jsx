import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Download,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function StaffingPage() {
  const { employees = [] } = useCMMS();
  const { addToast } = useApp();

  const [staffingLines, setStaffingLines] = useState([
    { line: "Line 1 — Aseptic Bottling", required: 10, assigned: 10, supervisor: "Marcus Vance", status: "Full Coverage" },
    { line: "Line 2 — Formulation & CIP", required: 6, assigned: 6, supervisor: "Elena Rostova", status: "Full Coverage" },
    { line: "Line 3 — Canning & Seaming", required: 8, assigned: 8, supervisor: "David Kim", status: "Full Coverage" },
    { line: "Quality & In-Line Testing Lab", required: 4, assigned: 4, supervisor: "Sarah Jenkins", status: "Full Coverage" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaffing, setNewStaffing] = useState({
    line: "Warehouse & Material Staging",
    required: 4,
    assigned: 4,
    supervisor: "Carlos Mendez"
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setStaffingLines([
      ...staffingLines,
      {
        ...newStaffing,
        required: Number(newStaffing.required),
        assigned: Number(newStaffing.assigned),
        status: Number(newStaffing.assigned) >= Number(newStaffing.required) ? "Full Coverage" : "Understaffed"
      }
    ]);
    addToast(`Line staffing allocated for ${newStaffing.line}!`, "success");
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Production Area,Required Headcount,Assigned Operators,Area Supervisor,Coverage Status\n";
    const rows = staffingLines
      .map((s) => `"${s.line}",${s.required},${s.assigned},"${s.supervisor}","${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Staffing_Allocation_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Staffing matrix exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Shift Labour Staffing & Line Allocations
            </h1>
            <Badge variant="emerald">100% ATTENDANCE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Allocate Staff
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
          title="Total Plant Staffing"
          value="28 / 28"
          unit="Operators Present"
          trend={{ value: "0 Absenteeism / Callouts", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="Line Staffing Health"
          value="100%"
          unit="Manned"
          trend={{ value: "All critical lines covered", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Supervisor Coverage"
          value="4 / 4"
          unit="Leads On-Site"
          trend={{ value: "Shift A Lead coverage active", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Takt Utilization"
          value="94.2%"
          unit="Productivity"
          trend={{ value: "+2.0% above target", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Staffing Allocation Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line-by-Line Operator Allocation Matrix (Shift A)
          </h3>
          <Badge variant="cyan">{staffingLines.length} MANNED SECTORS</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Production Area / Line</th>
                <th>Required Headcount</th>
                <th>Assigned Operators</th>
                <th>Area Supervisor</th>
                <th>Coverage Status</th>
              </tr>
            </thead>
            <tbody>
              {staffingLines.map((s, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{s.line}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{s.required} Operators</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {s.assigned} Operators
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{s.supervisor}</span>
                  </td>
                  <td>
                    <Badge variant={s.status === "Full Coverage" ? "emerald" : "amber"}>
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Allocate Line Staffing
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Production Line / Area *</label>
                <input
                  type="text"
                  required
                  value={newStaffing.line}
                  onChange={(e) => setNewStaffing({ ...newStaffing, line: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Required Headcount *</label>
                  <input
                    type="number"
                    required
                    value={newStaffing.required}
                    onChange={(e) => setNewStaffing({ ...newStaffing, required: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Assigned Operators *</label>
                  <input
                    type="number"
                    required
                    value={newStaffing.assigned}
                    onChange={(e) => setNewStaffing({ ...newStaffing, assigned: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Area Supervisor *</label>
                <input
                  type="text"
                  required
                  value={newStaffing.supervisor}
                  onChange={(e) => setNewStaffing({ ...newStaffing, supervisor: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

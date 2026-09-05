import React, { useState } from "react";
import {
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  BarChart2,
  Download,
  Filter,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Plus
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { LABOUR_DATA } from "../../data/mockLabour";

export function LabourTime() {
  const { addToast } = useApp();

  const [labour, setLabour] = useState(LABOUR_DATA);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [rebalanceForm, setRebalanceForm] = useState({
    fromLine: "Line 1 — High-Speed Aseptic Bottling",
    toLine: "Line 3 — Canning & Seaming Automation",
    operatorsCount: 1
  });

  const handleAuthorizeOvertime = () => {
    addToast("Shift Overtime authorized (+2.0 hrs) for Line 3 canning crew.", "success");
  };

  const handleRebalanceSubmit = (e) => {
    e.preventDefault();
    setLabour((prev) => {
      const updatedLines = prev.lines.map((l) => {
        if (l.line === rebalanceForm.fromLine) {
          const newActual = l.actual - Number(rebalanceForm.operatorsCount);
          return {
            ...l,
            actual: newActual,
            available: newActual,
            status: newActual < l.planned ? `Understaffed (-${l.planned - newActual})` : "Optimal"
          };
        }
        if (l.line === rebalanceForm.toLine) {
          const newActual = l.actual + Number(rebalanceForm.operatorsCount);
          return {
            ...l,
            actual: newActual,
            available: newActual,
            status: newActual >= l.planned ? "Optimal" : `Understaffed (-${l.planned - newActual})`
          };
        }
        return l;
      });
      return { ...prev, lines: updatedLines };
    });
    addToast(
      `Rebalanced ${rebalanceForm.operatorsCount} operator(s) from "${rebalanceForm.fromLine.split('—')[0].trim()}" to "${rebalanceForm.toLine.split('—')[0].trim()}".`,
      "success"
    );
    setIsRebalanceModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Line / Production Area,Department,Planned Labour,Actual Labour,Available Labour,Labour Utilization,Labour Productivity,Shift Lead,Status\n";
    const rows = labour.lines
      .map(
        (l) =>
          `"${l.line}","${l.department}",${l.planned},${l.actual},${l.available},"${l.utilization}",${l.productivity},"${l.lead}","${l.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Labour_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Labour allocation data exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Labour Management & Allocations
            </h1>
            <Badge variant="emerald">{labour.actualLabour} / {labour.plannedLabour} Clocked In</Badge>
            <Badge variant="cyan">{labour.labourProductivity} Units / Labor Hr</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Factory workforce availability, direct vs indirect labor allocation, shift utilization, and line productivity.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Labour
          </Button>
          <Button variant="secondary" icon={RefreshCw} onClick={() => setIsRebalanceModalOpen(true)}>
            Rebalance Crew
          </Button>
          <Button variant="warning" icon={Clock} onClick={handleAuthorizeOvertime}>
            Authorize Overtime
          </Button>
        </div>
      </div>

      {/* Primary KPI Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", width: "100%" }}>
        <StatCard
          title="Planned Labour"
          value={labour.plannedLabour}
          unit="Headcount"
          trend={{ value: "Budgeted shift schedule", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="blue"
        />
        <StatCard
          title="Actual Labour"
          value={labour.actualLabour}
          unit="Clocked On Floor"
          trend={{ value: `${labour.actualLabour - labour.plannedLabour} Variance (-2 Open)`, isPositive: false, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Available Labour"
          value={labour.availableLabour}
          unit="Ready at Stations"
          trend={{ value: "1 Operator on break", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Labour Utilization"
          value={`${labour.labourUtilization}%`}
          unit="Efficiency"
          trend={{ value: "Target: > 92.0%", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="indigo"
        />
        <StatCard
          title="Labour Productivity"
          value={labour.labourProductivity}
          unit="Units / Labor Hr"
          trend={{ value: `${labour.labourProductivityTrend} vs target (${labour.labourProductivityTarget})`, isPositive: true, text: "" }}
          icon={Award}
          colorVariant="emerald"
        />
      </div>

      {/* Labour Allocation Summary Card */}
      <Card style={{ padding: "18px 20px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Labour Allocation & Distribution
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Direct production value-add hours vs indirect staging and sanitation support.
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Badge variant="emerald">Direct: {labour.labourAllocationDirect}%</Badge>
            <Badge variant="amber">Indirect: {labour.labourAllocationIndirect}%</Badge>
          </div>
        </div>

        {/* Progress Bar for Allocation */}
        <div style={{ width: "100%", height: "12px", backgroundColor: "#E2E8F0", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
          <div
            style={{
              width: `${labour.labourAllocationDirect}%`,
              backgroundColor: "#10B981",
              transition: "width 0.3s ease"
            }}
            title={`Direct: ${labour.labourAllocationDirect}%`}
          />
          <div
            style={{
              width: `${labour.labourAllocationIndirect}%`,
              backgroundColor: "#F59E0B",
              transition: "width 0.3s ease"
            }}
            title={`Indirect: ${labour.labourAllocationIndirect}%`}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span>Direct Production Operators: <strong>41 Headcount</strong> (Filler, Seamer, Capper, Packer)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
            <span>Indirect Support: <strong>5 Headcount</strong> (Forklift, Staging, Line Sanitation)</span>
          </div>
        </div>
      </Card>

      {/* 1. Labour by Line — Full Width for Perfect Data Visibility */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Labour by Line & Work Center ({labour.lines.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Detailed staffing allocations, hourly throughput rates, and area supervisor oversight.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>LINE & DEPARTMENT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PLANNED</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>ACTUAL</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>AVAILABLE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>UTILIZATION</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PRODUCTIVITY</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>LINE LEAD</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", textAlign: "right" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {labour.lines.map((l, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)", height: "46px" }}>
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.2 }}>{l.line}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.department}</div>
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {l.planned}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontWeight: 800, color: l.actual < l.planned ? "#D97706" : "#059669", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {l.actual}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {l.available}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {l.utilization}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0284C7", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {l.productivity} u/hr
                  </td>
                  <td style={{ padding: "8px 14px", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {l.lead}
                  </td>
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <Badge variant={l.status === "Optimal" ? "emerald" : "amber"}>
                      {l.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2. Labour by Shift Table Card */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Labour by Shift Schedule ({labour.shifts.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Planned vs actual attendance, efficiency, and pacing across production shifts.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "750px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PLANNED</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>ACTUAL</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>AVAILABLE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>UTILIZATION</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PRODUCTIVITY</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", textAlign: "right" }}>COVERAGE STATUS</th>
              </tr>
            </thead>
            <tbody>
              {labour.shifts.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)", height: "46px" }}>
                  <td style={{ padding: "8px 14px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {s.shift}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {s.planned}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontWeight: 800, color: s.actual < s.planned ? "#D97706" : "#059669", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {s.actual}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {s.available}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {s.utilization}
                  </td>
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0284C7", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {s.productivity} u/hr
                  </td>
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
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

      {/* REBALANCE CREW MODAL */}
      <Modal
        isOpen={isRebalanceModalOpen}
        onClose={() => setIsRebalanceModalOpen(false)}
        title="Rebalance Crew Allocation"
        subtitle="Shift Dynamic Headcount Re-allocation"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRebalanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={RefreshCw} onClick={handleRebalanceSubmit}>
              Execute Rebalance
            </Button>
          </>
        }
      >
        <form onSubmit={handleRebalanceSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Transfer From Line
            </label>
            <select
              value={rebalanceForm.fromLine}
              onChange={(e) => setRebalanceForm({ ...rebalanceForm, fromLine: e.target.value })}
              className="input-field"
            >
              {labour.lines.map((l, i) => (
                <option key={i} value={l.line}>{l.line} ({l.actual} operators)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Transfer To Line
            </label>
            <select
              value={rebalanceForm.toLine}
              onChange={(e) => setRebalanceForm({ ...rebalanceForm, toLine: e.target.value })}
              className="input-field"
            >
              {labour.lines.map((l, i) => (
                <option key={i} value={l.line}>{l.line} ({l.actual} operators)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Number of Operators to Transfer
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rebalanceForm.operatorsCount}
              onChange={(e) => setRebalanceForm({ ...rebalanceForm, operatorsCount: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

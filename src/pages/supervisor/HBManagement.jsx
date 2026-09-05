import React, { useState } from "react";
import {
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Send,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { LIVE_HB_RECORDS } from "../../data/mockLabour";

export function HBManagement() {
  const { addToast } = useApp();

  const [records, setRecords] = useState(LIVE_HB_RECORDS);
  const [selectedShift, setSelectedShift] = useState("All");
  const [selectedLine, setSelectedLine] = useState("All");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

  const [newHB, setNewHB] = useState({
    hour: "10:00 - 11:00",
    shift: "Shift A (Day)",
    line: "Line 1 — Bottling",
    department: "Packaging",
    plannedHB: 14,
    actualHB: 14,
    requiredHB: 14,
    availableHB: 14,
    operatorNotes: "Nominal crew active."
  });

  const [backupForm, setBackupForm] = useState({
    pool: "Utility Float Pool",
    assignedCount: 1,
    targetLine: "Line 1 — Bottling"
  });

  const filteredRecords = records.filter((r) => {
    const matchesShift = selectedShift === "All" || r.shift.includes(selectedShift);
    const matchesLine = selectedLine === "All" || r.line.includes(selectedLine);
    return matchesShift && matchesLine;
  });

  // Calculate live aggregates
  const totalPlannedHB = filteredRecords.reduce((acc, r) => acc + r.plannedHB, 0);
  const totalActualHB = filteredRecords.reduce((acc, r) => acc + r.actualHB, 0);
  const totalShortage = filteredRecords.reduce((acc, r) => acc + (r.shortage < 0 ? r.shortage : 0), 0);

  const handleCreateRecord = (e) => {
    e.preventDefault();
    const planned = Number(newHB.plannedHB);
    const actual = Number(newHB.actualHB);
    const required = Number(newHB.requiredHB);
    const available = Number(newHB.availableHB);
    const shortage = actual - required;

    const record = {
      id: `HB-0${records.length + 1}`,
      hour: newHB.hour,
      shift: newHB.shift,
      line: newHB.line,
      department: newHB.department,
      plannedHB: planned,
      actualHB: actual,
      requiredHB: required,
      availableHB: available,
      shortage,
      status: shortage === 0 ? "Full Coverage" : shortage < -1 ? "Critical Deficit (-2)" : "Shortage (-1)",
      operatorNotes: newHB.operatorNotes
    };

    setRecords((prev) => [record, ...prev]);
    addToast(`H/B record for ${record.hour} logged for ${record.line}.`, "success");
    setIsLogModalOpen(false);
  };

  const handleOpenBackupModal = (record) => {
    setActiveRecord(record);
    setBackupForm((prev) => ({ ...prev, targetLine: record.line }));
    setIsBackupModalOpen(true);
  };

  const handleDispatchBackup = (e) => {
    e.preventDefault();
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === activeRecord.id) {
          const newActual = r.actualHB + Number(backupForm.assignedCount);
          const newAvailable = r.availableHB + Number(backupForm.assignedCount);
          const newShortage = newActual - r.requiredHB;
          return {
            ...r,
            actualHB: newActual,
            availableHB: newAvailable,
            shortage: newShortage,
            status: newShortage >= 0 ? "Full Coverage" : `Shortage (${newShortage})`,
            operatorNotes: `Backup dispatched from ${backupForm.pool} (+${backupForm.assignedCount}).`
          };
        }
        return r;
      })
    );
    addToast(
      `Dispatched ${backupForm.assignedCount} backup operator from ${backupForm.pool} to ${activeRecord.line}. Shortage resolved!`,
      "success"
    );
    setIsBackupModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "H/B Record ID,Hour,Shift,Line,Department,Planned H/B,Actual H/B,Required H/B,Available H/B,Shortage,Status,Notes\n";
    const rows = records
      .map(
        (r) =>
          `"${r.id}","${r.hour}","${r.shift}","${r.line}","${r.department}",${r.plannedHB},${r.actualHB},${r.requiredHB},${r.availableHB},${r.shortage},"${r.status}","${r.operatorNotes}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Live_HB_Headcount_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Live H/B headcount logs exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Live H/B (Hour-by-Hour Headcount Availability)
            </h1>
            <Badge variant="cyan">Real-time Pacing</Badge>
            <Badge variant={totalShortage < 0 ? "amber" : "emerald"}>
              {totalShortage < 0 ? `${Math.abs(totalShortage)} Active Headcount Shortage` : "Full Crew Coverage"}
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Hourly tracking of planned, required, and actual headcount availability to prevent line starvation and pace loss.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export H/B Log
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsLogModalOpen(true)}>
            + Log Hourly H/B
          </Button>
        </div>
      </div>

      {/* KPI Overview Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", width: "100%" }}>
        <StatCard
          title="Planned H/B (Sum)"
          value={totalPlannedHB}
          unit="Headcount"
          trend={{ value: "Target allocation", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="blue"
        />
        <StatCard
          title="Actual H/B (On Floor)"
          value={totalActualHB}
          unit="Headcount"
          trend={{ value: `${totalActualHB >= totalPlannedHB ? 'Nominal staffing' : 'Minor gap in canning'}`, isPositive: totalActualHB >= totalPlannedHB, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Headcount Shortage"
          value={totalShortage === 0 ? "0" : totalShortage}
          unit="Operators"
          trend={{ value: totalShortage < 0 ? "Backup call recommended" : "Full coverage confirmed", isPositive: totalShortage === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={totalShortage < 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Hourly Pacing Reliability"
          value="97.2%"
          unit="On-Schedule"
          trend={{ value: "+1.8% vs last shift", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
      </div>

      {/* Responsive Filter Bar */}
      <Card style={{ padding: "14px 18px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Shift:</span>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="input-field"
                style={{ fontSize: "12px", padding: "6px 10px", height: "34px" }}
              >
                <option value="All">All Shifts</option>
                <option value="Shift A">Shift A (Day)</option>
                <option value="Shift B">Shift B (Evening)</option>
                <option value="Shift C">Shift C (Night)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Production Line:</span>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="input-field"
                style={{ fontSize: "12px", padding: "6px 10px", height: "34px" }}
              >
                <option value="All">All Lines</option>
                <option value="Line 1">Line 1 — Bottling</option>
                <option value="Line 2">Line 2 — Formulation</option>
                <option value="Line 3">Line 3 — Canning</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
            Viewing <strong>{filteredRecords.length}</strong> hourly intervals
          </div>
        </div>
      </Card>

      {/* Main Live H/B Table Card */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Live Hour-by-Hour (H/B) Headcount Log ({filteredRecords.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Real-time headcount audit against line engineering requirements.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "960px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>HOUR</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHIFT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>LINE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>DEPARTMENT</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>PLANNED H/B</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>ACTUAL H/B</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>REQUIRED H/B</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>AVAILABLE H/B</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>SHORTAGE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>STATUS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: "1px solid var(--border-subtle)", height: "46px" }}>
                  {/* Hour */}
                  <td style={{ padding: "8px 14px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} color="#0284C7" />
                      <span>{rec.hour}</span>
                    </div>
                  </td>

                  {/* Shift */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="cyan">{rec.shift}</Badge>
                  </td>

                  {/* Line */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {rec.line}
                  </td>

                  {/* Department */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {rec.department}
                  </td>

                  {/* Planned H/B */}
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {rec.plannedHB}
                  </td>

                  {/* Actual H/B */}
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 800, color: rec.actualHB < rec.requiredHB ? "#D97706" : "#059669", whiteSpace: "nowrap" }}>
                    {rec.actualHB}
                  </td>

                  {/* Required H/B */}
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {rec.requiredHB}
                  </td>

                  {/* Available H/B */}
                  <td style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {rec.availableHB}
                  </td>

                  {/* Shortage — Clean non-wrapping pill */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        fontSize: "12px",
                        padding: "2px 7px",
                        borderRadius: "5px",
                        backgroundColor: rec.shortage === 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.15)",
                        color: rec.shortage === 0 ? "#059669" : "#D97706",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {rec.shortage === 0 ? "0 (Balanced)" : `${rec.shortage} Short`}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={rec.shortage === 0 ? "emerald" : "amber"} dot>
                      {rec.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    {rec.shortage < 0 ? (
                      <Button
                        variant="warning"
                        size="xs"
                        icon={AlertTriangle}
                        onClick={() => handleOpenBackupModal(rec)}
                        title="Dispatch Backup Operator"
                        style={{ height: "26px", padding: "3px 8px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        Call Backup
                      </Button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                        ✓ Nominal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1. LOG HOURLY H/B MODAL */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Hourly Headcount (Live H/B)"
        subtitle="Department Operational Staffing Verification"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleCreateRecord}>
              Submit H/B Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRecord} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Operating Hour Interval
              </label>
              <input
                type="text"
                value={newHB.hour}
                onChange={(e) => setNewHB({ ...newHB, hour: e.target.value })}
                placeholder="e.g. 10:00 - 11:00"
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Shift
              </label>
              <select
                value={newHB.shift}
                onChange={(e) => setNewHB({ ...newHB, shift: e.target.value })}
                className="input-field"
              >
                <option value="Shift A (Day)">Shift A (Day)</option>
                <option value="Shift B (Evening)">Shift B (Evening)</option>
                <option value="Shift C (Night)">Shift C (Night)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Production Line
              </label>
              <select
                value={newHB.line}
                onChange={(e) => setNewHB({ ...newHB, line: e.target.value })}
                className="input-field"
              >
                <option value="Line 1 — Bottling">Line 1 — Bottling</option>
                <option value="Line 2 — Formulation">Line 2 — Formulation</option>
                <option value="Line 3 — Canning">Line 3 — Canning</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Department
              </label>
              <select
                value={newHB.department}
                onChange={(e) => setNewHB({ ...newHB, department: e.target.value })}
                className="input-field"
              >
                <option value="Packaging">Packaging</option>
                <option value="Processing">Processing</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Planned H/B
              </label>
              <input
                type="number"
                value={newHB.plannedHB}
                onChange={(e) => setNewHB({ ...newHB, plannedHB: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Actual H/B
              </label>
              <input
                type="number"
                value={newHB.actualHB}
                onChange={(e) => setNewHB({ ...newHB, actualHB: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Required H/B
              </label>
              <input
                type="number"
                value={newHB.requiredHB}
                onChange={(e) => setNewHB({ ...newHB, requiredHB: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Available H/B
              </label>
              <input
                type="number"
                value={newHB.availableHB}
                onChange={(e) => setNewHB({ ...newHB, availableHB: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Operational Observations / Variance Notes
            </label>
            <input
              type="text"
              value={newHB.operatorNotes}
              onChange={(e) => setNewHB({ ...newHB, operatorNotes: e.target.value })}
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* 2. CALL BACKUP OPERATOR MODAL */}
      <Modal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        title="Dispatch Backup Operator"
        subtitle={`Resolve Headcount Deficit on ${activeRecord?.line} (${activeRecord?.hour})`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsBackupModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="warning" icon={Send} onClick={handleDispatchBackup}>
              Confirm Dispatch
            </Button>
          </>
        }
      >
        <form onSubmit={handleDispatchBackup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "12px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "6px", borderLeft: "4px solid #F59E0B" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#D97706" }}>Current Deficit: {activeRecord?.shortage} Operator(s)</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Required: {activeRecord?.requiredHB} | Currently Present: {activeRecord?.actualHB}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Select Backup Labor Pool
            </label>
            <select
              value={backupForm.pool}
              onChange={(e) => setBackupForm({ ...backupForm, pool: e.target.value })}
              className="input-field"
            >
              <option value="Utility Float Pool">Utility Float Pool (3 Available)</option>
              <option value="Packaging Standby Crew">Packaging Standby Crew (2 Available)</option>
              <option value="Maintenance Relief Pool">Maintenance Relief Pool (1 Available)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Number of Backup Operators to Allocate
            </label>
            <input
              type="number"
              min="1"
              max="3"
              value={backupForm.assignedCount}
              onChange={(e) => setBackupForm({ ...backupForm, assignedCount: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

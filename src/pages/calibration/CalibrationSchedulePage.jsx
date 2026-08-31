import React, { useState } from "react";
import {
  Sliders,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  X,
  ExternalLink,
  Calendar
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function CalibrationSchedulePage() {
  const { calibrations, addCalibrationSchedule, assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Add Schedule Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    instrumentId: "INS-TT-502",
    instrumentName: "Cleanroom Humidity & Temperature Sensor",
    assetId: "FM-001",
    range: "0 to 100% RH / -10 to 60°C",
    accuracySpec: "±1.5% RH",
    lastCalibrationDate: new Date().toISOString().substring(0, 10),
    nextDueDate: "2026-12-31",
    calibrationIntervalMonths: 6,
    technician: "Sarah Jenkins",
    standardUsed: "Vaisala Reference Hygrometer"
  });

  const dueSoonCount = calibrations.filter((c) => c.status === "Due Soon").length;
  const overdueCount = calibrations.filter((c) => c.status === "Overdue").length;
  const validCount = calibrations.filter((c) => c.status === "Valid").length;

  const filteredCalibrations = calibrations.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrumentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrumentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assetName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const targetAsset = assets.find((a) => a.id === formData.assetId);

    const created = addCalibrationSchedule({
      ...formData,
      assetName: targetAsset?.name || formData.assetId
    });

    addToast(`Calibration Schedule for ${created.instrumentId} registered!`, "success");
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Schedule ID,Instrument ID,Instrument Name,Target Asset,Next Due Date,Interval (Mo),Status,Technician\n";
    const rows = filteredCalibrations
      .map(
        (c) =>
          `"${c.id}","${c.instrumentId}","${c.instrumentName}","${c.assetName}","${c.nextDueDate}",${c.calibrationIntervalMonths},"${c.status}","${c.technician}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Calibration_Schedule_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Calibration schedule exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Calibration Schedule
            </h1>
            <Badge variant="cyan">{calibrations.length} Tracked Instruments</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Metrology and instrumentation due dates, accuracy tolerance intervals, and ISO/FDA compliance scheduling.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Schedule
          </Button>
          <Button variant="secondary" onClick={() => navigate("/calibration/records")}>
            Calibration Records
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Schedule Calibration
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Certified & Valid"
          value={`${validCount} / ${calibrations.length}`}
          unit="Valid"
          trend={{ value: "Compliant with ISO 17025", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => setStatusFilter("Valid")}
        />
        <StatCard
          title="Due Soon (< 30 Days)"
          value={dueSoonCount.toString()}
          unit="Instruments"
          trend={{ value: "Calibration window active", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant={dueSoonCount > 0 ? "amber" : "emerald"}
          onClick={() => setStatusFilter("Due Soon")}
        />
        <StatCard
          title="Overdue Calibrations"
          value={overdueCount.toString()}
          unit="Critical"
          trend={{ value: overdueCount > 0 ? "Requires immediate lockout" : "0 Overdue", isPositive: overdueCount === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant={overdueCount > 0 ? "rose" : "emerald"}
          onClick={() => setStatusFilter("Overdue")}
        />
      </div>

      {/* Table Card */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search instrument ID, sensor name, asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Instrument Tag</th>
                <th>Description & Range</th>
                <th>Host Equipment</th>
                <th>Next Due Date</th>
                <th>Interval</th>
                <th>Standard Used</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalibrations.map((c) => {
                const isOverdue = c.status === "Overdue";
                const isDueSoon = c.status === "Due Soon";

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{c.instrumentId}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{c.id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.instrumentName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Range: {c.range}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#38BDF8" }}>{c.assetId}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.assetName}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isOverdue ? "#EF4444" : isDueSoon ? "#F59E0B" : "var(--text-primary)", fontWeight: 700 }}>
                        {c.nextDueDate}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Last: {c.lastCalibrationDate}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{c.calibrationIntervalMonths} Months</Badge>
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      {c.standardUsed}
                    </td>
                    <td>
                      <Badge variant={isOverdue ? "rose" : isDueSoon ? "amber" : "emerald"} dot={isOverdue || isDueSoon}>
                        {c.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/calibration/records?calId=${c.id}`)}
                      >
                        Record Test
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Calibration Instrument Schedule
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Instrument Tag ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INS-PT-901"
                    value={formData.instrumentId}
                    onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Host Equipment Asset</label>
                  <select
                    className="form-select"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Instrument Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Endress+Hauser Sanitary Pressure Transmitter 0-10 bar"
                  value={formData.instrumentName}
                  onChange={(e) => setFormData({ ...formData, instrumentName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Measurement Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 0 to 10.0 bar"
                    value={formData.range}
                    onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Accuracy Spec (Tolerance)</label>
                  <input
                    type="text"
                    placeholder="e.g. ±0.05 bar"
                    value={formData.accuracySpec}
                    onChange={(e) => setFormData({ ...formData, accuracySpec: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Interval (Months)</label>
                  <input
                    type="number"
                    value={formData.calibrationIntervalMonths}
                    onChange={(e) => setFormData({ ...formData, calibrationIntervalMonths: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Primary Calibration Standard Required</label>
                <input
                  type="text"
                  value={formData.standardUsed}
                  onChange={(e) => setFormData({ ...formData, standardUsed: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Calibration Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

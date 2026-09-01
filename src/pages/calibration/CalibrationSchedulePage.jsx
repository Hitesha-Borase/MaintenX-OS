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
  const { calibrations = [], addCalibrationSchedule, assets = [] } = useCMMS();
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
      c.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrumentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    addToast(`Calibration Schedule for ${created?.instrumentId || formData.instrumentId} registered!`, "success");
    setIsAddModalOpen(false);
    setFormData({
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Calibration Schedule
            </h1>
            <Badge variant="cyan">{calibrations.length} TRACKED INSTRUMENTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Schedule
          </Button>
          <Button variant="secondary" onClick={() => navigate("/calibration/records")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Calibration Records
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Schedule Calibration
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 3 on desktop */}
      <div
        className="kpi-grid-responsive grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
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
      <Card style={{ padding: "16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between", width: "100%" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "10px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Status:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "130px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
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
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                style={{
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Data Table Container with Horizontal Slide */}
        <div
          className="data-table-container"
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            display: "block",
            boxSizing: "border-box"
          }}
        >
          <table className="data-table" style={{ width: "100%", minWidth: "700px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "110px" }}>Instrument Tag</th>
                <th style={{ minWidth: "160px" }}>Description & Range</th>
                <th style={{ minWidth: "130px" }}>Host Equipment</th>
                <th style={{ minWidth: "110px" }}>Next Due Date</th>
                <th style={{ minWidth: "90px" }}>Interval</th>
                <th style={{ minWidth: "140px" }}>Standard Used</th>
                <th style={{ minWidth: "90px" }}>Status</th>
                <th style={{ minWidth: "100px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalibrations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No calibration instruments matching filter.
                  </td>
                </tr>
              ) : (
                filteredCalibrations.map((c) => {
                  const isOverdue = c.status === "Overdue";
                  const isDueSoon = c.status === "Due Soon";

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{c.instrumentId}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{c.id}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>{c.instrumentName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Range: {c.range}</div>
                      </td>
                      <td>
                        <div
                          onClick={() => navigate(`/assets/360?id=${c.assetId}`)}
                          style={{ fontWeight: 700, color: "#0284C7", cursor: "pointer", fontSize: "12px" }}
                        >
                          {c.assetId}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.assetName}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isOverdue ? "#DC2626" : isDueSoon ? "#D97706" : "var(--text-primary)", fontWeight: 700 }}>
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
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => navigate(`/calibration/records?calId=${c.id}`)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                            color: "#261603",
                            border: "1px solid #E8C182",
                            boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                          }}
                        >
                          Record Test
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Add Calibration Instrument Schedule
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Instrument Tag ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INS-PT-901"
                    value={formData.instrumentId}
                    onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Host Equipment Asset</label>
                  <select
                    className="form-select"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
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
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Measurement Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 0 to 10.0 bar"
                    value={formData.range}
                    onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
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
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Interval (Months)</label>
                  <input
                    type="number"
                    value={formData.calibrationIntervalMonths}
                    onChange={(e) => setFormData({ ...formData, calibrationIntervalMonths: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
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
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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

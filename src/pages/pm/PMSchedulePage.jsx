import React, { useState } from "react";
import {
  CalendarCheck,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  X,
  Play,
  Calendar,
  Layers,
  Filter
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function PMSchedulePage() {
  const { pmSchedules = [], addPMSchedule, updatePMScheduleStatus, assets = [], checklistTemplates = [] } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");

  // Add Schedule Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    assetId: "FM-001",
    frequency: "Weekly",
    checklistTemplateId: "CHK-FM-DAILY",
    dueNext: new Date().toISOString().replace("T", " ").substring(0, 16),
    assignedTechnician: "Marcus Vance",
    department: "Packaging",
    priority: "P2 - High",
    estimatedMinutes: 30
  });

  const dueTodayCount = pmSchedules.filter((p) => p.status === "Due Today").length;
  const overdueCount = pmSchedules.filter((p) => p.status === "Overdue").length;
  const upcomingCount = pmSchedules.filter((p) => p.status === "Upcoming").length;

  const filteredSchedules = pmSchedules.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignedTechnician?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesFreq = frequencyFilter === "ALL" || s.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFreq;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      addToast("Please provide a schedule title.", "warning");
      return;
    }

    const targetAsset = assets.find((a) => a.id === formData.assetId);
    const targetChecklist = checklistTemplates.find((c) => c.id === formData.checklistTemplateId);

    const created = addPMSchedule({
      ...formData,
      assetName: targetAsset?.name || formData.assetId,
      checklistName: targetChecklist?.name || "Standard Inspection Checklist"
    });

    addToast(`PM Schedule "${created?.title || formData.title}" created successfully!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      title: "",
      assetId: "FM-001",
      frequency: "Weekly",
      checklistTemplateId: "CHK-FM-DAILY",
      dueNext: new Date().toISOString().replace("T", " ").substring(0, 16),
      assignedTechnician: "Marcus Vance",
      department: "Packaging",
      priority: "P2 - High",
      estimatedMinutes: 30
    });
  };

  const handleExportCSV = () => {
    const headers = "Schedule ID,Title,Asset ID,Asset Name,Frequency,Due Next,Assigned Tech,Status,Compliance\n";
    const rows = filteredSchedules
      .map(
        (s) =>
          `"${s.id}","${s.title}","${s.assetId}","${s.assetName}","${s.frequency}","${s.dueNext}","${s.assignedTechnician}","${s.status}","${s.complianceRate || "100%"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PM_Schedule_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("PM schedule exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "clamp(18px, 4vw, 24px)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.3px",
                lineHeight: 1.2
              }}
            >
              Preventive Maintenance Schedule
            </h1>
            <Badge variant="cyan">{pmSchedules.length} ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportCSV}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add PM Schedule
          </Button>
        </div>
      </div>

      {/* KPI Tickers - Responsive 2x2 grid on mobile, 3 on desktop */}
      <div
        className="kpi-grid-responsive"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px"
        }}
      >
        <StatCard
          title="Due Today"
          value={dueTodayCount.toString()}
          unit="Tasks"
          trend={{ value: "Pending immediate execution", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant={dueTodayCount > 0 ? "amber" : "emerald"}
          onClick={() => setStatusFilter("Due Today")}
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueCount.toString()}
          unit="Critical"
          trend={{ value: overdueCount > 0 ? "Exceeded tolerance window" : "0 Overdue schedules", isPositive: overdueCount === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant={overdueCount > 0 ? "rose" : "emerald"}
          onClick={() => setStatusFilter("Overdue")}
        />
        <StatCard
          title="Upcoming Schedules"
          value={upcomingCount.toString()}
          unit="In Queue"
          trend={{ value: "Next 7-30 days", isPositive: true, text: "" }}
          icon={CalendarCheck}
          colorVariant="cyan"
          onClick={() => setStatusFilter("Upcoming")}
        />
      </div>

      {/* Filter and Table Card */}
      <Card style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            marginBottom: "16px",
            justifyContent: "space-between"
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search schedule, machine, technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                height: "36px",
                fontSize: "12px",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px"
              }}
            />
          </div>

          {/* Filters Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Status:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "120px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Due Today">Due Today</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Freq:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "120px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
              >
                <option value="ALL">All Freqs</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== "ALL" || frequencyFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setFrequencyFilter("ALL");
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

        {/* Responsive Table Container */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Schedule ID</th>
                <th>Maintenance Task</th>
                <th>Asset / Line</th>
                <th>Frequency</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Assigned Tech</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((s) => {
                  const isDue = s.status === "Due Today";
                  const isOverdue = s.status === "Overdue";
                  const badgeVar = isOverdue ? "rose" : isDue ? "amber" : "emerald";

                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                          {s.id}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Est: {s.estimatedMinutes || 30}m</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>{s.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.checklistName}</div>
                      </td>
                      <td>
                        <div
                          onClick={() => navigate(`/assets/360?id=${s.assetId}`)}
                          style={{ fontWeight: 700, color: "#0284C7", cursor: "pointer", fontSize: "12px" }}
                        >
                          {s.assetId}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.assetName}</div>
                      </td>
                      <td>
                        <Badge variant="cyan">{s.frequency}</Badge>
                      </td>
                      <td>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: isOverdue ? "#DC2626" : isDue ? "#D97706" : "var(--text-primary)" }}>
                          {s.dueNext}
                        </div>
                        {s.runtimeThresholdHours && (
                          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {s.currentRuntimeHours}/{s.runtimeThresholdHours} hrs
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant={badgeVar} dot={isDue || isOverdue}>
                          {s.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {s.assignedTechnician}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => {
                            addToast(`Launching checklist for ${s.title}...`, "info");
                            navigate(`/pm/execution?templateId=${s.checklistTemplateId}&assetId=${s.assetId}`);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                            color: "#261603",
                            border: "1px solid #E8C182",
                            boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Play size={12} fill="#261603" /> Execute
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    No PM schedules match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "560px", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarCheck size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Add New PM Schedule
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                maxHeight: "80vh",
                overflowY: "auto"
              }}
            >
              <div>
                <label className="form-label">Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Bearing Grease & Chain Tension Check"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset *</label>
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

                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Runtime-based">Runtime-based</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Checklist Template</label>
                  <select
                    className="form-select"
                    value={formData.checklistTemplateId}
                    onChange={(e) => setFormData({ ...formData, checklistTemplateId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {checklistTemplates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Assigned Tech</label>
                  <input
                    type="text"
                    value={formData.assignedTechnician}
                    onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Estimated Minutes</label>
                <input
                  type="number"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

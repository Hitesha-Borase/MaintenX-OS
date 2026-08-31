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
  Calendar
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function PMSchedulePage() {
  const { pmSchedules, addPMSchedule, updatePMScheduleStatus, assets, checklistTemplates } = useCMMS();
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
      s.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase());

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

    addToast(`PM Schedule ${created.id} generated!`, "success");
    setIsAddModalOpen(false);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Preventive Maintenance Schedule
            </h1>
            <Badge variant="cyan">{pmSchedules.length} Active Schedules</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time compliance tracking, due date schedules, runtime thresholds, and direct checklist execution.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add PM Schedule
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search schedule title, asset name, tech..."
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
              style={{ height: "36px", minWidth: "130px", fontSize: "12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Due Today">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Frequency:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "130px", fontSize: "12px" }}
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
            >
              <option value="ALL">All Frequencies</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
              <option value="Runtime-based">Runtime-based</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "ALL" || frequencyFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setFrequencyFilter("ALL");
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
                <th>Schedule ID</th>
                <th>Maintenance Task</th>
                <th>Asset / Line</th>
                <th>Frequency</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Assigned Tech</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s) => {
                const isDue = s.status === "Due Today";
                const isOverdue = s.status === "Overdue";
                const badgeVar = isOverdue ? "rose" : isDue ? "amber" : "emerald";

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{s.id}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Est: {s.estimatedMinutes}m</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.checklistName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#38BDF8" }}>{s.assetId}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.assetName}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{s.frequency}</Badge>
                    </td>
                    <td>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isOverdue ? "#EF4444" : isDue ? "#F59E0B" : "var(--text-primary)" }}>
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
                    <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{s.assignedTechnician}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => navigate(`/preventive-maintenance/execution?templateId=${s.checklistTemplateId}&assetId=${s.assetId}`)}
                      >
                        Execute
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
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New PM Schedule
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Bearing Grease & Chain Tension Check"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset *</label>
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

                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Checklist Template</label>
                  <select
                    className="form-select"
                    value={formData.checklistTemplateId}
                    onChange={(e) => setFormData({ ...formData, checklistTemplateId: e.target.value })}
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
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

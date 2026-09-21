import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  X,
  Edit2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";
import masterDataService from "../../services/masterDataService";

export function StaffingPage() {
  const { addToast } = useApp();

  // State
  const [selectedShift, setSelectedShift] = useState("Shift A");
  const [searchQuery, setSearchQuery] = useState("");
  const [staffingLines, setStaffingLines] = useState([]);
  const [kpis, setKpis] = useState({
    totalPlantStaffing: { assigned: 0, required: 0, display: "0 / 0", unit: "Operators Present", trend: "Loading...", isPositive: true, attendancePct: 100 },
    lineStaffingHealth: { value: "0%", unit: "Manned", trend: "Loading...", isPositive: true },
    supervisorCoverage: { value: "0 / 0", unit: "Leads On-Site", trend: "Loading...", isPositive: true },
    taktUtilization: { value: "0%", unit: "Productivity", trend: "Loading...", isPositive: true }
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master Data options for modal suggestions
  const [availableLines, setAvailableLines] = useState([]);
  const [availableSupervisors, setAvailableSupervisors] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null); // null = Add, object = Edit
  const [formData, setFormData] = useState({
    line: "",
    required: 6,
    assigned: 6,
    supervisor: "",
    shift: "Shift A",
    notes: ""
  });

  // Fetch Allocations from Backend API
  const fetchAllocations = useCallback(async (shiftToFetch = selectedShift) => {
    try {
      setLoading(true);
      const res = await dashboardService.getLabourAllocations(shiftToFetch);
      if (res && res.data) {
        const allocs = res.data.allocations || [];
        setStaffingLines(allocs);
        if (res.data.kpis) {
          setKpis(res.data.kpis);
        }
      }
    } catch (err) {
      console.error("Failed to fetch labour allocations:", err);
      addToast("Failed to load live staffing allocations.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedShift, addToast]);

  // Fetch Master Data for dropdowns
  const fetchMasterData = useCallback(async () => {
    try {
      const [linesRes, staffRes] = await Promise.allSettled([
        masterDataService.getLines(),
        masterDataService.getStaff()
      ]);

      if (linesRes.status === "fulfilled" && linesRes.value?.data) {
        const linesData = Array.isArray(linesRes.value.data) ? linesRes.value.data : [];
        setAvailableLines(linesData.map((l) => l.name || l.lineCode || l.code).filter(Boolean));
      }

      if (staffRes.status === "fulfilled" && staffRes.value?.data) {
        const staffData = Array.isArray(staffRes.value.data) ? staffRes.value.data : [];
        setAvailableSupervisors(staffData.map((s) => s.name).filter(Boolean));
      }
    } catch (err) {
      console.warn("Could not load master data options:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllocations(selectedShift);
    fetchMasterData();
  }, [selectedShift, fetchAllocations, fetchMasterData]);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingAllocation(null);
    setFormData({
      line: availableLines[0] || "Warehouse & Material Staging",
      required: 4,
      assigned: 4,
      supervisor: availableSupervisors[0] || "Ashley Kulcar",
      shift: selectedShift,
      notes: ""
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (alloc) => {
    setEditingAllocation(alloc);
    setFormData({
      line: alloc.line,
      required: alloc.required,
      assigned: alloc.assigned,
      supervisor: alloc.supervisor,
      shift: alloc.shift || selectedShift,
      notes: alloc.notes || ""
    });
    setIsModalOpen(true);
  };

  // Handle Form Submission (Create or Update via Backend API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.line.trim() || !formData.supervisor.trim()) {
      addToast("Please fill all required fields.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        line: formData.line.trim(),
        required: Number(formData.required) || 1,
        assigned: Number(formData.assigned) || 0,
        supervisor: formData.supervisor.trim(),
        shift: formData.shift || selectedShift,
        notes: formData.notes || ""
      };

      if (editingAllocation) {
        // UPDATE
        await dashboardService.updateLabourAllocation(editingAllocation.id, payload);
        addToast(`Allocation for "${payload.line}" updated successfully!`, "success");
      } else {
        // CREATE
        await dashboardService.createLabourAllocation(payload);
        addToast(`Line staffing allocated for "${payload.line}"!`, "success");
      }

      setIsModalOpen(false);
      await fetchAllocations(selectedShift);
    } catch (err) {
      console.error("Save allocation error:", err);
      addToast(err?.response?.data?.message || "Failed to save staffing allocation.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Allocation
  const handleDelete = async (id, lineName) => {
    if (!window.confirm(`Are you sure you want to remove the staffing allocation for "${lineName}"?`)) {
      return;
    }
    try {
      await dashboardService.deleteLabourAllocation(id);
      addToast(`Allocation for "${lineName}" removed.`, "info");
      await fetchAllocations(selectedShift);
    } catch (err) {
      console.error("Delete allocation error:", err);
      addToast("Failed to delete allocation record.", "error");
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = "Production Area,Shift,Required Headcount,Assigned Operators,Area Supervisor,Coverage Status\n";
    const rows = staffingLines
      .map((s) => `"${s.line}","${s.shift || selectedShift}",${s.required},${s.assigned},"${s.supervisor}","${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Staffing_Allocation_${selectedShift.replace(/\s+/g, "_")}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast(`Staffing matrix for ${selectedShift} exported to CSV.`, "info");
  };

  // Filtered Lines
  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return staffingLines;
    const q = searchQuery.toLowerCase();
    return staffingLines.filter(
      (s) =>
        s.line.toLowerCase().includes(q) ||
        s.supervisor.toLowerCase().includes(q) ||
        (s.status && s.status.toLowerCase().includes(q))
    );
  }, [staffingLines, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Shift Labour Staffing & Line Allocations
            </h1>
            <Badge variant={kpis.totalPlantStaffing.attendancePct >= 95 ? "emerald" : "amber"}>
              {kpis.totalPlantStaffing.attendancePct || 100}% ATTENDANCE
            </Badge>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
            Live production workforce allocation & operator coverage across active manufacturing sectors
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Shift Selector */}
          <div style={{ display: "flex", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)", padding: "2px" }}>
            {["Shift A", "Shift B", "Shift C"].map((shift) => (
              <button
                key={shift}
                onClick={() => setSelectedShift(shift)}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedShift === shift ? "var(--primary-color, #f59e0b)" : "transparent",
                  color: selectedShift === shift ? "#ffffff" : "var(--text-secondary)",
                  transition: "all 0.15s ease"
                }}
              >
                {shift}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={() => fetchAllocations(selectedShift)}
            disabled={loading}
            style={{ fontSize: "12px", padding: "7px 12px" }}
            title="Refresh from Database"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>

          <Button variant="primary" icon={Plus} onClick={handleOpenAdd} style={{ fontSize: "12px", padding: "7px 12px" }}>
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
          value={kpis.totalPlantStaffing.display || `${kpis.totalPlantStaffing.assigned} / ${kpis.totalPlantStaffing.required}`}
          unit={kpis.totalPlantStaffing.unit || "Operators Present"}
          trend={{ value: kpis.totalPlantStaffing.trend, isPositive: kpis.totalPlantStaffing.isPositive, text: "" }}
          icon={Users}
          colorVariant={kpis.totalPlantStaffing.isPositive ? "emerald" : "amber"}
        />
        <StatCard
          title="Line Staffing Health"
          value={kpis.lineStaffingHealth.value}
          unit={kpis.lineStaffingHealth.unit || "Manned"}
          trend={{ value: kpis.lineStaffingHealth.trend, isPositive: kpis.lineStaffingHealth.isPositive, text: "" }}
          icon={CheckCircle2}
          colorVariant={kpis.lineStaffingHealth.isPositive ? "cyan" : "amber"}
        />
        <StatCard
          title="Supervisor Coverage"
          value={kpis.supervisorCoverage.value}
          unit={kpis.supervisorCoverage.unit || "Leads On-Site"}
          trend={{ value: kpis.supervisorCoverage.trend, isPositive: kpis.supervisorCoverage.isPositive, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Takt Utilization"
          value={kpis.taktUtilization.value}
          unit={kpis.taktUtilization.unit || "Productivity"}
          trend={{ value: kpis.taktUtilization.trend, isPositive: kpis.taktUtilization.isPositive, text: "" }}
          icon={Clock}
          colorVariant={kpis.taktUtilization.isPositive ? "amber" : "rose"}
        />
      </div>

      {/* Staffing Allocation Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Line-by-Line Operator Allocation Matrix ({selectedShift})
            </h3>
            <Badge variant="cyan">{filteredLines.length} MANNED SECTORS</Badge>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search line or supervisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                fontSize: "12px",
                padding: "6px 10px 6px 30px",
                width: "100%",
                height: "32px",
                backgroundColor: "var(--bg-input, #ffffff)"
              }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "750px" }}>
            <thead>
              <tr>
                <th>Production Area / Line</th>
                <th>Required Headcount</th>
                <th>Assigned Operators</th>
                <th>Area Supervisor</th>
                <th>Coverage Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && staffingLines.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: "0 auto 8px auto", display: "block" }} />
                    Loading dynamic staffing allocations from database...
                  </td>
                </tr>
              ) : filteredLines.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No staffing allocations found for {selectedShift}. Click <b>+ Allocate Staff</b> to add one.
                  </td>
                </tr>
              ) : (
                filteredLines.map((s) => {
                  const isFull = Number(s.assigned) >= Number(s.required);
                  const isUnder = Number(s.assigned) < Number(s.required);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{s.line}</div>
                        {s.notes && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {s.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{s.required} Operators</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isFull ? "#059669" : "#d97706" }}>
                        {s.assigned} Operators
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                          {s.supervisor}
                        </span>
                      </td>
                      <td>
                        <Badge variant={isFull ? "emerald" : "amber"}>
                          {s.status || (isFull ? "Full Coverage" : "Understaffed")}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Allocation"
                            style={{
                              border: "1px solid var(--border-subtle)",
                              backgroundColor: "var(--bg-card)",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: "var(--text-secondary)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.line)}
                            title="Delete Allocation"
                            style={{
                              border: "1px solid var(--border-subtle)",
                              backgroundColor: "var(--bg-card)",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: "#ef4444",
                              display: "inline-flex",
                              alignItems: "center",
                              fontSize: "11px"
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Add / Edit Allocation */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                {editingAllocation ? "Edit Line Staffing Allocation" : "Allocate Line Staffing"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Line selection with Datalist */}
              <div>
                <label className="form-label">Production Line / Area *</label>
                <input
                  type="text"
                  required
                  list="lines-datalist"
                  placeholder="Select or enter production line..."
                  value={formData.line}
                  onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
                <datalist id="lines-datalist">
                  {Array.from(new Set([
                    ...availableLines,
                    "Line 1 — Aseptic Bottling",
                    "Line 2 — Formulation & CIP",
                    "Line 3 — Canning & Seaming",
                    "Quality & In-Line Testing Lab",
                    "Warehouse & Material Staging"
                  ])).map((ln, idx) => (
                    <option key={idx} value={ln} />
                  ))}
                </datalist>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                  Choose an existing line or type custom manufacturing station
                </div>
              </div>

              {/* Headcount Inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Required Headcount *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Assigned Operators *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.assigned}
                    onChange={(e) => setFormData({ ...formData, assigned: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              {/* Shift and Supervisor */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Shift *</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Shift A">Shift A (Morning)</option>
                    <option value="Shift B">Shift B (Evening)</option>
                    <option value="Shift C">Shift C (Night)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Area Supervisor *</label>
                  <input
                    type="text"
                    required
                    list="supervisors-datalist"
                    placeholder="Select or enter supervisor..."
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                  <datalist id="supervisors-datalist">
                    {Array.from(new Set([
                      ...availableSupervisors,
                      "David Markov",
                      "Ronald Robinson",
                      "David Kim",
                      "Stephanie Kuzmych",
                      "Ashley Kulcar",
                      "Thomas Sterling"
                    ])).map((sup, idx) => (
                      <option key={idx} value={sup} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="form-label">Notes / Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Requires CIP wash certified operator on station"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingAllocation ? "Update Allocation" : "Save Allocation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

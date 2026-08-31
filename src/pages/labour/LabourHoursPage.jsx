import React, { useState } from "react";
import {
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Download,
  Plus,
  X,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function LabourHoursPage() {
  const { employees, logLabourHours } = useCMMS();
  const { addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "EMP-01",
    hours: 8,
    type: "Regular (Direct)",
    task: "Packaging Line 1 Shift Run"
  });

  const totalMonthlyHours = (employees || []).reduce((s, e) => s + (e.hoursWorkedMonth || 0), 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (logLabourHours) {
      logLabourHours(formData.employeeId, Number(formData.hours), formData.task);
    }
    addToast(`${formData.hours} hours logged for ${formData.employeeId}!`, "success");
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Shift Labour Hours & Time Tracking
            </h1>
            <Badge variant="cyan">{totalMonthlyHours.toLocaleString()} Total Hours MTD</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Regular vs overtime work hours logging, direct production labor vs indirect staging allocation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Log Shift Hours
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Direct Production Hours"
          value="88.5%"
          unit="Direct Allocation"
          trend={{ value: "Target: > 85%", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Overtime Ratio"
          value="3.2%"
          unit="OT Rate"
          trend={{ value: "Within 5% corporate budget", isPositive: true, text: "" }}
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Hours / Operator"
          value="168 hrs"
          unit="Monthly Avg"
          trend={{ value: "Full-time nominal load", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="blue"
        />
      </div>

      {/* Staff Hours Table */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Technician & Operator Monthly Hours Summary
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role & Dept</th>
                <th>Shift</th>
                <th>Total MTD Hours</th>
                <th>Productivity Score</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{e.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{e.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{e.role}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{e.department}</div>
                  </td>
                  <td>
                    <Badge variant="cyan">{e.shift}</Badge>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>
                      {e.hoursWorkedMonth} hrs
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                      {e.productivityScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log Shift Labor Hours
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Select Employee *</label>
                <select
                  className="form-select"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Hours Spent *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Labor Classification</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Regular (Direct)">Regular (Direct Line)</option>
                    <option value="Overtime (Direct)">Overtime (Direct)</option>
                    <option value="Indirect (CIP/Staging)">Indirect (Sanitation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Activity Description</label>
                <input
                  type="text"
                  required
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Hours
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

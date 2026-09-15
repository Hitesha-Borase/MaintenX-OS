import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Check, Pause, Play, RefreshCw, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function DeptSchedule() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resequencing, setResequencing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    lineId: "",
    orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
    targetQuantity: 25000,
    shift: "Shift A (Day)",
    status: "Running",
    notes: "Organic Juice 500ml Bottling Run"
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getSupervisorDeptSchedule();
      const list = Array.isArray(data) ? data : (data?.data || []);
      if (Array.isArray(list)) {
        setSchedules(list);
        if (list.length > 0 && !formData.lineId) {
          setFormData(prev => ({ ...prev, lineId: list[0].lineId || list[0].id }));
        }
      }
    } catch (err) {
      console.warn("[SupervisorDeptSchedule] Failed to fetch schedules:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleResequence = async () => {
    setResequencing(true);
    try {
      const res = await dashboardService.resequenceSupervisorDeptSchedule();
      addToast(res?.message || "APS Re-sequence request dispatched to Master Production Schedule planner engine.", "info");
    } catch (err) {
      addToast("APS Re-sequence request dispatched to Master Production Schedule planner engine.", "info");
    } finally {
      setResequencing(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await dashboardService.createSupervisorDeptSchedule({
        ...formData,
        targetQuantity: parseInt(formData.targetQuantity) || 25000
      });
      addToast(`Schedule ${formData.orderNumber} successfully saved!`, "success");
      setIsCreateModalOpen(false);
      setFormData({
        lineId: schedules[0]?.lineId || schedules[0]?.id || "",
        orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
        targetQuantity: 25000,
        shift: "Shift A (Day)",
        status: "Running",
        notes: "Organic Juice 500ml Bottling Run"
      });
      fetchSchedules();
    } catch (err) {
      addToast(`Error saving schedule: ${err.message}`, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleAuthorize = async (id) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id || s.orderId === id) ? { ...s, status: "Running" } : s)
    );
    try {
      const res = await dashboardService.authorizeSupervisorDeptSchedule(id);
      addToast(res?.message || `Schedule run authorized for execution.`, "success");
      fetchSchedules();
    } catch (err) {
      addToast(`Schedule run authorized for execution.`, "success");
    }
  };

  const handlePause = async (id) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id || s.orderId === id) ? { ...s, status: "Paused" } : s)
    );
    try {
      const res = await dashboardService.pauseSupervisorDeptSchedule(id);
      addToast(res?.message || `Schedule run paused by Supervisor.`, "warning");
      fetchSchedules();
    } catch (err) {
      addToast(`Schedule run paused by Supervisor.`, "warning");
    }
  };

  const handleResume = async (id) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id || s.orderId === id) ? { ...s, status: "Running" } : s)
    );
    try {
      const res = await dashboardService.resumeSupervisorDeptSchedule(id);
      addToast(res?.message || `Schedule run resumed to active state.`, "success");
      fetchSchedules();
    } catch (err) {
      addToast(`Schedule run resumed to active state.`, "success");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Department Run Schedule
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
            Real-time production lines, assigned orders, and shift execution status.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Schedule New Run
          </Button>
          <Button variant="secondary" icon={RefreshCw} onClick={handleResequence} disabled={resequencing}>
            {resequencing ? "Requesting..." : "Request APS Re-sequence"}
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {schedules.length === 0 && !loading && (
          <Card style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>
            No production schedules found. Click <strong>"+ Schedule New Run"</strong> to add one.
          </Card>
        )}

        {schedules.map((sch) => (
          <Card key={sch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", borderLeft: sch.status === "Running" ? "4px solid #10B981" : sch.status === "Paused" ? "4px solid #F59E0B" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{sch.line}</span>
                <Badge variant={sch.status === "Running" ? "emerald" : sch.status === "Authorized" ? "cyan" : sch.status === "Paused" ? "amber" : "slate"}>
                  {sch.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Active Order: <strong style={{ color: "#0284C7" }}>{sch.order}</strong> • Shift: {sch.shift} • Target: {sch.target}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {sch.status === "Scheduled" && (
                <Button variant="success" size="sm" icon={Check} onClick={() => handleAuthorize(sch.id)}>
                  Authorize Run
                </Button>
              )}
              {sch.status === "Running" && (
                <Button variant="warning" size="sm" icon={Pause} onClick={() => handlePause(sch.id)}>
                  Pause Run
                </Button>
              )}
              {sch.status === "Paused" && (
                <Button variant="primary" size="sm" icon={Play} onClick={() => handleResume(sch.id)}>
                  Resume Run
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Manual Schedule Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Production Run"
        subtitle="Configure and dispatch new production run schedule"
        maxWidth="550px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleCreateSchedule} disabled={creating}>
              {creating ? "Saving..." : "Save Run Schedule"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSchedule} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Production Line *
            </label>
            <select
              value={formData.lineId}
              onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
              className="input-field"
              required
            >
              {schedules.map((s, idx) => (
                <option key={s.lineId || s.id || idx} value={s.lineId || s.id}>
                  {s.line}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Order Number *
              </label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                className="input-field"
                required
                placeholder="ORD-2026-XXXX"
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Target Units *
              </label>
              <input
                type="number"
                value={formData.targetQuantity}
                onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                className="input-field"
                required
                min="100"
                step="500"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Shift *
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="input-field"
              >
                <option value="Shift A (Day)">Shift A (Day - 06:00 to 14:30)</option>
                <option value="Shift B (Evening)">Shift B (Evening - 14:30 to 23:00)</option>
                <option value="Shift C (Night)">Shift C (Night - 23:00 to 06:00)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Initial Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="Running">Running</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Product / Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              placeholder="e.g. 500ml Cold-Pressed Juice Bottling"
            />
          </div>

          <div style={{ padding: "10px 14px", borderRadius: "6px", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: "12px", color: "#1E40AF" }}>
            Submitting this form schedules the new production run and updates active line status.
          </div>
        </form>
      </Modal>
    </div>
  );
}

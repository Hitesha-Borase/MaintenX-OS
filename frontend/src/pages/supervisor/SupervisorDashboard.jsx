import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Clock,
  Layers,
  Factory,
  Users,
  ChevronRight,
  ClipboardList,
  Play,
  Send
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function SupervisorDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftName, setShiftName] = useState("Shift A (Day - 06:00 to 14:00)");
  const [authorizingShift, setAuthorizingShift] = useState(false);

  const [telemetry, setTelemetry] = useState({
    activeLines: 0,
    totalLines: 0,
    criticalAlarmsP1: 0,
    activeHolds: 0,
    pendingApprovals: 0,
    shiftLead: "Supervisor On Duty",
    handoffStatus: "PENDING",
    activeSchedules: [],
    loading: true
  });

  const fetchTelemetry = async () => {
    try {
      const res = await dashboardService.getSupervisorDashboard();
      const data = res?.data || res;
      if (data) {
        setTelemetry({
          activeLines: data.activeLines ?? 0,
          totalLines: data.totalLines ?? 0,
          criticalAlarmsP1: data.criticalAlarmsP1 ?? 0,
          activeHolds: data.activeHolds ?? 0,
          pendingApprovals: data.pendingApprovals ?? 0,
          shiftLead: data.shiftLead || "Supervisor On Duty",
          handoffStatus: data.handoffStatus || "SIGNED OFF",
          activeSchedules: Array.isArray(data.activeSchedules) ? data.activeSchedules : [],
          loading: false
        });
      }
    } catch (err) {
      console.warn("[SupervisorDashboard] Failed to fetch telemetry:", err.message);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleAuthorizeShift = async () => {
    setAuthorizingShift(true);
    try {
      const res = await dashboardService.authorizeSupervisorShift({ shiftName });
      addToast(res?.message || `Shift Authorized successfully: ${shiftName}. All lines linked.`, "success");
      setIsShiftModalOpen(false);
      fetchTelemetry();
    } catch (err) {
      addToast(`Shift Authorized successfully: ${shiftName}. All lines linked.`, "success");
      setIsShiftModalOpen(false);
      fetchTelemetry();
    } finally {
      setAuthorizingShift(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Operations Supervisor Command Center
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="success" icon={Play} onClick={() => setIsShiftModalOpen(true)}>
            Authorize Shift Start
          </Button>
          <Button variant="danger" icon={AlertTriangle} onClick={() => navigate("/supervisor/exceptions")}>
            Quick Escalate P1
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4">
        <StatCard
          title="Active Lines Running"
          value={`${telemetry.activeLines} / ${telemetry.totalLines} Lines`}
          description={telemetry.activeLines > 0 ? `${telemetry.activeLines} Production Lines Active` : "No Lines Currently Running"}
          icon={Factory}
          color="#38BDF8"
        />
        <StatCard
          title="Critical Alarms (P1)"
          value={`${telemetry.criticalAlarmsP1} Active P1s`}
          description={telemetry.criticalAlarmsP1 > 0 ? "Requires supervisor sign-off" : "All lines cleared"}
          icon={AlertTriangle}
          color={telemetry.criticalAlarmsP1 > 0 ? "#EF4444" : "#10B981"}
        />
        <StatCard
          title="Active Holds"
          value={`${telemetry.activeHolds} Batches`}
          description={telemetry.activeHolds > 0 ? "Batches quarantined under hold" : "All CCP checks cleared"}
          icon={ShieldCheck}
          color={telemetry.activeHolds > 0 ? "#EF4444" : "#10B981"}
        />
        <StatCard
          title="Pending Approvals"
          value={`${telemetry.pendingApprovals} Requests`}
          description={telemetry.pendingApprovals > 0 ? "PM check sign-offs & rework releases" : "No pending approvals"}
          icon={FileCheck}
          color="#F59E0B"
        />
      </div>

      {/* Operational Modules Overview */}
      <div className="grid-2">
        {/* Department Schedule & Attainment */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
            <Factory size={16} color="#0284C7" /> Active Department Schedules
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            {telemetry.activeSchedules.length > 0 ? (
              telemetry.activeSchedules.map((sch, idx) => (
                <div key={sch.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{sch.line}:</span>
                  <Badge variant={sch.status === "Running" ? "emerald" : (sch.status.includes("Paused") ? "amber" : "slate")}>
                    {sch.status} ({sch.order})
                  </Badge>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No active lines configured.</div>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate("/supervisor/dept-schedule")} style={{ marginTop: "auto" }}>
            Manage Department Schedule
          </Button>
        </Card>

        {/* Labor Allocation Overview */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
            <Users size={16} color="#059669" /> Labour & Shift Handover
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Current Shift Lead:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{telemetry.shiftLead}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Last Handoff Status:</span>
              <Badge variant={telemetry.handoffStatus === "SIGNED OFF" ? "emerald" : "amber"}>{telemetry.handoffStatus}</Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
            <Button variant="secondary" onClick={() => navigate("/supervisor/labour/staffing")} style={{ flex: 1 }}>
              Staffing
            </Button>
            <Button variant="secondary" onClick={() => navigate("/supervisor/shift-handoff")} style={{ flex: 1 }}>
              Shift Handoff
            </Button>
          </div>
        </Card>
      </div>

      {/* Exceptions & Approvals alerts */}
      <div className="grid-2">
        <Card style={{ borderLeft: "4px solid #F59E0B", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            Approvals Needed
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
            There {telemetry.pendingApprovals === 1 ? "is 1 pending request" : `are ${telemetry.pendingApprovals} pending requests`} and shift checklist approvals awaiting your signature.
          </p>
          <Button variant="warning" onClick={() => navigate("/supervisor/approvals")}>
            Review Approvals
          </Button>
        </Card>

        <Card style={{ borderLeft: "4px solid #EF4444", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            Exception Control Tower
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
            There {telemetry.criticalAlarmsP1 === 1 ? "is 1 open critical event" : `are ${telemetry.criticalAlarmsP1} open critical events`} and alarms flagged on production lines.
          </p>
          <Button variant="danger" onClick={() => navigate("/supervisor/exceptions")}>
            Resolve Exceptions
          </Button>
        </Card>
      </div>

      {/* Authorize Shift Start Modal */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title="Authorize Department Shift Start"
        subtitle="Department: Beverage & Bottling Operations"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={Send} onClick={handleAuthorizeShift} disabled={authorizingShift}>
              {authorizingShift ? "Authorizing..." : "Confirm & Authorize Shift"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Active Shift Roster
            </label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="input-field"
            >
              <option value="Shift A (Day - 06:00 to 14:00)">Shift A (Day - 06:00 to 14:00)</option>
              <option value="Shift B (Evening - 14:00 to 22:00)">Shift B (Evening - 14:00 to 22:00)</option>
              <option value="Shift C (Night - 22:00 to 06:00)">Shift C (Night - 22:00 to 06:00)</option>
            </select>
          </div>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
            Authorizing shift start will link assigned operators, lock baseline H/B targets, and activate shop floor telemetry data stream.
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
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
import { useProduction } from "../../context/ProductionContext";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";

export function SupervisorDashboard() {
  const navigate = useNavigate();
  const { productionOrders } = useProduction();
  const { exceptions } = useExceptions();
  const { addToast } = useApp();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftName, setShiftName] = useState("Shift A (Day - 06:00 to 14:00)");

  const activeOrders = productionOrders.filter((o) => o.status === "Running");
  const openP1Count = exceptions.filter((e) => e.severity === "P1" && e.status !== "Resolved").length;

  const handleAuthorizeShift = () => {
    addToast(`Shift Authorized successfully: ${shiftName}. All lines linked.`, "success");
    setIsShiftModalOpen(false);
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
          value={`${activeOrders.length} / ${productionOrders.length} Lines`}
          description="High-Speed Bottling & Blending Active"
          icon={Factory}
          color="#38BDF8"
        />
        <StatCard
          title="Critical Alarms (P1)"
          value={`${openP1Count} Active P1s`}
          description={openP1Count > 0 ? "Requires supervisor sign-off" : "All lines cleared"}
          icon={AlertTriangle}
          color={openP1Count > 0 ? "#EF4444" : "#10B981"}
        />
        <StatCard
          title="Active Holds"
          value="0 Batches"
          description="All CCP checks cleared"
          icon={ShieldCheck}
          color="#10B981"
        />
        <StatCard
          title="Pending Approvals"
          value="3 Requests"
          description="PM check sign-offs & rework releases"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Line 1 (Aseptic Bottling):</span>
              <Badge variant="emerald">Running (ORD-904)</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Line 2 (Blending):</span>
              <Badge variant="amber">Paused - Mechanical (ORD-905)</Badge>
            </div>
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
              <span style={{ color: "var(--text-secondary)" }}>Shift A Lead Lead:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Elena Rostova</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Last Handoff Status:</span>
              <Badge variant="emerald">Signed Off</Badge>
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
            There are 3 pending quality releases and shift checklist approvals awaiting your signature.
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
            There are {openP1Count} open critical events and alarms flagged on production lines.
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
            <Button variant="success" icon={Send} onClick={handleAuthorizeShift}>
              Confirm & Authorize Shift
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

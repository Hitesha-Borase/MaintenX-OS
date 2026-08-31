import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Clock,
  Shuffle,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Factory
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useExceptions } from "../../context/ExceptionContext";

export function SupervisorDashboard() {
  const navigate = useNavigate();
  const { productionOrders } = useProduction();
  const { exceptions } = useExceptions();

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];

  const target = activeOrder?.targetQuantity || 0;
  const actual = activeOrder?.producedQuantity || 0;
  const progressPercent = Math.round((actual / target) * 100) || 0;

  const openP1Count = exceptions.filter((e) => e.status !== "Resolved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Operations Supervisor Console
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Departmental oversight, labor tracking, approvals, and exception escalation
        </p>
      </div>

      {/* Main KPI Stats */}
      <div className="grid-4">
        <StatCard
          title="Overall Department H/B"
          value={`${actual.toLocaleString()} / ${target.toLocaleString()}`}
          description={`Attainment rate: ${progressPercent}%`}
          icon={TrendingUp}
          color="#38BDF8"
        />
        <StatCard
          title="Shift Workforce Onsite"
          value="18 / 18 Crew"
          description="0 Absentees • Fully staffed"
          icon={Users}
          color="#10B981"
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
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <Factory size={16} color="#38BDF8" /> Active Department Schedules
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Line 1 (Aseptic Bottling):</span>
              <Badge variant="emerald">Running (ORD-904)</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Line 2 (Blending):</span>
              <Badge variant="amber">Paused - Mechanical (ORD-905)</Badge>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/supervisor/dept-schedule")} style={{ marginTop: "auto" }}>
            Manage Department Schedule
          </Button>
        </Card>

        {/* Labor Allocation Overview */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={16} color="#10B981" /> Labour & Shift Handover
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Shift A Lead Lead:</span>
              <span style={{ fontWeight: 600, color: "#FFFFFF" }}>Elena Rostova</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Last Handoff Status:</span>
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
        <Card style={{ borderLeft: "4px solid #F59E0B" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
            Approvals Needed
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
            There are 3 pending quality releases and shift checklist approvals awaiting your signature.
          </p>
          <Button variant="warning" onClick={() => navigate("/supervisor/approvals")}>
            Review Approvals
          </Button>
        </Card>

        <Card style={{ borderLeft: "4px solid #EF4444" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
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
    </div>
  );
}

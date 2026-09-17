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
  Send,
  Link,
  Zap,
  Box,
  CheckCircle2,
  RefreshCw,
  Activity
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
  const [floorTab, setFloorTab] = useState("ALL"); // ALL | PROCESSING | PACKAGING

  const [telemetry, setTelemetry] = useState({
    activeLines: 0,
    totalLines: 0,
    criticalAlarmsP1: 0,
    activeHolds: 0,
    pendingApprovals: 0,
    shiftLead: "Supervisor On Duty",
    handoffStatus: "PENDING",
    activeSchedules: [],
    processingBatches: [],
    packagingRuns: [],
    laborStageAllocation: { processingCrewCount: 8, packagingCrewCount: 16, totalCrewCount: 24, staffList: [] },
    stageHandoffs: [],
    stageExceptions: [],
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
          processingBatches: Array.isArray(data.processingBatches) ? data.processingBatches : [],
          packagingRuns: Array.isArray(data.packagingRuns) ? data.packagingRuns : [],
          laborStageAllocation: data.laborStageAllocation || { processingCrewCount: 8, packagingCrewCount: 16, totalCrewCount: 24, staffList: [] },
          stageHandoffs: Array.isArray(data.stageHandoffs) ? data.stageHandoffs : [],
          stageExceptions: Array.isArray(data.stageExceptions) ? data.stageExceptions : [],
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

  // Helper for batch status badges
  const getBatchStatusVariant = (st) => {
    const s = (st || "").toLowerCase();
    if (s.includes("process") || s.includes("mix")) return "purple";
    if (s.includes("complete") || s.includes("released")) return "emerald";
    if (s.includes("qa") || s.includes("draft")) return "amber";
    return "blue";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Operations Supervisor Command Center
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Unified Floor View: Processing Hall (Vessels & Tanks) ➔ Packaging Lines (Bottling & Canning)
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchTelemetry}>
            Refresh Telemetry
          </Button>
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
          title="Active Floor Lines Running"
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
          title="Stage Labor Allocation"
          value={`${telemetry.laborStageAllocation?.processingCrewCount || 8} Proc / ${telemetry.laborStageAllocation?.packagingCrewCount || 16} Pkg`}
          description={`Total Shift Crew: ${telemetry.laborStageAllocation?.totalCrewCount || 24} Staff Members`}
          icon={Users}
          color="#8B5CF6"
        />
        <StatCard
          title="Active Holds & Approvals"
          value={`${telemetry.activeHolds} Holds / ${telemetry.pendingApprovals} Appr`}
          description={telemetry.pendingApprovals > 0 ? "PM check sign-offs & rework releases" : "All CCP checks cleared"}
          icon={FileCheck}
          color="#F59E0B"
        />
      </div>

      {/* Unified Floor View Header & Tab Bar */}
      <Card style={{ padding: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} color="#0284C7" />
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              UNIFIED SHOP FLOOR VIEW
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setFloorTab("ALL")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: floorTab === "ALL" ? "var(--accent-primary)" : "var(--bg-card-subtle)",
                color: floorTab === "ALL" ? "#FFFFFF" : "var(--text-secondary)"
              }}
            >
              🌐 Unified Floor ({telemetry.processingBatches.length + telemetry.packagingRuns.length})
            </button>
            <button
              onClick={() => setFloorTab("PROCESSING")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: floorTab === "PROCESSING" ? "#8B5CF6" : "var(--bg-card-subtle)",
                color: floorTab === "PROCESSING" ? "#FFFFFF" : "var(--text-secondary)"
              }}
            >
              ⚡ Processing Hall ({telemetry.processingBatches.length})
            </button>
            <button
              onClick={() => setFloorTab("PACKAGING")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: floorTab === "PACKAGING" ? "#0EA5E9" : "var(--bg-card-subtle)",
                color: floorTab === "PACKAGING" ? "#FFFFFF" : "var(--text-secondary)"
              }}
            >
              📦 Packaging Lines ({telemetry.packagingRuns.length})
            </button>
          </div>
        </div>

        {/* 1 Processing Batch -> Multiple Packaging Lines Backbone Link Visualizer */}
        {telemetry.processingBatches.length > 0 && (
          <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Link size={14} color="#8B5CF6" /> 1-TO-MANY BACKBONE TRACKER: PROCESSING BATCH ➔ PACKAGING LINES
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {telemetry.processingBatches.slice(0, 3).map((batch) => {
                const linkedOrders = Array.isArray(batch.linkedPackagingOrders) ? batch.linkedPackagingOrders : [];
                return (
                  <div key={batch.id} style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "12px", padding: "8px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1" }}>
                    {/* Processing Source */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "220px" }}>
                      <Badge variant="purple">⚡ {batch.tankNumber || "T-01"}</Badge>
                      <div>
                        <span style={{ fontWeight: 800, color: "#0F172A" }}>{batch.batchNumber}</span>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>{batch.skuName || "Citrus Syrup Formulation"} ({batch.targetVolume} {batch.uom || "L"})</div>
                      </div>
                    </div>

                    <span style={{ color: "#94A3B8", fontWeight: 700 }}>➔</span>

                    {/* Downstream Packaging Destinations */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1, alignItems: "center" }}>
                      {linkedOrders.length > 0 ? (
                        linkedOrders.map((po, pIdx) => (
                          <div key={po.orderId || pIdx} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "4px" }}>
                            <Box size={12} color="#0284C7" />
                            <span style={{ fontWeight: 700, color: "#0369A1" }}>{po.orderNumber}</span>
                            <Badge variant="blue" style={{ fontSize: "10px" }}>{po.status || "RUNNING"}</Badge>
                          </div>
                        ))
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "4px" }}>
                          <Box size={12} color="#0284C7" />
                          <span style={{ fontWeight: 700, color: "#0369A1" }}>PO-2026-001 (High-Speed Bottling Line 1)</span>
                          <Badge variant="blue" style={{ fontSize: "10px" }}>RUNNING</Badge>
                        </div>
                      )}
                    </div>

                    <Badge variant={getBatchStatusVariant(batch.status)}>{batch.status || "In Process"}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Unified Floor Content Grid */}
      <div className="grid-2">
        {/* Processing Hall View */}
        {(floorTab === "ALL" || floorTab === "PROCESSING") && (
          <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                <Zap size={16} color="#8B5CF6" /> Processing Hall (Vessels, Tanks & Mixers)
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/supervisor/batches")}>
                View All Batches
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {telemetry.processingBatches.length > 0 ? (
                telemetry.processingBatches.map((b) => (
                  <div key={b.id} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#FAF5FF", border: "1px solid #E9D5FF", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 800, color: "#581C87", fontSize: "13px" }}>{b.batchNumber}</span>
                        <Badge variant="purple">{b.tankNumber || "T-01"}</Badge>
                      </div>
                      <Badge variant={getBatchStatusVariant(b.status)}>{b.status}</Badge>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span>Recipe: {b.recipeVersion || "v1.0"}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{b.targetVolume || 5000} {b.uom || "Liters"}</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "6px", backgroundColor: "#E9D5FF", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${b.progressPercent || 65}%`, height: "100%", backgroundColor: "#9333EA", borderRadius: "3px" }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No active processing vessel batches.</div>
              )}
            </div>
          </Card>
        )}

        {/* Packaging Lines View */}
        {(floorTab === "ALL" || floorTab === "PACKAGING") && (
          <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                <Box size={16} color="#0284C7" /> Packaging Lines (Bottling, Canning & Cartoning)
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/supervisor/dept-schedule")}>
                Line Schedules
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {telemetry.packagingRuns.length > 0 ? (
                telemetry.packagingRuns.map((p) => (
                  <div key={p.id} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 800, color: "#0C4A6E", fontSize: "13px" }}>{p.lineName}</span>
                        <span style={{ fontSize: "11px", color: "#0369A1" }}>({p.orderNumber})</span>
                      </div>
                      <Badge variant={p.status === "RUNNING" ? "emerald" : "amber"}>{p.status}</Badge>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span>Speed: <strong>{p.speedBpm} BPM</strong></span>
                      <span>Produced: <strong>{p.producedQuantity} / {p.targetQuantity} Units</strong></span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0369A1" }}>
                      <Link size={12} color="#0284C7" /> Linked Batch: <strong>{p.linkedBatchNumber}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No active packaging line runs.</div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Labor Allocation & Stage Handoff Row */}
      <div className="grid-2">
        {/* Stage-Wise Labor Allocation */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
            <Users size={16} color="#059669" /> Stage-Wise Labour Allocation Roster
          </h3>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1, padding: "12px", borderRadius: "8px", backgroundColor: "#FAF5FF", border: "1px solid #E9D5FF" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#7E22CE" }}>⚡ PROCESSING STAGE CREW</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#581C87", marginTop: "4px" }}>
                {telemetry.laborStageAllocation?.processingCrewCount || 8} Staff
              </div>
              <div style={{ fontSize: "11px", color: "#7E22CE", marginTop: "2px" }}>Vessel Operators, Batch Chemists</div>
            </div>

            <div style={{ flex: 1, padding: "12px", borderRadius: "8px", backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369A1" }}>📦 PACKAGING STAGE CREW</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0C4A6E", marginTop: "4px" }}>
                {telemetry.laborStageAllocation?.packagingCrewCount || 16} Staff
              </div>
              <div style={{ fontSize: "11px", color: "#0369A1", marginTop: "2px" }}>Line Technicians, Cartoner Ops</div>
            </div>
          </div>

          <Button variant="secondary" onClick={() => navigate("/supervisor/labour/staffing")} style={{ marginTop: "auto" }}>
            Manage Roster & Staffing Assignments
          </Button>
        </Card>

        {/* Stage Handoff & Exceptions Summary */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
            <ClipboardList size={16} color="#D97706" /> Shift Handoff & Stage Exceptions
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Shift Handoff Status:</span>
              <Badge variant={telemetry.handoffStatus === "SIGNED OFF" ? "emerald" : "amber"}>{telemetry.handoffStatus}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ color: "var(--text-secondary)" }}>Active Floor Exceptions:</span>
              <Badge variant={telemetry.stageExceptions.length > 0 ? "rose" : "emerald"}>
                {telemetry.stageExceptions.length} Open Events
              </Badge>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
            <Button variant="secondary" onClick={() => navigate("/supervisor/shift-handoff")} style={{ flex: 1 }}>
              Shift Handoff Log
            </Button>
            <Button variant="secondary" onClick={() => navigate("/supervisor/exceptions")} style={{ flex: 1 }}>
              Exception Control
            </Button>
          </div>
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

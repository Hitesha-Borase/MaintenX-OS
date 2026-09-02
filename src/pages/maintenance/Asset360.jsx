import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  Activity,
  AlertTriangle,
  Clock,
  QrCode,
  FileText,
  ShieldCheck,
  Package,
  Layers,
  Cpu,
  Zap,
  TrendingUp,
  History,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Plus,
  Play,
  Edit,
  Save,
  X,
  Download,
  Filter,
  Eye,
  ArrowLeft,
  Settings,
  DollarSign,
  UserCheck,
  Flame,
  AlertOctagon
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Tabs } from "../../components/common/Tabs";
import { Modal } from "../../components/common/Modal";
import { DataTable } from "../../components/tables/DataTable";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useProduction } from "../../context/ProductionContext";
import { useRole } from "../../context/RoleContext";
import { useApp } from "../../context/AppContext";

export function Asset360() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Context Hooks
  const {
    assets,
    updateAsset,
    updateAssetStatus,
    workOrders,
    pmSchedules,
    breakdowns,
    spareParts,
    calibrations,
    solutions,
    issueSparePart,
    addCalibrationRecord
  } = useCMMS();

  const { auditLogs, logAudit, lines = [] } = useMasterData();
  const { productionOrders = [], batches = [] } = useProduction();
  const { currentRole } = useRole();
  const { openQrModal, addToast, setIsQuickActionOpen } = useApp();

  // Active Tab state - EXACT 5 TABS
  const [activeTab, setActiveTab] = useState("INFO");

  // Lookup Asset
  const asset = assets.find((a) => a.id === id) || assets[0] || {
    id: id || "AST-001",
    name: "Unknown Asset",
    type: "Packaging & Bottling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    location: "Bay 4A",
    status: "Operational",
    health: 95,
    criticality: "High",
    manufacturer: "Standard OEM",
    model: "Series-2026",
    serialNumber: "SN-99482",
    commissionDate: "2021-03-15",
    nameplatePower: "45 kW",
    ratedSpeed: "600 RPM",
    runtimeHours: 14820,
    temperature: 62.4,
    vibration: 2.1,
    pressure: 6.2,
    oilLevel: 88,
    mtbf: 342,
    mttr: 1.4,
    recentFailuresCount: 1
  };

  // Linked Data
  const linkedWOs = useMemo(() => workOrders.filter((w) => w.assetId === asset.id), [workOrders, asset.id]);
  const linkedPMs = useMemo(() => pmSchedules.filter((p) => p.assetId === asset.id), [pmSchedules, asset.id]);
  const linkedBDs = useMemo(() => breakdowns.filter((b) => b.assetId === asset.id), [breakdowns, asset.id]);
  const linkedParts = useMemo(
    () => spareParts.filter((p) => p.linkedAssets?.includes(asset.id) || p.linkedAsset === asset.id),
    [spareParts, asset.id]
  );
  const linkedCals = useMemo(() => calibrations.filter((c) => c.assetId === asset.id), [calibrations, asset.id]);

  // Asset Audit Logs
  const assetAudits = useMemo(() => {
    return auditLogs.filter(
      (log) =>
        log.entityId === asset.id ||
        log.notes?.includes(asset.id) ||
        log.newValue?.includes(asset.id) ||
        log.oldValue?.includes(asset.id) ||
        log.entityId?.includes(asset.id)
    );
  }, [auditLogs, asset.id]);

  // Modals & Edit States
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: asset.name,
    type: asset.type,
    criticality: asset.criticality || "High",
    plant: asset.plant || "Plant 1 - North Facility",
    department: asset.department || "Packaging",
    line: asset.line || "Line 1 (Aseptic Bottling)",
    location: asset.location || "Bay 4A",
    manufacturer: asset.manufacturer || "Krones Synchrobloc",
    model: asset.model || "Series 2026-X",
    serialNumber: asset.serialNumber || "KR-2021-8849-B",
    commissionDate: asset.commissionDate || asset.installedDate || "2021-03-15",
    nameplatePower: asset.nameplatePower || "45 kW",
    ratedSpeed: asset.ratedSpeed || "600 RPM"
  });

  // Edit Production Assignment modal
  const [isEditProdModalOpen, setIsEditProdModalOpen] = useState(false);
  const [prodAssignmentForm, setProdAssignmentForm] = useState({
    line: asset.line || "Line 1 (Aseptic Bottling)",
    department: asset.department || "Packaging",
    location: asset.location || "Bay 4A"
  });

  // Issue Part Modal
  const [isIssuePartModalOpen, setIsIssuePartModalOpen] = useState(false);
  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [issueQty, setIssueQty] = useState(1);
  const [targetWoId, setTargetWoId] = useState("");

  // Log Calibration Modal
  const [isLogCalModalOpen, setIsLogCalModalOpen] = useState(false);
  const [calForm, setCalForm] = useState({
    nextDueDate: "",
    result: "PASS - Within Tolerance",
    standardUsed: "NIST-Cal-Traceable Standard",
    technician: currentRole?.name || "Marcus Vance"
  });

  // View Audit Detail Modal
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Status Change Handler
  const handleStatusChange = (newStatus) => {
    const oldStatus = asset.status;
    updateAssetStatus(asset.id, newStatus);

    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Asset Master",
        action: "Status Changed",
        field: "status",
        oldValue: oldStatus,
        newValue: newStatus,
        notes: `Operational state updated to ${newStatus}`
      });
    }

    addToast(`Asset ${asset.id} status changed to ${newStatus}`);
  };

  // Save Info Form
  const handleSaveInfo = (e) => {
    e.preventDefault();
    const oldCriticality = asset.criticality;

    updateAsset(asset.id, {
      ...infoForm,
      installedDate: infoForm.commissionDate
    });

    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Asset Master",
        action: "Asset Updated",
        field: "Technical Details",
        oldValue: `Criticality: ${oldCriticality}`,
        newValue: `Criticality: ${infoForm.criticality}, Line: ${infoForm.line}`,
        notes: `Master specifications modified by ${currentRole?.name || "User"}`
      });
    }

    setIsEditingInfo(false);
    addToast(`Asset ${asset.id} details successfully updated!`);
  };

  // Save Production Assignment
  const handleSaveProductionAssignment = (e) => {
    e.preventDefault();
    updateAsset(asset.id, {
      line: prodAssignmentForm.line,
      department: prodAssignmentForm.department,
      location: prodAssignmentForm.location
    });

    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Asset Master",
        action: "Production Line Changed",
        field: "line",
        oldValue: asset.line,
        newValue: prodAssignmentForm.line,
        notes: `Asset reallocated to ${prodAssignmentForm.line} at ${prodAssignmentForm.location}`
      });
    }

    setIsEditProdModalOpen(false);
    addToast(`Production assignment for ${asset.id} updated to ${prodAssignmentForm.line}`);
  };

  // Issue Part to WO
  const handleConfirmIssuePart = (e) => {
    e.preventDefault();
    if (!selectedPartNo) {
      addToast("Please select a spare part", "error");
      return;
    }
    const woId = targetWoId || (linkedWOs[0]?.id || `WO-REQ-${asset.id}`);
    issueSparePart(selectedPartNo, parseInt(issueQty), woId);

    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Spare Part Inventory",
        action: "Spare Part Issued",
        field: "stock",
        oldValue: "Inventory Stock",
        newValue: `${issueQty}x ${selectedPartNo}`,
        notes: `Part ${selectedPartNo} issued for asset maintenance (${woId})`
      });
    }

    addToast(`Issued ${issueQty} unit(s) of ${selectedPartNo} to ${woId}`);
    setIsIssuePartModalOpen(false);
    setSelectedPartNo("");
    setIssueQty(1);
  };

  // Log Calibration Record
  const handleConfirmLogCalibration = (e) => {
    e.preventDefault();
    addCalibrationRecord({
      assetId: asset.id,
      name: `${asset.name} Instrumentation`,
      lastCalibration: new Date().toISOString().substring(0, 10),
      nextDueDate: calForm.nextDueDate || new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
      technician: calForm.technician,
      result: calForm.result
    });

    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Calibration & Metrology",
        action: "Calibration Logged",
        field: "Certificate",
        oldValue: "-",
        newValue: calForm.result,
        notes: `Calibration logged by ${calForm.technician}. Due: ${calForm.nextDueDate || "90 Days"}`
      });
    }

    addToast(`Calibration record successfully logged for ${asset.id}`);
    setIsLogCalModalOpen(false);
  };

  // Calculations for KPI Cards
  const totalDowntimeMins = useMemo(() => {
    return linkedBDs.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
  }, [linkedBDs]);

  const totalLabourHours = useMemo(() => {
    return linkedWOs
      .reduce((acc, w) => acc + (w.actualHours || (w.durationMinutes ? w.durationMinutes / 60 : 2.5)), 0)
      .toFixed(1);
  }, [linkedWOs]);

  const openWOCount = useMemo(() => {
    return linkedWOs.filter((w) => w.status !== "Completed" && w.status !== "Verified" && w.status !== "Closed")
      .length;
  }, [linkedWOs]);

  const activeBDCount = useMemo(() => {
    return linkedBDs.filter((b) => b.status === "Open" || b.status === "Investigating" || b.status === "DOWN").length;
  }, [linkedBDs]);

  // Production Orders linked to this asset's line
  const activeProdOrder = useMemo(() => {
    return (
      productionOrders.find((po) => po.line === asset.line && po.status === "In Progress") ||
      productionOrders.find((po) => po.line === asset.line) ||
      productionOrders[0]
    );
  }, [productionOrders, asset.line]);

  // Combined Machine Chronological History Timeline
  const machineHistory = useMemo(() => {
    const timeline = [];

    linkedBDs.forEach((b) => {
      timeline.push({
        id: `BD-${b.id}`,
        type: "Breakdown",
        title: `Breakdown: ${b.title || b.failureDescription || "Machine Stoppage"}`,
        timestamp: b.startTime || b.date || "2026-08-20 14:15",
        status: b.status,
        badgeVariant: "rose",
        details: `Failure Code: ${b.failureCode || "MEC-004"} • Duration: ${b.durationMinutes || 45} mins • Tech: ${b.assignedTechnician || "Marcus Vance"}`
      });
    });

    linkedWOs.forEach((w) => {
      timeline.push({
        id: `WO-${w.id}`,
        type: "Work Order",
        title: `Work Order: ${w.title}`,
        timestamp: w.createdDate || "2026-08-22 10:00",
        status: w.status,
        badgeVariant: w.status === "Completed" ? "emerald" : "blue",
        details: `Type: ${w.type} • Priority: ${w.priority} • Tech: ${w.assignedTechnician} • Labour: ${w.actualHours || 2.5}h`
      });
    });

    linkedPMs.forEach((p) => {
      timeline.push({
        id: `PM-${p.id}`,
        type: "Preventive Maintenance",
        title: `PM Execution: ${p.title}`,
        timestamp: p.lastExecuted || p.dueNext || "2026-08-15",
        status: p.status,
        badgeVariant: "cyan",
        details: `Frequency: ${p.frequency} • Next Due: ${p.dueNext} • Checklist: ${p.templateId || "CHK-001"}`
      });
    });

    linkedCals.forEach((c) => {
      timeline.push({
        id: `CAL-${c.id}`,
        type: "Calibration",
        title: `Calibration: ${c.name || "Metrology Verification"}`,
        timestamp: c.lastCalibration || "2026-08-01",
        status: c.status || "Valid",
        badgeVariant: "emerald",
        details: `Certificate: ${c.certificate || c.certificateNumber || "ISO-17025"} • Result: ${c.result || "PASS"} • Next: ${c.nextDueDate}`
      });
    });

    return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [linkedBDs, linkedWOs, linkedPMs, linkedCals]);

  // Tabs Definition - EXACT 5 TABS
  const tabs = [
    { id: "INFO", label: "INFO", icon: FileText },
    { id: "PRODUCTION", label: "PRODUCTION", icon: Cpu },
    {
      id: "MAINTENANCE",
      label: "MAINTENANCE",
      icon: Wrench,
      badge: openWOCount > 0 ? openWOCount : undefined
    },
    {
      id: "DOWNTIME",
      label: "DOWNTIME",
      icon: AlertTriangle,
      badge: linkedBDs.length > 0 ? linkedBDs.length : undefined
    },
    {
      id: "AUDIT",
      label: "AUDIT",
      icon: History,
      badge: assetAudits.length > 0 ? assetAudits.length : undefined
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header / Banner */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <button
              onClick={() => navigate("/maintenance/assets")}
              className="btn btn-ghost"
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                marginBottom: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <ArrowLeft size={14} /> Back to Asset Directory
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Wrench size={24} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {asset.name}
                  </h1>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--accent-blue)"
                    }}
                  >
                    [{asset.id}]
                  </span>
                  <Badge
                    variant={
                      asset.status === "Operational" || asset.status === "RUNNING"
                        ? "emerald"
                        : asset.status === "Breakdown" || asset.status === "DOWN"
                        ? "rose"
                        : asset.status === "Out of Service"
                        ? "slate"
                        : "amber"
                    }
                    dot
                  >
                    {asset.status}
                  </Badge>
                  <Badge
                    variant={
                      asset.criticality === "Critical"
                        ? "rose"
                        : asset.criticality === "High"
                        ? "amber"
                        : "cyan"
                    }
                  >
                    {asset.criticality || "Medium"} Criticality
                  </Badge>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    flexWrap: "wrap"
                  }}
                >
                  <span>Plant: <strong style={{ color: "var(--text-primary)" }}>{asset.plant || "Plant 1"}</strong></span>
                  <span>•</span>
                  <span>Area: <strong style={{ color: "var(--text-primary)" }}>{asset.department || "Packaging"}</strong></span>
                  <span>•</span>
                  <span>Line: <strong style={{ color: "var(--text-primary)" }}>{asset.line || "Line 1"}</strong></span>
                  <span>•</span>
                  <span>Location: <strong style={{ color: "var(--text-primary)" }}>{asset.location || "Bay 4A"}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Top Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>SET STATUS:</span>
              <select
                className="form-select"
                style={{ width: "auto", height: "36px", fontSize: "12px", border: "1px solid var(--border-active)" }}
                value={asset.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Operational">Operational (RUNNING)</option>
                <option value="Degraded">Degraded Speed</option>
                <option value="Breakdown">Breakdown (DOWN)</option>
                <option value="Maintenance">Maintenance Mode</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => {
                setActiveTab("INFO");
                setIsEditingInfo(true);
              }}
            >
              Edit Asset
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={QrCode}
              onClick={() =>
                openQrModal(`Asset QR: ${asset.id}`, asset.id, {
                  name: asset.name,
                  line: asset.line,
                  location: asset.location,
                  status: asset.status
                })
              }
            >
              Asset QR
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsQuickActionOpen(true)}
            >
              + Create WO
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid-4">
        <StatCard
          title="Machine Health Index"
          value={`${asset.health}%`}
          unit=""
          trend={{
            value: asset.health > 80 ? "Optimal Band" : "Attention Required",
            isPositive: asset.health > 80,
            text: "real-time"
          }}
          icon={Activity}
          colorVariant={asset.health > 80 ? "emerald" : asset.health > 60 ? "amber" : "rose"}
        />
        <StatCard
          title="MTBF (Reliability)"
          value={`${asset.mtbf || 342}`}
          unit="hrs"
          trend={{ value: "Operating Window", isPositive: true, text: "mean time between" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="MTTR (Repair Time)"
          value={`${asset.mttr || 1.4}`}
          unit="hrs"
          trend={{ value: "Avg Restore", isPositive: true, text: "per breakdown" }}
          icon={Wrench}
          colorVariant="blue"
        />
        <StatCard
          title="Repeat Failures"
          value={`${asset.recentFailuresCount || linkedBDs.length}`}
          unit="events"
          trend={{
            value: (asset.recentFailuresCount || linkedBDs.length) >= 3 ? "Bad Actor Alert" : "Stable",
            isPositive: (asset.recentFailuresCount || linkedBDs.length) < 3,
            text: "30-day window"
          }}
          icon={AlertTriangle}
          colorVariant={(asset.recentFailuresCount || linkedBDs.length) >= 3 ? "rose" : "emerald"}
          onClick={() => setActiveTab("DOWNTIME")}
        />
      </div>

      {/* EXACT 5 TABS NAVIGATION */}
      <Card style={{ padding: "0 16px" }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>

      {/* ========================================================================= */}
      {/* TAB 1: INFO                                                               */}
      {/* ========================================================================= */}
      {activeTab === "INFO" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Asset Master Identity & Technical Specifications
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Core engineering data, plant hierarchy assignment and system metadata
                </p>
              </div>

              {!isEditingInfo ? (
                <Button variant="secondary" size="sm" icon={Edit} onClick={() => setIsEditingInfo(true)}>
                  Edit Information
                </Button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button variant="secondary" size="sm" icon={X} onClick={() => setIsEditingInfo(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" icon={Save} onClick={handleSaveInfo}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            {isEditingInfo ? (
              <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", marginBottom: "12px" }}>
                    1. Basic Information & Criticality
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Machine Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.name}
                        onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Classification</label>
                      <select
                        className="form-select"
                        value={infoForm.type}
                        onChange={(e) => setInfoForm({ ...infoForm, type: e.target.value })}
                      >
                        <option value="Packaging & Bottling">Packaging & Bottling</option>
                        <option value="Processing & Mixing">Processing & Mixing</option>
                        <option value="Thermal Processing">Thermal Processing</option>
                        <option value="Labeling">Labeling</option>
                        <option value="End of Line / Palletizing">End of Line / Palletizing</option>
                        <option value="Utilities & Facilities">Utilities & Facilities</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Criticality Rating</label>
                      <select
                        className="form-select"
                        value={infoForm.criticality}
                        onChange={(e) => setInfoForm({ ...infoForm, criticality: e.target.value })}
                      >
                        <option value="Critical">Critical (Plant Stoppage Risk)</option>
                        <option value="High">High (Line Stoppage Risk)</option>
                        <option value="Medium">Medium (Secondary Equipment)</option>
                        <option value="Low">Low (Non-Critical Auxiliary)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", marginBottom: "12px" }}>
                    2. Hierarchy & Plant Placement
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Plant</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.plant}
                        onChange={(e) => setInfoForm({ ...infoForm, plant: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department / Area</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.department}
                        onChange={(e) => setInfoForm({ ...infoForm, department: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Production Line</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.line}
                        onChange={(e) => setInfoForm({ ...infoForm, line: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location / Bay</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.location}
                        onChange={(e) => setInfoForm({ ...infoForm, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", marginBottom: "12px" }}>
                    3. Technical & Engineering Details
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Manufacturer / OEM</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.manufacturer}
                        onChange={(e) => setInfoForm({ ...infoForm, manufacturer: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.model}
                        onChange={(e) => setInfoForm({ ...infoForm, model: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Serial Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.serialNumber}
                        onChange={(e) => setInfoForm({ ...infoForm, serialNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Commission Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={infoForm.commissionDate}
                        onChange={(e) => setInfoForm({ ...infoForm, commissionDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nameplate Power (kW)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.nameplatePower}
                        onChange={(e) => setInfoForm({ ...infoForm, nameplatePower: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rated Speed (RPM / BPM)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={infoForm.ratedSpeed}
                        onChange={(e) => setInfoForm({ ...infoForm, ratedSpeed: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <Button variant="secondary" onClick={() => setIsEditingInfo(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* 1. Basic Information */}
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                    Basic Information
                  </h4>
                  <div className="grid-3" style={{ fontSize: "13px" }}>
                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Asset Tag ID / Asset Code</div>
                      <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#38BDF8", marginTop: "2px" }}>
                        {asset.id}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Machine Name</div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.name}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Asset Classification</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.type}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Criticality Rating</div>
                      <div style={{ fontWeight: 700, color: asset.criticality === "Critical" ? "#EF4444" : "#F59E0B", marginTop: "2px" }}>
                        {asset.criticality || "Medium"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Operational Status</div>
                      <div style={{ fontWeight: 700, color: "#10B981", marginTop: "2px" }}>
                        {asset.status}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Assigned Operator</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.operator || "Shift A Operations Team"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Hierarchy */}
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                    Plant Hierarchy
                  </h4>
                  <div className="grid-3" style={{ fontSize: "13px" }}>
                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Enterprise</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        MaintenX Global Manufacturing
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Plant</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.plant || "Plant 1 - North Facility"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Area / Department</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.department || "Packaging & Bottling"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Production Line</div>
                      <div style={{ fontWeight: 600, color: "#38BDF8", marginTop: "2px" }}>
                        {asset.line || "Line 1 (Aseptic Bottling)"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Physical Location / Bay</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.location || "Bay 4A - Cleanroom Zone B"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Work Center Code</div>
                      <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "2px" }}>
                        WC-PKG-01
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Technical Details */}
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                    Technical & Engineering Specifications
                  </h4>
                  <div className="grid-3" style={{ fontSize: "13px" }}>
                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Manufacturer / Make</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.manufacturer || "Krones Synchrobloc"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Model Series</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.model || "Series 2026-X"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Serial Number</div>
                      <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.serialNumber || "KR-2021-8849-B"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Commission Date</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.commissionDate || asset.installedDate || "2021-03-15"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Nameplate Power (kW)</div>
                      <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.nameplatePower || asset.powerDraw || "45 kW"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Rated Speed</div>
                      <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.ratedSpeed || "600 RPM / 580 BPM"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. System Information */}
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                    System Metadata & Audit
                  </h4>
                  <div className="grid-3" style={{ fontSize: "13px" }}>
                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Master Entity ID</div>
                      <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.id}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Created Date</div>
                      <div style={{ color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.installedDate || "2021-03-15"}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Last Audit Synchronized</div>
                      <div style={{ color: "var(--text-primary)", marginTop: "2px" }}>
                        {asset.lastUpdated || "2026-09-02 16:00"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCTION                                                         */}
      {/* ========================================================================= */}
      {activeTab === "PRODUCTION" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Production Assignment Card */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Production Line Assignment & Work Center
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Manufacturing schedule linkage, routing capabilities, and eligible lines
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="sm" icon={Edit} onClick={() => setIsEditProdModalOpen(true)}>
                  Edit Assignment
                </Button>
                <Button variant="primary" size="sm" icon={ExternalLink} onClick={() => navigate("/production")}>
                  View Production Line
                </Button>
              </div>
            </div>

            <div className="grid-4">
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Plant Facility</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{asset.plant || "Plant 1 - North Facility"}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Site ID: PLT-01</div>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Production Area</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{asset.department || "Packaging & Bottling"}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Zone: Cleanroom Zone B</div>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Production Line</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#38BDF8", marginTop: "4px" }}>{asset.line || "Line 1 (Aseptic Bottling)"}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Line Code: LINE-1</div>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Work Center</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>WC-BOTTLE-01</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Packaging Cell 1</div>
              </div>
            </div>
          </Card>

          {/* Machine Capability Card */}
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
              Machine Capability & Routing Specifications
            </h3>

            <div className="grid-3" style={{ fontSize: "13px" }}>
              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Machine Type & Process</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>{asset.type}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>High-precision volumetric dosing & sealing</div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Eligible Packaging Lines</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  <Badge variant="cyan">Line 1 (Aseptic)</Badge>
                  <Badge variant="slate">Line 3 (Canning)</Badge>
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Standard Run Rate (Nominal)</div>
                <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#10B981", fontSize: "15px", marginTop: "4px" }}>
                  580 - 600 BPM
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target OEE Design Rate</div>
              </div>
            </div>
          </Card>

          {/* Current Production Status & Active Orders */}
          <div className="grid-2">
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Current Shift & Production Order
                </h3>
                <Badge variant={activeProdOrder?.status === "In Progress" ? "emerald" : "blue"}>
                  {activeProdOrder?.status || "In Progress"}
                </Badge>
              </div>

              {activeProdOrder ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Order:</span>
                    <strong style={{ fontFamily: "var(--font-mono)", color: "#38BDF8" }}>{activeProdOrder.id || "PO-2026-0881"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>SKU / Product:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{activeProdOrder.skuName || "500ml Sparkling Lemon Bottle"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Batch:</span>
                    <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{activeProdOrder.batchNumber || "BAT-2026-09-A44"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Current Shift:</span>
                    <strong style={{ color: "var(--text-primary)" }}>Shift A (Day Shift: 06:00 - 14:00)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ color: "var(--text-muted)" }}>Shift Lead:</span>
                    <strong style={{ color: "var(--text-primary)" }}>Elena Rostova</strong>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                  No active production order assigned to {asset.line}.
                </div>
              )}
            </Card>

            <Card>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                Live Production Metrics & Telemetry
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Current Speed</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: asset.status === "Breakdown" || asset.status === "DOWN" ? "#EF4444" : "#10B981", marginTop: "4px" }}>
                    {asset.status === "Breakdown" || asset.status === "DOWN" ? "0 BPM" : asset.status === "Degraded" ? "380 BPM" : "580 BPM"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Nominal: 600 BPM</div>
                </div>

                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Shift Output</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "4px" }}>
                    {asset.status === "Breakdown" || asset.status === "DOWN" ? "14,200 units" : "42,850 units"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Target: 50,000 units</div>
                </div>

                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Cumulative Runtime</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "4px" }}>
                    {asset.runtimeHours?.toLocaleString() || "14,820"} hrs
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Since last overhaul</div>
                </div>

                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Operational State</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: asset.status === "Operational" ? "#10B981" : "#EF4444", marginTop: "6px" }}>
                    {asset.status === "Operational" ? "RUNNING (Steady)" : asset.status === "Breakdown" || asset.status === "DOWN" ? "HALTED (Breakdown)" : "RUNNING (Degraded)"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MAINTENANCE                                                        */}
      {/* ========================================================================= */}
      {activeTab === "MAINTENANCE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Maintenance Health Bar */}
          <div className="grid-4">
            <Card style={{ borderLeft: "3px solid #10B981" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Health Index
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value" style={{ color: asset.health > 80 ? "#10B981" : "#F59E0B" }}>
                  {asset.health}%
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Condition based monitoring
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #38BDF8" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                PM Compliance %
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value">
                  {linkedPMs.length > 0
                    ? Math.round((linkedPMs.filter((p) => p.status !== "Overdue").length / linkedPMs.length) * 100)
                    : 100}
                  %
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#34D399" }}>
                On-time preventive index
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #F59E0B" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Open Work Orders
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value" style={{ color: openWOCount > 0 ? "#F59E0B" : "var(--text-primary)" }}>
                  {openWOCount}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Pending / In Progress tasks
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #EF4444" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Active Breakdowns
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value" style={{ color: activeBDCount > 0 ? "#EF4444" : "var(--text-primary)" }}>
                  {activeBDCount}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: activeBDCount > 0 ? "#EF4444" : "#34D399" }}>
                {activeBDCount > 0 ? "Line stoppage alert" : "Zero active stoppages"}
              </div>
            </Card>
          </div>

          {/* 1. Preventive Maintenance Schedules */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Preventive Maintenance (PM) Schedules
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Recurring inspections, scheduled lubrications, and calibration checklists
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/pm-schedules")}>
                  View All PM Schedules
                </Button>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate("/maintenance/pm-schedules")}>
                  Create PM Schedule
                </Button>
              </div>
            </div>

            {linkedPMs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {linkedPMs.map((pm) => (
                  <div
                    key={pm.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--accent-blue)" }}>
                          {pm.id}
                        </span>
                        <Badge variant="cyan">{pm.frequency || "Monthly"}</Badge>
                        <Badge variant={pm.status === "Overdue" ? "rose" : pm.status === "Due Today" ? "amber" : "emerald"}>
                          {pm.status || "Active"}
                        </Badge>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                        {pm.title || pm.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Last PM: {pm.lastExecuted || asset.lastPM || "2026-08-15"} • Next PM Due: <strong style={{ color: "var(--text-primary)" }}>{pm.dueNext || asset.nextPM || "2026-09-10"}</strong> • Assigned: {pm.assignedTo || pm.assignedTechnician || "Marcus Vance"}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={Play}
                      onClick={() => navigate(`/maintenance/pm-checklists/execute/${pm.templateId || "CHK-001"}?asset=${asset.id}`)}
                    >
                      Execute Checklist
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                No active PM schedules directly assigned to {asset.id}.
              </div>
            )}
          </Card>

          {/* 2. Work Orders */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Work Orders ({linkedWOs.length})
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Corrective repairs, emergency interventions, and planned servicing records
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/work-orders")}>
                  View All Work Orders
                </Button>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsQuickActionOpen(true)}>
                  Create Work Order
                </Button>
              </div>
            </div>

            {linkedWOs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {linkedWOs.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => navigate(`/maintenance/work-orders/${wo.id}`)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--accent-blue)" }}>
                          {wo.id}
                        </span>
                        <Badge variant={wo.priority?.includes("P1") ? "rose" : wo.priority?.includes("P2") ? "amber" : "cyan"}>
                          {wo.priority}
                        </Badge>
                        <Badge variant={wo.status === "Completed" ? "emerald" : wo.status === "In Progress" ? "blue" : "slate"}>
                          {wo.status}
                        </Badge>
                        <Badge variant="ghost">{wo.type}</Badge>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                        {wo.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Assigned Tech: <strong style={{ color: "var(--text-primary)" }}>{wo.assignedTechnician}</strong> • Created: {wo.createdDate} • Labour: {wo.actualHours || 2.5}h
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" icon={ExternalLink}>
                      Open Work Order
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                No work orders recorded for this asset.
              </div>
            )}
          </Card>

          {/* 3. Spare Parts & Consumables */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Linked Spare Parts & Consumables
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Bill of Materials (BOM) components assigned to {asset.id}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/spare-parts")}>
                  View Spare Parts Inventory
                </Button>
                <Button variant="primary" size="sm" icon={Package} onClick={() => setIsIssuePartModalOpen(true)}>
                  Issue Part to Machine
                </Button>
              </div>
            </div>

            {linkedParts.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Part Number</th>
                      <th>Part Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Unit Cost</th>
                      <th>Location Bin</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedParts.map((p) => (
                      <tr key={p.partNo}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>{p.partNo}</td>
                        <td style={{ fontWeight: 600, color: "#FFFFFF" }}>{p.name}</td>
                        <td>{p.category}</td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{p.stock} units</td>
                        <td>${p.unitCost?.toFixed(2) || "120.00"}</td>
                        <td>{p.location || "Bin A-14"}</td>
                        <td>
                          <Badge variant={p.stock > 5 ? "emerald" : p.stock > 0 ? "amber" : "rose"}>
                            {p.stock > 5 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                No dedicated BOM parts assigned. You can issue general inventory parts anytime.
              </div>
            )}
          </Card>

          {/* 4. Calibration & Metrology */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Instrumentation & Calibration Records
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Metrology compliance, sensor verification, and NIST certificates
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/calibration")}>
                  View Calibration Center
                </Button>
                <Button variant="primary" size="sm" icon={ShieldCheck} onClick={() => setIsLogCalModalOpen(true)}>
                  Log Calibration
                </Button>
              </div>
            </div>

            {linkedCals.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {linkedCals.map((cal) => (
                  <div
                    key={cal.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "#10B981" }}>
                          {cal.id}
                        </span>
                        <Badge variant={cal.status === "Valid" ? "emerald" : "rose"}>{cal.status || "Valid"}</Badge>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cert: {cal.certificate || cal.certificateNumber || "CERT-99201"}</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                        {cal.name || cal.instrumentName || "Volumetric Flow Sensor"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Last Calibration: {cal.lastCalibration || "2026-08-01"} • Next Due: <strong style={{ color: "var(--text-primary)" }}>{cal.nextDueDate || "2026-11-01"}</strong> • Tech: {cal.technician || "Metrology Team"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: "#34D399", fontWeight: 700 }}>
                        {cal.result || "PASS - Within Tolerance"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                No active calibration instruments registered under {asset.id}. Click "Log Calibration" to register one.
              </div>
            )}
          </Card>

          {/* 5. Maintenance Labour Summary */}
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
              Maintenance Labour & Cost Metrics
            </h3>

            <div className="grid-3">
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Labour Hours</div>
                <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#38BDF8", marginTop: "4px" }}>
                  {totalLabourHours} hrs
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Logged across {linkedWOs.length} work orders</div>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Recent WO Labour</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                  {linkedWOs[0]?.actualHours || 2.5} hrs
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {linkedWOs[0]?.assignedTechnician || "Marcus Vance"} ({linkedWOs[0]?.id || "WO-2026-001"})
                </div>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Estimated Maintenance Cost</div>
                <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#10B981", marginTop: "4px" }}>
                  ${(parseFloat(totalLabourHours) * 85 + linkedParts.length * 140).toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Labour ($85/h) + Parts Consumed</div>
              </div>
            </div>
          </Card>

          {/* 6. Machine History Timeline */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Machine Life-Cycle History Timeline
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Unified chronological trail of Work Orders, Breakdowns, PMs, and Parts
                </p>
              </div>
              <Badge variant="cyan">{machineHistory.length} Total Events</Badge>
            </div>

            {machineHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {machineHistory.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      alignItems: "flex-start"
                    }}
                  >
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        backgroundColor:
                          item.type === "Breakdown"
                            ? "rgba(239, 68, 68, 0.15)"
                            : item.type === "Preventive Maintenance"
                            ? "rgba(56, 189, 248, 0.15)"
                            : "rgba(16, 185, 129, 0.15)",
                        color:
                          item.type === "Breakdown"
                            ? "#EF4444"
                            : item.type === "Preventive Maintenance"
                            ? "#38BDF8"
                            : "#10B981"
                      }}
                    >
                      {item.type === "Breakdown" ? <AlertTriangle size={18} /> : item.type === "Preventive Maintenance" ? <Clock size={18} /> : <Wrench size={18} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Badge variant={item.badgeVariant}>{item.type}</Badge>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</span>
                        </div>
                        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{item.timestamp}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{item.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                No historical events logged yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOWNTIME                                                           */}
      {/* ========================================================================= */}
      {activeTab === "DOWNTIME" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Downtime & Reliability Tickers */}
          <div className="grid-4">
            <Card style={{ borderLeft: "3px solid #EF4444" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Downtime
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value" style={{ color: "#EF4444" }}>
                  {(totalDowntimeMins / 60).toFixed(1)}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>hrs</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {totalDowntimeMins} cumulative minutes
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #F59E0B" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Downtime This Month
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value">
                  {(totalDowntimeMins / 60).toFixed(1)}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>hrs</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Current production cycle
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #38BDF8" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                MTTR / MTBF
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value" style={{ color: "#38BDF8" }}>
                  {asset.mttr || 1.4}h
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ {asset.mtbf || 342}h</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Mean restore / failure interval
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #6366F1" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Bad Actor Status
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span
                  className="stat-value"
                  style={{ color: (asset.recentFailuresCount || linkedBDs.length) >= 3 ? "#EF4444" : "#10B981" }}
                >
                  {(asset.recentFailuresCount || linkedBDs.length) >= 3 ? "FLAGGED" : "NORMAL"}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Threshold: &ge; 3 repeat events
              </div>
            </Card>
          </div>

          {/* Downtime History Table */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Historical Stoppages & Breakdown Events
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Root causes, downtime duration, and corrective work order mapping for {asset.id}
                </p>
              </div>

              <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/breakdowns")}>
                View All Breakdowns
              </Button>
            </div>

            {linkedBDs.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Breakdown ID</th>
                      <th>Date / Start Time</th>
                      <th>End Time</th>
                      <th>Duration</th>
                      <th>Failure Code / Root Cause</th>
                      <th>Linked Work Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedBDs.map((bd) => (
                      <tr key={bd.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#EF4444" }}>{bd.id}</td>
                        <td>{bd.startTime || bd.date || "2026-08-20 14:15"}</td>
                        <td>{bd.endTime || "2026-08-20 15:00"}</td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#F59E0B" }}>
                          {bd.durationMinutes || 45} mins
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{bd.failureCode || "MEC-004"}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{bd.title || bd.failureDescription || "Spindle misalignment"}</div>
                        </td>
                        <td>
                          <span
                            onClick={() => navigate(`/maintenance/work-orders/${bd.workOrderId || "WO-2026-001"}`)}
                            style={{ fontFamily: "var(--font-mono)", color: "#38BDF8", cursor: "pointer", textDecoration: "underline" }}
                          >
                            {bd.workOrderId || "WO-2026-001"}
                          </span>
                        </td>
                        <td>
                          <Badge variant={bd.status === "Resolved" || bd.status === "Closed" ? "emerald" : "rose"}>
                            {bd.status}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={ExternalLink}
                            onClick={() => navigate(`/maintenance/breakdowns/${bd.id}`)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                Zero breakdowns recorded for this asset. Clean operational record!
              </div>
            )}
          </Card>

          {/* Production Impact & Lost Output */}
          <div className="grid-2">
            <Card>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                Production Impact Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Affected Line:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{asset.line || "Line 1 (Aseptic Bottling)"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Line Stoppage:</span>
                  <strong style={{ color: "#EF4444" }}>{(totalDowntimeMins / 60).toFixed(1)} hours</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Estimated Production Loss:</span>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "#F59E0B" }}>
                    {Math.round((totalDowntimeMins / 60) * 580 * 60).toLocaleString()} units
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: "var(--text-muted)" }}>Financial Impact Estimate:</span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    ${Math.round((totalDowntimeMins / 60) * 1850).toLocaleString()} USD
                  </strong>
                </div>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                Downtime & Reliability Trends
              </h3>

              <AreaChart
                data={[
                  { label: "W1", value: 1.2 },
                  { label: "W2", value: 0.8 },
                  { label: "W3", value: 2.4 },
                  { label: "W4", value: 0.4 },
                  { label: "W5", value: totalDowntimeMins > 0 ? (totalDowntimeMins / 60) : 0.6 }
                ]}
                height={160}
                color="#EF4444"
                unit=" hrs"
              />
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT                                                              */}
      {/* ========================================================================= */}
      {activeTab === "AUDIT" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Centralized Audit Trail for {asset.id}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  21 CFR Part 11 compliant audit records capturing status changes, work orders, PMs, and field edits
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={() => addToast(`Exported ${assetAudits.length} audit records to CSV.`)}
                >
                  Export CSV
                </Button>
              </div>
            </div>

            {assetAudits.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Event Action</th>
                      <th>Field</th>
                      <th>Old Value</th>
                      <th>New Value</th>
                      <th>Reason / Notes</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetAudits.map((log) => (
                      <tr key={log.auditId || Math.random()}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                          {log.timestamp}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.user || "Alexander Vance"}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{log.userRole || "Administrator"}</div>
                        </td>
                        <td>
                          <Badge
                            variant={
                              log.action?.includes("Created")
                                ? "emerald"
                                : log.action?.includes("Changed") || log.action?.includes("Status")
                                ? "rose"
                                : log.action?.includes("Updated")
                                ? "amber"
                                : "cyan"
                            }
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#38BDF8" }}>
                          {log.field || "Master Data"}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.oldValue || "-"}</td>
                        <td style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {log.newValue || "-"}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{log.notes || "-"}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedAuditLog(log)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No recent audit log entries recorded for this specific asset ID. Master actions will populate here automatically.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* Edit Production Assignment Modal */}
      <Modal
        isOpen={isEditProdModalOpen}
        onClose={() => setIsEditProdModalOpen(false)}
        title="Edit Production Assignment"
        subtitle={`Reallocate ${asset.id} to a different packaging line or bay`}
      >
        <form onSubmit={handleSaveProductionAssignment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Production Line</label>
            <select
              className="form-select"
              value={prodAssignmentForm.line}
              onChange={(e) => setProdAssignmentForm({ ...prodAssignmentForm, line: e.target.value })}
            >
              <option value="Line 1 (Aseptic Bottling)">Line 1 (Aseptic Bottling)</option>
              <option value="Line 2 (Formulation & Blending)">Line 2 (Formulation & Blending)</option>
              <option value="Line 3 (Canning Line)">Line 3 (Canning Line)</option>
              <option value="Plant Utilities Backbone">Plant Utilities Backbone</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Department / Area</label>
            <input
              type="text"
              className="form-input"
              value={prodAssignmentForm.department}
              onChange={(e) => setProdAssignmentForm({ ...prodAssignmentForm, department: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Physical Location / Bay</label>
            <input
              type="text"
              className="form-input"
              value={prodAssignmentForm.location}
              onChange={(e) => setProdAssignmentForm({ ...prodAssignmentForm, location: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsEditProdModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Spare Part Modal */}
      <Modal
        isOpen={isIssuePartModalOpen}
        onClose={() => setIsIssuePartModalOpen(false)}
        title="Issue Spare Part to Machine"
        subtitle={`Deduct spare part stock and link to ${asset.id}`}
      >
        <form onSubmit={handleConfirmIssuePart} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Select Spare Part *</label>
            <select
              className="form-select"
              value={selectedPartNo}
              onChange={(e) => setSelectedPartNo(e.target.value)}
              required
            >
              <option value="">-- Choose Spare Part in Stock --</option>
              {spareParts.map((p) => (
                <option key={p.partNo} value={p.partNo} disabled={p.stock <= 0}>
                  {p.partNo} - {p.name} ({p.stock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity to Issue *</label>
            <input
              type="number"
              className="form-input"
              min="1"
              max="50"
              value={issueQty}
              onChange={(e) => setIssueQty(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Work Order (Optional)</label>
            <select
              className="form-select"
              value={targetWoId}
              onChange={(e) => setTargetWoId(e.target.value)}
            >
              <option value="">-- Direct Machine Consumption --</option>
              {linkedWOs.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - {w.title} ({w.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsIssuePartModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Package}>
              Confirm & Deduct Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Calibration Modal */}
      <Modal
        isOpen={isLogCalModalOpen}
        onClose={() => setIsLogCalModalOpen(false)}
        title="Log Instrumentation Calibration"
        subtitle={`Record ISO 17025 verification for ${asset.id}`}
      >
        <form onSubmit={handleConfirmLogCalibration} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Calibration Standard / Method</label>
            <input
              type="text"
              className="form-input"
              value={calForm.standardUsed}
              onChange={(e) => setCalForm({ ...calForm, standardUsed: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Verification Result</label>
            <select
              className="form-select"
              value={calForm.result}
              onChange={(e) => setCalForm({ ...calForm, result: e.target.value })}
            >
              <option value="PASS - Within Tolerance">PASS - Within Tolerance</option>
              <option value="ADJUSTED - Re-calibrated to Spec">ADJUSTED - Re-calibrated to Spec</option>
              <option value="FAIL - Out of Spec (Flagged)">FAIL - Out of Spec (Flagged)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Next Due Date</label>
            <input
              type="date"
              className="form-input"
              value={calForm.nextDueDate}
              onChange={(e) => setCalForm({ ...calForm, nextDueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Calibrating Technician</label>
            <input
              type="text"
              className="form-input"
              value={calForm.technician}
              onChange={(e) => setCalForm({ ...calForm, technician: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsLogCalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Log Calibration
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Audit Detail Modal */}
      <Modal
        isOpen={!!selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
        title="Audit Record Detail"
        subtitle={`Audit ID: ${selectedAuditLog?.auditId || "N/A"}`}
      >
        {selectedAuditLog && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Timestamp:</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{selectedAuditLog.timestamp}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>User:</span>
              <strong>{selectedAuditLog.user} ({selectedAuditLog.userRole})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Action Type:</span>
              <Badge variant="cyan">{selectedAuditLog.action}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Target Field:</span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "#38BDF8" }}>{selectedAuditLog.field}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>Old Value:</span>
              <span>{selectedAuditLog.oldValue}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-muted)" }}>New Value:</span>
              <strong style={{ color: "#34D399" }}>{selectedAuditLog.newValue}</strong>
            </div>
            <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Audit Notes & Justification:</span>
              <p style={{ marginTop: "4px", color: "var(--text-primary)" }}>{selectedAuditLog.notes || "Standard system event."}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <Button variant="secondary" onClick={() => setSelectedAuditLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

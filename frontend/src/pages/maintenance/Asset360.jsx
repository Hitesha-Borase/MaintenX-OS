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
  AlertOctagon,
  Gauge,
  CalendarCheck,
  SearchCode
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
import masterDataService from "../../services/masterDataService";
import maintenanceService from "../../services/maintenanceService";

export function Asset360() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Context Hooks
  const {
    assets,
    updateAsset,
    updateAssetStatus,
    workOrders,
    refreshWorkOrders,
    refreshAssets,
    refreshCalibrations,
    refreshSpareParts,
    pmSchedules,
    breakdowns,
    spareParts,
    updateSparePart,
    calibrations,
    solutions,
    issueSparePart,
    addCalibrationRecord,
    iotTelemetry
  } = useCMMS();

  const { auditLogs, logAudit, lines = [] } = useMasterData();
  const { productionOrders = [], batches = [] } = useProduction();
  const { currentRole } = useRole();
  const { openQrModal, addToast, setIsQuickActionOpen } = useApp();

  const [selectedAssetId, setSelectedAssetId] = useState(id || assets[0]?.id || "AST-001");

  React.useEffect(() => {
    if (id) {
      setSelectedAssetId(id);
    }
  }, [id]);

  React.useEffect(() => {
    const fetch360Data = async () => {
      try {
        if (refreshWorkOrders) await refreshWorkOrders();
        if (refreshAssets) await refreshAssets();
        if (refreshCalibrations) await refreshCalibrations();
        if (refreshSpareParts) await refreshSpareParts();
        await Promise.all([
          masterDataService.getAssets(),
          maintenanceService.getReliabilityMetrics(),
          maintenanceService.getWorkOrders(),
          maintenanceService.getPMSchedules(),
          maintenanceService.getCalibrations(),
          maintenanceService.getSpareParts()
        ]);
      } catch (err) {
        console.warn("API Asset 360 fetch notice:", err.message || err);
      }
    };
    fetch360Data();
  }, [refreshWorkOrders, refreshAssets, refreshCalibrations, refreshSpareParts]);

  // Active Tab state - 10 CLIENT SPECIFIED SECTIONS
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  // Lookup Asset
  const asset = assets.find((a) => a.id === selectedAssetId) || assets[0] || {
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
  const linkedWOs = useMemo(() => {
    return workOrders.filter(
      (w) =>
        w.assetId === asset.id ||
        (asset.assetCode && w.assetId === asset.assetCode) ||
        (asset.dbId && w.assetId === asset.dbId) ||
        (w.dbAssetId && (w.dbAssetId === asset.id || w.dbAssetId === asset.dbId)) ||
        (w.asset && (w.asset.id === asset.id || w.asset.assetCode === asset.id || w.asset.assetCode === asset.assetCode))
    );
  }, [workOrders, asset.id, asset.assetCode, asset.dbId]);
  const linkedPMs = useMemo(() => pmSchedules.filter((p) => p.assetId === asset.id), [pmSchedules, asset.id]);
  const linkedBDs = useMemo(() => {
    return breakdowns.filter(
      (b) =>
        b.assetId === asset.id ||
        (asset.assetCode && b.assetId === asset.assetCode) ||
        (asset.dbId && b.assetId === asset.dbId) ||
        (b.dbAssetId && (b.dbAssetId === asset.id || b.dbAssetId === asset.dbId)) ||
        (b.assetName && (b.assetName === asset.name || b.assetName === asset.id))
    );
  }, [breakdowns, asset.id, asset.assetCode, asset.dbId, asset.name]);
  const linkedParts = useMemo(() => {
    const list = [];
    const seenPartNos = new Set();

    // 1. Parts linked to this asset in master catalog or database
    spareParts.forEach((p) => {
      const linked = Array.isArray(p.linkedAssets)
        ? p.linkedAssets
        : (p.linkedAssets ? String(p.linkedAssets).split(',').map((s) => s.trim()) : []);

      const isMatched =
        linked.includes(asset.id) ||
        (asset.assetCode && linked.includes(asset.assetCode)) ||
        (asset.dbId && linked.includes(asset.dbId)) ||
        p.linkedAsset === asset.id ||
        (asset.assetCode && p.linkedAsset === asset.assetCode) ||
        (asset.dbId && p.linkedAsset === asset.dbId) ||
        p.assetId === asset.id ||
        (asset.dbId && p.assetId === asset.dbId);

      if (isMatched) {
        seenPartNos.add(p.partNo || p.partNumber);
        list.push(p);
      }
    });

    // 2. Parts issued to any Work Order belonging to this machine
    linkedWOs.forEach((wo) => {
      if (Array.isArray(wo.partsRequired)) {
        wo.partsRequired.forEach((req) => {
          const pNo = req.partNo || req.partNumber;
          if (pNo && !seenPartNos.has(pNo)) {
            seenPartNos.add(pNo);
            const catalogItem = spareParts.find((sp) => sp.partNo === pNo || sp.id === pNo);
            if (catalogItem) {
              list.push({
                ...catalogItem,
                issuedQty: req.qty || 1,
                issuedViaWO: wo.woNumber || wo.id
              });
            } else {
              list.push({
                id: `WO-PART-${pNo}`,
                partNo: pNo,
                name: req.name || pNo,
                category: "Mechanical",
                stock: req.qty || 1,
                unitCost: Number(req.unitCost || 50),
                location: "Machine Consumed",
                status: "Issued",
                issuedQty: req.qty || 1,
                issuedViaWO: wo.woNumber || wo.id
              });
            }
          }
        });
      }
    });

    return list;
  }, [spareParts, asset.id, asset.assetCode, asset.dbId, linkedWOs]);
  const linkedCals = useMemo(() => {
    return calibrations.filter(
      (c) =>
        c.assetId === asset.id ||
        (asset.assetCode && c.assetId === asset.assetCode) ||
        (asset.dbId && c.assetId === asset.dbId) ||
        (c.dbAssetId && (c.dbAssetId === asset.id || c.dbAssetId === asset.dbId)) ||
        (c.assetCode && (c.assetCode === asset.id || c.assetCode === asset.assetCode))
    );
  }, [calibrations, asset.id, asset.assetCode, asset.dbId]);

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
    technician: currentRole?.name || "David Markov"
  });

  // Log Troubleshooting Solution Modal
  const [isAddSolutionModalOpen, setIsAddSolutionModalOpen] = useState(false);
  const [solutionForm, setSolutionForm] = useState({
    symptom: "",
    rootCause: "",
    solutionSteps: "",
    failureCode: "MEC-004",
    verifiedBy: currentRole?.name || "Ashley Kulcar"
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

  // Issue Part to Machine / WO
  const handleConfirmIssuePart = async (e) => {
    e.preventDefault();
    if (!selectedPartNo) {
      addToast("Please select a spare part", "error");
      return;
    }
    const woId = targetWoId || (linkedWOs[0]?.id || `WO-REQ-${asset.id}`);
    const qty = parseInt(issueQty) || 1;

    // 1. Issue part and link to asset in context & backend
    if (issueSparePart) {
      await issueSparePart(selectedPartNo, qty, woId, asset.id);
    }

    // 2. Explicitly ensure part has asset.id in its linkedAssets stored in DB
    const targetPart = spareParts.find(p => p.partNo === selectedPartNo || p.id === selectedPartNo);
    if (targetPart && updateSparePart) {
      const currentLinked = Array.isArray(targetPart.linkedAssets)
        ? targetPart.linkedAssets
        : (targetPart.linkedAssets ? String(targetPart.linkedAssets).split(',').map(s => s.trim()) : []);
      const newLinked = Array.from(new Set([...currentLinked, asset.id, asset.assetCode, asset.dbId].filter(Boolean)));
      await updateSparePart(targetPart.id || targetPart.partNo, {
        linkedAssets: newLinked.join(',')
      });
    }

    if (refreshSpareParts) {
      await refreshSpareParts();
    }
    if (refreshWorkOrders) {
      await refreshWorkOrders();
    }

    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Spare Part Inventory",
        action: "Spare Part Issued",
        field: "stock",
        oldValue: "Inventory Stock",
        newValue: `${qty}x ${selectedPartNo}`,
        notes: `Part ${selectedPartNo} issued for asset maintenance (${woId})`
      });
    }

    addToast(`Issued ${qty} unit(s) of ${selectedPartNo} to ${asset.id} (${woId})`);
    setIsIssuePartModalOpen(false);
    setSelectedPartNo("");
    setIssueQty(1);
  };

  // Log Calibration Record
  const handleConfirmLogCalibration = async (e) => {
    e.preventDefault();
    await addCalibrationRecord({
      assetId: asset.id,
      name: calForm.standardUsed ? `${calForm.standardUsed} (${asset.name})` : `${asset.name} Instrumentation`,
      lastCalibration: new Date().toISOString().substring(0, 10),
      nextDueDate: calForm.nextDueDate || new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
      technician: calForm.technician,
      result: calForm.result
    });

    if (refreshCalibrations) {
      await refreshCalibrations();
    }

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

  // Log Troubleshooting Solution
  const handleConfirmAddSolution = async (e) => {
    e.preventDefault();
    if (!solutionForm.symptom || !solutionForm.rootCause) {
      addToast("Please fill in symptom and root cause", "error");
      return;
    }
    const newSol = {
      id: `SOL-${Date.now().toString().slice(-4)}`,
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type || "Mechanical",
      symptom: solutionForm.symptom,
      rootCause: solutionForm.rootCause,
      solutionSteps: solutionForm.solutionSteps || "Inspect and rectify.",
      failureCode: solutionForm.failureCode || "MEC-004",
      verifiedBy: solutionForm.verifiedBy || "Maintenance Lead",
      status: "Verified",
      createdAt: new Date().toISOString()
    };
    try {
      await maintenanceService.createRCAInvestigation?.(newSol);
    } catch {
      // handled
    }
    setLocalSolutions((prev) => [newSol, ...prev]);
    if (logAudit) {
      logAudit({
        entityId: asset.id,
        entityType: "Troubleshooting",
        action: "Solution Logged",
        field: "Root Cause",
        oldValue: "-",
        newValue: solutionForm.rootCause,
        notes: `Verified fix logged by ${solutionForm.verifiedBy}: ${solutionForm.symptom}`
      });
    }
    addToast(`Troubleshooting solution logged for ${asset.id}`);
    setIsAddSolutionModalOpen(false);
    setSolutionForm({
      symptom: "",
      rootCause: "",
      solutionSteps: "",
      failureCode: "MEC-004",
      verifiedBy: currentRole?.name || "Ashley Kulcar"
    });
  };

  // Calculations for KPI Cards
  const totalDowntimeMins = useMemo(() => {
    return linkedBDs.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
  }, [linkedBDs]);

  const totalLabourHours = useMemo(() => {
    return linkedWOs
      .reduce((acc, w) => acc + Number(w.actualHours || w.actual_hours || 0), 0)
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
      productionOrders.find((po) => (po.line === asset.line || po.lineName === asset.line || po.lineId === asset.lineId) && po.status === "In Progress") ||
      productionOrders.find((po) => po.line === asset.line || po.lineName === asset.line || po.lineId === asset.lineId) ||
      null
    );
  }, [productionOrders, asset.line, asset.lineId]);

  // Dynamic Weekly Downtime Trends computed from real breakdowns
  const downtimeTrendData = useMemo(() => {
    const currentHrs = Number((totalDowntimeMins / 60).toFixed(1));
    return [
      { label: "W-4", value: 0 },
      { label: "W-3", value: 0 },
      { label: "W-2", value: 0 },
      { label: "W-1", value: 0 },
      { label: "Current", value: currentHrs }
    ];
  }, [totalDowntimeMins]);

  // Troubleshooting solutions linked to this asset
  const [localSolutions, setLocalSolutions] = useState([]);
  const assetSolutions = useMemo(() => {
    const all = [...(solutions || []), ...localSolutions];
    return all.filter(
      (s) =>
        s.assetId === asset.id ||
        s.assetId === asset.assetCode ||
        s.assetId === asset.dbId ||
        s.assetName === asset.name ||
        (s.assetType && asset.type && s.assetType.toLowerCase() === asset.type.toLowerCase())
    );
  }, [solutions, localSolutions, asset.id, asset.assetCode, asset.dbId, asset.name, asset.type]);

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
        details: `Failure Code: ${b.failureCode || "MEC-004"} • Duration: ${b.durationMinutes !== undefined ? b.durationMinutes : 0} mins • Tech: ${b.technician || b.assignedTechnician || "David Markov"}`
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
        details: `Type: ${w.type} • Priority: ${w.priority} • Tech: ${w.assignedTechnician || "Unassigned"} • Labour: ${Number(w.actualHours || w.actual_hours || 0).toFixed(1)}h`
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

  // Tabs Definition - 10 Consolidated Sections
  const tabs = [
    { id: "OVERVIEW", label: "Overview", icon: Activity },
    { id: "INFO", label: "Asset Information", icon: FileText },
    { id: "STATUS", label: "Current Status", icon: Gauge },
    { id: "PM", label: "Preventive Maintenance", icon: CalendarCheck, badge: linkedPMs.length > 0 ? linkedPMs.length : undefined },
    { id: "WORK_ORDERS", label: "Work Orders", icon: Wrench, badge: openWOCount > 0 ? openWOCount : undefined },
    { id: "BREAKDOWNS", label: "Breakdowns", icon: AlertOctagon, badge: linkedBDs.length > 0 ? linkedBDs.length : undefined },
    { id: "HISTORY", label: "Maintenance History", icon: History, badge: machineHistory.length > 0 ? machineHistory.length : undefined },
    { id: "RELIABILITY", label: "Reliability", icon: TrendingUp },
    { id: "TROUBLESHOOTING", label: "Troubleshooting", icon: SearchCode },
    { id: "IMPACT", label: "Maintenance Impact", icon: DollarSign }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "1600px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Top Header / Banner */}
      <Card className="asset-360-header-card" style={{ padding: "clamp(14px, 3vw, 24px)", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
          <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, flex: 1 }}>
            {/* Top Navigation & Switcher Row */}
            <div className="asset-360-top-controls" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap", width: "100%" }}>
              <button
                onClick={() => navigate("/maintenance/assets")}
                className="btn btn-ghost"
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap"
                }}
              >
                <ArrowLeft size={14} /> Back to Asset Directory
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", flex: 1, minWidth: "220px", maxWidth: "100%" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>SWITCH ASSET:</span>
                <select
                  className="form-select asset-360-switch-select"
                  value={asset.id}
                  onChange={(e) => {
                    setSelectedAssetId(e.target.value);
                    navigate(`/maintenance/asset-360/${e.target.value}`, { replace: true });
                  }}
                  style={{ fontSize: "12px", padding: "4px 8px", height: "32px", width: "auto", flex: 1, minWidth: "160px", maxWidth: "100%" }}
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Asset Identity Details */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}
              >
                <Wrench size={22} />
              </div>

              <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "clamp(17px, 3.5vw, 24px)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.25, wordBreak: "break-word", margin: 0 }}>
                    {asset.name}
                  </h1>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--accent-blue)",
                      whiteSpace: "nowrap"
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
                    gap: "6px 14px",
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}
                >
                  <span>Plant: <strong style={{ color: "var(--text-primary)" }}>{asset.plant || "Plant 1"}</strong></span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>Area: <strong style={{ color: "var(--text-primary)" }}>{asset.department || "Packaging"}</strong></span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>Line: <strong style={{ color: "var(--text-primary)" }}>{asset.line || "Line 1"}</strong></span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>Location: <strong style={{ color: "var(--text-primary)" }}>{asset.location || "Bay 4A"}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Top Header Actions */}
          <div className="asset-360-actions-row" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", width: "100%", justifyContent: "flex-start", marginTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>SET STATUS:</span>
              <select
                className="form-select"
                style={{ width: "auto", minWidth: "160px", height: "34px", fontSize: "12px", border: "1px solid var(--border-active)" }}
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

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
      <Card style={{ padding: "0 clamp(8px, 2vw, 16px)", width: "100%", boxSizing: "border-box" }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>

      {/* ========================================================================= */}
      {/* SECTION: OVERVIEW                                                         */}
      {/* ========================================================================= */}
      {activeTab === "OVERVIEW" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Real-time Sensor Telemetry Card */}
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Activity size={18} style={{ color: "#10B981" }} /> Live Condition Telemetry & IoT Sensor Gauges
                </h3>
                <p>
                  Continuous edge telemetry streaming from machine vibration transducers and thermal probes
                </p>
              </div>
              <div className="asset-tab-card-header-actions">
                <Badge variant="emerald" dot>LIVE TELEMETRY STREAM</Badge>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Bearing Vibration</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: Number(iotTelemetry?.vibration || asset.vibration || 0) > 3.0 ? "#EF4444" : "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {iotTelemetry?.vibration != null ? `${Number(iotTelemetry.vibration).toFixed(2)} mm/s` : (asset.vibration != null ? `${asset.vibration} mm/s` : "—")}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ISO-10816 limit: &lt; 3.0 mm/s</span>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Housing Temp</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: Number(iotTelemetry?.temperature || asset.temperature || 0) > 75 ? "#EF4444" : "#38BDF8", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {iotTelemetry?.temperature != null ? `${Number(iotTelemetry.temperature).toFixed(1)}°C` : (asset.temperature != null ? `${asset.temperature}°C` : "—")}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Thermal ceiling: &lt; 80°C</span>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Pneumatic Pressure</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#F59E0B", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {iotTelemetry?.pressure != null ? `${Number(iotTelemetry.pressure).toFixed(2)} Bar` : (asset.pressure != null ? `${asset.pressure} Bar` : "—")}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Operating nominal: 6.0 ± 0.5 Bar</span>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Lubrication Reservoir</span>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {asset.oilLevel != null ? `${asset.oilLevel}%` : "—"}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Synthetic food-grade grease</span>
              </div>
            </div>
          </Card>

          {/* Consolidated Section Navigation Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("INFO")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Asset Information</span>
                <Badge variant="cyan">{asset.id}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                OEM: {asset.manufacturer || "Standard OEM"} • Model: {asset.model || "Series-2026"} • {asset.line}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                View Specifications →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("STATUS")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Current Status</span>
                <Badge variant={asset.status === "Operational" ? "emerald" : "rose"} dot>{asset.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Runtime: {(asset.runtimeHours || 14820).toLocaleString()} hrs • Health: {asset.health}% • Speed: {asset.ratedSpeed || "600 RPM"}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                View Status Details →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("PM")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Preventive Maintenance</span>
                <Badge variant="cyan">{linkedPMs.length} Schedules</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Next scheduled PM: {linkedPMs[0]?.dueDate || "Upcoming"} • Assigned: {linkedPMs[0]?.assignedTo || "David Markov"}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                Manage PM Schedules →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("WORK_ORDERS")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Work Orders</span>
                <Badge variant={openWOCount > 0 ? "amber" : "emerald"}>{openWOCount} Open</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                {linkedWOs.length} total work orders on file • Labour: {totalLabourHours} hrs logged
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                View Work Orders →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("BREAKDOWNS")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Breakdowns</span>
                <Badge variant={activeBDCount > 0 ? "rose" : "emerald"}>{activeBDCount} Active</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Total Downtime: {totalDowntimeMins} mins • Failure Code: {linkedBDs[0]?.failureCode || "None"}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                View Breakdown Stoppages →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("HISTORY")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Maintenance History</span>
                <Badge variant="cyan">{machineHistory.length} Events</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Chronological timeline of all PMs, repairs, parts changes and calibrations
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                View History Timeline →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("RELIABILITY")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Reliability</span>
                <Badge variant="cyan">{asset.mtbf || 342}h MTBF</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                MTTR: {asset.mttr || 1.4}h • Repeat Outages: {asset.recentFailuresCount || linkedBDs.length}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                Inspect Reliability Analytics →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("TROUBLESHOOTING")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Troubleshooting</span>
                <Badge variant="cyan">7-Step Diagnostics</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Diagnostic checks, verified repair procedures, and calibration certificates
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                Open Troubleshooting →
              </div>
            </Card>

            <Card style={{ cursor: "pointer" }} onClick={() => setActiveTab("IMPACT")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Maintenance Impact</span>
                <Badge variant="amber">Financial Tracking</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Connected Line: {asset.line} • Production Orders mapped: {productionOrders.length}
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--accent-blue)", fontWeight: 600 }}>
                Analyze Cost & Production Loss →
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: CURRENT STATUS                                                   */}
      {/* ========================================================================= */}
      {activeTab === "STATUS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Gauge size={18} style={{ color: "#38BDF8" }} /> Live Operational Status & Equipment Health
                </h3>
                <p>Real-time machine runtime, attainment, and operational condition state</p>
              </div>
              <div className="asset-tab-card-header-actions">
                <Badge variant={asset.status === "Operational" ? "emerald" : "rose"} dot>{asset.status}</Badge>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Operational State</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: asset.status === "Operational" ? "#10B981" : "#EF4444", marginTop: "4px" }}>
                  {asset.status === "Operational" ? "RUNNING (Steady)" : asset.status === "Breakdown" ? "HALTED (Breakdown)" : asset.status}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Condition monitoring active</span>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Running Attainment</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {activeProdOrder?.targetQuantity && activeProdOrder?.completedQuantity != null
                    ? `${Math.round((activeProdOrder.completedQuantity / activeProdOrder.targetQuantity) * 100)}%`
                    : "—"}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {activeProdOrder?.targetQuantity ? `Target: ${activeProdOrder.targetQuantity} units` : "No active production run"}
                </span>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Cumulative Runtime</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {asset.runtimeHours || asset.operatingHours != null ? `${Number(asset.runtimeHours || asset.operatingHours).toLocaleString()} hrs` : "—"}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Since initial commissioning</span>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Design Speed</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                  {asset.ratedSpeed || "—"}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Nameplate rated speed</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: ASSET INFORMATION                                                */}
      {/* ========================================================================= */}
      {activeTab === "INFO" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Asset Master Identity & Technical Specifications
                </h3>
                <p>
                  Core engineering data, plant hierarchy assignment and system metadata
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
                {!isEditingInfo ? (
                  <Button variant="secondary" size="sm" icon={Edit} onClick={() => setIsEditingInfo(true)}>
                    Edit Information
                  </Button>
                ) : (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Button variant="secondary" size="sm" icon={X} onClick={() => setIsEditingInfo(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" icon={Save} onClick={handleSaveInfo}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
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
                        {asset.operator || "Unassigned"}
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
      {/* SECTION: MAINTENANCE IMPACT & PRODUCTION                                  */}
      {/* ========================================================================= */}
      {(activeTab === "IMPACT" || activeTab === "PRODUCTION") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Production Assignment Card */}
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Production Line Assignment & Work Center
                </h3>
                <p>
                  Manufacturing schedule linkage, routing capabilities, and eligible lines
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
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
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                  {asset.location ? `WC-${asset.location.replace(/\s+/g, "-").toUpperCase()}` : `WC-${asset.assetCode || asset.id}`}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{asset.location || "Packaging Cell"}</div>
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
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>{asset.type || asset.model || "Manufacturing Equipment"}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{asset.manufacturer ? `OEM: ${asset.manufacturer}` : "Standard Industrial Spec"}</div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Assigned Packaging Line</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  <Badge variant="cyan">{asset.line || "Line 1"}</Badge>
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Standard Run Rate (Nominal)</div>
                <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#10B981", fontSize: "15px", marginTop: "4px" }}>
                  {asset.ratedSpeed ? `${asset.ratedSpeed} BPM` : "Design Speed Not Configured"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target OEE Design Rate</div>
              </div>
            </div>
          </Card>

          {/* Current Production Status & Active Orders */}
          <div className="grid-2">
            <Card>
              <div className="asset-tab-card-header">
                <div className="asset-tab-card-header-title">
                  <h3 style={{ fontSize: "15px" }}>
                    Current Shift & Production Order
                  </h3>
                </div>
                <div className="asset-tab-card-header-actions">
                  <Badge variant={activeProdOrder?.status === "In Progress" ? "emerald" : "blue"}>
                    {activeProdOrder?.status || "No Active Order"}
                  </Badge>
                </div>
              </div>

              {activeProdOrder ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Order:</span>
                    <strong style={{ fontFamily: "var(--font-mono)", color: "#38BDF8" }}>{activeProdOrder.orderNumber || activeProdOrder.id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>SKU / Product:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{activeProdOrder.skuName || activeProdOrder.productName || "Product Run"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Batch:</span>
                    <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{activeProdOrder.batchNumber || activeProdOrder.batchId || "BATCH-" + (activeProdOrder.orderNumber || activeProdOrder.id)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Target Quantity:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{activeProdOrder.targetQuantity ? `${Number(activeProdOrder.targetQuantity).toLocaleString()} units` : "As per schedule"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ color: "var(--text-muted)" }}>Status:</span>
                    <strong style={{ color: "#10B981" }}>{activeProdOrder.status || "In Progress"}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "13px" }}>No active production order currently scheduled on {asset.line || "this line"}.</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate("/production")}>
                    Go to Production Orders
                  </Button>
                </div>
              )}
            </Card>

            <Card>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                Live Production Metrics & Telemetry
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Current Speed</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: asset.status === "Breakdown" || asset.status === "DOWN" ? "#EF4444" : "#10B981", marginTop: "4px" }}>
                    {asset.status === "Breakdown" || asset.status === "DOWN" ? "0 BPM" : (asset.ratedSpeed ? `${asset.ratedSpeed} BPM` : "Nominal Run Speed")}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Rated: {asset.ratedSpeed ? `${asset.ratedSpeed} BPM` : "Design Speed Not Configured"}
                  </div>
                </div>

                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Shift Output</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "4px" }}>
                    {activeProdOrder?.completedQuantity != null ? `${Number(activeProdOrder.completedQuantity).toLocaleString()} units` : "0 units"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {activeProdOrder?.targetQuantity ? `Target: ${Number(activeProdOrder.targetQuantity).toLocaleString()} units` : "No active batch"}
                  </div>
                </div>

                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Cumulative Runtime</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "4px" }}>
                    {asset.operatingHours != null ? `${Number(asset.operatingHours).toLocaleString()} hrs` : (asset.runtimeHours != null ? `${Number(asset.runtimeHours).toLocaleString()} hrs` : "0 hrs")}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>From Asset Master DB</div>
                </div>

                <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Operational State</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: asset.status === "Operational" || asset.status === "RUNNING" ? "#10B981" : "#EF4444", marginTop: "6px" }}>
                    {asset.status === "Operational" || asset.status === "RUNNING" ? "RUNNING (Operational)" : (asset.status || "STANDBY")}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: MAINTENANCE (PM, WORK ORDERS, HISTORY, TROUBLESHOOTING)          */}
      {/* ========================================================================= */}
      {(activeTab === "PM" || activeTab === "WORK_ORDERS" || activeTab === "HISTORY" || activeTab === "MAINTENANCE") && (
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
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Preventive Maintenance (PM) Schedules
                </h3>
                <p>
                  Recurring inspections, scheduled lubrications, and calibration checklists
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
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
                    <div style={{ flex: "1 1 240px", minWidth: 0, width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--accent-blue)", whiteSpace: "nowrap", flexShrink: 0 }}>
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
                        Last PM: {pm.lastExecuted || asset.lastPM || "2026-08-15"} • Next PM Due: <strong style={{ color: "var(--text-primary)" }}>{pm.dueNext || asset.nextPM || "2026-09-10"}</strong> • Assigned: {pm.assignedTo || pm.assignedTechnician || "David Markov"}
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
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Work Orders ({linkedWOs.length})
                </h3>
                <p>
                  Corrective repairs, emergency interventions, and planned servicing records
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
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
                    <div style={{ flex: "1 1 240px", minWidth: 0, width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--accent-blue)", whiteSpace: "nowrap", flexShrink: 0 }}>
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
                        Assigned Tech: <strong style={{ color: "var(--text-primary)" }}>{wo.assignedTechnician}</strong> • Created: {wo.createdDate} • Labour: {Number(wo.actualHours || wo.actual_hours || 0).toFixed(1)}h
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
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Linked Spare Parts & Consumables
                </h3>
                <p>
                  Bill of Materials (BOM) components assigned to {asset.id}
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
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
                        <td style={{ fontWeight: 600, color: "var(--text-primary, #2B1D11)" }}>{p.name}</td>
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
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Instrumentation & Calibration Records
                </h3>
                <p>
                  Metrology compliance, sensor verification, and NIST certificates
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
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
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div style={{ flex: "1 1 240px", minWidth: 0, width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "#10B981", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {cal.id?.length > 12 ? `CAL-${cal.id.substring(0, 8).toUpperCase()}` : cal.id}
                        </span>
                        <Badge variant={(cal.status || "").toLowerCase() === "valid" ? "emerald" : "rose"}>{cal.status || "Valid"}</Badge>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Cert: {cal.certificate || cal.certificateNumber || "CERT-99201"}</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                        {cal.name || cal.instrumentName || "Volumetric Flow Sensor"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Last Calibration: {cal.lastCalibration || "2026-08-01"} • Next Due: <strong style={{ color: "var(--text-primary)" }}>{cal.nextDueDate || "2026-11-01"}</strong> • Tech: {cal.technician || "Metrology Team"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
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
                  {linkedWOs[0]?.actualHours || linkedWOs[0]?.actual_hours || "0.0"} hrs
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {linkedWOs[0]?.assignedTechnician || "David Markov"} ({linkedWOs[0]?.id || "WO-2026-001"})
                </div>
              </div>

              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Estimated Maintenance Cost</div>
                <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#10B981", marginTop: "4px" }}>
                  ${(parseFloat(totalLabourHours) * 85 + linkedParts.length * 140).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Labour ($85/h) + Parts Consumed</div>
              </div>
            </div>
          </Card>

          {/* 6. Machine History Timeline */}
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Machine Life-Cycle History Timeline
                </h3>
                <p>
                  Unified chronological trail of Work Orders, Breakdowns, PMs, and Parts
                </p>
              </div>
              <div className="asset-tab-card-header-actions">
                <Badge variant="cyan">{machineHistory.length} Total Events</Badge>
              </div>
            </div>

            {machineHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {machineHistory.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      alignItems: "flex-start",
                      flexWrap: "wrap"
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

                    <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
      {/* SECTION: TROUBLESHOOTING & RCA DIAGNOSTICS                                */}
      {/* ========================================================================= */}
      {activeTab === "TROUBLESHOOTING" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>Troubleshooting Guides & Verified Solutions</h3>
                <p>Root cause diagnostic procedures, verified fixes, and RCA records for {asset.id}</p>
              </div>
              <div className="asset-tab-card-header-actions">
                <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/troubleshooting")}>
                  View Diagnostic Center
                </Button>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddSolutionModalOpen(true)}>
                  Log Verified Solution
                </Button>
              </div>
            </div>

            {assetSolutions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {assetSolutions.map((sol) => (
                  <div
                    key={sol.id}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>{sol.id}</span>
                      <Badge variant="emerald">{sol.status || "Verified Solution"}</Badge>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                      {sol.symptom || sol.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      <strong>Root Cause:</strong> {sol.rootCause || "Mechanical misalignment"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", whiteSpace: "pre-line" }}>
                      <strong>Resolution Steps:</strong> {sol.solutionSteps || sol.resolution || "Inspect and replace worn parts, verify torque tolerances."}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                      Verified by: {sol.verifiedBy || "Maintenance Lead"} • Failure Code: {sol.failureCode || "MEC-004"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "13px" }}>
                  No verified troubleshooting solutions logged for {asset.id} yet.
                </p>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddSolutionModalOpen(true)}>
                  Log Solution for {asset.id}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: BREAKDOWNS & RELIABILITY                                         */}
      {/* ========================================================================= */}
      {(activeTab === "BREAKDOWNS" || activeTab === "RELIABILITY" || activeTab === "DOWNTIME") && (
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
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Historical Stoppages & Breakdown Events
                </h3>
                <p>
                  Root causes, downtime duration, and corrective work order mapping for {asset.id}
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
                <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/breakdowns")}>
                  View All Breakdowns
                </Button>
              </div>
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
                data={downtimeTrendData}
                height={160}
                color="#EF4444"
                unit=" hrs"
              />
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: AUDIT TRAIL & HISTORY LOGS                                       */}
      {/* ========================================================================= */}
      {(activeTab === "HISTORY" || activeTab === "AUDIT") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card>
            <div className="asset-tab-card-header">
              <div className="asset-tab-card-header-title">
                <h3>
                  Centralized Audit Trail for {asset.id}
                </h3>
                <p>
                  21 CFR Part 11 compliant audit records capturing status changes, work orders, PMs, and field edits
                </p>
              </div>

              <div className="asset-tab-card-header-actions">
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
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.user || "Ronald Robinson"}</div>
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

      {/* Log Troubleshooting Solution Modal */}
      <Modal
        isOpen={isAddSolutionModalOpen}
        onClose={() => setIsAddSolutionModalOpen(false)}
        title="Log Verified Troubleshooting Solution"
        subtitle={`Record root cause solution and diagnostic steps for ${asset.id}`}
      >
        <form onSubmit={handleConfirmAddSolution} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Symptom / Failure Mode *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Excessive Spindle Vibration at 500 RPM"
              value={solutionForm.symptom}
              onChange={(e) => setSolutionForm({ ...solutionForm, symptom: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Failure Code</label>
            <input
              type="text"
              className="form-input"
              value={solutionForm.failureCode}
              onChange={(e) => setSolutionForm({ ...solutionForm, failureCode: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Root Cause *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bearing play and shaft imbalance"
              value={solutionForm.rootCause}
              onChange={(e) => setSolutionForm({ ...solutionForm, rootCause: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Steps / Corrective Action *</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="e.g. 1. Replace 6205 bearing. 2. Align spindle to 0.02mm tolerance."
              value={solutionForm.solutionSteps}
              onChange={(e) => setSolutionForm({ ...solutionForm, solutionSteps: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Verified By</label>
            <input
              type="text"
              className="form-input"
              value={solutionForm.verifiedBy}
              onChange={(e) => setSolutionForm({ ...solutionForm, verifiedBy: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsAddSolutionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Solution
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

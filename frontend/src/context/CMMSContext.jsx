import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import maintenanceService from "../services/maintenanceService";
<<<<<<< HEAD
import { masterDataService } from "../services/masterDataService";
=======
import masterDataService from "../services/masterDataService";
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
import iotService from "../services/iotService";
import { INITIAL_ASSETS, ASSET_HIERARCHY_TREE } from "../data/mockAssets";
import { INITIAL_WORK_ORDERS } from "../data/mockWorkOrders";
import { INITIAL_PM_SCHEDULES, INITIAL_PM_PLANS } from "../data/mockPMSchedules";
import { CHECKLIST_TEMPLATES, CHECKLIST_HISTORY } from "../data/mockChecklists";
import { INITIAL_BREAKDOWNS } from "../data/mockBreakdowns";
import { INITIAL_SOLUTIONS } from "../data/mockSolutions";
import { INITIAL_SPARE_PARTS, EQUIPMENT_BOMS, INITIAL_PARTS_REQUESTS } from "../data/mockSpareParts";
import { INITIAL_CALIBRATIONS, CALIBRATION_HISTORY } from "../data/mockCalibration";
import { INITIAL_FAILURE_CODES } from "../data/mockFailureCodes";
import { RELIABILITY_METRICS, REPEAT_FAILURES } from "../data/mockReliability";
import { INITIAL_EMPLOYEES, SKILLS_MATRIX } from "../data/mockLabour";
import { REPORT_TEMPLATES } from "../data/mockReports";
import { DEFAULT_USER_PROFILE } from "../data/mockUserProfile";

const CMMSContext = createContext();

export function CMMSProvider({ children }) {
  const hasAuthToken = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_auth_token") || localStorage.getItem("flowstate_token")));
  const hasTenant = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_tenant_name") || localStorage.getItem("maintenx_tenant_id")));
  const isTenantActive = Boolean(hasTenant || hasAuthToken);

<<<<<<< HEAD
  // 1. Assets State — Unified with MasterDataContext / PostgreSQL Assets
  const [assets, setAssets] = useState(() => {
    const masterSaved = typeof window !== "undefined" ? localStorage.getItem("mx_master_assets") : null;
    if (masterSaved) {
      try {
        const parsed = JSON.parse(masterSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a) => ({
            id: a.assetId || a.assetCode || a.id,
            name: a.name,
            department: a.department || a.lineName || a.type || "General",
            line: a.lineName || a.line || "Line 1",
            status: a.status || "Operational",
            health: a.health !== undefined ? Number(a.health) : (a.healthPercent !== undefined ? Number(a.healthPercent) : 95),
            vibration: a.vibration !== undefined ? Number(a.vibration) : 1.5,
            temperature: a.temperature !== undefined ? Number(a.temperature) : 48,
            _raw: a,
          }));
        }
      } catch (e) {}
    }
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_assets") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const real = parsed.filter((a) => !["FM-001", "CP-102", "LB-204", "MX-003", "HT-105", "PK-401", "CV-301", "AC-505"].includes(a.id));
          if (real.length > 0) return real;
        }
      } catch (e) {}
=======
  // 1. Assets State - initialized from DB / local cache, clearing legacy mocks
  const [assets, setAssets] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_assets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacyMocks = Array.isArray(parsed) && parsed.some(a => ["FM-001", "CP-102", "LB-204", "MX-003", "HT-105", "PK-401", "CV-301", "AC-505"].includes(a.id));
        if (hasLegacyMocks) {
          localStorage.removeItem("flowstate_assets");
          return [];
        }
        return parsed;
      } catch {
        return [];
      }
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
    }
    return [];
  });

  const [assetHierarchy, setAssetHierarchy] = useState(() => {
<<<<<<< HEAD
    return [];
  });

  // 2. Work Orders State — Dispatched from Fast Actions or DB
  const [workOrders, setWorkOrders] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_work_orders") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (w) => !["WO-2026-0891", "WO-2026-0888", "WO-2026-0875", "WO-2026-0860", "WO-2026-0852", "WO-2026-0840"].includes(w.id)
          );
        }
      } catch (e) {}
=======
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_asset_hierarchy");
    return saved ? JSON.parse(saved) : ASSET_HIERARCHY_TREE;
  });

  // 2. Work Orders State - 100% Live PostgreSQL DB state, purge legacy mocks
  const [workOrders, setWorkOrders] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_work_orders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacyMocks = Array.isArray(parsed) && parsed.some(w =>
          ["WO-2026-0891", "WO-2026-0888", "WO-2026-0885", "WO-2026-0870", "WO-2026-0865", "WO-2026-0850"].includes(w?.id) ||
          (w?.title && (w.title.includes("Vibration on Main Drive") || w.title.includes("Plate Seal Leakage")))
        );
        if (hasLegacyMocks) {
          localStorage.removeItem("flowstate_work_orders");
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
    }
    return [];
  });

  // 3. PM Plans & Schedules
  const [pmPlans, setPmPlans] = useState(() => {
<<<<<<< HEAD
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_pm_plans") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [pmSchedules, setPmSchedules] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_pm_schedules") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p) => !["PMS-2026-001", "PMS-2026-002", "PMS-2026-003", "PMS-2026-004", "PMS-2026-005"].includes(p.id)
          );
        }
      } catch (e) {}
    }
    return [];
=======
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_pm_plans");
    return saved ? JSON.parse(saved) : INITIAL_PM_PLANS;
  });

  const [pmSchedules, setPmSchedules] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_pm_schedules");
    return saved ? JSON.parse(saved) : INITIAL_PM_SCHEDULES;
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  });

  // Checklists
  const [checklistTemplates, setChecklistTemplates] = useState(() => {
<<<<<<< HEAD
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_checklists") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
=======
    if (isTenantActive) return [];
    try {
      const saved = localStorage.getItem("flowstate_checklists_v2");
      if (saved) return JSON.parse(saved);
      localStorage.removeItem("flowstate_checklists");
    } catch (e) {}
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
    return CHECKLIST_TEMPLATES;
  });

  const [checklistHistory, setChecklistHistory] = useState(() => {
<<<<<<< HEAD
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_checklist_history") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return CHECKLIST_HISTORY;
=======
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_checklist_history");
    return saved ? JSON.parse(saved) : CHECKLIST_HISTORY;
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  });

  // 4. Breakdowns
  const [breakdowns, setBreakdowns] = useState(() => {
<<<<<<< HEAD
    const saved = typeof window !== "undefined" ? localStorage.getItem("flowstate_breakdowns") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((b) => !["BD-2026-042", "BD-2026-041", "BD-2026-040", "BD-2026-039"].includes(b.id));
        }
      } catch (e) {}
    }
    return [];
=======
    if (isTenantActive) return [];
    try {
      const saved = localStorage.getItem("flowstate_breakdowns");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Filter out legacy mock data
      const filtered = parsed.filter(b => !["BD-2026-042", "BD-2026-039", "BD-2026-035", "BD-2026-028"].includes(b?.id));
      return filtered;
    } catch {
      return [];
    }
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  });

  // 5. Spare Parts & BOM & Requests
  const [spareParts, setSpareParts] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_spare_parts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
<<<<<<< HEAD
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_SPARE_PARTS;
=======
        const hasLegacyMocks = Array.isArray(parsed) && parsed.some((p) => ["BRG-6208-2RS", "GSK-EPDM-HT105", "SL-VTON-45"].includes(p?.partNo));
        if (hasLegacyMocks) {
          localStorage.removeItem("flowstate_spare_parts");
          return [];
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  });

  const [equipmentBOMs] = useState(() => (isTenantActive ? {} : EQUIPMENT_BOMS));

  const [partsRequests, setPartsRequests] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_parts_requests");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_PARTS_REQUESTS;
  });

  // 6. Calibrations & History
  const [calibrations, setCalibrations] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_calibrations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
<<<<<<< HEAD
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CALIBRATIONS;
=======
        const hasLegacyMocks = Array.isArray(parsed) && parsed.some((c) => ["CAL-2026-088", "CAL-2026-082", "CAL-2026-091", "CAL-2026-079"].includes(c?.id));
        if (hasLegacyMocks) {
          localStorage.removeItem("flowstate_calibrations");
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  });

  const [calibrationHistory, setCalibrationHistory] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_calibration_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return CALIBRATION_HISTORY;
  });

  // 7. Failure Codes
  const [failureCodes, setFailureCodes] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_failure_codes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_FAILURE_CODES;
  });

  // 8. Troubleshooting & Verified Solutions
  const [solutions, setSolutions] = useState(() => {
    if (isTenantActive) return [];
    const saved = localStorage.getItem("flowstate_solutions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
<<<<<<< HEAD
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_SOLUTIONS;
=======
        const hasLegacyMocks = Array.isArray(parsed) && parsed.some((s) => ["SOL-2026-012", "SOL-2025-084", "SOL-2025-045"].includes(s?.id));
        if (hasLegacyMocks) {
          localStorage.removeItem("flowstate_solutions");
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  });

  // 9. Reliability
  const [repeatFailures, setRepeatFailures] = useState(() => (isTenantActive ? [] : REPEAT_FAILURES));
  const [reliabilityMetrics, setReliabilityMetrics] = useState(() => (isTenantActive ? {} : RELIABILITY_METRICS));

  // 10. Machine / IoT Live Simulation & Streaming
  const [isLiveTelemetryStreaming, setIsLiveTelemetryStreaming] = useState(true);
  const [iotTelemetry, setIotTelemetry] = useState({
    vibration: 2.1,
    temperature: 62.4,
    pressure: 6.2,
    rpm: 1200,
    powerKW: 45.2,
    flowRate: 9400,
    status: "Normal",
    lastUpdated: new Date().toLocaleTimeString()
  });

  // Subscribe to live SSE telemetry stream
  useEffect(() => {
    if (!isLiveTelemetryStreaming) return;

    const unsubscribe = iotService.connectLiveStream(
      (packet) => {
        if (packet.type === "TELEMETRY_UPDATE" && packet.data) {
          const d = packet.data;
          setIotTelemetry({
            vibration: Number(d.vibration) || 2.1,
            temperature: Number(d.temperature) || 62.4,
            pressure: Number(d.pressure) || 6.2,
            rpm: Number(d.rpm) || 1200,
            powerKW: Number(d.powerKw) || 45.2,
            flowRate: Number(d.flowRate) || 9400,
            status: d.status || "Normal",
            lastUpdated: new Date(d.timestamp || Date.now()).toLocaleTimeString()
          });
        } else if (packet.type === "SNAPSHOT" && Array.isArray(packet.data) && packet.data.length > 0) {
          const d = packet.data[0];
          setIotTelemetry({
            vibration: Number(d.vibration) || 2.1,
            temperature: Number(d.temperature) || 62.4,
            pressure: Number(d.pressure) || 6.2,
            rpm: Number(d.rpm) || 1200,
            powerKW: Number(d.powerKw) || 45.2,
            flowRate: Number(d.flowRate) || 9400,
            status: d.status || "Normal",
            lastUpdated: new Date(d.timestamp || Date.now()).toLocaleTimeString()
          });
        }
      },
      () => {}
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLiveTelemetryStreaming]);

  // 11. Maintenance Labour
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("flowstate_employees");
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  const [skillsMatrix] = useState(SKILLS_MATRIX);

  // 12. Reports
  const [reportTemplates] = useState(REPORT_TEMPLATES);

  // 13. Notifications - 100% Live DB state, purge legacy mocks
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("flowstate_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacyMocks = Array.isArray(parsed) && parsed.some((n) =>
          ["NOTIF-001", "NOTIF-002", "NOTIF-003", "NOTIF-004", "NOTIF-005", "NOTIF-006"].includes(n?.id) ||
          (n?.title && (n.title.includes("Heat Exchanger HT-105") || n.title.includes("Pasteurizer Monthly") || n.title.includes("Coriolis Flowmeter") || n.title.includes("EPDM Gaskets")))
        );
        if (hasLegacyMocks) {
          localStorage.removeItem("flowstate_notifications");
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // 14. Profile - 100% Live PostgreSQL DB state, purge legacy mocks
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("flowstate_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes("Marcus Vance") || parsed?.completedWOsThisYear === 142 || !parsed?.name) {
          localStorage.removeItem("flowstate_user_profile");
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

<<<<<<< HEAD
  // Synchronize CMMS Work Orders, Assets & PM Schedules with Fastify backend
  useEffect(() => {
    async function syncCMMSBackend() {
      try {
        const [remoteWOs, remotePMs, remoteSpares, remoteAssets] = await Promise.allSettled([
=======
  // Normalize Work Orders from database
  const normalizeWorkOrders = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((wo) => {
      const rawStatus = (wo.status || "Open").trim();
      let displayStatus = "Open";
      if (rawStatus.toUpperCase() === "IN_PROGRESS" || rawStatus.toUpperCase() === "IN PROGRESS") displayStatus = "In Progress";
      else if (rawStatus.toUpperCase() === "COMPLETED") displayStatus = "Completed";
      else if (rawStatus.toUpperCase() === "CLOSED") displayStatus = "Closed";
      else if (rawStatus.toUpperCase() === "ASSIGNED") displayStatus = "Assigned";
      else if (rawStatus.toUpperCase() === "WAITING_FOR_PARTS" || rawStatus.toUpperCase() === "WAITING FOR PARTS") displayStatus = "Waiting for Parts";
      else displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      return {
        id: wo.woNumber || wo.id,
        dbId: wo.id,
        woNumber: wo.woNumber,
        title: wo.title,
        description: wo.description || "",
        symptom: wo.description || "",
        assetId: wo.asset?.assetCode || wo.asset?.id || wo.assetId || "AST-001",
        dbAssetId: wo.assetId || wo.asset?.id,
        assetCode: wo.asset?.assetCode,
        assetName: wo.asset?.name || "Industrial Asset",
        type: wo.type ? (wo.type.charAt(0).toUpperCase() + wo.type.slice(1).toLowerCase()) : "Corrective",
        priority: wo.priority || "P2 - High",
        status: displayStatus,
        rawStatus: wo.status,
        assignedTechnician: wo.assignedUser
          ? `${wo.assignedUser.firstName || ""} ${wo.assignedUser.lastName || ""}`.trim()
          : (wo.assignedTechnician || "Unassigned"),
        createdDate: wo.createdAt ? new Date(wo.createdAt).toISOString().substring(0, 10) : "2026-09-01",
        dueDate: wo.scheduledDate ? new Date(wo.scheduledDate).toISOString().substring(0, 10) : (wo.dueDate || "2026-09-12"),
        estimatedHours: wo.estimatedHours ? parseFloat(wo.estimatedHours) : 2.0,
        actualHours: wo.actualHours != null && wo.actualHours !== "" ? parseFloat(wo.actualHours) : 0,
        resolution: wo.completedAt ? "Work completed & verified" : (wo.resolution || null),
        comments: wo.comments || [],
        partsRequired: wo.partsRequired || [],
        toolsRequired: wo.toolsRequired || []
      };
    });
  };

  // Refresh Work Orders from Backend
  const refreshWorkOrders = useCallback(async () => {
    try {
      const res = await maintenanceService.getWorkOrders();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list) && list.length > 0) {
        const normalized = normalizeWorkOrders(list);
        setWorkOrders(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn("maintenanceService.getWorkOrders refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Assets from Backend
  const refreshAssets = useCallback(async () => {
    try {
      const res = await masterDataService.getAssets();
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        setAssets(list);
      }
    } catch (err) {
      console.warn("masterDataService.getAssets refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Reliability from Backend
  const refreshReliability = useCallback(async () => {
    try {
      const res = await maintenanceService.getReliabilityMetrics();
      const data = res?.data || res;
      if (data && data.plantOverall) {
        setReliabilityMetrics(data);
        if (Array.isArray(data.repeatFailures)) {
          setRepeatFailures(data.repeatFailures);
        }
        return data;
      }
    } catch (err) {
      console.warn("maintenanceService.getReliabilityMetrics refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Calibrations from Backend
  const refreshCalibrations = useCallback(async () => {
    try {
      const res = await maintenanceService.getCalibrations();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setCalibrations(list);
        return list;
      }
    } catch (err) {
      console.warn("maintenanceService.getCalibrations refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Spare Parts from Backend
  const refreshSpareParts = useCallback(async () => {
    try {
      const res = await maintenanceService.getSpareParts();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setSpareParts(list);
        return list;
      }
    } catch (err) {
      console.warn("maintenanceService.getSpareParts refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Troubleshooting Solutions from Backend
  const refreshSolutions = useCallback(async () => {
    try {
      const res = await maintenanceService.getTroubleshooting();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setSolutions(list);
        return list;
      }
    } catch (err) {
      console.warn("maintenanceService.getTroubleshooting refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Notifications from Backend
  const refreshNotifications = useCallback(async () => {
    try {
      const res = await maintenanceService.getNotifications();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setNotifications(list);
        localStorage.setItem("flowstate_notifications", JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.warn("maintenanceService.getNotifications refresh notice:", err.message || err);
    }
  }, []);

  // Refresh Profile from Backend
  const refreshProfile = useCallback(async () => {
    try {
      const res = await maintenanceService.getProfile();
      const profileData = res?.data || res;
      if (profileData && profileData.name) {
        setUserProfile(profileData);
        localStorage.setItem("flowstate_user_profile", JSON.stringify(profileData));
        return profileData;
      }
    } catch (err) {
      console.warn("maintenanceService.getProfile refresh notice:", err.message || err);
    }
  }, []);

  // Synchronize CMMS Work Orders & PM Schedules with Fastify backend
  useEffect(() => {
    async function syncCMMSBackend() {
      try {
        const [remoteWOs, remotePMs, remoteSpares, remoteAssets, remoteBreakdowns, remoteReliability, remoteCalibrations, remoteSolutions, remoteNotifs, remoteProf] = await Promise.allSettled([
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
          maintenanceService.getWorkOrders(),
          maintenanceService.getPMSchedules(),
          maintenanceService.getSpareParts(),
          masterDataService.getAssets(),
<<<<<<< HEAD
        ]);

        if (remoteAssets.status === "fulfilled" && Array.isArray(remoteAssets.value) && remoteAssets.value.length > 0) {
          const mapped = remoteAssets.value.map((a) => ({
            id: a.assetCode || a.assetId || a.id,
            name: a.name,
            department: a.department || a.lineName || a.type || "General",
            line: a.lineName || a.line || "Line 1",
            status: a.status || "Operational",
            health: a.healthPercent !== undefined ? Number(a.healthPercent) : 95,
            vibration: a.vibration !== undefined ? Number(a.vibration) : 1.5,
            temperature: a.temperature !== undefined ? Number(a.temperature) : 48,
            _raw: a,
          }));
          setAssets(mapped);
          localStorage.setItem("flowstate_assets", JSON.stringify(mapped));
        }

        if (remoteWOs.status === "fulfilled" && Array.isArray(remoteWOs.value)) {
          const mappedWOs = remoteWOs.value.map((wo) => ({
            id: wo.woNumber || wo.id,
            dbId: wo.id,
            title: wo.title,
            description: wo.description || "",
            type: wo.type || "Corrective",
            priority: wo.priority === "P1_CRITICAL" ? "P1 - Critical" : wo.priority === "HIGH" ? "P2 - High" : wo.priority === "MEDIUM" ? "P3 - Medium" : "P4 - Low",
            status: wo.status === "IN_PROGRESS" ? "In Progress" : wo.status === "COMPLETED" ? "Completed" : wo.status === "CLOSED" ? "Closed" : (wo.status === "OPEN" ? "Open" : wo.status || "Open"),
            assetId: wo.asset?.assetCode || wo.asset?.id || wo.assetId,
            assetName: wo.asset?.name || wo.assetId,
            assignedTechnician: wo.assignedUser?.name || "Maintenance Technician",
            createdDate: wo.createdAt ? new Date(wo.createdAt).toISOString().replace("T", " ").substring(0, 16) : new Date().toISOString().replace("T", " ").substring(0, 16),
            comments: [],
            _raw: wo
          }));
          setWorkOrders(mappedWOs);
          localStorage.setItem("flowstate_work_orders", JSON.stringify(mappedWOs));
        }
        if (remotePMs.status === "fulfilled" && Array.isArray(remotePMs.value)) {
          setPmSchedules(remotePMs.value);
        }
        if (remoteSpares.status === "fulfilled" && Array.isArray(remoteSpares.value)) {
          setSpareParts(remoteSpares.value);
=======
          maintenanceService.getBreakdowns(),
          maintenanceService.getReliabilityMetrics(),
          maintenanceService.getCalibrations(),
          maintenanceService.getTroubleshooting(),
          maintenanceService.getNotifications(),
          maintenanceService.getProfile(),
        ]);

        if (remoteWOs.status === "fulfilled") {
          const list = Array.isArray(remoteWOs.value) ? remoteWOs.value : (remoteWOs.value?.data || []);
          if (Array.isArray(list) && list.length > 0) {
            setWorkOrders(normalizeWorkOrders(list));
          }
        }
        if (remotePMs.status === "fulfilled") {
          const list = Array.isArray(remotePMs.value) ? remotePMs.value : (remotePMs.value?.data || []);
          if (Array.isArray(list)) {
            setPmSchedules(list);
          }
        }
        if (remoteSpares.status === "fulfilled") {
          const list = Array.isArray(remoteSpares.value) ? remoteSpares.value : (remoteSpares.value?.data || []);
          if (Array.isArray(list)) {
            setSpareParts(list);
          }
        }
        if (remoteAssets.status === "fulfilled") {
          const list = remoteAssets.value?.data || remoteAssets.value || [];
          if (Array.isArray(list)) {
            setAssets(list);
          }
        }
        if (remoteBreakdowns.status === "fulfilled") {
          const list = Array.isArray(remoteBreakdowns.value) ? remoteBreakdowns.value : (remoteBreakdowns.value?.data || []);
          if (Array.isArray(list)) {
            setBreakdowns(list);
          }
        }
        if (remoteReliability.status === "fulfilled") {
          const data = remoteReliability.value?.data || remoteReliability.value;
          if (data && data.plantOverall) {
            setReliabilityMetrics(data);
            if (Array.isArray(data.repeatFailures)) {
              setRepeatFailures(data.repeatFailures);
            }
          }
        }
        if (remoteCalibrations.status === "fulfilled") {
          const list = Array.isArray(remoteCalibrations.value) ? remoteCalibrations.value : (remoteCalibrations.value?.data || []);
          if (Array.isArray(list)) {
            setCalibrations(list);
          }
        }
        if (remoteSolutions.status === "fulfilled") {
          const list = Array.isArray(remoteSolutions.value) ? remoteSolutions.value : (remoteSolutions.value?.data || []);
          if (Array.isArray(list)) {
            setSolutions(list);
          }
        }
        if (remoteNotifs.status === "fulfilled") {
          const list = Array.isArray(remoteNotifs.value) ? remoteNotifs.value : (remoteNotifs.value?.data || []);
          if (Array.isArray(list)) {
            setNotifications(list);
            localStorage.setItem("flowstate_notifications", JSON.stringify(list));
          }
        }
        if (remoteProf.status === "fulfilled") {
          const profileData = remoteProf.value?.data || remoteProf.value;
          if (profileData && profileData.name) {
            setUserProfile(profileData);
            localStorage.setItem("flowstate_user_profile", JSON.stringify(profileData));
          }
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
        }
      } catch (err) {
        console.warn("CMMS backend sync fallback:", err.message);
      }
    }
    syncCMMSBackend();
  }, []);

<<<<<<< HEAD
  // Real-time synchronization with MasterDataContext asset changes
  useEffect(() => {
    const handleSyncAssets = (e) => {
      const incoming = e?.detail;
      if (Array.isArray(incoming) && incoming.length > 0) {
        setAssets(
          incoming.map((a) => ({
            id: a.assetId || a.assetCode || a.id,
            name: a.name,
            department: a.department || a.lineName || a.type || "General",
            line: a.lineName || a.line || "Line 1",
            status: a.status || "Operational",
            health: a.health !== undefined ? Number(a.health) : (a.healthPercent !== undefined ? Number(a.healthPercent) : 95),
            vibration: a.vibration !== undefined ? Number(a.vibration) : 1.5,
            temperature: a.temperature !== undefined ? Number(a.temperature) : 48,
            _raw: a,
          }))
        );
        return;
      }
      const saved = localStorage.getItem("mx_master_assets");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAssets(
              parsed.map((a) => ({
                id: a.assetId || a.assetCode || a.id,
                name: a.name,
                department: a.department || a.lineName || a.type || "General",
                line: a.lineName || a.line || "Line 1",
                status: a.status || "Operational",
                health: a.health !== undefined ? Number(a.health) : (a.healthPercent !== undefined ? Number(a.healthPercent) : 95),
                vibration: a.vibration !== undefined ? Number(a.vibration) : 1.5,
                temperature: a.temperature !== undefined ? Number(a.temperature) : 48,
                _raw: a,
              }))
            );
          }
        } catch (_) {}
      }
    };

    window.addEventListener("maintenx:asset_updated", handleSyncAssets);
    window.addEventListener("storage", handleSyncAssets);
    return () => {
      window.removeEventListener("maintenx:asset_updated", handleSyncAssets);
      window.removeEventListener("storage", handleSyncAssets);
    };
  }, []);

=======
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  useEffect(() => {
    const handleTenantChanged = () => {
      setAssets([]);
      setAssetHierarchy([]);
      setWorkOrders([]);
      setPmPlans([]);
      setPmSchedules([]);
      setChecklistTemplates([]);
      setChecklistHistory([]);
      setBreakdowns([]);
      setSpareParts([]);
      setPartsRequests([]);
      setCalibrations([]);
      setCalibrationHistory([]);
      setFailureCodes([]);
      setSolutions([]);
      setRepeatFailures([]);
      setReliabilityMetrics({});
      const keys = [
        "flowstate_assets",
        "flowstate_asset_hierarchy",
        "flowstate_work_orders",
        "flowstate_pm_plans",
        "flowstate_pm_schedules",
        "flowstate_checklists",
        "flowstate_checklist_history",
        "flowstate_breakdowns",
        "flowstate_spare_parts",
        "flowstate_parts_requests",
        "flowstate_calibrations",
        "flowstate_calibration_history",
        "flowstate_failure_codes",
        "flowstate_solutions"
      ];
      keys.forEach((k) => localStorage.removeItem(k));
    };
    window.addEventListener("maintenx:tenant_changed", handleTenantChanged);
    return () => window.removeEventListener("maintenx:tenant_changed", handleTenantChanged);
  }, []);

<<<<<<< HEAD
  // Persist workOrders state across dashboards
  useEffect(() => {
    if (workOrders && workOrders.length > 0) {
      localStorage.setItem("flowstate_work_orders", JSON.stringify(workOrders));
    }
  }, [workOrders]);

=======
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  // Dynamic MTTR / MTBF recalculation based on actual Breakdowns
  useEffect(() => {
    const resolvedBDs = breakdowns.filter(b => b.status === "Resolved" || b.status === "Closed");
    
    let totalDowntimeMin = 0;
    const assetFailureCounts = {};
    
    resolvedBDs.forEach(bd => {
       totalDowntimeMin += bd.durationMinutes || 0;
       assetFailureCounts[bd.assetId] = (assetFailureCounts[bd.assetId] || 0) + 1;
    });

    const breakdownCount = resolvedBDs.length;
    const mttrHrs = breakdownCount > 0 ? (totalDowntimeMin / 60) / breakdownCount : 0;
    
    // Very simple MTBF mock calculation: Total assumed operating hours (e.g. 720 for a month) / breakdownCount
    const mtbfHrs = breakdownCount > 0 ? 720 / breakdownCount : 720;
    
    setReliabilityMetrics(prev => ({
      ...prev,
      plantOverall: {
        ...prev.plantOverall,
        mttrHours: mttrHrs.toFixed(1),
        mtbfHours: mtbfHrs.toFixed(1),
        downtimeHours: (totalDowntimeMin / 60).toFixed(1)
      }
    }));
    
    // Also update asset 'recentFailuresCount'
    setAssets((prevAssets) => 
      prevAssets.map(a => ({
        ...a,
        recentFailuresCount: assetFailureCounts[a.id] || a.recentFailuresCount || 0
      }))
    );
  }, [breakdowns]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("flowstate_assets", JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem("flowstate_work_orders", JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem("flowstate_pm_plans", JSON.stringify(pmPlans));
  }, [pmPlans]);

  useEffect(() => {
    localStorage.setItem("flowstate_pm_schedules", JSON.stringify(pmSchedules));
  }, [pmSchedules]);

  useEffect(() => {
    localStorage.setItem("flowstate_checklists_v2", JSON.stringify(checklistTemplates));
  }, [checklistTemplates]);

  useEffect(() => {
    localStorage.setItem("flowstate_checklist_history", JSON.stringify(checklistHistory));
  }, [checklistHistory]);

  useEffect(() => {
    localStorage.setItem("flowstate_breakdowns", JSON.stringify(breakdowns));
  }, [breakdowns]);

  useEffect(() => {
    localStorage.setItem("flowstate_solutions", JSON.stringify(solutions));
  }, [solutions]);

  useEffect(() => {
    localStorage.setItem("flowstate_spare_parts", JSON.stringify(spareParts));
  }, [spareParts]);

  useEffect(() => {
    localStorage.setItem("flowstate_parts_requests", JSON.stringify(partsRequests));
  }, [partsRequests]);

  useEffect(() => {
    localStorage.setItem("flowstate_calibrations", JSON.stringify(calibrations));
  }, [calibrations]);

  useEffect(() => {
    localStorage.setItem("flowstate_calibration_history", JSON.stringify(calibrationHistory));
  }, [calibrationHistory]);

  useEffect(() => {
    localStorage.setItem("flowstate_failure_codes", JSON.stringify(failureCodes));
  }, [failureCodes]);

  useEffect(() => {
    localStorage.setItem("flowstate_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("flowstate_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("flowstate_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  // Real-time IoT simulation heartbeat
  useEffect(() => {
    if (!isLiveTelemetryStreaming) return;
    const interval = setInterval(() => {
      setIotTelemetry((prev) => {
        const vibDelta = (Math.random() - 0.5) * 0.15;
        const tempDelta = (Math.random() - 0.5) * 0.4;
        const presDelta = (Math.random() - 0.5) * 0.1;
        const rpmDelta = Math.floor((Math.random() - 0.5) * 20);
        const powerDelta = (Math.random() - 0.5) * 0.8;
        const flowDelta = Math.floor((Math.random() - 0.5) * 50);

        const newVib = Math.max(0.8, Math.min(4.5, +(prev.vibration + vibDelta).toFixed(2)));
        const newTemp = Math.max(40, Math.min(85, +(prev.temperature + tempDelta).toFixed(1)));
        const newPres = Math.max(3.0, Math.min(9.0, +(prev.pressure + presDelta).toFixed(2)));
        const newRpm = Math.max(900, Math.min(1400, prev.rpm + rpmDelta));
        const newPower = Math.max(20, Math.min(80, +(prev.powerKW + powerDelta).toFixed(1)));
        const newFlow = Math.max(7000, Math.min(11000, prev.flowRate + flowDelta));

        return {
          vibration: newVib,
          temperature: newTemp,
          pressure: newPres,
          rpm: newRpm,
          powerKW: newPower,
          flowRate: newFlow,
          status: newVib > 3.5 || newTemp > 75 ? "Warning" : "Normal",
          lastUpdated: new Date().toLocaleTimeString()
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveTelemetryStreaming]);

  // Asset Actions
  const addAsset = async (newAsset) => {
    const id = newAsset.id || `ASSET-${Math.floor(100 + Math.random() * 900)}`;
    const assetWithMeta = {
      ...newAsset,
      id,
      health: newAsset.health || 100,
      status: newAsset.status || "Operational",
      installedDate: newAsset.installedDate || new Date().toISOString().substring(0, 10),
      openWorkOrders: 0,
      recentFailuresCount: 0,
      runtimeHours: newAsset.runtimeHours || 0,
      temperature: newAsset.temperature || 55.0,
      vibration: newAsset.vibration || 1.5,
      pressure: newAsset.pressure || 6.0
    };
    setAssets((prev) => [assetWithMeta, ...prev]);

    try {
      const res = await masterDataService.createAsset({
        id: assetWithMeta.id,
        name: assetWithMeta.name,
        type: assetWithMeta.type,
        plant: assetWithMeta.plant,
        department: assetWithMeta.department,
        line: assetWithMeta.line,
        location: assetWithMeta.location,
        criticality: assetWithMeta.criticality,
        status: assetWithMeta.status,
        health: assetWithMeta.health,
        manufacturer: assetWithMeta.manufacturer,
        model: assetWithMeta.model,
        installedDate: assetWithMeta.installedDate,
        mtbf: assetWithMeta.mtbf,
        mttr: assetWithMeta.mttr,
      });
      if (res?.data) {
        setAssets((prev) => prev.map((a) => (a.id === assetWithMeta.id ? { ...a, ...res.data } : a)));
      }
    } catch (err) {
      console.warn("masterDataService.createAsset error:", err.message);
    }
    return assetWithMeta;
  };

  const updateAssetStatus = async (assetId, newStatus, healthChange = 0) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === assetId || asset.dbId === assetId) {
          const updated = {
            ...asset,
            status: newStatus,
            health: Math.max(0, Math.min(100, asset.health + healthChange))
          };
          window.dispatchEvent(
            new CustomEvent("AssetStatusChanged", {
              detail: { assetId, status: newStatus, lineId: asset.lineId }
            })
          );
          return updated;
        }
        return asset;
      })
    );
    try {
      await masterDataService.updateAsset(assetId, { status: newStatus, healthChange });
    } catch {
      maintenanceService.updateAsset(assetId, { status: newStatus, healthChange }).catch(() => {});
    }
  };

  const updateAsset = async (assetId, updatedFields) => {
    try {
      const res = await masterDataService.updateAsset(assetId, updatedFields);
      const serverAsset = res?.data || res;
      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.id === assetId || asset.dbId === assetId || asset.assetCode === assetId) {
            return {
              ...asset,
              ...(typeof serverAsset === "object" ? serverAsset : {}),
              ...updatedFields,
              id: asset.id,
              lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16)
            };
          }
          return asset;
        })
      );
      return serverAsset;
    } catch (err) {
      console.warn("masterDataService.updateAsset error:", err.message);
      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.id === assetId || asset.dbId === assetId || asset.assetCode === assetId) {
            return {
              ...asset,
              ...updatedFields,
              id: asset.id,
              lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16)
            };
          }
          return asset;
        })
      );
    }
  };

  const deleteAsset = async (assetId) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId && asset.dbId !== assetId));
    try {
      await masterDataService.deleteAsset(assetId);
    } catch (err) {
      console.warn("masterDataService.deleteAsset error:", err.message);
    }
  };

  // Work Order Actions
  const addWorkOrder = async (newWO) => {
    let createdFromBackend = null;
    const techToAssign = newWO.assignedTechnician || newWO.technician || newWO.assignedTo;
    try {
      const res = await maintenanceService.createWorkOrder({
        assetId: newWO.assetId || "ASSET-101",
        title: newWO.title,
        description: newWO.description || newWO.symptom || newWO.issue || "",
        type: newWO.type || "Corrective",
        priority: newWO.priority || "HIGH",
        estimatedHours: Number(newWO.estimatedHours) || 2.0,
        dueDate: newWO.dueDate,
        scheduledDate: newWO.dueDate || newWO.scheduledDate,
        assignedTo: techToAssign,
        assignedTechnician: techToAssign,
        technician: techToAssign
      });
      createdFromBackend = res?.data || res;
    } catch (err) {
      console.warn("maintenanceService.createWorkOrder error:", err.message);
    }

    const id = createdFromBackend?.woNumber || newWO.id || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const assignedTechName = createdFromBackend?.assignedUser
      ? `${createdFromBackend.assignedUser.firstName || ""} ${createdFromBackend.assignedUser.lastName || ""}`.trim()
      : (techToAssign || "Unassigned");

    const woWithMeta = {
      ...newWO,
      id,
      dbId: createdFromBackend?.id,
      woNumber: createdFromBackend?.woNumber || id,
      createdDate: new Date().toISOString().substring(0, 10),
      dueDate: newWO.dueDate || (createdFromBackend?.scheduledDate ? new Date(createdFromBackend.scheduledDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)),
      status: newWO.status || "Open",
      priority: newWO.priority || "P2 - High",
      type: newWO.type || "Corrective",
      assignedTechnician: assignedTechName,
      partsRequired: newWO.partsRequired || [],
      toolsRequired: newWO.toolsRequired || [],
      comments: newWO.comments || []
    };
    setWorkOrders((prev) => [woWithMeta, ...prev]);

    if (newWO.assetId) {
      setAssets((prev) =>
        prev.map((a) => (a.id === newWO.assetId ? { ...a, openWorkOrders: (a.openWorkOrders || 0) + 1 } : a))
      );
    }

    await refreshWorkOrders();
    return woWithMeta;
  };

  const updateWorkOrder = async (woId, updateData) => {
    const techName = updateData.technician || updateData.assignedTechnician;
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId || wo.dbId === woId || wo.woNumber === woId) {
          return {
            ...wo,
            ...updateData,
            title: updateData.title || wo.title,
            description: updateData.description || updateData.issue || wo.description,
            symptom: updateData.description || updateData.issue || wo.symptom,
            priority: updateData.priority || wo.priority,
            status: updateData.status || wo.status,
            assignedTechnician: techName || wo.assignedTechnician,
            dueDate: updateData.dueDate || wo.dueDate,
            actualHours: updateData.actualHours !== undefined ? Number(updateData.actualHours) : wo.actualHours,
            estimatedHours: updateData.estimatedHours !== undefined ? Number(updateData.estimatedHours) : wo.estimatedHours
          };
        }
        return wo;
      })
    );

    try {
      await maintenanceService.updateWorkOrder(woId, {
        title: updateData.title,
        description: updateData.description || updateData.issue,
        priority: updateData.priority,
        status: updateData.status,
        dueDate: updateData.dueDate,
        technician: techName,
        assignedTechnician: techName,
        assignedTo: updateData.assignedTo || techName,
        actualHours: updateData.actualHours !== undefined ? Number(updateData.actualHours) : undefined,
        estimatedHours: updateData.estimatedHours !== undefined ? Number(updateData.estimatedHours) : undefined
      });
      await refreshWorkOrders();
    } catch (err) {
      console.warn("maintenanceService.updateWorkOrder error:", err.message);
    }
  };

  const deleteWorkOrder = async (woId) => {
    setWorkOrders((prev) => prev.filter((wo) => wo.id !== woId && wo.dbId !== woId && wo.woNumber !== woId));

    try {
      await maintenanceService.deleteWorkOrder(woId);
      refreshWorkOrders();
    } catch (err) {
      console.warn("maintenanceService.deleteWorkOrder error:", err.message);
    }
  };

  const updateWorkOrderStatus = async (woId, newStatus, notes = "") => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId || wo.dbId === woId || wo.woNumber === woId) {
          const updated = { ...wo, status: newStatus };
          if (notes) {
            updated.comments = [
              ...(wo.comments || []),
              {
                user: userProfile?.name || "Current User",
                time: new Date().toISOString().replace("T", " ").substring(0, 16),
                text: `Status updated to ${newStatus}: ${notes}`
              }
            ];
          }
          return updated;
        }
        return wo;
      })
    );

    try {
      await maintenanceService.updateWorkOrderStatus(woId, newStatus);
      refreshWorkOrders();
    } catch (err) {
      console.warn("maintenanceService.updateWorkOrderStatus:", err.message);
    }
  };

  const startWorkOrder = (woId) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId) {
          return {
            ...wo,
            status: "In Progress",
            actualStartTime: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
        }
        return wo;
      })
    );
    maintenanceService.updateWorkOrderStatus(woId, "IN_PROGRESS").catch(err => console.warn("maintenanceService.startWorkOrder:", err.message));
  };

  const completeWorkOrder = (woId, closureDetails = {}) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId) {
          const endTime = new Date().toISOString().replace("T", " ").substring(0, 16);
          let durationMinutes = 0;
          if (wo.actualStartTime) {
             const start = new Date(wo.actualStartTime);
             const end = new Date(endTime);
             durationMinutes = Math.max(0, Math.floor((end - start) / 60000));
          }
          return {
            ...wo,
            ...closureDetails,
            status: closureDetails.status || "Completed",
            actualEndTime: endTime,
            durationMinutes: closureDetails.durationMinutes || durationMinutes,
          };
        }
        return wo;
      })
    );
    maintenanceService.updateWorkOrderStatus(woId, "COMPLETED").catch(err => console.warn("maintenanceService.completeWorkOrder:", err.message));
  };

  const addWorkOrderComment = (woId, text) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId) {
          return {
            ...wo,
            comments: [
              ...(wo.comments || []),
              {
                user: userProfile?.name || "Marcus Vance",
                time: new Date().toISOString().replace("T", " ").substring(0, 16),
                text
              }
            ]
          };
        }
        return wo;
      })
    );
  };

  // PM Actions
  const addPMPlan = (newPlan) => {
    const id = newPlan.id || `PLAN-PM-${Math.floor(100 + Math.random() * 900)}`;
    const planWithMeta = {
      ...newPlan,
      id,
      status: "Active",
      createdDate: new Date().toISOString().substring(0, 10)
    };
    setPmPlans((prev) => [planWithMeta, ...prev]);
    return planWithMeta;
  };

  const refreshPMSchedules = useCallback(async () => {
    try {
      const res = await maintenanceService.getPMSchedules();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setPmSchedules(list);
        return list;
      }
    } catch (err) {
      console.warn("refreshPMSchedules notice:", err.message || err);
    }
  }, []);

  const addPMSchedule = async (newSchedule) => {
    try {
      const res = await maintenanceService.createPMSchedule({
        title: newSchedule.title,
        assetId: newSchedule.assetId,
        assetName: newSchedule.assetName,
        frequency: newSchedule.frequency,
        status: newSchedule.status || "Upcoming",
        assignedTo: newSchedule.assignedTechnician || newSchedule.assignedTo,
        dueDate: newSchedule.dueNext || newSchedule.dueDate,
        templateId: newSchedule.templateId,
        priority: newSchedule.priority,
      });
      const created = res?.data || res;
      await refreshPMSchedules();
      return created;
    } catch (err) {
      console.warn("Backend createPMSchedule failed, using local fallback:", err.message);
      const id = newSchedule.id || `PM-SCH-${Math.floor(100 + Math.random() * 900)}`;
      const schedWithMeta = {
        ...newSchedule,
        id,
        status: "Upcoming",
        complianceRate: "100%"
      };
      setPmSchedules((prev) => [schedWithMeta, ...prev]);
      return schedWithMeta;
    }
  };

  const updatePMSchedule = async (schedId, updateData) => {
    try {
      const res = await maintenanceService.updatePMSchedule(schedId, updateData);
      await refreshPMSchedules();
      return res?.data || res;
    } catch (err) {
      console.warn("Backend updatePMSchedule failed, using local fallback:", err.message);
      setPmSchedules((prev) =>
        prev.map((s) => (s.id === schedId || s.dbId === schedId || s.scheduleCode === schedId ? { ...s, ...updateData } : s))
      );
    }
  };

  const deletePMSchedule = async (schedId) => {
    try {
      await maintenanceService.deletePMSchedule(schedId);
      await refreshPMSchedules();
      return true;
    } catch (err) {
      console.warn("Backend deletePMSchedule failed, using local fallback:", err.message);
      setPmSchedules((prev) => prev.filter((s) => s.id !== schedId && s.dbId !== schedId && s.scheduleCode !== schedId));
    }
  };

  const updatePMScheduleStatus = async (schedId, newStatus, activeWoId = null) => {
    try {
      await maintenanceService.updatePMSchedule(schedId, { status: newStatus });
    } catch (err) {
      console.warn("Backend updatePMScheduleStatus sync failed:", err.message);
    }
    setPmSchedules((prev) =>
      prev.map((s) => {
        if (s.id === schedId || s.dbId === schedId || s.scheduleCode === schedId) {
          const updated = { ...s, status: newStatus };
          if (activeWoId) updated.activeWoId = activeWoId;
          return updated;
        }
        return s;
      })
    );
  };

  const addCalibrationRecord = async (recordData) => {
    const id = `CAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id,
      assetId: recordData.assetId,
      name: recordData.name || assets.find(a => a.id === recordData.assetId)?.name || "Instrument",
      lastCalibration: recordData.lastCalibration || new Date().toISOString().substring(0, 10),
      nextDueDate: recordData.nextDueDate,
      status: "Valid",
      certificate: `CERT-${Math.floor(10000 + Math.random() * 90000)}`,
      technician: recordData.technician || userProfile?.name || "Metrology Tech",
      result: recordData.result || "PASS - Within Tolerance",
      isUserCreated: true
    };
    try {
      const res = await maintenanceService.createCalibration(newRecord);
      const saved = (res && res.id) ? res : (res?.data?.data || res?.data);
      if (saved && saved.id) {
        setCalibrations((prev) => [saved, ...prev.filter(c => c.id !== saved.id)]);
        if (refreshCalibrations) {
          await refreshCalibrations();
        }
        return saved;
      }
    } catch (e) {
      console.warn("Could not save calibration to backend DB:", e.message);
    }
    setCalibrations((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const completeChecklistExecution = (executionResult) => {
    const histId = `HIST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: histId,
      templateId: executionResult.templateId,
      templateName: executionResult.templateName,
      assetId: executionResult.assetId,
      assetName: executionResult.assetName,
      executionDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      technician: executionResult.technician || userProfile?.name || "Marcus Vance",
      status: executionResult.hasFailures ? "Passed with Exceptions" : "Completed",
      score: executionResult.score || "100%",
      findings: executionResult.findings || "All inspection steps executed according to OEM standard."
    };
    setChecklistHistory((prev) => [newRecord, ...prev]);

    // Update corresponding PM schedule lastCompleted
    setPmSchedules((prev) =>
      prev.map((s) => {
        if (s.assetId === executionResult.assetId) {
          return {
            ...s,
            status: "Upcoming",
            lastCompleted: new Date().toISOString().replace("T", " ").substring(0, 16)
          };
        }
        return s;
      })
    );
    return newRecord;
  };

  const handleFailedPMCheck = ({ assetId, checklistName, checkItemLabel, actualValue, limitText, severity = "Critical", originalWoId }) => {
    let desc = `Immediate inspection and corrective action required following failed PM verification check.`;
    if (originalWoId) desc += `\nOriginating Work Order: ${originalWoId}`;

    const correctiveWO = addWorkOrder({
      title: `Corrective: PM Check Failed - ${checkItemLabel}`,
      assetId,
      assetName: assets.find((a) => a.id === assetId)?.name || assetId,
      type: "Corrective",
      priority: severity === "Critical" ? "P1 - Critical" : "P2 - High",
      status: "Open",
      department: "Maintenance",
      assignedTechnician: userProfile?.name || "Marcus Vance (Senior Tech)",
      failureCode: "MEC-004",
      symptom: `Failed PM Check during '${checklistName}': ${checkItemLabel}. Actual: ${actualValue}, Limit: ${limitText}.`,
      description: desc
    });

    updateAssetStatus(assetId, severity === "Critical" ? "Out of Service" : "Degraded", -20);
    return correctiveWO;
  };

  // Breakdown Actions
  const reportBreakdown = async (breakdownData) => {
    const tempId = `BD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newBD = {
      durationMinutes: 0,
      ...breakdownData,
      id: tempId,
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Active Repair",
      durationMinutes: breakdownData.durationMinutes !== undefined ? Number(breakdownData.durationMinutes) : 0
    };
    setBreakdowns((prev) => [newBD, ...prev]);

    if (breakdownData.assetId) {
      updateAssetStatus(breakdownData.assetId, "DOWN", -35);
    }

    try {
      const res = await maintenanceService.reportBreakdown(breakdownData);
      const serverBD = res?.data || res;
      if (serverBD && (serverBD.id || serverBD.dbId)) {
        setBreakdowns((prev) => prev.map((b) => (b.id === tempId ? { ...b, ...serverBD } : b)));
        refreshWorkOrders();
        if (refreshNotifications) refreshNotifications();
        return serverBD;
      }
    } catch (err) {
      console.warn("maintenanceService.reportBreakdown error:", err.message);
    }

    return newBD;
  };

  const resolveBreakdown = async (breakdownId, repairDetails) => {
    const target = breakdowns.find(b => b.id === breakdownId || b.dbId === breakdownId || b.workOrderId === breakdownId || b.downtimeLogId === breakdownId);
    setBreakdowns((prev) =>
      prev.map((bd) => {
        if (bd.id === breakdownId || bd.dbId === breakdownId) {
          if (bd.assetId) {
            updateAssetStatus(bd.assetId, "Operational", +30);
          }
          const endTimeStr = new Date().toISOString().replace("T", " ").substring(0, 16);
          const start = new Date(bd.startTime || Date.now());
          const end = new Date(endTimeStr);
          const durationMinutes = Math.max(0, Math.floor((end - start) / 60000));
          return {
            ...bd,
            status: "Resolved",
            endTime: endTimeStr,
            durationMinutes: repairDetails?.durationMinutes !== undefined ? Number(repairDetails.durationMinutes) : durationMinutes,
            ...repairDetails
          };
        }
        return bd;
      })
    );

    try {
      const targetId = target?.dbId || target?.downtimeLogId || target?.workOrderId || breakdownId;
      await maintenanceService.resolveBreakdown(targetId, { ...repairDetails, breakdownId });
      refreshWorkOrders();
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      console.warn("maintenanceService.resolveBreakdown:", err.message);
    }
  };

  const updateBreakdown = async (breakdownId, updatedFields) => {
    const target = breakdowns.find(b => b.id === breakdownId || b.dbId === breakdownId || b.workOrderId === breakdownId || b.downtimeLogId === breakdownId);
    const normalizedFields = {
      ...updatedFields,
      ...(updatedFields.durationMinutes !== undefined && updatedFields.durationMinutes !== null && updatedFields.durationMinutes !== ""
        ? { durationMinutes: Number(updatedFields.durationMinutes) }
        : {})
    };
    setBreakdowns((prev) =>
      prev.map((bd) => (bd.id === breakdownId || bd.dbId === breakdownId ? { ...bd, ...normalizedFields } : bd))
    );
    try {
      const targetId = target?.dbId || target?.downtimeLogId || target?.workOrderId || breakdownId;
      await maintenanceService.updateBreakdown(targetId, { ...normalizedFields, breakdownId });
      refreshWorkOrders();
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      console.warn("maintenanceService.updateBreakdown:", err.message);
    }
  };

  const updateBreakdownStatus = async (breakdownId, newStatus, notes = "") => {
    const target = breakdowns.find(b => b.id === breakdownId || b.dbId === breakdownId || b.workOrderId === breakdownId || b.downtimeLogId === breakdownId);
    setBreakdowns((prev) =>
      prev.map((bd) => {
        if (bd.id === breakdownId || bd.dbId === breakdownId) {
          const updated = { ...bd, status: newStatus };
          if (newStatus === "Resolved" || newStatus === "Closed") {
            if (bd.assetId) {
              updateAssetStatus(bd.assetId, "Operational", +25);
            }
            if (!bd.endTime) {
              updated.endTime = new Date().toISOString().replace("T", " ").substring(0, 16);
            }
          }
          if (notes) {
            updated.resolution = notes;
          }
          return updated;
        }
        return bd;
      })
    );
    try {
      const targetId = target?.dbId || target?.downtimeLogId || target?.workOrderId || breakdownId;
      await maintenanceService.updateBreakdown(targetId, { status: newStatus, notes, breakdownId });
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      console.warn("maintenanceService.updateBreakdownStatus:", err.message);
    }
  };

  const deleteBreakdown = async (breakdownId) => {
    const target = breakdowns.find(b => b.id === breakdownId || b.dbId === breakdownId || b.workOrderId === breakdownId || b.downtimeLogId === breakdownId);
    setBreakdowns((prev) => prev.filter((bd) => bd.id !== breakdownId && bd.dbId !== breakdownId));
    try {
      const targetId = target?.dbId || target?.downtimeLogId || target?.workOrderId || breakdownId;
      await maintenanceService.deleteBreakdown(targetId);
    } catch (err) {
      console.warn("maintenanceService.deleteBreakdown error:", err.message);
    }
  };

  // Spare Parts Actions
  const addSparePart = async (newPart) => {
    const stock = Number(newPart.stock ?? newPart.currentStock ?? 0);
    const minStock = Number(newPart.minStock ?? newPart.minStockLevel ?? 5);
    const partWithMeta = {
      ...newPart,
      partNo: newPart.partNo || newPart.partNumber,
      stock,
      minStock,
      status: stock <= minStock ? "Low Stock" : "In Stock"
    };

    try {
      const res = await maintenanceService.createSparePart(partWithMeta);
      const saved = (res && res.id) ? res : (res?.data?.data || res?.data);
      if (saved && (saved.id || saved.partNo)) {
        setSpareParts((prev) => [saved, ...prev.filter(p => p.id !== saved.id && p.partNo !== saved.partNo)]);
        if (refreshSpareParts) {
          await refreshSpareParts();
        }
        return saved;
      }
    } catch (e) {
      console.warn("Could not save spare part to backend DB:", e.message);
    }

    setSpareParts((prev) => [partWithMeta, ...prev]);
    return partWithMeta;
  };

  const updateSparePart = async (partId, updateData) => {
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.id === partId || part.partNo === partId || part.partNumber === partId) {
          const updated = { ...part, ...updateData };
          const stock = Number(updated.stock ?? updated.currentStock ?? 0);
          const minStock = Number(updated.minStock ?? updated.minStockLevel ?? 5);
          return {
            ...updated,
            stock,
            minStock,
            status: stock <= minStock ? "Low Stock" : "In Stock"
          };
        }
        return part;
      })
    );

    try {
      await maintenanceService.updateSparePart(partId, updateData);
      if (refreshSpareParts) {
        await refreshSpareParts();
      }
    } catch (e) {
      console.warn("Could not update spare part in backend DB:", e.message);
    }
  };

  const deleteSparePart = async (partId) => {
    setSpareParts((prev) => prev.filter(p => p.id !== partId && p.partNo !== partId && p.partNumber !== partId));

    try {
      await maintenanceService.deleteSparePart(partId);
      if (refreshSpareParts) {
        await refreshSpareParts();
      }
    } catch (e) {
      console.warn("Could not delete spare part from backend DB:", e.message);
    }
  };

  const issueSparePart = async (partNo, qty = 1, workOrderId = "", assetId = "") => {
    let partName = partNo;
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.partNo === partNo || part.id === partNo) {
          partName = part.name;
          const updatedStock = Math.max(0, part.stock - qty);
          const status = updatedStock <= part.minStock ? "Low Stock" : "In Stock";
          const currentLinked = Array.isArray(part.linkedAssets)
            ? part.linkedAssets
            : (part.linkedAssets ? String(part.linkedAssets).split(',').map(s => s.trim()) : []);
          const newLinked = assetId && !currentLinked.includes(assetId)
            ? [...currentLinked, assetId]
            : currentLinked;

          return { ...part, stock: updatedStock, status, linkedAssets: newLinked };
        }
        return part;
      })
    );

    if (workOrderId) {
      setWorkOrders((prev) => 
        prev.map((wo) => {
          if (wo.id === workOrderId || wo.woNumber === workOrderId) {
            const newPart = { partNo, name: partName, qty, status: "Issued" };
            return {
              ...wo,
              partsRequired: [...(wo.partsRequired || []), newPart]
            };
          }
          return wo;
        })
      );
    }

    try {
      await maintenanceService.issueSparePart(workOrderId, { partNo, qty, assetId });
      if (refreshSpareParts) {
        await refreshSpareParts();
      }
    } catch (e) {
      console.warn("Could not record spare part issuance in backend DB:", e.message);
    }
  };

  const returnSparePart = async (partNo, qty = 1) => {
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.partNo === partNo || part.id === partNo) {
          const updatedStock = part.stock + qty;
          const status = updatedStock <= part.minStock ? "Low Stock" : "In Stock";
          return { ...part, stock: updatedStock, status };
        }
        return part;
      })
    );

    try {
      await maintenanceService.issueSparePart("", { partNo, qty: -qty, action: "RETURN" });
      if (refreshSpareParts) {
        await refreshSpareParts();
      }
    } catch (e) {
      console.warn("Could not record spare part return in backend DB:", e.message);
    }
  };

  const restockSparePart = async (partNo, qty) => {
    const target = spareParts.find(p => p.partNo === partNo || p.id === partNo);
    const newStock = target ? (target.stock + qty) : qty;
    await updateSparePart(partNo, { stock: newStock });
  };

  // Parts Requests Actions
  const addPartsRequest = (requestData) => {
    const id = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      ...requestData,
      id,
      requestDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Pending",
      requestedBy: userProfile?.name || "Marcus Vance"
    };
    setPartsRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const updatePartsRequestStatus = (reqId, newStatus) => {
    setPartsRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          if (newStatus === "Issued") {
            issueSparePart(r.partNo, r.qtyRequested, r.workOrderId);
          }
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  // Calibration Actions
  const addCalibrationSchedule = (newCal) => {
    const id = `CAL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const calWithMeta = {
      ...newCal,
      id,
      status: "Valid",
      statusColor: "emerald",
      isUserCreated: true
    };
    setCalibrations((prev) => [calWithMeta, ...prev]);
    return calWithMeta;
  };

  const recordCalibrationResult = (calId, resultData) => {
    const today = new Date().toISOString().substring(0, 10);
    setCalibrations((prev) =>
      prev.map((cal) => {
        if (cal.id === calId) {
          return {
            ...cal,
            lastCalibrationDate: today,
            status: resultData.passed ? "Valid" : "Failed",
            statusColor: resultData.passed ? "emerald" : "rose",
            resultError: resultData.errorVal || "+0.01",
            certificateNumber: resultData.certNo || `CERT-${Date.now().toString().slice(-6)}`
          };
        }
        return cal;
      })
    );

    const histEntry = {
      id: `CAL-HIST-${Date.now().toString().slice(-6)}`,
      calibrationId: calId,
      instrumentId: resultData.instrumentId || calId,
      instrumentName: resultData.instrumentName || "Calibrated Instrument",
      calibrationDate: today,
      technician: resultData.technician || userProfile?.name || "Marcus Vance",
      standardUsed: resultData.standardUsed || "Primary Standard Unit",
      asFoundError: resultData.asFoundError || "+0.05",
      asLeftError: resultData.errorVal || "+0.01",
      result: resultData.passed ? "Passed" : "Failed - Requires Service",
      certificateNumber: resultData.certNo || `CERT-${Date.now().toString().slice(-6)}`
    };
    setCalibrationHistory((prev) => [histEntry, ...prev]);
  };

  // Failure Codes Actions
  const addFailureCode = (newCode) => {
    setFailureCodes((prev) => [newCode, ...prev]);
  };

  // Troubleshooting / Solutions Actions
  const addVerifiedSolution = async (solutionData) => {
    try {
      const res = await maintenanceService.createTroubleshootingSolution(solutionData);
      const serverSol = res?.data || res;
      if (serverSol && serverSol.id) {
        setSolutions((prev) => [serverSol, ...prev.filter((s) => s.id !== serverSol.id)]);
        return serverSol;
      }
    } catch (err) {
      console.warn("maintenanceService.createTroubleshootingSolution error:", err.message);
    }
    const tempId = `SOL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newSol = {
      ...solutionData,
      id: tempId,
      successfulUsesCount: 1,
      verificationDate: new Date().toISOString().substring(0, 10),
      verifiedBy: userProfile?.name || "Senior Reliability Specialist"
    };
    setSolutions((prev) => [newSol, ...prev]);
    return newSol;
  };

  const rateSolution = (solutionId) => {
    setSolutions((prev) =>
      prev.map((s) => (s.id === solutionId ? { ...s, successfulUsesCount: (s.successfulUsesCount || 1) + 1 } : s))
    );
  };

  // Labour Actions
  const logLabourHours = (employeeId, hours, taskName) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            hoursWorkedMonth: (emp.hoursWorkedMonth || 160) + hours
          };
        }
        return emp;
      })
    );
  };

  // Notifications Actions
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await maintenanceService.markNotificationAsRead(id);
    } catch (err) {
      console.warn("markNotificationAsRead API error:", err.message || err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await maintenanceService.markAllNotificationsAsRead();
    } catch (err) {
      console.warn("markAllNotificationsAsRead API error:", err.message || err);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    localStorage.removeItem("flowstate_notifications");
    try {
      await maintenanceService.clearAllNotifications();
    } catch (err) {
      console.warn("clearAllNotifications API error:", err.message || err);
    }
  };

  const addNotification = (notif) => {
    const id = `NOTIF-${Date.now().toString().slice(-4)}`;
    setNotifications((prev) => [
      {
        ...notif,
        id,
        timestamp: "Just now",
        read: false
      },
      ...prev
    ]);
  };

  // Profile Actions
  const updateUserProfile = async (updatedProfile) => {
    setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
    try {
      await maintenanceService.updateProfile(updatedProfile);
    } catch (e) {
      console.warn("updateProfile API notice:", e.message);
    }
  };

  return (
    <CMMSContext.Provider
      value={{
        // Assets
        assets,
        setAssets,
        assetHierarchy,
        addAsset,
        updateAsset,
        updateAssetStatus,
        deleteAsset,
        refreshAssets,

        // Work Orders
        workOrders,
        setWorkOrders,
        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        refreshWorkOrders,
        updateWorkOrderStatus,
        startWorkOrder,
        completeWorkOrder,
        addWorkOrderComment,

        // PM
        pmPlans,
        addPMPlan,
        pmSchedules,
        setPmSchedules,
        addPMSchedule,
        updatePMSchedule,
        deletePMSchedule,
        refreshPMSchedules,
        updatePMScheduleStatus,
        checklistTemplates,
        checklistHistory,
        completeChecklistExecution,
        handleFailedPMCheck,

        // Breakdowns
        breakdowns,
        setBreakdowns,
        reportBreakdown,
        resolveBreakdown,
        updateBreakdown,
        updateBreakdownStatus,
        deleteBreakdown,

        // Spare Parts & BOM & Requests
        spareParts,
        setSpareParts,
        addSparePart,
        updateSparePart,
        deleteSparePart,
        refreshSpareParts,
        issueSparePart,
        returnSparePart,
        restockSparePart,
        equipmentBOMs,
        partsRequests,
        addPartsRequest,
        updatePartsRequestStatus,

        // Calibration
        calibrations,
        calibrationHistory,
        addCalibrationSchedule,
        recordCalibrationResult,
        addCalibrationRecord,
        refreshCalibrations,

        // Failure Codes
        failureCodes,
        addFailureCode,

        // Troubleshooting
        solutions,
        refreshSolutions,
        addVerifiedSolution,
        rateSolution,

        // Reliability
        repeatFailures,
        reliabilityMetrics,
        refreshReliability,

        // Machine / IoT
        iotTelemetry,
        isLiveTelemetryStreaming,
        setIsLiveTelemetryStreaming,

        // Labour
        employees,
        skillsMatrix,
        logLabourHours,

        // Reports
        reportTemplates,

        // Notifications
        notifications,
        unreadNotifCount,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,

        // Profile
        userProfile,
        updateUserProfile,
        refreshProfile
      }}
    >
      {children}
    </CMMSContext.Provider>
  );
}

export const useCMMS = () => useContext(CMMSContext);

import React, { createContext, useContext, useState, useEffect } from "react";
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
import { INITIAL_NOTIFICATIONS } from "../data/mockNotifications";
import { DEFAULT_USER_PROFILE } from "../data/mockUserProfile";

const CMMSContext = createContext();

export function CMMSProvider({ children }) {
  // 1. Assets State
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("flowstate_assets");
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [assetHierarchy, setAssetHierarchy] = useState(() => {
    const saved = localStorage.getItem("flowstate_asset_hierarchy");
    return saved ? JSON.parse(saved) : ASSET_HIERARCHY_TREE;
  });

  // 2. Work Orders State
  const [workOrders, setWorkOrders] = useState(() => {
    const saved = localStorage.getItem("flowstate_work_orders");
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  // 3. PM Plans & Schedules
  const [pmPlans, setPmPlans] = useState(() => {
    const saved = localStorage.getItem("flowstate_pm_plans");
    return saved ? JSON.parse(saved) : INITIAL_PM_PLANS;
  });

  const [pmSchedules, setPmSchedules] = useState(() => {
    const saved = localStorage.getItem("flowstate_pm_schedules");
    return saved ? JSON.parse(saved) : INITIAL_PM_SCHEDULES;
  });

  // Checklists
  const [checklistTemplates, setChecklistTemplates] = useState(() => {
    const saved = localStorage.getItem("flowstate_checklists");
    return saved ? JSON.parse(saved) : CHECKLIST_TEMPLATES;
  });

  const [checklistHistory, setChecklistHistory] = useState(() => {
    const saved = localStorage.getItem("flowstate_checklist_history");
    return saved ? JSON.parse(saved) : CHECKLIST_HISTORY;
  });

  // 4. Breakdowns
  const [breakdowns, setBreakdowns] = useState(() => {
    const saved = localStorage.getItem("flowstate_breakdowns");
    return saved ? JSON.parse(saved) : INITIAL_BREAKDOWNS;
  });

  // 5. Spare Parts & BOM & Requests
  const [spareParts, setSpareParts] = useState(() => {
    const saved = localStorage.getItem("flowstate_spare_parts");
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  const [equipmentBOMs] = useState(EQUIPMENT_BOMS);

  const [partsRequests, setPartsRequests] = useState(() => {
    const saved = localStorage.getItem("flowstate_parts_requests");
    return saved ? JSON.parse(saved) : INITIAL_PARTS_REQUESTS;
  });

  // 6. Calibrations & History
  const [calibrations, setCalibrations] = useState(() => {
    const saved = localStorage.getItem("flowstate_calibrations");
    return saved ? JSON.parse(saved) : INITIAL_CALIBRATIONS;
  });

  const [calibrationHistory, setCalibrationHistory] = useState(() => {
    const saved = localStorage.getItem("flowstate_calibration_history");
    return saved ? JSON.parse(saved) : CALIBRATION_HISTORY;
  });

  // 7. Failure Codes
  const [failureCodes, setFailureCodes] = useState(() => {
    const saved = localStorage.getItem("flowstate_failure_codes");
    return saved ? JSON.parse(saved) : INITIAL_FAILURE_CODES;
  });

  // 8. Troubleshooting & Verified Solutions
  const [solutions, setSolutions] = useState(() => {
    const saved = localStorage.getItem("flowstate_solutions");
    return saved ? JSON.parse(saved) : INITIAL_SOLUTIONS;
  });

  // 9. Reliability
  const [repeatFailures, setRepeatFailures] = useState(REPEAT_FAILURES);
  const [reliabilityMetrics, setReliabilityMetrics] = useState(RELIABILITY_METRICS);

  // 10. Machine / IoT Live Simulation
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

  // 11. Maintenance Labour
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("flowstate_employees");
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  const [skillsMatrix] = useState(SKILLS_MATRIX);

  // 12. Reports
  const [reportTemplates] = useState(REPORT_TEMPLATES);

  // 13. Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("flowstate_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // 14. Profile
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("flowstate_user_profile");
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

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
    localStorage.setItem("flowstate_checklists", JSON.stringify(checklistTemplates));
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
  const addAsset = (newAsset) => {
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
    return assetWithMeta;
  };

  const updateAssetStatus = (assetId, newStatus, healthOffset = 0) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === assetId) {
          const updatedHealth = Math.min(100, Math.max(10, asset.health + healthOffset));
          return { ...asset, status: newStatus, health: updatedHealth };
        }
        return asset;
      })
    );
  };

  // Work Order Actions
  const addWorkOrder = (newWO) => {
    const id = newWO.id || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdDate = newWO.createdDate || new Date().toISOString().replace("T", " ").substring(0, 16);
    const woWithMeta = {
      ...newWO,
      id,
      createdDate,
      status: newWO.status || "Open",
      priority: newWO.priority || "P2 - High",
      type: newWO.type || "Corrective",
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
    return woWithMeta;
  };

  const updateWorkOrderStatus = (woId, newStatus, notes = "") => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId) {
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

  const addPMSchedule = (newSchedule) => {
    const id = newSchedule.id || `PM-SCH-${Math.floor(100 + Math.random() * 900)}`;
    const schedWithMeta = {
      ...newSchedule,
      id,
      status: "Upcoming",
      complianceRate: "100%"
    };
    setPmSchedules((prev) => [schedWithMeta, ...prev]);
    return schedWithMeta;
  };

  const updatePMScheduleStatus = (schedId, newStatus) => {
    setPmSchedules((prev) =>
      prev.map((s) => (s.id === schedId ? { ...s, status: newStatus } : s))
    );
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

  const handleFailedPMCheck = ({ assetId, checklistName, checkItemLabel, actualValue, limitText, severity = "Critical" }) => {
    const correctiveWO = addWorkOrder({
      title: `Corrective: PM Check Failed - ${checkItemLabel}`,
      assetId,
      assetName: assets.find((a) => a.id === assetId)?.name || assetId,
      type: "Corrective",
      priority: severity === "Critical" ? "P1 - Critical" : "P2 - High",
      status: "In Progress",
      department: "Packaging",
      assignedTechnician: userProfile?.name || "Marcus Vance (Senior Tech)",
      failureCode: "MEC-004",
      symptom: `Failed PM Check during '${checklistName}': ${checkItemLabel}. Actual: ${actualValue}, Limit: ${limitText}.`,
      description: `Immediate inspection and corrective action required following failed PM verification check.`
    });

    updateAssetStatus(assetId, severity === "Critical" ? "Out of Service" : "Degraded", -20);
    return correctiveWO;
  };

  // Breakdown Actions
  const reportBreakdown = (breakdownData) => {
    const id = `BD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newBD = {
      ...breakdownData,
      id,
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Active Repair",
      durationMinutes: 0
    };
    setBreakdowns((prev) => [newBD, ...prev]);
    if (breakdownData.assetId) {
      updateAssetStatus(breakdownData.assetId, "Breakdown", -35);
    }
    return newBD;
  };

  const resolveBreakdown = (breakdownId, repairDetails) => {
    setBreakdowns((prev) =>
      prev.map((bd) => {
        if (bd.id === breakdownId) {
          if (bd.assetId) {
            updateAssetStatus(bd.assetId, "Operational", +30);
          }
          return {
            ...bd,
            status: "Resolved",
            endTime: new Date().toISOString().replace("T", " ").substring(0, 16),
            ...repairDetails
          };
        }
        return bd;
      })
    );
  };

  // Spare Parts Actions
  const addSparePart = (newPart) => {
    const partWithMeta = {
      ...newPart,
      status: newPart.stock <= newPart.minStock ? "Low Stock" : "In Stock"
    };
    setSpareParts((prev) => [partWithMeta, ...prev]);
    return partWithMeta;
  };

  const issueSparePart = (partNo, qty = 1, workOrderId = "") => {
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.partNo === partNo) {
          const updatedStock = Math.max(0, part.stock - qty);
          const status = updatedStock <= part.minStock ? "Low Stock" : "In Stock";
          return { ...part, stock: updatedStock, status };
        }
        return part;
      })
    );
  };

  const returnSparePart = (partNo, qty = 1) => {
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.partNo === partNo) {
          const updatedStock = part.stock + qty;
          const status = updatedStock <= part.minStock ? "Low Stock" : "In Stock";
          return { ...part, stock: updatedStock, status };
        }
        return part;
      })
    );
  };

  const restockSparePart = (partNo, qty) => {
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.partNo === partNo) {
          const updatedStock = part.stock + qty;
          return { ...part, stock: updatedStock, status: updatedStock <= part.minStock ? "Low Stock" : "In Stock" };
        }
        return part;
      })
    );
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
      statusColor: "emerald"
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
  const addVerifiedSolution = (solutionData) => {
    const id = `SOL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newSol = {
      ...solutionData,
      id,
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

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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
  const updateUserProfile = (updatedProfile) => {
    setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
  };

  return (
    <CMMSContext.Provider
      value={{
        // Assets
        assets,
        setAssets,
        assetHierarchy,
        addAsset,
        updateAssetStatus,

        // Work Orders
        workOrders,
        setWorkOrders,
        addWorkOrder,
        updateWorkOrderStatus,
        addWorkOrderComment,

        // PM
        pmPlans,
        addPMPlan,
        pmSchedules,
        setPmSchedules,
        addPMSchedule,
        updatePMScheduleStatus,
        checklistTemplates,
        checklistHistory,
        completeChecklistExecution,
        handleFailedPMCheck,

        // Breakdowns
        breakdowns,
        reportBreakdown,
        resolveBreakdown,

        // Spare Parts & BOM & Requests
        spareParts,
        setSpareParts,
        addSparePart,
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

        // Failure Codes
        failureCodes,
        addFailureCode,

        // Troubleshooting
        solutions,
        addVerifiedSolution,
        rateSolution,

        // Reliability
        repeatFailures,
        reliabilityMetrics,

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
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,

        // Profile
        userProfile,
        updateUserProfile
      }}
    >
      {children}
    </CMMSContext.Provider>
  );
}

export const useCMMS = () => useContext(CMMSContext);

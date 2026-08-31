import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_ASSETS } from "../data/mockAssets";
import { INITIAL_WORK_ORDERS } from "../data/mockWorkOrders";
import { INITIAL_PM_SCHEDULES } from "../data/mockPMSchedules";
import { CHECKLIST_TEMPLATES, CHECKLIST_HISTORY } from "../data/mockChecklists";
import { INITIAL_BREAKDOWNS } from "../data/mockBreakdowns";
import { INITIAL_SOLUTIONS } from "../data/mockSolutions";
import { INITIAL_SPARE_PARTS } from "../data/mockSpareParts";
import { INITIAL_CALIBRATIONS } from "../data/mockCalibration";
import { INITIAL_FAILURE_CODES } from "../data/mockFailureCodes";
import { RELIABILITY_METRICS, REPEAT_FAILURES } from "../data/mockReliability";

const CMMSContext = createContext();

export function CMMSProvider({ children }) {
  // Assets State
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("flowstate_assets");
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  // Work Orders State
  const [workOrders, setWorkOrders] = useState(() => {
    const saved = localStorage.getItem("flowstate_work_orders");
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  // PM Schedules
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

  // Breakdowns
  const [breakdowns, setBreakdowns] = useState(() => {
    const saved = localStorage.getItem("flowstate_breakdowns");
    return saved ? JSON.parse(saved) : INITIAL_BREAKDOWNS;
  });

  // Verified Solutions
  const [solutions, setSolutions] = useState(() => {
    const saved = localStorage.getItem("flowstate_solutions");
    return saved ? JSON.parse(saved) : INITIAL_SOLUTIONS;
  });

  // Spare Parts
  const [spareParts, setSpareParts] = useState(() => {
    const saved = localStorage.getItem("flowstate_spare_parts");
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  // Calibrations
  const [calibrations, setCalibrations] = useState(() => {
    const saved = localStorage.getItem("flowstate_calibrations");
    return saved ? JSON.parse(saved) : INITIAL_CALIBRATIONS;
  });

  // Failure Codes
  const [failureCodes, setFailureCodes] = useState(() => {
    const saved = localStorage.getItem("flowstate_failure_codes");
    return saved ? JSON.parse(saved) : INITIAL_FAILURE_CODES;
  });

  // Repeat failures & reliability
  const [repeatFailures, setRepeatFailures] = useState(REPEAT_FAILURES);
  const [reliabilityMetrics, setReliabilityMetrics] = useState(RELIABILITY_METRICS);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("flowstate_assets", JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem("flowstate_work_orders", JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem("flowstate_pm_schedules", JSON.stringify(pmSchedules));
  }, [pmSchedules]);

  useEffect(() => {
    localStorage.setItem("flowstate_checklists", JSON.stringify(checklistTemplates));
  }, [checklistTemplates]);

  useEffect(() => {
    localStorage.setItem("flowstate_breakdowns", JSON.stringify(breakdowns));
  }, [breakdowns]);

  useEffect(() => {
    localStorage.setItem("flowstate_solutions", JSON.stringify(solutions));
  }, [solutions]);

  useEffect(() => {
    localStorage.setItem("flowstate_spare_parts", JSON.stringify(spareParts));
  }, [spareParts]);

  // Asset Actions
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
      partsRequired: newWO.partsRequired || [],
      toolsRequired: newWO.toolsRequired || [],
      comments: newWO.comments || []
    };
    setWorkOrders((prev) => [woWithMeta, ...prev]);

    // Update asset openWorkOrders count
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
                user: "Current User",
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

  // Failed PM Check Workflow Trigger (Requirement #18 & #19)
  const handleFailedPMCheck = ({ assetId, checklistName, checkItemLabel, actualValue, limitText, severity = "Critical" }) => {
    // 1. Create Corrective Work Order
    const correctiveWO = addWorkOrder({
      title: `Corrective: PM Check Failed - ${checkItemLabel}`,
      assetId,
      assetName: assets.find((a) => a.id === assetId)?.name || assetId,
      type: "Corrective",
      priority: severity === "Critical" ? "P1 - Critical" : "P2 - High",
      status: "In Progress",
      department: "Packaging",
      assignedTechnician: "Marcus Vance (Senior Tech)",
      failureCode: "MEC-004",
      symptom: `Failed PM Check during '${checklistName}': ${checkItemLabel}. Actual: ${actualValue}, Limit: ${limitText}.`,
      description: `Immediate inspection and corrective action required following failed PM verification check.`
    });

    // 2. Mark Asset Out of Service or Degraded
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

  // Verified Solutions Actions
  const addVerifiedSolution = (solutionData) => {
    const id = `SOL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newSol = {
      ...solutionData,
      id,
      successfulUsesCount: 1,
      verificationDate: new Date().toISOString().substring(0, 10),
      verifiedBy: "Senior Reliability Specialist"
    };
    setSolutions((prev) => [newSol, ...prev]);
    return newSol;
  };

  // Spare Parts Issue / Return
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

  return (
    <CMMSContext.Provider
      value={{
        assets,
        setAssets,
        updateAssetStatus,
        workOrders,
        setWorkOrders,
        addWorkOrder,
        updateWorkOrderStatus,
        pmSchedules,
        setPmSchedules,
        checklistTemplates,
        checklistHistory,
        handleFailedPMCheck,
        breakdowns,
        reportBreakdown,
        resolveBreakdown,
        solutions,
        addVerifiedSolution,
        spareParts,
        issueSparePart,
        returnSparePart,
        calibrations,
        failureCodes,
        repeatFailures,
        reliabilityMetrics
      }}
    >
      {children}
    </CMMSContext.Provider>
  );
}

export const useCMMS = () => useContext(CMMSContext);

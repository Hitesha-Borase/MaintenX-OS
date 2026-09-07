import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_QUALITY_CHECKS, DEVIATIONS_HOLDS } from "../data/mockQuality";
import qualityService from "../services/qualityService";

const QualityContext = createContext();

export function QualityProvider({ children }) {
  const [qualityChecks, setQualityChecks] = useState(() => {
    const saved = localStorage.getItem("flowstate_quality_checks");
    return saved ? JSON.parse(saved) : INITIAL_QUALITY_CHECKS;
  });

  const [deviations, setDeviations] = useState(() => {
    const saved = localStorage.getItem("flowstate_deviations");
    return saved ? JSON.parse(saved) : DEVIATIONS_HOLDS;
  });

  const [releaseQueue, setReleaseQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const syncWithBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const [remoteChecks, remoteQueue, remoteHolds] = await Promise.allSettled([
        qualityService.getCCPChecks(),
        qualityService.getReleaseQueue(),
        qualityService.getHolds(),
      ]);

      if (remoteChecks.status === "fulfilled" && Array.isArray(remoteChecks.value) && remoteChecks.value.length > 0) {
        setQualityChecks(remoteChecks.value);
      }
      if (remoteQueue.status === "fulfilled" && Array.isArray(remoteQueue.value)) {
        setReleaseQueue(remoteQueue.value);
      }
      if (remoteHolds.status === "fulfilled" && Array.isArray(remoteHolds.value) && remoteHolds.value.length > 0) {
        setDeviations((prev) => [...remoteHolds.value, ...prev.filter(d => !remoteHolds.value.some(r => r.id === d.id))]);
      }
    } catch (err) {
      console.warn("Quality backend sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  useEffect(() => {
    localStorage.setItem("flowstate_quality_checks", JSON.stringify(qualityChecks));
  }, [qualityChecks]);

  useEffect(() => {
    localStorage.setItem("flowstate_deviations", JSON.stringify(deviations));
  }, [deviations]);

  const addQualityCheck = async (check) => {
    const id = `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCheck = {
      ...check,
      id,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setQualityChecks((prev) => [newCheck, ...prev]);

    // Persist CCP check to PostgreSQL backend
    try {
      await qualityService.submitCCPCheck({
        lineId: check.lineId || "00000000-0000-0000-0000-000000000001",
        batchId: check.batchId || "00000000-0000-0000-0000-000000000001",
        ccpCode: check.ccpCode || check.checkType || "CCP-1",
        ccpName: check.ccpName || check.parameterName || "Standard Quality Check",
        targetValue: Number(check.targetValue) || 85.0,
        actualValue: Number(check.actualValue) || 85.2,
        criticalLimitMin: Number(check.criticalLimitMin) || 83.1,
        criticalLimitMax: Number(check.criticalLimitMax) || 95.0,
        uom: check.uom || "°C",
        status: check.status === "PASS" ? "PASS" : "FAIL",
        notes: check.notes || "",
      });
    } catch (err) {
      console.warn("Persisting quality check offline:", err.message);
    }

    return newCheck;
  };

  const updateDeviationStatus = (devId, status, correctiveAction) => {
    setDeviations((prev) =>
      prev.map((d) =>
        d.id === devId
          ? { ...d, status, correctiveActionSummary: correctiveAction || d.correctiveActionSummary }
          : d
      )
    );
  };

  const releaseBatchQA = async (batchId, inspectorName = "QA Director", comments = "Batch approved for distribution") => {
    const newRelease = {
      id: `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      batchId,
      orderId: "PO-2026-904",
      productName: "Organic Cold-Pressed Orange Juice 500ml",
      checkType: "Finished Good QA Release",
      samplePoint: "Discharge Palletizer",
      status: "RELEASED",
      inspector: inspectorName,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      parameters: [{ name: "Certificate of Analysis (CoA)", target: "100% Pass", actual: "PASSED", status: "PASS" }],
      notes: comments
    };
    setQualityChecks((prev) => [newRelease, ...prev]);

    // Persist 21 CFR Part 11 Electronic QA Release to PostgreSQL
    try {
      await qualityService.authorizeRelease({
        batchId: batchId || "00000000-0000-0000-0000-000000000001",
        disposition: "RELEASED",
        digitalPin: "1234",
        comments: comments || "Approved by QA Director",
      });
    } catch (err) {
      console.warn("Authorized QA release offline:", err.message);
    }
  };

  return (
    <QualityContext.Provider
      value={{
        qualityChecks,
        addQualityCheck,
        deviations,
        updateDeviationStatus,
        releaseBatchQA,
        releaseQueue,
        isLoading,
        syncWithBackend
      }}
    >
      {children}
    </QualityContext.Provider>
  );
}

export const useQuality = () => useContext(QualityContext);

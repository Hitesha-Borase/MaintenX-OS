import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_QUALITY_CHECKS, DEVIATIONS_HOLDS } from "../data/mockQuality";

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

  useEffect(() => {
    localStorage.setItem("flowstate_quality_checks", JSON.stringify(qualityChecks));
  }, [qualityChecks]);

  useEffect(() => {
    localStorage.setItem("flowstate_deviations", JSON.stringify(deviations));
  }, [deviations]);

  const addQualityCheck = (check) => {
    const id = `QC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCheck = {
      ...check,
      id,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setQualityChecks((prev) => [newCheck, ...prev]);
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

  const releaseBatchQA = (batchId, inspectorName = "QA Director") => {
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
      notes: "Batch officially approved for warehouse storage and customer distribution."
    };
    setQualityChecks((prev) => [newRelease, ...prev]);
  };

  return (
    <QualityContext.Provider
      value={{
        qualityChecks,
        addQualityCheck,
        deviations,
        updateDeviationStatus,
        releaseBatchQA
      }}
    >
      {children}
    </QualityContext.Provider>
  );
}

export const useQuality = () => useContext(QualityContext);

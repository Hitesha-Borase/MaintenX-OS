import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useMasterData } from "./MasterDataContext";
import { useCMMS } from "./CMMSContext";
import { useRole } from "./RoleContext";
import { useApp } from "./AppContext";
import { ciService } from "../services/ciService";

const CIContext = createContext();

export function CIProvider({ children }) {
  const { currentPlant, logAuditEvent, masterAssets = [] } = useMasterData();
  const { currentRole } = useRole();
  const { addToast } = useApp();

  const currentUser = currentRole?.name || "David Kim (Lead CI)";
  const activePlantId = currentPlant || "PLT-01";

  // State collections connected to live DB
  const [reliabilityRecords, setReliabilityRecords] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [hypotheses, setHypotheses] = useState([]);
  const [capaActions, setCapaActions] = useState([]);
  const [ciProjects, setCiProjects] = useState([]);
  const [lossRecords, setLossRecords] = useState([]);
  const [standards, setStandards] = useState([]);
  const [verifiedSolutions, setVerifiedSolutions] = useState([]);
  const [capexProjects, setCapexProjects] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // REFRESH / DATA LOADING HANDLERS
  // ==========================================
  const refreshReliability = useCallback(async () => {
    try {
      const res = await ciService.getReliabilityRecords(activePlantId);
      const data = res?.data || res;
      if (Array.isArray(data)) setReliabilityRecords(data);
    } catch (err) {
      console.warn("API getReliabilityRecords error:", err.message);
    }
  }, [activePlantId]);

  const refreshInvestigations = useCallback(async () => {
    try {
      const res = await ciService.getInvestigations(activePlantId);
      const data = res?.data || res;
      if (Array.isArray(data)) setInvestigations(data);
    } catch (err) {
      console.warn("API getInvestigations error:", err.message);
    }
  }, [activePlantId]);

  const refreshEvidence = useCallback(async (rcaId) => {
    try {
      const res = await ciService.getEvidence(rcaId);
      const data = res?.data || res;
      if (Array.isArray(data)) setEvidenceList(data);
    } catch (err) {
      console.warn("API getEvidence error:", err.message);
    }
  }, []);

  const refreshHypotheses = useCallback(async (rcaId) => {
    try {
      const res = await ciService.getHypotheses(rcaId);
      const data = res?.data || res;
      if (Array.isArray(data)) setHypotheses(data);
    } catch (err) {
      console.warn("API getHypotheses error:", err.message);
    }
  }, []);

  const refreshCapa = useCallback(async (filters) => {
    try {
      const res = await ciService.getCapaActions(filters);
      const data = res?.data || res;
      if (Array.isArray(data)) setCapaActions(data);
    } catch (err) {
      console.warn("API getCapaActions error:", err.message);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await ciService.getProjects(activePlantId);
      const data = res?.data || res;
      if (Array.isArray(data)) setCiProjects(data);
    } catch (err) {
      console.warn("API getProjects error:", err.message);
    }
  }, [activePlantId]);

  const refreshLosses = useCallback(async (category) => {
    try {
      const res = await ciService.getLosses(activePlantId, category);
      const data = res?.data || res;
      if (Array.isArray(data)) setLossRecords(data);
    } catch (err) {
      console.warn("API getLosses error:", err.message);
    }
  }, [activePlantId]);

  const refreshStandards = useCallback(async (type) => {
    try {
      const res = await ciService.getStandards(activePlantId, type);
      const data = res?.data || res;
      if (Array.isArray(data)) setStandards(data);
    } catch (err) {
      console.warn("API getStandards error:", err.message);
    }
  }, [activePlantId]);

  const refreshSolutions = useCallback(async (assetId, search) => {
    try {
      const res = await ciService.getSolutions(assetId, search);
      const data = res?.data || res;
      if (Array.isArray(data)) setVerifiedSolutions(data);
    } catch (err) {
      console.warn("API getSolutions error:", err.message);
    }
  }, []);

  const refreshCapex = useCallback(async () => {
    try {
      const res = await ciService.getCapex(activePlantId);
      const data = res?.data || res;
      if (Array.isArray(data)) setCapexProjects(data);
    } catch (err) {
      console.warn("API getCapex error:", err.message);
    }
  }, [activePlantId]);

  const refreshDashboard = useCallback(async () => {
    try {
      const res = await ciService.getDashboardSummary(activePlantId);
      const data = res?.data || res;
      if (data) setDashboardSummary(data);
    } catch (err) {
      console.warn("API getDashboardSummary error:", err.message);
    }
  }, [activePlantId]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([
      refreshReliability(),
      refreshInvestigations(),
      refreshEvidence(),
      refreshHypotheses(),
      refreshCapa(),
      refreshProjects(),
      refreshLosses(),
      refreshStandards(),
      refreshSolutions(),
      refreshCapex(),
      refreshDashboard(),
    ]);
    setIsLoading(false);
  }, [
    refreshReliability,
    refreshInvestigations,
    refreshEvidence,
    refreshHypotheses,
    refreshCapa,
    refreshProjects,
    refreshLosses,
    refreshStandards,
    refreshSolutions,
    refreshCapex,
    refreshDashboard,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Derived plant filtered views
  const plantFilteredReliability = useMemo(() => {
    return reliabilityRecords.filter((r) => !activePlantId || r.plantId === activePlantId || activePlantId === "ALL");
  }, [reliabilityRecords, activePlantId]);

  const plantFilteredProjects = useMemo(() => {
    return ciProjects.filter((p) => !activePlantId || p.plantId === activePlantId || activePlantId === "ALL");
  }, [ciProjects, activePlantId]);

  const plantFilteredRca = useMemo(() => {
    return investigations.filter((i) => !activePlantId || i.plantId === activePlantId || activePlantId === "ALL");
  }, [investigations, activePlantId]);

  const plantFilteredCapex = useMemo(() => {
    return capexProjects.filter((c) => !activePlantId || c.plantId === activePlantId || activePlantId === "ALL");
  }, [capexProjects, activePlantId]);

  const plantFilteredLosses = useMemo(() => {
    return lossRecords.filter((l) => !activePlantId || l.plantId === activePlantId || activePlantId === "ALL");
  }, [lossRecords, activePlantId]);

  // Dynamic KPIs (fallback to calculated if dashboard summary pending)
  const fleetMTBF = useMemo(() => {
    if (dashboardSummary?.reliability?.avgMtbfHrs) return dashboardSummary.reliability.avgMtbfHrs;
    if (!plantFilteredReliability.length) return 120;
    const sum = plantFilteredReliability.reduce((acc, r) => acc + (Number(r.mtbfHrs) || 100), 0);
    return Math.round(sum / plantFilteredReliability.length);
  }, [dashboardSummary, plantFilteredReliability]);

  const fleetMTTR = useMemo(() => {
    if (dashboardSummary?.reliability?.avgMttrMin) return dashboardSummary.reliability.avgMttrMin;
    if (!plantFilteredReliability.length) return 32;
    const sum = plantFilteredReliability.reduce((acc, r) => acc + (Number(r.mttrMin) || 30), 0);
    return Math.round(sum / plantFilteredReliability.length);
  }, [dashboardSummary, plantFilteredReliability]);

  const realizedSavingsTotal = useMemo(() => {
    if (dashboardSummary?.financials?.realizedSavings !== undefined) return dashboardSummary.financials.realizedSavings;
    return plantFilteredProjects.reduce((acc, p) => acc + (Number(p.realizedSavingsYTD) || 0), 0);
  }, [dashboardSummary, plantFilteredProjects]);

  const projectedSavingsTotal = useMemo(() => {
    if (dashboardSummary?.financials?.projectedSavings !== undefined) return dashboardSummary.financials.projectedSavings;
    return plantFilteredProjects.reduce((acc, p) => acc + (Number(p.projectedSavingsAnnual) || 0), 0);
  }, [dashboardSummary, plantFilteredProjects]);

  const badActorsCount = useMemo(() => {
    if (dashboardSummary?.reliability?.badActorsCount !== undefined) return dashboardSummary.reliability.badActorsCount;
    return plantFilteredReliability.filter((r) => r.isBadActor).length;
  }, [dashboardSummary, plantFilteredReliability]);

  const openRcaCount = useMemo(() => {
    if (dashboardSummary?.rca?.openRCA !== undefined) return dashboardSummary.rca.openRCA;
    return plantFilteredRca.filter((i) => i.status !== "Closed").length;
  }, [dashboardSummary, plantFilteredRca]);

  const activeProjectsCount = useMemo(() => {
    return plantFilteredProjects.filter((p) => p.status !== "Closed").length;
  }, [plantFilteredProjects]);

  const overdueCapaCount = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return capaActions.filter((c) => c.status !== "Completed" && c.status !== "Verified" && c.status !== "Closed" && c.dueDate < today).length;
  }, [capaActions]);

  const openCapexCount = useMemo(() => {
    return plantFilteredCapex.filter((c) => c.status !== "Closed" && c.status !== "Commissioned").length;
  }, [plantFilteredCapex]);

  const pendingBenefitsCount = useMemo(() => {
    return plantFilteredProjects.filter((p) => p.benefitStatus === "Pending Verification").length;
  }, [plantFilteredProjects]);

  // ==========================================
  // MUTATION ACTIONS (FULL BACKEND INTEGRATION)
  // ==========================================

  // 1. RCA: Initiate
  const initiateRCA = async (assetId, sourceBreakdownId, customProblem) => {
    const asset = reliabilityRecords.find((r) => r.assetId === assetId) ||
                  masterAssets.find((a) => a.assetId === assetId) || {
                    assetName: "Production Machine",
                    lineId: "LIN-01",
                    lineName: "Line 1",
                    plantId: activePlantId
                  };

    const newRcaPayload = {
      title: customProblem || `Investigation — ${asset.assetName || asset.name || "Equipment"} Breakdown`,
      assetId: asset.assetId || assetId,
      assetName: asset.assetName || asset.name || "Critical Equipment",
      lineId: asset.lineId || "LIN-01",
      lineName: asset.lineName || "Line 1 — Production",
      plantId: asset.plantId || activePlantId,
      sourceBreakdownId: sourceBreakdownId || null,
      sourceWorkOrderId: null,
      severity: "High",
      status: "Open",
      currentPhase: "Event",
      problemStatement: customProblem || `Systematic failure detected on ${asset.assetName || asset.name}. Investigation initiated to determine root cause and implement permanent CAPA.`,
      leadInvestigator: currentUser,
      teamMembers: [currentUser, "Marcus Vance (Maintenance Lead)", "Elena Rostova (QA)"],
      eventDate: new Date().toISOString().substring(0, 10),
      daysActive: 1,
      whyTree: [
        { id: "W1", question: "Why did the equipment fail during operation?", answer: "" },
        { id: "W2", question: "Why did the sub-component experience premature wear?", answer: "" },
        { id: "W3", question: "Why was the condition not detected during routine PM?", answer: "" },
        { id: "W4", question: "Why did the existing sensor/alarm fail to trigger?", answer: "" },
        { id: "W5", question: "Why was the standard maintenance procedure not followed?", answer: "" }
      ],
      eightD: {
        d1Team: currentUser,
        d2Problem: customProblem || "Equipment failure event logged.",
        d3Containment: "Line stopped; parts inspected; standard cleanout performed.",
        d4RootCause: "",
        d5CorrectiveAction: "",
        d6Implementation: "",
        d7Prevention: "",
        d8Closure: ""
      }
    };

    let createdRecord = null;
    try {
      const res = await ciService.createInvestigation(newRcaPayload);
      createdRecord = res?.data || res;
    } catch (err) {
      console.error("API createInvestigation error:", err.message);
      addToast(`Error creating RCA: ${err.message}`, "error");
      return null;
    }

    if (createdRecord) {
      setInvestigations((prev) => [createdRecord, ...prev]);
      if (logAuditEvent) {
        logAuditEvent("CI_RCA_INITIATED", "RCA Investigation", createdRecord.id, null, createdRecord.title, `RCA launched for asset ${assetId}`);
      }
      addToast(`RCA Investigation ${createdRecord.id} initiated successfully!`, "success");
      await refreshInvestigations();
      await refreshDashboard();
      return createdRecord.id;
    }
  };

  // 2. RCA: Update fields / WhyTree / 8D
  const updateRCA = async (rcaId, updatedFields) => {
    try {
      const res = await ciService.updateInvestigation(rcaId, updatedFields);
      const serverUpdated = res?.data || res;
      setInvestigations((prev) =>
        prev.map((i) => (i.id === rcaId ? { ...i, ...serverUpdated } : i))
      );
      if (logAuditEvent) {
        logAuditEvent("CI_RCA_UPDATED", "RCA Investigation", rcaId, null, null, `RCA fields updated`);
      }
      addToast(`RCA ${rcaId} updated successfully.`, "success");
      return serverUpdated;
    } catch (err) {
      console.error("API updateInvestigation error:", err.message);
      addToast(`Error updating RCA: ${err.message}`, "error");
    }
  };

  // 3. RCA: Advance Phase
  const advanceRcaPhase = async (rcaId, nextPhase) => {
    try {
      const res = await ciService.advanceInvestigationPhase(rcaId, nextPhase);
      const serverUpdated = res?.data || res;
      setInvestigations((prev) =>
        prev.map((i) => (i.id === rcaId ? { ...i, ...serverUpdated } : i))
      );
      if (logAuditEvent) {
        logAuditEvent("CI_RCA_PHASE_ADVANCED", "RCA Investigation", rcaId, null, nextPhase, `Phase advanced to ${nextPhase}`);
      }
      addToast(`RCA ${rcaId} phase advanced to "${nextPhase}".`, "info");
      await refreshInvestigations();
      await refreshDashboard();
      return serverUpdated;
    } catch (err) {
      console.error("API advanceInvestigationPhase error:", err.message);
      addToast(`Error advancing RCA phase: ${err.message}`, "error");
    }
  };

  // 4. RCA: Delete
  const deleteRCA = async (rcaId) => {
    try {
      await ciService.deleteInvestigation(rcaId);
      setInvestigations((prev) => prev.filter((i) => i.id !== rcaId));
      addToast(`RCA Investigation ${rcaId} deleted.`, "info");
      await refreshInvestigations();
      await refreshDashboard();
    } catch (err) {
      console.error("API deleteInvestigation error:", err.message);
      addToast(`Error deleting RCA: ${err.message}`, "error");
    }
  };

  // 5. Evidence Locker: Add / Delete
  const addEvidence = async (evidenceData) => {
    try {
      const res = await ciService.createEvidence(evidenceData);
      const created = res?.data || res;
      setEvidenceList((prev) => [created, ...prev]);
      addToast(`Evidence ${created.id} attached successfully!`, "success");
      await refreshEvidence();
      return created;
    } catch (err) {
      console.error("API createEvidence error:", err.message);
      addToast(`Error adding evidence: ${err.message}`, "error");
    }
  };

  const deleteEvidence = async (id) => {
    try {
      await ciService.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((e) => e.id !== id));
      addToast(`Evidence ${id} removed.`, "info");
    } catch (err) {
      console.error("API deleteEvidence error:", err.message);
      addToast(`Error removing evidence: ${err.message}`, "error");
    }
  };

  // 6. Hypotheses: Create / Validate / Delete
  const addHypothesis = async (hypData) => {
    try {
      const res = await ciService.createHypothesis(hypData);
      const created = res?.data || res;
      setHypotheses((prev) => [...prev, created]);
      addToast(`Hypothesis ${created.id} recorded.`, "success");
      await refreshHypotheses();
      return created;
    } catch (err) {
      console.error("API createHypothesis error:", err.message);
      addToast(`Error formulating hypothesis: ${err.message}`, "error");
    }
  };

  const validateRootCause = async (rcaId, hypothesisId, isConfirmed, validationNotes) => {
    const status = isConfirmed ? "Confirmed Root Cause" : "Refuted";
    try {
      const res = await ciService.validateHypothesis(hypothesisId, status, validationNotes);
      const updated = res?.data || res;
      setHypotheses((prev) =>
        prev.map((h) => (h.id === hypothesisId ? { ...h, ...updated } : h))
      );

      if (isConfirmed) {
        await advanceRcaPhase(rcaId, "CAPA");
        addToast(`Root Cause for ${rcaId} officially CONFIRMED! Phase moved to CAPA.`, "success");
      } else {
        addToast(`Hypothesis ${hypothesisId} refuted with test evidence.`, "info");
      }

      if (logAuditEvent) {
        logAuditEvent("CI_CAUSE_VALIDATED", "RCA Hypothesis", hypothesisId, null, status, `Validation recorded by ${currentUser}`);
      }
    } catch (err) {
      console.error("API validateHypothesis error:", err.message);
      addToast(`Error validating hypothesis: ${err.message}`, "error");
    }
  };

  const deleteHypothesis = async (id) => {
    try {
      await ciService.deleteHypothesis(id);
      setHypotheses((prev) => prev.filter((h) => h.id !== id));
      addToast(`Hypothesis ${id} removed.`, "info");
    } catch (err) {
      console.error("API deleteHypothesis error:", err.message);
      addToast(`Error removing hypothesis: ${err.message}`, "error");
    }
  };

  // 7. CAPA Actions: Create / Update Status / Verify Effectiveness / Delete
  const createCapaAction = async (actionData) => {
    try {
      const res = await ciService.createCapaAction({
        ...actionData,
        owner: actionData.owner || currentUser,
      });
      const created = res?.data || res;
      setCapaActions((prev) => [created, ...prev]);
      addToast(`CAPA Action ${created.id} assigned to ${created.owner}!`, "success");
      await refreshCapa();
      await refreshDashboard();
      return created.id;
    } catch (err) {
      console.error("API createCapaAction error:", err.message);
      addToast(`Error creating CAPA: ${err.message}`, "error");
    }
  };

  const updateCapaStatus = async (actionId, newStatus, extraNotes = "") => {
    const today = new Date().toISOString().substring(0, 10);
    try {
      const res = await ciService.updateCapaStatus(actionId, newStatus, today, extraNotes);
      const updated = res?.data || res;
      setCapaActions((prev) =>
        prev.map((c) => (c.id === actionId ? { ...c, ...updated } : c))
      );
      addToast(`CAPA ${actionId} status updated to "${newStatus}".`, "success");
      await refreshCapa();
      await refreshDashboard();
    } catch (err) {
      console.error("API updateCapaStatus error:", err.message);
      addToast(`Error updating CAPA status: ${err.message}`, "error");
    }
  };

  const verifyCapaEffectiveness = async (actionId, effectivenessResult) => {
    try {
      const res = await ciService.verifyCapaEffectiveness(actionId, effectivenessResult);
      const updated = res?.data || res;
      setCapaActions((prev) =>
        prev.map((c) => (c.id === actionId ? { ...c, ...updated } : c))
      );
      addToast(`CAPA ${actionId} verified effective! 21 CFR signature recorded.`, "success");
      await refreshCapa();
      await refreshDashboard();
    } catch (err) {
      console.error("API verifyCapaEffectiveness error:", err.message);
      addToast(`Error verifying CAPA: ${err.message}`, "error");
    }
  };

  const deleteCapaAction = async (id) => {
    try {
      await ciService.deleteCapaAction(id);
      setCapaActions((prev) => prev.filter((c) => c.id !== id));
      addToast(`CAPA ${id} deleted.`, "info");
      await refreshCapa();
      await refreshDashboard();
    } catch (err) {
      console.error("API deleteCapaAction error:", err.message);
      addToast(`Error deleting CAPA: ${err.message}`, "error");
    }
  };

  // 8. Loss Analysis: Create / Delete
  const createLoss = async (lossData) => {
    try {
      const res = await ciService.createLoss({
        ...lossData,
        plantId: lossData.plantId || activePlantId,
      });
      const created = res?.data || res;
      setLossRecords((prev) => [created, ...prev]);
      addToast(`Loss incident ${created.id} recorded.`, "success");
      await refreshLosses();
      await refreshDashboard();
      return created.id;
    } catch (err) {
      console.error("API createLoss error:", err.message);
      addToast(`Error logging loss incident: ${err.message}`, "error");
    }
  };

  const deleteLoss = async (id) => {
    try {
      await ciService.deleteLoss(id);
      setLossRecords((prev) => prev.filter((l) => l.id !== id));
      addToast(`Loss record ${id} removed.`, "info");
      await refreshLosses();
      await refreshDashboard();
    } catch (err) {
      console.error("API deleteLoss error:", err.message);
      addToast(`Error deleting loss: ${err.message}`, "error");
    }
  };

  // 9. CI Projects: Create / Update / Delete / GM Lock / Unlock
  const createProject = async (projectData) => {
    try {
      const res = await ciService.createProject({
        ...projectData,
        plantId: projectData.plantId || activePlantId,
        owner: projectData.owner || currentUser,
      });
      const created = res?.data || res;
      setCiProjects((prev) => [created, ...prev]);
      if (logAuditEvent) {
        logAuditEvent("CI_PROJECT_CREATED", "CI Project", created.id, null, created.name, `Created by ${currentUser}`);
      }
      addToast(`CI Project ${created.id} "${created.name}" created!`, "success");
      await refreshProjects();
      await refreshDashboard();
      return created.id;
    } catch (err) {
      console.error("API createProject error:", err.message);
      addToast(`Error creating CI project: ${err.message}`, "error");
    }
  };

  const updateProject = async (projectId, fields) => {
    try {
      const res = await ciService.updateProject(projectId, fields);
      const updated = res?.data || res;
      setCiProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p))
      );
      addToast(`Project ${projectId} updated.`, "success");
      await refreshProjects();
      await refreshDashboard();
    } catch (err) {
      console.error("API updateProject error:", err.message);
      addToast(`Error updating project: ${err.message}`, "error");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await ciService.deleteProject(projectId);
      setCiProjects((prev) => prev.filter((p) => p.id !== projectId));
      addToast(`CI Project ${projectId} deleted.`, "info");
      await refreshProjects();
      await refreshDashboard();
    } catch (err) {
      console.error("API deleteProject error:", err.message);
      addToast(`Error deleting project: ${err.message}`, "error");
    }
  };

  const verifyAndLockBenefit = async (projectId) => {
    try {
      const res = await ciService.verifyAndLockBenefit(projectId);
      const updated = res?.data || res;
      setCiProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p))
      );
      if (logAuditEvent) {
        logAuditEvent("CI_BENEFIT_LOCKED", "CI Project Benefits", projectId, "Pending Verification", "Verified & Locked", `21 CFR Part 11 Certified by ${currentUser}`);
      }
      addToast(`Project ${projectId} benefits verified and IMMUTABLY LOCKED!`, "success");
      await refreshProjects();
      await refreshDashboard();
    } catch (err) {
      console.error("API verifyAndLockBenefit error:", err.message);
      addToast(`Error locking benefit: ${err.message}`, "error");
    }
  };

  const unlockBenefit = async (projectId, justification) => {
    if (!justification?.trim()) {
      addToast("A valid engineering justification reason is required to unlock benefits.", "warning");
      return;
    }

    try {
      const res = await ciService.unlockBenefit(projectId, justification);
      const updated = res?.data || res;
      setCiProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p))
      );
      if (logAuditEvent) {
        logAuditEvent("CI_BENEFIT_UNLOCKED", "CI Project Benefits", projectId, "Verified & Locked", "Pending Verification", `Reason: ${justification}`);
      }
      addToast(`Project ${projectId} benefits unlocked for review.`, "info");
      await refreshProjects();
      await refreshDashboard();
    } catch (err) {
      console.error("API unlockBenefit error:", err.message);
      addToast(`Error unlocking benefit: ${err.message}`, "error");
    }
  };

  // 10. Standards: Create / Update / Delete
  const createStandard = async (stdData) => {
    try {
      const res = await ciService.createStandard({
        ...stdData,
        plantId: stdData.plantId || activePlantId,
        owner: stdData.owner || currentUser,
        approvedBy: currentUser,
      });
      const created = res?.data || res;
      setStandards((prev) => [created, ...prev]);
      addToast(`Standard ${created.id} published to library!`, "success");
      await refreshStandards();
      return created.id;
    } catch (err) {
      console.error("API createStandard error:", err.message);
      addToast(`Error publishing standard: ${err.message}`, "error");
    }
  };

  const updateStandard = async (id, fields) => {
    try {
      const res = await ciService.updateStandard(id, fields);
      const updated = res?.data || res;
      setStandards((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
      );
      addToast(`Standard ${id} updated.`, "success");
      await refreshStandards();
    } catch (err) {
      console.error("API updateStandard error:", err.message);
      addToast(`Error updating standard: ${err.message}`, "error");
    }
  };

  const deleteStandard = async (id) => {
    try {
      await ciService.deleteStandard(id);
      setStandards((prev) => prev.filter((s) => s.id !== id));
      addToast(`Standard ${id} removed.`, "info");
      await refreshStandards();
    } catch (err) {
      console.error("API deleteStandard error:", err.message);
      addToast(`Error deleting standard: ${err.message}`, "error");
    }
  };

  // 11. Verified Solutions: Create / Delete
  const createVerifiedSolution = async (solData) => {
    try {
      const res = await ciService.createSolution({
        ...solData,
        verifiedBy: currentUser,
      });
      const created = res?.data || res;
      setVerifiedSolutions((prev) => [created, ...prev]);
      addToast(`Verified Solution ${created.id} added to Knowledge Base!`, "success");
      await refreshSolutions();
      return created.id;
    } catch (err) {
      console.error("API createSolution error:", err.message);
      addToast(`Error documenting solution: ${err.message}`, "error");
    }
  };

  const deleteVerifiedSolution = async (id) => {
    try {
      await ciService.deleteSolution(id);
      setVerifiedSolutions((prev) => prev.filter((s) => s.id !== id));
      addToast(`Solution ${id} removed.`, "info");
      await refreshSolutions();
    } catch (err) {
      console.error("API deleteSolution error:", err.message);
      addToast(`Error deleting solution: ${err.message}`, "error");
    }
  };

  // 12. Engineering Capex: Create / Delete
  const createCapexProject = async (capexData) => {
    try {
      const res = await ciService.createCapex({
        ...capexData,
        plantId: capexData.plantId || activePlantId,
        owner: capexData.owner || currentUser,
      });
      const created = res?.data || res;
      setCapexProjects((prev) => [created, ...prev]);
      addToast(`Capex Project ${created.id} ($${Number(created.budget).toLocaleString()}) submitted!`, "success");
      await refreshCapex();
      await refreshDashboard();
      return created.id;
    } catch (err) {
      console.error("API createCapex error:", err.message);
      addToast(`Error submitting Capex: ${err.message}`, "error");
    }
  };

  const deleteCapexProject = async (id) => {
    try {
      await ciService.deleteCapex(id);
      setCapexProjects((prev) => prev.filter((c) => c.id !== id));
      addToast(`Capex project ${id} removed.`, "info");
      await refreshCapex();
      await refreshDashboard();
    } catch (err) {
      console.error("API deleteCapex error:", err.message);
      addToast(`Error deleting Capex: ${err.message}`, "error");
    }
  };

  // 13. Reliability: Launch RCA from Bad Actor
  const launchRcaFromBadActor = async (assetId) => {
    try {
      const res = await ciService.launchRcaFromBadActor(assetId);
      const created = res?.data || res;
      addToast(`RCA ${created.id} automatically launched from Bad Actor asset!`, "success");
      await refreshInvestigations();
      await refreshDashboard();
      return created.id;
    } catch (err) {
      console.error("API launchRcaFromBadActor error:", err.message);
      addToast(`Error launching RCA: ${err.message}`, "error");
    }
  };

  return (
    <CIContext.Provider
      value={{
        // State
        reliabilityRecords: plantFilteredReliability,
        investigations: plantFilteredRca,
        evidenceList,
        hypotheses,
        capaActions,
        ciProjects: plantFilteredProjects,
        lossRecords: plantFilteredLosses,
        standards,
        verifiedSolutions,
        capexProjects: plantFilteredCapex,
        dashboardSummary,
        isLoading,

        // KPIs
        fleetMTBF,
        fleetMTTR,
        realizedSavingsTotal,
        projectedSavingsTotal,
        badActorsCount,
        openRcaCount,
        activeProjectsCount,
        overdueCapaCount,
        openCapexCount,
        pendingBenefitsCount,

        // Refresh Handlers
        refreshAll,
        refreshReliability,
        refreshInvestigations,
        refreshEvidence,
        refreshHypotheses,
        refreshCapa,
        refreshProjects,
        refreshLosses,
        refreshStandards,
        refreshSolutions,
        refreshCapex,
        refreshDashboard,

        // Mutation Handlers
        initiateRCA,
        updateRCA,
        advanceRcaPhase,
        deleteRCA,
        addEvidence,
        deleteEvidence,
        addHypothesis,
        validateRootCause,
        deleteHypothesis,
        createCapaAction,
        updateCapaStatus,
        verifyCapaEffectiveness,
        deleteCapaAction,
        createLoss,
        deleteLoss,
        createProject,
        updateProject,
        deleteProject,
        verifyAndLockBenefit,
        unlockBenefit,
        createStandard,
        updateStandard,
        deleteStandard,
        createVerifiedSolution,
        deleteVerifiedSolution,
        createCapexProject,
        deleteCapexProject,
        launchRcaFromBadActor,
      }}
    >
      {children}
    </CIContext.Provider>
  );
}

export function useCI() {
  const context = useContext(CIContext);
  if (!context) {
    throw new Error("useCI must be used within a CIProvider");
  }
  return context;
}

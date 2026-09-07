import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useMasterData } from "./MasterDataContext";
import { useCMMS } from "./CMMSContext";
import { useRole } from "./RoleContext";
import { useApp } from "./AppContext";

const CIContext = createContext();

export function CIProvider({ children }) {
  const { currentPlant, logAuditEvent, plants = [], assets: masterAssets = [] } = useMasterData();
  const { breakdowns = [], assets: cmmsAssets = [] } = useCMMS();
  const { currentRole, userRole } = useRole();
  const { addToast } = useApp();

  // Active user identity for audit
  const currentUser = currentRole?.name || "David Kim (Lead CI)";

  // 1. RELIABILITY & REPEAT FAILURES STATE
  const [reliabilityRecords, setReliabilityRecords] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_reliability");
    if (saved) return JSON.parse(saved);
    return [
      {
        assetId: "AST-002",
        assetName: "HTST Flash Pasteurizer",
        lineId: "LIN-02",
        lineName: "Line 2 — Formulation & Pasteurizer",
        plantId: "PLT-01",
        failuresCount: 3,
        totalDowntimeMin: 135,
        mtbfHrs: 88,
        mttrMin: 45,
        lastFailureDate: "2026-08-28",
        failureCategory: "Thermal & Pneumatics",
        criticality: "Critical",
        isBadActor: true,
        badActorReason: "Repeat Failure Trigger: 3 Breakdowns in 30 days"
      },
      {
        assetId: "AST-001",
        assetName: "Rotary Isobaric Bottle Filler",
        lineId: "LIN-01",
        lineName: "Line 1 — Aseptic Bottling",
        plantId: "PLT-01",
        failuresCount: 2,
        totalDowntimeMin: 76,
        mtbfHrs: 102,
        mttrMin: 38,
        lastFailureDate: "2026-08-25",
        failureCategory: "Capping Head & Torque",
        criticality: "High",
        isBadActor: true,
        badActorReason: "Repeat Failure Trigger: 2 Breakdowns in 30 days"
      },
      {
        assetId: "AST-004",
        assetName: "Sleeve Rotary Labeler & Shrink Tunnel",
        lineId: "LIN-01",
        lineName: "Line 1 — Aseptic Bottling",
        plantId: "PLT-01",
        failuresCount: 1,
        totalDowntimeMin: 22,
        mtbfHrs: 148,
        mttrMin: 22,
        lastFailureDate: "2026-08-14",
        failureCategory: "Vision Inspection & Feed",
        criticality: "Medium",
        isBadActor: false,
        badActorReason: "Standard operational threshold (< 2 failures)"
      },
      {
        assetId: "AST-005",
        assetName: "Automated Case Packer & Palletizer",
        lineId: "LIN-01",
        lineName: "Line 1 — Aseptic Bottling",
        plantId: "PLT-01",
        failuresCount: 1,
        totalDowntimeMin: 30,
        mtbfHrs: 180,
        mttrMin: 30,
        lastFailureDate: "2026-08-10",
        failureCategory: "Robotic Grip",
        criticality: "Medium",
        isBadActor: false,
        badActorReason: "Standard operational threshold (< 2 failures)"
      }
    ];
  });

  // 2. RCA 2.0 INVESTIGATIONS
  const [investigations, setInvestigations] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_rca");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "RCA-2026-001",
        title: "HTST Pasteurizer CCP Temp Excursion & Pneumatic Valve Leak",
        assetId: "AST-002",
        assetName: "HTST Flash Pasteurizer",
        lineId: "LIN-02",
        lineName: "Line 2 — Formulation & Pasteurizer",
        plantId: "PLT-01",
        sourceBreakdownId: "BD-2026-1002",
        sourceWorkOrderId: "WO-2026-4401",
        severity: "Critical",
        status: "Root Cause Validated",
        currentPhase: "Occurrence Cause",
        problemStatement: "Temperature dropped below 72.5°C critical limit during shift 2; automatic divert valve failed to fully seal, causing 45 min downtime.",
        leadInvestigator: "David Kim (Lead CI Engineer)",
        teamMembers: ["Elena Rostova (QA Manager)", "Marcus Vance (Maintenance Lead)", "Carlos Gomez (Tech)"],
        eventDate: "2026-08-28",
        daysActive: 3,
        whyTree: [
          { id: "W1", question: "Why did the pasteurizer temperature drop below 72.5°C?", answer: "Steam control modulating valve pneumatic diaphragm suffered pressure drop." },
          { id: "W2", question: "Why did the pneumatic diaphragm lose pressure?", answer: "Air supply regulator orifice was partially clogged with desiccant particulate." },
          { id: "W3", question: "Why was there desiccant particulate in the air line?", answer: "Instrument air dryer pre-filter cartridge ruptured due to over-pressure." },
          { id: "W4", question: "Why did the pre-filter cartridge rupture without alarm?", answer: "Differential pressure transmitter (DPT-104) was overdue for annual calibration." },
          { id: "W5", question: "Why was calibration missed during PM window?", answer: "PM task checklist lacked explicit mandatory calibration interval for instrument air sub-skid." }
        ],
        eightD: {
          d1Team: "David Kim (Lead), Marcus Vance (Maint), Elena Rostova (QA)",
          d2Problem: "Temp dropped to 71.8°C; divert valve cycled 6 times under load.",
          d3Containment: "Isolated Batch BAT-0890 to QA quarantine hold; replaced inline steam regulator.",
          d4RootCause: "Instrument air desiccant filter rupture caused pneumatic actuator starvation.",
          d5CorrectiveAction: "Install redundant 0.01 micron sub-filter and upgrade DPT-104 with auto-trip PLC alarm.",
          d6Implementation: "Pneumatic overhaul completed; PM-AIR-04 calibration standard approved.",
          d7Prevention: "Update Engineering SOP STD-ENG-003 and add weekly air dewpoint verification.",
          d8Closure: "Verified 14 days zero temp deviations; $38,200 annual scrap saved."
        }
      },
      {
        id: "RCA-2026-002",
        title: "Rotary Filler Capping Head #4 Slip & Incomplete Seal",
        assetId: "AST-001",
        assetName: "Rotary Isobaric Bottle Filler",
        lineId: "LIN-01",
        lineName: "Line 1 — Aseptic Bottling",
        plantId: "PLT-01",
        sourceBreakdownId: "BD-2026-1001",
        sourceWorkOrderId: "WO-2026-4402",
        severity: "High",
        status: "In Progress",
        currentPhase: "Hypothesis & Tests",
        problemStatement: "Cap torque failure rate exceeded 2.5% on spindle 4 due to magnetic clutch slipping during high-speed changeover.",
        leadInvestigator: "Elena Rostova (QA Manager)",
        teamMembers: ["David Kim (Lead CI)", "Marcus Vance (Maintenance Lead)"],
        eventDate: "2026-08-25",
        daysActive: 6,
        whyTree: [
          { id: "W1", question: "Why did capping spindle 4 slip?", answer: "Magnetic clutch torque setting drifted from 2.8 Nm to 1.4 Nm." },
          { id: "W2", question: "Why did the clutch torque drift?", answer: "Locking collar set-screw loosened under high vibration during 38,000 BPH run." },
          { id: "W3", question: "Why did the set-screw loosen?", answer: "Thread-locking compound was omitted during previous spindle overhaul." },
          { id: "W4", question: "Why was thread-locker omitted?", answer: "Maintenance work order instructions did not list Loctite 243 as mandatory consumable." },
          { id: "W5", question: "Why is consumable not standardized?", answer: "Spindle rebuild BOM lacked dedicated mechanical fastening sub-assembly specification." }
        ],
        eightD: {
          d1Team: "Elena Rostova (QA Lead), Marcus Vance (Maint)",
          d2Problem: "Cap torque out of tolerance on 12 consecutive samples.",
          d3Containment: "100% manual visual & torque audit on batch LOT-2026-0825.",
          d4RootCause: "Spindle 4 magnetic clutch set-screw vibration loosening.",
          d5CorrectiveAction: "Re-torque all 24 spindles and apply Loctite 243 threadlocker.",
          d6Implementation: "All spindles audited; torque calibration verified.",
          d7Prevention: "Update spindle maintenance rebuild standard SOP-CAP-002.",
          d8Closure: "In progress — awaiting 7-day stability test."
        }
      }
    ];
  });

  // 3. RCA EVIDENCE STATE
  const [evidenceList, setEvidenceList] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_evidence");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "EVD-01",
        rcaId: "RCA-2026-001",
        type: "SCADA Trend",
        title: "Steam Manifold Pressure & Pasteurizer Temp Plunge Log",
        details: "Recorded pressure plunge from 6.2 bar to 2.8 bar at 10:22 AM on Line 2.",
        uploadedBy: "Marcus Vance",
        date: "2026-08-28"
      },
      {
        id: "EVD-02",
        rcaId: "RCA-2026-001",
        type: "Physical Inspection Photo",
        title: "Ruptured Desiccant Pre-filter Cartridge",
        details: "Microscopic particulate clogging observed inside regulator nozzle cavity.",
        uploadedBy: "David Kim",
        date: "2026-08-28"
      },
      {
        id: "EVD-03",
        rcaId: "RCA-2026-002",
        type: "Lab Torque Curve",
        title: "Cap Torque Failure Frequency Distribution",
        details: "98% of out-of-spec caps isolated specifically to Spindle Station #4.",
        uploadedBy: "Elena Rostova",
        date: "2026-08-25"
      }
    ];
  });

  // 4. HYPOTHESES & CAUSE VALIDATION
  const [hypotheses, setHypotheses] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_hypotheses");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "HYP-01",
        rcaId: "RCA-2026-001",
        statement: "Pneumatic actuator air supply starvation caused slow divert response.",
        testMethod: "Measure line pressure drop at regulator input during 100% steam call.",
        evidenceResult: "Pressure dropped from 6.2 bar to 2.8 bar upon valve stroke.",
        validationStatus: "Confirmed Root Cause",
        validatedBy: "David Kim (Lead CI)",
        validatedAt: "2026-08-30 14:15"
      },
      {
        id: "HYP-02",
        rcaId: "RCA-2026-001",
        statement: "Boiler feed steam boiler water treatment scale caused valve seat binding.",
        testMethod: "Inspect valve stem and seat with borescope.",
        evidenceResult: "Valve seat was pristine with zero scaling or mechanical scoring.",
        validationStatus: "Refuted",
        validatedBy: "Marcus Vance",
        validatedAt: "2026-08-29 11:30"
      },
      {
        id: "HYP-03",
        rcaId: "RCA-2026-002",
        statement: "Spindle 4 magnetic clutch set-screw loosened due to lack of threadlocker.",
        testMethod: "Check fastener torque on all 24 spindles using calibrated digital wrench.",
        evidenceResult: "Spindle 4 fastener was loose at 0.4 Nm (spec: 4.5 Nm).",
        validationStatus: "Confirmed Root Cause",
        validatedBy: "Elena Rostova",
        validatedAt: "2026-08-26 16:20"
      }
    ];
  });

  // 5. CAPA / ACTION ITEMS
  const [capaActions, setCapaActions] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_capa");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "CAPA-2026-001",
        rcaId: "RCA-2026-001",
        projectId: "PRJ-CI-001",
        description: "Install redundant 0.01 micron coalescing filter on instrument air supply skid.",
        actionType: "Corrective",
        owner: "Marcus Vance (Maintenance Lead)",
        dueDate: "2026-09-10",
        priority: "High",
        status: "In Progress",
        completionDate: null,
        evidenceNotes: "Procurement PO-SUP-401 placed; technician scheduled for installation.",
        effectivenessResult: null,
        verifiedBy: null,
        verifiedAt: null
      },
      {
        id: "CAPA-2026-002",
        rcaId: "RCA-2026-001",
        projectId: "PRJ-CI-001",
        description: "Update PM-AIR-04 task checklist to include mandatory quarterly differential pressure transmitter calibration.",
        actionType: "Preventive",
        owner: "David Kim (Lead CI)",
        dueDate: "2026-09-05",
        priority: "High",
        status: "Completed",
        completionDate: "2026-08-31",
        evidenceNotes: "PM checklist template revised and uploaded to Master Data.",
        effectivenessResult: "Awaiting 30-day PM execution cycle audit.",
        verifiedBy: null,
        verifiedAt: null
      },
      {
        id: "CAPA-2026-003",
        rcaId: "RCA-2026-002",
        projectId: "PRJ-CI-002",
        description: "Standardize Loctite 243 threadlocker on all 24 filler capping spindle rebuild procedures.",
        actionType: "Corrective",
        owner: "Marcus Vance (Maintenance Lead)",
        dueDate: "2026-08-28",
        priority: "High",
        status: "Verified",
        completionDate: "2026-08-27",
        evidenceNotes: "All 24 spindles re-torqued and verified with Loctite 243.",
        effectivenessResult: "Zero cap torque deviations observed across 180,000 bottles.",
        verifiedBy: "Elena Rostova (QA Manager)",
        verifiedAt: "2026-08-29 10:00"
      },
      {
        id: "CAPA-2026-004",
        rcaId: "RCA-2026-002",
        projectId: "PRJ-CI-002",
        description: "Establish automated torque inspection check in hourly Quality Pitch record.",
        actionType: "Preventive",
        owner: "Elena Rostova (QA Manager)",
        dueDate: "2026-08-20",
        priority: "Medium",
        status: "In Progress",
        completionDate: null,
        evidenceNotes: "Electronic quality sheet draft prepared.",
        effectivenessResult: null,
        verifiedBy: null,
        verifiedAt: null
      }
    ];
  });

  // 6. CI & KAIZEN PROJECTS
  const [ciProjects, setCiProjects] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_projects");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "PRJ-CI-001",
        name: "OEE & Thermal Stability Optimization — Line 2 Pasteurizer",
        type: "DMAIC 6-Sigma",
        plantId: "PLT-01",
        lineId: "LIN-02",
        assetId: "AST-002",
        linkedRcaId: "RCA-2026-001",
        sponsor: "Plant Operations Director",
        owner: "David Kim (Lead CI)",
        startDate: "2026-08-01",
        targetDate: "2026-09-30",
        status: "Implementation",
        progress: 82,
        baselineMetric: "88 hrs MTBF / 45 min MTTR",
        targetMetric: "> 180 hrs MTBF / < 20 min MTTR",
        currentMetric: "154 hrs MTBF / 22 min MTTR",
        projectedSavingsAnnual: 42000,
        realizedSavingsYTD: 38200,
        benefitStatus: "Pending Verification",
        lockedBy: null,
        lockedAt: null
      },
      {
        id: "PRJ-CI-002",
        name: "CIP Cycle Time & Water Consumption Reduction",
        type: "Kaizen Event",
        plantId: "PLT-01",
        lineId: "LIN-01",
        assetId: "AST-001",
        linkedRcaId: "RCA-2026-002",
        sponsor: "Sustainability & Operations Lead",
        owner: "Marcus Vance (Maintenance Lead)",
        startDate: "2026-07-15",
        targetDate: "2026-08-31",
        status: "Completed",
        progress: 100,
        baselineMetric: "65 min CIP Cycle / 14,000 L Water",
        targetMetric: "45 min CIP Cycle / 9,500 L Water",
        currentMetric: "42 min CIP Cycle / 9,100 L Water",
        projectedSavingsAnnual: 18000,
        realizedSavingsYTD: 18000,
        benefitStatus: "Verified & Locked",
        lockedBy: "Sarah Jenkins (Plant Director)",
        lockedAt: "2026-08-31 16:45"
      },
      {
        id: "PRJ-CI-003",
        name: "Label Application Defect Elimination & Vision Upgrade",
        type: "SMED Rapid Setup",
        plantId: "PLT-01",
        lineId: "LIN-01",
        assetId: "AST-004",
        linkedRcaId: null,
        sponsor: "Packaging Department Head",
        owner: "Elena Rostova (QA Manager)",
        startDate: "2026-08-10",
        targetDate: "2026-09-15",
        status: "In Progress",
        progress: 65,
        baselineMetric: "1.8% Label Skew Defect Rate",
        targetMetric: "< 0.2% Defect Rate",
        currentMetric: "0.4% Defect Rate",
        projectedSavingsAnnual: 11200,
        realizedSavingsYTD: 8400,
        benefitStatus: "Draft",
        lockedBy: null,
        lockedAt: null
      }
    ];
  });

  // 7. LOSS TRACKING
  const [lossRecords, setLossRecords] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_losses");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "LOSS-01",
        category: "Downtime Loss",
        plantId: "PLT-01",
        lineId: "LIN-02",
        assetId: "AST-002",
        eventName: "Pasteurizer Divert Valve Jam & Thermal Drop",
        hoursLost: 2.25,
        unitsLost: 8500,
        financialImpactUSD: 14200,
        linkedRcaId: "RCA-2026-001",
        linkedProjectId: "PRJ-CI-001",
        trend: "Critical",
        date: "2026-08-28"
      },
      {
        id: "LOSS-02",
        category: "Quality / Defect Loss",
        plantId: "PLT-01",
        lineId: "LIN-01",
        assetId: "AST-001",
        eventName: "Capping Torque Under-specification Rejection",
        hoursLost: 1.20,
        unitsLost: 4200,
        financialImpactUSD: 6800,
        linkedRcaId: "RCA-2026-002",
        linkedProjectId: "PRJ-CI-002",
        trend: "Warning",
        date: "2026-08-25"
      },
      {
        id: "LOSS-03",
        category: "Scrap / Rework Loss",
        plantId: "PLT-01",
        lineId: "LIN-01",
        assetId: "AST-004",
        eventName: "Label Wrinkling and Skewed Sleeve Shrinkage",
        hoursLost: 0.80,
        unitsLost: 1800,
        financialImpactUSD: 3100,
        linkedRcaId: null,
        linkedProjectId: "PRJ-CI-003",
        trend: "Tracked",
        date: "2026-08-22"
      }
    ];
  });

  // 8. STANDARDS LIBRARY
  const [standards, setStandards] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_standards");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "STD-ENG-001",
        title: "SOP-ENG-402: Instrument Air Header Filtration & Dewpoint Monitoring",
        type: "Controlled SOP",
        version: "v2.1",
        plantId: "PLT-01",
        lineId: "LIN-02",
        assetId: "AST-002",
        sourceProjectId: "PRJ-CI-001",
        sourceRcaId: "RCA-2026-001",
        owner: "Engineering Quality Committee",
        status: "Active",
        effectiveDate: "2026-08-15",
        reviewDate: "2027-08-15",
        approvedBy: "Sarah Jenkins (Plant Director)"
      },
      {
        id: "STD-ENG-002",
        title: "SOP-CAP-002: Rotary Capper Spindle Rebuild & Loctite 243 Fastener Standard",
        type: "Engineering Spec",
        version: "v1.4",
        plantId: "PLT-01",
        lineId: "LIN-01",
        assetId: "AST-001",
        sourceProjectId: "PRJ-CI-002",
        sourceRcaId: "RCA-2026-002",
        owner: "Marcus Vance (Maintenance Lead)",
        status: "Active",
        effectiveDate: "2026-08-28",
        reviewDate: "2027-08-28",
        approvedBy: "Sarah Jenkins (Plant Director)"
      },
      {
        id: "STD-ENG-003",
        title: "HACCP-CCP-01: Thermal Pasteurization Continuous Flow Critical Limit Standard",
        type: "HACCP Limit",
        version: "v3.0",
        plantId: "PLT-01",
        lineId: "LIN-02",
        assetId: "AST-002",
        sourceProjectId: "PRJ-CI-001",
        sourceRcaId: "RCA-2026-001",
        owner: "Elena Rostova (QA Manager)",
        status: "Active",
        effectiveDate: "2026-08-01",
        reviewDate: "2027-08-01",
        approvedBy: "QA Governance Board"
      }
    ];
  });

  // 9. VERIFIED SOLUTIONS
  const [verifiedSolutions, setVerifiedSolutions] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_solutions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "VSOL-001",
        assetId: "AST-002",
        assetName: "HTST Flash Pasteurizer",
        failureMode: "Pneumatic Actuator Slow Divert on Temperature Plunge",
        symptom: "Divert valve chatter, slow seal response (> 2.4s), CCP warning buzzer.",
        rootCause: "Desiccant particulate fouling in main pneumatic pilot regulator orifice.",
        solutionSteps: "1. Isolate air line and blow down residual pressure. 2. Clean regulator screen with ultrasonic bath. 3. Replace pilot seal ring. 4. Verify 6.0 bar stroke pressure.",
        partsUsed: "Pneumatic Regulator Seal Kit (SKU-SP-4402), 0.01um Filter Element",
        sourceRcaId: "RCA-2026-001",
        verifiedBy: "Marcus Vance (Maintenance Lead)",
        verifiedDate: "2026-08-31",
        status: "Published"
      },
      {
        id: "VSOL-002",
        assetId: "AST-001",
        assetName: "Rotary Isobaric Bottle Filler",
        failureMode: "Spindle 4 Capping Slip & Under-torque",
        symptom: "Loose bottle caps on discharge conveyor; torque inspection < 1.8 Nm.",
        rootCause: "Magnetic clutch set-screw loosened due to high-speed vibration without threadlocker.",
        solutionSteps: "1. Remove spindle guard. 2. Clean fastener threads with isopropanol. 3. Apply 2 drops Loctite 243. 4. Torque to 4.5 Nm with digital torque wrench.",
        partsUsed: "Loctite 243 Medium Strength Threadlocker",
        sourceRcaId: "RCA-2026-002",
        verifiedBy: "Elena Rostova (QA Manager)",
        verifiedDate: "2026-08-29",
        status: "Published"
      }
    ];
  });

  // 10. ENGINEERING CAPEX PROJECTS
  const [capexProjects, setCapexProjects] = useState(() => {
    const saved = localStorage.getItem("maintenx_ci_capex");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "CPX-2026-001",
        name: "Automated Tri-Clamp Steam Modulating Valve Redesign & Dual Redundant Air Header",
        plantId: "PLT-01",
        lineId: "LIN-02",
        assetId: "AST-002",
        linkedRcaId: "RCA-2026-001",
        linkedProjectId: "PRJ-CI-001",
        budget: 65000,
        estimatedCost: 58000,
        actualCost: 34000,
        engineeringJustification: "Permanent machine redesign to eliminate single-point pneumatic regulator failure on critical thermal CCP process.",
        status: "Budget Approved",
        owner: "David Kim (Lead CI)",
        targetCommissionDate: "2026-10-15",
        dossierRef: "DOS-ENG-2026-PAST-01",
        approvalStatus: "Approved by Plant GM"
      },
      {
        id: "CPX-2026-002",
        name: "Line 1 High-Speed Vision Sorting & Ejection System Upgrade",
        plantId: "PLT-01",
        lineId: "LIN-01",
        assetId: "AST-004",
        linkedRcaId: null,
        linkedProjectId: "PRJ-CI-003",
        budget: 45000,
        estimatedCost: 42000,
        actualCost: 12000,
        engineeringJustification: "Cognex 3D vision camera upgrade to detect cap micro-cracks at 40,000 BPH.",
        status: "Under Engineering Review",
        owner: "Elena Rostova (QA Manager)",
        targetCommissionDate: "2026-11-01",
        dossierRef: "DOS-ENG-2026-VIS-04",
        approvalStatus: "Pending Capex Board Review"
      }
    ];
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("maintenx_ci_reliability", JSON.stringify(reliabilityRecords));
  }, [reliabilityRecords]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_rca", JSON.stringify(investigations));
  }, [investigations]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_evidence", JSON.stringify(evidenceList));
  }, [evidenceList]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_hypotheses", JSON.stringify(hypotheses));
  }, [hypotheses]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_capa", JSON.stringify(capaActions));
  }, [capaActions]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_projects", JSON.stringify(ciProjects));
  }, [ciProjects]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_losses", JSON.stringify(lossRecords));
  }, [lossRecords]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_standards", JSON.stringify(standards));
  }, [standards]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_solutions", JSON.stringify(verifiedSolutions));
  }, [verifiedSolutions]);

  useEffect(() => {
    localStorage.setItem("maintenx_ci_capex", JSON.stringify(capexProjects));
  }, [capexProjects]);

  // Derived Fleet Metrics filtered by active plant
  const activePlantId = currentPlant || "PLT-01";

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

  // Dynamic Fleet KPIs
  const fleetMTBF = useMemo(() => {
    if (!plantFilteredReliability.length) return 120;
    const sum = plantFilteredReliability.reduce((acc, r) => acc + (Number(r.mtbfHrs) || 100), 0);
    return Math.round(sum / plantFilteredReliability.length);
  }, [plantFilteredReliability]);

  const fleetMTTR = useMemo(() => {
    if (!plantFilteredReliability.length) return 32;
    const sum = plantFilteredReliability.reduce((acc, r) => acc + (Number(r.mttrMin) || 30), 0);
    return Math.round(sum / plantFilteredReliability.length);
  }, [plantFilteredReliability]);

  const realizedSavingsTotal = useMemo(() => {
    return plantFilteredProjects.reduce((acc, p) => acc + (Number(p.realizedSavingsYTD) || 0), 0);
  }, [plantFilteredProjects]);

  const projectedSavingsTotal = useMemo(() => {
    return plantFilteredProjects.reduce((acc, p) => acc + (Number(p.projectedSavingsAnnual) || 0), 0);
  }, [plantFilteredProjects]);

  const badActorsCount = useMemo(() => {
    return plantFilteredReliability.filter((r) => r.isBadActor).length;
  }, [plantFilteredReliability]);

  const openRcaCount = useMemo(() => {
    return plantFilteredRca.filter((i) => i.status !== "Closed").length;
  }, [plantFilteredRca]);

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
  // CORE WORKFLOW MUTATION ACTIONS
  // ==========================================

  // 1. Initiate RCA from Bad Actor Asset or Failure Event
  const initiateRCA = (assetId, sourceBreakdownId, customProblem) => {
    const asset = reliabilityRecords.find((r) => r.assetId === assetId) ||
                  masterAssets.find((a) => a.assetId === assetId) || {
                    assetName: "Production Machine",
                    lineId: "LIN-01",
                    lineName: "Line 1",
                    plantId: activePlantId
                  };

    const newId = `RCA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRca = {
      id: newId,
      title: customProblem || `Investigation — ${asset.assetName || asset.name} Repeat Breakdown`,
      assetId: asset.assetId || assetId,
      assetName: asset.assetName || asset.name || "Critical Equipment",
      lineId: asset.lineId || "LIN-01",
      lineName: asset.lineName || "Line 1",
      plantId: asset.plantId || activePlantId,
      sourceBreakdownId: sourceBreakdownId || `BD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceWorkOrderId: `WO-2026-${Math.floor(4000 + Math.random() * 9000)}`,
      severity: "High",
      status: "Open",
      currentPhase: "Event",
      problemStatement: customProblem || `Repeat failure detected on ${asset.assetName || asset.name}. Investigation launched to determine root cause and implement permanent CAPA.`,
      leadInvestigator: currentUser,
      teamMembers: [currentUser, "Marcus Vance (Maintenance Lead)", "Elena Rostova (QA)"],
      eventDate: new Date().toISOString().substring(0, 10),
      daysActive: 0,
      whyTree: [
        { id: "W1", question: "Why did the equipment fail during operation?", answer: "" },
        { id: "W2", question: "Why did the sub-component experience premature wear?", answer: "" },
        { id: "W3", question: "Why was the condition not detected during routine PM?", answer: "" },
        { id: "W4", question: "Why did the existing sensor/alarm fail to trigger?", answer: "" },
        { id: "W5", question: "Why was the standard maintenance procedure not followed?", answer: "" }
      ],
      eightD: {
        d1Team: currentUser,
        d2Problem: customProblem || "Repeat failure event logged.",
        d3Containment: "Line stopped; parts inspected; standard cleanout performed.",
        d4RootCause: "",
        d5CorrectiveAction: "",
        d6Implementation: "",
        d7Prevention: "",
        d8Closure: ""
      }
    };

    setInvestigations((prev) => [newRca, ...prev]);

    if (logAuditEvent) {
      logAuditEvent("CI_RCA_INITIATED", "RCA Investigation", newId, null, newRca.title, `RCA launched from Bad Actor ${assetId}`);
    }

    addToast(`RCA Investigation ${newId} initiated for ${asset.assetName || assetId}!`, "success");
    return newId;
  };

  // 2. Advance / Update RCA Investigation
  const updateRCA = (rcaId, updatedFields) => {
    setInvestigations((prev) =>
      prev.map((i) => (i.id === rcaId ? { ...i, ...updatedFields } : i))
    );
    if (logAuditEvent) {
      logAuditEvent("CI_RCA_UPDATED", "RCA Investigation", rcaId, null, null, `RCA fields updated`);
    }
  };

  const advanceRcaPhase = (rcaId, nextPhase) => {
    setInvestigations((prev) =>
      prev.map((i) => (i.id === rcaId ? { ...i, currentPhase: nextPhase } : i))
    );
    addToast(`RCA ${rcaId} phase advanced to "${nextPhase}".`, "info");
  };

  // 3. Root Cause Validation
  const validateRootCause = (rcaId, hypothesisId, isConfirmed, validationNotes) => {
    const timestamp = new Date().toISOString().substring(0, 16).replace("T", " ");
    setHypotheses((prev) =>
      prev.map((h) =>
        h.id === hypothesisId
          ? {
              ...h,
              validationStatus: isConfirmed ? "Confirmed Root Cause" : "Refuted",
              evidenceResult: validationNotes || h.evidenceResult,
              validatedBy: currentUser,
              validatedAt: timestamp
            }
          : h
      )
    );

    if (isConfirmed) {
      setInvestigations((prev) =>
        prev.map((i) =>
          i.id === rcaId ? { ...i, status: "Root Cause Validated", currentPhase: "CAPA" } : i
        )
      );
      addToast(`Root Cause for ${rcaId} officially VALIDATED and confirmed!`, "success");
    } else {
      addToast(`Hypothesis ${hypothesisId} tested & refuted.`, "info");
    }

    if (logAuditEvent) {
      logAuditEvent("CI_CAUSE_VALIDATED", "RCA Hypothesis", hypothesisId, null, isConfirmed ? "CONFIRMED" : "REFUTED", `Validation result recorded by ${currentUser}`);
    }
  };

  // 4. CAPA / Actions Management
  const createCapaAction = (newAction) => {
    const nextNum = capaActions.length + 1;
    const id = `CAPA-2026-${String(nextNum).padStart(3, "0")}`;
    const actionRecord = {
      id,
      rcaId: newAction.rcaId || null,
      projectId: newAction.projectId || null,
      description: newAction.description || "Action Item",
      actionType: newAction.actionType || "Corrective",
      owner: newAction.owner || currentUser,
      dueDate: newAction.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      priority: newAction.priority || "Medium",
      status: "Open",
      completionDate: null,
      evidenceNotes: newAction.evidenceNotes || "",
      effectivenessResult: null,
      verifiedBy: null,
      verifiedAt: null
    };

    setCapaActions((prev) => [actionRecord, ...prev]);

    if (logAuditEvent) {
      logAuditEvent("CI_CAPA_CREATED", "CAPA Action", id, null, actionRecord.description, `Created by ${currentUser}`);
    }

    addToast(`CAPA Action ${id} assigned to ${actionRecord.owner}!`, "success");
    return id;
  };

  const updateCapaStatus = (actionId, newStatus, extraNotes = "") => {
    const timestamp = new Date().toISOString().substring(0, 10);
    setCapaActions((prev) =>
      prev.map((c) => {
        if (c.id === actionId) {
          const isComplete = newStatus === "Completed" || newStatus === "Effectiveness Pending";
          const isVerified = newStatus === "Verified";
          return {
            ...c,
            status: newStatus,
            completionDate: isComplete ? (c.completionDate || timestamp) : c.completionDate,
            evidenceNotes: extraNotes ? `${c.evidenceNotes ? c.evidenceNotes + " | " : ""}${extraNotes}` : c.evidenceNotes,
            verifiedBy: isVerified ? currentUser : c.verifiedBy,
            verifiedAt: isVerified ? timestamp : c.verifiedAt
          };
        }
        return c;
      })
    );

    if (logAuditEvent) {
      logAuditEvent("CI_CAPA_STATUS_CHANGED", "CAPA Action", actionId, null, newStatus, `Status updated to ${newStatus}`);
    }

    addToast(`CAPA ${actionId} status updated to "${newStatus}"!`, "success");
  };

  // 5. CI / Kaizen Projects
  const createProject = (projectData) => {
    const nextNum = ciProjects.length + 1;
    const id = `PRJ-CI-${String(nextNum).padStart(3, "0")}`;
    const newProject = {
      id,
      name: projectData.name || "Continuous Improvement Project",
      type: projectData.type || "Kaizen Event",
      plantId: projectData.plantId || activePlantId,
      lineId: projectData.lineId || "LIN-01",
      assetId: projectData.assetId || null,
      linkedRcaId: projectData.linkedRcaId || null,
      sponsor: projectData.sponsor || "Operations Director",
      owner: projectData.owner || currentUser,
      startDate: projectData.startDate || new Date().toISOString().substring(0, 10),
      targetDate: projectData.targetDate || new Date(Date.now() + 60 * 86400000).toISOString().substring(0, 10),
      status: "In Progress",
      progress: 10,
      baselineMetric: projectData.baselineMetric || "Baseline TBD",
      targetMetric: projectData.targetMetric || "Target TBD",
      currentMetric: projectData.currentMetric || projectData.baselineMetric || "Initial",
      projectedSavingsAnnual: Number(projectData.projectedSavingsAnnual) || 15000,
      realizedSavingsYTD: 0,
      benefitStatus: "Draft",
      lockedBy: null,
      lockedAt: null
    };

    setCiProjects((prev) => [newProject, ...prev]);

    if (logAuditEvent) {
      logAuditEvent("CI_PROJECT_CREATED", "CI Project", id, null, newProject.name, `Initiated by ${currentUser}`);
    }

    addToast(`CI Project ${id} "${newProject.name}" created!`, "success");
    return id;
  };

  const updateProject = (projectId, fields) => {
    setCiProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...fields } : p))
    );
  };

  // 6. Benefits Verification & Lock
  const verifyAndLockBenefit = (projectId) => {
    const timestamp = new Date().toISOString().substring(0, 16).replace("T", " ");
    setCiProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              benefitStatus: "Verified & Locked",
              status: "Completed",
              lockedBy: currentUser,
              lockedAt: timestamp
            }
          : p
      )
    );

    if (logAuditEvent) {
      logAuditEvent("CI_BENEFIT_LOCKED", "CI Project Benefits", projectId, "Pending Verification", "Verified & Locked", `21 CFR Part 11 Certified by ${currentUser} at ${timestamp}`);
    }

    addToast(`Project ${projectId} benefits verified and IMMUTABLY LOCKED by ${currentUser}!`, "success");
  };

  const unlockBenefit = (projectId, justification) => {
    if (!justification?.trim()) {
      addToast("A valid engineering justification reason is required to unlock benefits.", "warning");
      return;
    }

    setCiProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              benefitStatus: "Pending Verification",
              lockedBy: null,
              lockedAt: null
            }
          : p
      )
    );

    if (logAuditEvent) {
      logAuditEvent("CI_BENEFIT_UNLOCKED", "CI Project Benefits", projectId, "Verified & Locked", "Pending Verification", `Unlocked by ${currentUser}. Reason: ${justification}`);
    }

    addToast(`Project ${projectId} benefits unlocked for review. Reason logged in Audit Trail.`, "info");
  };

  // 7. Standards Workflow
  const createStandard = (stdData) => {
    const nextNum = standards.length + 1;
    const id = `STD-ENG-${String(nextNum).padStart(3, "0")}`;
    const newStd = {
      id,
      title: stdData.title || "Controlled Operational Standard",
      type: stdData.type || "Controlled SOP",
      version: "v1.0",
      plantId: stdData.plantId || activePlantId,
      lineId: stdData.lineId || "LIN-01",
      assetId: stdData.assetId || null,
      sourceProjectId: stdData.sourceProjectId || null,
      sourceRcaId: stdData.sourceRcaId || null,
      owner: stdData.owner || currentUser,
      status: "Active",
      effectiveDate: new Date().toISOString().substring(0, 10),
      reviewDate: new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10),
      approvedBy: currentUser
    };

    setStandards((prev) => [newStd, ...prev]);

    if (logAuditEvent) {
      logAuditEvent("CI_STANDARD_PUBLISHED", "Controlled Standard", id, null, newStd.title, `Published by ${currentUser}`);
    }

    addToast(`Controlled Standard ${id} created and published!`, "success");
    return id;
  };

  // 8. Verified Solutions Workflow
  const createVerifiedSolution = (solData) => {
    const nextNum = verifiedSolutions.length + 1;
    const id = `VSOL-${String(nextNum).padStart(3, "0")}`;
    const newSol = {
      id,
      assetId: solData.assetId || "AST-001",
      assetName: solData.assetName || "Production Asset",
      failureMode: solData.failureMode || "Failure Mode",
      symptom: solData.symptom || "Operational Symptom",
      rootCause: solData.rootCause || "Validated Root Cause",
      solutionSteps: solData.solutionSteps || "Standard Fix Steps",
      partsUsed: solData.partsUsed || "None",
      sourceRcaId: solData.sourceRcaId || null,
      verifiedBy: currentUser,
      verifiedDate: new Date().toISOString().substring(0, 10),
      status: "Published"
    };

    setVerifiedSolutions((prev) => [newSol, ...prev]);

    if (logAuditEvent) {
      logAuditEvent("CI_SOLUTION_PUBLISHED", "Verified Solution", id, null, newSol.failureMode, `Solution published by ${currentUser}`);
    }

    addToast(`Verified Solution ${id} published to Knowledge Base!`, "success");
    return id;
  };

  // 9. Engineering Capex
  const createCapexProject = (capexData) => {
    const nextNum = capexProjects.length + 1;
    const id = `CPX-2026-${String(nextNum).padStart(3, "0")}`;
    const newCapex = {
      id,
      name: capexData.name || "Engineering Redesign & Capex Project",
      plantId: capexData.plantId || activePlantId,
      lineId: capexData.lineId || "LIN-01",
      assetId: capexData.assetId || "AST-001",
      linkedRcaId: capexData.linkedRcaId || null,
      linkedProjectId: capexData.linkedProjectId || null,
      budget: Number(capexData.budget) || 50000,
      estimatedCost: Number(capexData.estimatedCost) || 45000,
      actualCost: 0,
      engineeringJustification: capexData.engineeringJustification || "Permanent redesign to eliminate repetitive breakdown.",
      status: "Budget Approved",
      owner: capexData.owner || currentUser,
      targetCommissionDate: capexData.targetCommissionDate || new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
      dossierRef: `DOS-ENG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      approvalStatus: "Approved by Plant GM"
    };

    setCapexProjects((prev) => [newCapex, ...prev]);

    if (logAuditEvent) {
      logAuditEvent("CI_CAPEX_CREATED", "Engineering Capex", id, null, newCapex.name, `Budget $${newCapex.budget.toLocaleString()} created by ${currentUser}`);
    }

    addToast(`Engineering Capex Project ${id} ($${newCapex.budget.toLocaleString()}) created!`, "success");
    return id;
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

        // Mutation Handlers
        initiateRCA,
        updateRCA,
        advanceRcaPhase,
        validateRootCause,
        createCapaAction,
        updateCapaStatus,
        createProject,
        updateProject,
        verifyAndLockBenefit,
        unlockBenefit,
        createStandard,
        createVerifiedSolution,
        createCapexProject
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

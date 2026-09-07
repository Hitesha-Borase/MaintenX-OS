// Mock data for Breakdowns in FlowState Ops CMMS
export const INITIAL_BREAKDOWNS = [
  {
    id: "BD-2026-042",
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    plant: "Plant 1 - North Facility",
    department: "Processing",
    line: "Line 2 (Formulation & Blending)",
    startTime: "2026-08-30 04:15",
    endTime: null, // active
    durationMinutes: 185, // running tally
    failureCode: "HYD-002",
    failureCategory: "Hydraulic / Pressure Loss",
    symptom: "Sudden pressure loss on Section 3 plates with temperature deviation alarm > 4°C above setpoint.",
    rootCause: "EPDM elastomer gasket degraded due to repeated caustic CIP wash cycles exceeding thermal threshold.",
    repairAction: "Isolate steam supply, depressurize loop, open plate frame and replace 6 damaged plate gaskets with high-temp fluoropolymer Viton seals.",
    status: "Active Repair", // Active Repair, Investigating, Awaiting Parts, Testing, Resolved, Closed
    technician: "David Kim",
    impact: {
      productionLossUnits: 4200,
      downtimeCostUSD: 12600,
      safetyRisk: "Medium",
      scrapRatePercent: 4.8
    },
    linkedWorkOrder: "WO-2026-0888",
    linkedRCA: "RCA-2026-019",
    verifiedSolutionId: "SOL-2025-084"
  },
  {
    id: "BD-2026-039",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    startTime: "2026-08-28 13:20",
    endTime: "2026-08-28 15:05",
    durationMinutes: 105,
    failureCode: "MEC-004",
    failureCategory: "Mechanical / Bearing Fatigue",
    symptom: "Main drive torque overload alarm tripped during 600 BPM run; severe acoustic vibration.",
    rootCause: "Lower drive cartridge bearing race pitting caused by moisture ingress through worn labyrinth seal.",
    repairAction: "Replaced ball bearing set BRG-6208-2RS and pressed new Viton oil seal. Re-torqued hub bolts to 110Nm.",
    status: "Resolved",
    technician: "Marcus Vance",
    impact: {
      productionLossUnits: 6300,
      downtimeCostUSD: 8925,
      safetyRisk: "Low",
      scrapRatePercent: 1.2
    },
    linkedWorkOrder: "WO-2026-0865",
    linkedRCA: "RCA-2026-015",
    verifiedSolutionId: "SOL-2026-012"
  },
  {
    id: "BD-2026-035",
    assetId: "LB-204",
    assetName: "Krones Autocol Rotary Labeler",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    startTime: "2026-08-22 09:40",
    endTime: "2026-08-22 10:55",
    durationMinutes: 75,
    failureCode: "ELE-008",
    failureCategory: "Electrical / Optical Drift",
    symptom: "Continuous false reject loop on discharge vision inspection station.",
    rootCause: "Aerosolized sugar dust film coating optical amplifier lens causing 35% attenuation.",
    repairAction: "Cleaned optical sensor lens with lens solvent, re-taught background suppression threshold, installed secondary air wipe nozzle.",
    status: "Resolved",
    technician: "Sarah Jenkins",
    impact: {
      productionLossUnits: 2250,
      downtimeCostUSD: 3180,
      safetyRisk: "Low",
      scrapRatePercent: 2.1
    },
    linkedWorkOrder: "WO-2026-0840",
    linkedRCA: null,
    verifiedSolutionId: "SOL-2025-045"
  },
  {
    id: "BD-2026-028",
    assetId: "CV-301",
    assetName: "Modular Incline Belt Conveyor Matrix 45m",
    plant: "Plant 2 - South Facility",
    department: "Packaging",
    line: "Line 3 (Canning Line)",
    startTime: "2026-08-14 16:10",
    endTime: "2026-08-14 17:00",
    durationMinutes: 50,
    failureCode: "MEC-009",
    failureCategory: "Mechanical / Belt Jam",
    symptom: "Can jam at incline transition belt guide causing motor thermal overload trip.",
    rootCause: "Guide rail clamp bolt slipped 15mm inward, narrowing channel below can diameter.",
    repairAction: "Cleared crushed cans, reset guide rail width with go/no-go gauge, applied Loctite 243 threadlocker to clamping bolts.",
    status: "Resolved",
    technician: "David Kim",
    impact: {
      productionLossUnits: 1500,
      downtimeCostUSD: 1850,
      safetyRisk: "Low",
      scrapRatePercent: 0.8
    },
    linkedWorkOrder: "WO-2026-0811",
    linkedRCA: null,
    verifiedSolutionId: "SOL-2024-110"
  }
];

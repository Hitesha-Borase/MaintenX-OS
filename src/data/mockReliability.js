// Reliability Metrics & MTBF / MTTR
export const RELIABILITY_METRICS = {
  plantOverall: {
    mtbfHours: 385.4,
    mtbfTargetHours: 420.0,
    mttrHours: 1.62,
    mttrTargetHours: 1.20,
    overallAvailability: 92.4, // %
    availabilityTarget: 95.0,
    pmComplianceRate: 96.2,
    unplannedDowntimeHoursMonth: 48.5,
    repeatFailureRate: 14.8, // %
    totalMaintenanceCostMonth: 34250, // USD
    budgetCostMonth: 38000
  },
  assetRanking: [
    {
      assetId: "AC-505",
      name: "Rotary Air Compressor Atlas Copco",
      mtbf: 720,
      mttr: 1.0,
      availability: 99.4,
      reliabilityScore: 98,
      downtimeHours: 2.0,
      repeatFailures: 0,
      status: "Top Performer"
    },
    {
      assetId: "MX-003",
      name: "Industrial Double-Cone Blender 5000L",
      mtbf: 520,
      mttr: 1.1,
      availability: 97.8,
      reliabilityScore: 96,
      downtimeHours: 4.5,
      repeatFailures: 0,
      status: "Top Performer"
    },
    {
      assetId: "PK-401",
      name: "Robotic End-of-Line Palletizer Fanuc",
      mtbf: 480,
      mttr: 0.8,
      availability: 96.5,
      reliabilityScore: 91,
      downtimeHours: 6.2,
      repeatFailures: 1,
      status: "Acceptable"
    },
    {
      assetId: "CP-102",
      name: "Arol Capper Rotary Capping Machine",
      mtbf: 410,
      mttr: 0.9,
      availability: 95.2,
      reliabilityScore: 88,
      downtimeHours: 8.4,
      repeatFailures: 1,
      status: "Acceptable"
    },
    {
      assetId: "FM-001",
      name: "High-Speed Rotary Filler 12-Head",
      mtbf: 342,
      mttr: 1.4,
      availability: 91.8,
      reliabilityScore: 78,
      downtimeHours: 14.8,
      repeatFailures: 4, // Repeat alert
      status: "Needs Attention"
    },
    {
      assetId: "LB-204",
      name: "Krones Autocol Rotary Labeler",
      mtbf: 180,
      mttr: 2.8,
      availability: 84.5,
      reliabilityScore: 68,
      downtimeHours: 22.0,
      repeatFailures: 3,
      status: "High Risk"
    },
    {
      assetId: "HT-105",
      name: "Plate Heat Exchanger & Pasteurizer HTST-300",
      mtbf: 210,
      mttr: 4.2,
      availability: 76.2,
      reliabilityScore: 42,
      downtimeHours: 36.5,
      repeatFailures: 5, // Repeat critical
      status: "Critical Risk"
    }
  ],
  monthlyTrend: [
    { month: "Mar", mtbf: 310, mttr: 2.1, availability: 88.5, breakdowns: 12, cost: 42000 },
    { month: "Apr", mtbf: 335, mttr: 1.9, availability: 89.8, breakdowns: 10, cost: 38500 },
    { month: "May", mtbf: 360, mttr: 1.8, availability: 91.2, breakdowns: 8, cost: 36000 },
    { month: "Jun", mtbf: 375, mttr: 1.7, availability: 91.8, breakdowns: 9, cost: 35200 },
    { month: "Jul", mtbf: 390, mttr: 1.5, availability: 93.1, breakdowns: 6, cost: 31800 },
    { month: "Aug", mtbf: 385, mttr: 1.6, availability: 92.4, breakdowns: 7, cost: 34250 }
  ]
};

export const REPEAT_FAILURES = [
  {
    id: "REP-001",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    failureCode: "MEC-004",
    failureName: "Bearing Wear / Spindle Fatigue",
    occurrencesCount: 4,
    lastOccurrence: "2026-08-28",
    totalDowntimeHours: 7.2,
    cumulativeCostUSD: 14200,
    rootCauseCandidate: "Inadequate seal protection leading to washdown water ingress into bearing cartridge.",
    rcaStatus: "RCA In Progress (RCA-2026-015)",
    actionRecommended: "Retrofit dual PTFE labyrinth bearing isolators and upgrade to solid-polymer lubricated bearings."
  },
  {
    id: "REP-002",
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    failureCode: "HYD-002",
    failureName: "Gasket Rupture / High Pressure Leak",
    occurrencesCount: 5,
    lastOccurrence: "2026-08-30",
    totalDowntimeHours: 19.5,
    cumulativeCostUSD: 28500,
    rootCauseCandidate: "Thermal shock cycles during rapid CIP rinse transitions degrading standard EPDM material.",
    rcaStatus: "RCA Required",
    actionRecommended: "Convert plate pack to molded Viton gaskets and install automated ramped cooling valve curve."
  },
  {
    id: "REP-003",
    assetId: "LB-204",
    assetName: "Krones Autocol Rotary Labeler",
    failureCode: "ELE-008",
    failureName: "Optical Sensor Drift / Dirty Lens",
    occurrencesCount: 3,
    lastOccurrence: "2026-08-22",
    totalDowntimeHours: 3.8,
    cumulativeCostUSD: 4100,
    rootCauseCandidate: "Glue vapor mist condensing onto optical sensor receiver aperture.",
    rcaStatus: "Completed (RCA-2026-009)",
    actionRecommended: "Installed pressurized positive air-curtain manifold over optical inspection bay."
  }
];

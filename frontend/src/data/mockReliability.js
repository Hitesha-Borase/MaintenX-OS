// Reliability Metrics & MTBF / MTTR (Clean initial state, loaded dynamically from PostgreSQL database)
export const RELIABILITY_METRICS = {
  plantOverall: {
    mtbfHours: 0,
    mtbfTargetHours: 420.0,
    mttrHours: 0,
    mttrTargetHours: 1.20,
    overallAvailability: 100,
    availabilityTarget: 95.0,
    pmComplianceRate: 100,
    unplannedDowntimeHoursMonth: 0,
    repeatFailureRate: 0,
    totalMaintenanceCostMonth: 0,
    budgetCostMonth: 38000
  },
  assetRanking: [],
  failurePareto: [],
  failureCategories: [],
  repeatFailures: [],
  monthlyTrend: []
};

export const REPEAT_FAILURES = [];


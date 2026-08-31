// Costing Analytics with Fact, Calculation, Estimate, and AI Recommendation tags
export const COSTING_DATA = {
  batchCostSummary: {
    batchId: "BAT-2026-0892",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    totalBatchCostUSD: 19440.00,
    costPerUnitUSD: 0.81,
    budgetedCostPerUnitUSD: 0.76,
    varianceUSD: +0.05,
    variancePercentage: +6.58,
    costBreakdown: [
      {
        category: "Raw Materials (Juice Conc & Water)",
        actualCostUSD: 9850.00,
        budgetCostUSD: 9600.00,
        varianceUSD: +250.00,
        variancePercent: +2.6,
        tag: "FACT", // FACT, CALCULATION, ESTIMATE, AI_RECOMMENDATION
        notes: "Direct ERP invoice matching from Citrus Valley Farms."
      },
      {
        category: "Packaging Materials (PET, Caps, Sleeves)",
        actualCostUSD: 4420.00,
        budgetCostUSD: 4320.00,
        varianceUSD: +100.00,
        variancePercent: +2.3,
        tag: "FACT",
        notes: "Based on actual barcode scan issues from Cage B."
      },
      {
        category: "Direct Labour (Operators & QA Techs)",
        actualCostUSD: 1890.00,
        budgetCostUSD: 1650.00,
        varianceUSD: +240.00,
        variancePercent: +14.5,
        tag: "CALCULATION",
        notes: "Calculated from shift clock-in times (2.5h overtime due to changeover lag)."
      },
      {
        category: "Machine & Utilities Operating Cost",
        actualCostUSD: 1680.00,
        budgetCostUSD: 1450.00,
        varianceUSD: +230.00,
        variancePercent: +15.8,
        tag: "CALCULATION",
        notes: "Real-time energy meter kWh integration + compressed air duty cycle."
      },
      {
        category: "Downtime & Scrap Waste Cost Impact",
        actualCostUSD: 980.00,
        budgetCostUSD: 250.00,
        varianceUSD: +730.00,
        variancePercent: +292.0,
        tag: "CALCULATION",
        notes: "210 scrap bottles during speed calibration + 12-min micro-stops."
      },
      {
        category: "Facility Overhead Allocation",
        actualCostUSD: 620.00,
        budgetCostUSD: 620.00,
        varianceUSD: 0.00,
        variancePercent: 0.0,
        tag: "ESTIMATE",
        notes: "Standard monthly standard absorption coefficient."
      }
    ],
    aiCostOptimizations: [
      {
        insight: "Overtime labour cost on Line 1 can be reduced by 65% ($156/batch)",
        reason: "Staggering shift changeover 30 mins before sanitation completion eliminates idle operator waiting.",
        confidence: "94.2%",
        source: "Historical Shift Telemetry Engine",
        tag: "AI_RECOMMENDATION",
        recommendedAction: "Apply automated shift overlap scheduling in APS module."
      },
      {
        insight: "Packaging scrap variance anomaly detected on Capper CP-102",
        reason: "Chuck #4 torque micro-spikes causing 1.2% cap strip damage.",
        confidence: "91.0%",
        source: "MES Sensor Correlation AI",
        tag: "AI_RECOMMENDATION",
        recommendedAction: "Execute PM-SCH-004 torque recalibration."
      }
    ]
  }
};

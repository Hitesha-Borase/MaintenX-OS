// AI Decision Support & Predictive Insights Data
export const AI_AGENTS = [
  {
    id: "AGENT-PM-01",
    name: "Aegis Predictive Maintenance Agent",
    specialty: "Vibration FFT, Bearing Health & Thermal Anomaly Detection",
    status: "Active Monitoring",
    accuracyRating: "97.4%",
    telemetryPointsAnalyzed: 14200,
    lastInferenceTime: "Just now"
  },
  {
    id: "AGENT-MES-02",
    name: "Apex Production & Yield Optimizer",
    specialty: "Throughput Maximization, Speed Sync & Scrap Prevention",
    status: "Active Monitoring",
    accuracyRating: "95.8%",
    telemetryPointsAnalyzed: 28400,
    lastInferenceTime: "2 min ago"
  },
  {
    id: "AGENT-MRP-03",
    name: "Oracle Supply & Shortage Predictor",
    specialty: "Lead Time Drift, Stockout Forecasting & Supplier OTIF Analysis",
    status: "Active Monitoring",
    accuracyRating: "93.1%",
    telemetryPointsAnalyzed: 8900,
    lastInferenceTime: "5 min ago"
  }
];

export const PREDICTIVE_INSIGHTS = [
  {
    id: "INSIGHT-001",
    agent: "Aegis Predictive Maintenance Agent",
    type: "CRITICAL_ANOMALY",
    title: "Impending Bearing Race Spalling on Filler FM-001 Spindle",
    insight: "Vibration telemetry on Bearing #2 shows high-frequency crest factor increase from 2.8 to 5.4 over 72 hours. 89% probability of catastrophic seizure within 48 operating hours.",
    reason: "Acoustic emission energy spikes at 1,420 Hz matching outer race defect frequency (BPFO).",
    confidence: "96.8%",
    source: "Bearing Vibration Sensor FM001-ACC-02",
    tag: "AI_RECOMMENDATION", // FACT, CALCULATION, ESTIMATE, AI_RECOMMENDATION
    recommendedAction: "Schedule urgent bearing replacement during tonight's 22:00 shift changeover (estimated 2.5h duration).",
    approvalStatus: "Pending Maintenance Planner Approval",
    potentialSavingsUSD: 38500,
    linkedAsset: "FM-001"
  },
  {
    id: "INSIGHT-002",
    agent: "Apex Production & Yield Optimizer",
    type: "YIELD_OPTIMIZATION",
    title: "Line 1 Fill Speed Optimization to Reduce Overfill Giveaway",
    insight: "Reducing filler speed from 600 BPM to 585 BPM reduces dynamic liquid slosh, saving 2.4ml per bottle ($420/shift) without violating delivery SLA.",
    reason: "Coriolis mass flow correlation indicates 0.48% mean density aeration at > 590 BPM.",
    confidence: "92.4%",
    source: "Promass Mass Flowmeter INS-FM-012",
    tag: "AI_RECOMMENDATION",
    recommendedAction: "Apply automatic rate limiter profile on Line 1 PLC recipe.",
    approvalStatus: "Approved by Operations Supervisor",
    potentialSavingsUSD: 14200,
    linkedAsset: "FM-001"
  },
  {
    id: "INSIGHT-003",
    agent: "Oracle Supply & Shortage Predictor",
    type: "SUPPLY_SHORTAGE",
    title: "Ginger Root Extract Stockout Risk for Order PO-2026-905",
    insight: "Botanical Extracts shipment has a 78% probability of a 3-day customs clearance delay at Port of Entry.",
    reason: "Historical courier transit times from this origin during holiday weeks average +68 hours.",
    confidence: "88.5%",
    source: "Global Logistics Freight Telemetry API",
    tag: "AI_RECOMMENDATION",
    recommendedAction: "Switch secondary supply allocation to domestic supplier batch in Atlanta Hub.",
    approvalStatus: "Pending Purchasing Review",
    potentialSavingsUSD: 18000,
    linkedAsset: "MX-003"
  }
];

export const AI_QA_EXAMPLES = [
  {
    query: "Why did Line 2 trip during yesterday's night shift?",
    answer: "Line 2 experienced an emergency stop at 04:15 due to a rapid pressure drop on Pasteurizer HTST-300 Section 3. Telemetry indicates differential pressure plummeted from 9.8 bar to 7.4 bar in 4 seconds caused by an EPDM gasket rupture. Work Order WO-2026-0888 was auto-generated and technician David Kim was dispatched.",
    sources: ["Breakdown BD-2026-042", "Telemetry Log HT-105", "Work Order WO-2026-0888"],
    tag: "FACT"
  },
  {
    query: "What is the recommended PM interval for Filler FM-001 bearings?",
    answer: "Based on 14,820 runtime hours and vibration harmonic progression, the optimal greasing interval is 120 runtime hours (currently set at 168 hours). Reducing the interval is estimated to increase MTBF from 342 hours to 460 hours.",
    sources: ["Aegis Reliability AI Model v4.2", "Weibull Asset Distribution"],
    tag: "AI_RECOMMENDATION"
  }
];

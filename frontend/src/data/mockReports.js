// Reports Center Mock Templates & History
export const REPORT_TEMPLATES = [
  {
    id: "REP-OEE-SHIFT",
    name: "Shift OEE & Production Loss Waterfall Report",
    category: "Production",
    frequency: "Per Shift / Daily",
    description: "Detailed breakdown of Availability, Performance, Quality, micro-stops and planned vs unplanned downtime.",
    formats: ["PDF", "CSV", "Excel"],
    lastGenerated: "2026-08-31 06:00"
  },
  {
    id: "REP-CMMS-MTBF",
    name: "Monthly Asset Reliability & MTBF/MTTR Analytics",
    category: "Maintenance",
    frequency: "Monthly",
    description: "Equipment failure rate, Pareto of top breakdown root causes, repeat failures and maintenance spend vs budget.",
    formats: ["PDF", "CSV", "Excel"],
    lastGenerated: "2026-08-01 08:00"
  },
  {
    id: "REP-QMS-CCP",
    name: "HACCP Critical Control Point (CCP) Compliance Audit",
    category: "Quality",
    frequency: "Daily / Weekly",
    description: "Continuous temperature logs, seal integrity tests, hold logs, and Certificate of Analysis summary.",
    formats: ["PDF", "CSV"],
    lastGenerated: "2026-08-30 23:59"
  },
  {
    id: "REP-WMS-TRACE",
    name: "Batch 360° End-to-End Traceability & Material Genealogy",
    category: "Traceability",
    frequency: "On-Demand / Regulatory",
    description: "Multi-tier raw lot to customer shipment tree report with supplier CoA and process parameters.",
    formats: ["PDF", "CSV"],
    lastGenerated: "2026-08-28 14:15"
  },
  {
    id: "REP-FIN-VAR",
    name: "Manufacturing Cost Variance & Scrap Waste Report",
    category: "Costing",
    frequency: "Weekly",
    description: "Standard vs actual cost analysis with Fact, Calculation, and Estimate breakdown.",
    formats: ["PDF", "CSV", "Excel"],
    lastGenerated: "2026-08-29 17:00"
  }
];

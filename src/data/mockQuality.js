// Quality / QMS Mock Data
export const INITIAL_QUALITY_CHECKS = [
  {
    id: "QC-2026-1180",
    orderId: "PO-2026-904",
    batchId: "BAT-2026-0892",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    checkType: "In-Process CCP Inspection", // In-Process CCP Inspection, Incoming Raw Material, Pre-Op Sanitation, Finished Good QA Release
    samplePoint: "Fill Head #6 Discharge Conveyor",
    status: "PASS", // PASS, FAIL, HOLD, BLOCKED, RELEASED
    inspector: "QA Lead Sarah Jenkins",
    timestamp: "2026-08-31 08:30",
    parameters: [
      { name: "Brix Sugar Content", target: "11.8 ± 0.3 °Bx", actual: "11.9 °Bx", status: "PASS" },
      { name: "pH Value", target: "3.65 - 3.85 pH", actual: "3.72 pH", status: "PASS" },
      { name: "Seal Burst Pressure", target: "> 3.2 bar", actual: "3.9 bar", status: "PASS" },
      { name: "Net Weight / Volume", target: "500.0 ± 5.0 ml", actual: "502.4 ml", status: "PASS" },
      { name: "Headspace O2 Residual", target: "< 1.5%", actual: "0.9%", status: "PASS" }
    ],
    notes: "All organoleptic and microbiological rapid ATP swabs within Grade A spec."
  },
  {
    id: "QC-2026-1175",
    orderId: "PO-2026-905",
    batchId: "BAT-2026-0890",
    productName: "Artisan Ginger-Lime Concentrate Batch 5000L",
    checkType: "Deviation Investigation / Hold",
    samplePoint: "Pasteurizer Outlet Sample Port 2",
    status: "HOLD",
    inspector: "QA Specialist David Kim",
    timestamp: "2026-08-30 04:30",
    parameters: [
      { name: "Pasteurization HTST Temp", target: "88.0°C - 92.0°C", actual: "83.1°C", status: "FAIL" },
      { name: "Holding Time Retention", target: "15.0 sec", actual: "14.8 sec", status: "PASS" },
      { name: "Viscosity Index", target: "450 ± 20 cP", actual: "442 cP", status: "PASS" }
    ],
    notes: "Thermal excursion due to plate heat exchanger leak. 1,200 Liters placed on QA HOLD in Tank TK-04 pending microbiological incubation assay.",
    linkedDeviation: "DEV-2026-044",
    holdTag: "QA-HOLD-RED-908"
  },
  {
    id: "QC-2026-1160",
    orderId: "PO-2026-906",
    batchId: "BAT-2026-0885",
    productName: "Sparkling Yuzu Sparkling Tea 330ml Can",
    checkType: "Finished Good QA Release",
    samplePoint: "Pallet Infeed Finished Goods Bay",
    status: "RELEASED",
    inspector: "QA Director Elena Rostova",
    timestamp: "2026-08-30 23:15",
    parameters: [
      { name: "CO2 Carbonation Volume", target: "3.2 ± 0.2 vol", actual: "3.25 vol", status: "PASS" },
      { name: "Double Seam Overlap %", target: "> 55%", actual: "68%", status: "PASS" },
      { name: "Microbiological 24h Rapid Test", target: "0 CFU / 100ml", actual: "0 CFU", status: "PASS" }
    ],
    notes: "Batch passed 100% QA criteria. Certificate of Analysis (CoA) issued and published to ERP."
  }
];

export const DEVIATIONS_HOLDS = [
  {
    id: "DEV-2026-044",
    title: "Pasteurization Thermal Excursion below 88.0°C Limit",
    batchId: "BAT-2026-0890",
    holdQuantity: "1,200 Liters",
    tankOrPallet: "Tank TK-04 (Hygienic Buffer)",
    severity: "Critical - Food Safety CCP",
    status: "Active Investigation", // Active Investigation, QA Disposition Pending, Rework Authorized, Scrapped, Released
    discoveredDate: "2026-08-30 04:30",
    investigator: "QA Lead Sarah Jenkins",
    dispositionDueDate: "2026-09-01 12:00",
    occurrenceCause: "Plate pack heat exchanger gasket burst allowed cooling fluid pressure drop.",
    escapeCause: "In-line diversion divert-valve responded in 420ms, allowing 18 Liters under-processed juice into blend buffer.",
    correctiveActionSummary: "Repasteurize buffer blend after gasket replacement or scrap buffer if bio-assay indicates spore load."
  }
];

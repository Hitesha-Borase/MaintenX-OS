// Planning / APS / MRP Mock Data
export const INITIAL_PLANNING_ORDERS = [
  {
    id: "PLAN-2026-W36-01",
    customer: "Whole Foods Market Global",
    customerOrderNo: "CO-WF-99410",
    productCode: "SKU-AJ-500ML-ORG",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    demandQty: 48000,
    unit: "Bottles",
    plannedStartDate: "2026-09-01 06:00",
    plannedEndDate: "2026-09-02 18:00",
    line: "Line 1 (Aseptic Bottling)",
    status: "Published", // Draft, Validating, Published, Capacity Constrained, Shortage Alert
    priority: "P1",
    mrpShortages: [],
    capacityUtilization: 88.5,
    changeoverMinutes: 45
  },
  {
    id: "PLAN-2026-W36-02",
    customer: "Target Beverages Central",
    customerOrderNo: "CO-TG-38291",
    productCode: "SKU-CAN-330ML-LEM",
    productName: "Sparkling Yuzu Sparkling Tea 330ml Can",
    demandQty: 72000,
    unit: "Cans",
    plannedStartDate: "2026-09-02 07:00",
    plannedEndDate: "2026-09-03 21:00",
    line: "Line 3 (Canning Line)",
    status: "Published",
    priority: "P2",
    mrpShortages: [],
    capacityUtilization: 92.0,
    changeoverMinutes: 60
  },
  {
    id: "PLAN-2026-W36-03",
    customer: "Sprouts Farmers Market",
    customerOrderNo: "CO-SP-11029",
    productCode: "SKU-BLK-SYRUP-1000L",
    productName: "Artisan Ginger-Lime Concentrate Batch 5000L",
    demandQty: 10000,
    unit: "Liters",
    plannedStartDate: "2026-09-04 06:00",
    plannedEndDate: "2026-09-05 14:00",
    line: "Line 2 (Formulation & Blending)",
    status: "Shortage Alert",
    priority: "P1",
    mrpShortages: [
      { material: "Organic Ginger Root Extract Extract-G99", required: "450 kg", onHand: "120 kg", deficit: "330 kg", poDue: "2026-09-03" }
    ],
    capacityUtilization: 74.0,
    changeoverMinutes: 90
  }
];

export const MRP_ITEMS = [
  {
    itemCode: "RM-ORG-CONC",
    description: "Valencia Organic Orange Juice Concentrate 65° Brix",
    category: "Raw Material Ingredients",
    leadTimeDays: 5,
    currentStock: 4200,
    allocated: 2400,
    availableStock: 1800,
    projectedDemandNext14D: 6800,
    netDeficit: 5000,
    unit: "kg",
    status: "PO Required",
    supplier: "Citrus Valley Farms Co.",
    suggestedPoQty: 6000
  },
  {
    itemCode: "RM-GNG-EXT",
    description: "Organic Ginger Root Extract Fluid 20:1",
    category: "Raw Material Ingredients",
    leadTimeDays: 7,
    currentStock: 120,
    allocated: 450,
    availableStock: -330,
    projectedDemandNext14D: 600,
    netDeficit: 930,
    unit: "kg",
    status: "Critical Shortage",
    supplier: "Botanical Extracts International",
    suggestedPoQty: 1000
  },
  {
    itemCode: "PKG-PET-500",
    description: "500ml Multi-Layer Oxygen Barrier PET Bottles",
    category: "Packaging Materials",
    leadTimeDays: 3,
    currentStock: 85000,
    allocated: 48000,
    availableStock: 37000,
    projectedDemandNext14D: 96000,
    netDeficit: 59000,
    unit: "units",
    status: "PO In Transit (ETA Sep 1)",
    supplier: "Amcor Rigid Packaging",
    suggestedPoQty: 100000
  }
];

// Production / MES Mock Data
export const INITIAL_PRODUCTION_ORDERS = [
  {
    id: "PO-2026-904",
    orderNumber: "ORD-904-ASEPTIC-JUICE",
    productCode: "SKU-AJ-500ML-ORG",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    line: "Line 1 (Aseptic Bottling)",
    plant: "Plant 1 - North Facility",
    targetQuantity: 24000,
    producedQuantity: 18450,
    scrapQuantity: 210,
    reworkQuantity: 65,
    unit: "Bottles",
    status: "Running", // Scheduled, In Setup, Running, Paused, Completed, QA Hold
    startTime: "2026-08-31 06:00",
    estimatedEndTime: "2026-08-31 15:30",
    currentSpeedBPM: 580,
    targetSpeedBPM: 600,
    currentOEE: 86.4,
    availability: 91.2,
    performance: 96.6,
    qualityRate: 98.1,
    activeBatchId: "BAT-2026-0892",
    supervisor: "Thomas Sterling",
    leadOperator: "Elena Rostova",
    activeShift: "Shift A (06:00 - 14:30)",
    workInstructions: "SOP-PKG-042: High-Speed Aseptic Cold Fill & Nitrogen Flush Procedures v4.1"
  },
  {
    id: "PO-2026-905",
    orderNumber: "ORD-905-FORMULATION-BLEND",
    productCode: "SKU-BLK-SYRUP-1000L",
    productName: "Artisan Ginger-Lime Concentrate Batch 5000L",
    line: "Line 2 (Formulation & Blending)",
    plant: "Plant 1 - North Facility",
    targetQuantity: 5000,
    producedQuantity: 1200,
    scrapQuantity: 40,
    reworkQuantity: 0,
    unit: "Liters",
    status: "Paused - Equipment Breakdown",
    startTime: "2026-08-31 04:00",
    estimatedEndTime: "2026-08-31 18:00",
    currentSpeedBPM: 0,
    targetSpeedBPM: 1200, // L/hr
    currentOEE: 42.0,
    availability: 48.0,
    performance: 89.0,
    qualityRate: 98.2,
    activeBatchId: "BAT-2026-0890",
    supervisor: "Thomas Sterling",
    leadOperator: "Amina Al-Mansoor",
    activeShift: "Shift A (06:00 - 14:30)",
    workInstructions: "SOP-BLD-019: Thermal Pasteurization & Brix Stabilization v2.8"
  },
  {
    id: "PO-2026-906",
    orderNumber: "ORD-906-CAN-SPARKLING",
    productCode: "SKU-CAN-330ML-LEM",
    productName: "Sparkling Yuzu Sparkling Tea 330ml Can",
    line: "Line 3 (Canning Line)",
    plant: "Plant 2 - South Facility",
    targetQuantity: 36000,
    producedQuantity: 36000,
    scrapQuantity: 180,
    reworkQuantity: 20,
    unit: "Cans",
    status: "Completed",
    startTime: "2026-08-30 14:30",
    estimatedEndTime: "2026-08-30 22:30",
    currentSpeedBPM: 0,
    targetSpeedBPM: 750,
    currentOEE: 91.8,
    availability: 94.5,
    performance: 98.0,
    qualityRate: 99.1,
    activeBatchId: "BAT-2026-0885",
    supervisor: "Chloe Dupuis",
    leadOperator: "Liam Chen",
    activeShift: "Shift B (14:30 - 23:00)",
    workInstructions: "SOP-CAN-007: Seamer Double Seam Micron Inspection v3.0"
  }
];

export const INITIAL_BATCHES = [
  {
    id: "BAT-2026-0892",
    productionOrderId: "PO-2026-904",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    recipeId: "REC-ORANGE-ASEPTIC-v4",
    status: "Executing Step 4 of 6",
    progressPercent: 77,
    currentStep: "In-line Sterilization & Bottle Filling",
    rawMaterialLotsReserved: [
      { lotNo: "RM-LOT-ORG-4401", material: "Valencia Orange Concentrate", qty: "1,200 kg", verified: true },
      { lotNo: "RM-LOT-PUR-0092", material: "Demineralized Water Buffer", qty: "3,800 L", verified: true },
      { lotNo: "PKG-LOT-PET-8812", material: "500ml PET Barrier Bottles", qty: "24,500 units", verified: true },
      { lotNo: "PKG-LOT-CAP-3390", material: "38mm HDPE Tamper Evident Caps", qty: "24,500 units", verified: true }
    ],
    ccpChecks: [
      { ccp: "CCP-1: Pasteurization Temp", target: "88.0°C - 92.0°C", actual: "89.4°C", status: "PASS" },
      { ccp: "CCP-2: Fill Head Pressure", target: "4.2 - 4.8 bar", actual: "4.5 bar", status: "PASS" },
      { ccp: "CCP-3: Nitrogen Headspace Oxygen", target: "< 1.5% O2", actual: "0.8% O2", status: "PASS" }
    ],
    downtimeEvents: [
      { reason: "Micro-stop: Sensor glare", durationMin: 4, timestamp: "08:14" },
      { reason: "Cap sorter chute re-feed", durationMin: 8, timestamp: "09:45" }
    ]
  }
];

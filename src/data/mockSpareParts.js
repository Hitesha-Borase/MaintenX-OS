// Spare Parts Inventory
export const INITIAL_SPARE_PARTS = [
  {
    partNo: "BRG-6208-2RS",
    name: "Deep Groove Ball Bearing 6208-2RS (SKF)",
    category: "Bearings & Power Transmission",
    stock: 14,
    minStock: 6,
    reorderQty: 10,
    unitCost: 45.0,
    location: "Aisle 3 - Shelf B4",
    supplier: "SKF Industrial Direct",
    leadTimeDays: 3,
    linkedAssets: ["FM-001", "CP-102", "CV-301"],
    status: "In Stock"
  },
  {
    partNo: "GSK-EPDM-HT105",
    name: "Clip-on EPDM High-Temp Gasket Pack (50pk)",
    category: "Seals & Gaskets",
    stock: 1, // Low stock
    minStock: 3,
    reorderQty: 5,
    unitCost: 450.0,
    location: "Aisle 1 - Shelf A2",
    supplier: "Alfa Laval Parts Global",
    leadTimeDays: 7,
    linkedAssets: ["HT-105"],
    status: "Low Stock - Reorder Placed"
  },
  {
    partNo: "SL-VTON-45",
    name: "Viton Double Lip Shaft Seal 45x65x8mm",
    category: "Seals & Gaskets",
    stock: 18,
    minStock: 8,
    reorderQty: 15,
    unitCost: 18.5,
    location: "Aisle 1 - Bin 14",
    supplier: "Freudenberg Sealing Technologies",
    leadTimeDays: 4,
    linkedAssets: ["FM-001", "MX-003"],
    status: "In Stock"
  },
  {
    partNo: "VLV-SMC-SY31",
    name: "SMC 5/2 Solenoid Valve SY3120-5LZ-M5",
    category: "Pneumatics",
    stock: 7,
    minStock: 4,
    reorderQty: 8,
    unitCost: 65.0,
    location: "Aisle 4 - Drawer P09",
    supplier: "SMC Pneumatics Corp",
    leadTimeDays: 2,
    linkedAssets: ["PK-401", "FM-001", "LB-204"],
    status: "In Stock"
  },
  {
    partNo: "SEN-KEY-FSN",
    name: "Keyence Fiber Optic Amplifier Unit FS-N41N",
    category: "Instrumentation & Sensors",
    stock: 2,
    minStock: 4,
    reorderQty: 6,
    unitCost: 190.0,
    location: "Electronics Cage - Locker E2",
    supplier: "Keyence Automation",
    leadTimeDays: 5,
    linkedAssets: ["LB-204", "CP-102"],
    status: "Low Stock"
  },
  {
    partNo: "LUB-MOB-462",
    name: "Mobil SHC Polyrex 462 Grease Cartridge 390g",
    category: "Lubricants & Chemicals",
    stock: 35,
    minStock: 12,
    reorderQty: 24,
    unitCost: 22.0,
    location: "Flammable & Chemical Cabinet C1",
    supplier: "ExxonMobil Industrial Supply",
    leadTimeDays: 2,
    linkedAssets: ["FM-001", "CV-301", "CP-102", "MX-003", "PK-401"],
    status: "In Stock"
  },
  {
    partNo: "BLT-OPT-2400",
    name: "Optibelt High-Performance Timing Belt 2400-8M",
    category: "Belts & Drives",
    stock: 5,
    minStock: 2,
    reorderQty: 4,
    unitCost: 85.0,
    location: "Aisle 2 - Shelf C1",
    supplier: "Optibelt Power Transmission",
    leadTimeDays: 3,
    linkedAssets: ["FM-001", "CV-301"],
    status: "In Stock"
  },
  {
    partNo: "PLC-SIEM-S712",
    name: "Siemens SIMATIC S7-1200 CPU 1214C DC/DC/DC",
    category: "Automation & Controls",
    stock: 2,
    minStock: 1,
    reorderQty: 2,
    unitCost: 620.0,
    location: "Electronics Cage - Shelf A1",
    supplier: "Siemens Industry Mall",
    leadTimeDays: 14,
    linkedAssets: ["FM-001", "HT-105", "MX-003"],
    status: "In Stock"
  }
];

export const EQUIPMENT_BOMS = [
  {
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    subsystems: [
      {
        subsystem: "Main Drive & Spindle Assembly",
        parts: [
          { partNo: "BRG-6208-2RS", name: "Deep Groove Ball Bearing 6208-2RS", qtyPerAsset: 4, criticality: "High" },
          { partNo: "SL-VTON-45", name: "Viton Double Lip Shaft Seal 45x65x8mm", qtyPerAsset: 2, criticality: "Medium" },
          { partNo: "BLT-OPT-2400", name: "Optibelt High-Performance Timing Belt 2400-8M", qtyPerAsset: 1, criticality: "High" }
        ]
      },
      {
        subsystem: "Aseptic Filling Nozzle Carrousel",
        parts: [
          { partNo: "VLV-SMC-SY31", name: "SMC 5/2 Solenoid Valve SY3120", qtyPerAsset: 12, criticality: "Critical" },
          { partNo: "LUB-MOB-462", name: "Mobil SHC Polyrex 462 Grease", qtyPerAsset: 1, criticality: "Medium" }
        ]
      },
      {
        subsystem: "Control & Sensor Instrumentation",
        parts: [
          { partNo: "PLC-SIEM-S712", name: "Siemens S7-1200 CPU 1214C", qtyPerAsset: 1, criticality: "Critical" }
        ]
      }
    ]
  },
  {
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    subsystems: [
      {
        subsystem: "Thermal Plate Pack Assembly",
        parts: [
          { partNo: "GSK-EPDM-HT105", name: "Clip-on EPDM High-Temp Gasket Pack (50pk)", qtyPerAsset: 2, criticality: "Critical" }
        ]
      },
      {
        subsystem: "Pumping & Flow Regulation Loop",
        parts: [
          { partNo: "SL-VTON-45", name: "Viton Double Lip Shaft Seal 45x65x8mm", qtyPerAsset: 2, criticality: "High" },
          { partNo: "BRG-6208-2RS", name: "Deep Groove Ball Bearing 6208-2RS", qtyPerAsset: 2, criticality: "Medium" }
        ]
      }
    ]
  },
  {
    assetId: "CP-102",
    assetName: "Arol Capper Rotary Capping Machine",
    subsystems: [
      {
        subsystem: "Capping Chucks & Magnetic Clutches",
        parts: [
          { partNo: "BRG-6208-2RS", name: "Deep Groove Ball Bearing 6208-2RS", qtyPerAsset: 6, criticality: "High" },
          { partNo: "SEN-KEY-FSN", name: "Keyence Fiber Optic Amplifier Unit FS-N41N", qtyPerAsset: 2, criticality: "Medium" },
          { partNo: "LUB-MOB-462", name: "Mobil SHC Polyrex 462 Grease", qtyPerAsset: 1, criticality: "Low" }
        ]
      }
    ]
  },
  {
    assetId: "LB-204",
    assetName: "Krones Autocol Rotary Labeler",
    subsystems: [
      {
        subsystem: "Optical Inspection & Label Feed Station",
        parts: [
          { partNo: "SEN-KEY-FSN", name: "Keyence Fiber Optic Amplifier Unit FS-N41N", qtyPerAsset: 3, criticality: "Critical" },
          { partNo: "VLV-SMC-SY31", name: "SMC 5/2 Solenoid Valve SY3120", qtyPerAsset: 4, criticality: "High" }
        ]
      }
    ]
  }
];

export const INITIAL_PARTS_REQUESTS = [
  {
    id: "REQ-2026-031",
    partNo: "GSK-EPDM-HT105",
    partName: "Clip-on EPDM High-Temp Gasket Pack (50pk)",
    qtyRequested: 2,
    assetId: "HT-105",
    workOrderId: "WO-2026-0888",
    requestedBy: "David Kim",
    requestDate: "2026-08-30 05:15",
    status: "Approved", // Pending, Approved, Issued, Rejected
    urgency: "Emergency",
    notes: "Needed for urgent plate leak repair on Pasteurizer HTST-300."
  },
  {
    id: "REQ-2026-029",
    partNo: "BRG-6208-2RS",
    partName: "Deep Groove Ball Bearing 6208-2RS (SKF)",
    qtyRequested: 2,
    assetId: "FM-001",
    workOrderId: "WO-2026-0891",
    requestedBy: "Marcus Vance",
    requestDate: "2026-08-30 08:30",
    status: "Issued",
    urgency: "High",
    notes: "Main drive spindle overhaul."
  },
  {
    id: "REQ-2026-028",
    partNo: "SEN-KEY-FSN",
    partName: "Keyence Fiber Optic Amplifier Unit FS-N41N",
    qtyRequested: 1,
    assetId: "LB-204",
    workOrderId: "WO-2026-0860",
    requestedBy: "David Kim",
    requestDate: "2026-08-31 07:00",
    status: "Pending",
    urgency: "Medium",
    notes: "Spare backup for intermittent label presence sensor drift."
  }
];


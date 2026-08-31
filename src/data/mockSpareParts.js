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
  }
];

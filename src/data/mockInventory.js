// Inventory / WMS Mock Data
export const INITIAL_INVENTORY_LOTS = [
  {
    lotNumber: "LOT-RM-ORG-4401",
    materialCode: "RM-ORG-CONC",
    materialName: "Valencia Organic Orange Juice Concentrate 65° Brix",
    category: "Raw Material",
    quantity: 4200,
    unit: "kg",
    location: "Cold Storage Zone A - Rack R04-B2",
    supplier: "Citrus Valley Farms Co.",
    supplierLot: "CVF-2026-VAL-99",
    receivedDate: "2026-08-20",
    expiryDate: "2027-02-20",
    qaStatus: "Approved / Released", // Quarantine, Approved / Released, QA Hold, Blocked
    costPerUnitUSD: 4.80,
    barcode: "8902810044018"
  },
  {
    lotNumber: "LOT-RM-GNG-0092",
    materialCode: "RM-GNG-EXT",
    materialName: "Organic Ginger Root Extract Fluid 20:1",
    category: "Raw Material",
    quantity: 120,
    unit: "kg",
    location: "Ambient Storage Bay 2 - Bin G-12",
    supplier: "Botanical Extracts International",
    supplierLot: "BEI-EXT-G990",
    receivedDate: "2026-08-10",
    expiryDate: "2027-08-10",
    qaStatus: "Approved / Released",
    costPerUnitUSD: 38.50,
    barcode: "8902810000924"
  },
  {
    lotNumber: "LOT-PKG-PET-8812",
    materialCode: "PKG-PET-500",
    materialName: "500ml Multi-Layer Oxygen Barrier PET Bottles",
    category: "Packaging",
    quantity: 85000,
    unit: "units",
    location: "Warehouse Bay 3 - Racks P01-P06",
    supplier: "Amcor Rigid Packaging",
    supplierLot: "AMC-PET500-771",
    receivedDate: "2026-08-25",
    expiryDate: "2028-08-25",
    qaStatus: "Approved / Released",
    costPerUnitUSD: 0.14,
    barcode: "8902810088121"
  },
  {
    lotNumber: "LOT-FG-2026-0885",
    materialCode: "SKU-CAN-330ML-LEM",
    materialName: "Sparkling Yuzu Sparkling Tea 330ml Can (Finished Good)",
    category: "Finished Goods",
    quantity: 36000,
    unit: "Cans (1,500 Cases)",
    location: "Finished Goods High-Bay Warehouse - Bin FG-44",
    supplier: "Internal Plant 2 Canning",
    supplierLot: "BAT-2026-0885",
    receivedDate: "2026-08-30",
    expiryDate: "2027-08-30",
    qaStatus: "Approved / Released",
    costPerUnitUSD: 0.85,
    barcode: "8902810033019",
    palletsCount: 20
  }
];

export const WAREHOUSE_ZONES = [
  { id: "ZONE-COLD-A", name: "Cold Storage Zone A (+4°C)", capacity: 200, occupied: 142, temp: "3.8°C", status: "Optimal" },
  { id: "ZONE-AMB-B", name: "Ambient Raw Material Zone B", capacity: 500, occupied: 380, temp: "21.2°C", status: "Optimal" },
  { id: "ZONE-PKG-C", name: "Packaging High-Bay Zone C", capacity: 800, occupied: 690, temp: "22.0°C", status: "Optimal" },
  { id: "ZONE-FG-D", name: "Finished Goods Outbound Logistics Bay D", capacity: 600, occupied: 410, temp: "18.5°C", status: "Optimal" },
  { id: "ZONE-CHEM-E", name: "Hazardous & Lubricants Cabinet E", capacity: 50, occupied: 28, temp: "20.0°C", status: "Optimal" }
];

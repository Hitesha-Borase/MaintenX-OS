// Purchasing Mock Data
export const INITIAL_PURCHASE_ORDERS = [
  {
    poNumber: "PO-SUP-2026-441",
    supplierName: "Citrus Valley Farms Co.",
    supplierCode: "VND-CVF-01",
    orderDate: "2026-08-28",
    deliveryDueDate: "2026-09-02",
    totalAmountUSD: 28800.00,
    itemsCount: 2,
    status: "In Transit", // Draft, Submitted, Confirmed, In Transit, Received, Cancelled
    receivingStatus: "Pending Dock Arrival", // Pending, Dock Checked, Partially Received, Received Full, Cancelled
    buyer: "Alex Morgan (Procurement Lead)",
    priority: "High",
    lines: [
      { item: "Organic Valencia Orange Juice Concentrate 65° Brix", qty: "6,000 kg", unitPrice: 4.80, total: 28800.00 }
    ]
  },
  {
    poNumber: "PO-SUP-2026-438",
    supplierName: "Alfa Laval Parts Global",
    supplierCode: "VND-ALF-02",
    orderDate: "2026-08-30",
    deliveryDueDate: "2026-08-31",
    totalAmountUSD: 2250.00,
    itemsCount: 1,
    status: "Confirmed",
    receivingStatus: "Dock Inspected (Pre-Check)",
    buyer: "David Kim (Maintenance Lead)",
    priority: "Urgent P1",
    lines: [
      { item: "Clip-on EPDM High-Temp Gasket Pack (50pk)", qty: "5 packs", unitPrice: 450.00, total: 2250.00 }
    ]
  },
  {
    poNumber: "PO-SUP-2026-429",
    supplierName: "Amcor Rigid Packaging",
    supplierCode: "VND-AMC-03",
    orderDate: "2026-08-22",
    deliveryDueDate: "2026-08-29",
    totalAmountUSD: 14000.00,
    itemsCount: 1,
    status: "Received",
    receivingStatus: "Received Full (Put-Away Complete)",
    buyer: "Alex Morgan (Procurement Lead)",
    priority: "Standard",
    lines: [
      { item: "500ml Multi-Layer Oxygen Barrier PET Bottles", qty: "100,000 units", unitPrice: 0.14, total: 14000.00 }
    ]
  },
  {
    poNumber: "PO-SUP-2026-422",
    supplierName: "Ball Metal Beverage Packaging",
    supplierCode: "VND-BLL-04",
    orderDate: "2026-08-18",
    deliveryDueDate: "2026-08-25",
    totalAmountUSD: 13200.00,
    itemsCount: 1,
    status: "Received",
    receivingStatus: "Received Full (QA Released)",
    buyer: "Alex Morgan (Procurement Lead)",
    priority: "Standard",
    lines: [
      { item: "330ml Sleek Aluminum Cans w/ Matte Varnish", qty: "120,000 cans", unitPrice: 0.11, total: 13200.00 }
    ]
  },
  {
    poNumber: "PO-SUP-2026-415",
    supplierName: "Sugar Valley Refining Ltd.",
    supplierCode: "VND-SVR-05",
    orderDate: "2026-08-15",
    deliveryDueDate: "2026-08-22",
    totalAmountUSD: 6000.00,
    itemsCount: 1,
    status: "Received",
    receivingStatus: "Received Full (Silo Pumped)",
    buyer: "Elena Rostova (Batch Supervisor)",
    priority: "Standard",
    lines: [
      { item: "Non-GMO Liquid Cane Sugar 67.5° Brix", qty: "4,800 L", unitPrice: 1.25, total: 6000.00 }
    ]
  }
];

export const SUPPLIERS = [
  {
    id: "SUP-001",
    supplierCode: "VND-CVF-01",
    name: "Citrus Valley Farms Co.",
    category: "Raw Material Concentrate",
    materialsSupplied: "Valencia Orange Concentrate 65° Brix, Lime Puree, Essential Citrus Oils",
    status: "Active",
    otifScore: 98.2, // %
    qualityAcceptanceRate: 99.6,
    avgLeadTimeDays: 4.5,
    riskRating: "Low Risk",
    contactEmail: "orders@citrusvalleyfarms.com",
    contactPhone: "+1 (555) 349-8821",
    lastOrder: "2026-08-28 (PO-441)",
    openOrdersCount: 2,
    activeContractsCount: 3
  },
  {
    id: "SUP-002",
    supplierCode: "VND-AMC-03",
    name: "Amcor Rigid Packaging",
    category: "Packaging Containers",
    materialsSupplied: "500ml PET Bottles, 28mm Oxygen Barrier Caps, Shrink Bundling Films",
    status: "Active",
    otifScore: 96.5,
    qualityAcceptanceRate: 99.1,
    avgLeadTimeDays: 3.2,
    riskRating: "Low Risk",
    contactEmail: "orders@amcor.com",
    contactPhone: "+1 (555) 812-4409",
    lastOrder: "2026-08-22 (PO-429)",
    openOrdersCount: 1,
    activeContractsCount: 2
  },
  {
    id: "SUP-003",
    supplierCode: "VND-BEI-06",
    name: "Botanical Extracts International",
    category: "Specialty Flavors & Extracts",
    materialsSupplied: "Organic Yuzu Terpenes, Blood Orange Distillate, Ginger Root Oleoresin",
    status: "Active",
    otifScore: 88.0,
    qualityAcceptanceRate: 97.4,
    avgLeadTimeDays: 8.0,
    riskRating: "Medium Risk - Long Lead Time",
    contactEmail: "supply@botanicalextracts.com",
    contactPhone: "+1 (555) 902-1144",
    lastOrder: "2026-08-10 (PO-398)",
    openOrdersCount: 1,
    activeContractsCount: 1
  },
  {
    id: "SUP-004",
    supplierCode: "VND-BLL-04",
    name: "Ball Metal Beverage Packaging",
    category: "Packaging Cans",
    materialsSupplied: "330ml Sleek Cans (BPA-NI), 202 Dia CDL Can Ends w/ Gold Tab",
    status: "Active",
    otifScore: 99.1,
    qualityAcceptanceRate: 99.8,
    avgLeadTimeDays: 2.8,
    riskRating: "Low Risk",
    contactEmail: "orders@ballmetal.com",
    contactPhone: "+1 (555) 671-3302",
    lastOrder: "2026-08-18 (PO-422)",
    openOrdersCount: 1,
    activeContractsCount: 4
  },
  {
    id: "SUP-005",
    supplierCode: "VND-SVR-05",
    name: "Sugar Valley Refining Ltd.",
    category: "Sweeteners & Sugars",
    materialsSupplied: "Non-GMO Liquid Cane Sugar 67.5° Brix, Granulated Sucrose Grade A",
    status: "Active",
    otifScore: 97.5,
    qualityAcceptanceRate: 99.4,
    avgLeadTimeDays: 3.5,
    riskRating: "Low Risk",
    contactEmail: "dispatch@sugarvalley.com",
    contactPhone: "+1 (555) 438-7719",
    lastOrder: "2026-08-15 (PO-415)",
    openOrdersCount: 0,
    activeContractsCount: 2
  }
];


// Purchasing Mock Data
export const INITIAL_PURCHASE_ORDERS = [
  {
    poNumber: "PO-SUP-2026-441",
    supplierName: "Citrus Valley Farms Co.",
    orderDate: "2026-08-28",
    deliveryDueDate: "2026-09-02",
    totalAmountUSD: 28800.00,
    itemsCount: 2,
    status: "In Transit", // Draft, Submitted, Confirmed, In Transit, Received, QA Inspection, Closed
    buyer: "Purchasing Lead Alex Morgan",
    priority: "High",
    lines: [
      { item: "Organic Valencia Orange Juice Concentrate 65° Brix", qty: "6,000 kg", unitPrice: 4.80, total: 28800.00 }
    ]
  },
  {
    poNumber: "PO-SUP-2026-438",
    supplierName: "Alfa Laval Parts Global",
    orderDate: "2026-08-30",
    deliveryDueDate: "2026-08-31",
    totalAmountUSD: 2250.00,
    itemsCount: 1,
    status: "Expedited Freight",
    buyer: "Maintenance Planner David Kim",
    priority: "Urgent P1",
    lines: [
      { item: "Clip-on EPDM High-Temp Gasket Pack (50pk)", qty: "5 packs", unitPrice: 450.00, total: 2250.00 }
    ]
  },
  {
    poNumber: "PO-SUP-2026-429",
    supplierName: "Amcor Rigid Packaging",
    orderDate: "2026-08-22",
    deliveryDueDate: "2026-08-29",
    totalAmountUSD: 14000.00,
    itemsCount: 1,
    status: "Received",
    buyer: "Purchasing Lead Alex Morgan",
    priority: "Standard",
    lines: [
      { item: "500ml Multi-Layer Oxygen Barrier PET Bottles", qty: "100,000 units", unitPrice: 0.14, total: 14000.00 }
    ]
  }
];

export const SUPPLIERS = [
  {
    id: "SUP-001",
    name: "Citrus Valley Farms Co.",
    category: "Raw Material Concentrate",
    otifScore: 98.2, // %
    qualityAcceptanceRate: 99.6,
    avgLeadTimeDays: 4.5,
    riskRating: "Low Risk",
    contactEmail: "orders@citrusvalleyfarms.com",
    activeContractsCount: 3
  },
  {
    id: "SUP-002",
    name: "Amcor Rigid Packaging",
    category: "Packaging Containers",
    otifScore: 96.5,
    qualityAcceptanceRate: 99.1,
    avgLeadTimeDays: 3.2,
    riskRating: "Low Risk",
    contactEmail: "orders@amcor.com",
    activeContractsCount: 2
  },
  {
    id: "SUP-003",
    name: "Botanical Extracts International",
    category: "Specialty Flavors & Extracts",
    otifScore: 88.0,
    qualityAcceptanceRate: 97.4,
    avgLeadTimeDays: 8.0,
    riskRating: "Medium Risk - Long Lead Time",
    contactEmail: "supply@botanicalextracts.com",
    activeContractsCount: 1
  }
];

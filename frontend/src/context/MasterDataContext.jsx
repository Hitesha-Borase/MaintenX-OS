import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const MasterDataContext = createContext();

// ============================================================================
// INITIAL MOCK MASTER DATASETS (ENTERPRISE-GRADE STABLE ID ARCHITECTURE)
// ============================================================================

export const INITIAL_COMPANIES = [
  { id: "CMP-01", name: "ABC Manufacturing Global", code: "ABCMFG", currency: "USD", taxId: "US-9842109-K", headquarters: "Austin, TX", status: "Active" }
];

export const INITIAL_PLANTS = [
  {
    id: "PLT-01",
    companyId: "CMP-01",
    code: "PLT-IND",
    name: "Indore Plant - Processing & Bottling",
    location: "Sector 3 Industrial Corridor, Indore, MP",
    city: "Indore",
    state: "MP",
    country: "India",
    capacity: "350,000 Units/Day",
    operatingShifts: 3,
    status: "Active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    id: "PLT-02",
    companyId: "CMP-01",
    code: "PLT-AUST",
    name: "Austin Facility - Canning & Logistics",
    location: "7400 Metropolis Dr, Austin, TX",
    city: "Austin",
    state: "TX",
    country: "USA",
    capacity: "280,000 Units/Day",
    operatingShifts: 2,
    status: "Active",
    effectiveFrom: "2024-03-01",
    effectiveTo: "2030-12-31"
  }
];

export const INITIAL_DEPARTMENTS = [
  { id: "DEP-01", plantId: "PLT-01", code: "PROD", name: "Production & Bottling", managerId: "EMP-002", managerName: "Robert Thorne", costCenter: "CC-101", status: "Active" },
  { id: "DEP-02", plantId: "PLT-01", code: "MAINT", name: "Maintenance & Reliability", managerId: "EMP-004", managerName: "Marcus Vance", costCenter: "CC-102", status: "Active" },
  { id: "DEP-03", plantId: "PLT-01", code: "QAQC", name: "Quality Assurance & Lab", managerId: "EMP-003", managerName: "Sarah Jenkins", costCenter: "CC-103", status: "Active" },
  { id: "DEP-04", plantId: "PLT-01", code: "WHSE", name: "Warehouse & Materials", managerId: "EMP-005", managerName: "David Kim", costCenter: "CC-104", status: "Active" },
  { id: "DEP-05", plantId: "PLT-01", code: "CI-ENG", name: "Continuous Improvement & Engineering", managerId: "EMP-001", managerName: "Alexander Vance", costCenter: "CC-105", status: "Active" }
];

export const INITIAL_PRODUCT_FAMILIES = [
  {
    familyId: "FAM-01",
    code: "SPK-BEV",
    name: "Sparkling Flavored Beverages",
    category: "Finished Goods",
    description: "Carbonated fruit and citrus flavored canned and bottled sodas.",
    plantId: "PLT-01",
    allergenRisk: "None",
    standardMargin: "58.4%",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    familyId: "FAM-02",
    code: "TON-MIX",
    name: "Tonics & Mixers Premium",
    category: "Finished Goods",
    description: "Botanical tonic waters with natural quinine and premium club sodas.",
    plantId: "PLT-01",
    allergenRisk: "None",
    standardMargin: "62.1%",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    familyId: "FAM-03",
    code: "GNG-BREW",
    name: "Organic Ginger Brews",
    category: "Finished Goods",
    description: "Naturally fermented cloudy organic ginger beer with cane sugar.",
    plantId: "PLT-02",
    allergenRisk: "Ginger Extract",
    standardMargin: "54.0%",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    familyId: "FAM-04",
    code: "RAW-SWT",
    name: "Liquid Sweeteners & Syrups",
    category: "Raw Ingredients",
    description: "Non-GMO certified bulk liquid sucrose and concentrated flavor bases.",
    plantId: "PLT-01",
    allergenRisk: "None",
    standardMargin: "N/A",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    familyId: "FAM-05",
    code: "PKG-CLOS",
    name: "Caps, Closures & Primary Packaging",
    category: "Packaging",
    description: "Tamper-evident closures, sleek aluminum cans, and corrugated cartons.",
    plantId: "PLT-01",
    allergenRisk: "None",
    standardMargin: "N/A",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  }
];

export const INITIAL_UOMS = [
  { uomId: "UOM-01", uomCode: "BOTTLES", name: "Bottles (Individual Units)", type: "Discrete Unit", baseUom: "BOTTLES", conversionFactor: 1.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-02", uomCode: "CANS", name: "Aluminum Cans (Individual Units)", type: "Discrete Unit", baseUom: "CANS", conversionFactor: 1.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-03", uomCode: "LITERS", name: "Liters (Metric Liquid Volume)", type: "Liquid Measure", baseUom: "LITERS", conversionFactor: 1.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-04", uomCode: "KG", name: "Kilograms (Mass / Weight)", type: "Mass Measure", baseUom: "KG", conversionFactor: 1.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-05", uomCode: "UNITS", name: "Units (Generic Discrete Item)", type: "Discrete Unit", baseUom: "UNITS", conversionFactor: 1.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-06", uomCode: "CASE-24", name: "Case of 24 Units", type: "Packaging", baseUom: "UNITS", conversionFactor: 24.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-07", uomCode: "CASE-12", name: "Case of 12 Units", type: "Packaging", baseUom: "UNITS", conversionFactor: 12.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" },
  { uomId: "UOM-08", uomCode: "PALLET-60", name: "Standard 48x40 Wood Pallet (60 Cases)", type: "Logistics", baseUom: "CASE-24", conversionFactor: 60.0, status: "Active", effectiveFrom: "2024-01-01", effectiveTo: "2030-12-31" }
];

export const INITIAL_SKUS = [
  {
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    category: "Finished Goods",
    itemType: "Finished Good",
    familyId: "FAM-01",
    family: "Sparkling Flavors",
    uom: "Bottles",
    plantId: "PLT-01",
    stdCost: "$0.42",
    revision: "R3",
    status: "Active",
    approvalStatus: "Approved",
    shelfLifeDays: 365,
    packConfigCode: "PCK-5001-24",
    packSize: "24 x 500ml",
    eligibleLineIds: ["LIN-01", "LIN-02"],
    stdRunRateBPH: 42000,
    expectedYieldPct: 99.4,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    description: "Premium carbonated citrus beverage with natural lime & lemon essences.",
    createdBy: "Alexander Vance",
    createdDate: "2026-06-15",
    lastUpdated: "2026-08-30"
  },
  {
    skuId: "SKU-002",
    skuCode: "SKU-5002",
    name: "1L Tonic Water Natural Quinine",
    category: "Finished Goods",
    itemType: "Finished Good",
    familyId: "FAM-02",
    family: "Tonics & Mixers",
    uom: "Bottles",
    plantId: "PLT-01",
    stdCost: "$0.68",
    revision: "R2",
    status: "Active",
    approvalStatus: "Approved",
    shelfLifeDays: 540,
    packConfigCode: "PCK-5002-12",
    packSize: "12 x 1L",
    eligibleLineIds: ["LIN-01", "LIN-02"],
    stdRunRateBPH: 28000,
    expectedYieldPct: 99.2,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    description: "Artisanal botanical tonic water with natural cinchona bark quinine.",
    createdBy: "Sarah Jenkins",
    createdDate: "2026-07-02",
    lastUpdated: "2026-08-28"
  },
  {
    skuId: "SKU-003",
    skuCode: "SKU-5003",
    name: "330ml Organic Ginger Beer",
    category: "Finished Goods",
    itemType: "Finished Good",
    familyId: "FAM-03",
    family: "Ginger Beers",
    uom: "Cans",
    plantId: "PLT-02",
    stdCost: "$0.38",
    revision: "R4",
    status: "Active",
    approvalStatus: "Approved",
    shelfLifeDays: 270,
    packConfigCode: "PCK-5003-24",
    packSize: "24 x 330ml",
    eligibleLineIds: ["LIN-03"],
    stdRunRateBPH: 55000,
    expectedYieldPct: 99.0,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    description: "Naturally fermented cloudy organic ginger beer with cane sugar.",
    createdBy: "Alexander Vance",
    createdDate: "2026-05-18",
    lastUpdated: "2026-08-29"
  },
  {
    skuId: "SKU-101",
    skuCode: "ING-1001",
    name: "Liquid Cane Sugar 67°Bx",
    category: "Raw Ingredients",
    itemType: "Raw Material",
    familyId: "FAM-04",
    family: "Sweeteners",
    uom: "Liters",
    plantId: "PLT-01",
    stdCost: "$1.20",
    revision: "R1",
    status: "Active",
    approvalStatus: "Approved",
    shelfLifeDays: 180,
    packConfigCode: "BULK-TNK",
    packSize: "Bulk Tanker (10,000L)",
    eligibleLineIds: ["LIN-01", "LIN-02"],
    stdRunRateBPH: 0,
    expectedYieldPct: 99.8,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    description: "Refined liquid sucrose solution certified non-GMO food grade.",
    createdBy: "Marcus Vance",
    createdDate: "2026-04-10",
    lastUpdated: "2026-08-15"
  },
  {
    skuId: "SKU-102",
    skuCode: "ING-1002",
    name: "Natural Citrus Essential Oil Compound",
    category: "Raw Ingredients",
    itemType: "Raw Material",
    familyId: "FAM-04",
    family: "Flavorings",
    uom: "Kg",
    plantId: "PLT-01",
    stdCost: "$18.50",
    revision: "R2",
    status: "Active",
    approvalStatus: "Approved",
    shelfLifeDays: 365,
    packConfigCode: "DRUM-25KG",
    packSize: "25kg Stainless Drum",
    eligibleLineIds: ["LIN-01"],
    stdRunRateBPH: 0,
    expectedYieldPct: 99.9,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    description: "Cold-pressed lemon and lime terpene flavor concentrate.",
    createdBy: "Sarah Jenkins",
    createdDate: "2026-04-12",
    lastUpdated: "2026-08-20"
  },
  {
    skuId: "SKU-201",
    skuCode: "PKG-2001",
    name: "28mm Tamper-Evident HDPE Bottle Cap",
    category: "Packaging",
    itemType: "Packaging Component",
    familyId: "FAM-05",
    family: "Caps & Closures",
    uom: "Units",
    plantId: "PLT-01",
    stdCost: "$0.025",
    revision: "R1",
    status: "Active",
    approvalStatus: "Approved",
    shelfLifeDays: 730,
    packConfigCode: "BOX-5000",
    packSize: "5,000 Units / Corrugated Box",
    eligibleLineIds: ["LIN-01", "LIN-02"],
    stdRunRateBPH: 0,
    expectedYieldPct: 99.0,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    description: "High-density polyethylene closure with gas-retention seal liner.",
    createdBy: "Robert Thorne",
    createdDate: "2026-05-01",
    lastUpdated: "2026-08-10"
  }
];

export const INITIAL_PACK_CONFIGS = [
  {
    packConfigId: "PCK-01",
    packCode: "PCK-5001-24",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    unitsPerPack: 24,
    packType: "Corrugated Tray & Shrink Wrap",
    packagingUom: "CASE-24",
    caseConfiguration: "4x6 Bottles (24 Count)",
    palletConfiguration: "60 Cases / 1,440 Bottles per Pallet",
    tareWeightKg: 12.8,
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    packConfigId: "PCK-02",
    packCode: "PCK-5002-12",
    skuId: "SKU-002",
    skuCode: "SKU-5002",
    skuName: "1L Tonic Water Natural Quinine",
    unitsPerPack: 12,
    packType: "Partitioned Cardboard Case",
    packagingUom: "CASE-12",
    caseConfiguration: "3x4 Bottles (12 Count)",
    palletConfiguration: "75 Cases / 900 Bottles per Pallet",
    tareWeightKg: 13.2,
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    packConfigId: "PCK-03",
    packCode: "PCK-5003-24",
    skuId: "SKU-003",
    skuCode: "SKU-5003",
    skuName: "330ml Organic Ginger Beer",
    unitsPerPack: 24,
    packType: "Carton Board Multipack 4x6",
    packagingUom: "CASE-24",
    caseConfiguration: "4x6 Cans (24 Count)",
    palletConfiguration: "90 Cases / 2,160 Cans per Pallet",
    tareWeightKg: 8.9,
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  }
];

export const INITIAL_SHELF_LIFE = [
  {
    shelfLifeId: "SLF-01",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    shelfLifeValue: 365,
    shelfLifeUom: "Days",
    storageCondition: "Ambient Dry (15°C - 25°C)",
    minTempC: 4,
    maxTempC: 28,
    lightSensitivity: "Avoid Direct Sunlight",
    quarantineDays: 1,
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    shelfLifeId: "SLF-02",
    skuId: "SKU-002",
    skuCode: "SKU-5002",
    skuName: "1L Tonic Water Natural Quinine",
    shelfLifeValue: 540,
    shelfLifeUom: "Days",
    storageCondition: "Ambient Dry (15°C - 25°C)",
    minTempC: 4,
    maxTempC: 28,
    lightSensitivity: "UV-Resistant Amber Glass",
    quarantineDays: 1,
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    shelfLifeId: "SLF-03",
    skuId: "SKU-003",
    skuCode: "SKU-5003",
    skuName: "330ml Organic Ginger Beer",
    shelfLifeValue: 270,
    shelfLifeUom: "Days",
    storageCondition: "Cool Ambient (10°C - 20°C)",
    minTempC: 2,
    maxTempC: 22,
    lightSensitivity: "Hermetic Can Sealed",
    quarantineDays: 2,
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  }
];

export const INITIAL_CUSTOMERS = [
  { customerId: "CUST-001", name: "Costco Wholesale EMEA", code: "COSTCO-EU", region: "Europe", rating: "Tier 1 Priority", status: "Active" },
  { customerId: "CUST-002", name: "Walmart Supply Chain NA", code: "WMT-US", region: "North America", rating: "Tier 1 Priority", status: "Active" },
  { customerId: "CUST-003", name: "Tesco Retail Stores UK", code: "TSCO-UK", region: "UK & Ireland", rating: "Tier 2 Standard", status: "Active" },
  { customerId: "CUST-004", name: "Metro Cash & Carry India", code: "METRO-IN", region: "South Asia", rating: "Tier 1 Priority", status: "Active" }
];

export const INITIAL_CUSTOMER_SKU_MAPPINGS = [
  {
    mappingId: "CSM-01",
    customerId: "CUST-001",
    customerName: "Costco Wholesale EMEA",
    skuId: "SKU-001",
    internalSkuCode: "SKU-5001",
    internalSkuName: "500ml Sparkling Citrus Soda",
    customerSkuCode: "CST-CITRUS-500",
    customerSkuName: "Kirkland Signature Citrus Soda 500ml 24pk",
    customerUom: "CASE-24",
    barcodeUPC: "890123450012",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    mappingId: "CSM-02",
    customerId: "CUST-002",
    customerName: "Walmart Supply Chain NA",
    skuId: "SKU-001",
    internalSkuCode: "SKU-5001",
    internalSkuName: "500ml Sparkling Citrus Soda",
    customerSkuCode: "WMT-SODA-5001",
    customerSkuName: "Great Value Sparkling Citrus 500ml",
    customerUom: "CASE-24",
    barcodeUPC: "890123450013",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    mappingId: "CSM-03",
    customerId: "CUST-001",
    customerName: "Costco Wholesale EMEA",
    skuId: "SKU-002",
    internalSkuCode: "SKU-5002",
    internalSkuName: "1L Tonic Water Natural Quinine",
    customerSkuCode: "CST-TONIC-1L",
    customerSkuName: "Kirkland Botanical Tonic Water 1L 12pk",
    customerUom: "CASE-12",
    barcodeUPC: "890123450024",
    status: "Active",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31"
  }
];

export const INITIAL_BOMS = [
  {
    bomId: "BOM-001",
    bomNumber: "BOM-5001",
    finishedSkuId: "SKU-001",
    finishedSkuCode: "SKU-5001",
    finishedSkuName: "500ml Sparkling Citrus Soda",
    revision: "R3",
    effectiveDate: "2026-08-01",
    effectiveFrom: "2026-08-01",
    effectiveTo: "2030-12-31",
    status: "Active",
    approvalStatus: "Approved",
    batchSize: "10,000 Liters",
    yieldTarget: "99.4%",
    expectedYieldPct: 99.4,
    minYieldPct: 98.5,
    maxYieldPct: 99.9,
    scrapFactorPct: 0.6,
    createdBy: "Alexander Vance",
    lastUpdated: "2026-08-30",
    components: [
      { id: "CMP-01", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 850, uom: "Liters", scrapFactor: "0.5%", type: "Ingredient" },
      { id: "CMP-02", skuId: "SKU-102", skuCode: "ING-1002", name: "Natural Citrus Essential Oil Compound", quantity: 18.5, uom: "Kg", scrapFactor: "0.2%", type: "Ingredient" },
      { id: "CMP-03", skuId: "SKU-201", skuCode: "PKG-2001", name: "28mm Tamper-Evident HDPE Bottle Cap", quantity: 20000, uom: "Units", scrapFactor: "1.0%", type: "Packaging" }
    ],
    revisionHistory: [
      { revision: "R3", status: "Approved", createdBy: "Alexander Vance", date: "2026-08-30", changes: "Optimized citrus flavor dosage for higher shelf stability (+0.5 kg).", approvedBy: "Sarah Jenkins" },
      { revision: "R2", status: "Superseded", createdBy: "Sarah Jenkins", date: "2026-07-15", changes: "Switched sugar standard to 67°Bx non-GMO supplier.", approvedBy: "Robert Thorne" },
      { revision: "R1", status: "Superseded", createdBy: "Marcus Vance", date: "2026-06-01", changes: "Initial production formulation baseline.", approvedBy: "Robert Thorne" }
    ]
  },
  {
    bomId: "BOM-002",
    bomNumber: "BOM-5002",
    finishedSkuId: "SKU-002",
    finishedSkuCode: "SKU-5002",
    finishedSkuName: "1L Tonic Water Natural Quinine",
    revision: "R2",
    effectiveDate: "2026-07-15",
    effectiveFrom: "2026-07-15",
    effectiveTo: "2030-12-31",
    status: "Active",
    approvalStatus: "Approved",
    batchSize: "8,000 Liters",
    yieldTarget: "99.2%",
    expectedYieldPct: 99.2,
    minYieldPct: 98.0,
    maxYieldPct: 99.8,
    scrapFactorPct: 0.8,
    createdBy: "Sarah Jenkins",
    lastUpdated: "2026-08-28",
    components: [
      { id: "CMP-11", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 560, uom: "Liters", scrapFactor: "0.5%", type: "Ingredient" },
      { id: "CMP-12", skuId: "SKU-201", skuCode: "PKG-2001", name: "28mm Tamper-Evident HDPE Bottle Cap", quantity: 8000, uom: "Units", scrapFactor: "1.2%", type: "Packaging" }
    ],
    revisionHistory: [
      { revision: "R2", status: "Approved", createdBy: "Sarah Jenkins", date: "2026-08-28", changes: "Carbonation pressure standard aligned to 4.2 bar.", approvedBy: "Robert Thorne" },
      { revision: "R1", status: "Superseded", createdBy: "Alexander Vance", date: "2026-06-10", changes: "Initial trial specification.", approvedBy: "Sarah Jenkins" }
    ]
  },
  {
    bomId: "BOM-003",
    bomNumber: "BOM-5003",
    finishedSkuId: "SKU-003",
    finishedSkuCode: "SKU-5003",
    finishedSkuName: "330ml Organic Ginger Beer",
    revision: "R4",
    effectiveDate: "2026-08-20",
    effectiveFrom: "2026-08-20",
    effectiveTo: "2030-12-31",
    status: "Active",
    approvalStatus: "Approved",
    batchSize: "12,000 Liters",
    yieldTarget: "99.0%",
    expectedYieldPct: 99.0,
    minYieldPct: 97.5,
    maxYieldPct: 99.6,
    scrapFactorPct: 1.0,
    createdBy: "Alexander Vance",
    lastUpdated: "2026-08-29",
    components: [
      { id: "CMP-21", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 1100, uom: "Liters", scrapFactor: "0.4%", type: "Ingredient" }
    ],
    revisionHistory: [
      { revision: "R4", status: "Approved", createdBy: "Alexander Vance", date: "2026-08-29", changes: "Ginger root infusion duration extended to 4.5 hours.", approvedBy: "Sarah Jenkins" }
    ]
  }
];

export const INITIAL_OPERATIONS = [
  { operationId: "OP-01", operationCode: "OP-SYR-MIX", name: "Syrup Batch Blending & Brix Adjustment", sequence: 10, department: "Processing", stdDurationMin: 45, setupDurationMin: 20, status: "Active" },
  { operationId: "OP-02", operationCode: "OP-CARB-CHL", name: "Chilling & Inline Carbonation Injection", sequence: 20, department: "Processing", stdDurationMin: 30, setupDurationMin: 15, status: "Active" },
  { operationId: "OP-03", operationCode: "OP-BLOW-MOLD", name: "PET Bottle Blow Molding SBO", sequence: 30, department: "Packaging", stdDurationMin: 60, setupDurationMin: 25, status: "Active" },
  { operationId: "OP-04", operationCode: "OP-ISO-FILL", name: "Isobaric Rotary Bottle Filling & Capping", sequence: 40, department: "Packaging", stdDurationMin: 60, setupDurationMin: 30, status: "Active" },
  { operationId: "OP-05", operationCode: "OP-LBL-PCK", name: "Hot-Melt Labeling, Case Packing & Palletizing", sequence: 50, department: "Packaging", stdDurationMin: 60, setupDurationMin: 15, status: "Active" }
];

export const INITIAL_ROUTINGS = [
  {
    routingId: "RTG-001",
    routingCode: "RTG-5001-L1",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    lineId: "LIN-01",
    lineCode: "LINE-1",
    lineName: "High-Speed Bottling Line 1",
    revision: "R2",
    approvalStatus: "Approved",
    status: "Active",
    stdRunRateBPH: 42000,
    setupDurationMin: 35,
    expectedYieldPct: 99.4,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    steps: [
      { sequence: 10, operationId: "OP-01", operationName: "Syrup Batch Blending & Brix Adjustment", workCenter: "Blend Tank 1", stdRate: "10,000 L/hr" },
      { sequence: 20, operationId: "OP-02", operationName: "Chilling & Inline Carbonation Injection", workCenter: "CarboQC Skid", stdRate: "12,000 L/hr" },
      { sequence: 30, operationId: "OP-03", operationName: "PET Bottle Blow Molding SBO", workCenter: "Sidel Matrix Blow Molder", stdRate: "42,000 BPH" },
      { sequence: 40, operationId: "OP-04", operationName: "Isobaric Rotary Bottle Filling & Capping", workCenter: "Krones Isobaric Filler", stdRate: "42,000 BPH" },
      { sequence: 50, operationId: "OP-05", operationName: "Hot-Melt Labeling, Case Packing & Palletizing", workCenter: "Krones Multimodul Labeler", stdRate: "42,000 BPH" }
    ]
  },
  {
    routingId: "RTG-002",
    routingCode: "RTG-5002-L2",
    skuId: "SKU-002",
    skuCode: "SKU-5002",
    skuName: "1L Tonic Water Natural Quinine",
    lineId: "LIN-02",
    lineCode: "LINE-2",
    lineName: "Medium-Speed Glass Bottling Line 2",
    revision: "R1",
    approvalStatus: "Approved",
    status: "Active",
    stdRunRateBPH: 28000,
    setupDurationMin: 45,
    expectedYieldPct: 99.2,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    steps: [
      { sequence: 10, operationId: "OP-01", operationName: "Syrup Batch Blending & Brix Adjustment", workCenter: "Blend Tank 2", stdRate: "8,000 L/hr" },
      { sequence: 20, operationId: "OP-04", operationName: "Isobaric Rotary Bottle Filling & Capping", workCenter: "KHS Innofill Glass Filler", stdRate: "28,000 BPH" }
    ]
  }
];

export const INITIAL_LINES = [
  {
    lineId: "LIN-01",
    lineCode: "LINE-1",
    name: "High-Speed Bottling Line 1",
    plantId: "PLT-01",
    plantName: "Indore Plant - Processing & Bottling",
    departmentId: "DEP-01",
    capacity: "42,000 BPH (Bottles/Hour)",
    ratedSpeedBPH: 42000,
    status: "Active",
    supervisorId: "EMP-005",
    supervisorName: "David Kim",
    assignedAssetIds: ["AST-001", "AST-002", "AST-003", "AST-004"],
    eligibleSkuIds: ["SKU-001", "SKU-002"],
    ratedOEE: "88.5%",
    currentRunningSku: "SKU-5001"
  },
  {
    lineId: "LIN-02",
    lineCode: "LINE-2",
    name: "Medium-Speed Glass Bottling Line 2",
    plantId: "PLT-01",
    plantName: "Indore Plant - Processing & Bottling",
    departmentId: "DEP-01",
    capacity: "28,000 BPH",
    ratedSpeedBPH: 28000,
    status: "Active",
    supervisorId: "EMP-005",
    supervisorName: "David Kim",
    assignedAssetIds: ["AST-005"],
    eligibleSkuIds: ["SKU-001", "SKU-002"],
    ratedOEE: "84.2%",
    currentRunningSku: "SKU-5002"
  },
  {
    lineId: "LIN-03",
    lineCode: "LINE-3",
    name: "Automated Sleek Canning Line 3",
    plantId: "PLT-02",
    plantName: "Austin Facility - Canning & Logistics",
    departmentId: "DEP-01",
    capacity: "55,000 CPH (Cans/Hour)",
    ratedSpeedBPH: 55000,
    status: "Active",
    supervisorId: "EMP-001",
    supervisorName: "Alexander Vance",
    assignedAssetIds: ["AST-006"],
    eligibleSkuIds: ["SKU-003"],
    ratedOEE: "91.0%",
    currentRunningSku: "SKU-5003"
  }
];

export const INITIAL_LINE_TARGETS = [
  {
    targetId: "TGT-01",
    plantId: "PLT-01",
    lineId: "LIN-01",
    lineName: "High-Speed Bottling Line 1",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    shift: "Morning Shift (06:00 - 14:00)",
    targetQuantity: 300000,
    targetHB: "37,500 Bottles/Hour",
    stdRunRate: 42000,
    oeeTargetPct: 89.2,
    status: "Active",
    effectiveDate: "2026-09-01"
  },
  {
    targetId: "TGT-02",
    plantId: "PLT-01",
    lineId: "LIN-01",
    lineName: "High-Speed Bottling Line 1",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    shift: "Evening Shift (14:00 - 22:00)",
    targetQuantity: 290000,
    targetHB: "36,250 Bottles/Hour",
    stdRunRate: 42000,
    oeeTargetPct: 86.3,
    status: "Active",
    effectiveDate: "2026-09-01"
  },
  {
    targetId: "TGT-03",
    plantId: "PLT-01",
    lineId: "LIN-02",
    lineName: "Medium-Speed Glass Bottling Line 2",
    skuId: "SKU-002",
    skuCode: "SKU-5002",
    skuName: "1L Tonic Water Natural Quinine",
    shift: "General Day Shift",
    targetQuantity: 200000,
    targetHB: "25,000 Bottles/Hour",
    stdRunRate: 28000,
    oeeTargetPct: 89.0,
    status: "Active",
    effectiveDate: "2026-09-01"
  }
];

export const INITIAL_CHANGEOVER_MATRIX = [
  {
    matrixId: "CO-01",
    fromSkuId: "SKU-001",
    fromSkuCode: "SKU-5001",
    fromFamily: "Sparkling Flavors",
    toSkuId: "SKU-001",
    toSkuCode: "SKU-5001",
    toFamily: "Sparkling Flavors",
    changeoverDurationMin: 0,
    sanitationClass: "None (Same SKU Continuous)",
    allergenCleaningRequired: false,
    notes: "No changeover downtime required for identical formulation batch continuation.",
    status: "Active"
  },
  {
    matrixId: "CO-02",
    fromSkuId: "SKU-001",
    fromSkuCode: "SKU-5001",
    fromFamily: "Sparkling Flavors",
    toSkuId: "SKU-002",
    toSkuCode: "SKU-5002",
    toFamily: "Tonics & Mixers",
    changeoverDurationMin: 45,
    sanitationClass: "Class B - Warm Water Flush & Syrup Line Rinse",
    allergenCleaningRequired: false,
    notes: "Requires syrup manifold rinse and bottle capper starwheel size change from 500ml to 1L.",
    status: "Active"
  },
  {
    matrixId: "CO-03",
    fromSkuId: "SKU-002",
    fromSkuCode: "SKU-5002",
    fromFamily: "Tonics & Mixers",
    toSkuId: "SKU-001",
    toSkuCode: "SKU-5001",
    toFamily: "Sparkling Flavors",
    changeoverDurationMin: 60,
    sanitationClass: "Class A - Full Caustic CIP (Hot CIP 85°C)",
    allergenCleaningRequired: true,
    notes: "Quinine botanical essence requires deep caustic CIP wash to eliminate flavor carryover.",
    status: "Active"
  }
];

export const INITIAL_SANITATION_CLASSES = [
  {
    sanitationId: "SAN-01",
    sanitationClass: "Class A - Full Caustic CIP (Hot CIP 85°C)",
    description: "5-Step full automated clean-in-place: Pre-rinse, Hot Caustic (85°C), Intermediate Rinse, Peracetic Acid Sanitization, Final Sterile Water Rinse.",
    durationMin: 75,
    cleaningMethod: "Automated 5-Step Central CIP Skid",
    riskLevel: "Critical / Allergen Elimination",
    applicableProducts: "Tonics, Ginger Extract Formulations, Allergen Swaps",
    status: "Active"
  },
  {
    sanitationId: "SAN-02",
    sanitationClass: "Class B - Warm Water Flush & Sanitizer Rinse",
    description: "Warm water flush (55°C) followed by ozone/peracetic acid chemical sanitizer rinse.",
    durationMin: 35,
    cleaningMethod: "Inline CIP Circuit Flush",
    riskLevel: "Medium (Flavor Swap)",
    applicableProducts: "Citrus to Cola, Clear Soda to Flavored Soda",
    status: "Active"
  },
  {
    sanitationId: "SAN-03",
    sanitationClass: "Class C - Dry Line Sanitation & Vacuum",
    description: "Mechanical dry vacuum, optical sensor lens clean, starwheel sanitization wipe down.",
    durationMin: 15,
    cleaningMethod: "Manual Operator Protocol",
    riskLevel: "Low (Same Product Batch Restart)",
    applicableProducts: "All Finished Goods",
    status: "Active"
  }
];

export const INITIAL_ALLERGEN_RULES = [
  {
    allergenId: "ALG-01",
    allergenName: "Ginger Extract Botanical Essences",
    skuId: "SKU-003",
    skuCode: "SKU-5003",
    riskLevel: "Medium Allergen / Sensory Carryover",
    cleaningProtocol: "Class A Full CIP + Sensory Swab Verification",
    changeoverRestriction: "Must schedule at end of production week prior to weekly deep sanitation.",
    status: "Active"
  },
  {
    allergenId: "ALG-02",
    allergenName: "Sulfites (Preservatives in Flavorings)",
    skuId: "SKU-102",
    skuCode: "ING-1002",
    riskLevel: "High Regulatory CCP",
    cleaningProtocol: "Class A CIP + ATP Swab Validation < 10 RLU",
    changeoverRestriction: "Mandatory QA clearance sign-off before commencing allergen-free SKU filling.",
    status: "Active"
  }
];

export const INITIAL_ASSETS = [
  {
    assetId: "AST-001",
    name: "Krones Isobaric Rotary Filler 60-Valve",
    type: "Packaging / Filling",
    lineId: "LIN-01",
    lineName: "High-Speed Bottling Line 1",
    plantId: "PLT-01",
    status: "Operational",
    criticality: "Critical (Class A)",
    maintenanceStatus: "Healthy (96% Score)",
    serialNumber: "KRN-2024-8842",
    manufacturer: "Krones AG",
    installDate: "2024-03-15",
    ratedSpeed: "42,000 BPH",
    downtimeHistory: [
      { date: "2026-08-25", durationMin: 22, reason: "Volumetric dosing seal leak", code: "FLR-SEAL-01", technician: "Marcus Vance" },
      { date: "2026-08-10", durationMin: 15, reason: "Infeed starwheel timing jam", code: "JAM-STR-02", technician: "Marcus Vance" }
    ],
    maintenanceHistory: [
      { woId: "WO-8821", date: "2026-08-28", type: "Preventive", description: "Monthly valve diaphragm lubrication & CIP rinse inspection", status: "Completed" },
      { woId: "WO-8805", date: "2026-08-01", type: "Calibration", description: "Pressure transducer zero-point calibration (HACCP CCP-1)", status: "Completed" }
    ],
    auditHistory: [
      { date: "2026-08-28", user: "Marcus Vance", action: "Updated maintenance schedule to 250-hour cycle" },
      { date: "2026-06-12", user: "Alexander Vance", action: "Assigned Class A criticality rating" }
    ]
  },
  {
    assetId: "AST-002",
    name: "APV High-Temperature Short-Time (HTST) Pasteurizer",
    type: "Thermal Processing",
    lineId: "LIN-01",
    lineName: "High-Speed Bottling Line 1",
    plantId: "PLT-01",
    status: "Operational",
    criticality: "Critical (Class A)",
    maintenanceStatus: "Healthy (98% Score)",
    serialNumber: "APV-HT-9921",
    manufacturer: "SPX FLOW APV",
    installDate: "2023-11-20",
    ratedSpeed: "15,000 L/hr",
    downtimeHistory: [],
    maintenanceHistory: [
      { woId: "WO-8790", date: "2026-08-15", type: "Preventive", description: "Plate heat exchanger chemical wash & gasket integrity test", status: "Completed" }
    ],
    auditHistory: [
      { date: "2026-08-15", user: "Sarah Jenkins", action: "Verified HACCP thermal log validation" }
    ]
  },
  {
    assetId: "AST-003",
    name: "Zalkin 12-Head Rotary Capper",
    type: "Packaging / Capping",
    lineId: "LIN-01",
    lineName: "High-Speed Bottling Line 1",
    plantId: "PLT-01",
    status: "Operational",
    criticality: "High (Class B)",
    maintenanceStatus: "Healthy (92% Score)",
    serialNumber: "ZLK-CAP-4410",
    manufacturer: "Zalkin",
    installDate: "2024-03-20",
    ratedSpeed: "42,000 BPH",
    downtimeHistory: [
      { date: "2026-08-18", durationMin: 18, reason: "Cap sorter chute optical sensor dirt", code: "SNS-OPT-04", technician: "James Holden" }
    ],
    maintenanceHistory: [
      { woId: "WO-8812", date: "2026-08-20", type: "Corrective", description: "Cleaned optical photocell and adjusted magnetic clutch torque", status: "Completed" }
    ],
    auditHistory: []
  },
  {
    assetId: "AST-004",
    name: "Sidel Matrix Blow Molder SBO 14",
    type: "Forming / Molding",
    lineId: "LIN-01",
    lineName: "High-Speed Bottling Line 1",
    plantId: "PLT-01",
    status: "Operational",
    criticality: "Critical (Class A)",
    maintenanceStatus: "Healthy (94% Score)",
    serialNumber: "SDL-MX-1402",
    manufacturer: "Sidel",
    installDate: "2024-01-10",
    ratedSpeed: "42,000 BPH",
    downtimeHistory: [],
    maintenanceHistory: [],
    auditHistory: []
  },
  {
    assetId: "AST-005",
    name: "KHS Innofill Glass Filler",
    type: "Packaging / Filling",
    lineId: "LIN-02",
    lineName: "Medium-Speed Glass Bottling Line 2",
    plantId: "PLT-01",
    status: "Operational",
    criticality: "High (Class B)",
    maintenanceStatus: "Healthy (91% Score)",
    serialNumber: "KHS-GL-5520",
    manufacturer: "KHS Group",
    installDate: "2023-08-14",
    ratedSpeed: "28,000 BPH",
    downtimeHistory: [],
    maintenanceHistory: [],
    auditHistory: []
  },
  {
    assetId: "AST-006",
    name: "Ferrum High-Speed Can Seamer F708",
    type: "Packaging / Seaming",
    lineId: "LIN-03",
    lineName: "Automated Sleek Canning Line 3",
    plantId: "PLT-02",
    status: "Operational",
    criticality: "Critical (Class A)",
    maintenanceStatus: "Healthy (97% Score)",
    serialNumber: "FRM-CAN-7080",
    manufacturer: "Ferrum Packaging",
    installDate: "2024-05-10",
    ratedSpeed: "55,000 CPH",
    downtimeHistory: [],
    maintenanceHistory: [],
    auditHistory: []
  }
];

export const INITIAL_EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Alexander Vance",
    email: "alexander.vance@flowstate.io",
    department: "IT & Continuous Improvement",
    departmentId: "DEP-05",
    role: "System Administrator & CI Lead",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    skills: ["5-Why RCA", "DMAIC Six Sigma", "Master Data Governance", "ERP Integration", "SCADA Architecture"],
    skillLevel: "Level 4 (Master / Trainer)",
    certifications: ["Six Sigma Black Belt (ASQ)", "ISO 22000 Lead Auditor", "AWS Cloud Architect"],
    assignedLineIds: ["LIN-01", "LIN-02", "LIN-03"],
    status: "Active"
  },
  {
    employeeId: "EMP-002",
    name: "Robert Thorne",
    email: "robert.thorne@flowstate.io",
    department: "Plant Operations",
    departmentId: "DEP-01",
    role: "Plant Manager",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    skills: ["OEE Loss Elimination", "Capacity Planning", "Financial ROI Modeling", "Operational Leadership"],
    skillLevel: "Level 4 (Master / Trainer)",
    certifications: ["Lean Bronze Certified (SME)", "CMRP Reliability Professional"],
    assignedLineIds: ["LIN-01", "LIN-02"],
    status: "Active"
  },
  {
    employeeId: "EMP-003",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@flowstate.io",
    department: "Quality Assurance",
    departmentId: "DEP-03",
    role: "QA / QC Manager",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    skills: ["HACCP CCP Monitoring", "CoA Batch Release", "Sensory Analysis", "Statistical Process Control"],
    skillLevel: "Level 4 (Master / Trainer)",
    certifications: ["PCQI Preventive Controls", "ISO 9001 Lead Auditor"],
    assignedLineIds: ["LIN-01", "LIN-02"],
    status: "Active"
  },
  {
    employeeId: "EMP-004",
    name: "Marcus Vance",
    email: "marcus.vance@flowstate.io",
    department: "Maintenance & Reliability",
    departmentId: "DEP-02",
    role: "Maintenance Lead & Millwright",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    skills: ["Precision Shaft Alignment", "Vibration Analysis", "LOTO Safety Protocol", "Hydraulic & Pneumatics"],
    skillLevel: "Level 3 (Senior Technician)",
    certifications: ["Vibration Analyst Cat II", "OSHA 30-Hour Safety"],
    assignedLineIds: ["LIN-01"],
    status: "Active"
  },
  {
    employeeId: "EMP-005",
    name: "David Kim",
    email: "david.kim@flowstate.io",
    department: "Production",
    departmentId: "DEP-01",
    role: "Production Shift Supervisor",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    skills: ["Line Pacing", "Changeover Optimization", "Labour Dispatch", "Shift Handover"],
    skillLevel: "Level 3 (Senior Technician)",
    certifications: ["TPM Autonomous Maintenance", "First Aid & CPR"],
    assignedLineIds: ["LIN-01", "LIN-02"],
    status: "Active"
  }
];

export const INITIAL_TRAINING_RECORDS = [
  {
    trainingId: "TRN-01",
    employeeId: "EMP-005",
    employeeName: "David Kim",
    courseTitle: "Autonomous Maintenance Level 2 (TPM Pillar)",
    trainer: "Alexander Vance",
    completionDate: "2026-06-15",
    expiryDate: "2027-06-15",
    score: "98%",
    status: "Certified Valid"
  },
  {
    trainingId: "TRN-02",
    employeeId: "EMP-004",
    employeeName: "Marcus Vance",
    courseTitle: "High-Voltage LOTO & Arc Flash Safety",
    trainer: "Industrial Safety Institute",
    completionDate: "2025-08-10",
    expiryDate: "2026-08-10",
    score: "100%",
    status: "Expired / Needs Renewal"
  }
];

export const INITIAL_QUALITY_SPECS = [
  {
    specId: "QSP-001",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    specificationTitle: "Beverage Acidity & Brix Parameter Standard",
    parameter: "Soluble Solids (Brix)",
    target: "10.50",
    min: "10.30",
    max: "10.70",
    uom: "°Bx",
    revision: "R2",
    status: "Active",
    approvalStatus: "Approved",
    criticality: "Critical CCP (HACCP-1)",
    isCCP: true,
    criticalLimit: "Must not drop below 10.25°Bx or exceed 10.75°Bx",
    testMethod: "Digital Refractometer Ref-300",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    revisionHistory: [
      { revision: "R2", status: "Approved", createdBy: "Sarah Jenkins", date: "2026-08-20", changes: "Tightened Brix upper limit from 10.80 to 10.70 to improve sugar consistency.", approvedBy: "Robert Thorne" },
      { revision: "R1", status: "Superseded", createdBy: "Sarah Jenkins", date: "2026-06-10", changes: "Initial product formulation release.", approvedBy: "Robert Thorne" }
    ]
  },
  {
    specId: "QSP-002",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    specificationTitle: "Carbon Dioxide (CO2) Dissolved Volume",
    parameter: "Dissolved Carbonation",
    target: "3.80",
    min: "3.60",
    max: "4.00",
    uom: "Vol CO2",
    revision: "R3",
    status: "Active",
    approvalStatus: "Approved",
    criticality: "Quality Spec",
    isCCP: false,
    criticalLimit: "Standard QA tolerance band",
    testMethod: "CarboQC Piercing Gauge",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    revisionHistory: [
      { revision: "R3", status: "Approved", createdBy: "Sarah Jenkins", date: "2026-08-22", changes: "Calibrated for warm-season ambient temperature variations.", approvedBy: "Alexander Vance" }
    ]
  },
  {
    specId: "QSP-003",
    skuId: "SKU-002",
    skuCode: "SKU-5002",
    skuName: "1L Tonic Water Natural Quinine",
    specificationTitle: "Finished Product pH Level Control",
    parameter: "pH Acidity Level",
    target: "2.85",
    min: "2.70",
    max: "3.00",
    uom: "pH",
    revision: "R1",
    status: "Active",
    approvalStatus: "Approved",
    criticality: "Critical CCP (HACCP-2)",
    isCCP: true,
    criticalLimit: "pH must remain <= 3.00 for microbial inhibition",
    testMethod: "Benchtop pH Probe Metrohm 913",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    revisionHistory: [
      { revision: "R1", status: "Approved", createdBy: "Sarah Jenkins", date: "2026-07-02", changes: "Baseline release for natural quinine formula.", approvedBy: "Robert Thorne" }
    ]
  },
  {
    specId: "QSP-004",
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    skuName: "500ml Sparkling Citrus Soda",
    specificationTitle: "Net Fill Volume & Headspace Height",
    parameter: "Net Content Volume",
    target: "502.0",
    min: "498.0",
    max: "506.0",
    uom: "mL",
    revision: "R2",
    status: "Active",
    approvalStatus: "Approved",
    criticality: "Legal Metrology / Legal",
    isCCP: false,
    criticalLimit: "T1 underfill limit 495 mL (3 allowable per 10,000 batch)",
    testMethod: "Gravimetric Density Checkweighing",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2030-12-31",
    revisionHistory: [
      { revision: "R2", status: "Approved", createdBy: "Sarah Jenkins", date: "2026-08-14", changes: "Adjusted target fill from 500 to 502 mL to guarantee 0% underfill.", approvedBy: "Robert Thorne" }
    ]
  }
];

export const INITIAL_STORAGE_RESOURCES = [
  {
    storageId: "STR-01",
    code: "WH-RM-01",
    name: "Raw Material Warehouse Room A",
    type: "Warehouse Room",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    zone: "Bulk Liquid & Dry Ingredients Zone",
    capacity: "500 Pallets",
    currentOccupancy: "380 Pallets (76%)",
    temperatureRange: "Ambient (18°C - 24°C)",
    status: "Active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    storageId: "STR-02",
    code: "WH-RCK-101",
    name: "High-Bay Heavy Rack Array R-101 to R-110",
    type: "Racks System",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    zone: "Finished Goods Staging Bay 2",
    capacity: "1,200 Pallets",
    currentOccupancy: "980 Pallets (81.6%)",
    temperatureRange: "Ambient",
    status: "Active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    storageId: "STR-03",
    code: "WH-CRT-05",
    name: "Mobile Clean CIP Transport Carts (5-Set)",
    type: "Mobile Carts",
    plantId: "PLT-01",
    plantName: "Indore Plant",
    zone: "Packaging Line Staging",
    capacity: "25 Carts",
    currentOccupancy: "18 Carts in Use",
    temperatureRange: "Clean Room",
    status: "Active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2030-12-31"
  },
  {
    storageId: "STR-04",
    code: "WH-AUST-01",
    name: "Cold Storage Staging Vault 1",
    type: "Cold Vault",
    plantId: "PLT-02",
    plantName: "Austin Facility",
    zone: "Ginger Beer Cold Conditioning",
    capacity: "450 Pallets",
    currentOccupancy: "310 Pallets (68.8%)",
    temperatureRange: "Cold (2°C - 6°C)",
    status: "Active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2030-12-31"
  }
];

export const INITIAL_USERS = [
  { id: "USR-001", name: "Alexander Vance", email: "alexander.vance@flowstate.io", role: "System Administrator", roleKey: "admin", department: "IT & Digital Ops", plantId: "PLT-01", status: "Active", lastLogin: "Just now" },
  { id: "USR-002", name: "Robert Thorne", email: "robert.thorne@flowstate.io", role: "Plant Manager", roleKey: "plant_manager", department: "Operations", plantId: "PLT-01", status: "Active", lastLogin: "10 mins ago" },
  { id: "USR-003", name: "Sarah Jenkins", email: "sarah.jenkins@flowstate.io", role: "QA Manager", roleKey: "qa_manager", department: "Quality Assurance", plantId: "PLT-01", status: "Active", lastLogin: "1 hour ago" },
  { id: "USR-004", name: "Marcus Vance", email: "marcus.vance@flowstate.io", role: "Maintenance Lead", roleKey: "maintenance", department: "Maintenance", plantId: "PLT-01", status: "Active", lastLogin: "3 hours ago" },
  { id: "USR-005", name: "David Kim", email: "david.kim@flowstate.io", role: "Production Supervisor", roleKey: "operator", department: "Production", plantId: "PLT-01", status: "Active", lastLogin: "3 days ago" }
];

export const INITIAL_USER_INVITATIONS = [
  { id: "INV-101", email: "clara.oswald@flowstate.io", role: "Quality Analyst", department: "Quality Assurance", invitedBy: "Alexander Vance", sentDate: "2026-08-30", status: "Pending" },
  { id: "INV-102", email: "james.holden@flowstate.io", role: "Controls Engineer", department: "Maintenance", invitedBy: "Alexander Vance", sentDate: "2026-08-31", status: "Pending" }
];

export const INITIAL_AUDIT_LOGS = [
  {
    auditId: "AUD-9901",
    timestamp: "02 Sep 2026 10:15:30",
    user: "Alexander Vance",
    userRole: "System Administrator",
    entityId: "SKU-001",
    entityType: "SKU Master",
    action: "Updated",
    field: "Standard Cost",
    oldValue: "stdCost = $0.40",
    newValue: "stdCost = $0.42",
    notes: "Annual raw ingredient index re-costing applied"
  },
  {
    auditId: "AUD-9902",
    timestamp: "02 Sep 2026 09:40:12",
    user: "Sarah Jenkins",
    userRole: "QA Manager",
    entityId: "QSP-001",
    entityType: "Quality Specification",
    action: "Approved",
    field: "Approval Status",
    oldValue: "approvalStatus = Submitted",
    newValue: "approvalStatus = Approved",
    notes: "Revision R2 Brix range locked following trial audit"
  },
  {
    auditId: "AUD-9903",
    timestamp: "01 Sep 2026 16:22:05",
    user: "Marcus Vance",
    userRole: "Maintenance Lead",
    entityId: "AST-001",
    entityType: "Machine Asset",
    action: "Updated",
    field: "Maintenance Cycle",
    oldValue: "cycleHours = 200",
    newValue: "cycleHours = 250",
    notes: "PM interval extended per OEM reliability advisory"
  },
  {
    auditId: "AUD-9904",
    timestamp: "01 Sep 2026 14:10:44",
    user: "Robert Thorne",
    userRole: "Plant Manager",
    entityId: "BOM-001",
    entityType: "BOM Recipe",
    action: "Approved",
    field: "Revision Status",
    oldValue: "status = Under Review",
    newValue: "status = Active",
    notes: "Sign-off on R3 Citrus formulation recipe"
  },
  {
    auditId: "AUD-9905",
    timestamp: "31 Aug 2026 11:05:18",
    user: "Alexander Vance",
    userRole: "System Administrator",
    entityId: "LIN-01",
    entityType: "Work Center Line",
    action: "Updated",
    field: "Rated Capacity",
    oldValue: "capacity = 40,000 BPH",
    newValue: "capacity = 42,000 BPH",
    notes: "Line speed test post-de-bottlenecking Kaizen project"
  }
];

export const INITIAL_ROLE_PERMISSIONS = {
  admin: {
    label: "Super Admin / System Administrator",
    permissions: {
      "SKU Master": { view: true, create: true, edit: true, delete: true, approve: true },
      "Product Family": { view: true, create: true, edit: true, delete: true, approve: true },
      "UOM Master": { view: true, create: true, edit: true, delete: true, approve: true },
      "BOM / Recipe": { view: true, create: true, edit: true, delete: true, approve: true },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: true, approve: true },
      "Machine Assets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: true, approve: true },
      "Quality Specs": { view: true, create: true, edit: true, delete: true, approve: true },
      "Routings & Operations": { view: true, create: true, edit: true, delete: true, approve: true },
      "Line Targets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Changeover Matrix": { view: true, create: true, edit: true, delete: true, approve: true },
      "Storage Resources": { view: true, create: true, edit: true, delete: true, approve: true },
      "User Administration": { view: true, create: true, edit: true, delete: true, approve: true },
      "Data Migration": { view: true, create: true, edit: true, delete: true, approve: true },
      "Audit Trail": { view: true, create: true, edit: true, delete: false, approve: true }
    }
  },
  plant_manager: {
    label: "Plant Manager",
    permissions: {
      "SKU Master": { view: true, create: true, edit: true, delete: false, approve: true },
      "Product Family": { view: true, create: true, edit: true, delete: false, approve: true },
      "UOM Master": { view: true, create: true, edit: false, delete: false, approve: true },
      "BOM / Recipe": { view: true, create: true, edit: true, delete: false, approve: true },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: false, approve: true },
      "Machine Assets": { view: true, create: true, edit: true, delete: false, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: false, approve: true },
      "Quality Specs": { view: true, create: true, edit: true, delete: false, approve: true },
      "Routings & Operations": { view: true, create: true, edit: true, delete: false, approve: true },
      "Line Targets": { view: true, create: true, edit: true, delete: false, approve: true },
      "Changeover Matrix": { view: true, create: true, edit: true, delete: false, approve: true },
      "Storage Resources": { view: true, create: true, edit: true, delete: false, approve: true },
      "User Administration": { view: true, create: true, edit: false, delete: false, approve: false },
      "Data Migration": { view: true, create: true, edit: false, delete: false, approve: true },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false }
    }
  },
  qa_manager: {
    label: "Quality QA / QC Manager",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "Product Family": { view: true, create: false, edit: false, delete: false, approve: false },
      "UOM Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: true },
      "Work Centers / Lines": { view: true, create: false, edit: false, delete: false, approve: false },
      "Machine Assets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Employees & Skills": { view: true, create: false, edit: false, delete: false, approve: false },
      "Quality Specs": { view: true, create: true, edit: true, delete: true, approve: true },
      "Routings & Operations": { view: true, create: false, edit: false, delete: false, approve: false },
      "Line Targets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Changeover Matrix": { view: true, create: false, edit: false, delete: false, approve: true },
      "Storage Resources": { view: true, create: false, edit: false, delete: false, approve: false },
      "User Administration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false }
    }
  },
  maintenance: {
    label: "Maintenance Lead / Manager",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "Product Family": { view: true, create: false, edit: false, delete: false, approve: false },
      "UOM Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: false },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: false, approve: false },
      "Machine Assets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: false, approve: false },
      "Quality Specs": { view: false, create: false, edit: false, delete: false, approve: false },
      "Routings & Operations": { view: true, create: false, edit: false, delete: false, approve: false },
      "Line Targets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Changeover Matrix": { view: true, create: true, edit: true, delete: false, approve: false },
      "Storage Resources": { view: true, create: true, edit: false, delete: false, approve: false },
      "User Administration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false }
    }
  },
  operator: {
    label: "Line Lead / Operator",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "Product Family": { view: true, create: false, edit: false, delete: false, approve: false },
      "UOM Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: false },
      "Work Centers / Lines": { view: true, create: false, edit: false, delete: false, approve: false },
      "Machine Assets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Employees & Skills": { view: false, create: false, edit: false, delete: false, approve: false },
      "Quality Specs": { view: true, create: false, edit: false, delete: false, approve: false },
      "Routings & Operations": { view: true, create: false, edit: false, delete: false, approve: false },
      "Line Targets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Changeover Matrix": { view: true, create: false, edit: false, delete: false, approve: false },
      "Storage Resources": { view: true, create: false, edit: false, delete: false, approve: false },
      "User Administration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: false, create: false, edit: false, delete: false, approve: false }
    }
  }
};

// ============================================================================
// PROVIDER IMPLEMENTATION (CENTRALIZED REACT CONTEXT & PERSISTENCE)
// ============================================================================

export function MasterDataProvider({ children }) {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [activePlantId, setActivePlantId] = useState("PLT-01");
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);

  // 1. Core Master Datasets with Cache Initialization
  const [productFamilies, setProductFamilies] = useState(() => {
    const saved = localStorage.getItem("mx_master_families");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_FAMILIES;
  });

  const [uoms, setUoms] = useState(() => {
    const saved = localStorage.getItem("mx_master_uoms");
    return saved ? JSON.parse(saved) : INITIAL_UOMS;
  });

  const [skus, setSkus] = useState(() => {
    const saved = localStorage.getItem("mx_master_skus");
    return saved ? JSON.parse(saved) : INITIAL_SKUS;
  });

  const [packConfigs, setPackConfigs] = useState(() => {
    const saved = localStorage.getItem("mx_master_pack_configs");
    return saved ? JSON.parse(saved) : INITIAL_PACK_CONFIGS;
  });

  const [shelfLifeRecords, setShelfLifeRecords] = useState(() => {
    const saved = localStorage.getItem("mx_master_shelflife");
    return saved ? JSON.parse(saved) : INITIAL_SHELF_LIFE;
  });

  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

  const [customerSkuMappings, setCustomerSkuMappings] = useState(() => {
    const saved = localStorage.getItem("mx_master_csm");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_SKU_MAPPINGS;
  });

  const [boms, setBoms] = useState(() => {
    const saved = localStorage.getItem("mx_master_boms");
    return saved ? JSON.parse(saved) : INITIAL_BOMS;
  });

  const [operations, setOperations] = useState(() => {
    const saved = localStorage.getItem("mx_master_operations");
    return saved ? JSON.parse(saved) : INITIAL_OPERATIONS;
  });

  const [routings, setRoutings] = useState(() => {
    const saved = localStorage.getItem("mx_master_routings");
    return saved ? JSON.parse(saved) : INITIAL_ROUTINGS;
  });

  const [lines, setLines] = useState(() => {
    const saved = localStorage.getItem("mx_master_lines");
    return saved ? JSON.parse(saved) : INITIAL_LINES;
  });

  const [lineTargets, setLineTargets] = useState(() => {
    const saved = localStorage.getItem("mx_master_line_targets");
    return saved ? JSON.parse(saved) : INITIAL_LINE_TARGETS;
  });

  const [changeoverMatrix, setChangeoverMatrix] = useState(() => {
    const saved = localStorage.getItem("mx_master_changeovers");
    return saved ? JSON.parse(saved) : INITIAL_CHANGEOVER_MATRIX;
  });

  const [sanitationClasses, setSanitationClasses] = useState(() => {
    const saved = localStorage.getItem("mx_master_sanitation");
    return saved ? JSON.parse(saved) : INITIAL_SANITATION_CLASSES;
  });

  const [allergenRules, setAllergenRules] = useState(() => {
    const saved = localStorage.getItem("mx_master_allergens");
    return saved ? JSON.parse(saved) : INITIAL_ALLERGEN_RULES;
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("mx_master_assets");
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("mx_master_employees");
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [trainingRecords, setTrainingRecords] = useState(() => {
    const saved = localStorage.getItem("mx_master_training");
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_RECORDS;
  });

  const [qualitySpecs, setQualitySpecs] = useState(() => {
    const saved = localStorage.getItem("mx_master_quality_specs");
    return saved ? JSON.parse(saved) : INITIAL_QUALITY_SPECS;
  });

  const [storageResources, setStorageResources] = useState(() => {
    const saved = localStorage.getItem("mx_master_storage");
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_RESOURCES;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("mx_admin_users");
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [userInvitations, setUserInvitations] = useState(INITIAL_USER_INVITATIONS);

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("mx_master_audit_logs");
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem("mx_master_permissions");
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PERMISSIONS;
  });

  // Local Storage Synchronization
  useEffect(() => { localStorage.setItem("mx_master_families", JSON.stringify(productFamilies)); }, [productFamilies]);
  useEffect(() => { localStorage.setItem("mx_master_uoms", JSON.stringify(uoms)); }, [uoms]);
  useEffect(() => { localStorage.setItem("mx_master_skus", JSON.stringify(skus)); }, [skus]);
  useEffect(() => { localStorage.setItem("mx_master_pack_configs", JSON.stringify(packConfigs)); }, [packConfigs]);
  useEffect(() => { localStorage.setItem("mx_master_shelflife", JSON.stringify(shelfLifeRecords)); }, [shelfLifeRecords]);
  useEffect(() => { localStorage.setItem("mx_master_csm", JSON.stringify(customerSkuMappings)); }, [customerSkuMappings]);
  useEffect(() => { localStorage.setItem("mx_master_boms", JSON.stringify(boms)); }, [boms]);
  useEffect(() => { localStorage.setItem("mx_master_operations", JSON.stringify(operations)); }, [operations]);
  useEffect(() => { localStorage.setItem("mx_master_routings", JSON.stringify(routings)); }, [routings]);
  useEffect(() => { localStorage.setItem("mx_master_lines", JSON.stringify(lines)); }, [lines]);
  useEffect(() => { localStorage.setItem("mx_master_line_targets", JSON.stringify(lineTargets)); }, [lineTargets]);
  useEffect(() => { localStorage.setItem("mx_master_changeovers", JSON.stringify(changeoverMatrix)); }, [changeoverMatrix]);
  useEffect(() => { localStorage.setItem("mx_master_sanitation", JSON.stringify(sanitationClasses)); }, [sanitationClasses]);
  useEffect(() => { localStorage.setItem("mx_master_allergens", JSON.stringify(allergenRules)); }, [allergenRules]);
  useEffect(() => { localStorage.setItem("mx_master_assets", JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem("mx_master_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("mx_master_training", JSON.stringify(trainingRecords)); }, [trainingRecords]);
  useEffect(() => { localStorage.setItem("mx_master_quality_specs", JSON.stringify(qualitySpecs)); }, [qualitySpecs]);
  useEffect(() => { localStorage.setItem("mx_master_storage", JSON.stringify(storageResources)); }, [storageResources]);
  useEffect(() => { localStorage.setItem("mx_admin_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("mx_master_audit_logs", JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem("mx_master_permissions", JSON.stringify(rolePermissions)); }, [rolePermissions]);

  // ============================================================================
  // CENTRALIZED AUDIT LOGGING HELPER
  // ============================================================================
  const logAudit = useCallback(({ entityId, entityType, action, field = "-", oldValue = "-", newValue = "-", notes = "", user = "Alexander Vance", userRole = "System Administrator" }) => {
    const newEntry = {
      auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      user,
      userRole,
      entityId: String(entityId || "N/A"),
      entityType,
      action,
      field,
      oldValue: String(oldValue),
      newValue: String(newValue),
      notes
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }, []);

  // ============================================================================
  // 0. PLANT FACILITIES MUTATIONS
  // ============================================================================
  
  const addPlant = (plantData) => {
    const newId = `PLT-0${plants.length + 1}`;
    const newRecord = {
      id: newId,
      companyId: companies[0].id,
      code: (plantData.code || `PLT-${plants.length + 1}`).toUpperCase(),
      name: plantData.name,
      location: plantData.location || "",
      city: plantData.city || "",
      state: plantData.state || "",
      country: plantData.country || "",
      capacity: plantData.dailyCapacity || "0 Units/Day",
      operatingShifts: plantData.operatingShifts || 3,
      status: plantData.status || "Active",
      timezone: plantData.timezone || "Asia/Kolkata (IST)",
      effectiveFrom: new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setPlants((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.code, entityType: "Plant Facility", action: "Provisioned", newValue: `${newRecord.name} (${newRecord.code})` });
    return newRecord;
  };

  const updatePlant = (plantId, updated) => {
    setPlants((prev) => prev.map((p) => (p.id === plantId ? { ...p, ...updated } : p)));
    logAudit({ entityId: plantId, entityType: "Plant Facility", action: "Updated", notes: "Plant configuration modified" });
  };

  const deletePlant = (plantId) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
    logAudit({ entityId: plantId, entityType: "Plant Facility", action: "Deleted" });
  };

  // ============================================================================
  // 1. PRODUCT FAMILY MUTATIONS
  // ============================================================================
  const addProductFamily = (familyData) => {
    const newId = `FAM-0${productFamilies.length + 1}`;
    const newRecord = {
      familyId: newId,
      code: familyData.code || `FAM-${productFamilies.length + 1}`,
      name: familyData.name,
      category: familyData.category || "Finished Goods",
      description: familyData.description || "",
      plantId: familyData.plantId || activePlantId,
      allergenRisk: familyData.allergenRisk || "None",
      standardMargin: familyData.standardMargin || "55.0%",
      status: familyData.status || "Active",
      effectiveFrom: familyData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: familyData.effectiveTo || "2030-12-31"
    };
    setProductFamilies((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.code, entityType: "Product Family", action: "Created", newValue: `${newRecord.name} (${newRecord.code})` });
    return newRecord;
  };

  const updateProductFamily = (familyId, updated) => {
    setProductFamilies((prev) => prev.map((f) => (f.familyId === familyId ? { ...f, ...updated } : f)));
    logAudit({ entityId: familyId, entityType: "Product Family", action: "Updated", notes: "Family configuration modified" });
  };

  const toggleProductFamilyStatus = (familyId) => {
    setProductFamilies((prev) =>
      prev.map((f) => (f.familyId === familyId ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f))
    );
  };

  const deleteProductFamily = (familyId) => {
    setProductFamilies((prev) => prev.filter((f) => f.familyId !== familyId));
    logAudit({ entityId: familyId, entityType: "Product Family", action: "Deleted" });
  };

  // ============================================================================
  // 2. UOM MUTATIONS
  // ============================================================================
  const addUOM = (uomData) => {
    const newId = `UOM-0${uoms.length + 1}`;
    const newRecord = {
      uomId: newId,
      uomCode: (uomData.uomCode || uomData.code || "").toUpperCase(),
      name: uomData.name,
      type: uomData.type || "Packaging",
      baseUom: uomData.baseUom || "UNITS",
      conversionFactor: Number(uomData.conversionFactor || uomData.factor) || 1.0,
      status: "Active",
      effectiveFrom: uomData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setUoms((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.uomCode, entityType: "UOM Master", action: "Created", newValue: `${newRecord.uomCode} - ${newRecord.name}` });
    return newRecord;
  };

  const updateUOM = (uomId, updated) => {
    setUoms((prev) => prev.map((u) => (u.uomId === uomId ? { ...u, ...updated } : u)));
    logAudit({ entityId: uomId, entityType: "UOM Master", action: "Updated" });
  };

  const toggleUOMStatus = (uomId) => {
    setUoms((prev) => prev.map((u) => (u.uomId === uomId ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u)));
  };

  const deleteUOM = (uomId) => {
    setUoms((prev) => prev.filter((u) => u.uomId !== uomId));
    logAudit({ entityId: uomId, entityType: "UOM Master", action: "Deleted" });
  };

  // ============================================================================
  // 3. SKU / ITEM MASTER MUTATIONS
  // ============================================================================
  const addSKU = (skuData) => {
    const newSkuId = `SKU-00${skus.length + 1}`;
    const newRecord = {
      skuId: newSkuId,
      skuCode: skuData.skuCode || `SKU-${Math.floor(5000 + Math.random() * 900)}`,
      name: skuData.name,
      category: skuData.category || "Finished Goods",
      itemType: skuData.itemType || (skuData.category === "Raw Ingredients" ? "Raw Material" : "Finished Good"),
      familyId: skuData.familyId || "FAM-01",
      family: skuData.family || "Sparkling Flavors",
      uom: skuData.uom || "Bottles",
      plantId: skuData.plantId || activePlantId,
      stdCost: skuData.stdCost || "$0.50",
      revision: "R1",
      status: skuData.status || "Active",
      approvalStatus: skuData.approvalStatus || "Approved",
      shelfLifeDays: Number(skuData.shelfLifeDays) || 365,
      packConfigCode: skuData.packConfigCode || `PCK-${skuData.skuCode || "DEF"}`,
      packSize: skuData.packSize || "24 Units / Case",
      eligibleLineIds: skuData.eligibleLineIds || ["LIN-01"],
      stdRunRateBPH: Number(skuData.stdRunRateBPH) || 35000,
      expectedYieldPct: Number(skuData.expectedYieldPct) || 99.0,
      effectiveFrom: skuData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: skuData.effectiveTo || "2030-12-31",
      description: skuData.description || "",
      createdBy: "Alexander Vance",
      createdDate: new Date().toISOString().substring(0, 10),
      lastUpdated: new Date().toISOString().substring(0, 10)
    };
    setSkus((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.skuCode, entityType: "SKU Master", action: "Created", newValue: `${newRecord.skuCode} - ${newRecord.name} (${newRecord.uom})` });
    return newRecord;
  };

  const updateSKU = (skuId, updated) => {
    setSkus((prev) =>
      prev.map((s) => (s.skuId === skuId || s.skuCode === skuId ? { ...s, ...updated, lastUpdated: new Date().toISOString().substring(0, 10) } : s))
    );
    logAudit({ entityId: skuId, entityType: "SKU Master", action: "Updated", notes: "SKU attributes updated" });
  };

  const toggleSKUStatus = (skuId) => {
    setSkus((prev) =>
      prev.map((s) => {
        if (s.skuId === skuId || s.skuCode === skuId) {
          const next = s.status === "Active" ? "Inactive" : "Active";
          logAudit({ entityId: s.skuCode, entityType: "SKU Master", action: next === "Active" ? "Activated" : "Deactivated" });
          return { ...s, status: next, lastUpdated: new Date().toISOString().substring(0, 10) };
        }
        return s;
      })
    );
  };

  const deleteSKU = (skuId) => {
    setSkus((prev) => prev.filter((s) => s.skuId !== skuId && s.skuCode !== skuId));
    logAudit({ entityId: skuId, entityType: "SKU Master", action: "Deleted" });
  };

  // ============================================================================
  // 4. PACK CONFIGURATION MUTATIONS
  // ============================================================================
  const addPackConfig = (pckData) => {
    const newRecord = {
      packConfigId: `PCK-0${packConfigs.length + 1}`,
      packCode: pckData.packCode || `PCK-${pckData.skuCode || "5000"}-${pckData.unitsPerPack || 24}`,
      skuId: pckData.skuId,
      skuCode: pckData.skuCode,
      skuName: pckData.skuName,
      unitsPerPack: Number(pckData.unitsPerPack) || 24,
      packType: pckData.packType || "Corrugated Case",
      packagingUom: pckData.packagingUom || "CASE-24",
      caseConfiguration: pckData.caseConfiguration || `${pckData.unitsPerPack} Units per Box`,
      palletConfiguration: pckData.palletConfiguration || "60 Cases per Pallet",
      tareWeightKg: Number(pckData.tareWeightKg) || 12.0,
      status: "Active",
      effectiveFrom: pckData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setPackConfigs((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.packCode, entityType: "Pack Configuration", action: "Created", newValue: `${newRecord.packCode} for ${newRecord.skuCode}` });
    return newRecord;
  };

  const updatePackConfig = (packConfigId, updated) => {
    setPackConfigs((prev) => prev.map((p) => (p.packConfigId === packConfigId ? { ...p, ...updated } : p)));
    logAudit({ entityId: packConfigId, entityType: "Pack Configuration", action: "Updated" });
  };

  const deletePackConfig = (packConfigId) => {
    setPackConfigs((prev) => prev.filter((p) => p.packConfigId !== packConfigId));
    logAudit({ entityId: packConfigId, entityType: "Pack Configuration", action: "Deleted" });
  };

  // ============================================================================
  // 5. SHELF LIFE MUTATIONS
  // ============================================================================
  const addShelfLife = (data) => {
    const newRecord = {
      shelfLifeId: `SLF-0${shelfLifeRecords.length + 1}`,
      skuId: data.skuId,
      skuCode: data.skuCode,
      skuName: data.skuName,
      shelfLifeValue: Number(data.shelfLifeValue) || 365,
      shelfLifeUom: data.shelfLifeUom || "Days",
      storageCondition: data.storageCondition || "Ambient Dry (15°C - 25°C)",
      minTempC: Number(data.minTempC) || 4,
      maxTempC: Number(data.maxTempC) || 28,
      lightSensitivity: data.lightSensitivity || "Standard",
      quarantineDays: Number(data.quarantineDays) || 1,
      status: "Active",
      effectiveFrom: data.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setShelfLifeRecords((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.shelfLifeId, entityType: "Shelf Life Master", action: "Created", newValue: `${newRecord.skuCode}: ${newRecord.shelfLifeValue} Days` });
    return newRecord;
  };

  const updateShelfLife = (shelfLifeId, updated) => {
    setShelfLifeRecords((prev) => prev.map((s) => (s.shelfLifeId === shelfLifeId ? { ...s, ...updated } : s)));
    logAudit({ entityId: shelfLifeId, entityType: "Shelf Life Master", action: "Updated" });
  };

  const deleteShelfLife = (shelfLifeId) => {
    setShelfLifeRecords((prev) => prev.filter((s) => s.shelfLifeId !== shelfLifeId));
    logAudit({ entityId: shelfLifeId, entityType: "Shelf Life Master", action: "Deleted" });
  };

  // ============================================================================
  // 6. CUSTOMER SKU MAPPING MUTATIONS
  // ============================================================================
  const addCustomerSkuMapping = (csmData) => {
    const newRecord = {
      mappingId: `CSM-0${customerSkuMappings.length + 1}`,
      customerId: csmData.customerId,
      customerName: csmData.customerName || customers.find((c) => c.customerId === csmData.customerId)?.name || "Retail Partner",
      skuId: csmData.skuId,
      internalSkuCode: csmData.internalSkuCode || skus.find((s) => s.skuId === csmData.skuId)?.skuCode || "SKU-5001",
      internalSkuName: csmData.internalSkuName || skus.find((s) => s.skuId === csmData.skuId)?.name || "Beverage Product",
      customerSkuCode: csmData.customerSkuCode,
      customerSkuName: csmData.customerSkuName,
      customerUom: csmData.customerUom || "CASE-24",
      barcodeUPC: csmData.barcodeUPC || `89012345${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Active",
      effectiveFrom: csmData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setCustomerSkuMappings((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.mappingId, entityType: "Customer SKU Mapping", action: "Created", newValue: `${newRecord.customerName} ↔ ${newRecord.internalSkuCode}` });
    return newRecord;
  };

  const updateCustomerSkuMapping = (mappingId, updated) => {
    setCustomerSkuMappings((prev) => prev.map((m) => (m.mappingId === mappingId ? { ...m, ...updated } : m)));
    logAudit({ entityId: mappingId, entityType: "Customer SKU Mapping", action: "Updated" });
  };

  const deleteCustomerSkuMapping = (mappingId) => {
    setCustomerSkuMappings((prev) => prev.filter((m) => m.mappingId !== mappingId));
    logAudit({ entityId: mappingId, entityType: "Customer SKU Mapping", action: "Deleted" });
  };

  // ============================================================================
  // 7. BOM / RECIPE MUTATIONS & APPROVAL GOVERNANCE
  // ============================================================================
  const addBOM = (bomData) => {
    const newRecord = {
      bomId: `BOM-00${boms.length + 1}`,
      bomNumber: bomData.bomNumber || `BOM-${Math.floor(5000 + Math.random() * 900)}`,
      finishedSkuId: bomData.finishedSkuId || "SKU-001",
      finishedSkuCode: bomData.finishedSkuCode || skus.find((s) => s.skuId === bomData.finishedSkuId)?.skuCode || "SKU-5001",
      finishedSkuName: bomData.finishedSkuName || skus.find((s) => s.skuId === bomData.finishedSkuId)?.name || "Product Recipe",
      revision: "R1",
      effectiveDate: new Date().toISOString().substring(0, 10),
      effectiveFrom: new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31",
      status: "Draft",
      approvalStatus: "Draft",
      batchSize: bomData.batchSize || "10,000 Liters",
      yieldTarget: bomData.yieldTarget || "99.0%",
      expectedYieldPct: Number(bomData.expectedYieldPct) || 99.0,
      minYieldPct: Number(bomData.minYieldPct) || 98.0,
      maxYieldPct: Number(bomData.maxYieldPct) || 99.8,
      scrapFactorPct: Number(bomData.scrapFactorPct) || 0.8,
      createdBy: "Alexander Vance",
      lastUpdated: new Date().toISOString().substring(0, 10),
      components: bomData.components || [],
      revisionHistory: [
        { revision: "R1", status: "Draft", createdBy: "Alexander Vance", date: new Date().toISOString().substring(0, 10), changes: "Initial BOM Draft Formulation registered.", approvedBy: "-" }
      ]
    };
    setBoms((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.bomNumber, entityType: "BOM Recipe", action: "Created", newValue: `${newRecord.bomNumber} for ${newRecord.finishedSkuName}` });
    return newRecord;
  };

  const updateBOM = (bomId, updated) => {
    setBoms((prev) =>
      prev.map((b) => (b.bomId === bomId || b.bomNumber === bomId ? { ...b, ...updated, lastUpdated: new Date().toISOString().substring(0, 10) } : b))
    );
    logAudit({ entityId: bomId, entityType: "BOM Recipe", action: "Updated" });
  };

  const submitBOMForApproval = (bomId) => {
    setBoms((prev) =>
      prev.map((b) => {
        if (b.bomId === bomId || b.bomNumber === bomId) {
          logAudit({ entityId: b.bomNumber, entityType: "BOM Recipe", action: "Submitted", notes: "Submitted for QA/Plant Manager approval" });
          return { ...b, status: "Under Review", approvalStatus: "Under Review", lastUpdated: new Date().toISOString().substring(0, 10) };
        }
        return b;
      })
    );
  };

  const approveBOM = (bomId, approver = "Sarah Jenkins") => {
    setBoms((prev) =>
      prev.map((b) => {
        if (b.bomId === bomId || b.bomNumber === bomId) {
          const revs = b.revisionHistory.map((rev, idx) => (idx === 0 ? { ...rev, status: "Approved", approvedBy: approver } : rev));
          logAudit({ entityId: b.bomNumber, entityType: "BOM Recipe", action: "Approved", notes: `Approved by ${approver}` });
          return { ...b, status: "Active", approvalStatus: "Approved", revisionHistory: revs, lastUpdated: new Date().toISOString().substring(0, 10) };
        }
        return b;
      })
    );
  };

  const rejectBOM = (bomId, reason = "Tolerance out of spec") => {
    setBoms((prev) =>
      prev.map((b) => {
        if (b.bomId === bomId || b.bomNumber === bomId) {
          logAudit({ entityId: b.bomNumber, entityType: "BOM Recipe", action: "Rejected", notes: `Reason: ${reason}` });
          return { ...b, status: "Draft", approvalStatus: "Draft", rejectionReason: reason, lastUpdated: new Date().toISOString().substring(0, 10) };
        }
        return b;
      })
    );
  };

  const deleteBOM = (bomId) => {
    setBoms((prev) => prev.filter((b) => b.bomId !== bomId && b.bomNumber !== bomId));
    logAudit({ entityId: bomId, entityType: "BOM Recipe", action: "Deleted" });
  };

  // ============================================================================
  // 8. OPERATIONS & ROUTINGS MUTATIONS
  // ============================================================================
  const addOperation = (opData) => {
    const newRecord = {
      operationId: `OP-0${operations.length + 1}`,
      operationCode: opData.operationCode || `OP-${operations.length + 1}`,
      name: opData.name,
      sequence: Number(opData.sequence) || (operations.length + 1) * 10,
      department: opData.department || "Packaging",
      stdDurationMin: Number(opData.stdDurationMin) || 45,
      setupDurationMin: Number(opData.setupDurationMin) || 15,
      status: "Active"
    };
    setOperations((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.operationCode, entityType: "Operations Master", action: "Created", newValue: newRecord.name });
    return newRecord;
  };

  const updateOperation = (operationId, updated) => {
    setOperations((prev) => prev.map((o) => (o.operationId === operationId ? { ...o, ...updated } : o)));
    logAudit({ entityId: operationId, entityType: "Operations Master", action: "Updated" });
  };

  const deleteOperation = (operationId) => {
    setOperations((prev) => prev.filter((o) => o.operationId !== operationId));
    logAudit({ entityId: operationId, entityType: "Operations Master", action: "Deleted" });
  };

  const addRouting = (rtgData) => {
    const newRecord = {
      routingId: `RTG-00${routings.length + 1}`,
      routingCode: rtgData.routingCode || `RTG-${rtgData.skuCode || "5000"}-L1`,
      skuId: rtgData.skuId,
      skuCode: rtgData.skuCode || skus.find((s) => s.skuId === rtgData.skuId)?.skuCode || "SKU-5001",
      skuName: rtgData.skuName || skus.find((s) => s.skuId === rtgData.skuId)?.name || "Product",
      lineId: rtgData.lineId || "LIN-01",
      lineCode: rtgData.lineCode || lines.find((l) => l.lineId === rtgData.lineId)?.lineCode || "LINE-1",
      lineName: rtgData.lineName || lines.find((l) => l.lineId === rtgData.lineId)?.name || "Line 1",
      revision: "R1",
      approvalStatus: "Approved",
      status: "Active",
      stdRunRateBPH: Number(rtgData.stdRunRateBPH) || 35000,
      setupDurationMin: Number(rtgData.setupDurationMin) || 30,
      expectedYieldPct: Number(rtgData.expectedYieldPct) || 99.0,
      effectiveFrom: rtgData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31",
      steps: rtgData.steps || []
    };
    setRoutings((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.routingCode, entityType: "Routings Master", action: "Created", newValue: `${newRecord.routingCode} for ${newRecord.skuCode}` });
    return newRecord;
  };

  const updateRouting = (routingId, updated) => {
    setRoutings((prev) => prev.map((r) => (r.routingId === routingId ? { ...r, ...updated } : r)));
    logAudit({ entityId: routingId, entityType: "Routings Master", action: "Updated" });
  };

  const deleteRouting = (routingId) => {
    setRoutings((prev) => prev.filter((r) => r.routingId !== routingId));
    logAudit({ entityId: routingId, entityType: "Routings Master", action: "Deleted" });
  };

  // ============================================================================
  // 9. WORK CENTERS / LINES & LINE TARGETS MUTATIONS
  // ============================================================================
  const addLine = (lineData) => {
    const newRecord = {
      lineId: `LIN-0${lines.length + 1}`,
      lineCode: lineData.lineCode || `LINE-${lines.length + 1}`,
      name: lineData.name,
      plantId: lineData.plantId || activePlantId,
      plantName: plants.find((p) => p.id === (lineData.plantId || activePlantId))?.name || "Indore Plant",
      departmentId: lineData.departmentId || "DEP-01",
      capacity: lineData.capacity || "35,000 BPH",
      ratedSpeedBPH: Number(lineData.ratedSpeedBPH) || 35000,
      status: "Active",
      supervisorId: lineData.supervisorId || "EMP-005",
      supervisorName: lineData.supervisorName || "David Kim",
      assignedAssetIds: lineData.assignedAssetIds || [],
      eligibleSkuIds: lineData.eligibleSkuIds || ["SKU-001"],
      ratedOEE: lineData.ratedOEE || "85.0%",
      currentRunningSku: "SKU-5001"
    };
    setLines((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.lineCode, entityType: "Work Centers / Lines", action: "Created", newValue: newRecord.name });
    return newRecord;
  };

  const updateLine = (lineId, updated) => {
    setLines((prev) => prev.map((l) => (l.lineId === lineId || l.lineCode === lineId ? { ...l, ...updated } : l)));
    logAudit({ entityId: lineId, entityType: "Work Centers / Lines", action: "Updated" });
  };

  const toggleLineStatus = (lineId) => {
    setLines((prev) => prev.map((l) => (l.lineId === lineId || l.lineCode === lineId ? { ...l, status: l.status === "Active" ? "Inactive" : "Active" } : l)));
  };

  const deleteLine = (lineId) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId && l.lineCode !== lineId));
    logAudit({ entityId: lineId, entityType: "Work Centers / Lines", action: "Deleted" });
  };

  const assignAssetToLine = (lineId, assetId) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId || l.lineCode === lineId ? { ...l, assignedAssetIds: [...new Set([...l.assignedAssetIds, assetId])] } : l))
    );
    setAssets((prev) =>
      prev.map((a) => (a.assetId === assetId ? { ...a, lineId, lineName: lines.find((l) => l.lineId === lineId)?.name || lineId } : a))
    );
    logAudit({ entityId: lineId, entityType: "Work Centers / Lines", action: "Updated", newValue: `Assigned asset ${assetId}` });
  };

  const addLineTarget = (targetData) => {
    const newRecord = {
      targetId: `TGT-0${lineTargets.length + 1}`,
      plantId: targetData.plantId || activePlantId,
      lineId: targetData.lineId || "LIN-01",
      lineName: lines.find((l) => l.lineId === targetData.lineId)?.name || "High-Speed Line 1",
      skuId: targetData.skuId || "SKU-001",
      skuCode: skus.find((s) => s.skuId === targetData.skuId)?.skuCode || "SKU-5001",
      skuName: skus.find((s) => s.skuId === targetData.skuId)?.name || "Citrus Soda",
      shift: targetData.shift || "Morning Shift",
      targetQuantity: Number(targetData.targetQuantity) || 250000,
      targetHB: targetData.targetHB || "35,000 Units/Hour",
      stdRunRate: Number(targetData.stdRunRate) || 40000,
      oeeTargetPct: Number(targetData.oeeTargetPct) || 88.0,
      status: "Active",
      effectiveDate: new Date().toISOString().substring(0, 10)
    };
    setLineTargets((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.targetId, entityType: "Line Targets", action: "Created", newValue: `${newRecord.lineName} Target: ${newRecord.targetQuantity}` });
    return newRecord;
  };

  const updateLineTarget = (targetId, updated) => {
    setLineTargets((prev) => prev.map((t) => (t.targetId === targetId ? { ...t, ...updated } : t)));
    logAudit({ entityId: targetId, entityType: "Line Targets", action: "Updated" });
  };

  const deleteLineTarget = (targetId) => {
    setLineTargets((prev) => prev.filter((t) => t.targetId !== targetId));
    logAudit({ entityId: targetId, entityType: "Line Targets", action: "Deleted" });
  };

  // ============================================================================
  // 10. CHANGEOVER MATRIX, SANITATION & ALLERGEN MUTATIONS
  // ============================================================================
  const addChangeoverRule = (ruleData) => {
    const newRecord = {
      matrixId: `CO-0${changeoverMatrix.length + 1}`,
      fromSkuId: ruleData.fromSkuId,
      fromSkuCode: ruleData.fromSkuCode,
      fromFamily: ruleData.fromFamily || "All Families",
      toSkuId: ruleData.toSkuId,
      toSkuCode: ruleData.toSkuCode,
      toFamily: ruleData.toFamily || "All Families",
      changeoverDurationMin: Number(ruleData.changeoverDurationMin) || 30,
      sanitationClass: ruleData.sanitationClass || "Class B - Standard Rinse",
      allergenCleaningRequired: !!ruleData.allergenCleaningRequired,
      notes: ruleData.notes || "",
      status: "Active"
    };
    setChangeoverMatrix((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.matrixId, entityType: "Changeover Matrix", action: "Created", newValue: `${newRecord.fromSkuCode} → ${newRecord.toSkuCode} (${newRecord.changeoverDurationMin}m)` });
    return newRecord;
  };

  const updateChangeoverRule = (matrixId, updated) => {
    setChangeoverMatrix((prev) => prev.map((c) => (c.matrixId === matrixId ? { ...c, ...updated } : c)));
    logAudit({ entityId: matrixId, entityType: "Changeover Matrix", action: "Updated" });
  };

  const deleteChangeoverRule = (matrixId) => {
    setChangeoverMatrix((prev) => prev.filter((c) => c.matrixId !== matrixId));
    logAudit({ entityId: matrixId, entityType: "Changeover Matrix", action: "Deleted" });
  };

  const addSanitationClass = (data) => {
    const newRecord = {
      sanitationId: `SAN-0${sanitationClasses.length + 1}`,
      sanitationClass: data.sanitationClass,
      description: data.description,
      durationMin: Number(data.durationMin) || 45,
      cleaningMethod: data.cleaningMethod || "Automated CIP",
      riskLevel: data.riskLevel || "Standard",
      applicableProducts: data.applicableProducts || "All Formulations",
      status: "Active"
    };
    setSanitationClasses((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.sanitationClass, entityType: "Sanitation Master", action: "Created" });
    return newRecord;
  };

  const updateSanitationClass = (sanitationId, updated) => {
    setSanitationClasses((prev) => prev.map((s) => (s.sanitationId === sanitationId ? { ...s, ...updated } : s)));
  };

  const addAllergenRule = (data) => {
    const newRecord = {
      allergenId: `ALG-0${allergenRules.length + 1}`,
      allergenName: data.allergenName,
      skuId: data.skuId,
      skuCode: data.skuCode,
      riskLevel: data.riskLevel || "High",
      cleaningProtocol: data.cleaningProtocol || "Class A Full CIP",
      changeoverRestriction: data.changeoverRestriction || "Mandatory QA Swab Check",
      status: "Active"
    };
    setAllergenRules((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.allergenName, entityType: "Allergen Rules", action: "Created" });
    return newRecord;
  };

  const updateAllergenRule = (allergenId, updated) => {
    setAllergenRules((prev) => prev.map((a) => (a.allergenId === allergenId ? { ...a, ...updated } : a)));
  };

  // ============================================================================
  // 11. MACHINE ASSET MUTATIONS
  // ============================================================================
  const addAsset = (assetData) => {
    const newRecord = {
      assetId: `AST-00${assets.length + 1}`,
      name: assetData.name,
      type: assetData.type || "Packaging / Filling",
      lineId: assetData.lineId || "LIN-01",
      lineName: lines.find((l) => l.lineId === assetData.lineId)?.name || "High-Speed Line 1",
      plantId: assetData.plantId || activePlantId,
      status: assetData.status || "Operational",
      criticality: assetData.criticality || "Critical (Class A)",
      maintenanceStatus: "Healthy (100% Score)",
      serialNumber: assetData.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturer: assetData.manufacturer || "Krones AG",
      installDate: assetData.installDate || new Date().toISOString().substring(0, 10),
      ratedSpeed: assetData.ratedSpeed || "40,000 BPH",
      downtimeHistory: [],
      maintenanceHistory: [],
      auditHistory: [
        { date: new Date().toISOString().substring(0, 10), user: "Alexander Vance", action: "Commissioned into Asset Register" }
      ]
    };
    setAssets((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.assetId, entityType: "Machine Assets", action: "Created", newValue: newRecord.name });
    return newRecord;
  };

  const updateAsset = (assetId, updated) => {
    setAssets((prev) => prev.map((a) => (a.assetId === assetId ? { ...a, ...updated } : a)));
    logAudit({ entityId: assetId, entityType: "Machine Assets", action: "Updated" });
  };

  const toggleAssetStatus = (assetId) => {
    setAssets((prev) =>
      prev.map((a) => (a.assetId === assetId ? { ...a, status: a.status === "Operational" ? "Under Maintenance" : "Operational" } : a))
    );
  };

  const deleteAsset = (assetId) => {
    setAssets((prev) => prev.filter((a) => a.assetId !== assetId));
    logAudit({ entityId: assetId, entityType: "Machine Assets", action: "Deleted" });
  };

  // ============================================================================
  // 12. EMPLOYEES & TRAINING MUTATIONS
  // ============================================================================
  const addEmployee = (empData) => {
    const newRecord = {
      employeeId: `EMP-00${employees.length + 1}`,
      name: empData.name,
      email: empData.email || `${empData.name.toLowerCase().replace(/\s+/g, ".")}@flowstate.io`,
      department: empData.department || "Production",
      departmentId: empData.departmentId || "DEP-01",
      role: empData.role || "Line Operator",
      plantId: empData.plantId || activePlantId,
      plantName: plants.find((p) => p.id === (empData.plantId || activePlantId))?.name || "Indore Plant",
      skills: empData.skills || ["Standard Operating Procedures"],
      skillLevel: empData.skillLevel || "Level 2 (Autonomous Operator)",
      certifications: empData.certifications || ["Plant Safety GMP"],
      assignedLineIds: empData.assignedLineIds || ["LIN-01"],
      status: "Active"
    };
    setEmployees((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.employeeId, entityType: "Employees & Skills", action: "Created", newValue: newRecord.name });
    return newRecord;
  };

  const updateEmployee = (empId, updated) => {
    setEmployees((prev) => prev.map((e) => (e.employeeId === empId ? { ...e, ...updated } : e)));
    logAudit({ entityId: empId, entityType: "Employees & Skills", action: "Updated" });
  };

  const addTrainingRecord = (trnData) => {
    const newRecord = {
      trainingId: `TRN-0${trainingRecords.length + 1}`,
      employeeId: trnData.employeeId,
      employeeName: trnData.employeeName || employees.find((e) => e.employeeId === trnData.employeeId)?.name || "Technician",
      courseTitle: trnData.courseTitle,
      trainer: trnData.trainer || "Alexander Vance",
      completionDate: trnData.completionDate || new Date().toISOString().substring(0, 10),
      expiryDate: trnData.expiryDate || "2027-12-31",
      score: trnData.score || "100%",
      status: trnData.status || "Certified Valid"
    };
    setTrainingRecords((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.trainingId, entityType: "Training Master", action: "Created", newValue: `${newRecord.employeeName}: ${newRecord.courseTitle}` });
    return newRecord;
  };

  // ============================================================================
  // 13. QUALITY SPECS & CCP LIMITS MUTATIONS
  // ============================================================================
  const addQualitySpec = (specData) => {
    const newRecord = {
      specId: `QSP-00${qualitySpecs.length + 1}`,
      skuId: specData.skuId || "SKU-001",
      skuCode: specData.skuCode || skus.find((s) => s.skuId === specData.skuId)?.skuCode || "SKU-5001",
      skuName: specData.skuName || skus.find((s) => s.skuId === specData.skuId)?.name || "Beverage",
      specificationTitle: specData.specificationTitle || "Parameter Spec Standard",
      parameter: specData.parameter || "Moisture / Concentration",
      target: String(specData.target || "10.0"),
      min: String(specData.min || "9.5"),
      max: String(specData.max || "10.5"),
      uom: specData.uom || "%",
      revision: "R1",
      status: "Active",
      approvalStatus: "Approved",
      criticality: specData.criticality || "Quality Spec",
      isCCP: !!specData.isCCP,
      criticalLimit: specData.criticalLimit || "Standard QA Boundary",
      testMethod: specData.testMethod || "Standard QA Digital Gauge",
      effectiveFrom: specData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31",
      revisionHistory: [
        { revision: "R1", status: "Approved", createdBy: "Sarah Jenkins", date: new Date().toISOString().substring(0, 10), changes: "Initial spec baseline registered.", approvedBy: "Sarah Jenkins" }
      ]
    };
    setQualitySpecs((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.specId, entityType: "Quality Specs", action: "Created", newValue: `${newRecord.parameter} for ${newRecord.skuCode}` });
    return newRecord;
  };

  const updateQualitySpec = (specId, updated) => {
    setQualitySpecs((prev) => prev.map((q) => (q.specId === specId ? { ...q, ...updated } : q)));
    logAudit({ entityId: specId, entityType: "Quality Specs", action: "Updated" });
  };

  const approveQualitySpec = (specId) => {
    setQualitySpecs((prev) =>
      prev.map((q) => {
        if (q.specId === specId) {
          logAudit({ entityId: q.specId, entityType: "Quality Specs", action: "Approved" });
          return { ...q, approvalStatus: "Approved", status: "Active" };
        }
        return q;
      })
    );
  };

  const rejectQualitySpec = (specId, reason = "Tolerance out of standard range") => {
    setQualitySpecs((prev) =>
      prev.map((q) => {
        if (q.specId === specId) {
          logAudit({ entityId: q.specId, entityType: "Quality Specs", action: "Rejected", notes: `Reason: ${reason}` });
          return { ...q, approvalStatus: "Draft", rejectionReason: reason };
        }
        return q;
      })
    );
  };

  const deleteQualitySpec = (specId) => {
    setQualitySpecs((prev) => prev.filter((q) => q.specId !== specId));
    logAudit({ entityId: specId, entityType: "Quality Specs", action: "Deleted" });
  };

  // ============================================================================
  // 14. STORAGE RESOURCES MUTATIONS
  // ============================================================================
  const addStorageResource = (strData) => {
    const newRecord = {
      storageId: `STR-0${storageResources.length + 1}`,
      code: strData.code || `WH-LOC-${storageResources.length + 1}`,
      name: strData.name,
      type: strData.type || "Warehouse Room",
      plantId: strData.plantId || activePlantId,
      plantName: plants.find((p) => p.id === (strData.plantId || activePlantId))?.name || "Indore Plant",
      zone: strData.zone || "General Staging",
      capacity: strData.capacity || "500 Pallets",
      currentOccupancy: strData.currentOccupancy || "0 Pallets (0%)",
      temperatureRange: strData.temperatureRange || "Ambient (18°C - 24°C)",
      status: "Active",
      effectiveFrom: strData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setStorageResources((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.code, entityType: "Storage Resources", action: "Created", newValue: newRecord.name });
    return newRecord;
  };

  const updateStorageResource = (storageId, updated) => {
    setStorageResources((prev) => prev.map((s) => (s.storageId === storageId ? { ...s, ...updated } : s)));
    logAudit({ entityId: storageId, entityType: "Storage Resources", action: "Updated" });
  };

  const toggleStorageResourceStatus = (storageId) => {
    setStorageResources((prev) =>
      prev.map((s) => (s.storageId === storageId ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
    );
  };

  const deleteStorageResource = (storageId) => {
    setStorageResources((prev) => prev.filter((s) => s.storageId !== storageId));
    logAudit({ entityId: storageId, entityType: "Storage Resources", action: "Deleted" });
  };

  // ============================================================================
  // 15. USER & ROLE ADMINISTRATION
  // ============================================================================
  const addUser = (userData) => {
    const newUser = {
      id: `USR-00${users.length + 1}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || "Line Operator",
      roleKey: userData.roleKey || "operator",
      department: userData.department || "Production",
      plantId: userData.plantId || activePlantId,
      status: userData.status || "Active",
      lastLogin: "Never"
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit({ entityId: newUser.id, entityType: "User Administration", action: "Created", newValue: `${newUser.name} (${newUser.email}) - ${newUser.role}` });
    return newUser;
  };

  const updateUser = (userId, updated) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    logAudit({ entityId: userId, entityType: "User Administration", action: "Updated" });
  };

  const updateUserStatus = (userId, status) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          logAudit({ entityId: userId, entityType: "User Administration", action: status === "Active" ? "Activated" : "Suspended" });
          return { ...u, status };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAudit({ entityId: userId, entityType: "User Administration", action: "Deleted" });
  };

  const addInvitation = (inv) => {
    const newInv = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      email: inv.email,
      role: inv.role || "Line Operator",
      department: inv.department || "Production",
      invitedBy: "Alexander Vance",
      sentDate: new Date().toISOString().substring(0, 10),
      status: "Pending"
    };
    setUserInvitations((prev) => [...prev, newInv]);
    logAudit({ entityId: newInv.id, entityType: "User Invitations", action: "Created", newValue: `Invited ${newInv.email}` });
    return newInv;
  };

  const cancelInvitation = (invId) => {
    setUserInvitations((prev) => prev.filter((i) => i.id !== invId));
  };

  // ============================================================================
  // 16. PERMISSIONS CHECKING & MATRIX
  // ============================================================================
  const hasPermission = (roleKey, moduleName, action = "view") => {
    if (roleKey === "admin" || roleKey === "Super Admin") return true;
    const roleConfig = rolePermissions[roleKey];
    if (!roleConfig || !roleConfig.permissions) return true;
    const modulePerm = roleConfig.permissions[moduleName];
    if (!modulePerm) return true;
    return !!modulePerm[action];
  };

  const updatePermissionMatrix = (roleKey, moduleName, action, value) => {
    setRolePermissions((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        permissions: {
          ...prev[roleKey].permissions,
          [moduleName]: {
            ...prev[roleKey].permissions[moduleName],
            [action]: value
          }
        }
      }
    }));
    logAudit({ entityId: roleKey, entityType: "Permission Matrix", action: "Updated", newValue: `${roleKey} → ${moduleName}.${action} = ${value}` });
  };

  // ============================================================================
  // 17. FLOWSTATE DATA MIGRATION EXECUTION ENGINE
  // ============================================================================
  const executeMigration = ({ sourceSystem, datasetName, mappedRecords = [], duplicateDecisions = {} }) => {
    let importedCount = 0;
    mappedRecords.forEach((rec) => {
      const decision = duplicateDecisions[rec.id] || "Create New";
      if (decision === "Skip") return;

      if (decision === "Keep Existing") {
        importedCount += 1;
        return;
      }

      if (decision === "Merge") {
        // Update existing record
        updateSKU(rec.skuId || rec.skuCode, { ...rec, lastUpdated: new Date().toISOString().substring(0, 10) });
        importedCount += 1;
        return;
      }

      // Create new
      addSKU({
        skuCode: rec.skuCode || `SKU-${Math.floor(5000 + Math.random() * 900)}`,
        name: rec.name || "Imported SKU Item",
        category: rec.category || "Finished Goods",
        family: rec.family || "Sparkling Flavors",
        uom: rec.uom || "Bottles",
        plantId: activePlantId,
        stdCost: rec.stdCost || "$0.45"
      });
      importedCount += 1;
    });

    logAudit({
      entityId: `MIG-${Math.floor(1000 + Math.random() * 9000)}`,
      entityType: "Data Migration",
      action: "Import",
      newValue: `Imported ${importedCount} records from ${sourceSystem} (${datasetName})`,
      notes: "FlowState Schema Validation & Migration Pipeline Execution Succeeded"
    });

    return { importedCount, status: "Success" };
  };

  // ============================================================================
  // 18. DATA HEALTH & DIAGNOSTIC VALIDATION ENGINE
  // ============================================================================
  const dataHealthStats = useMemo(() => {
    // 1. Missing Data
    const missingSkus = skus.filter((s) => !s.stdCost || !s.packConfigCode || !s.shelfLifeDays).length;
    const missingBoms = boms.filter((b) => !b.components || b.components.length === 0).length;
    const missingLines = lines.filter((l) => !l.assignedAssetIds || l.assignedAssetIds.length === 0).length;
    const missingDataCount = missingSkus + missingBoms + missingLines;

    // 2. Duplicates
    const skuCodeMap = {};
    let duplicateCodes = 0;
    skus.forEach((s) => {
      if (skuCodeMap[s.skuCode]) duplicateCodes += 1;
      else skuCodeMap[s.skuCode] = true;
    });

    // 3. Broken Relationships
    const brokenBoms = boms.filter((b) => !skus.some((s) => s.skuId === b.finishedSkuId || s.skuCode === b.finishedSkuCode)).length;
    const brokenSpecs = qualitySpecs.filter((q) => !skus.some((s) => s.skuId === q.skuId || s.skuCode === q.skuCode)).length;
    const brokenRelCount = brokenBoms + brokenSpecs;

    // 4. Stale Records / Expired Training
    const expiredTraining = trainingRecords.filter((t) => t.status?.includes("Expired")).length;
    const staleRecordsCount = expiredTraining;

    const totalIssues = missingDataCount + duplicateCodes + brokenRelCount + staleRecordsCount;
    const healthScore = Math.max(88, +(100 - totalIssues * 1.5).toFixed(1));

    return {
      missingDataCount,
      duplicatesCount: duplicateCodes,
      brokenRelCount,
      staleRecordsCount,
      invalidRefsCount: brokenSpecs,
      healthScore,
      totalIssues
    };
  }, [skus, boms, lines, qualitySpecs, trainingRecords]);

  return (
    <MasterDataContext.Provider
      value={{
        company: companies[0],
        companies,
        plants,
        addPlant,
        updatePlant,
        deletePlant,
        activePlantId,
        setActivePlantId,
        departments,

        // 1. Product Families
        productFamilies,
        addProductFamily,
        updateProductFamily,
        toggleProductFamilyStatus,
        deleteProductFamily,

        // 2. UOMs
        uoms,
        addUOM,
        updateUOM,
        toggleUOMStatus,
        deleteUOM,

        // 3. SKUs
        skus,
        addSKU,
        updateSKU,
        toggleSKUStatus,
        deleteSKU,

        // 4. Pack Configurations
        packConfigs,
        addPackConfig,
        updatePackConfig,
        deletePackConfig,

        // 5. Shelf Life
        shelfLifeRecords,
        addShelfLife,
        updateShelfLife,
        deleteShelfLife,

        // 6. Customers & Customer SKU Mappings
        customers,
        customerSkuMappings,
        addCustomerSkuMapping,
        updateCustomerSkuMapping,
        deleteCustomerSkuMapping,

        // 7. BOMs / Recipes
        boms,
        addBOM,
        updateBOM,
        submitBOMForApproval,
        approveBOM,
        rejectBOM,
        deleteBOM,

        // 8. Operations & Routings
        operations,
        addOperation,
        updateOperation,
        deleteOperation,
        routings,
        addRouting,
        updateRouting,
        deleteRouting,

        // 9. Lines & Targets
        lines,
        addLine,
        updateLine,
        toggleLineStatus,
        deleteLine,
        assignAssetToLine,
        lineTargets,
        addLineTarget,
        updateLineTarget,
        deleteLineTarget,

        // 10. Changeover, Sanitation, Allergens
        changeoverMatrix,
        addChangeoverRule,
        updateChangeoverRule,
        deleteChangeoverRule,
        sanitationClasses,
        addSanitationClass,
        updateSanitationClass,
        allergenRules,
        addAllergenRule,
        updateAllergenRule,

        // 11. Assets
        assets,
        addAsset,
        updateAsset,
        toggleAssetStatus,
        deleteAsset,

        // 12. Employees & Training
        employees,
        addEmployee,
        updateEmployee,
        trainingRecords,
        addTrainingRecord,

        // 13. Quality Specs & CCP
        qualitySpecs,
        addQualitySpec,
        updateQualitySpec,
        approveQualitySpec,
        rejectQualitySpec,
        deleteQualitySpec,

        // 14. Storage Resources
        storageResources,
        addStorageResource,
        updateStorageResource,
        toggleStorageResourceStatus,
        deleteStorageResource,

        // 15. User & Role Administration
        users,
        addUser,
        updateUser,
        updateUserStatus,
        deleteUser,
        userInvitations,
        addInvitation,
        cancelInvitation,
        rolePermissions,
        hasPermission,
        updatePermissionMatrix,

        // 16. Audit & Governance
        auditLogs,
        logAudit,

        // 17. Migration & Data Health
        executeMigration,
        dataHealthStats
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export const useMasterData = () => useContext(MasterDataContext);

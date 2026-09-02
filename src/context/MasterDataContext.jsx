import React, { createContext, useContext, useState, useEffect } from "react";

const MasterDataContext = createContext();

// ==========================================
// INITIAL MOCK MASTER DATASETS (STABLE IDs)
// ==========================================

export const INITIAL_COMPANIES = [
  { id: "CMP-01", name: "ABC Manufacturing Global", code: "ABCMFG", currency: "USD", status: "Active" }
];

export const INITIAL_PLANTS = [
  { id: "PLT-01", companyId: "CMP-01", code: "PLT-IND", name: "Indore Plant - Processing & Bottling", location: "Indore, MP", capacity: "350,000 Units/Day", status: "Active" },
  { id: "PLT-02", companyId: "CMP-01", code: "PLT-AUST", name: "Austin Facility - Canning & Logistics", location: "Austin, TX", capacity: "280,000 Units/Day", status: "Active" }
];

export const INITIAL_SKUS = [
  {
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    category: "Finished Goods",
    family: "Sparkling Flavors",
    uom: "Bottles",
    plantId: "PLT-01",
    stdCost: "$0.42",
    revision: "R3",
    status: "Active",
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
    family: "Tonics & Mixers",
    uom: "Bottles",
    plantId: "PLT-01",
    stdCost: "$0.68",
    revision: "R2",
    status: "Active",
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
    family: "Ginger Beers",
    uom: "Cans",
    plantId: "PLT-02",
    stdCost: "$0.38",
    revision: "R4",
    status: "Active",
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
    family: "Sweeteners",
    uom: "Liters",
    plantId: "PLT-01",
    stdCost: "$1.20",
    revision: "R1",
    status: "Active",
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
    family: "Flavorings",
    uom: "Kg",
    plantId: "PLT-01",
    stdCost: "$18.50",
    revision: "R2",
    status: "Active",
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
    family: "Caps & Closures",
    uom: "Units",
    plantId: "PLT-01",
    stdCost: "$0.025",
    revision: "R1",
    status: "Active",
    description: "High-density polyethylene closure with gas-retention seal liner.",
    createdBy: "Robert Thorne",
    createdDate: "2026-05-01",
    lastUpdated: "2026-08-10"
  }
];

export const INITIAL_BOMS = [
  {
    bomId: "BOM-001",
    bomNumber: "BOM-5001",
    finishedSkuId: "SKU-001",
    finishedSkuName: "500ml Sparkling Citrus Soda",
    revision: "R3",
    effectiveDate: "2026-08-01",
    status: "Active",
    approvalStatus: "Approved",
    batchSize: "10,000 Liters",
    yieldTarget: "99.4%",
    createdBy: "Alexander Vance",
    lastUpdated: "2026-08-30",
    components: [
      { id: "CMP-01", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 850, uom: "Liters", scrapFactor: "0.5%" },
      { id: "CMP-02", skuId: "SKU-102", skuCode: "ING-1002", name: "Natural Citrus Essential Oil Compound", quantity: 18.5, uom: "Kg", scrapFactor: "0.2%" },
      { id: "CMP-03", skuId: "SKU-201", skuCode: "PKG-2001", name: "28mm Tamper-Evident HDPE Bottle Cap", quantity: 20000, uom: "Units", scrapFactor: "1.0%" }
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
    finishedSkuName: "1L Tonic Water Natural Quinine",
    revision: "R2",
    effectiveDate: "2026-07-15",
    status: "Active",
    approvalStatus: "Approved",
    batchSize: "8,000 Liters",
    yieldTarget: "99.2%",
    createdBy: "Sarah Jenkins",
    lastUpdated: "2026-08-28",
    components: [
      { id: "CMP-11", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 560, uom: "Liters", scrapFactor: "0.5%" },
      { id: "CMP-12", skuId: "SKU-201", skuCode: "PKG-2001", name: "28mm Tamper-Evident HDPE Bottle Cap", quantity: 8000, uom: "Units", scrapFactor: "1.2%" }
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
    finishedSkuName: "330ml Organic Ginger Beer",
    revision: "R4",
    effectiveDate: "2026-08-20",
    status: "Active",
    approvalStatus: "Approved",
    batchSize: "12,000 Liters",
    yieldTarget: "99.0%",
    createdBy: "Alexander Vance",
    lastUpdated: "2026-08-29",
    components: [
      { id: "CMP-21", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 1100, uom: "Liters", scrapFactor: "0.4%" }
    ],
    revisionHistory: [
      { revision: "R4", status: "Approved", createdBy: "Alexander Vance", date: "2026-08-29", changes: "Ginger root infusion duration extended to 4.5 hours.", approvedBy: "Sarah Jenkins" }
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
    capacity: "42,000 BPH (Bottles/Hour)",
    status: "Active",
    supervisorId: "EMP-005",
    supervisorName: "David Kim",
    assignedAssetIds: ["AST-001", "AST-002", "AST-003", "AST-004"],
    ratedOEE: "88.5%",
    currentRunningSku: "SKU-5001"
  },
  {
    lineId: "LIN-02",
    lineCode: "LINE-2",
    name: "Medium-Speed Glass Bottling Line 2",
    plantId: "PLT-01",
    plantName: "Indore Plant - Processing & Bottling",
    capacity: "28,000 BPH",
    status: "Active",
    supervisorId: "EMP-005",
    supervisorName: "David Kim",
    assignedAssetIds: ["AST-005"],
    ratedOEE: "84.2%",
    currentRunningSku: "SKU-5002"
  },
  {
    lineId: "LIN-03",
    lineCode: "LINE-3",
    name: "Automated Sleek Canning Line 3",
    plantId: "PLT-02",
    plantName: "Austin Facility - Canning & Logistics",
    capacity: "55,000 CPH (Cans/Hour)",
    status: "Active",
    supervisorId: "EMP-007",
    supervisorName: "Elena Rostova",
    assignedAssetIds: ["AST-006"],
    ratedOEE: "91.0%",
    currentRunningSku: "SKU-5003"
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
    testMethod: "Digital Refractometer Ref-300",
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
    testMethod: "CarboQC Piercing Gauge",
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
    testMethod: "Benchtop pH Probe Metrohm 913",
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
    testMethod: "Gravimetric Density Checkweighing",
    revisionHistory: [
      { revision: "R2", status: "Approved", createdBy: "Sarah Jenkins", date: "2026-08-14", changes: "Adjusted target fill from 500 to 502 mL to guarantee 0% underfill.", approvedBy: "Robert Thorne" }
    ]
  }
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
      "BOM / Recipe": { view: true, create: true, edit: true, delete: true, approve: true },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: true, approve: true },
      "Machine Assets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: true, approve: true },
      "Quality Specs": { view: true, create: true, edit: true, delete: true, approve: true },
      "Production": { view: true, create: true, edit: true, delete: true, approve: true },
      "Maintenance & CMMS": { view: true, create: true, edit: true, delete: true, approve: true },
      "Data Migration": { view: true, create: true, edit: true, delete: true, approve: true },
      "Audit Trail": { view: true, create: true, edit: true, delete: false, approve: true },
      "Executive Reports": { view: true, create: true, edit: true, delete: true, approve: true }
    }
  },
  plant_manager: {
    label: "Plant Manager",
    permissions: {
      "SKU Master": { view: true, create: true, edit: true, delete: false, approve: true },
      "BOM / Recipe": { view: true, create: true, edit: true, delete: false, approve: true },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: false, approve: true },
      "Machine Assets": { view: true, create: true, edit: true, delete: false, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: false, approve: true },
      "Quality Specs": { view: true, create: true, edit: true, delete: false, approve: true },
      "Production": { view: true, create: true, edit: true, delete: true, approve: true },
      "Maintenance & CMMS": { view: true, create: true, edit: true, delete: false, approve: true },
      "Data Migration": { view: true, create: true, edit: false, delete: false, approve: true },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false },
      "Executive Reports": { view: true, create: true, edit: true, delete: false, approve: true }
    }
  },
  qa_manager: {
    label: "Quality Manager",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: true },
      "Work Centers / Lines": { view: true, create: false, edit: false, delete: false, approve: false },
      "Machine Assets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Employees & Skills": { view: true, create: false, edit: false, delete: false, approve: false },
      "Quality Specs": { view: true, create: true, edit: true, delete: true, approve: true },
      "Production": { view: true, create: false, edit: false, delete: false, approve: true },
      "Maintenance & CMMS": { view: true, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false },
      "Executive Reports": { view: true, create: true, edit: false, delete: false, approve: true }
    }
  },
  maintenance: {
    label: "Maintenance Manager / Lead",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: false },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: false, approve: false },
      "Machine Assets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: false, approve: false },
      "Quality Specs": { view: true, create: false, edit: false, delete: false, approve: false },
      "Production": { view: true, create: false, edit: false, delete: false, approve: false },
      "Maintenance & CMMS": { view: true, create: true, edit: true, delete: true, approve: true },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false },
      "Executive Reports": { view: true, create: true, edit: false, delete: false, approve: false }
    }
  },
  operator: {
    label: "Line Operator",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: false },
      "Work Centers / Lines": { view: true, create: false, edit: false, delete: false, approve: false },
      "Machine Assets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Employees & Skills": { view: false, create: false, edit: false, delete: false, approve: false },
      "Quality Specs": { view: true, create: false, edit: false, delete: false, approve: false },
      "Production": { view: true, create: true, edit: false, delete: false, approve: false },
      "Maintenance & CMMS": { view: true, create: true, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: false, create: false, edit: false, delete: false, approve: false },
      "Executive Reports": { view: false, create: false, edit: false, delete: false, approve: false }
    }
  }
};

// ==========================================
// PROVIDER IMPLEMENTATION
// ==========================================

export function MasterDataProvider({ children }) {
  const [company] = useState(INITIAL_COMPANIES[0]);
  const [plants] = useState(INITIAL_PLANTS);
  const [activePlantId, setActivePlantId] = useState("PLT-01");

  // Master States with LocalStorage Cache
  const [skus, setSkus] = useState(() => {
    const saved = localStorage.getItem("mx_master_skus");
    return saved ? JSON.parse(saved) : INITIAL_SKUS;
  });

  const [boms, setBoms] = useState(() => {
    const saved = localStorage.getItem("mx_master_boms");
    return saved ? JSON.parse(saved) : INITIAL_BOMS;
  });

  const [lines, setLines] = useState(() => {
    const saved = localStorage.getItem("mx_master_lines");
    return saved ? JSON.parse(saved) : INITIAL_LINES;
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("mx_master_assets");
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("mx_master_employees");
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [qualitySpecs, setQualitySpecs] = useState(() => {
    const saved = localStorage.getItem("mx_master_quality_specs");
    return saved ? JSON.parse(saved) : INITIAL_QUALITY_SPECS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("mx_master_audit_logs");
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem("mx_master_permissions");
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PERMISSIONS;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem("mx_master_skus", JSON.stringify(skus));
  }, [skus]);

  useEffect(() => {
    localStorage.setItem("mx_master_boms", JSON.stringify(boms));
  }, [boms]);

  useEffect(() => {
    localStorage.setItem("mx_master_lines", JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    localStorage.setItem("mx_master_assets", JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem("mx_master_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("mx_master_quality_specs", JSON.stringify(qualitySpecs));
  }, [qualitySpecs]);

  useEffect(() => {
    localStorage.setItem("mx_master_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("mx_master_permissions", JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // ==========================================
  // AUDIT LOG HELPER
  // ==========================================
  const logAudit = ({ entityId, entityType, action, field = "-", oldValue = "-", newValue = "-", notes = "" }) => {
    const newEntry = {
      auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      user: "Alexander Vance",
      userRole: "System Administrator",
      entityId,
      entityType,
      action,
      field,
      oldValue,
      newValue,
      notes
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // ==========================================
  // 1. SKU MUTATIONS
  // ==========================================
  const addSKU = (skuData) => {
    const newId = `SKU-${Math.floor(5000 + Math.random() * 900)}`;
    const newRecord = {
      skuId: `SKU-00${skus.length + 1}`,
      skuCode: skuData.skuCode || newId,
      name: skuData.name,
      category: skuData.category || "Finished Goods",
      family: skuData.family || "Beverages",
      uom: skuData.uom || "Bottles",
      plantId: skuData.plantId || activePlantId,
      stdCost: skuData.stdCost || "$0.50",
      revision: "R1",
      status: skuData.status || "Active",
      description: skuData.description || "",
      createdBy: "Alexander Vance",
      createdDate: new Date().toISOString().substring(0, 10),
      lastUpdated: new Date().toISOString().substring(0, 10)
    };
    setSkus((prev) => [newRecord, ...prev]);
    logAudit({
      entityId: newRecord.skuCode,
      entityType: "SKU Master",
      action: "Created",
      newValue: `Name: ${newRecord.name}, Category: ${newRecord.category}, UOM: ${newRecord.uom}`,
      notes: "New SKU registered in Master Data"
    });
    return newRecord;
  };

  const updateSKU = (skuId, updatedFields) => {
    let oldRecord = null;
    setSkus((prev) =>
      prev.map((s) => {
        if (s.skuId === skuId || s.skuCode === skuId) {
          oldRecord = s;
          return {
            ...s,
            ...updatedFields,
            lastUpdated: new Date().toISOString().substring(0, 10)
          };
        }
        return s;
      })
    );
    if (oldRecord) {
      logAudit({
        entityId: oldRecord.skuCode,
        entityType: "SKU Master",
        action: "Updated",
        oldValue: `Name: ${oldRecord.name}, Status: ${oldRecord.status}`,
        newValue: `Name: ${updatedFields.name || oldRecord.name}, Status: ${updatedFields.status || oldRecord.status}`,
        notes: "SKU record modified"
      });
    }
  };

  const toggleSKUStatus = (skuId) => {
    setSkus((prev) =>
      prev.map((s) => {
        if (s.skuId === skuId || s.skuCode === skuId) {
          const nextStatus = s.status === "Active" ? "Inactive" : "Active";
          logAudit({
            entityId: s.skuCode,
            entityType: "SKU Master",
            action: nextStatus === "Active" ? "Activated" : "Deactivated",
            oldValue: `status = ${s.status}`,
            newValue: `status = ${nextStatus}`
          });
          return { ...s, status: nextStatus, lastUpdated: new Date().toISOString().substring(0, 10) };
        }
        return s;
      })
    );
  };

  // ==========================================
  // 2. BOM & RECIPE MUTATIONS
  // ==========================================
  const addBOM = (bomData) => {
    const newBomNumber = `BOM-${Math.floor(5000 + Math.random() * 900)}`;
    const newRecord = {
      bomId: `BOM-00${boms.length + 1}`,
      bomNumber: bomData.bomNumber || newBomNumber,
      finishedSkuId: bomData.finishedSkuId || "SKU-001",
      finishedSkuName: bomData.finishedSkuName || "Custom Recipe Product",
      revision: "R1",
      effectiveDate: new Date().toISOString().substring(0, 10),
      status: "Draft",
      approvalStatus: "Draft",
      batchSize: bomData.batchSize || "10,000 Liters",
      yieldTarget: bomData.yieldTarget || "99.0%",
      createdBy: "Alexander Vance",
      lastUpdated: new Date().toISOString().substring(0, 10),
      components: bomData.components || [],
      revisionHistory: [
        { revision: "R1", status: "Draft", createdBy: "Alexander Vance", date: new Date().toISOString().substring(0, 10), changes: "Initial BOM Draft Formulation created.", approvedBy: "-" }
      ]
    };
    setBoms((prev) => [newRecord, ...prev]);
    logAudit({
      entityId: newRecord.bomNumber,
      entityType: "BOM Recipe",
      action: "Created",
      newValue: `Product: ${newRecord.finishedSkuName}, Batch: ${newRecord.batchSize}, Status: Draft`,
      notes: "New Recipe Draft Registered"
    });
    return newRecord;
  };

  const updateBOM = (bomId, updatedFields) => {
    setBoms((prev) =>
      prev.map((b) => (b.bomId === bomId || b.bomNumber === bomId ? { ...b, ...updatedFields, lastUpdated: new Date().toISOString().substring(0, 10) } : b))
    );
  };

  const submitBOMForApproval = (bomId) => {
    setBoms((prev) =>
      prev.map((b) => {
        if (b.bomId === bomId || b.bomNumber === bomId) {
          logAudit({
            entityId: b.bomNumber,
            entityType: "BOM Recipe",
            action: "Submitted",
            oldValue: `status = ${b.status}`,
            newValue: `status = Under Review`,
            notes: "BOM submitted for Quality & Plant Manager Approval"
          });
          return {
            ...b,
            status: "Under Review",
            approvalStatus: "Under Review",
            lastUpdated: new Date().toISOString().substring(0, 10)
          };
        }
        return b;
      })
    );
  };

  const approveBOM = (bomId, approverName = "Sarah Jenkins") => {
    setBoms((prev) =>
      prev.map((b) => {
        if (b.bomId === bomId || b.bomNumber === bomId) {
          const updatedHistory = b.revisionHistory.map((rev, idx) =>
            idx === 0 ? { ...rev, status: "Approved", approvedBy: approverName } : rev
          );
          logAudit({
            entityId: b.bomNumber,
            entityType: "BOM Recipe",
            action: "Approved",
            oldValue: `status = ${b.status}`,
            newValue: `status = Active (Approved by ${approverName})`,
            notes: "BOM formula approved and promoted to Active production"
          });
          return {
            ...b,
            status: "Active",
            approvalStatus: "Approved",
            revisionHistory: updatedHistory,
            lastUpdated: new Date().toISOString().substring(0, 10)
          };
        }
        return b;
      })
    );
  };

  const rejectBOM = (bomId, reason = "Tolerance out of standard range") => {
    setBoms((prev) =>
      prev.map((b) => {
        if (b.bomId === bomId || b.bomNumber === bomId) {
          logAudit({
            entityId: b.bomNumber,
            entityType: "BOM Recipe",
            action: "Rejected",
            oldValue: `status = ${b.status}`,
            newValue: `status = Draft (Rejected)`,
            notes: `Rejection reason: ${reason}`
          });
          return {
            ...b,
            status: "Draft",
            approvalStatus: "Draft",
            rejectionReason: reason,
            lastUpdated: new Date().toISOString().substring(0, 10)
          };
        }
        return b;
      })
    );
  };

  // ==========================================
  // 3. LINE & WORK CENTER MUTATIONS
  // ==========================================
  const addLine = (lineData) => {
    const newRecord = {
      lineId: `LIN-0${lines.length + 1}`,
      lineCode: lineData.lineCode || `LINE-${lines.length + 1}`,
      name: lineData.name,
      plantId: lineData.plantId || activePlantId,
      plantName: plants.find((p) => p.id === (lineData.plantId || activePlantId))?.name || "Indore Plant",
      capacity: lineData.capacity || "30,000 BPH",
      status: "Active",
      supervisorId: lineData.supervisorId || "EMP-005",
      supervisorName: lineData.supervisorName || "David Kim",
      assignedAssetIds: lineData.assignedAssetIds || [],
      ratedOEE: "85.0%"
    };
    setLines((prev) => [newRecord, ...prev]);
    logAudit({
      entityId: newRecord.lineCode,
      entityType: "Work Centers / Lines",
      action: "Created",
      newValue: `Line: ${newRecord.name}, Capacity: ${newRecord.capacity}`,
      notes: "New production line configured"
    });
    return newRecord;
  };

  const updateLine = (lineId, updatedFields) => {
    setLines((prev) => prev.map((l) => (l.lineId === lineId || l.lineCode === lineId ? { ...l, ...updatedFields } : l)));
  };

  const assignAssetToLine = (lineId, assetId) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.lineId === lineId || l.lineCode === lineId) {
          const nextAssets = l.assignedAssetIds.includes(assetId)
            ? l.assignedAssetIds
            : [...l.assignedAssetIds, assetId];
          return { ...l, assignedAssetIds: nextAssets };
        }
        return l;
      })
    );
    // Also update asset's lineId
    setAssets((prev) =>
      prev.map((a) => (a.assetId === assetId ? { ...a, lineId, lineName: lines.find((l) => l.lineId === lineId)?.name || lineId } : a))
    );
    logAudit({
      entityId: lineId,
      entityType: "Work Centers / Lines",
      action: "Updated",
      newValue: `Assigned Asset ${assetId} to Line ${lineId}`,
      notes: "Equipment allocation updated"
    });
  };

  const toggleLineStatus = (lineId) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId || l.lineCode === lineId ? { ...l, status: l.status === "Active" ? "Inactive" : "Active" } : l))
    );
  };

  // ==========================================
  // 4. ASSET MUTATIONS
  // ==========================================
  const addAsset = (assetData) => {
    const newRecord = {
      assetId: `AST-00${assets.length + 1}`,
      name: assetData.name,
      type: assetData.type || "Packaging / Filling",
      lineId: assetData.lineId || "LIN-01",
      lineName: lines.find((l) => l.lineId === assetData.lineId)?.name || "High-Speed Bottling Line 1",
      plantId: assetData.plantId || activePlantId,
      status: assetData.status || "Operational",
      criticality: assetData.criticality || "High (Class B)",
      maintenanceStatus: "Healthy (100% Score)",
      serialNumber: assetData.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturer: assetData.manufacturer || "Generic OEM",
      installDate: assetData.installDate || new Date().toISOString().substring(0, 10),
      downtimeHistory: [],
      maintenanceHistory: [],
      auditHistory: [
        { date: new Date().toISOString().substring(0, 10), user: "Alexander Vance", action: "Commissioned into Asset Register" }
      ]
    };
    setAssets((prev) => [newRecord, ...prev]);
    logAudit({
      entityId: newRecord.assetId,
      entityType: "Machine Assets",
      action: "Created",
      newValue: `Asset: ${newRecord.name}, Criticality: ${newRecord.criticality}`,
      notes: "New physical machine asset commissioned"
    });
    return newRecord;
  };

  const updateAsset = (assetId, updatedFields) => {
    setAssets((prev) => prev.map((a) => (a.assetId === assetId ? { ...a, ...updatedFields } : a)));
  };

  const toggleAssetStatus = (assetId) => {
    setAssets((prev) =>
      prev.map((a) => (a.assetId === assetId ? { ...a, status: a.status === "Operational" ? "Under Maintenance" : "Operational" } : a))
    );
  };

  // ==========================================
  // 5. EMPLOYEE MUTATIONS
  // ==========================================
  const addEmployee = (empData) => {
    const newRecord = {
      employeeId: `EMP-00${employees.length + 1}`,
      name: empData.name,
      email: empData.email || `${empData.name.toLowerCase().replace(/\s+/g, ".")}@flowstate.io`,
      department: empData.department || "Production",
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
    logAudit({
      entityId: newRecord.employeeId,
      entityType: "Employees & Skills",
      action: "Created",
      newValue: `Name: ${newRecord.name}, Role: ${newRecord.role}, Dept: ${newRecord.department}`,
      notes: "Employee profile & skill qualification created"
    });
    return newRecord;
  };

  const updateEmployee = (empId, updatedFields) => {
    setEmployees((prev) => prev.map((e) => (e.employeeId === empId ? { ...e, ...updatedFields } : e)));
  };

  // ==========================================
  // 6. QUALITY SPECIFICATIONS MUTATIONS
  // ==========================================
  const addQualitySpec = (specData) => {
    const newRecord = {
      specId: `QSP-00${qualitySpecs.length + 1}`,
      skuId: specData.skuId || "SKU-001",
      skuCode: skus.find((s) => s.skuId === specData.skuId)?.skuCode || "SKU-5001",
      skuName: skus.find((s) => s.skuId === specData.skuId)?.name || "500ml Sparkling Citrus Soda",
      specificationTitle: specData.specificationTitle || "Parameter Specification",
      parameter: specData.parameter || "Moisture",
      target: specData.target || "5.0",
      min: specData.min || "4.0",
      max: specData.max || "6.0",
      uom: specData.uom || "%",
      revision: "R1",
      status: "Active",
      approvalStatus: "Approved",
      criticality: specData.criticality || "Quality Spec",
      testMethod: specData.testMethod || "Standard Lab QA Protocol",
      revisionHistory: [
        { revision: "R1", status: "Approved", createdBy: "Sarah Jenkins", date: new Date().toISOString().substring(0, 10), changes: "Initial specification baseline.", approvedBy: "Sarah Jenkins" }
      ]
    };
    setQualitySpecs((prev) => [newRecord, ...prev]);
    logAudit({
      entityId: newRecord.specId,
      entityType: "Quality Specs",
      action: "Created",
      newValue: `Parameter: ${newRecord.parameter} [${newRecord.min} - ${newRecord.max} ${newRecord.uom}] for ${newRecord.skuCode}`,
      notes: "Quality parameter specification registered"
    });
    return newRecord;
  };

  const updateQualitySpec = (specId, updatedFields) => {
    setQualitySpecs((prev) => prev.map((q) => (q.specId === specId ? { ...q, ...updatedFields } : q)));
  };

  const approveQualitySpec = (specId) => {
    setQualitySpecs((prev) =>
      prev.map((q) => {
        if (q.specId === specId) {
          logAudit({
            entityId: q.specId,
            entityType: "Quality Specs",
            action: "Approved",
            oldValue: `approvalStatus = ${q.approvalStatus}`,
            newValue: `approvalStatus = Approved`
          });
          return { ...q, approvalStatus: "Approved", status: "Active" };
        }
        return q;
      })
    );
  };

  const rejectQualitySpec = (specId, reason = "Tolerance too wide") => {
    setQualitySpecs((prev) =>
      prev.map((q) => {
        if (q.specId === specId) {
          logAudit({
            entityId: q.specId,
            entityType: "Quality Specs",
            action: "Rejected",
            oldValue: `approvalStatus = ${q.approvalStatus}`,
            newValue: `approvalStatus = Draft`,
            notes: `Rejected with reason: ${reason}`
          });
          return { ...q, approvalStatus: "Draft", rejectionReason: reason };
        }
        return q;
      })
    );
  };

  // ==========================================
  // PERMISSION CHECKING ENGINE
  // ==========================================
  const hasPermission = (roleId, module, action = "view") => {
    if (roleId === "admin" || roleId === "Super Admin") return true;
    const roleConfig = rolePermissions[roleId];
    if (!roleConfig || !roleConfig.permissions) return true; // Default permissive for demonstration
    const modulePerm = roleConfig.permissions[module];
    if (!modulePerm) return true;
    return !!modulePerm[action];
  };

  const updatePermissionMatrix = (roleKey, module, action, val) => {
    setRolePermissions((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        permissions: {
          ...prev[roleKey].permissions,
          [module]: {
            ...prev[roleKey].permissions[module],
            [action]: val
          }
        }
      }
    }));
  };

  return (
    <MasterDataContext.Provider
      value={{
        company,
        plants,
        activePlantId,
        setActivePlantId,

        // SKUs
        skus,
        addSKU,
        updateSKU,
        toggleSKUStatus,

        // BOMs
        boms,
        addBOM,
        updateBOM,
        submitBOMForApproval,
        approveBOM,
        rejectBOM,

        // Lines
        lines,
        addLine,
        updateLine,
        assignAssetToLine,
        toggleLineStatus,

        // Assets
        assets,
        addAsset,
        updateAsset,
        toggleAssetStatus,

        // Employees
        employees,
        addEmployee,
        updateEmployee,

        // Quality Specs
        qualitySpecs,
        addQualitySpec,
        updateQualitySpec,
        approveQualitySpec,
        rejectQualitySpec,

        // Audit Logs
        auditLogs,
        logAudit,

        // Permissions
        rolePermissions,
        hasPermission,
        updatePermissionMatrix
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export const useMasterData = () => useContext(MasterDataContext);

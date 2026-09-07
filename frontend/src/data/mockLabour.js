// Labour / Manage People Mock Data for MaintenX OS

export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-101",
    name: "Elena Rostova",
    role: "Senior Lead Operator",
    department: "Packaging",
    shift: "Shift A (Day)",
    plant: "Oakville Facility - Line 1",
    skills: ["Aseptic Filling Level 4", "CIP / SIP Sanitation", "HMI Diagnostics", "Forklift Certified"],
    skillLevel: "Expert",
    trainingStatus: "Up to Date",
    qualificationStatus: "Fully Qualified",
    status: "On Shift",
    productivityScore: 98.4,
    unitsPerHour: 168,
    efficiency: "99.1%",
    hoursWorkedMonth: 168,
    activeStation: "Line 1 — Filler HMI",
    shiftTiming: "06:00 - 14:30",
    certifications: ["HACCP Level 3", "ISO 22000 Lead Tech", "OSHA 30"],
    avatar: "ER"
  },
  {
    id: "EMP-102",
    name: "Marcus Vance",
    role: "Senior Reliability Technician",
    department: "Maintenance",
    shift: "Shift A (Day)",
    plant: "Oakville Facility - Line 1",
    skills: ["Vibration Analysis Cat II", "Laser Alignment", "Hydraulic Overhaul", "PLC Troubleshooting"],
    skillLevel: "Expert",
    trainingStatus: "Up to Date",
    qualificationStatus: "Certified",
    status: "On Shift",
    productivityScore: 98.8,
    unitsPerHour: 172,
    efficiency: "98.8%",
    hoursWorkedMonth: 172,
    activeStation: "Maintenance Rapid Bay",
    shiftTiming: "06:00 - 14:30",
    certifications: ["CMRP Certified Maintenance", "Arc Flash NFPA 70E", "LOTO Level 4"],
    avatar: "MV"
  },
  {
    id: "EMP-103",
    name: "Sarah Jenkins",
    role: "Lead Quality Specialist",
    department: "Quality Assurance",
    shift: "Shift A (Day)",
    plant: "Oakville Facility - Line 1",
    skills: ["Microbiological Assay", "HPLC Chromatography", "CCP Verification", "Root Cause Analysis"],
    skillLevel: "Advanced",
    trainingStatus: "Up to Date",
    qualificationStatus: "Fully Qualified",
    status: "On Shift",
    productivityScore: 96.5,
    unitsPerHour: 156,
    efficiency: "97.4%",
    hoursWorkedMonth: 160,
    activeStation: "Line 1 In-Line QA Station",
    shiftTiming: "06:00 - 14:30",
    certifications: ["PCQI Preventive Controls", "Six Sigma Green Belt", "SQF Practitioner"],
    avatar: "SJ"
  },
  {
    id: "EMP-104",
    name: "David Kim",
    role: "Maintenance Technician",
    department: "Maintenance",
    shift: "Shift B (Evening)",
    plant: "Oakville Facility - Line 1",
    skills: ["Thermal Systems", "Pneumatic Valves", "Motor Rewinding", "Preventive Maintenance"],
    skillLevel: "Intermediate",
    trainingStatus: "Due Soon",
    qualificationStatus: "Certified",
    status: "Active",
    productivityScore: 93.5,
    unitsPerHour: 148,
    efficiency: "94.5%",
    hoursWorkedMonth: 164,
    activeStation: "Line 2 Formulation Cell",
    shiftTiming: "14:30 - 22:30",
    certifications: ["EPA Section 608 Universal", "Electrical Safety"],
    avatar: "DK"
  },
  {
    id: "EMP-105",
    name: "Thomas Sterling",
    role: "Operations Supervisor",
    department: "Production",
    shift: "Shift A (Day)",
    plant: "Oakville Facility - Line 1",
    skills: ["MES Master Scheduling", "Line Optimization", "Incident Command", "Lean 5S"],
    skillLevel: "Expert",
    trainingStatus: "Up to Date",
    qualificationStatus: "Fully Qualified",
    status: "On Shift",
    productivityScore: 99.0,
    unitsPerHour: 180,
    efficiency: "99.4%",
    hoursWorkedMonth: 180,
    activeStation: "Central Control Pod",
    shiftTiming: "06:00 - 14:30",
    certifications: ["Six Sigma Black Belt", "Lean Manufacturing Bronze", "First Aid / CPR"],
    avatar: "TS"
  },
  {
    id: "EMP-106",
    name: "Carlos Mendez",
    role: "Packaging Machine Operator",
    department: "Packaging",
    shift: "Shift A (Day)",
    plant: "Oakville Facility - Line 1",
    skills: ["Case Packer Setup", "Cartoner Jam Clearing", "Robotic Palletizer", "Safety Guarding"],
    skillLevel: "Intermediate",
    trainingStatus: "In Progress",
    qualificationStatus: "In Qualification",
    status: "On Shift",
    productivityScore: 94.2,
    unitsPerHour: 144,
    efficiency: "95.1%",
    hoursWorkedMonth: 162,
    activeStation: "Line 1 Case Packer Station",
    shiftTiming: "06:00 - 14:30",
    certifications: ["Packaging Operator L2", "LOTO Level 2"],
    avatar: "CM"
  },
  {
    id: "EMP-107",
    name: "Amara Okafor",
    role: "Processing Operator",
    department: "Processing",
    shift: "Shift B (Evening)",
    plant: "Oakville Facility - Line 1",
    skills: ["Blender Calibration", "Ingredient Batching", "Sanitation Protocols"],
    skillLevel: "Beginner",
    trainingStatus: "In Progress",
    qualificationStatus: "In Qualification",
    status: "Active",
    productivityScore: 91.0,
    unitsPerHour: 138,
    efficiency: "92.0%",
    hoursWorkedMonth: 156,
    activeStation: "Line 2 Mixing Vessel 03",
    shiftTiming: "14:30 - 22:30",
    certifications: ["GMP Food Safety", "Allergen Awareness"],
    avatar: "AO"
  },
  {
    id: "EMP-108",
    name: "Liam Chen",
    role: "Robotics Operator",
    department: "Packaging",
    shift: "Shift C (Night)",
    plant: "Oakville Facility - Line 1",
    skills: ["Fanuc Robotic Arm", "Conveyor Indexing", "Laser Coder Troubleshooting"],
    skillLevel: "Advanced",
    trainingStatus: "Up to Date",
    qualificationStatus: "Fully Qualified",
    status: "On Leave",
    productivityScore: 97.0,
    unitsPerHour: 160,
    efficiency: "97.8%",
    hoursWorkedMonth: 152,
    activeStation: "Line 3 Seamer Station",
    shiftTiming: "22:30 - 06:30",
    certifications: ["Fanuc Certified Operator", "OSHA 10"],
    avatar: "LC"
  }
];

export const LABOUR_DATA = {
  plannedLabour: 48,
  actualLabour: 46,
  availableLabour: 45,
  labourAllocationDirect: 88.5,
  labourAllocationIndirect: 11.5,
  labourUtilization: 95.8,
  labourProductivity: 154, // Units per Labor Hour
  labourProductivityTarget: 145,
  labourProductivityTrend: "+6.2%",
  shifts: [
    { shift: "Shift A (Day)", planned: 20, actual: 20, available: 20, utilization: "97.8%", productivity: 158, status: "Full Coverage" },
    { shift: "Shift B (Evening)", planned: 16, actual: 15, available: 15, utilization: "94.6%", productivity: 151, status: "Minor Deficit (-1)" },
    { shift: "Shift C (Night)", planned: 12, actual: 11, available: 10, utilization: "95.0%", productivity: 148, status: "Minor Deficit (-1)" }
  ],
  lines: [
    { line: "Line 1 — High-Speed Aseptic Bottling", department: "Packaging", planned: 14, actual: 14, available: 14, utilization: "98.2%", productivity: 164, lead: "Elena Rostova", status: "Optimal" },
    { line: "Line 2 — Formulation, Batching & CIP", department: "Processing", planned: 10, actual: 10, available: 10, utilization: "96.4%", productivity: 146, lead: "Sarah Jenkins", status: "Optimal" },
    { line: "Line 3 — Canning & Seaming Automation", department: "Packaging", planned: 12, actual: 11, available: 11, utilization: "93.8%", productivity: 152, lead: "David Kim", status: "Understaffed (-1)" },
    { line: "Line 4 — Case Packing & Palletizing", department: "Warehouse", planned: 8, actual: 7, available: 7, utilization: "94.5%", productivity: 142, lead: "Carlos Mendez", status: "Understaffed (-1)" },
    { line: "QA In-Line Lab & Sanitation", department: "Quality Assurance", planned: 4, actual: 4, available: 4, utilization: "99.0%", productivity: 168, lead: "Thomas Sterling", status: "Optimal" }
  ]
};

export const LIVE_HB_RECORDS = [
  {
    id: "HB-01",
    hour: "06:00 - 07:00",
    shift: "Shift A (Day)",
    line: "Line 1 — Bottling",
    department: "Packaging",
    plannedHB: 14,
    actualHB: 14,
    requiredHB: 14,
    availableHB: 14,
    shortage: 0,
    status: "Full Coverage",
    operatorNotes: "Line start-up on schedule, full headcount present."
  },
  {
    id: "HB-02",
    hour: "07:00 - 08:00",
    shift: "Shift A (Day)",
    line: "Line 1 — Bottling",
    department: "Packaging",
    plannedHB: 14,
    actualHB: 14,
    requiredHB: 14,
    availableHB: 14,
    shortage: 0,
    status: "Full Coverage",
    operatorNotes: "Running at nominal speed (450 BPM)."
  },
  {
    id: "HB-03",
    hour: "08:00 - 09:00",
    shift: "Shift A (Day)",
    line: "Line 1 — Bottling",
    department: "Packaging",
    plannedHB: 14,
    actualHB: 13,
    requiredHB: 14,
    availableHB: 13,
    shortage: -1,
    status: "Shortage (-1)",
    operatorNotes: "Packer operator reassigned temporarily to unjam case conveyor."
  },
  {
    id: "HB-04",
    hour: "09:00 - 10:00",
    shift: "Shift A (Day)",
    line: "Line 1 — Bottling",
    department: "Packaging",
    plannedHB: 14,
    actualHB: 14,
    requiredHB: 14,
    availableHB: 14,
    shortage: 0,
    status: "Full Coverage",
    operatorNotes: "Nominal pacing restored."
  },
  {
    id: "HB-05",
    hour: "06:00 - 07:00",
    shift: "Shift A (Day)",
    line: "Line 2 — Formulation",
    department: "Processing",
    plannedHB: 10,
    actualHB: 10,
    requiredHB: 10,
    availableHB: 10,
    shortage: 0,
    status: "Full Coverage",
    operatorNotes: "Batch formulation in progress."
  },
  {
    id: "HB-06",
    hour: "07:00 - 08:00",
    shift: "Shift A (Day)",
    line: "Line 2 — Formulation",
    department: "Processing",
    plannedHB: 10,
    actualHB: 9,
    requiredHB: 10,
    availableHB: 9,
    shortage: -1,
    status: "Shortage (-1)",
    operatorNotes: "Operator assisting QA lab with titration verification."
  },
  {
    id: "HB-07",
    hour: "06:00 - 07:00",
    shift: "Shift A (Day)",
    line: "Line 3 — Canning",
    department: "Packaging",
    plannedHB: 12,
    actualHB: 11,
    requiredHB: 12,
    availableHB: 11,
    shortage: -1,
    status: "Shortage (-1)",
    operatorNotes: "Seamer helper delayed on safety briefing."
  },
  {
    id: "HB-08",
    hour: "07:00 - 08:00",
    shift: "Shift A (Day)",
    line: "Line 3 — Canning",
    department: "Packaging",
    plannedHB: 12,
    actualHB: 12,
    requiredHB: 12,
    availableHB: 12,
    shortage: 0,
    status: "Full Coverage",
    operatorNotes: "Full crew operational."
  }
];

export const SKILLS_LIST = [
  {
    id: "SKL-01",
    skillName: "Aseptic Filling Machine Operation",
    skillCategory: "Machine Operation",
    employee: "Elena Rostova",
    employeeId: "EMP-101",
    skillLevel: "Expert",
    certification: "ISO 22000 Lead Tech",
    expiry: "2027-08-15",
    status: "Active"
  },
  {
    id: "SKL-02",
    skillName: "Automated Case Packer Operation",
    skillCategory: "Packaging",
    employee: "Carlos Mendez",
    employeeId: "EMP-106",
    skillLevel: "Intermediate",
    certification: "Packer Level 2",
    expiry: "2026-11-20",
    status: "Active"
  },
  {
    id: "SKL-03",
    skillName: "CIP & Allergen Wash Validation",
    skillCategory: "Quality / Sanitation",
    employee: "Sarah Jenkins",
    employeeId: "EMP-103",
    skillLevel: "Advanced",
    certification: "SQF Practitioner",
    expiry: "2027-04-12",
    status: "Active"
  },
  {
    id: "SKL-04",
    skillName: "Thermal Pasteurization Controls",
    skillCategory: "Processing",
    employee: "David Kim",
    employeeId: "EMP-104",
    skillLevel: "Intermediate",
    certification: "EPA Universal Tech",
    expiry: "2026-10-30",
    status: "Pending Re-test"
  },
  {
    id: "SKL-05",
    skillName: "Fanuc High-Speed Robotic Arm",
    skillCategory: "Machine Operation",
    employee: "Liam Chen",
    employeeId: "EMP-108",
    skillLevel: "Expert",
    certification: "Fanuc Robotics Cert",
    expiry: "2027-05-18",
    status: "Active"
  },
  {
    id: "SKL-06",
    skillName: "High Voltage Electrical LOTO Safety",
    skillCategory: "Maintenance Safety",
    employee: "Marcus Vance",
    employeeId: "EMP-102",
    skillLevel: "Expert",
    certification: "NFPA 70E Arc Flash",
    expiry: "2027-09-01",
    status: "Active"
  },
  {
    id: "SKL-07",
    skillName: "Mixing Vessel Recipe Batching",
    skillCategory: "Processing",
    employee: "Amara Okafor",
    employeeId: "EMP-107",
    skillLevel: "Beginner",
    certification: "GMP Food Safety L1",
    expiry: "2026-12-15",
    status: "Active"
  }
];

export const TRAINING_PROGRAMS = [
  {
    id: "TRN-01",
    trainingProgram: "High-Speed Aseptic Sterilization & CIP Re-Certification",
    employee: "Carlos Mendez",
    employeeId: "EMP-106",
    trainingType: "Technical Qualification",
    completionDate: "2026-08-10",
    expiryDate: "2027-08-10",
    trainer: "Marcus Vance",
    status: "Completed",
    certification: "HACCP Level 3 Certified"
  },
  {
    id: "TRN-02",
    trainingProgram: "Arc Flash & Electrical Safety NFPA 70E",
    employee: "David Kim",
    employeeId: "EMP-104",
    trainingType: "Mandatory Safety",
    completionDate: "2025-09-15",
    expiryDate: "2026-09-15",
    trainer: "Marcus Vance",
    status: "Expired",
    certification: "NFPA 70E Certificate"
  },
  {
    id: "TRN-03",
    trainingProgram: "Automated Fanuc Robotic Palletizer Maintenance",
    employee: "Amara Okafor",
    employeeId: "EMP-107",
    trainingType: "Technical Qualification",
    completionDate: "Pending",
    expiryDate: "2027-02-01",
    trainer: "Liam Chen",
    status: "In Progress",
    certification: "Fanuc L1 Robotics"
  },
  {
    id: "TRN-04",
    trainingProgram: "Annual GMP, Hygiene & Allergen Cross-Contact Prevention",
    employee: "Elena Rostova",
    employeeId: "EMP-101",
    trainingType: "SOP Refresh",
    completionDate: "2026-05-20",
    expiryDate: "2027-05-20",
    trainer: "Sarah Jenkins",
    status: "Completed",
    certification: "GMP Master Operator"
  },
  {
    id: "TRN-05",
    trainingProgram: "Chemical Handling & Emergency Spill Response",
    employee: "Thomas Sterling",
    employeeId: "EMP-105",
    trainingType: "Mandatory Safety",
    completionDate: "Pending",
    expiryDate: "2026-12-30",
    trainer: "External Auditor (SafetyPro)",
    status: "Not Started",
    certification: "OSHA HazMat L2"
  }
];

export const PRODUCTIVITY_METRICS = {
  averageProductivity: "96.4%",
  labourUtilization: "95.8%",
  overallUnitsPerHour: 154,
  targetUnitsPerHour: 145,
  totalHoursWorked: 2840,
  totalOutputUnits: 437360,
  byShift: [
    { shift: "Shift A (Day)", efficiency: "97.8%", output: 198400, hoursWorked: 1255, unitsPerHr: 158, targetVsActual: "+8.9%" },
    { shift: "Shift B (Evening)", efficiency: "95.4%", output: 145200, hoursWorked: 960, unitsPerHr: 151, targetVsActual: "+4.1%" },
    { shift: "Shift C (Night)", efficiency: "94.2%", output: 93760, hoursWorked: 625, unitsPerHr: 150, targetVsActual: "+3.4%" }
  ],
  byLine: [
    { line: "Line 1 — High-Speed Bottling", efficiency: "98.2%", output: 185600, hoursWorked: 1130, unitsPerHr: 164, variance: "+13.1%" },
    { line: "Line 2 — Formulation & CIP", efficiency: "96.4%", output: 102200, hoursWorked: 700, unitsPerHr: 146, variance: "+0.7%" },
    { line: "Line 3 — Canning & Seaming", efficiency: "94.8%", output: 149560, hoursWorked: 1010, unitsPerHr: 152, variance: "+4.8%" }
  ],
  trend: [
    { week: "Week 32", unitsPerHour: 142, utilization: 92.5 },
    { week: "Week 33", unitsPerHour: 146, utilization: 94.0 },
    { week: "Week 34", unitsPerHour: 149, utilization: 95.1 },
    { week: "Week 35", unitsPerHour: 152, utilization: 95.4 },
    { week: "Week 36 (Current)", unitsPerHour: 154, utilization: 95.8 }
  ]
};

export const SHIFT_SCHEDULES = [
  {
    id: "SHF-01",
    shiftName: "Shift A — Day Production",
    shiftTiming: "06:00 - 14:30",
    date: "2026-09-05",
    line: "Line 1 — High-Speed Bottling",
    supervisor: "Thomas Sterling",
    operators: ["Elena Rostova", "Carlos Mendez", "Sarah Jenkins", "Marcus Vance"],
    plannedHeadcount: 14,
    actualHeadcount: 14,
    shiftStatus: "In Progress"
  },
  {
    id: "SHF-02",
    shiftName: "Shift B — Evening Formulation",
    shiftTiming: "14:30 - 22:30",
    date: "2026-09-05",
    line: "Line 2 — Formulation & CIP",
    supervisor: "Alexander Vance",
    operators: ["David Kim", "Amara Okafor"],
    plannedHeadcount: 10,
    actualHeadcount: 10,
    shiftStatus: "Scheduled"
  },
  {
    id: "SHF-03",
    shiftName: "Shift C — Night Canning",
    shiftTiming: "22:30 - 06:30",
    date: "2026-09-05",
    line: "Line 3 — Canning Automation",
    supervisor: "Liam Chen",
    operators: ["Liam Chen", "Carlos Mendez"],
    plannedHeadcount: 12,
    actualHeadcount: 11,
    shiftStatus: "Scheduled"
  },
  {
    id: "SHF-04",
    shiftName: "Shift A — Day Sanitation & Lab",
    shiftTiming: "06:00 - 14:30",
    date: "2026-09-04",
    line: "QA In-Line Lab & Sanitation",
    supervisor: "Thomas Sterling",
    operators: ["Sarah Jenkins", "Elena Rostova"],
    plannedHeadcount: 4,
    actualHeadcount: 4,
    shiftStatus: "Closed"
  }
];

export const SKILLS_MATRIX = [
  { machine: "FM-001 Rotary Filler", qualifiedCount: 6, expertLead: "Elena Rostova", refresherDue: 2 },
  { machine: "HT-105 Pasteurizer", qualifiedCount: 4, expertLead: "Sarah Jenkins", refresherDue: 1 },
  { machine: "PK-401 Fanuc Palletizer", qualifiedCount: 5, expertLead: "Liam Chen", refresherDue: 0 },
  { machine: "CP-102 Rotary Capper", qualifiedCount: 7, expertLead: "Carlos Mendez", refresherDue: 3 }
];


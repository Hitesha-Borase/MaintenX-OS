// Labour / HR Mock Data
export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-101",
    name: "Elena Rostova",
    role: "Senior Lead Operator",
    department: "Packaging",
    shift: "Shift A (Day)",
    plant: "Plant 1 - North Facility",
    skills: ["Aseptic Filling Level 4", "CIP / SIP Sanitation", "HMI Diagnostics", "Forklift Certified"],
    certifications: ["HACCP Level 3", "ISO 22000 Lead Auditor", "OSHA 30"],
    productivityScore: 97.4,
    hoursWorkedMonth: 168,
    avatar: "ER"
  },
  {
    id: "EMP-102",
    name: "Marcus Vance",
    role: "Senior Reliability Technician",
    department: "Maintenance",
    shift: "Shift A (Day)",
    plant: "Plant 1 - North Facility",
    skills: ["Vibration Analysis Cat II", "Laser Alignment", "Hydraulic Overhaul", "PLC Troubleshooting"],
    certifications: ["CMRP Certified Maintenance", "Arc Flash NFPA 70E", "LOTO Level 4"],
    productivityScore: 98.8,
    hoursWorkedMonth: 172,
    avatar: "MV"
  },
  {
    id: "EMP-103",
    name: "Sarah Jenkins",
    role: "Lead Quality Specialist",
    department: "Quality Assurance",
    shift: "Shift A (Day)",
    plant: "Plant 1 - North Facility",
    skills: ["Microbiological Assay", "HPLC Chromatography", "CCP Verification", "Root Cause Analysis"],
    certifications: ["PCQI Preventive Controls", "Six Sigma Green Belt", "SQF Practitioner"],
    productivityScore: 96.1,
    hoursWorkedMonth: 160,
    avatar: "SJ"
  },
  {
    id: "EMP-104",
    name: "David Kim",
    role: "Maintenance Technician",
    department: "Maintenance",
    shift: "Shift B (Evening)",
    plant: "Plant 1 - North Facility",
    skills: ["Thermal Systems", "Pneumatic Valves", "Motor Rewinding", "Preventive Maintenance"],
    certifications: ["EPA Section 608 Universal", "Electrical Safety"],
    productivityScore: 93.5,
    hoursWorkedMonth: 164,
    avatar: "DK"
  },
  {
    id: "EMP-105",
    name: "Thomas Sterling",
    role: "Operations Supervisor",
    department: "Production",
    shift: "Shift A (Day)",
    plant: "Plant 1 - North Facility",
    skills: ["MES Master Scheduling", "Line Optimization", "Incident Command", "Lean 5S"],
    certifications: ["Six Sigma Black Belt", "Lean Manufacturing Bronze", "First Aid / CPR"],
    productivityScore: 99.0,
    hoursWorkedMonth: 180,
    avatar: "TS"
  }
];

export const SKILLS_MATRIX = [
  { machine: "FM-001 Rotary Filler", qualifiedCount: 6, expertLead: "Elena Rostova", refresherDue: 2 },
  { machine: "HT-105 Pasteurizer", qualifiedCount: 4, expertLead: "Sarah Jenkins", refresherDue: 1 },
  { machine: "PK-401 Fanuc Palletizer", qualifiedCount: 5, expertLead: "Jake Kowalski", refresherDue: 0 },
  { machine: "CP-102 Rotary Capper", qualifiedCount: 7, expertLead: "Liam Chen", refresherDue: 3 }
];

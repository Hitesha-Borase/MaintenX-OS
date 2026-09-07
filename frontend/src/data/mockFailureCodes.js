// Standardized Failure Codes
export const INITIAL_FAILURE_CODES = [
  {
    code: "MEC-001",
    category: "Mechanical",
    name: "Gearbox Backlash / Tooth Wear",
    description: "Excessive play or tooth surface spalling in speed reducer or drive gear train.",
    severity: "High",
    causeType: "Wear & Tear",
    active: true,
    occurrencesCount: 8
  },
  {
    code: "MEC-004",
    category: "Mechanical",
    name: "Bearing Wear / Spindle Fatigue",
    description: "Inner/outer race pitting, cage destruction or lack of lubrication in rotating bearings.",
    severity: "Critical",
    causeType: "Tribological / Lubrication Degradation",
    active: true,
    occurrencesCount: 16
  },
  {
    code: "MEC-009",
    category: "Mechanical",
    name: "Conveyor Belt Guide Jam / Misalignment",
    description: "Physical binding or mechanical bottleneck causing motor overload trip.",
    severity: "Medium",
    causeType: "Mechanical Obstruction",
    active: true,
    occurrencesCount: 12
  },
  {
    code: "ELE-002",
    category: "Electrical",
    name: "VFD Overcurrent / Inverter Fault",
    description: "Variable frequency drive trip caused by motor short or load spike.",
    severity: "High",
    causeType: "Electrical Overload",
    active: true,
    occurrencesCount: 6
  },
  {
    code: "ELE-008",
    category: "Electrical",
    name: "Optical Sensor Drift / Dirty Lens",
    description: "Photo-eye, proximity or vision sensor false tripping due to debris or alignment drift.",
    severity: "Low",
    causeType: "Environmental / Contamination",
    active: true,
    occurrencesCount: 24
  },
  {
    code: "HYD-002",
    category: "Hydraulic",
    name: "Gasket Rupture / High Pressure Leak",
    description: "Seal failure under operating pressure causing fluid leakage and pressure drops.",
    severity: "Critical",
    causeType: "Thermal / Chemical Seal Degradation",
    active: true,
    occurrencesCount: 9
  },
  {
    code: "PNE-003",
    category: "Pneumatic",
    name: "Solenoid Valve Response Delay / Sticky Spool",
    description: "Pneumatic directional control valve sluggish response due to moisture or lack of lubrication.",
    severity: "Medium",
    causeType: "Pneumatic Contamination",
    active: true,
    occurrencesCount: 14
  },
  {
    code: "TMP-001",
    category: "Temperature",
    name: "Pasteurization Thermal Excursion Over-temp",
    description: "Product temperature exceeds critical control point CCP upper specification limit.",
    severity: "Critical",
    causeType: "Process Control Loop Failure",
    active: true,
    occurrencesCount: 3
  },
  {
    code: "INS-005",
    category: "Instrumentation",
    name: "Mass Flowmeter Zero Calibration Drift",
    description: "Coriolis or electromagnetic flow transmitter offset exceeding ±0.2% measurement limit.",
    severity: "High",
    causeType: "Calibration Drift",
    active: true,
    occurrencesCount: 5
  }
];

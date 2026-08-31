// Mock data for Work Orders in FlowState Ops CMMS
export const INITIAL_WORK_ORDERS = [
  {
    id: "WO-2026-0891",
    title: "Excessive Vibration on Main Drive Spindle",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    type: "Corrective", // Corrective, Preventive, Emergency Breakdown, Calibration, Inspection
    priority: "P1 - Critical", // P1 - Critical, P2 - High, P3 - Medium, P4 - Low
    status: "In Progress", // Draft, Open, Assigned, In Progress, Waiting for Parts, Completed, Verified, Closed
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    assignedTechnician: "Marcus Vance (Senior Tech)",
    createdDate: "2026-08-30 08:15",
    dueDate: "2026-08-31 16:00",
    failureCode: "MEC-004 (Bearing Wear / Spindle Fatigue)",
    symptom: "Acoustic rattling and vibration sensor reading 4.8 mm/s exceeding threshold of 3.0 mm/s during 600 BPM run.",
    description: "Inspect lower bearing cartridge on spindle assembly. Check lubricant breakdown and laser-align coupling shaft.",
    partsRequired: [
      { partNo: "BRG-6208-2RS", name: "Deep Groove Ball Bearing 6208", qty: 2, unitCost: 45.0, status: "Issued" },
      { partNo: "SL-VTON-45", name: "Viton Double Lip Shaft Seal 45mm", qty: 1, unitCost: 18.5, status: "Issued" }
    ],
    toolsRequired: ["Laser Alignment Kit SKF TKSA 41", "Hydraulic Bearing Puller", "Digital Vibration Analyzer"],
    estimatedHours: 3.5,
    actualHours: 2.0,
    costEstimated: 320.0,
    costActual: 285.0,
    safetyNotes: "LOTO Protocol Level 4 required. Verify mechanical interlock and bleed pneumatic reservoir.",
    repairAction: "Bearing housing disassembled. Found micro-pitting on inner race of lower bearing. Cleaned housing, pressed replacement bearings and recalibrated shaft alignment to 0.02mm tolerance.",
    testResult: "Test run performed at 300 BPM and 600 BPM. Vibration dropped from 4.8 mm/s to 1.1 mm/s. Temperature stabilized at 54°C.",
    verificationNotes: "Verified by QA Tech Sarah Jenkins after 30-min dry cycle and 15-min wet CIP flush.",
    signOffSupervisor: "Thomas Sterling (Plant Operations)",
    comments: [
      { user: "Marcus Vance", time: "2026-08-30 09:30", text: "Parts collected from Cage B. Beginning lockout-tagout." },
      { user: "Elena Rostova", time: "2026-08-30 11:45", text: "Line paused for planned maintenance window. Handover complete." }
    ],
    photos: ["/assets/img/filler-bearing-wear.jpg", "/assets/img/filler-bearing-replaced.jpg"]
  },
  {
    id: "WO-2026-0888",
    title: "Pasteurizer Heat Exchanger Plate Seal Leakage",
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    type: "Emergency Breakdown",
    priority: "P1 - Critical",
    status: "Waiting for Parts",
    department: "Processing",
    line: "Line 2 (Formulation & Blending)",
    assignedTechnician: "David Kim (Thermal Tech)",
    createdDate: "2026-08-30 04:20",
    dueDate: "2026-08-30 12:00",
    failureCode: "HYD-002 (Gasket Rupture / High Pressure Leak)",
    symptom: "Pressure differential dropped by 2.4 bar. Steam jacket bypass valve tripped. Sanitizing fluid observed in catchment tray.",
    description: "Replace gasket set on Section 3 plates. Hydro-test to 10 bar before steam pressurization.",
    partsRequired: [
      { partNo: "GSK-EPDM-HT105", name: "Clip-on EPDM Gasket Pack (50pk)", qty: 1, unitCost: 450.0, status: "Awaiting Delivery" }
    ],
    toolsRequired: ["Torque Wrench 300Nm", "Hydrostatic Pressure Tester"],
    estimatedHours: 5.0,
    actualHours: 1.5,
    costEstimated: 850.0,
    costActual: 220.0,
    safetyNotes: "Thermal Hazard: Cool down below 40°C before loosening frame tension bolts.",
    repairAction: "",
    testResult: "",
    verificationNotes: "",
    signOffSupervisor: "",
    comments: [
      { user: "David Kim", time: "2026-08-30 06:10", text: "Gasket pack ordered under expedited courier from Central Hub. ETA 13:30." }
    ],
    photos: ["/assets/img/heat-exchanger-leak.jpg"]
  },
  {
    id: "WO-2026-0875",
    title: "Weekly Lubrication & Chain Tension Calibration",
    assetId: "CV-301",
    assetName: "Modular Incline Belt Conveyor Matrix 45m",
    type: "Preventive",
    priority: "P3 - Medium",
    status: "Completed",
    department: "Packaging",
    line: "Line 3 (Canning Line)",
    assignedTechnician: "Sarah Jenkins (Lead Tech)",
    createdDate: "2026-08-28 07:00",
    dueDate: "2026-08-29 17:00",
    failureCode: "PM-LUB-001 (Scheduled Lubrication)",
    symptom: "Scheduled routine PM checklist #PM-CV-W04.",
    description: "Grease 14 pillow block bearings using Mobil SHC Polyrex 462. Verify belt tension deflection within 12-15mm.",
    partsRequired: [
      { partNo: "LUB-MOB-462", name: "Mobil SHC Polyrex 462 Food-Grade Cartridge", qty: 2, unitCost: 22.0, status: "Used" }
    ],
    toolsRequired: ["Manual Grease Gun with Meter", "Tension Meter Optibelt TT"],
    estimatedHours: 1.5,
    actualHours: 1.2,
    costEstimated: 120.0,
    costActual: 95.0,
    safetyNotes: "Standard Lockout Tagout of Conveyor Control Panel 3B.",
    repairAction: "Applied 35g grease per bearing. Tensioned take-up bolts to achieve 13.5mm deflection at 25kg load.",
    testResult: "Conveyor ran smoothly at 45m/min without belt wander.",
    verificationNotes: "Verified by Shift Supervisor Chloe Dupuis.",
    signOffSupervisor: "Chloe Dupuis (Shift B)",
    comments: [
      { user: "Sarah Jenkins", time: "2026-08-28 14:00", text: "PM completed on schedule without anomalies." }
    ],
    photos: []
  },
  {
    id: "WO-2026-0860",
    title: "Optical Sensor Drift & Photo-eye Realignment",
    assetId: "LB-204",
    assetName: "Krones Autocol Rotary Labeler",
    type: "Corrective",
    priority: "P2 - High",
    status: "Open",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    assignedTechnician: "David Kim (Tech)",
    createdDate: "2026-08-31 06:45",
    dueDate: "2026-08-31 14:00",
    failureCode: "ELE-008 (Optical Sensor Misalignment / Dust)",
    symptom: "Intermittent false rejects on label presence inspection station (12% false reject rate).",
    description: "Clean optical lenses with isopropyl alcohol, inspect fiber optic cables for kinks, re-teach teach-in threshold on Keyence FS-N41N amplifier.",
    partsRequired: [
      { partNo: "SEN-KEY-FSN", name: "Keyence Fiber Optic Sensor Unit", qty: 1, unitCost: 190.0, status: "Reserved" }
    ],
    toolsRequired: ["Lens Cleaner Kit", "Oscilloscope / Handheld Multimeter"],
    estimatedHours: 2.0,
    actualHours: 0.5,
    costEstimated: 180.0,
    costActual: 0.0,
    safetyNotes: "Power down labeler before cleaning sensor brackets.",
    repairAction: "",
    testResult: "",
    verificationNotes: "",
    signOffSupervisor: "",
    comments: [
      { user: "Carlos Mendez", time: "2026-08-31 07:10", text: "Temporary bypass engaged for non-critical label run. Needs priority fix before next premium SKU." }
    ],
    photos: []
  },
  {
    id: "WO-2026-0852",
    title: "Robotic Gripper Pneumatic Valve Solenoid Inspection",
    assetId: "PK-401",
    assetName: "Robotic End-of-Line Palletizer Fanuc M-410iC",
    type: "Inspection",
    priority: "P3 - Medium",
    status: "Verified",
    department: "Warehouse & Shipping",
    line: "Line 1 (Aseptic Bottling)",
    assignedTechnician: "Marcus Vance (Senior Tech)",
    createdDate: "2026-08-25 10:00",
    dueDate: "2026-08-26 18:00",
    failureCode: "PNE-003 (Solenoid Valve Response Delay)",
    symptom: "Gripper actuation cycle time degraded by 180ms.",
    description: "Inspect SMC SY3120 manifold solenoid valves for air bypass and spool sticking.",
    partsRequired: [
      { partNo: "VLV-SMC-SY31", name: "SMC Solenoid Valve SY3120-5LZ-M5", qty: 2, unitCost: 65.0, status: "Used" }
    ],
    toolsRequired: ["Pneumatic Flow Meter", "Allen Key Set"],
    estimatedHours: 2.0,
    actualHours: 1.8,
    costEstimated: 240.0,
    costActual: 215.0,
    safetyNotes: "Depressurize main robot pneumatic header (7 bar) and lock out emergency stop.",
    repairAction: "Replaced 2 sticky solenoids on vacuum gripper bank. Cleaned exhaust mufflers.",
    testResult: "Cycle time returned to spec: 420ms gripping latency.",
    verificationNotes: "Signed off and verified by Warehouse Lead Jake Kowalski.",
    signOffSupervisor: "Thomas Sterling",
    comments: [],
    photos: []
  }
];

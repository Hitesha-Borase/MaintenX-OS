// Calibration Records and Instruments
export const INITIAL_CALIBRATIONS = [
  {
    id: "CAL-2026-088",
    instrumentId: "INS-TT-401",
    instrumentName: "Pasteurizer RTD Pt100 Temperature Transmitter",
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    range: "-20°C to +150°C",
    accuracySpec: "±0.15°C",
    lastCalibrationDate: "2026-05-15",
    nextDueDate: "2026-11-15",
    calibrationIntervalMonths: 6,
    status: "Valid", // Valid, Due Soon, Overdue, Failed
    certificateNumber: "CERT-NIST-2026-9912",
    technician: "Sarah Jenkins",
    standardUsed: "Fluke 754 Documenting Process Calibrator",
    resultError: "+0.04°C",
    statusColor: "emerald"
  },
  {
    id: "CAL-2026-082",
    instrumentId: "INS-FM-012",
    instrumentName: "Endress+Hauser Promass Coriolis Mass Flowmeter",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    range: "0 to 12,000 kg/h",
    accuracySpec: "±0.10% o.r.",
    lastCalibrationDate: "2026-02-10",
    nextDueDate: "2026-08-10", // Overdue
    calibrationIntervalMonths: 6,
    status: "Overdue",
    certificateNumber: "CERT-ISO-2026-4401",
    technician: "External Metrology Lab (TÜV)",
    standardUsed: "Gravimetric Test Rig Primary Standard",
    resultError: "+0.22%",
    statusColor: "rose"
  },
  {
    id: "CAL-2026-091",
    instrumentId: "INS-PT-303",
    instrumentName: "Sanitary Diaphragm Pressure Transmitter 0-10 bar",
    assetId: "MX-003",
    assetName: "Industrial Double-Cone Blender 5000L",
    range: "0 to 10.0 bar",
    accuracySpec: "±0.05 bar",
    lastCalibrationDate: "2026-08-01",
    nextDueDate: "2026-09-01", // Due Soon
    calibrationIntervalMonths: 1,
    status: "Due Soon",
    certificateNumber: "CERT-CAL-2026-8812",
    technician: "David Kim",
    standardUsed: "Ametek Hydraulic Deadweight Tester",
    resultError: "-0.01 bar",
    statusColor: "amber"
  },
  {
    id: "CAL-2026-079",
    instrumentId: "INS-TRQ-102",
    instrumentName: "Mecmesin Digital Capper Torque Analyzer",
    assetId: "CP-102",
    assetName: "Arol Capper Rotary Capping Machine",
    range: "0 to 5.0 Nm",
    accuracySpec: "±0.5% F.S.",
    lastCalibrationDate: "2026-06-20",
    nextDueDate: "2026-12-20",
    calibrationIntervalMonths: 6,
    status: "Valid",
    certificateNumber: "CERT-NIST-2026-1188",
    technician: "Marcus Vance",
    standardUsed: "Torque Calibration Arm & Class M1 Weights",
    resultError: "+0.008 Nm",
    statusColor: "emerald"
  }
];

export const CALIBRATION_HISTORY = [
  {
    id: "CAL-HIST-2026-01",
    calibrationId: "CAL-2026-088",
    instrumentId: "INS-TT-401",
    instrumentName: "Pasteurizer RTD Pt100 Temperature Transmitter",
    calibrationDate: "2026-05-15",
    technician: "Sarah Jenkins",
    standardUsed: "Fluke 754 Calibrator",
    asFoundError: "+0.11°C",
    asLeftError: "+0.04°C",
    result: "Passed - Calibrated",
    certificateNumber: "CERT-NIST-2026-9912"
  },
  {
    id: "CAL-HIST-2025-04",
    calibrationId: "CAL-2026-088",
    instrumentId: "INS-TT-401",
    instrumentName: "Pasteurizer RTD Pt100 Temperature Transmitter",
    calibrationDate: "2025-11-15",
    technician: "Marcus Vance",
    standardUsed: "Fluke 754 Calibrator",
    asFoundError: "+0.08°C",
    asLeftError: "+0.02°C",
    result: "Passed",
    certificateNumber: "CERT-NIST-2025-8812"
  },
  {
    id: "CAL-HIST-2026-02",
    calibrationId: "CAL-2026-082",
    instrumentId: "INS-FM-012",
    instrumentName: "Endress+Hauser Promass Coriolis Mass Flowmeter",
    calibrationDate: "2026-02-10",
    technician: "External Metrology Lab (TÜV)",
    standardUsed: "Gravimetric Test Rig Primary Standard",
    asFoundError: "+0.19%",
    asLeftError: "+0.05%",
    result: "Passed - Minor Zero Shift",
    certificateNumber: "CERT-ISO-2026-4401"
  },
  {
    id: "CAL-HIST-2026-03",
    calibrationId: "CAL-2026-091",
    instrumentId: "INS-PT-303",
    instrumentName: "Sanitary Diaphragm Pressure Transmitter 0-10 bar",
    calibrationDate: "2026-08-01",
    technician: "David Kim",
    standardUsed: "Ametek Hydraulic Deadweight Tester",
    asFoundError: "-0.04 bar",
    asLeftError: "-0.01 bar",
    result: "Passed",
    certificateNumber: "CERT-CAL-2026-8812"
  },
  {
    id: "CAL-HIST-2026-04",
    calibrationId: "CAL-2026-079",
    instrumentId: "INS-TRQ-102",
    instrumentName: "Mecmesin Digital Capper Torque Analyzer",
    calibrationDate: "2026-06-20",
    technician: "Marcus Vance",
    standardUsed: "Torque Calibration Arm & Class M1 Weights",
    asFoundError: "+0.025 Nm",
    asLeftError: "+0.008 Nm",
    result: "Passed",
    certificateNumber: "CERT-NIST-2026-1188"
  }
];


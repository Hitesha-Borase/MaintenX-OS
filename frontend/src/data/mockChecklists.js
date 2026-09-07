// PM Checklist templates and active execution definitions
export const CHECKLIST_TEMPLATES = [
  {
    id: "CHK-FM-WEEKLY",
    name: "Filler Weekly Mechanical & Lubrication Inspection",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    frequency: "Weekly",
    version: "v3.2",
    lastRevisionDate: "2026-06-10",
    author: "Senior Reliability Engineer - David Kim",
    estimatedMinutes: 45,
    sections: [
      {
        id: "sec-safety",
        title: "1. Safety & Pre-Inspection Protocols",
        items: [
          {
            id: "chk-01",
            label: "Emergency Stop Circuit Verification",
            instruction: "Depress E-stop buttons at Operator HMI and Discharge Zone. Confirm safety relay de-energizes within 80ms.",
            type: "PASS_FAIL",
            required: true,
            status: "PASS",
            actualValue: "OK",
            unit: "",
            limit: "De-energize < 100ms",
            criticality: "Critical",
            comment: "Dual channel relay tripped simultaneously."
          },
          {
            id: "chk-02",
            label: "Safety Guard Interlock Switches",
            instruction: "Verify all 4 acrylic enclosure doors latch firmly and trip interlock reed switch when cracked open > 5mm.",
            type: "PASS_FAIL",
            required: true,
            status: "PASS",
            actualValue: "OK",
            unit: "",
            limit: "Trip < 5mm open",
            criticality: "Critical",
            comment: ""
          }
        ]
      },
      {
        id: "sec-mechanical",
        title: "2. Mechanical & Drive Train Health",
        items: [
          {
            id: "chk-03",
            label: "Main Drive Spindle Vibration Level",
            instruction: "Mount magnetic accelerometer on lower bearing housing. Record peak vibration velocity (RMS) during 600 BPM dry run.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "FAIL", // Simulating the failure workflow trigger from requirement #18 & #19
            actualValue: 4.8,
            unit: "mm/s",
            minLimit: 0.1,
            maxLimit: 3.0,
            limitText: "< 3.0 mm/s",
            criticality: "Critical",
            comment: "Audible hum and high amplitude vibration on lower spindle cartridge. Exceeds ISO 10816 class 2 vibration threshold.",
            photo: "/assets/img/vibration-sensor-fail.jpg"
          },
          {
            id: "chk-04",
            label: "Drive Gearbox Operating Temperature",
            instruction: "Use FLIR infrared gun to measure gearbox surface temperature after 20 minutes continuous run.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "PASS",
            actualValue: 62.4,
            unit: "°C",
            minLimit: 20.0,
            maxLimit: 75.0,
            limitText: "< 75.0 °C",
            criticality: "High",
            comment: "Within normal thermal operating band."
          },
          {
            id: "chk-05",
            label: "Rotary Valve Seal & O-Ring Integrity",
            instruction: "Inspect filling heads 1-12 for liquid seepage, elastomer scoring, or swelling.",
            type: "PASS_FAIL",
            required: true,
            status: "PASS",
            actualValue: "OK",
            unit: "",
            limit: "Zero drip at 4.5 bar",
            criticality: "High",
            comment: "Head 7 seal ring replaced during previous shift. All other heads dry."
          }
        ]
      },
      {
        id: "sec-lubrication",
        title: "3. Lubrication & Pneumatics",
        items: [
          {
            id: "chk-06",
            label: "Automatic Central Lubricator Reservoir Level",
            instruction: "Check grease reservoir level on Lincoln Centro-Matic central pump.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "PASS",
            actualValue: 80,
            unit: "%",
            minLimit: 25,
            maxLimit: 100,
            limitText: "> 25%",
            criticality: "Medium",
            comment: "Topped off with Mobil SHC Polyrex 462."
          },
          {
            id: "chk-07",
            label: "Main Pneumatic Header Regulated Pressure",
            instruction: "Read analog pressure gauge on FRL unit. Must be maintained at 6.0 ± 0.3 bar.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "PASS",
            actualValue: 6.2,
            unit: "bar",
            minLimit: 5.7,
            maxLimit: 6.5,
            limitText: "5.7 - 6.5 bar",
            criticality: "Medium",
            comment: "Moisture trap purged."
          },
          {
            id: "chk-08",
            label: "Nitrogen Purge Header Leak Check",
            instruction: "Perform ultrasonic leak detection on CIP nitrogen blanket line.",
            type: "PASS_FAIL",
            required: false,
            status: "N/A",
            actualValue: "N/A",
            unit: "",
            limit: "Zero leakage",
            criticality: "Low",
            comment: "Line not scheduled for nitrogen dosing run this week."
          }
        ]
      }
    ],
    toolsUsed: ["SKF TKSA 41 Laser Aligner", "FLIR TG165 Thermal Camera", "Lincoln Central Grease Gun"],
    partsUsed: [{ partNo: "LUB-MOB-462", name: "Mobil Grease Cartridge", qty: 1 }],
    supervisorSignOff: {
      required: true,
      supervisor: "Thomas Sterling",
      status: "Pending Action", // Pending Action, Approved, Rejected
      signedAt: null
    }
  },
  {
    id: "CHK-HT-MONTHLY",
    name: "Pasteurizer Monthly Gasket & Hydraulic Integrity Audit",
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    frequency: "Monthly",
    version: "v2.1",
    lastRevisionDate: "2026-05-14",
    author: "Lead Tech Sarah Jenkins",
    estimatedMinutes: 120,
    sections: [
      {
        id: "sec-gaskets",
        title: "1. Plate Pack & Gasket Integrity",
        items: [
          {
            id: "chk-ht-01",
            label: "Hydrostatic Pressure Retention (10 bar)",
            instruction: "Pressurize product channel to 10.0 bar for 15 minutes. Pressure loss must not exceed 0.2 bar.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "FAIL",
            actualValue: 7.6,
            unit: "bar",
            minLimit: 9.8,
            maxLimit: 10.5,
            limitText: "> 9.8 bar after 15 min",
            criticality: "Critical",
            comment: "Pressure drop of 2.4 bar detected. Leakage traced to plate pack #42-48."
          },
          {
            id: "chk-ht-02",
            label: "Differential Pressure Sensor Zero Drift",
            instruction: "Calibrate Endress+Hauser Deltabar PMD75 against reference deadweight tester.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "PASS",
            actualValue: 0.02,
            unit: "bar",
            minLimit: -0.05,
            maxLimit: 0.05,
            limitText: "±0.05 bar",
            criticality: "High",
            comment: "Calibration valid until 2026-11-14."
          }
        ]
      }
    ],
    toolsUsed: ["Deadweight Tester", "Hydrostatic Test Pump"],
    partsUsed: [],
    supervisorSignOff: {
      required: true,
      supervisor: "Thomas Sterling",
      status: "Pending Action",
      signedAt: null
    }
  },
  {
    id: "CHK-CP-QTR",
    name: "Rotary Capper Chuck Torque & Slip Clutch Calibration",
    assetId: "CP-102",
    assetName: "Arol Capper Rotary Capping Machine",
    frequency: "Quarterly",
    version: "v1.8",
    lastRevisionDate: "2026-04-20",
    author: "Senior Tech Marcus Vance",
    estimatedMinutes: 90,
    sections: [
      {
        id: "sec-torque",
        title: "1. Magnetic Chuck Release Torque",
        items: [
          {
            id: "chk-cp-01",
            label: "Chuck #1-6 Static Release Torque",
            instruction: "Measure slip torque using digital torque wrench Mecmesin CapTest.",
            type: "NUMERIC_LIMIT",
            required: true,
            status: "PASS",
            actualValue: 2.85,
            unit: "Nm",
            minLimit: 2.6,
            maxLimit: 3.1,
            limitText: "2.6 - 3.1 Nm",
            criticality: "High",
            comment: "Torque evenly balanced across all chucks."
          }
        ]
      }
    ],
    toolsUsed: ["Mecmesin CapTest Digital Torque Analyzer"],
    partsUsed: [],
    supervisorSignOff: {
      required: true,
      supervisor: "Thomas Sterling",
      status: "Approved",
      signedAt: "2026-06-15 11:30"
    }
  }
];

export const CHECKLIST_HISTORY = [
  {
    id: "CHKH-2026-0815",
    checklistTemplateId: "CHK-FM-WEEKLY",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    executedBy: "Marcus Vance",
    executedDate: "2026-08-24 16:30",
    overallStatus: "PASS",
    failedItemsCount: 0,
    passedItemsCount: 7,
    naItemsCount: 1,
    durationMinutes: 42,
    supervisorSignOff: "Thomas Sterling",
    supervisorStatus: "Approved"
  },
  {
    id: "CHKH-2026-0808",
    checklistTemplateId: "CHK-FM-WEEKLY",
    assetId: "FM-001",
    assetName: "High-Speed Rotary Filler 12-Head",
    executedBy: "Elena Rostova",
    executedDate: "2026-08-17 07:10",
    overallStatus: "PASS",
    failedItemsCount: 0,
    passedItemsCount: 8,
    naItemsCount: 0,
    durationMinutes: 38,
    supervisorSignOff: "Thomas Sterling",
    supervisorStatus: "Approved"
  },
  {
    id: "CHKH-2026-0725",
    checklistTemplateId: "CHK-HT-MONTHLY",
    assetId: "HT-105",
    assetName: "Plate Heat Exchanger & Pasteurizer HTST-300",
    executedBy: "David Kim",
    executedDate: "2026-07-25 11:00",
    overallStatus: "PASS",
    failedItemsCount: 0,
    passedItemsCount: 6,
    naItemsCount: 0,
    durationMinutes: 110,
    supervisorSignOff: "Thomas Sterling",
    supervisorStatus: "Approved"
  }
];

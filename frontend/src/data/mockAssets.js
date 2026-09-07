// Mock data for FlowState Ops CMMS Assets
export const INITIAL_ASSETS = [
  {
    id: "FM-001",
    name: "High-Speed Rotary Filler 12-Head",
    type: "Packaging & Bottling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    location: "Bay 4A - Cleanroom Zone B",
    status: "Operational", // Operational, Degraded, Breakdown, Maintenance, Out of Service
    health: 94,
    lastPM: "2026-08-15",
    nextPM: "2026-09-01",
    mtbf: 342, // hours
    mttr: 1.4, // hours
    criticality: "High",
    installedDate: "2021-03-15",
    manufacturer: "Krones Synchrobloc",
    serialNumber: "KR-2021-8849-B",
    runtimeHours: 14820,
    temperature: 62.4, // C
    vibration: 2.1, // mm/s
    oilLevel: 88, // %
    pressure: 6.2, // bar
    operator: "Elena Rostova (Shift A)",
    openWorkOrders: 1,
    recentFailuresCount: 4,
    powerDraw: "45 kW",
    lastVerification: "2026-08-15 by Senior Tech Marcus Vance",
  },
  {
    id: "CP-102",
    name: "Arol Capper Rotary Capping Machine",
    type: "Packaging & Bottling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    location: "Bay 4B - Cleanroom Zone B",
    status: "Operational",
    health: 88,
    lastPM: "2026-08-10",
    nextPM: "2026-09-10",
    mtbf: 410,
    mttr: 0.9,
    criticality: "High",
    installedDate: "2021-05-20",
    manufacturer: "Arol Closure Systems",
    serialNumber: "AR-89021-V",
    runtimeHours: 13950,
    temperature: 58.1,
    vibration: 1.8,
    oilLevel: 92,
    pressure: 5.8,
    operator: "Liam Chen (Shift A)",
    openWorkOrders: 0,
    recentFailuresCount: 1,
    powerDraw: "22 kW",
    lastVerification: "2026-08-10 by Lead Tech Sarah Jenkins",
  },
  {
    id: "LB-204",
    name: "Krones Autocol Rotary Labeler",
    type: "Labeling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    location: "Bay 4C - Packaging Area",
    status: "Degraded",
    health: 68,
    lastPM: "2026-07-28",
    nextPM: "2026-08-28", // Overdue
    mtbf: 180,
    mttr: 2.8,
    criticality: "Medium",
    installedDate: "2020-11-10",
    manufacturer: "Krones",
    serialNumber: "KR-LBL-3301",
    runtimeHours: 16200,
    temperature: 71.3,
    vibration: 3.9,
    oilLevel: 65,
    pressure: 4.9,
    operator: "Carlos Mendez (Shift A)",
    openWorkOrders: 2,
    recentFailuresCount: 3,
    powerDraw: "18 kW",
    lastVerification: "2026-07-28 by Tech David Kim",
  },
  {
    id: "MX-003",
    name: "Industrial Double-Cone Blender 5000L",
    type: "Processing & Mixing",
    plant: "Plant 1 - North Facility",
    department: "Processing",
    line: "Line 2 (Formulation & Blending)",
    location: "Processing Hall 2 - Zone C",
    status: "Operational",
    health: 96,
    lastPM: "2026-08-18",
    nextPM: "2026-09-18",
    mtbf: 520,
    mttr: 1.1,
    criticality: "High",
    installedDate: "2019-08-14",
    manufacturer: "GEA Process Engineering",
    serialNumber: "GEA-MX-5000L-04",
    runtimeHours: 19400,
    temperature: 45.0,
    vibration: 1.2,
    oilLevel: 95,
    pressure: 2.1,
    operator: "Vikram Patel (Shift A)",
    openWorkOrders: 0,
    recentFailuresCount: 0,
    powerDraw: "75 kW",
    lastVerification: "2026-08-18 by Tech Marcus Vance",
  },
  {
    id: "HT-105",
    name: "Plate Heat Exchanger & Pasteurizer HTST-300",
    type: "Thermal Processing",
    plant: "Plant 1 - North Facility",
    department: "Processing",
    line: "Line 2 (Formulation & Blending)",
    location: "Thermal Bay 1 - Hygienic Zone",
    status: "Breakdown",
    health: 42,
    lastPM: "2026-07-15",
    nextPM: "2026-08-15",
    mtbf: 210,
    mttr: 4.2,
    criticality: "Critical",
    installedDate: "2018-04-12",
    manufacturer: "Alfa Laval",
    serialNumber: "AL-HTST-300-88",
    runtimeHours: 24100,
    temperature: 96.5,
    vibration: 4.4,
    oilLevel: 50,
    pressure: 8.5,
    operator: "Amina Al-Mansoor (Shift A)",
    openWorkOrders: 3,
    recentFailuresCount: 5,
    powerDraw: "110 kW",
    lastVerification: "2026-07-15 by Senior Tech Marcus Vance",
  },
  {
    id: "PK-401",
    name: "Robotic End-of-Line Palletizer Fanuc M-410iC",
    type: "End of Line / Material Handling",
    plant: "Plant 1 - North Facility",
    department: "Warehouse & Shipping",
    line: "Line 1 (Aseptic Bottling)",
    location: "Dock Logistics Bay 2",
    status: "Operational",
    health: 91,
    lastPM: "2026-08-01",
    nextPM: "2026-09-01",
    mtbf: 480,
    mttr: 0.8,
    criticality: "Medium",
    installedDate: "2022-01-20",
    manufacturer: "Fanuc Robotics",
    serialNumber: "FAN-M410-993",
    runtimeHours: 11200,
    temperature: 52.0,
    vibration: 1.5,
    oilLevel: 90,
    pressure: 6.0,
    operator: "Jake Kowalski (Shift A)",
    openWorkOrders: 0,
    recentFailuresCount: 1,
    powerDraw: "30 kW",
    lastVerification: "2026-08-01 by Tech David Kim",
  },
  {
    id: "CV-301",
    name: "Modular Incline Belt Conveyor Matrix 45m",
    type: "Conveying",
    plant: "Plant 2 - South Facility",
    department: "Packaging",
    line: "Line 3 (Canning Line)",
    location: "Main Floor Bay 1",
    status: "Operational",
    health: 85,
    lastPM: "2026-08-12",
    nextPM: "2026-09-12",
    mtbf: 390,
    mttr: 1.2,
    criticality: "Medium",
    installedDate: "2021-09-10",
    manufacturer: "Dorner Conveyors",
    serialNumber: "DOR-CV-45M-02",
    runtimeHours: 12800,
    temperature: 48.2,
    vibration: 2.0,
    oilLevel: 82,
    pressure: 5.0,
    operator: "Chloe Dupuis (Shift B)",
    openWorkOrders: 1,
    recentFailuresCount: 2,
    powerDraw: "15 kW",
    lastVerification: "2026-08-12 by Tech Sarah Jenkins",
  },
  {
    id: "AC-505",
    name: "Rotary Air Compressor Atlas Copco GA 75 VSD",
    type: "Utilities & Facilities",
    plant: "Plant 1 - North Facility",
    department: "Facilities & Utilities",
    line: "Plant Utilities Backbone",
    location: "Compressor Room B2",
    status: "Operational",
    health: 98,
    lastPM: "2026-08-20",
    nextPM: "2026-09-20",
    mtbf: 720,
    mttr: 1.0,
    criticality: "Critical",
    installedDate: "2020-02-14",
    manufacturer: "Atlas Copco",
    serialNumber: "AC-GA75-VSD-4011",
    runtimeHours: 28400,
    temperature: 68.0,
    vibration: 1.1,
    oilLevel: 98,
    pressure: 7.8,
    operator: "Facility Auto-Monitor",
    openWorkOrders: 0,
    recentFailuresCount: 0,
    powerDraw: "75 kW",
    lastVerification: "2026-08-20 by Senior Tech Marcus Vance",
  }
];

export const ASSET_HIERARCHY_TREE = [
  {
    id: "PLANT-1",
    name: "Plant 1 - North Facility",
    type: "Plant",
    health: 92,
    children: [
      {
        id: "DEPT-PACK-1",
        name: "Packaging Department",
        type: "Department",
        health: 89,
        children: [
          {
            id: "LINE-1",
            name: "Line 1 (Aseptic Bottling)",
            type: "Line",
            health: 88,
            children: [
              {
                id: "FM-001",
                name: "High-Speed Rotary Filler 12-Head",
                type: "Machine",
                health: 94,
                status: "Operational",
                children: [
                  { id: "SUB-FM-01", name: "Main Spindle & Drive Gearbox", type: "Subsystem", health: 91, sensors: ["VIB-01 (2.1 mm/s)", "TEMP-01 (62.4°C)"] },
                  { id: "SUB-FM-02", name: "12-Head Aseptic Dosing Valves", type: "Subsystem", health: 96, sensors: ["FLOW-01 (9,400 kg/h)", "PRES-01 (6.2 bar)"] },
                  { id: "SUB-FM-03", name: "Cleanroom HEPA Laminar Hood", type: "Subsystem", health: 98, sensors: ["DIFF-01 (45 Pa)"] }
                ]
              },
              {
                id: "CP-102",
                name: "Arol Capper Rotary Capping Machine",
                type: "Machine",
                health: 88,
                status: "Operational",
                children: [
                  { id: "SUB-CP-01", name: "Magnetic Chuck Head Spindles", type: "Subsystem", health: 87, sensors: ["TRQ-01 (2.4 Nm)", "RPM-01 (1,200 rpm)"] },
                  { id: "SUB-CP-02", name: "Cap Sorter & Feeder Elevator", type: "Subsystem", health: 90, sensors: ["LVL-01 (Full)"] }
                ]
              },
              {
                id: "LB-204",
                name: "Krones Autocol Rotary Labeler",
                type: "Machine",
                health: 68,
                status: "Degraded",
                children: [
                  { id: "SUB-LB-01", name: "Cold Glue Application Drum", type: "Subsystem", health: 65, sensors: ["TEMP-02 (71.3°C)", "VIB-02 (3.9 mm/s)"] },
                  { id: "SUB-LB-02", name: "Optical Presence Inspection Station", type: "Subsystem", health: 70, sensors: ["OPT-01 (Attenuation 35%)"] }
                ]
              },
              {
                id: "PK-401",
                name: "Robotic End-of-Line Palletizer Fanuc M-410iC",
                type: "Machine",
                health: 91,
                status: "Operational",
                children: [
                  { id: "SUB-PK-01", name: "Fanuc 4-Axis Articulated Arm", type: "Subsystem", health: 92, sensors: ["AMP-01 (18 A)", "TEMP-03 (52.0°C)"] },
                  { id: "SUB-PK-02", name: "Vacuum Suction Manifold Gripper", type: "Subsystem", health: 89, sensors: ["VAC-01 (-0.82 bar)"] }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "DEPT-PROC-1",
        name: "Processing & Thermal Department",
        type: "Department",
        health: 78,
        children: [
          {
            id: "LINE-2",
            name: "Line 2 (Formulation & Blending)",
            type: "Line",
            health: 78,
            children: [
              {
                id: "MX-003",
                name: "Industrial Double-Cone Blender 5000L",
                type: "Machine",
                health: 96,
                status: "Operational",
                children: [
                  { id: "SUB-MX-01", name: "High-Torque Planetary Gear Drive", type: "Subsystem", health: 97, sensors: ["TORQ-02 (450 Nm)"] },
                  { id: "SUB-MX-02", name: "Sanitary Agitator Ribbon & Seal", type: "Subsystem", health: 95, sensors: ["PRES-02 (2.1 bar)"] }
                ]
              },
              {
                id: "HT-105",
                name: "Plate Heat Exchanger & Pasteurizer HTST-300",
                type: "Machine",
                health: 42,
                status: "Breakdown",
                children: [
                  { id: "SUB-HT-01", name: "Section 3 Titanium Plate Pack", type: "Subsystem", health: 35, sensors: ["PRES-03 (8.5 bar - HIGH)", "TEMP-04 (96.5°C)"] },
                  { id: "SUB-HT-02", name: "Steam Modulating Control Valve Loop", type: "Subsystem", health: 60, sensors: ["POS-01 (100% open)"] }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "DEPT-UTIL-1",
        name: "Utilities & Facilities",
        type: "Department",
        health: 98,
        children: [
          {
            id: "LINE-UTIL",
            name: "Plant Utilities Backbone",
            type: "Line",
            health: 98,
            children: [
              {
                id: "AC-505",
                name: "Rotary Air Compressor Atlas Copco GA 75 VSD",
                type: "Machine",
                health: 98,
                status: "Operational",
                children: [
                  { id: "SUB-AC-01", name: "Twin-Screw Compression Element", type: "Subsystem", health: 98, sensors: ["PRES-04 (7.8 bar)", "VIB-03 (1.1 mm/s)"] },
                  { id: "SUB-AC-02", name: "Integrated Refrigerant Air Dryer", type: "Subsystem", health: 97, sensors: ["DEW-01 (+3.0°C)"] }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PLANT-2",
    name: "Plant 2 - South Facility",
    type: "Plant",
    health: 85,
    children: [
      {
        id: "DEPT-PACK-2",
        name: "Packaging & Canning Department",
        type: "Department",
        health: 85,
        children: [
          {
            id: "LINE-3",
            name: "Line 3 (Canning Line)",
            type: "Line",
            health: 85,
            children: [
              {
                id: "CV-301",
                name: "Modular Incline Belt Conveyor Matrix 45m",
                type: "Machine",
                health: 85,
                status: "Operational",
                children: [
                  { id: "SUB-CV-01", name: "Head Drive Motor & Sprocket", type: "Subsystem", health: 84, sensors: ["SPD-01 (45 m/min)", "VIB-04 (2.0 mm/s)"] },
                  { id: "SUB-CV-02", name: "Incline Guide Rail & Transition Bed", type: "Subsystem", health: 86, sensors: ["ALIGN-01 (Normal)"] }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];


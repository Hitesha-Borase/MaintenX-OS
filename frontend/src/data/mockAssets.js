// Real-time CMMS Assets linked to PostgreSQL database
export const INITIAL_ASSETS = [];

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


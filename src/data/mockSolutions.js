// Verified Solutions Library
export const INITIAL_SOLUTIONS = [
  {
    id: "SOL-2026-012",
    problemSymptom: "High Vibration & Acoustic Rattling on Rotary Spindle Drive",
    assetType: "Packaging & Bottling / Rotary Filler",
    applicableMachines: ["FM-001", "FM-002", "FM-003"],
    failureCode: "MEC-004",
    failureCategory: "Mechanical",
    rootCause: "Lower drive cartridge bearing race pitting caused by moisture ingress past degraded labyrinth seals.",
    diagnosticSteps: [
      "1. Attach tri-axial accelerometer to lower bearing hub; measure velocity RMS across 10Hz-1000Hz.",
      "2. Perform FFT spectral analysis to check for 1X and 2X rotational peak harmonics.",
      "3. Inspect labyrinth seal lip under 10x borescope for cracking or particle ingress."
    ],
    repairProcedure: [
      "1. Execute LOTO on main electrical disconnect Q1 and bleed pneumatic header.",
      "2. Remove upper clamp collar and use hydraulic puller HP-20 to draw worn bearing BRG-6208.",
      "3. Heat replacement bearing on induction heater to 110°C; slide onto shaft until seated against shoulder.",
      "4. Install double-lip Viton shaft seal SL-VTON-45 with food-grade Krytox grease on lips.",
      "5. Laser-align motor coupling to within 0.03mm angular and 0.02mm parallel offset."
    ],
    partsRequired: [
      { partNo: "BRG-6208-2RS", name: "Deep Groove Ball Bearing 6208-2RS", qty: 2 },
      { partNo: "SL-VTON-45", name: "Viton Double Lip Shaft Seal 45mm", qty: 1 }
    ],
    toolsRequired: ["SKF Induction Heater TIH 030M", "Laser Alignment Kit SKF TKSA 41", "Hydraulic Bearing Puller"],
    testAndVerification: "Run 30-min trial at 300 BPM, then 30-min at 600 BPM. Vibration must remain < 1.5 mm/s RMS. Thermal scan of housing must not exceed 60°C.",
    verifiedBy: "Senior Reliability Specialist Marcus Vance",
    verificationDate: "2026-08-28",
    successfulUsesCount: 14,
    tags: ["vibration", "bearing", "spindle", "alignment", "filler"]
  },
  {
    id: "SOL-2025-084",
    problemSymptom: "Plate Pasteurizer Differential Pressure Drop & Temperature Fluctuations",
    assetType: "Thermal Processing / Heat Exchanger",
    applicableMachines: ["HT-105", "HT-106"],
    failureCode: "HYD-002",
    failureCategory: "Hydraulic",
    rootCause: "Degraded EPDM plate gaskets caused by high-concentration CIP nitric acid cycles > 75°C.",
    diagnosticSteps: [
      "1. Check differential pressure transmitter Delta-P reading across Section 1 and Section 2.",
      "2. Perform dye penetration / fluorescent UV leak check on suspect plate pack.",
      "3. Inspect gasket clip teeth for hardening or micro-fissuring."
    ],
    repairProcedure: [
      "1. Allow heat exchanger to cool to < 35°C; isolate upstream product pumps.",
      "2. Loosen tie-bolts in diagonal crisscross pattern to prevent plate warping.",
      "3. Peel off degraded gaskets, wipe groove with food-grade solvent and seat new high-temp Viton clip-on gaskets.",
      "4. Tighten frame to dimension A = 485mm using calibrated torque multiplier."
    ],
    partsRequired: [
      { partNo: "GSK-EPDM-HT105", name: "Clip-on EPDM/Viton Gasket Pack", qty: 1 }
    ],
    toolsRequired: ["Torque Multiplier 4:1", "Digital Vernier Caliper 600mm", "UV Inspection Lamp"],
    testAndVerification: "Hydro-test with demineralized water at 10.0 bar for 20 minutes with zero pressure drop. Verify CIP circulation at 85°C without weeping.",
    verifiedBy: "Lead Process Engineer Sarah Jenkins",
    verificationDate: "2025-11-12",
    successfulUsesCount: 9,
    tags: ["pasteurizer", "gasket", "leak", "pressure drop", "thermal"]
  },
  {
    id: "SOL-2025-045",
    problemSymptom: "Labeler Optical Inspection Sensor False Reject Burst",
    assetType: "Packaging / Labeler",
    applicableMachines: ["LB-204", "LB-205"],
    failureCode: "ELE-008",
    failureCategory: "Electrical",
    rootCause: "Airborne moisture and particulate buildup on optical receiver prism lens.",
    diagnosticSteps: [
      "1. Check sensor margin display on Keyence amplifier (value drops below 40%).",
      "2. Inspect lens surface with 5x inspection loupe.",
      "3. Measure emitter output voltage on pin 4 with multimeter."
    ],
    repairProcedure: [
      "1. Power down sensor rack.",
      "2. Clean lens using lint-free optical swab and 99.8% Isopropanol.",
      "3. Adjust air wipe nozzle to deliver 0.8 bar dry purge air across lens face.",
      "4. Execute 2-point auto-teach calibration on reference golden container."
    ],
    partsRequired: [{ partNo: "CLN-SWAB-OPT", name: "Optical Cleaning Swabs", qty: 2 }],
    toolsRequired: ["Digital Multimeter Fluke 87V", "Optical Swabs"],
    testAndVerification: "Pass 200 consecutive labeled bottles. False reject count must be exactly 0.",
    verifiedBy: "Electrical Tech David Kim",
    verificationDate: "2025-09-04",
    successfulUsesCount: 22,
    tags: ["sensor", "optical", "labeler", "false reject", "vision"]
  }
];

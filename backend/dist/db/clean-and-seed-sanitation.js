"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_js_1 = require("../config/database.js");
async function cleanAndSeed() {
    const client = await database_js_1.pool.connect();
    try {
        // 1. Delete junk dummy items ('dfghj', 'sdf', etc.)
        await client.query(`
      DELETE FROM public.preop_checks 
      WHERE name IN ('dfghj', 'sdf', 'test', 'demo') OR name LIKE '%sdf%' OR name LIKE '%dfghj%';
    `);
        console.log("🧹 Cleaned junk dummy rows from preop_checks");
        // 2. Fetch all tenants
        const { rows: tenants } = await client.query("SELECT id, name FROM public.tenants;");
        // 3. For each tenant, if preop_checks is empty, seed clean standard HACCP checkpoints
        const standardCheckpoints = [
            {
                category: "Sanitation & ATP Swab",
                name: "Filler Nozzles & Bell Housing ATP Hygiene Swab",
                spec: "< 10 RLU (Zero microbial residue)",
                criticality: "Critical GMP",
                method: "Luminescence Swab"
            },
            {
                category: "Mechanical Clearance",
                name: "Physical Inspection of Filler Nozzle Seals & O-Rings",
                spec: "No cracks, food-grade EPDM intact",
                criticality: "Critical Safety",
                method: "Visual & Tactile"
            },
            {
                category: "Process Instrumentation",
                name: "Pasteurizer Pipeline Pressure & Temp Sensor Calibration",
                spec: "4.2 Bar ± 0.2 • 72.4°C baseline",
                criticality: "CCP Calibration",
                method: "Digital Telemetry"
            },
            {
                category: "Line Clearance",
                name: "Packaging Line 1 Clean of Raw Debris, Prior Labels & Tools",
                spec: "100% Cleared (Zero Foreign Material)",
                criticality: "GMP Hygiene",
                method: "360° Line Walkthrough"
            },
            {
                category: "Chemical Residuals",
                name: "CIP Caustic & Peracetic Acid (PAA) Rinse Strip Test",
                spec: "0.0 ppm PAA Residual (Neutral pH 7.0)",
                criticality: "Chemical Safety",
                method: "Colorimetric Strip"
            },
            {
                category: "Foreign Body Prevention",
                name: "In-line Conveyor Metal Detector & Reject Gate Test",
                spec: "1.5mm Fe, 2.0mm Non-Fe, 2.5mm SS test wands",
                criticality: "CCP-2 Critical Gate",
                method: "Test Wand Ingestion"
            }
        ];
        console.log("✅ Finished cleaning tables! (Auto-seeding dummy records disabled)");
    }
    finally {
        client.release();
        process.exit(0);
    }
}
cleanAndSeed().catch(e => { console.error(e); process.exit(1); });

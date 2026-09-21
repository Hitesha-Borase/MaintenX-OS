const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const res = await pool.query(`
      INSERT INTO public.line_targets (
        target_id, plant_id, line_id, line_name, sku_id, sku_code, sku_name, shift,
        target_quantity, target_oee_pct, target_speed_bpm, status, effective_date, created_at, updated_at
      ) VALUES (
        'TGT-9998', 'PLT-01', 'LIN-01', 'Test Line', 'SKU-001', 'SKU-5001', 'Test SKU', 'Morning',
        1000, 85, 500, 'Active', '2026-09-20', NOW(), NOW()
      )
      ON CONFLICT (target_id) DO UPDATE SET
        plant_id = EXCLUDED.plant_id,
        line_id = EXCLUDED.line_id,
        line_name = EXCLUDED.line_name,
        sku_id = EXCLUDED.sku_id,
        sku_code = EXCLUDED.sku_code,
        sku_name = EXCLUDED.sku_name,
        shift = EXCLUDED.shift,
        target_quantity = EXCLUDED.target_quantity,
        target_oee_pct = EXCLUDED.target_oee_pct,
        target_speed_bpm = EXCLUDED.target_speed_bpm,
        status = EXCLUDED.status,
        effective_date = EXCLUDED.effective_date,
        updated_at = NOW()
    `);
    console.log("Insert Success");
  } catch(e) { console.error("Insert Error:", e.message); }
  pool.end();
}
run();

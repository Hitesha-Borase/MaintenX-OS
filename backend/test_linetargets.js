const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  try {
    const res = await pool.query(`
        SELECT 
          id,
          target_id AS "targetId",
          plant_id AS "plantId",
          line_id AS "lineId",
          line_name AS "lineName",
          sku_id AS "skuId",
          sku_code AS "skuCode",
          sku_name AS "skuName",
          shift,
          target_quantity AS "targetQuantity",
          target_hb AS "targetHB",
          std_run_rate AS "stdRunRate",
          planned_oee AS "plannedOEE",
          planned_units_per_hour AS "plannedUnitsPerHour",
          planned_yield_pct AS "plannedYieldPct",
          changeover_time_min AS "changeoverTimeMin",
          status,
          effective_date AS "effectiveDate",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM public.line_targets
        ORDER BY created_at DESC
    `);
    console.log("Success Line Targets:", res.rows.length);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
  pool.end();
}
run();

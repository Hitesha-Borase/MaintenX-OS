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
        standard_id AS "standardId",
        line_id AS "lineId",
        line_name AS "lineName",
        standard_crew AS "standardCrew",
        std_labor_hours_per_1k_units AS "stdLaborHoursPer1kUnits",
        direct_cost_per_hour AS "directCostPerHour",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM public.labour_standards
      ORDER BY created_at DESC
    `);
    console.log("Success Labour:", res.rows.length);
  } catch (err) {
    console.error("Labour DB Error:", err.message);
  }
  pool.end();
}
run();

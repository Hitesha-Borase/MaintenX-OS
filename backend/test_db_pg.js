const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  try {
    const res = await pool.query('SELECT * FROM public.quality_specs');
    console.log("Quality Specs count:", res.rows.length);
    console.log("Rows:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("DB Error:", err);
  }
  pool.end();
}
run();

const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  try {
    const res = await pool.query('SELECT qs.target_value FROM public.quality_specs qs');
    console.log("Success:", res.rows.length);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
  pool.end();
}
run();

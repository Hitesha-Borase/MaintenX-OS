const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  const res = await pool.query('SELECT COUNT(*) FROM public.changeover_rules');
  console.log("Count:", res.rows[0].count);
  pool.end();
}
run();

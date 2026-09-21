const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const res = await pool.query(`SELECT * FROM public.line_targets`);
    console.log("Count:", res.rowCount);
    if(res.rowCount > 0) console.log("First row:", res.rows[0]);
  } catch(e) { console.error(e.message); }
  pool.end();
}
run();

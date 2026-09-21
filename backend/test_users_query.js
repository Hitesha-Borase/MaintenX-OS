const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const res = await pool.query(`SELECT email FROM public.users`);
    console.log("Users:", res.rows);
  } catch(e) { console.error(e.message); }
  pool.end();
}
run();

const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    const res = await pool.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'public.changeover_rules'::regclass;
    `);
    console.log("Constraints:", res.rows);
  } catch(e) { console.error(e.message); }
  pool.end();
}
run();

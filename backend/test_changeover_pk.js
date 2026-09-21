const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    await pool.query(`ALTER TABLE public.changeover_rules ADD PRIMARY KEY (id);`);
    console.log("Added primary key to changeover_rules");
  } catch(e) { console.error(e.message); }
  pool.end();
}
run();

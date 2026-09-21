const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const tables = [
    'batch_quality_reviews',
    'batch_history',
    'quality_holds',
    'ccp_checks',
    'product_checks',
    'process_checks',
    'preop_checks',
    'sanitation_cip_steps',
    'allergen_audits',
    'line_readiness',
    'cleaning_verifications',
    'deviations',
    'capa_records',
    'ncrs',
    'qa_release_queue',
    'qa_approved_releases',
    'qa_disposition_records'
  ];

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT count(*), tenant_id FROM public.${table} GROUP BY tenant_id`);
      console.log(`Table ${table}:`, res.rows);
    } catch (e) {
      console.log(`Table ${table} error:`, e.message);
    }
  }
  pool.end();
}
check();

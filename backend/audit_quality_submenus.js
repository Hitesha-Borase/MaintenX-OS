const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAll() {
  const tid = '0f63be8b-52aa-4e6b-ab83-1d5477328262';
  const queries = {
    'Batches (Schedule/Orders)': `SELECT batch_number, status FROM public.batches WHERE tenant_id = '${tid}'`,
    'Batch Reviews': `SELECT batch_number, qa_status FROM public.batch_quality_reviews WHERE tenant_id = '${tid}'`,
    'Quality Holds': `SELECT hold_id, batch, status FROM public.quality_holds WHERE tenant_id = '${tid}'`,
    'Approved Releases': `SELECT release_code, batch_id FROM public.qa_approved_releases WHERE tenant_id = '${tid}'`,
    'Allergen Audits': `SELECT name, sku FROM public.allergen_audits WHERE tenant_id = '${tid}'`,
    'Process Checks (Manual)': `SELECT name, target, actual FROM public.process_checks WHERE tenant_id = '${tid}'`,
    'Product Checks (Manual)': `SELECT check_code, measured_value FROM public.product_checks WHERE tenant_id = '${tid}'`,
    'Deviations': `SELECT title, category FROM public.deviations WHERE tenant_id = '${tid}'`,
    'CAPA': `SELECT capa_number, title FROM public.capa_records WHERE tenant_id = '${tid}'`,
    'NCRs': `SELECT ncr_number, part FROM public.ncrs WHERE tenant_id = '${tid}'`,
    'Pre-Op Items': `SELECT title, status FROM public.preop_checks WHERE tenant_id = '${tid}'`,
    'Line Readiness': `SELECT line, status FROM public.line_readiness WHERE tenant_id = '${tid}'`,
    'Cleaning Verification': `SELECT loop, status FROM public.cleaning_verifications WHERE tenant_id = '${tid}'`
  };

  for (const [name, q] of Object.entries(queries)) {
    try {
      const res = await pool.query(q);
      console.log(`${name}: ${res.rows.length} rows ->`, res.rows);
    } catch (err) {
      console.log(`${name} Error:`, err.message);
    }
  }
  pool.end();
}
checkAll();

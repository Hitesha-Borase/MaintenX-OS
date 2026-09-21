const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const tenantId = '0f63be8b-52aa-4e6b-ab83-1d5477328262';
  const res = await pool.query(`
    SELECT b.id as db_id, b.batch_number, b.status as batch_status, b.created_at,
           po.order_number, s.name as sku_name, pl.name as line_name,
           bqr.current_step, bqr.step_number, bqr.total_steps, bqr.progress_percent,
           bqr.ccp_status, bqr.qa_status
    FROM public.batches b
    LEFT JOIN public.production_orders po ON b.production_order_id = po.id
    LEFT JOIN public.skus s ON po.sku_id = s.id
    LEFT JOIN public.production_lines pl ON po.line_id = pl.id
    LEFT JOIN public.batch_quality_reviews bqr ON b.batch_number = bqr.batch_number AND bqr.tenant_id = b.tenant_id
    WHERE b.tenant_id = $1
    ORDER BY b.created_at DESC;
  `, [tenantId]);

  console.log('Quality Reviews for tenant:', res.rows.length, res.rows);
  pool.end();
}
run();

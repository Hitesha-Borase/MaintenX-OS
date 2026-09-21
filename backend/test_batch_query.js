const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  const res = await pool.query(`
    SELECT b.id, b.batch_number, b.status, b.created_at, 
           po.order_number, po.sku_id, po.line_id, po.status as po_status,
           s.name as sku_name, pl.name as line_name
    FROM public.batches b
    LEFT JOIN public.production_orders po ON b.production_order_id = po.id
    LEFT JOIN public.skus s ON po.sku_id = s.id
    LEFT JOIN public.production_lines pl ON po.line_id = pl.id
    WHERE b.tenant_id = '0f63be8b-52aa-4e6b-ab83-1d5477328262';
  `);
  console.log('Result:', res.rows);
  pool.end();
}
test();

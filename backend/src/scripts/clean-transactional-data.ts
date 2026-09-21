import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:aashi%401234@localhost:5432/maintenxos'
});

async function cleanTransactionalData() {
  const client = await pool.connect();
  console.log('--- STARTING TRANSACTIONAL DATA CLEANUP ---');

  const operations = [
    { name: 'shipment_orders', query: 'DELETE FROM shipment_orders' },
    { name: 'qa_releases', query: 'DELETE FROM qa_releases' },
    { name: 'product_checks', query: 'DELETE FROM product_checks' },
    { name: 'preop_checks', query: 'DELETE FROM preop_checks' },
    { name: 'lot_genealogies', query: 'DELETE FROM lot_genealogies' },
    { name: 'batch_steps', query: 'DELETE FROM batch_steps' },
    { name: 'batches', query: 'DELETE FROM batches' },
    { name: 'downtime_logs', query: 'DELETE FROM downtime_logs' },
    { name: 'shift_logs', query: 'DELETE FROM shift_logs' },
    { name: 'pm_hb_logs', query: 'DELETE FROM pm_hb_logs' },
    { name: 'production_orders', query: 'DELETE FROM production_orders' },
    { name: 'inventory_lots', query: "DELETE FROM inventory_lots WHERE lot_number LIKE 'BAT-%'" }
  ];

  for (const op of operations) {
    try {
      const res = await client.query(op.query);
      console.log(`✅ [${op.name}]: Deleted ${res.rowCount} rows`);
    } catch (e: any) {
      console.warn(`⚠️ [${op.name}]: ${e?.message || e}`);
    }
  }

  client.release();
  await pool.end();
  console.log('--- CLEANUP FINISHED ---');
}

cleanTransactionalData().catch(console.error);

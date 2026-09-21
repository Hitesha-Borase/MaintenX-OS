import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:aashi%401234@localhost:5432/maintenxos'
});

async function inspect() {
  console.log('--- AUDITING USER ENTERED RECORDS ---');

  const plants = await pool.query("SELECT id, name, city FROM plants");
  console.log('Plants:', plants.rows);

  const lines = await pool.query("SELECT id, name, plant_id FROM production_lines");
  console.log('Lines count:', lines.rows.length);

  try {
    const skus = await pool.query("SELECT * FROM skus");
    console.log('SKUs:', skus.rows.map((s: any) => ({ id: s.id, name: s.name, sku: s.sku_code || s.code || s.sku })));
  } catch (e: any) {
    console.log('SKU error:', e?.message || e);
  }

  const pos = await pool.query("SELECT id, order_number, plant_id, produced_quantity, status FROM production_orders");
  console.log('Production Orders:', pos.rows);

  const batches = await pool.query("SELECT id, batch_number, plant_id, actual_volume, status FROM batches");
  console.log('Batches:', batches.rows);

  const shipments = await pool.query("SELECT id, shipment_number, order_number, batch_lot FROM shipment_orders");
  console.log('Shipments:', shipments.rows);

  const downtimes = await pool.query("SELECT id, plant_id, reason_code, duration_minutes FROM downtime_logs");
  console.log('Downtimes:', downtimes.rows);

  try {
    const qa = await pool.query("SELECT id, batch_number, release_status FROM qa_batch_releases");
    console.log('QA Batch Releases:', qa.rows);
  } catch (e: any) {
    console.log('QA Releases table:', e?.message || e);
  }

  try {
    const fg = await pool.query("SELECT * FROM finished_goods_inventory");
    console.log('Finished Goods:', fg.rows.length);
  } catch (e: any) {
    console.log('FG table:', e?.message || e);
  }

  await pool.end();
}

inspect().catch(console.error);

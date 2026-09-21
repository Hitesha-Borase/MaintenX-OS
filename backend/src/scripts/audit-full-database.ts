import { pool } from '../config/database.js';

async function audit() {
  console.log('=== 1. ALL TENANTS ===');
  const tenants = await pool.query('SELECT id, name, slug FROM tenants');
  console.log(tenants.rows);

  console.log('\n=== 2. ALL USERS ===');
  const users = await pool.query('SELECT * FROM users');
  console.log(users.rows.map((u: any) => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, tenant_id: u.tenant_id })));

  console.log('\n=== ALL TABLES IN DB ===');
  const allTables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(allTables.rows.map(r => r.table_name));

  console.log('\n=== 3. ALL PLANTS ===');
  const plants = await pool.query('SELECT id, name, code, tenant_id FROM plants');
  console.log(plants.rows);

  console.log('\n=== 4. ALL LINES ===');
  const lines = await pool.query('SELECT id, name, plant_id, tenant_id FROM lines');
  console.log(lines.rows);

  console.log('\n=== 5. ALL ASSETS ===');
  const assets = await pool.query('SELECT id, asset_code, name, tenant_id FROM assets');
  console.log(assets.rows);

  console.log('\n=== 6. ALL PRODUCTS / SKUs ===');
  const products = await pool.query('SELECT id, code, name, category, tenant_id FROM products');
  console.log(products.rows);

  console.log('\n=== 7. ALL PRODUCTION RUNS / ORDERS ===');
  const runs = await pool.query('SELECT id, order_number, status, tenant_id FROM production_runs');
  console.log(runs.rows);

  console.log('\n=== 8. ALL BATCHES ===');
  const batches = await pool.query('SELECT id, batch_number, status, tenant_id FROM production_batches');
  console.log(batches.rows);

  console.log('\n=== 9. WORK ORDERS ===');
  const wos = await pool.query('SELECT id, title, tenant_id FROM work_orders');
  console.log(wos.rows);

  console.log('\n=== 10. QUALITY DISPOSITIONS / EVENTS ===');
  const qas = await pool.query('SELECT id, batch_number, disposition, tenant_id FROM batch_quality_dispositions');
  console.log(qas.rows);

  console.log('\n=== 11. SHIPMENTS ===');
  const ships = await pool.query('SELECT id, order_number, customer, tenant_id FROM outbound_shipments');
  console.log(ships.rows);

  console.log('\n=== 12. EMPLOYEES / STAFFING ===');
  try {
    const emps = await pool.query('SELECT * FROM employees LIMIT 20');
    console.log('Employees:', emps.rows);
  } catch (e: any) {
    console.log('No employees table:', e.message);
  }

  process.exit(0);
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});

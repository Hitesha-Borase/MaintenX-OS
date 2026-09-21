import { pool } from '../config/database.js';

async function run() {
  const users = await pool.query('SELECT email, first_name, last_name, department FROM users');
  console.log('USERS IN DB:');
  console.table(users.rows);

  const staffRes = await pool.query('SELECT employee_code, name, designation FROM staff');
  console.log('STAFF COUNT:', staffRes.rows.length);
  console.table(staffRes.rows.slice(0, 15));

  const woRes = await pool.query('SELECT wo_number, title, priority, status FROM work_orders');
  console.log('WORK ORDERS:');
  console.table(woRes.rows);

  const rcaRes = await pool.query('SELECT id, title, severity, status, current_phase FROM ci_rca_investigations');
  console.log('RCA INVESTIGATIONS:');
  console.table(rcaRes.rows);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });


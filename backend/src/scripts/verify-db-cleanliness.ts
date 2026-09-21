import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';

async function checkAndClean() {
  console.log('=== DATABASE INTEGRITY AUDIT FOR MEAT COMPANY 1 ===\n');

  // 1. Check users
  const usersRes: any = await db.execute(sql`SELECT id, email, first_name, last_name, department FROM public.users ORDER BY email ASC`);
  console.log(`Users (${usersRes.rows.length}):`);
  for (const u of usersRes.rows) {
    console.log(`  - ${u.email} | ${u.first_name} ${u.last_name} | Dept: ${u.department}`);
  }

  // 2. Check staff
  const staffRes: any = await db.execute(sql`SELECT id, employee_code, name, designation FROM public.staff ORDER BY employee_code ASC`);
  console.log(`\nStaff (${staffRes.rows.length}):`);
  for (const s of staffRes.rows.slice(0, 10)) {
    console.log(`  - [${s.employee_code}] ${s.name} - ${s.designation}`);
  }
  if (staffRes.rows.length > 10) {
    console.log(`  ... and ${staffRes.rows.length - 10} more authentic employees from RC-19 matrix.`);
  }

  // 3. Check Plants
  const plantsRes: any = await db.execute(sql`SELECT id, code, name, city, state, country FROM public.plants`);
  console.log(`\nPlants (${plantsRes.rows.length}):`);
  for (const p of plantsRes.rows) {
    console.log(`  - [${p.code}] ${p.name} (${p.city}, ${p.state}, ${p.country})`);
  }

  // 4. Check Work Orders
  const woRes: any = await db.execute(sql`SELECT id, wo_number, title, type, priority, status FROM public.work_orders ORDER BY created_at DESC LIMIT 10`);
  console.log(`\nWork Orders (${woRes.rows.length}):`);
  for (const w of woRes.rows) {
    console.log(`  - [${w.wo_number}] ${w.title} (${w.type} / ${w.priority} / ${w.status})`);
  }

  // 5. Check Quality Holds
  const holdsRes: any = await db.execute(sql`SELECT id, hold_id, lot_number, reason, status FROM public.quality_holds ORDER BY created_at DESC LIMIT 10`);
  console.log(`\nQuality Holds (${holdsRes.rows.length}):`);
  for (const h of holdsRes.rows) {
    console.log(`  - [${h.hold_id || h.lot_number}] Lot: ${h.lot_number} - ${h.reason} (${h.status})`);
  }

  // 6. Check CAPA Records
  const capaRes: any = await db.execute(sql`SELECT id, capa_number, title, corrective_action FROM public.capa_records ORDER BY created_at DESC LIMIT 10`);
  console.log(`\nCAPA Records (${capaRes.rows.length}):`);
  for (const c of capaRes.rows) {
    console.log(`  - [${c.capa_number}] ${c.title}`);
  }

  // 7. Check RCA Investigations
  const rcaRes: any = await db.execute(sql`SELECT id, title, problem_statement, lead_investigator FROM public.ci_rca_investigations ORDER BY created_at DESC LIMIT 10`);
  console.log(`\nCI RCA Investigations (${rcaRes.rows.length}):`);
  for (const r of rcaRes.rows) {
    console.log(`  - [${r.id}] ${r.title} | ${r.problem_statement} (Lead: ${r.lead_investigator})`);
  }

  // 8. Check SKUs
  const skuRes: any = await db.execute(sql`SELECT id, sku_code, name, category FROM public.skus ORDER BY sku_code ASC LIMIT 10`);
  console.log(`\nSKUs (${skuRes.rows.length}):`);
  for (const s of skuRes.rows) {
    console.log(`  - [${s.sku_code}] ${s.name} (${s.category})`);
  }

  console.log('\n=== AUDIT COMPLETE ===');
  process.exit(0);
}

checkAndClean().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});

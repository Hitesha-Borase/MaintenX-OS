import { pool } from "../config/database.js";

async function main() {
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (table_name LIKE 'ci_%' OR table_name LIKE 'pm_%')
    ORDER BY table_name;
  `);
  for (const r of res.rows) {
    const colRes = await pool.query(
      `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = 'tenant_id'
    `,
      [r.table_name]
    );
    console.log(`Table ${r.table_name}: has tenant_id? ${(colRes.rowCount ?? 0) > 0}`);
  }
  await pool.end();
}

main();

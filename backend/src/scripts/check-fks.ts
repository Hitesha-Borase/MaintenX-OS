import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:aashi%401234@localhost:5432/maintenxos'
});

async function checkFKs() {
  const query = `
    SELECT
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name IN ('plants', 'production_orders', 'batches');
  `;
  try {
    const res = await pool.query(query);
    console.log('FK Constraints:', res.rows);
  } catch (e: any) {
    console.error('Error checking FKs:', e?.message || e);
  } finally {
    await pool.end();
  }
}

checkFKs().catch(console.error);

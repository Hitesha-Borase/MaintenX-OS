import { db } from "./src/config/database.js";
import { sql } from "drizzle-orm";
async function test() {
  const query = sql
    SELECT 
      qs.id,
      qs.tenant_id,
      qs.sku_id,
      COALESCE(qs.parameter_name, 'Quality Parameter') AS parameter_name,
      s.sku_code,
      s.name AS sku_name
    FROM public.quality_specs qs
    LEFT JOIN public.skus s ON s.id = qs.sku_id
    ORDER BY qs.created_at DESC
  ;
  const res = await db.execute(query);
  console.log('Result rows:', res.rows.length);
  process.exit(0);
}
test();

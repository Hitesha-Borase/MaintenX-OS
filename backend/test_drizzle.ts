import { sql } from "drizzle-orm";
import { db } from "./src/db/index";
async function run() {
  const dbRows = await db.execute(sqlSELECT qs.id FROM public.quality_specs qs);
  console.log('dbRows:', dbRows);
  console.log('Array.isArray?', Array.isArray(dbRows));
  console.log('dbRows.rows?', (dbRows as any).rows);
  process.exit(0);
}
run();

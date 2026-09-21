import { sql } from "drizzle-orm";
import { db } from "./src/db/index";
async function run() {
  const res = await db.execute(sqlSELECT * FROM public.quality_specs);
  console.log('Quality Specs rows:', res.rows.length);
  process.exit(0);
}
run();

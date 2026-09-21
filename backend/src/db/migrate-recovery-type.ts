/**
 * migrate-recovery-type.ts
 * Adds missing columns to pm_recovery_plans that the frontend uses but
 * were never applied to the live database:
 *   - type VARCHAR(100)  (Speed Tune / Crew Allocation / Overtime / etc.)
 */

import { sql } from "drizzle-orm";
import { db } from "./index.js";

async function main() {
  console.log("[migrate-recovery-type] Starting migration...");

  try {
    await db.execute(sql
      ALTER TABLE pm_recovery_plans
      ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'Speed Tune';
    );
    console.log("[migrate-recovery-type] Added column type.");
  } catch (e: any) {
    console.warn("[migrate-recovery-type] type column:", e.message);
  }

  try {
    await db.execute(sql
      ALTER TABLE pm_recovery_plans
      ADD COLUMN IF NOT EXISTS classification VARCHAR(100) DEFAULT 'Speed Tune';
    );
    console.log("[migrate-recovery-type] Added column classification.");
  } catch (e: any) {
    console.warn("[migrate-recovery-type] classification column:", e.message);
  }

  console.log("[migrate-recovery-type] Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error("[migrate-recovery-type] Fatal:", e);
  process.exit(1);
});

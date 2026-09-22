import { db } from "./index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Adding missing PRIMARY KEY constraints to tables...");
  const tables = [
    "data_migration_batches",
    "system_governance_reports",
    "data_health_missing",
    "data_health_duplicates",
    "data_health_invalid_references",
    "data_health_broken_relationships",
    "data_health_stale_records",
    "data_health_remediations",
    "erp_connector_config",
    "erp_sync_events",
    "api_keys",
    "barcode_formats",
    "approval_rules",
    "storage_types",
    "storage_resources",
    "shift_approvals",
    "labour_standards",
    "ccp_limits",
    "employee_skills",
  ];

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = '${table}'
          ) THEN
            ALTER TABLE "${table}" ADD PRIMARY KEY ("id");
          END IF;
        END $$;
      `));
      console.log(`✓ Checked / Added PK for ${table}`);
    } catch (err: any) {
      console.warn(`Table ${table} error:`, err.message);
    }
  }

  console.log("Migration completed successfully.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});

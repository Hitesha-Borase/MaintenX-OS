import { pool } from "../config/database.js";

export async function runQualityChecksMigration() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting database migration for Quality Checks modules (CCP, Process Checks, Specifications)...");

    // 1. Upgrade public.ccp_checks table (do NOT drop or recreate)
    await client.query(`
      ALTER TABLE public.ccp_checks ALTER COLUMN tenant_id DROP NOT NULL;
      ALTER TABLE public.ccp_checks ALTER COLUMN plant_id DROP NOT NULL;
      ALTER TABLE public.ccp_checks ALTER COLUMN batch_id DROP NOT NULL;
      ALTER TABLE public.ccp_checks ALTER COLUMN line_id DROP NOT NULL;
      ALTER TABLE public.ccp_checks DROP CONSTRAINT IF EXISTS ccp_checks_plant_id_plants_id_fk;
      ALTER TABLE public.ccp_checks DROP CONSTRAINT IF EXISTS ccp_checks_operator_id_users_id_fk;
      ALTER TABLE public.ccp_checks DROP CONSTRAINT IF EXISTS ccp_checks_line_id_production_lines_id_fk;
      ALTER TABLE public.ccp_checks DROP CONSTRAINT IF EXISTS ccp_checks_batch_id_batches_id_fk;
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS line_name VARCHAR(150);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS operator VARCHAR(150);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS equipment VARCHAR(150);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS location VARCHAR(150);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS test_method VARCHAR(255);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS critical_limit VARCHAR(255);
      ALTER TABLE public.ccp_checks ADD COLUMN IF NOT EXISTS corrective_action TEXT;
    `);
    console.log("✅ Verified and upgraded public.ccp_checks table");

    // 2. Create public.process_checks table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.process_checks (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        name VARCHAR(255) NOT NULL,
        parameter VARCHAR(255) NOT NULL,
        target VARCHAR(255) NOT NULL,
        actual VARCHAR(255) NOT NULL,
        line VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'OK',
        timestamp_str VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_process_checks_tenant ON public.process_checks(tenant_id);
    `);
    console.log("✅ Verified public.process_checks table");

    // 3. Upgrade public.quality_specs table if columns missing (do NOT recreate)
    await client.query(`
      ALTER TABLE public.quality_specs ALTER COLUMN tenant_id DROP NOT NULL;
      ALTER TABLE public.quality_specs ALTER COLUMN sku_id DROP NOT NULL;
      ALTER TABLE public.quality_specs ALTER COLUMN parameter_name DROP NOT NULL;
      ALTER TABLE public.quality_specs ALTER COLUMN target_value DROP NOT NULL;
      ALTER TABLE public.quality_specs ALTER COLUMN min_tolerance DROP NOT NULL;
      ALTER TABLE public.quality_specs ALTER COLUMN max_tolerance DROP NOT NULL;
      ALTER TABLE public.quality_specs ALTER COLUMN uom DROP NOT NULL;
      ALTER TABLE public.quality_specs ADD COLUMN IF NOT EXISTS range VARCHAR(255);
      ALTER TABLE public.quality_specs ADD COLUMN IF NOT EXISTS ccp VARCHAR(50);
      ALTER TABLE public.quality_specs ADD COLUMN IF NOT EXISTS sku VARCHAR(255);
    `);
    console.log("✅ Verified public.quality_specs table");

    // Fetch existing tenants
    const tenantRows = await client.query(`SELECT id FROM public.tenants;`);
    const tenantIds: (string | null)[] = tenantRows.rows.map(r => r.id);
    if (!tenantIds.includes(null)) tenantIds.push(null);

    // Auto-seeding disabled: only real operational data or manual entries should be saved in DB
    console.log("ℹ️ Quality Checks schema checked (auto-seeding dummy rows disabled).");

    // 6. Quality Specifications table check (no auto-seeding dummy data)
    const specRes = await client.query(`SELECT COUNT(*)::int as count FROM public.quality_specs;`);
    console.log(`📊 Current quality_specs count: ${specRes.rows[0].count}`);

    console.log("🎉 Quality Checks DB Migration finished successfully!");
  } catch (err: any) {
    console.error("❌ Migration error in quality checks:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.includes("migrate-quality-checks")) {
  runQualityChecksMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

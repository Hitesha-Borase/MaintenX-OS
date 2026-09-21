import { pool } from "../config/database.js";

export async function runQualityEventsMigration() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting database migration for Quality Events (Deviations, NCRs, Holds, Investigations)...");

    // 1. Upgrade public.deviations table (do NOT drop or recreate existing table)
    await client.query(`
      ALTER TABLE public.deviations ALTER COLUMN tenant_id DROP NOT NULL;
      ALTER TABLE public.deviations ALTER COLUMN plant_id DROP NOT NULL;
      ALTER TABLE public.deviations ALTER COLUMN reported_by DROP NOT NULL;
      ALTER TABLE public.deviations DROP CONSTRAINT IF EXISTS deviations_reported_by_users_id_fk;
      ALTER TABLE public.deviations DROP CONSTRAINT IF EXISTS deviations_plant_id_plants_id_fk;
      ALTER TABLE public.deviations DROP CONSTRAINT IF EXISTS deviations_tenant_id_tenants_id_fk;
      ALTER TABLE public.deviations ADD COLUMN IF NOT EXISTS hold_id VARCHAR(100);
      ALTER TABLE public.deviations ADD COLUMN IF NOT EXISTS reported_by_name VARCHAR(150);
      ALTER TABLE public.deviations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);
    console.log("✅ Verified and upgraded public.deviations table");

    // 2. Upgrade public.quality_holds table (do NOT drop or recreate existing table)
    await client.query(`
      ALTER TABLE public.quality_holds ALTER COLUMN tenant_id DROP NOT NULL;
      ALTER TABLE public.quality_holds ALTER COLUMN plant_id DROP NOT NULL;
      ALTER TABLE public.quality_holds ALTER COLUMN batch_id DROP NOT NULL;
      ALTER TABLE public.quality_holds ALTER COLUMN hold_by DROP NOT NULL;
      ALTER TABLE public.quality_holds DROP CONSTRAINT IF EXISTS quality_holds_hold_by_users_id_fk;
      ALTER TABLE public.quality_holds DROP CONSTRAINT IF EXISTS quality_holds_plant_id_plants_id_fk;
      ALTER TABLE public.quality_holds DROP CONSTRAINT IF EXISTS quality_holds_batch_id_batches_id_fk;
      ALTER TABLE public.quality_holds DROP CONSTRAINT IF EXISTS quality_holds_tenant_id_tenants_id_fk;
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS hold_id VARCHAR(100);
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS batch VARCHAR(100);
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS held_by_name VARCHAR(150);
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS date VARCHAR(50);
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);
    console.log("✅ Verified and upgraded public.quality_holds table");

    // 3. Create public.ncrs table IF NOT EXISTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ncrs (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        ncr_number VARCHAR(50) NOT NULL,
        part VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        severity VARCHAR(50) DEFAULT 'HIGH',
        status VARCHAR(50) DEFAULT 'PENDING QA REVIEW',
        disposition VARCHAR(100) DEFAULT 'QUARANTINED',
        reported_by VARCHAR(150) DEFAULT 'Dr. Rachel Evans',
        date VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ncrs_tenant ON public.ncrs(tenant_id);
    `);
    console.log("✅ Verified public.ncrs table");

    // 4. Create public.quality_investigations table IF NOT EXISTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.quality_investigations (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        inv_number VARCHAR(50) NOT NULL,
        dev_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        finding TEXT DEFAULT '',
        action TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'Pending',
        lead_investigator VARCHAR(150) DEFAULT 'Dr. Rachel Evans',
        target_date VARCHAR(50),
        root_cause_category VARCHAR(100) DEFAULT 'MECHANICAL',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_quality_investigations_tenant ON public.quality_investigations(tenant_id);
    `);
    console.log("✅ Verified public.quality_investigations table");

    // Fetch existing tenants
    const tenantRows = await client.query(`SELECT id FROM public.tenants;`);
    const tenantIds: (string | null)[] = tenantRows.rows.map(r => r.id);
    if (!tenantIds.includes(null)) tenantIds.push(null);

    // Auto-seeding disabled: only real operational data or manual entries should be saved in DB
    console.log("ℹ️ Quality Events schema checked (auto-seeding dummy rows disabled).");

    console.log("🎉 Quality Events database migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running Quality Events migration:", error);
    throw error;
  } finally {
    client.release();
  }
}

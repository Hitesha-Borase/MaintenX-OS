import { pool } from "../config/database.js";

export async function runQualitySanitationMigration() {
  console.log("🚀 Starting database migration for Quality & Sanitation modules...");
  const client = await pool.connect();
  try {
    // 1. Ensure preop_checks table exists with required columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.preop_checks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        plant_id UUID,
        line_id UUID,
        line_name VARCHAR(150),
        batch_id UUID,
        batch_number VARCHAR(150),
        category VARCHAR(150) NOT NULL,
        name VARCHAR(255) NOT NULL,
        spec VARCHAR(255) NOT NULL,
        criticality VARCHAR(100) DEFAULT 'Critical GMP' NOT NULL,
        method VARCHAR(150),
        passed BOOLEAN DEFAULT NULL,
        notes TEXT DEFAULT '',
        inspector_name VARCHAR(150) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_preop_checks_tenant ON public.preop_checks(tenant_id);
    `);
    console.log("✅ Verified public.preop_checks table");

    // 2. Create sanitation_cip_steps and sanitation_cip_config tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.sanitation_cip_steps (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        phase VARCHAR(255) NOT NULL,
        equipment VARCHAR(255) NOT NULL,
        spec TEXT NOT NULL,
        chemical VARCHAR(255) NOT NULL,
        target_value VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT NULL,
        log_value TEXT DEFAULT '',
        step_order INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.sanitation_cip_config (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        loop VARCHAR(255) NOT NULL,
        protocol VARCHAR(255) NOT NULL,
        operator VARCHAR(255) NOT NULL,
        chemical_wash VARCHAR(255) DEFAULT 'Caustic 2.5% • 81.4°C',
        sanitizer VARCHAR(255) DEFAULT 'PAA Sanitizer: 180 ppm Target',
        status VARCHAR(64) DEFAULT 'CYCLE IN PROGRESS',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sanitation_cip_steps_tenant ON public.sanitation_cip_steps(tenant_id);
    `);
    console.log("✅ Verified public.sanitation_cip_steps & public.sanitation_cip_config tables");

    // 3. Create allergen_audits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.allergen_audits (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        line VARCHAR(150),
        test_method VARCHAR(255) NOT NULL,
        target_allergen VARCHAR(255) NOT NULL,
        status VARCHAR(64) DEFAULT 'PENDING AUDIT',
        auditor VARCHAR(150),
        timestamp_str VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_allergen_audits_tenant ON public.allergen_audits(tenant_id);
    `);
    console.log("✅ Verified public.allergen_audits table");

    // 4. Create line_readiness table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.line_readiness (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        line VARCHAR(255) NOT NULL,
        line_code VARCHAR(50) NOT NULL,
        safety VARCHAR(50) DEFAULT 'PASSED',
        sanitation VARCHAR(50) DEFAULT 'PASSED',
        mechanical VARCHAR(50) DEFAULT 'PASSED',
        status VARCHAR(50) DEFAULT 'READY',
        speed_target VARCHAR(50),
        last_inspection VARCHAR(100) DEFAULT 'Just now',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_line_readiness_tenant ON public.line_readiness(tenant_id);
    `);
    console.log("✅ Verified public.line_readiness table");

    // 5. Create cleaning_verifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.cleaning_verifications (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        verified BOOLEAN DEFAULT FALSE,
        atp_test_result VARCHAR(100) DEFAULT '4.2 RLU (PASSED)',
        microbial_residue VARCHAR(100) DEFAULT '0.00% Zero Trace',
        target_limit VARCHAR(100) DEFAULT '<10 RLU',
        loop VARCHAR(255) DEFAULT 'CIP Loop 01',
        notes TEXT DEFAULT '',
        verified_at TIMESTAMP WITH TIME ZONE,
        verified_by VARCHAR(150) DEFAULT 'Stephanie Kuzmych',
        status VARCHAR(64) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_cleaning_verifications_tenant ON public.cleaning_verifications(tenant_id);
    `);
    console.log("✅ Verified public.cleaning_verifications table");

    // Check preop_checks count
    const preopRes = await client.query(`SELECT COUNT(*)::int as count FROM public.preop_checks;`);
    console.log(`📊 Current preop_checks count: ${preopRes.rows[0].count}`);

    // Auto-seeding disabled: only real operational data or manual entries should be saved in DB
    console.log("ℹ️ Quality & Sanitation schema checked (auto-seeding dummy rows disabled).");
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.includes("migrate-quality-sanitation")) {
  runQualitySanitationMigration()
    .then(() => {
      console.log("🎉 Quality & Sanitation DB Migration completed successfully!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

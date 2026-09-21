import { pool } from "../config/database.js";

export async function runBatchQualityMigration() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting database migration for Batch Quality modules (Review, History, Records)...");

    // 1. Create public.batch_quality_reviews table IF NOT EXISTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.batch_quality_reviews (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        batch_number VARCHAR(100) NOT NULL,
        recipe_name VARCHAR(255) NOT NULL,
        current_step VARCHAR(255) NOT NULL,
        step_number INT DEFAULT 1,
        total_steps INT DEFAULT 5,
        progress_percent INT DEFAULT 0,
        line VARCHAR(150) DEFAULT 'Line 1 (Aseptic Bottling)',
        ccp_status VARCHAR(100) DEFAULT 'PASSED (83.5°C)',
        qa_status VARCHAR(100) DEFAULT 'QA REVIEW IN PROGRESS',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_batch_quality_reviews_tenant ON public.batch_quality_reviews(tenant_id);
    `);
    console.log("✅ Verified public.batch_quality_reviews table");

    // 2. Create public.batch_history table IF NOT EXISTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.batch_history (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        batch_id VARCHAR(100) NOT NULL,
        recipe VARCHAR(255) NOT NULL,
        line VARCHAR(150) NOT NULL,
        pallets VARCHAR(150) NOT NULL,
        date VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'RELEASED',
        coa_url VARCHAR(255) DEFAULT 'COA-BAT-2026-0888.pdf',
        auditor VARCHAR(150) DEFAULT 'Stephanie Kuzmych',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_batch_history_tenant ON public.batch_history(tenant_id);
    `);
    console.log("✅ Verified public.batch_history table");

    // 3. Create public.batch_quality_records table IF NOT EXISTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.batch_quality_records (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        record_id VARCHAR(50) NOT NULL,
        batch VARCHAR(100) NOT NULL,
        type VARCHAR(255) NOT NULL,
        result VARCHAR(50) DEFAULT 'PASS',
        date VARCHAR(50) NOT NULL,
        officer VARCHAR(150) DEFAULT 'Stephanie Kuzmych',
        details TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_batch_quality_records_tenant ON public.batch_quality_records(tenant_id);
    `);
    console.log("✅ Verified public.batch_quality_records table");

    // Fetch existing tenants
    const tenantRows = await client.query(`SELECT id FROM public.tenants;`);
    const tenantIds: (string | null)[] = tenantRows.rows.map(r => r.id);
    if (!tenantIds.includes(null)) tenantIds.push(null);

    // 4. Batch Quality reviews table ready (zero dummy seeding - only manual and live schedule data)
    console.log("✅ Batch Quality tables verified. Zero dummy seeding applied.");

    console.log("🎉 Batch Quality database migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running Batch Quality migration:", error);
    throw error;
  } finally {
    client.release();
  }
}
